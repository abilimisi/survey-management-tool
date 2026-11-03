from django.contrib import admin
from django.urls import path, include
from core.views import CustomTokenObtainPairView

from core.views import CustomTokenRefreshView
from rest_framework_simplejwt.views import TokenBlacklistView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    path("api/token/",CustomTokenObtainPairView.as_view(),name="token_obtain_pair"),
    path("api/token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path(
        "api/token/blacklist/",
        TokenBlacklistView.as_view(),
        name="token_blacklist",
    ),
]