
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import serializers

from ...models import VendorPortalUser


class VendorPortalRegistrationSerializer(serializers.Serializer):
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

    def validate_email(self, value):
        value = value.strip().lower()

        if VendorPortalUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_password(self, value):
        user = VendorPortalUser(
            email=self.initial_data.get("email", ""),
            first_name=self.initial_data.get("first_name", ""),
            last_name=self.initial_data.get("last_name", ""),
        )

        try:
            validate_password(value, user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))

        return value

    def create(self, validated_data):
        password = validated_data.pop("password")

        return VendorPortalUser.objects.create(
            password=make_password(password),
            application_status="pending",
            **validated_data,
        )


class VendorPortalLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]

        vendor_user = VendorPortalUser.objects.filter(
            email__iexact=email,
            is_active=True,
        ).first()

        if (
            vendor_user is None
            or not check_password(password, vendor_user.password)
        ):
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        attrs["vendor_user"] = vendor_user
        return attrs


class VendorPortalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        from ...models import VendorPortalUser

        model = VendorPortalUser
        fields = [
            "first_name",
            "last_name",
            "email",
            "company_name",
            "abrv_name",
            "contact_number",
            "invoice_email",
            "tax_id",
            "address",
            "invoicing_method",
            "payment_terms",
            "city",
            "zip_code",
            "country",
            "state",
            "profile_submitted",
            "submitted_at",
            "application_status",
            "admin_note",
        ]
        read_only_fields = [
            "first_name",
            "last_name",
            "email",
            "profile_submitted",
            "submitted_at",
            "application_status",
            "admin_note",
        ]
