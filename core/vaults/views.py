from django.http import JsonResponse
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from accounts.models import AccessLog

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

    def perform_create(self, serializer):
        vault = serializer.save()
        AccessLog.log(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="create_vault",
            request=self.request,
            resource_type="vault",
            resource_id=vault.id,
            resource_name=vault.name,
            status="success",
            details=f"Cofre '{vault.name}' criado com sucesso",
        )


class VaultDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Vault.objects.all()
    serializer_class = VaultSerializer

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        vault = self.get_object()
        AccessLog.log(
            user=request.user if request.user.is_authenticated else None,
            action="view_vault",
            request=request,
            resource_type="vault",
            resource_id=vault.id,
            resource_name=vault.name,
            status="success",
            details=f"Cofre '{vault.name}' visualizado",
        )
        return response

    def perform_update(self, serializer):
        vault = serializer.save()
        AccessLog.log(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="update_vault",
            request=self.request,
            resource_type="vault",
            resource_id=vault.id,
            resource_name=vault.name,
            status="success",
            details=f"Cofre '{vault.name}' atualizado",
        )

    def perform_destroy(self, instance):
        AccessLog.log(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="delete_vault",
            request=self.request,
            resource_type="vault",
            resource_id=instance.id,
            resource_name=instance.name,
            status="warning",
            details=f"Cofre '{instance.name}' excluído permanentemente",
        )
        instance.delete()


class SecretListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = SecretSerializer

    def get_queryset(self):
        queryset = Secret.objects.select_related("vault").all()
        vault_id = self.request.query_params.get("vault")
        if vault_id:
            queryset = queryset.filter(vault_id=vault_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["include_secret_value"] = False
        return context

    def perform_create(self, serializer):
        secret = serializer.save()
        AccessLog.log(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="create_secret",
            request=self.request,
            resource_type="secret",
            resource_id=secret.id,
            resource_name=f"{secret.vault.name} / {secret.title}",
            status="success",
            details=f"Segredo '{secret.title}' criado no cofre '{secret.vault.name}'",
        )


class SecretDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Secret.objects.select_related("vault").all()
    serializer_class = SecretSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["include_secret_value"] = True
        return context

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        secret = self.get_object()
        AccessLog.log(
            user=request.user if request.user.is_authenticated else None,
            action="view_secret",
            request=request,
            resource_type="secret",
            resource_id=secret.id,
            resource_name=f"{secret.vault.name} / {secret.title}",
            status="success",
            details=f"Segredo '{secret.title}' visualizado",
        )
        return response

    def perform_update(self, serializer):
        secret = serializer.save()
        AccessLog.log(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="update_secret",
            request=self.request,
            resource_type="secret",
            resource_id=secret.id,
            resource_name=f"{secret.vault.name} / {secret.title}",
            status="success",
            details=f"Segredo '{secret.title}' atualizado no cofre '{secret.vault.name}'",
        )

    def perform_destroy(self, instance):
        AccessLog.log(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="delete_secret",
            request=self.request,
            resource_type="secret",
            resource_id=instance.id,
            resource_name=f"{instance.vault.name} / {instance.title}",
            status="warning",
            details=f"Segredo '{instance.title}' excluído permanentemente",
        )
        instance.delete()


class SecretRevealView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    queryset = Secret.objects.select_related("vault").all()

    def post(self, request, *args, **kwargs):
        secret = self.get_object()
        AccessLog.log(
            user=request.user if request.user.is_authenticated else None,
            action="reveal_secret",
            request=request,
            resource_type="secret",
            resource_id=secret.id,
            resource_name=f"{secret.vault.name} / {secret.title}",
            status="success",
            details="Senha revelada após aprovação mobile simulada",
        )
        return JsonResponse({"status": "ok"})
