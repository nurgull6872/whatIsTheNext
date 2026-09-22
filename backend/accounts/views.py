"""Kimlik dogrulama gorunumleri (§5.1)."""

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from config.exceptions import ValidationAPIError

from .serializers import EmailTokenObtainPairSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class AuthThrottle(ScopedRateThrottle):
    """Kayit ve giris denemelerini siki tutar (§2.2, §7)."""

    scope = "auth"


class RegisterView(generics.CreateAPIView):
    """POST /auth/register/ -> 201 + tokenlar.

    Kullaniciyi olusturur ve dogrudan oturum acmis gibi token doner;
    kayittan sonra ayrica login cagrisi yapmaya gerek kalmaz.
    """

    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthThrottle]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """POST /auth/login/ -> {access, refresh, user}."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthThrottle]
    serializer_class = EmailTokenObtainPairSerializer


class RefreshView(TokenRefreshView):
    """POST /auth/refresh/ -> {access}."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthThrottle]


class LogoutView(APIView):
    """POST /auth/logout/ -> refresh token'i kara listeye alir."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get("refresh")
        if not token:
            raise ValidationAPIError("refresh alani zorunludur.")
        try:
            RefreshToken(token).blacklist()
        except TokenError as exc:
            raise ValidationAPIError("Gecersiz veya suresi dolmus refresh token.") from exc
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /auth/me/."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
