from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.models import AccessLog

from .models import MfaApprovalRequest, Secret, Vault, VaultAccess
from .permissions import (
    accessible_vaults_for,
    can_create_vault,
    can_manage_vault,
    can_read_vault,
    can_write_vault,
)
from .serializers import (
    MfaApprovalRequestSerializer,
    SecretSerializer,
    VaultAccessSerializer,
    VaultSerializer,
)


def _resource_name(secret):
    return f"{secret.vault.name} / {secret.title}"


def _client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _deny(request, resource_type, resource_id=None, resource_name="", details="Acesso negado"):
    AccessLog.log(
        user=request.user if request.user.is_authenticated else None,
        action="access_denied",
        request=request,
        resource_type=resource_type,
        resource_id=resource_id,
        resource_name=resource_name,
        status="error",
        details=details,
    )
    raise PermissionDenied(details)


@api_view(["GET"])
@permission_classes([AllowAny])
def status_view(request):
    return JsonResponse({"status": "ok", "service": "segredime"})


class VaultListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VaultSerializer

    def get_queryset(self):
        return accessible_vaults_for(self.request.user).prefetch_related("access_grants", "secrets")

    def perform_create(self, serializer):
        if not can_create_vault(self.request.user):
            _deny(
                self.request,
                "vault",
                details="Sua função não permite criar cofres.",
            )

        vault = serializer.save()
        VaultAccess.objects.update_or_create(
            vault=vault,
            user=self.request.user,
            defaults={
                "permission": VaultAccess.PERMISSION_OWNER,
                "granted_by": self.request.user,
            },
        )
        AccessLog.log(
            user=self.request.user,
            action="create_vault",
            request=self.request,
            resource_type="vault",
            resource_id=vault.id,
            resource_name=vault.name,
            status="success",
            details=f"Cofre '{vault.name}' criado com sucesso; usuário definido como dono",
        )


class SharedVaultListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VaultSerializer

    def get_queryset(self):
        if self.request.user.role == "admin":
            return Vault.objects.none()
        return (
            Vault.objects.filter(access_grants__user=self.request.user)
            .filter(access_grants__permission__in=[VaultAccess.PERMISSION_READ, VaultAccess.PERMISSION_WRITE])
            .prefetch_related("access_grants", "secrets")
            .distinct()
        )


class VaultDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VaultSerializer

    def get_queryset(self):
        return accessible_vaults_for(self.request.user).prefetch_related("access_grants", "secrets")

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        vault = self.get_object()
        AccessLog.log(
            user=request.user,
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
        vault = self.get_object()
        if not can_manage_vault(self.request.user, vault):
            _deny(
                self.request,
                "vault",
                vault.id,
                vault.name,
                "Somente admins ou donos podem atualizar o cofre.",
            )
        vault = serializer.save()
        AccessLog.log(
            user=self.request.user,
            action="update_vault",
            request=self.request,
            resource_type="vault",
            resource_id=vault.id,
            resource_name=vault.name,
            status="success",
            details=f"Cofre '{vault.name}' atualizado",
        )

    def perform_destroy(self, instance):
        if not can_manage_vault(self.request.user, instance):
            _deny(
                self.request,
                "vault",
                instance.id,
                instance.name,
                "Somente admins ou donos podem excluir o cofre.",
            )
        AccessLog.log(
            user=self.request.user,
            action="delete_vault",
            request=self.request,
            resource_type="vault",
            resource_id=instance.id,
            resource_name=instance.name,
            status="warning",
            details=f"Cofre '{instance.name}' excluído permanentemente",
        )
        instance.delete()


class VaultMembersView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VaultAccessSerializer

    def get_vault(self):
        return get_object_or_404(accessible_vaults_for(self.request.user), pk=self.kwargs["pk"])

    def get_queryset(self):
        vault = self.get_vault()
        if not can_manage_vault(self.request.user, vault):
            _deny(self.request, "vault", vault.id, vault.name, "Você não pode gerenciar membros deste cofre.")
        return vault.access_grants.select_related("user", "granted_by")

    def perform_create(self, serializer):
        vault = self.get_vault()
        if not can_manage_vault(self.request.user, vault):
            _deny(self.request, "vault", vault.id, vault.name, "Você não pode compartilhar este cofre.")

        user = serializer.validated_data["user"]
        permission = serializer.validated_data["permission"]
        access, created = VaultAccess.objects.update_or_create(
            vault=vault,
            user=user,
            defaults={"permission": permission, "granted_by": self.request.user},
        )
        serializer.instance = access
        AccessLog.log(
            user=self.request.user,
            action="share_vault" if created else "permission_change",
            request=self.request,
            resource_type="vault",
            resource_id=vault.id,
            resource_name=vault.name,
            status="success",
            details=f"Permissão '{permission}' concedida a {user.get_full_name() or user.username}",
        )


class VaultMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VaultAccessSerializer
    lookup_url_kwarg = "member_pk"

    def get_queryset(self):
        vault = get_object_or_404(accessible_vaults_for(self.request.user), pk=self.kwargs["pk"])
        if not can_manage_vault(self.request.user, vault):
            _deny(self.request, "vault", vault.id, vault.name, "Você não pode gerenciar membros deste cofre.")
        return vault.access_grants.select_related("user", "granted_by")

    def perform_update(self, serializer):
        access = serializer.save(granted_by=self.request.user)
        AccessLog.log(
            user=self.request.user,
            action="permission_change",
            request=self.request,
            resource_type="vault",
            resource_id=access.vault_id,
            resource_name=access.vault.name,
            status="success",
            details=f"Permissão de {access.user.username} alterada para '{access.permission}'",
        )

    def perform_destroy(self, instance):
        vault = instance.vault
        username = instance.user.username
        if (
            instance.permission == VaultAccess.PERMISSION_OWNER
            and vault.access_grants.filter(permission=VaultAccess.PERMISSION_OWNER).count() <= 1
            and self.request.user.role != "admin"
        ):
            _deny(self.request, "vault", vault.id, vault.name, "O cofre precisa manter ao menos um dono.")
        AccessLog.log(
            user=self.request.user,
            action="permission_change",
            request=self.request,
            resource_type="vault",
            resource_id=vault.id,
            resource_name=vault.name,
            status="warning",
            details=f"Acesso de {username} removido do cofre",
        )
        instance.delete()


class SecretListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SecretSerializer

    def get_queryset(self):
        queryset = Secret.objects.select_related("vault").filter(vault__in=accessible_vaults_for(self.request.user))
        vault_id = self.request.query_params.get("vault")
        if vault_id:
            queryset = queryset.filter(vault_id=vault_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["include_secret_value"] = False
        return context

    def perform_create(self, serializer):
        vault = serializer.validated_data["vault"]
        if not can_write_vault(self.request.user, vault):
            _deny(
                self.request,
                "vault",
                vault.id,
                vault.name,
                "Você não possui permissão de escrita neste cofre.",
            )
        secret = serializer.save()
        AccessLog.log(
            user=self.request.user,
            action="create_secret",
            request=self.request,
            resource_type="secret",
            resource_id=secret.id,
            resource_name=_resource_name(secret),
            status="success",
            details=f"Segredo '{secret.title}' criado no cofre '{secret.vault.name}'",
        )


class SecretDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SecretSerializer

    def get_queryset(self):
        return Secret.objects.select_related("vault").filter(vault__in=accessible_vaults_for(self.request.user))

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["include_secret_value"] = False
        return context

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        secret = self.get_object()
        AccessLog.log(
            user=request.user,
            action="view_secret",
            request=request,
            resource_type="secret",
            resource_id=secret.id,
            resource_name=_resource_name(secret),
            status="success",
            details=f"Metadados do segredo '{secret.title}' visualizados",
        )
        return response

    def perform_update(self, serializer):
        secret = self.get_object()
        if not can_write_vault(self.request.user, secret.vault):
            _deny(self.request, "secret", secret.id, _resource_name(secret), "Você não pode editar este segredo.")
        secret = serializer.save()
        AccessLog.log(
            user=self.request.user,
            action="update_secret",
            request=self.request,
            resource_type="secret",
            resource_id=secret.id,
            resource_name=_resource_name(secret),
            status="success",
            details=f"Segredo '{secret.title}' atualizado no cofre '{secret.vault.name}'",
        )

    def perform_destroy(self, instance):
        if not can_write_vault(self.request.user, instance.vault):
            _deny(self.request, "secret", instance.id, _resource_name(instance), "Você não pode excluir este segredo.")
        AccessLog.log(
            user=self.request.user,
            action="delete_secret",
            request=self.request,
            resource_type="secret",
            resource_id=instance.id,
            resource_name=_resource_name(instance),
            status="warning",
            details=f"Segredo '{instance.title}' excluído permanentemente",
        )
        instance.delete()


class SecretRevealRequestView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Secret.objects.select_related("vault").all()

    def post(self, request, *args, **kwargs):
        secret = self.get_object()
        if not can_read_vault(request.user, secret.vault):
            _deny(request, "secret", secret.id, _resource_name(secret), "Você não pode solicitar este segredo.")

        approval = MfaApprovalRequest.objects.create(
            secret=secret,
            requested_by=request.user,
            requested_ip=_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )
        AccessLog.log(
            user=request.user,
            action="mfa_requested",
            request=request,
            resource_type="secret",
            resource_id=secret.id,
            resource_name=_resource_name(secret),
            status="warning",
            details=f"Solicitação MFA #{approval.id} criada para revelação de segredo",
        )
        return Response(MfaApprovalRequestSerializer(approval).data, status=status.HTTP_201_CREATED)


class SecretRevealView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Secret.objects.select_related("vault").all()

    def post(self, request, *args, **kwargs):
        secret = self.get_object()
        if not can_read_vault(request.user, secret.vault):
            _deny(request, "secret", secret.id, _resource_name(secret), "Você não pode revelar este segredo.")

        approval_id = request.data.get("approval_request_id")
        approval = (
            MfaApprovalRequest.objects.filter(
                id=approval_id,
                secret=secret,
                requested_by=request.user,
            )
            .select_related("secret", "secret__vault", "requested_by")
            .first()
        )
        if not approval:
            _deny(request, "secret", secret.id, _resource_name(secret), "Solicitação MFA inválida.")

        approval.expire_if_needed()
        if approval.status != MfaApprovalRequest.STATUS_APPROVED:
            _deny(request, "secret", secret.id, _resource_name(secret), "Solicitação MFA não aprovada.")

        AccessLog.log(
            user=request.user,
            action="reveal_secret",
            request=request,
            resource_type="secret",
            resource_id=secret.id,
            resource_name=_resource_name(secret),
            status="success",
            details=f"Senha revelada após aprovação MFA #{approval.id}",
        )
        return Response({"status": "ok", "secret_value": secret.get_secret_value()})


class MfaApprovalRequestListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MfaApprovalRequestSerializer

    def get_queryset(self):
        qs = MfaApprovalRequest.objects.select_related("secret", "secret__vault", "requested_by")
        if self.request.user.role != "admin":
            qs = qs.filter(requested_by=self.request.user)
        request_status = self.request.query_params.get("status")
        if request_status:
            qs = qs.filter(status=request_status)
        for approval in qs.filter(status=MfaApprovalRequest.STATUS_PENDING, expires_at__lte=timezone.now()):
            approval.expire_if_needed()
            AccessLog.log(
                user=approval.requested_by,
                action="mfa_expired",
                resource_type="secret",
                resource_id=approval.secret_id,
                resource_name=_resource_name(approval.secret),
                status="warning",
                details=f"Solicitação MFA #{approval.id} expirada",
            )
        return qs


class MfaApprovalRequestDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MfaApprovalRequestSerializer

    def get_queryset(self):
        qs = MfaApprovalRequest.objects.select_related("secret", "secret__vault", "requested_by")
        if self.request.user.role == "admin":
            return qs
        return qs.filter(requested_by=self.request.user)

    def get_object(self):
        obj = super().get_object()
        if obj.expire_if_needed():
            AccessLog.log(
                user=obj.requested_by,
                action="mfa_expired",
                request=self.request,
                resource_type="secret",
                resource_id=obj.secret_id,
                resource_name=_resource_name(obj.secret),
                status="warning",
                details=f"Solicitação MFA #{obj.id} expirada",
            )
        return obj


class MfaApprovalDecisionView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MfaApprovalRequestSerializer

    def get_queryset(self):
        qs = MfaApprovalRequest.objects.select_related("secret", "secret__vault", "requested_by")
        if self.request.user.role == "admin":
            return qs
        return qs.filter(requested_by=self.request.user)

    def post(self, request, *args, **kwargs):
        approval = self.get_object()
        approval.expire_if_needed()
        if approval.status != MfaApprovalRequest.STATUS_PENDING:
            return Response(
                {"detail": "Esta solicitação MFA não está mais pendente."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        decision = self.kwargs["decision"]
        approval.status = (
            MfaApprovalRequest.STATUS_APPROVED
            if decision == "approve"
            else MfaApprovalRequest.STATUS_DENIED
        )
        approval.decided_by = request.user
        approval.decided_at = timezone.now()
        approval.save(update_fields=["status", "decided_by", "decided_at", "updated_at"])

        AccessLog.log(
            user=request.user,
            action="mfa_approved" if decision == "approve" else "mfa_denied",
            request=request,
            resource_type="secret",
            resource_id=approval.secret_id,
            resource_name=_resource_name(approval.secret),
            status="success" if decision == "approve" else "error",
            details=f"Solicitação MFA #{approval.id} {'aprovada' if decision == 'approve' else 'negada'} no mobile simulado",
        )
        return Response(MfaApprovalRequestSerializer(approval).data)
