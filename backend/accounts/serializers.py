"""Kayit, giris ve profil serializer'lari (§5.1)."""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """`GET/PATCH /auth/me/` ve anket yanitlarindaki `author` alani icin."""

    class Meta:
        model = User
        fields = ["id", "email", "display_name", "date_joined"]
        read_only_fields = ["id", "email", "date_joined"]

    def validate_display_name(self, value):
        qs = User.objects.filter(display_name__iexact=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Bu ad zaten aliniyor. Baska bir ad dene.")
        return value


class PublicAuthorSerializer(serializers.ModelSerializer):
    """Anket detayinda sadece gorunen adi tasir (§5.4)."""

    class Meta:
        model = User
        fields = ["display_name"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["email", "display_name", "password"]

    def validate_email(self, value):
        value = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Bu e-posta zaten kullaniliyor.")
        return value

    def validate_display_name(self, value):
        if User.objects.filter(display_name__iexact=value).exists():
            raise serializers.ValidationError("Bu ad zaten aliniyor. Baska bir ad dene.")
        return value

    def validate_password(self, value):
        # AbstractUser alanlari henuz olusmadigi icin user=None gecilir;
        # UserAttributeSimilarityValidator bu durumda kontrolu atlar.
        validate_password(value)
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """SimpleJWT'nin varsayilan seri hale getiricisi; USERNAME_FIELD zaten
    email oldugu icin ek alan degisikligi gerekmiyor. Yaniti kullanici
    bilgisiyle zenginlestiriyoruz.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
