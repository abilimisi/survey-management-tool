from django.db import models
import secrets
from django.contrib.auth.models import User
import base64

class UserProfile(models.Model):

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("pm", "Project Manager"),
        ("sales", "Sales"),
        ("viewer", "Viewer"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="viewer"
    )

    def __str__(self):
        return self.user.username

class Client(models.Model):

    COMPANY_TYPES = [
        ("client", "Client"),
        ("internal_company", "Internal Company"),
        ("affiliate_partner", "Affiliates Partner"),
        ("api_partner", "API Partner"),
        ("router_partner", "Router Partner"),
    ]

    INVOICE_METHODS = [
        ("monthly_basis", "Monthly Basis"),
        ("project_basis", "Project Basis"),
    ]

    PAYMENT_TERMS = [
        ("15", "15 Days"),
        ("30", "30 Days"),
        ("45", "45 Days"),
        ("60", "60 Days"),
    ]

    company_type = models.CharField(
        max_length=50,
        choices=COMPANY_TYPES,
        default="client"
    )

    name = models.CharField(max_length=255)

    abrv_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    contact_number = models.CharField(
        max_length=30,
        blank=True,
        null=True
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

    invoice_email = models.EmailField(
        blank=True,
        null=True
    )

    tax_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    address = models.TextField(
        blank=True,
        null=True
    )

    invoicing_method = models.CharField(
        max_length=50,
        choices=INVOICE_METHODS,
        blank=True,
        null=True
    )

    payment_terms = models.CharField(
        max_length=50,
        choices=PAYMENT_TERMS,
        blank=True,
        null=True
    )

    city = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    zip_code = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    country = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    state = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    status = models.BooleanField(default=True)

    check_proxy = models.BooleanField(default=True)

    is_diy = models.BooleanField(default=True)

    # Survey Links

    test_link = models.URLField(
        max_length=2000,
        blank=True,
        null=True
    )

    live_link = models.URLField(
        max_length=2000,
        blank=True,
        null=True
    )

    # RID Mapping

    rid_parameter = models.CharField(
        max_length=50,
        default="RID"
    )

    our_parameter = models.CharField(
        max_length=50,
        default="ID"
    )

    # Notes / API Details

    api_details = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Vendor(models.Model):

    INVOICE_METHODS = [
        ("monthly_basis", "Monthly Basis"),
        ("project_basis", "Project Basis"),
    ]

    PAYMENT_TERMS = [
        ("15", "15 Days"),
        ("30", "30 Days"),
        ("45", "45 Days"),
        ("60", "60 Days"),
    ]

    name = models.CharField(max_length=255)

    abrv_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    contact_number = models.CharField(
        max_length=30,
        blank=True,
        null=True
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

    invoice_email = models.EmailField(
        blank=True,
        null=True
    )

    tax_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    address = models.TextField(
        blank=True,
        null=True
    )

    invoicing_method = models.CharField(
        max_length=50,
        choices=INVOICE_METHODS,
        blank=True,
        null=True
    )

    payment_terms = models.CharField(
        max_length=50,
        choices=PAYMENT_TERMS,
        blank=True,
        null=True
    )

    city = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    zip_code = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    country = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    state = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    complete_link = models.URLField(
        max_length=2000,
        blank=True,
        null=True
    )

    terminate_link = models.URLField(
        max_length=2000,
        blank=True,
        null=True
    )

    quota_full_link = models.URLField(
        max_length=2000,
        blank=True,
        null=True
    )

    security_terminate_link = models.URLField(
        max_length=2000,
        blank=True,
        null=True
    )

    api_details = models.TextField(
        blank=True,
        null=True
    )

    s2s_token = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True
    )

    cpc = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    status = models.BooleanField(default=True)

    check_proxy = models.BooleanField(default=True)

    is_diy = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.s2s_token:
            self.s2s_token = secrets.token_hex(64)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Project(models.Model):

    STUDY_TYPES = [
        ("B2B", "B2B"),
        ("B2C", "B2C"),
        ("CATI", "CATI"),
        ("Data Processing", "Data Processing"),
        ("Doctor", "Doctor"),
        ("Focus Group", "Focus Group"),
        ("Health care", "Health care"),
        ("IDI", "IDI"),
        ("IHUT", "IHUT"),
        ("In-depth telephone interviews(TDIs)", "In-depth telephone interviews(TDIs)"),
        ("Online Board", "Online Board"),
        ("Online Community Recruitment", "Online Community Recruitment"),
        ("panel build up", "Panel Build Up"),
        ("programming", "Programming"),
        ("TDI", "TDI"),
    ]

    STATUS_CHOICES = [
        ("bidding", "Bidding"),
        ("api_staging", "API Staging"),
        ("running", "Running"),
        ("testing", "Testing"),
        ("on_hold", "On Hold"),
        ("awaiting_ids", "Awaiting ID's"),
        ("completed", "Completed"),
        ("closed", "Closed"),
    ]

    parent_project = models.CharField(
        max_length=100,
        default="Self Parent"
    )

    name = models.CharField(max_length=255)

    study_type = models.CharField(
        max_length=100,
        choices=STUDY_TYPES,
        blank=True,
        null=True
    )

    country = models.CharField(max_length=100, blank=True, null=True)

    language = models.CharField(max_length=100, blank=True, null=True)

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="projects"
    )

    client_contact = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    project_manager = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    sales_person = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    target = models.PositiveIntegerField(default=0)

    max_completes = models.PositiveIntegerField(default=0)

    cpc = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    loi = models.PositiveIntegerField(default=0)

    ir = models.PositiveIntegerField(default=0)

    reward_points = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    supported_devices = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    live_link = models.URLField(
        max_length=2000,
        blank=True,
        null=True
    )

    test_link = models.URLField(
        max_length=2000,
        blank=True,
        null=True
    )

    start_date = models.DateField(blank=True, null=True)

    end_date = models.DateField(blank=True, null=True)

    notes = models.TextField(blank=True, null=True)

    project_brief = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default="bidding"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ProjectVendor(models.Model):

    STATUS_CHOICES = [
        ("active", "Active"),
        ("paused", "Paused"),
        ("closed", "Closed"),
    ]


    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_vendors")
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="vendor_projects")

    vendor_cpc = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    target = models.IntegerField(default=0)

    complete_link = models.URLField(max_length=1000, blank=True, null=True)
    terminate_link = models.URLField(max_length=1000, blank=True, null=True)
    quota_full_link = models.URLField(max_length=1000, blank=True, null=True)
    security_terminate_link = models.URLField(max_length=1000, blank=True, null=True)

    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    max_redirects = models.IntegerField(default=99999)
    notes = models.TextField(blank=True, null=True)

    ask_email = models.BooleanField(default=False)
    ask_zip = models.BooleanField(default=False)
    ask_age = models.BooleanField(default=False)
    ask_gender = models.BooleanField(default=False)

    s2s_token = models.CharField(max_length=128, blank=True, null=True, unique=True)

    qualification_required = models.BooleanField(default=True)

    gid = models.CharField(max_length=255,unique=True, blank=True, null=True)

    supplier_parameter_template = models.CharField(max_length=500,default="pid={{PANELIST IDENTIFIER}}&ext={{PANEL MISC DATA}}&reconnectID={{RECONNECTID}}")

    def save(self, *args, **kwargs):
        if not self.s2s_token:
            self.s2s_token = secrets.token_hex(32)

        if self.vendor:
            if not self.complete_link:
                self.complete_link = self.vendor.complete_link
            if not self.terminate_link:
                self.terminate_link = self.vendor.terminate_link
            if not self.quota_full_link:
                self.quota_full_link = self.vendor.quota_full_link
            if not self.security_terminate_link:
                self.security_terminate_link = self.vendor.security_terminate_link
            if not self.vendor_cpc:
                self.vendor_cpc = self.vendor.cpc

        super().save(*args, **kwargs)
        
        if not self.gid:
            raw_gid = f"{self.project.id}-{self.vendor.id}-{self.id}"
            self.gid = base64.urlsafe_b64encode(raw_gid.encode()).decode()
            super().save(update_fields=["gid"])

    def __str__(self):
        return f"{self.project.name} - {self.vendor.name}"


class Respondent(models.Model):
    STATUS_CHOICES = [
        ("started", "Started"),
        ("complete", "Complete"),
        ("terminate", "Terminate"),
        ("quota_full", "Quota Full"),
        ("security_terminate", "Security Terminate"),
    ]

    respondent_id = models.CharField(max_length=100, unique=True)

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="respondents")
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="respondents")
    project_vendor = models.ForeignKey(ProjectVendor, on_delete=models.CASCADE, related_name="respondents")

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="started")
    previous_status = models.CharField(max_length=30, blank=True, null=True)

    vendor_panelist_id = models.CharField(max_length=255, blank=True, null=True)
    panel_misc_data = models.TextField(blank=True, null=True)
    reconnect_id = models.CharField(max_length=255, blank=True, null=True)

    email = models.EmailField(blank=True, null=True)
    zip_code = models.CharField(max_length=50, blank=True, null=True)
    age = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=50, blank=True, null=True)

    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)

    s2s_status = models.BooleanField(default=False)

    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    detected_country = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.respondent_id


class RedirectLog(models.Model):
    respondent = models.ForeignKey(Respondent, on_delete=models.CASCADE, related_name="redirect_logs")

    redirect_type = models.CharField(max_length=50)
    redirect_url = models.URLField(max_length=1000)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.respondent.respondent_id} - {self.redirect_type}"
    

class Panelist(models.Model):
    external_id = models.IntegerField(unique=True)

    fname = models.CharField(max_length=100)
    lname = models.CharField(max_length=100)

    email = models.EmailField(unique=True)

    gender = models.CharField(max_length=20, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)

    country = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)

    code = models.CharField(max_length=50, blank=True, null=True)

    registered_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email
    
class CompanyContact(models.Model):
    CONTACT_TYPE_CHOICES = [
        ("ceo", "CEO"),
        ("project_manager", "Project Manager"),
        ("associate_project_manager", "Associate Project Manager"),
        ("assistant_manager", "Assistant Manager"),
        ("sales_person", "Sales Person"),
        ("client_contact", "Client Contact"),
        ("other", "Other"),
    ]

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("disabled", "Disabled"),
    ]
    
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="contacts"
    )

    contact_type = models.CharField(
        max_length=100,
        choices=CONTACT_TYPE_CHOICES,
        blank=True,
        null=True
    )

    salutation = models.CharField(max_length=20, blank=True, null=True)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)

    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
        null=True
    )

    dob = models.DateField(blank=True, null=True)

    email = models.EmailField(blank=True, null=True)
    contact_no = models.CharField(max_length=30, blank=True, null=True)

    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)

    username = models.CharField(max_length=150, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name or ''}"