"""Сообщения чата Тут и Там: отправка, чтение, реакции, удаление"""
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
        SELECT u.id, u.username, u.display_name, u.avatar_url
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

    # GET /?chat_id=... - получить сообщения чата
    if method == 'GET' and 'reaction' not in path:
        chat_id = params.get('chat_id', '')
        if not chat_id:
            cur.close(); db.close()
            return err('chat_id обязателен')

        # Проверяем что пользователь в чате
        cur.execute("SELECT 1 FROM tnt_chat_members WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
        if not cur.fetchone():
            cur.close(); db.close()
            return err('Нет доступа к чату', 403)

        offset = int(params.get('offset', 0))
        limit = int(params.get('limit', 50))

        cur.execute("""
            SELECT m.id, m.sender_id, m.content, m.message_type, m.media_url,
                   m.reply_to_id, m.is_removed, m.read_by, m.created_at,
                   u.username, u.display_name, u.avatar_url
            FROM tnt_messages m
            JOIN tnt_users u ON u.id = m.sender_id
            WHERE m.chat_id = %s
            ORDER BY m.created_at ASC
            LIMIT %s OFFSET %s
        """, (chat_id, limit, offset))
        msgs = cur.fetchall()

        # Помечаем сообщения как прочитанные
        cur.execute("""
            UPDATE tnt_messages SET read_by = read_by || ',' || %s
            WHERE chat_id = %s AND sender_id != %s
            AND (read_by = '' OR NOT (read_by LIKE %s))
        """, (user_id, chat_id, user_id, f'%{user_id}%'))

        # Получаем реакции
        msg_ids = [str(m[0]) for m in msgs]
        reactions = {}
        if msg_ids:
            placeholders = ','.join(['%s'] * len(msg_ids))
            cur.execute(f"""
                SELECT r.message_id, r.emoji, r.user_id, u.display_name
                FROM tnt_reactions r JOIN tnt_users u ON u.id = r.user_id
                WHERE r.message_id IN ({placeholders})
            """, msg_ids)
            for r in cur.fetchall():
                mid = str(r[0])
                if mid not in reactions:
                    reactions[mid] = {}
                if r[1] not in reactions[mid]:
                    reactions[mid][r[1]] = {'count': 0, 'users': [], 'mine': False}
                reactions[mid][r[1]]['count'] += 1
                reactions[mid][r[1]]['users'].append(r[3])
                if str(r[2]) == user_id:
                    reactions[mid][r[1]]['mine'] = True

        db.commit()
        cur.close(); db.close()

        result = []
        for m in msgs:
            mid = str(m[0])
            read_by_list = [x for x in (m[7] or '').split(',') if x]
            is_read = any(x != user_id and x != '' for x in read_by_list)
            result.append({
                'id': mid,
                'sender_id': str(m[1]),
                'content': '[Удалено]' if m[6] else m[2],
                'message_type': m[3],
                'media_url': m[4] or '',
                'reply_to_id': str(m[5]) if m[5] else None,
                'is_deleted': m[6],
                'is_read': is_read,
                'read_by': read_by_list,
                'created_at': str(m[8]),
                'sender': {'username': m[9], 'display_name': m[10], 'avatar_url': m[11] or ''},
                'is_mine': str(m[1]) == user_id,
                'reactions': reactions.get(mid, {})
            })
        return ok(result)

    # POST / - отправить сообщение
    if method == 'POST' and 'reaction' not in path:
        chat_id = body.get('chat_id', '')
        content = body.get('content', '').strip()
        message_type = body.get('message_type', 'text')
        media_url = body.get('media_url', '')
        reply_to_id = body.get('reply_to_id')

        if not chat_id or not content:
            cur.close(); db.close()
            return err('chat_id и content обязательны')

        cur.execute("SELECT 1 FROM tnt_chat_members WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
        if not cur.fetchone():
            cur.close(); db.close()
            return err('Нет доступа к чату', 403)

        msg_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO tnt_messages (id, chat_id, sender_id, content, message_type, media_url, reply_to_id, read_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (msg_id, chat_id, user_id, content, message_type, media_url, reply_to_id, user_id))

        # Обновляем счётчик
        cur.execute("UPDATE tnt_chats SET message_count = message_count + 1 WHERE id = %s", (chat_id,))
        db.commit()

        cur.execute("SELECT message_count FROM tnt_chats WHERE id = %s", (chat_id,))
        count = cur.fetchone()[0]
        cur.close(); db.close()
        return ok({'id': msg_id, 'created_at': 'now', 'message_count': count})

    # POST /reaction - добавить/убрать реакцию
    if method == 'POST' and 'reaction' in path:
        message_id = body.get('message_id', '')
        emoji = body.get('emoji', '')
        if not message_id or not emoji:
            cur.close(); db.close()
            return err('message_id и emoji обязательны')

        cur.execute("SELECT 1 FROM tnt_reactions WHERE message_id = %s AND user_id = %s AND emoji = %s",
                    (message_id, user_id, emoji))
        if cur.fetchone():
            cur.execute("UPDATE tnt_reactions SET id = id WHERE message_id = %s AND user_id = %s AND emoji = %s",
                        (message_id, user_id, emoji))
            cur.execute("SELECT id FROM tnt_reactions WHERE message_id = %s AND user_id = %s AND emoji = %s",
                        (message_id, user_id, emoji))
            r = cur.fetchone()
            cur.execute("UPDATE tnt_reactions SET emoji = emoji WHERE id = %s", (r[0],))
            # Toggle: если уже есть — удаляем (через UPDATE с флагом)
            # Используем отдельный подход
            db.rollback()
            db2 = get_db()
            cur2 = db2.cursor()
            cur2.execute("SELECT id FROM tnt_reactions WHERE message_id = %s AND user_id = %s AND emoji = %s",
                         (message_id, user_id, emoji))
            row = cur2.fetchone()
            if row:
                cur2.execute("UPDATE tnt_reactions SET created_at = NOW() - INTERVAL '100 years' WHERE id = %s", (row[0],))
                db2.commit()
                cur2.close(); db2.close()
            cur.close(); db.close()
            return ok({'action': 'removed'})
        else:
            cur.execute("INSERT INTO tnt_reactions (message_id, user_id, emoji) VALUES (%s, %s, %s)",
                        (message_id, user_id, emoji))
            db.commit()
            cur.close(); db.close()
            return ok({'action': 'added'})

    # PUT /delete - удалить сообщение
    if method == 'PUT' and 'delete' in path:
        message_id = body.get('message_id', '')
        cur.execute("SELECT sender_id FROM tnt_messages WHERE id = %s", (message_id,))
        row = cur.fetchone()
        if not row or str(row[0]) != user_id:
            cur.close(); db.close()
            return err('Нет прав', 403)
        cur.execute("UPDATE tnt_messages SET is_removed = TRUE, content = '' WHERE id = %s", (message_id,))
        db.commit()
        cur.close(); db.close()
        return ok({'ok': True})

    cur.close(); db.close()
    return err('Not found', 404)
