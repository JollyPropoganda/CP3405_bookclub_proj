import json
import os
import sys
import django

# --- Setup Django ---
FILENAME = 'mock.json'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from notes.models import Users, Note, Tag

# --- Load JSON ---
with open(os.path.join(os.path.dirname(__file__), FILENAME), 'r') as f:
    data = json.load(f)

# --- Step 1: Create users and build ID-to-object maps ---
user_objs = {}
id_to_name = {}

for user in data['users']:
    obj, created = Users.objects.update_or_create(
        id=user['id'],
        defaults={
            'name': user['name'],
            'following': [],
            'followers': [],
            'total_followers': 0,
            'total_following': 0
        }
    )
    user_objs[str(user['id'])] = obj
    id_to_name[str(user['id'])] = user['name']

# --- Step 2: Combine following and follower relationships ---
# This ensures mutual data respect (merges both fields)
following_map = {uid: set() for uid in id_to_name}
followers_map = {uid: set() for uid in id_to_name}

for user in data['users']:
    uid = str(user['id'])
    for fid in user.get('following', []):
        following_map[uid].add(str(fid))
        followers_map[str(fid)].add(uid)

    for fid in user.get('followers', []):
        followers_map[uid].add(str(fid))
        following_map[str(fid)].add(uid)

# --- Step 3: Assign relationships to model and save ---
for uid in id_to_name:
    user = user_objs[uid]
    following_ids = list(following_map[uid])
    follower_ids = list(followers_map[uid])

    user.following = [id_to_name[fid] for fid in following_ids if fid in id_to_name]
    user.followers = [id_to_name[fid] for fid in follower_ids if fid in id_to_name]
    user.total_following = len(user.following)
    user.total_followers = len(user.followers)
    user.save()

# --- Step 4: Import notes (if any) ---
for note in data.get('notes', []):
    Note.objects.update_or_create(
        id=note['id'],
        defaults={
            'user': user_objs[str(note['userId'])],
            'book_id': note['bookId'],
            'content': note['content'],
            'created_at': note['createdAt']
        }
    )

# --- Step 5: Import tags (if any) ---
for tag in data.get('tags', []):
    Tag.objects.update_or_create(
        name=tag['name'],
        defaults={'count': tag['count']}
    )

print("✅ Mock data imported successfully.")





