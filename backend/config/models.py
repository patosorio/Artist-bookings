from django.db import models

class TimestampedModel(models.Model):
    """
    An abstract base model that includes timestamp fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True 