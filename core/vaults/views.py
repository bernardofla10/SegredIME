from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.http import JsonResponse
from rest_framework import status

@api_view(['GET'])
@permission_classes([AllowAny])
def status_view(request):
    return JsonResponse({
        "status": "ok",
        "service": "segredime"
    })

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def clients_list(request):
    if request.method == 'GET':
        return Response([
            {"id": 1, "name": "Dummy Client A", "status": "active"},
            {"id": 2, "name": "Dummy Client B", "status": "inactive"}
        ])
    elif request.method == 'POST':
        return Response({"message": "Client creation simulated successfully (mock)." }, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def client_detail(request, pk):
    if request.method == 'GET':
        return Response({
            "id": pk, 
            "name": f"Dummy Client {pk}", 
            "status": "active"
        })
    elif request.method == 'PUT':
        return Response({"message": f"Client {pk} update simulated successfully (mock)."})
    elif request.method == 'DELETE':
        return Response({"message": f"Client {pk} deletion simulated successfully (mock)."}, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def secrets_list(request):
    if request.method == 'GET':
        return Response([
            {"id": 1, "title": "DB Password", "description": "Production DB"},
            {"id": 2, "title": "AWS API Key", "description": "S3 access"}
        ])
    elif request.method == 'POST':
        return Response({"message": "Secret storage simulated successfully (mock)." }, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def secret_detail(request, pk):
    if request.method == 'GET':
        return Response({
            "id": pk, 
            "title": f"Secret {pk}", 
            "description": "Mocked secret details"
        })
    elif request.method == 'PUT':
        return Response({"message": f"Secret {pk} update simulated successfully (mock)."})
    elif request.method == 'DELETE':
        return Response({"message": f"Secret {pk} deletion simulated successfully (mock)."}, status=status.HTTP_200_OK)