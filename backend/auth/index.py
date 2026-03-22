"""Аутентификация пользователей Тут и Там: регистрация, вход, выход"""
import json
import os
import uuid
import hashlib
import secrets
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


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    db = get_db()
    cur = db.cursor()

    # POST /register
    if method == 'POST' and 'register' in path:
        username = body.get('username', '').strip().lower()
        display_name = body.get('display_name', '').strip()
        password = body.get('password', '')
        phone = body.get('phone', '').strip() or None

        if not username or not display_name or not password:
            cur.close(); db.close()
            return err('Заполните все поля')

        if len(username) < 3:
            cur.close(); db.close()
            return err('Имя пользователя минимум 3 символа')

        cur.execute("SELECT id FROM tnt_users WHERE username = %s", (username,))
        if cur.fetchone():
            cur.close(); db.close()
            return err('Имя пользователя уже занято')

        password_hash = hash_password(password)
        user_id = str(uuid.uuid4())
        cur.execute(
            "INSERT INTO tnt_users (id, username, display_name, phone, password_hash) VALUES (%s, %s, %s, %s, %s)",
            (user_id, username, display_name, phone, password_hash)
        )

        token = secrets.token_hex(32)
        cur.execute(
            "INSERT INTO tnt_sessions (user_id, token) VALUES (%s, %s)",
            (user_id, token)
        )
        db.commit()
        cur.close(); db.close()

        return ok({
            'token': token,
            'user': {'id': user_id, 'username': username, 'display_name': display_name, 'theme': 'dark'}
        })

    # POST /login
    if method == 'POST' and 'login' in path:
        username = body.get('username', '').strip().lower()
        password = body.get('password', '')

        cur.execute("SELECT id, username, display_name, avatar_url, theme, bio, is_online FROM tnt_users WHERE username = %s AND password_hash = %s",
                    (username, hash_password(password)))
        user = cur.fetchone()
        if not user:
            cur.close(); db.close()
            return err('Неверное имя пользователя или пароль')

        token = secrets.token_hex(32)
        cur.execute("INSERT INTO tnt_sessions (user_id, token) VALUES (%s, %s)", (user[0], token))
        cur.execute("UPDATE tnt_users SET is_online = TRUE, last_seen = NOW() WHERE id = %s", (user[0],))
        db.commit()
        cur.close(); db.close()

        return ok({
            'token': token,
            'user': {
                'id': str(user[0]), 'username': user[1], 'display_name': user[2],
                'avatar_url': user[3] or '', 'theme': user[4] or 'dark',
                'bio': user[5] or ''
            }
        })

    # POST /logout
    if method == 'POST' and 'logout' in path:
        token = event.get('headers', {}).get('X-Auth-Token', '')
        if token:
            cur.execute("SELECT user_id FROM tnt_sessions WHERE token = %s", (token,))
            row = cur.fetchone()
            if row:
                cur.execute("UPDATE tnt_users SET is_online = FALSE, last_seen = NOW() WHERE id = %s", (row[0],))
            cur.execute("UPDATE tnt_sessions SET expires_at = NOW() WHERE token = %s", (token,))
            db.commit()
        cur.close(); db.close()
        return ok({'ok': True})

    # GET /me
    if method == 'GET' and 'me' in path:
        token = event.get('headers', {}).get('X-Auth-Token', '')
        cur.execute("""
            SELECT u.id, u.username, u.display_name, u.avatar_url, u.theme, u.bio, u.is_online, u.last_seen, u.relationship_partner_id
            FROM tnt_sessions s JOIN tnt_users u ON s.user_id = u.id
            WHERE s.token = %s AND s.expires_at > NOW()
        """, (token,))
        row = cur.fetchone()
        if not row:
            cur.close(); db.close()
            return err('Не авторизован', 401)
        cur.close(); db.close()
        return ok({
            'id': str(row[0]), 'username': row[1], 'display_name': row[2],
            'avatar_url': row[3] or '', 'theme': row[4] or 'dark', 'bio': row[5] or '',
            'is_online': row[6], 'last_seen': str(row[7]), 'relationship_partner_id': str(row[8]) if row[8] else None
        })

    cur.close(); db.close()
    return err('Not found', 404)
