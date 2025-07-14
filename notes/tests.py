from django.test import TestCase
from .models import Users, Tag, Note

class ReadingNoteModelTest(TestCase):
    def setUp(self):
        # Create users
        self.user1 = Users.objects.create(name='testuser')
        self.user2 = Users.objects.create(name='followed_user')

        # Set following relationship AFTER creation
        self.user1.following.add(self.user2)

    def test_create_models_with_following(self):
        # Create tag
        tag = Tag.objects.create(name='Fantasy', count=5)

        # Create note
        user_note = Note.objects.create(
            user=self.user1,
            book_id="some_id",
            content="some content over here"
        )

        # Validate following
        self.assertIn(self.user2, self.user1.following.all())

        # Validate tag
        self.assertEqual(tag.name, 'Fantasy')
        self.assertEqual(tag.count, 5)

        # Validate note
        self.assertEqual(user_note.user.name, 'testuser')
        self.assertEqual(user_note.book_id, 'some_id')
        self.assertEqual(user_note.content, 'some content over here')



