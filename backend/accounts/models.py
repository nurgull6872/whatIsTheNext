"""Kullanici modeli.

Giris e-posta ile yapilir, `username` alani yoktur. `display_name`
anketlerin ustunde gorunen addir ve benzersizdir (§4.1).
"""

import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

display_name_validator = RegexValidator(
    regex=r"^[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]{3,32}$",
    message=_("Ad 3-32 karakter olmali; harf, rakam ve alt cizgi kullanabilirsin."),
)


class UserManager(BaseUserManager):
    """E-posta tabanli kullanici olusturma.

    Django'nun varsayilan yoneticisi `username` bekler; burada onu
    e-posta ile degistiriyoruz.
    """

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("E-posta zorunludur.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser icin is_staff=True olmali.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser icin is_superuser=True olmali.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # AbstractUser'dan gelen alanlari kaldiriyoruz.
    username = None
    first_name = None
    last_name = None

    email = models.EmailField(_("e-posta"), unique=True)
    display_name = models.CharField(
        _("gorunen ad"),
        max_length=32,
        unique=True,
        validators=[display_name_validator],
        help_text=_("Anketlerinin ustunde bu ad gorunur."),
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["display_name"]

    objects = UserManager()

    class Meta:
        verbose_name = _("kullanici")
        verbose_name_plural = _("kullanicilar")
        ordering = ["-date_joined"]

    def __str__(self):
        return self.display_name

    def get_full_name(self):
        return self.display_name

    def get_short_name(self):
        return self.display_name
