from django.db import models


class Client(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True)
    company_name = models.CharField(max_length=150, blank=True, null=True)

    test_link = models.URLField(max_length=1000, blank=True, null=True)
    live_link = models.URLField(max_length=1000)

    rid_parameter = models.CharField(max_length=50, default="RID")
    our_parameter = models.CharField(max_length=50, default="ID")

    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Vendor(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True)
    contact_person = models.CharField(max_length=150, blank=True, null=True)

    complete_link = models.URLField(max_length=1000, blank=True, null=True)
    terminate_link = models.URLField(max_length=1000, blank=True, null=True)
    quota_full_link = models.URLField(max_length=1000, blank=True, null=True)
    security_terminate_link = models.URLField(max_length=1000, blank=True, null=True)

    cpc = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Project(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="projects")

    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    target = models.IntegerField(default=0)
    cpc = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    loi = models.IntegerField(default=0)
    ir = models.IntegerField(default=0)

    test_link = models.URLField(max_length=1000, blank=True, null=True)
    live_link = models.URLField(max_length=1000)

    status = models.CharField(
        max_length=20,
        choices=[
            ("active", "Active"),
            ("paused", "Paused"),
            ("closed", "Closed"),
        ],
        default="active"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProjectVendor(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_vendors")
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="vendor_projects")

    vendor_cpc = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    target = models.IntegerField(default=0)

    complete_link = models.URLField(max_length=1000, blank=True, null=True)
    terminate_link = models.URLField(max_length=1000, blank=True, null=True)
    quota_full_link = models.URLField(max_length=1000, blank=True, null=True)
    security_terminate_link = models.URLField(max_length=1000, blank=True, null=True)

    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
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

    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)

    s2s_status = models.BooleanField(default=False)

    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.respondent_id


class RedirectLog(models.Model):
    respondent = models.ForeignKey(Respondent, on_delete=models.CASCADE, related_name="redirect_logs")

    redirect_type = models.CharField(max_length=50)
    redirect_url = models.URLField(max_length=1000)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.respondent.respondent_id} - {self.redirect_type}"