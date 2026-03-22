"""Управление чатами Тут и Там: список, создание, удаление, поиск"""
import json
import os
import uuid
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data):
    return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, default=str)}


def err(msg, code=400):
    return {'statusCode': code, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg})}


def get_user(cur, token):
    cur.execute("""
        SELECT u.id, u.username, u.display_name, u.avatar_url, u.theme
        FROM tnt_sessions s JOIN tnt_users u ON s.user_id = u.id
        WHERE s.token = %s AND s.expires_at > NOW()
    """, (token,))
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    params = event.get('queryStringParameters') or {}
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    token = event.get('headers', {}).get('X-Auth-Token', '')
    db = get_db()
    cur = db.cursor()

    user = get_user(cur, token)
    if not user:
        cur.close(); db.close()
        return err('Не авторизован', 401)

    user_id = str(user[0])

    # GET /search - поиск пользователей
    if method == 'GET' and 'search' in path:
        q = params.get('q', '').strip().lower()
        if len(q) < 2:
            cur.close(); db.close()
            return ok([])
        cur.execute("""
            SELECT id, username, display_name, avatar_url, is_online, last_seen, relationship_partner_id
            FROM tnt_users
            WHERE (LOWER(username) LIKE %s OR LOWER(display_name) LIKE %s) AND id != %s
            LIMIT 20
        """, (f'%{q}%', f'%{q}%', user_id))
        rows = cur.fetchall()
        cur.close(); db.close()
        return ok([{
            'id': str(r[0]), 'username': r[1], 'display_name': r[2],
            'avatar_url': r[3] or '', 'is_online': r[4], 'last_seen': str(r[5]),
            'has_partner': r[6] is not None
        } for r in rows])

    # GET / - список чатов пользователя
    if method == 'GET' and path.rstrip('/').endswith('/chats') or (method == 'GET' and 'search' not in path and 'open' not in path):
        cur.execute("""
            SELECT c.id, c.type, c.name, c.avatar_url, c.message_count,
                   u2.id as partner_id, u2.username, u2.display_name, u2.avatar_url as partner_avatar,
                   u2.is_online, u2.last_seen, u2.relationship_partner_id,
                   (SELECT content FROM tnt_messages m WHERE m.chat_id = c.id AND m.is_removed = FALSE ORDER BY m.created_at DESC LIMIT 1) as last_msg,
                   (SELECT created_at FROM tnt_messages m WHERE m.chat_id = c.id AND m.is_removed = FALSE ORDER BY m.created_at DESC LIMIT 1) as last_msg_time,
                   (SELECT COUNT(*) FROM tnt_messages m WHERE m.chat_id = c.id AND m.is_removed = FALSE AND m.sender_id != %s AND NOT (%s = ANY(string_to_array(m.read_by, ',')))) as unread_count
            FROM tnt_chats c
            JOIN tnt_chat_members cm ON cm.chat_id = c.id AND cm.user_id = %s
            LEFT JOIN tnt_chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id != %s
            LEFT JOIN tnt_users u2 ON u2.id = cm2.user_id
            WHERE c.type = 'private'
            ORDER BY last_msg_time DESC NULLS LAST
        """, (user_id, user_id, user_id, user_id))
        rows = cur.fetchall()
        cur.close(); db.close()
        return ok([{
            'id': str(r[0]), 'type': r[1], 'name': r[2] or r[7],
            'message_count': r[4],
            'partner': {
                'id': str(r[5]) if r[5] else None,
                'username': r[6], 'display_name': r[7],
                'avatar_url': r[8] or '', 'is_online': r[9],
                'last_seen': str(r[10]) if r[10] else None,
                'has_partner': r[11] is not None
            },
            'last_message': r[12], 'last_message_time': str(r[13]) if r[13] else None,
            'unread_count': int(r[14])
        } for r in rows])

    # POST /open - открыть/создать приватный чат
    if method == 'POST' and 'open' in path:
        partner_id = body.get('partner_id', '')
        if not partner_id:
            cur.close(); db.close()
            return err('partner_id обязателен')

        # Проверяем не заблокирован ли
        cur.execute("SELECT 1 FROM tnt_blocked WHERE user_id = %s AND blocked_id = %s", (partner_id, user_id))
        if cur.fetchone():
            cur.close(); db.close()
            return err('Этот пользователь вас заблокировал')

        # Ищем существующий чат
        cur.execute("""
            SELECT c.id FROM tnt_chats c
            JOIN tnt_chat_members m1 ON m1.chat_id = c.id AND m1.user_id = %s
            JOIN tnt_chat_members m2 ON m2.chat_id = c.id AND m2.user_id = %s
            WHERE c.type = 'private'
            LIMIT 1
        """, (user_id, partner_id))
        existing = cur.fetchone()
        if existing:
            cur.close(); db.close()
            return ok({'chat_id': str(existing[0])})

        # Создаём новый чат
        chat_id = str(uuid.uuid4())
        cur.execute("INSERT INTO tnt_chats (id, type) VALUES (%s, 'private')", (chat_id,))
        cur.execute("INSERT INTO tnt_chat_members (chat_id, user_id) VALUES (%s, %s)", (chat_id, user_id))
        cur.execute("INSERT INTO tnt_chat_members (chat_id, user_id) VALUES (%s, %s)", (chat_id, partner_id))
        db.commit()
        cur.close(); db.close()
        return ok({'chat_id': chat_id})

    cur.close(); db.close()
    return err('Not found', 404)
