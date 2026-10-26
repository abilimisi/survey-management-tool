
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction

from rest_framework import serializers

from ..models import (
    ClientPortalUser,
    DIYCompany,
    DIYCompanyMembership,
)


class ClientPortalRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        min_length=8,
        max_length=128,
    )
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    company_name = serializers.CharField(max_length=255)

    def validate_email(self, value):
        value = value.strip().lower()

        if ClientPortalUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_password(self, value):
        user = ClientPortalUser(
            email=self.initial_data.get("email", ""),
            first_name=self.initial_data.get("first_name", ""),
            last_name=self.initial_data.get("last_name", ""),
        )

        try:
            validate_password(value, user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))

        return value

    def validate_company_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Company name is required."
            )

        return value

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        company_name = validated_data.pop("company_name")

        client_user = ClientPortalUser.objects.create(
            password=make_password(password),
            is_email_verified=False,
            **validated_data,
        )

        company = DIYCompany.objects.create(
            name=company_name,
            created_by=client_user,
        )

        DIYCompanyMembership.objects.create(
            user=client_user,
            company=company,
            role="owner",
        )

        return client_user


class ClientPortalLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]

        client_user = ClientPortalUser.objects.filter(
            email__iexact=email,
            is_active=True,
        ).first()

        if (
            client_user is None
            or not check_password(password, client_user.password)
        ):
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        attrs["client_user"] = client_user
        return attrs
