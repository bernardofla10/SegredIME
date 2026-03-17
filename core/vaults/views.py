from django.http import JsonResponse
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from .models import Secret, Vault
from .serializers import SecretSerializer, VaultSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def status_view(request):
    return JsonResponse({"status": "ok", "service": "segredime"})


class VaultListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Vault.objects.all()
    serializer_class = VaultSerializer


class SecretListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Secret.objects.select_related("vault").all()
    serializer_class = SecretSerializer


class SecretDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Secret.objects.select_related("vault").all()
    serializer_class = SecretSerializer
