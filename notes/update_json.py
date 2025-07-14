import json
from datetime import datetime
import os
import django
import sys
from pathlib import Path
# Setup Django environment (adjust this path if needed)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from notes.models import Users, Note, Reply, Tag

def load_json_data():
    # Adjust path to your JSON file as needed
    json_path = Path(__file__).parent.parent / 'api' / 'routes' / 'mock.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_user_by_id(user_list, uid):
    for u in user_list:
        if str(u.get("id")) == str(uid):
            return u.get("name")
    return None

def safe_int(value, default=0):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%d-%m-%Y").date()
    except Exception:
        # fallback date if parsing fails
        return datetime(1970, 1, 1).date()

def update_database():
    data = load_json_data()
    user_objs = {}

    # 1. Update or create Users
    for u in data.get('users', []):
        user, _ = Users.objects.update_or_create(
            name=u.get('name'),
            defaults={'password': u.get('Password', '')}
        )
        user_objs[u.get('name')] = user

    # 2. Update followers/following relationships and totals
    for u in data.get('users', []):
        user = user_objs.get(u.get('name'))
        if not user:
            continue

        # Clear old M2M relations before updating
        user.following.clear()
        user.followers.clear()

        for followee_name in u.get('following', []):
            followee = user_objs.get(followee_name)
            if followee:
                user.following.add(followee)

        for follower_name in u.get('followers', []):
            follower = user_objs.get(follower_name)
            if follower:
                user.followers.add(follower)

        user.total_following = len(u.get('following', []))
        user.total_followers = len(u.get('followers', []))
        user.save()

    # 3. Update or create Notes and Replies
    for n in data.get('notes', []):
        note_user_name = get_user_by_id(data.get('users', []), n.get('userId'))
        if not note_user_name:
            continue
        user = user_objs.get(note_user_name)
        if not user:
            continue

        try:
            note, created = Note.objects.update_or_create(
                id=safe_int(n.get('noteId')),
                defaults={
                    'user': user,
                    'book_id': safe_int(n.get('bookId')),
                    'content': n.get('content', ''),
                    'created_at': parse_date(n.get('createdAt', '01-01-1970'))
                }
            )
        except Exception as e:
            print(f"⚠️ Error updating/creating Note ID {n.get('noteId')}: {e}")
            continue

        # Handle Replies
        replies = n.get('replies')
        if not isinstance(replies, list):
            replies = []

        # For safety: clear existing replies for this note to avoid duplicates
        Reply.objects.filter(note=note).delete()

        for r in replies:
            reply_user_name = get_user_by_id(data.get('users', []), r.get('userId'))
            if not reply_user_name:
                continue
            reply_user = user_objs.get(reply_user_name)
            if not reply_user:
                continue

            try:
                Reply.objects.create(
                    note=note,
                    user=reply_user,
                    book_id=safe_int(r.get('bookId')),
                    content=r.get('content', ''),
                    created_at=parse_date(r.get('createdAt', '01-01-1970'))
                )
            except Exception as e:
                print(f"⚠️ Error creating Reply for Note ID {n.get('noteId')}: {e}")

    # 4. Update or create Tags
    for t in data.get('tags', []):
        try:
            Tag.objects.update_or_create(
                name=t.get('name'),
                defaults={'count': safe_int(t.get('count'))}
            )
        except Exception as e:
            print(f"⚠️ Error updating/creating Tag {t.get('name')}: {e}")

    print("✅ Database update complete.")

if __name__ == "__main__":
    update_database()

