from django.db import models
import secrets
import uuid
from django.contrib.auth.models import User
import base64

RECORD_SOURCE_CHOICES = [
    ("internal", "Internal"),
    ("diy_portal", "DIY Portal"),
]

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

    client_source = models.CharField(
        max_length=20,
        choices=RECORD_SOURCE_CHOICES,
        default="internal",
        db_index=True,
    )

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

    is_diy = models.BooleanField(
        default=False,
        help_text="False = Internal vendor, True = DIY vendor registered through the Vendor Portal."
    )

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

    enable_screening = models.BooleanField(default=False)
    screening_pass_percentage = models.PositiveIntegerField(default=100,null=True,blank=True)

    project_source = models.CharField(
        max_length=20,
        choices=RECORD_SOURCE_CHOICES,
        default="internal",
        db_index=True,
    )

    external_reference = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        editable=False,
    )

    def __str__(self):
        return self.name

class DIYProjectReference(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OB{self.pk:02d}"

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

    # qualification_required = models.BooleanField(default=True)

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


class Participant(models.Model):
    
    participant_key = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.participant_key)


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

    
    participant = models.ForeignKey(
        Participant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="respondents",
    )

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="started")
    termination_reason = models.CharField(max_length=100, blank=True, null=True)
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

    proxy_detected = models.BooleanField(default=False)
    vpn_detected = models.BooleanField(default=False)
    
    screening_status = models.CharField(max_length=20,choices=[
            ("pending", "Pending"),
            ("passed", "Passed"),
            ("failed", "Failed"),
        ],
        default="pending",
    )

    screening_score = models.DecimalField( max_digits=5,decimal_places=2, default=0)

    class Meta:
        constraints = [
         
            models.UniqueConstraint(
                fields=["participant", "project"],
                condition=models.Q(participant__isnull=False),
                name="unique_participant_per_project",
            )
        ]

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

    state = models.CharField(max_length=100, blank=True, null=True)

    industry = models.CharField(max_length=100, blank=True, null=True)

    designation = models.CharField(max_length=100, blank=True, null=True)

    annual_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    code = models.CharField(max_length=50, blank=True, null=True)

    registered_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)

    last_synced = models.DateTimeField(auto_now=True)

    source = models.CharField(max_length=30,default="Opinion Bunch")

    email_verified = models.BooleanField(default=False)

    optin_type = models.CharField(max_length=10,default="SOI")

    verified_at = models.DateTimeField(null=True,blank=True)

    total_surveys = models.PositiveIntegerField(default=0)

    completed_surveys = models.PositiveIntegerField(default=0)

    terminated_surveys = models.PositiveIntegerField(default=0)

    quota_full_surveys = models.PositiveIntegerField(default=0)

    security_terminated_surveys = models.PositiveIntegerField(default=0)

    last_survey_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.email
    
class PanelCampaign(models.Model):

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("running", "Running"),
        ("completed", "Completed"),
        ("paused", "Paused"),
    ]

    name = models.CharField(max_length=255)

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
    )

    project_vendor = models.ForeignKey(
        ProjectVendor,
        on_delete=models.CASCADE,
        related_name="panel_campaigns",
        blank=True,
        null= True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft"
    )

    target = models.PositiveIntegerField(default=0)

    notes = models.TextField(
        blank=True,
        null=True
    )

    country = models.JSONField(
        default=list,
        blank=True
    )

    industry = models.JSONField(
        default=list,
        blank=True
    )
    
    gender = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class PanelCampaignRecipient(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("opened", "Opened"),
        ("started", "Started"),
        ("complete", "Complete"),
        ("terminate", "Terminate"),
        ("quota_full", "Quota Full"),
        ("security_terminate", "Security Terminate"),
    ]

    campaign = models.ForeignKey(
        PanelCampaign,
        on_delete=models.CASCADE,
        related_name="recipients"
    )

    panelist = models.ForeignKey(
        Panelist,
        on_delete=models.CASCADE,
        related_name="campaigns"
    )

    survey_token = models.CharField(
        max_length=100,
        unique=True
    )

    survey_link = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    respondent = models.OneToOneField(
        "Respondent",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="pending"
    )

    email_sent = models.BooleanField(default=False)

    clicked = models.BooleanField(default=False)

    started_at = models.DateTimeField(
        blank=True,
        null=True
    )

    completed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.campaign.name} - {self.panelist.email}"    

class CampaignEmailTemplate(models.Model):

        campaign = models.OneToOneField(
            PanelCampaign,
            on_delete=models.CASCADE,
            related_name="email_template"
        )

        subject = models.CharField(
            max_length=255,
            default="Survey Invitation"
        )

        body = models.TextField(
            default="""
    Hello {{first_name}},

    You have been invited to participate in our survey.

    Survey Link:
    {{survey_link}}

    Thank you.

    Opinion Bunch
    """
        )

        updated_at = models.DateTimeField(auto_now=True)

        class Meta:
            ordering = ["campaign"]

        def __str__(self):
            return f"Email Template - {self.campaign.name}"

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
    

class ScreeningQuestion(models.Model):

    QUESTION_TYPES = [
        ("radio", "Radio"),
        ("checkbox", "Checkbox"),
        ("text", "Text"),
        ("textarea", "Textarea"),
        ("number", "Number"),
        ("select", "Dropdown"),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="screening_questions"
    )

    question = models.CharField(max_length=500)

    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPES
    )

    required = models.BooleanField(default=True)

    display_order = models.PositiveIntegerField(default=1)

    is_active = models.BooleanField(default=True)

class ScreeningOption(models.Model):

    question = models.ForeignKey(
        ScreeningQuestion,
        on_delete=models.CASCADE,
        related_name="options"
    )

    option_text = models.CharField(max_length=255)

    is_correct = models.BooleanField(default=False)

    display_order = models.PositiveIntegerField(default=1)

class RespondentAnswer(models.Model):

    respondent = models.ForeignKey(
        Respondent,
        on_delete=models.CASCADE,
        related_name="answers"
    )

    question = models.ForeignKey(
        ScreeningQuestion,
        on_delete=models.CASCADE
    )

    answer = models.TextField()

    is_correct = models.BooleanField(default=False)

class RespondentLog(models.Model):
    project     = models.ForeignKey(Project, on_delete=models.CASCADE)
    vendor      = models.ForeignKey(Vendor,  on_delete=models.SET_NULL, null=True, blank=True)
    respondent_id = models.CharField(max_length=200, blank=True)
    status      = models.CharField(max_length=50)   # complete / terminate / quota_full / started
    timestamp   = models.DateTimeField(auto_now_add=True)
    ip_address  = models.GenericIPAddressField(null=True, blank=True)

# ---------------------------------------------------------------------------------------------------------------------------------
# DIY Models

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator


class ClientPortalUser(models.Model):
    """
    Separate identity for external client portal accounts.
    Does not use the internal staff user table.
    """
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["email"]
        verbose_name = "Client Portal User"
        verbose_name_plural = "Client Portal Users"

    def __str__(self):
        return self.email

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False


class DIYCompany(models.Model):
    name = models.CharField(max_length=255)
    created_by = models.ForeignKey(
        "core.ClientPortalUser",
        on_delete=models.PROTECT,
        related_name="created_diy_companies",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "DIY Company"
        verbose_name_plural = "DIY Companies"

    def __str__(self):
        return self.name


class DIYCompanyMembership(models.Model):
    ROLE_CHOICES = [
        ("owner", "Owner"),
        ("employee", "Employee"),
    ]

    user = models.ForeignKey(
        "core.ClientPortalUser",
        on_delete=models.CASCADE,
        related_name="diy_company_memberships",
    )

    company = models.ForeignKey(
        "core.DIYCompany",
        on_delete=models.PROTECT,
        related_name="memberships",
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="employee",
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "company"],
                name="unique_diy_user_company_membership",
            )
        ]
        ordering = ["-created_at"]
        verbose_name = "DIY Company Membership"
        verbose_name_plural = "DIY Company Memberships"

    def __str__(self):
        return f"{self.user.email} - {self.company.name} ({self.role})"


class DIYStudy(models.Model):

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("under_review", "Under Review"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("project_created", "Project Created"),
        ("in_fieldwork", "In Fieldwork"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    STUDY_TYPE_CHOICES = [
        ("online_survey", "Online Survey"),
        ("customer_satisfaction", "Customer Satisfaction"),
        ("brand_awareness", "Brand Awareness"),
        ("product_research", "Product Research"),
        ("other", "Other"),
    ]

    # DIY company that owns this study
    company = models.ForeignKey(
        "core.DIYCompany",
        on_delete=models.PROTECT,
        related_name="diy_studies",
        null=True,
        blank=True,
    )

    # Client portal user who created the study
    created_by = models.ForeignKey(
        "core.ClientPortalUser",
        on_delete=models.PROTECT,
        related_name="created_diy_studies",
    )

    # Link to the operational project after approval.
    # A Project can be linked to only one DIYStudy.
    project = models.OneToOneField(
        "core.Project",
        on_delete=models.PROTECT,
        related_name="diy_study",
        null=True,
        blank=True,
    )

    # Basic study information
    name = models.CharField(max_length=255)

    study_type = models.CharField(
        max_length=50,
        choices=STUDY_TYPE_CHOICES,
        default="online_survey",
    )

    country = models.CharField(max_length=100)
    language = models.CharField(max_length=100, default="English")

    survey_link = models.URLField(
        max_length=2000,
        blank=True,
        null=True,
    )

    # Sample requirements
    target_completes = models.PositiveIntegerField()

    survey_length = models.PositiveIntegerField(
        help_text="Expected survey duration in minutes.",
    )

    incidence_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
        help_text="Expected incidence rate as a percentage.",
    )

    description = models.TextField(blank=True, null=True)

    # DIY review and fieldwork lifecycle
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="draft",
        db_index=True,
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="reviewed_diy_studies",
        null=True,
        blank=True,
    )

    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "DIY Study"
        verbose_name_plural = "DIY Studies"

    def __str__(self):
        return f"{self.name} ({self.status})"


# -------------------------------------------------------------------

# DIY Vendor


class VendorPortalUser(models.Model):
    APPLICATION_STATUS = [
        ("pending", "Pending Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150, blank=True)

    is_active = models.BooleanField(default=True)
    application_status = models.CharField(
        max_length=20,
        choices=APPLICATION_STATUS,
        default="pending",
    )

    # Filled when the admin approves the vendor application.
    vendor = models.OneToOneField(
        "Vendor",
        on_delete=models.PROTECT,
        related_name="portal_account",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    
    # Vendor company profile — completed in the vendor portal
    company_name = models.CharField(max_length=255, blank=True)
    abrv_name = models.CharField(max_length=100, blank=True)
    contact_number = models.CharField(max_length=30, blank=True)
    invoice_email = models.EmailField(blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)

    invoicing_method = models.CharField(
        max_length=50,
        choices=[
            ("monthly_basis", "Monthly Basis"),
            ("project_basis", "Project Basis"),
        ],
        blank=True,
    )

    payment_terms = models.CharField(
        max_length=50,
        choices=[
            ("15", "15 Days"),
            ("30", "30 Days"),
            ("45", "45 Days"),
            ("60", "60 Days"),
        ],
        blank=True,
    )

    city = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)

    # Tracks profile submission separately from account creation
    profile_submitted = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)

    admin_note = models.TextField(blank=True, default="")


    class Meta:
        ordering = ["email"]

    def __str__(self):
        return self.email

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False
