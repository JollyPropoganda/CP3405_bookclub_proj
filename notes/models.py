from django.db import models
#from django.contrib.auth.models import User
from django.utils.timezone import localtime
from django.db.models import JSONField
from django.template.defaultfilters import title


"""class ReadingNote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    book_title = models.CharField(max_length=255)"""

class Users(models.Model):
    name = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    email = models.CharField(max_length= 100, default='example@gmail.com')

    # Users this user is following (explicit, directional)
    following = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='followed_by',  # just an internal reverse name, not your "followers"
        blank=True
    )

    # Users who follow this user (independent, also directional)
    followers = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='follows',  # internal reverse name
        blank=True
    )

    total_followers = models.IntegerField(default=0)
    total_following = models.IntegerField(default=0)

    def __str__(self):
        return self.name
    #def __str__(self):
    #    return (f"\nUser: {self.name}\n"
    #            f"Total following: [{self.total_following}], names: {', '.join(self.following)}\n"
    #            f"Total followers: [{self.total_followers}], names: {', '.join(self.followers)}\n")


class Note(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    book_id = models.IntegerField()
    content = models.TextField()
    created_at = models.DateField()

    def __str__(self):
        return f"Note {self.id} by {self.user.name}"


class Reply(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    book_id = models.IntegerField()
    content = models.TextField()
    created_at = models.DateField()

    def __str__(self):
        return f"Reply {self.id} by {self.user.name} on Note {self.note.id}"


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    count = models.IntegerField()

    def __str__(self):
        return f"{self.name} ({self.count})"
