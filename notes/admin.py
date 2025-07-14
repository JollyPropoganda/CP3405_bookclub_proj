from django.contrib import admin
from .models import Users, Tag, Note

compiled_db = [Users, Tag, Note]

admin.site.register(compiled_db)
