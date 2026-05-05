from django.urls import path

from .views import (
    AccessLogListView,
    UserDetailView,
    UserListCreateView,
    access_log_stats_view,
    csrf_view,
    login_view,
    logout_view,
    me_view,
    register_view,
    token_login_view,
    token_logout_view,
)

urlpatterns = [
    # Authentication (session-based, web frontend)
    path("api/auth/login/", login_view, name="auth-login"),
    path("api/auth/register/", register_view, name="auth-register"),
    path("api/auth/logout/", logout_view, name="auth-logout"),
    path("api/auth/me/", me_view, name="auth-me"),
    path("api/auth/csrf/", csrf_view, name="auth-csrf"),
    # Authentication (token-based, mobile)
    path("api/auth/token/login/", token_login_view, name="auth-token-login"),
    path("api/auth/token/logout/", token_logout_view, name="auth-token-logout"),
    # User management
    path("api/users/", UserListCreateView.as_view(), name="users-list-create"),
    path("api/users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    # Access logs
    path("api/logs/", AccessLogListView.as_view(), name="logs-list"),
    path("api/logs/stats/", access_log_stats_view, name="logs-stats"),
]

