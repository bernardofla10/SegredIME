from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.http import JsonResponse

# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])
def status_view(request):
    return JsonResponse({
        "status": "ok",
        "service": "segredime"
    })