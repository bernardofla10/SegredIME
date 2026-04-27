from django.urls import path
from .views import (
    MfaApprovalDecisionView,
    MfaApprovalRequestDetailView,
    MfaApprovalRequestListView,
    SecretDetailView,
    SecretListCreateView,
    SecretRevealRequestView,
    VaultDetailView,
    VaultListCreateView,
    VaultMemberDetailView,
    VaultMembersView,
    SharedVaultListView,
    status_view,
    SecretRevealView,
)

urlpatterns = [
    path("status/", status_view, name="status"),
    path("api/vaults/", VaultListCreateView.as_view(), name="vaults-list-create"),
    path("api/vaults/shared/", SharedVaultListView.as_view(), name="vaults-shared"),
    path("api/vaults/<int:pk>/", VaultDetailView.as_view(), name="vault-detail"),
    path("api/vaults/<int:pk>/members/", VaultMembersView.as_view(), name="vault-members"),
    path("api/vaults/<int:pk>/members/<int:member_pk>/", VaultMemberDetailView.as_view(), name="vault-member-detail"),
    path("api/secrets/", SecretListCreateView.as_view(), name="secrets-list-create"),
    path("api/secrets/<int:pk>/", SecretDetailView.as_view(), name="secret-detail"),
    path("api/secrets/<int:pk>/reveal/request/", SecretRevealRequestView.as_view(), name="secret-reveal-request"),
    path("api/secrets/<int:pk>/reveal/", SecretRevealView.as_view(), name="secret-reveal"),
    path("api/mfa/requests/", MfaApprovalRequestListView.as_view(), name="mfa-requests"),
    path("api/mfa/requests/<int:pk>/", MfaApprovalRequestDetailView.as_view(), name="mfa-request-detail"),
    path("api/mfa/requests/<int:pk>/approve/", MfaApprovalDecisionView.as_view(), {"decision": "approve"}, name="mfa-request-approve"),
    path("api/mfa/requests/<int:pk>/deny/", MfaApprovalDecisionView.as_view(), {"decision": "deny"}, name="mfa-request-deny"),
]
