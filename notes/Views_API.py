from rest_framework import viewsets
from .models import Users, Note, Tag
from .Serializers import NoteSerializer, UserSerializer, TagSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

@api_view(['GET'])
def recent_notes(request):
    notes = Note.objects.all().order_by('-created_at')[:10]
    return Response(NoteSerializer(notes, many=True).data)

@api_view(['POST'])
def post_note(request):
    serializer = NoteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Note posted successfully", "note": serializer.data})
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_user(request, id):
    user = get_object_or_404(Users, id=id)
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST'])
def follow_user(request):
    current_user_id = request.data.get('currentUserId')
    target_user_id = request.data.get('targetUserId')

    current_user = get_object_or_404(Users, id=current_user_id)
    target_user = get_object_or_404(Users, id=target_user_id)

    if target_user not in current_user.following.all():
        current_user.following.add(target_user)
        return Response({'message': 'User followed successfully'})
    else:
        return Response({'message': 'Already following'})

@api_view(['GET'])
def hot_topics(request):
    tags = Tag.objects.order_by('-count')[:5]
    serializer = TagSerializer(tags, many=True)
    return Response(serializer.data)

"""class ReadingNoteViewSet(viewsets.ModelViewSet):
    queryset = (User, Note, Tag).objects.all()
    serializer_class = ReadingNoteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)"""
