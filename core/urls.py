"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from notes import Views_API

urlpatterns = [
    path('admin/', admin.site.urls),
    #path('../api/notes/recent/', Views_API.recent_notes),
    #path('../api/notes/', Views_API.post_note),
    #path('../api/users/<int:id>/', Views_API.get_user),
    #path('../api/users/follow/', Views_API.follow_user),
    #path('../api/topics/', Views_API.hot_topics),"""
]
