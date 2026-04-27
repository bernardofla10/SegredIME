from django.contrib.auth import authenticate, get_user_model, login, logout
from django.middleware.csrf import get_token
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response

from .models import AccessLog
from .serializers import (
    AccessLogSerializer,
    LoginSerializer,
    UserCreateSerializer,
    UserSerializer,
)

User = get_user_model()


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


# ──────────────────────────────────────────────
# Authentication views
# ──────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """Authenticate a user and create a session."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = authenticate(
        request,
        username=serializer.validated_data["username"],
        password=serializer.validated_data["password"],
    )

    if user is None:
        AccessLog.log(
            user=None,
            action="failed_login",
            request=request,
            user_display_name=serializer.validated_data["username"],
            resource_type="system",
            resource_name="Login",
            status="error",
            details=f"Tentativa de login falha para '{serializer.validated_data['username']}'",
        )
        return Response(
            {"detail": "Credenciais inválidas."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request, user)

    AccessLog.log(
        user=user,
        action="login",
        request=request,
        resource_type="system",
        resource_name="Login",
        status="success",
        details="Login realizado com sucesso",
    )

    return Response(UserSerializer(user).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user."""
    serializer = UserCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    login(request, user)

    AccessLog.log(
        user=user,
        action="login",
        request=request,
        resource_type="system",
        resource_name="Registro",
        status="success",
        details="Novo usuário registrado e autenticado",
    )

    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    """Logout the current user."""
    if request.user.is_authenticated:
        AccessLog.log(
            user=request.user,
            action="logout",
            request=request,
            resource_type="system",
            resource_name="Logout",
            status="success",
            details="Sessão encerrada",
        )
    logout(request)
    return Response({"detail": "Logout realizado com sucesso."})


@api_view(["GET"])
@permission_classes([AllowAny])
def me_view(request):
    """Return the currently authenticated user or 401."""
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_view(request):
    """Return a CSRF token for session-based auth."""
    return Response({"csrfToken": get_token(request)})


# ──────────────────────────────────────────────
# User management views
# ──────────────────────────────────────────────

class UserListCreateView(generics.ListCreateAPIView):
    """List all users or create a new one."""
    queryset = User.objects.all()

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]
        return [IsAdminRole()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        AccessLog.log(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="permission_change",
            request=self.request,
            resource_type="user",
            resource_id=user.id,
            resource_name=user.get_full_name() or user.username,
            status="success",
            details=f"Usuário '{user.username}' criado com função '{user.get_role_display()}'",
        )


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a user."""
    permission_classes = [IsAdminRole]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_update(self, serializer):
        user = serializer.save()
        AccessLog.log(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="permission_change",
            request=self.request,
            resource_type="user",
            resource_id=user.id,
            resource_name=user.get_full_name() or user.username,
            status="success",
            details=f"Dados do usuário '{user.username}' atualizados",
        )

    def perform_destroy(self, instance):
        AccessLog.log(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="permission_change",
            request=self.request,
            resource_type="user",
            resource_id=instance.id,
            resource_name=instance.get_full_name() or instance.username,
            status="warning",
            details=f"Usuário '{instance.username}' removido do sistema",
        )
        instance.delete()


# ──────────────────────────────────────────────
# Access Log views
# ──────────────────────────────────────────────

class AccessLogListView(generics.ListAPIView):
    """List all access logs with optional filtering."""
    permission_classes = [IsAdminRole]
    serializer_class = AccessLogSerializer

    def get_queryset(self):
        qs = AccessLog.objects.all()

        # Filter by status
        log_status = self.request.query_params.get("status")
        if log_status and log_status != "all":
            qs = qs.filter(status=log_status)

        # Filter by user
        user_id = self.request.query_params.get("user")
        if user_id:
            qs = qs.filter(user_id=user_id)

        # Filter by action
        action = self.request.query_params.get("action")
        if action:
            qs = qs.filter(action=action)

        # Filter by resource type
        resource_type = self.request.query_params.get("resource_type")
        if resource_type:
            qs = qs.filter(resource_type=resource_type)

        # Search
        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q

            qs = qs.filter(
                Q(user_display_name__icontains=search)
                | Q(resource_name__icontains=search)
                | Q(details__icontains=search)
            )

        return qs


@api_view(["GET"])
@permission_classes([IsAdminRole])
def access_log_stats_view(request):
    """Return aggregate stats for access logs."""
    from django.db.models import Count

    total = AccessLog.objects.count()
    by_status = dict(
        AccessLog.objects.values_list("status").annotate(c=Count("id")).values_list("status", "c")
    )

    return Response(
        {
            "total": total,
            "success": by_status.get("success", 0),
            "warning": by_status.get("warning", 0),
            "error": by_status.get("error", 0),
        }
    )
