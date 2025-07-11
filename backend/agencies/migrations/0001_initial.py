# Generated by Django 5.2.4 on 2025-07-03 14:01

import django.db.models.deletion
import django_countries.fields
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Agency',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('country', django_countries.fields.CountryField(max_length=2)),
                ('timezone', models.CharField(max_length=50)),
                ('website', models.URLField(blank=True, null=True)),
                ('contact_email', models.EmailField(blank=True, max_length=254, null=True)),
                ('phone_number', models.CharField(blank=True, max_length=50, null=True)),
                ('logo', models.ImageField(blank=True, null=True, upload_to='agency_logos/')),
                ('slug', models.SlugField(blank=True, unique=True)),
                ('is_set_up', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='owned_agency', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='AgencyBusinessDetails',
            fields=[
                ('agency', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='business_details', serialize=False, to='agencies.agency')),
                ('company_name', models.CharField(blank=True, max_length=255, null=True)),
                ('tax_number', models.CharField(blank=True, max_length=100, null=True)),
                ('address', models.CharField(blank=True, max_length=255, null=True)),
                ('town', models.CharField(blank=True, max_length=100, null=True)),
                ('city', models.CharField(blank=True, max_length=100, null=True)),
                ('country', django_countries.fields.CountryField(blank=True, max_length=2, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='AgencySettings',
            fields=[
                ('agency', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='agency_settings', serialize=False, to='agencies.agency')),
                ('currency', models.CharField(default='EUR', max_length=10)),
                ('language', models.CharField(default='en', max_length=10)),
                ('notifications_enabled', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('agency_owner', 'Agency Owner'), ('agency_manager', 'Agency Manager'), ('agency_agent', 'Agency Agent'), ('agency_assistant', 'Agency Assistant')], default='agency_assistant', max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('agency', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='users', to='agencies.agency')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
