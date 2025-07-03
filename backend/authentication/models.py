from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True, null=True, blank=True)
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.email or self.username