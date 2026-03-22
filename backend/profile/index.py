"""Профиль пользователя Тут и Там: редактирование, контакты, блокировка, отношения"""
import json
import os
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
        SELECT u.id FROM tnt_sessions s JOIN tnt_users u ON s.user_id = u.id
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

    # PUT /update - обновить профиль
    if method == 'PUT' and 'update' in path:
        display_name = body.get('display_name', '').strip()
        bio = body.get('bio', '').strip()
        avatar_url = body.get('avatar_url', '').strip()
        theme = body.get('theme', '').strip()

        updates = []
        vals = []
        if display_name:
            updates.append("display_name = %s"); vals.append(display_name)
        if bio is not None:
            updates.append("bio = %s"); vals.append(bio)
        if avatar_url:
            updates.append("avatar_url = %s"); vals.append(avatar_url)
        if theme:
            updates.append("theme = %s"); vals.append(theme)

        if updates:
            vals.append(user_id)
            cur.execute(f"UPDATE tnt_users SET {', '.join(updates)} WHERE id = %s", vals)
            db.commit()

        cur.execute("SELECT id, username, display_name, avatar_url, theme, bio FROM tnt_users WHERE id = %s", (user_id,))
        row = cur.fetchone()
        cur.close(); db.close()
        return ok({'id': str(row[0]), 'username': row[1], 'display_name': row[2], 'avatar_url': row[3] or '', 'theme': row[4], 'bio': row[5] or ''})

    # GET /contacts - список контактов
    if method == 'GET' and 'contacts' in path:
        cur.execute("""
            SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_online, u.last_seen, u.relationship_partner_id
            FROM tnt_contacts c JOIN tnt_users u ON u.id = c.contact_id
            WHERE c.user_id = %s
        """, (user_id,))
        rows = cur.fetchall()
        cur.close(); db.close()
        return ok([{
            'id': str(r[0]), 'username': r[1], 'display_name': r[2],
            'avatar_url': r[3] or '', 'is_online': r[4], 'last_seen': str(r[5]),
            'has_partner': r[6] is not None
        } for r in rows])

    # POST /contact - добавить контакт
    if method == 'POST' and 'contact' in path and 'block' not in path:
        contact_id = body.get('contact_id', '')
        if not contact_id or contact_id == user_id:
            cur.close(); db.close()
            return err('Некорректный contact_id')
        cur.execute("SELECT 1 FROM tnt_users WHERE id = %s", (contact_id,))
        if not cur.fetchone():
            cur.close(); db.close()
            return err('Пользователь не найден')
        cur.execute("INSERT INTO tnt_contacts (user_id, contact_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, contact_id))
        db.commit()
        cur.close(); db.close()
        return ok({'ok': True})

    # POST /block - заблокировать пользователя
    if method == 'POST' and 'block' in path:
        blocked_id = body.get('blocked_id', '')
        action = body.get('action', 'block')
        if not blocked_id:
            cur.close(); db.close()
            return err('blocked_id обязателен')
        if action == 'block':
            cur.execute("INSERT INTO tnt_blocked (user_id, blocked_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, blocked_id))
        else:
            cur.execute("UPDATE tnt_blocked SET created_at = NOW() - INTERVAL '100 years' WHERE user_id = %s AND blocked_id = %s", (user_id, blocked_id))
        db.commit()
        cur.close(); db.close()
        return ok({'ok': True, 'action': action})

    # POST /relationship - пригласить в друзья/отношения
    if method == 'POST' and 'relationship' in path:
        partner_id = body.get('partner_id', '')
        rel_type = body.get('type', 'friend')
        action = body.get('action', 'set')
        if not partner_id:
            cur.close(); db.close()
            return err('partner_id обязателен')
        if action == 'set':
            cur.execute("UPDATE tnt_users SET relationship_partner_id = %s WHERE id = %s", (partner_id, user_id))
        else:
            cur.execute("UPDATE tnt_users SET relationship_partner_id = NULL WHERE id = %s", (user_id,))
        db.commit()
        cur.close(); db.close()
        return ok({'ok': True})

    # GET /user?id=... - профиль другого пользователя
    if method == 'GET' and 'user' in path:
        target_id = params.get('id', '')
        if not target_id:
            cur.close(); db.close()
            return err('id обязателен')
        cur.execute("""
            SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio, u.is_online, u.last_seen, u.relationship_partner_id
            FROM tnt_users u WHERE u.id = %s
        """, (target_id,))
        row = cur.fetchone()
        if not row:
            cur.close(); db.close()
            return err('Пользователь не найден', 404)
        is_contact = False
        is_blocked = False
        cur.execute("SELECT 1 FROM tnt_contacts WHERE user_id = %s AND contact_id = %s", (user_id, target_id))
        if cur.fetchone(): is_contact = True
        cur.execute("SELECT 1 FROM tnt_blocked WHERE user_id = %s AND blocked_id = %s", (user_id, target_id))
        if cur.fetchone(): is_blocked = True
        cur.close(); db.close()
        return ok({
            'id': str(row[0]), 'username': row[1], 'display_name': row[2],
            'avatar_url': row[3] or '', 'bio': row[4] or '',
            'is_online': row[5], 'last_seen': str(row[6]),
            'has_partner': row[7] is not None,
            'is_contact': is_contact, 'is_blocked': is_blocked
        })

    cur.close(); db.close()
    return err('Not found', 404)
