from django.urls import path
from .views import (
    status_view, 
    clients_list, client_detail, 
    secrets_list, secret_detail
)

urlpatterns = [
    path("status/", status_view, name="status"),
    
    # Clients endpoints
    path("api/clients/", clients_list, name="clients-list"),
    path("api/clients/<int:pk>/", client_detail, name="client-detail"),
    
    # Secrets endpoints
    path("api/secrets/", secrets_list, name="secrets-list"),
    path("api/secrets/<int:pk>/", secret_detail, name="secret-detail"),
]