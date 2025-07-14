import json
from datetime import datetime
from pathlib import Path
import sys
import os

# Add project root directory to sys.path so imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from notes.models import Users, Note, Reply, Tag

def load_json_data():
    path = Path('api/routes/mock.json')
    with path.open() as f:
        return json.load(f)

def get_user_by_id(user_list, uid):
    for u in user_list:
        if u["id"] == uid:
            return u["name"]
    return None

def parse_date(date_string):
    try:
        return datetime.strptime(date_string, "%d-%m-%Y").date()
    except Exception:
        return None

def safe_int(value, default=0):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

def run():
    data = load_json_data()

    user_objs = {}

    # 1. Create Users
    for u in data.get('users', []):
        user = Users.objects.create(
            name=u['name'],
            password=u['Password']
        )
        user_objs[u['name']] = user

    # 2. Set Up Following and Followers
    for u in data.get('users', []):
        user = user_objs[u['name']]
        for followee_name in u.get('following', []):
            followee = user_objs.get(followee_name)
            if followee:
                user.following.add(followee)
        for follower_name in u.get('followers', []):
            follower = user_objs.get(follower_name)
            if follower:
                user.followers.add(follower)

        # Set totals
        user.total_followers = len(u.get('followers', []))
        user.total_following = len(u.get('following', []))
        user.save()

    # 3. Create Notes and Replies
    for n in data.get('notes', []):

        if not isinstance(n, dict):
            print(f"Skipping invalid note item: {n}")
            continue

        try:
            user_id = n.get('userId')
            note_user_name = get_user_by_id(data.get('users', []), user_id)
            if not note_user_name:
                continue

            note = Note.objects.create(
                id=int(n['noteId']),
                user=user_objs[note_user_name],
                book_id=safe_int(n.get('bookId')),
                content=n.get('content', ''),
                created_at=parse_date(n.get('createdAt', '01-01-1970'))
            )

            replies = n.get('replies', [])
            if not isinstance(replies, list):
                print(f"Skipping note {n.get('noteId')} because replies is not a list: {replies}")
                continue

            for r in replies:
                reply_user_name = get_user_by_id(data.get('users', []), r.get('userId'))
                if not reply_user_name:
                    continue

                Reply.objects.create(
                    note=note,
                    user=user_objs[reply_user_name],
                    book_id=int(r.get('bookId', 0)),
                    content=r.get('content', ''),
                    created_at=parse_date(r.get('createdAt', '01-01-1970'))
                )

        except Exception as e:
            print(f"⚠️ Error importing note ID {n.get('noteId')}: {e}")

    # 4. Create Tags
    for t in data.get('tags', []):
        Tag.objects.update_or_create(
            name=t['name'],
            defaults={'count': t['count']}
        )

    print("✅ Import complete.")
