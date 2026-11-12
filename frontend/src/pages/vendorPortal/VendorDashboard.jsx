import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getVendorProfile,getVendorProjects,respondToVendorProject, getVendorProjectMessages, sendVendorProjectMessage,} from "../../api/vendorPortalApi";
import {
  LayoutDashboard,
  Building2,
  Mail,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileText,
  ShieldCheck,
  MessageSquareText,
  MessageSquare,
} from "lucide-react";
import "./VendorDashboard.css";

const statusDetails = {
  draft: {
    label: "Draft",
    description:
      "Complete your company profile and submit it for administrator review.",
    icon: FileText,
    className: "pending",
    nextStep: "Complete profile",
    nextStepDescription: "Add your company details and submit them for review.",
  },
  submitted: {
    label: "Submitted",
    description:
      "Your application has been submitted and is waiting for administrator review.",
    icon: Clock3,
    className: "pending",
    nextStep: "Await review",
    nextStepDescription: "Your application is waiting in the review queue.",
  },
  under_review: {
    label: "Under Review",
    description:
      "The administrator is currently reviewing your vendor application.",
    icon: Clock3,
    className: "pending",
    nextStep: "Review in progress",
    nextStepDescription: "The administrator is reviewing your application.",
  },
  changes_requested: {
    label: "Changes Requested",
    description:
      "The administrator has requested changes. Update your company profile and resubmit it.",
    icon: AlertCircle,
    className: "rejected",
    nextStep: "Update profile",
    nextStepDescription: "Review the administrator's feedback and make the requested changes.",
  },
  approved: {
    label: "Approved",
    description:
      "Your vendor application has been approved.",
    icon: CheckCircle2,
    className: "approved",
    nextStep: "Application approved",
    nextStepDescription: "Your vendor application has completed the approval process.",
  },
  rejected: {
    label: "Rejected",
    description:
      "Your application was rejected. Please review the administrator's feedback.",
    icon: AlertCircle,
    className: "rejected",
    nextStep: "Contact administrator",
    nextStepDescription: "Contact the administrator if you need clarification.",
  },
};

function VendorDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [messageAssignment, setMessageAssignment] = useState(null);
  const [projectMessages, setProjectMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    if (profile?.user?.application_status !== "approved") return;

    const refreshProjects = async () => {
      try {
        const response = await getVendorProjects();
        setProjects(response.data || []);
      } catch (error) {
        console.error("Failed to refresh assigned projects:", error);
      }
    };

    const intervalId = setInterval(refreshProjects, 12000);

    return () => clearInterval(intervalId);
  }, [profile?.user?.application_status]);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
    if (!localStorage.getItem("vendor_portal_access_token")) {
      navigate("/vendor/login", { replace: true });
      return;
    }

    try {
      const response = await getVendorProfile();

      if (cancelled) return;

      setProfile(response.data);

      if (response.data.user?.application_status === "approved") {
        setProjectsLoading(true);

        try {
          const projectsResponse = await getVendorProjects();

          if (!cancelled) {
            setProjects(projectsResponse.data || []);
          }
        } catch (error) {
          if (!cancelled) {
            toast.error(
              error.response?.data?.detail ||
                error.response?.data?.error ||
                "Unable to load assigned projects."
            );
          }
        } finally {
          if (!cancelled) {
            setProjectsLoading(false);
          }
        }
      }
    } catch (error) {
      if (!cancelled) {
        if ([401, 403].includes(error.response?.status)) {
          localStorage.removeItem("vendor_portal_access_token");
          toast.error("Please log in again.");
          navigate("/vendor/login", { replace: true });
        } else {
          toast.error(
            error.response?.data?.detail ||
              "Unable to load your dashboard."
          );
        }
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };
    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const [respondingId, setRespondingId] = useState(null);

  const handleProjectResponse = async (assignmentId, action, message = "") => {
    if (respondingId !== null) return;

    if (
      action === "decline" &&
      !window.confirm("Are you sure you want to decline this project?")
    ) {
      return;
    }

    setRespondingId(assignmentId);

    try {
      const response = await respondToVendorProject(assignmentId, {
        action,
        ...(message ? { message } : {}),
        ...(action === "decline" ? { reason: message } : {}),
      });

      setProjects((currentProjects) =>
        currentProjects.map((assignment) =>
          assignment.id === assignmentId
            ? response.data.assignment
            : assignment
        )
      );

      toast.success(response.data.message || "Your response was submitted.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Unable to submit your response."
      );
    } finally {
      setRespondingId(null);
    }
  };

  const handleOpenMessages = async (assignment) => {
    setMessageAssignment(assignment);
    setProjectMessages([]);
    setMessageDraft("");
    setMessagesLoading(true);

    // Clear the unread badge immediately.
    setProjects((currentProjects) =>
      currentProjects.map((item) =>
        item.id === assignment.id
          ? { ...item, unread_messages_count: 0 }
          : item
      )
    );

    try {
      const response = await getVendorProjectMessages(assignment.id);
      setProjectMessages(response.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Unable to load project messages."
      );
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendProjectMessage = async (e) => {
    e.preventDefault();

    const message = messageDraft.trim();

    if (!message || !messageAssignment || messageSending) return;

    setMessageSending(true);

    try {
      const response = await sendVendorProjectMessage(
        messageAssignment.id,
        message
      );

      setProjectMessages((current) => [...current, response.data]);
      setMessageDraft("");
      toast.success("Message sent.");
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          "Unable to send your message."
      );
    } finally {
      setMessageSending(false);
    }
  };

  const handleCloseMessages = () => {
    setMessageAssignment(null);
    setProjectMessages([]);
    setMessageDraft("");
  };

  const handleLogout = () => {
    localStorage.removeItem("vendor_portal_access_token");
    navigate("/vendor/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="vendor-portal-page">
        <div className="vendor-dashboard-loading">
          <div className="vendor-loading-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const user = profile.user || {};
  const status = (user.application_status || "draft").toLowerCase();

  const profileSubmitted = Boolean(user.profile_submitted);
  const companyName = user.company_name || "Company profile";
  const firstName = user.first_name || "Vendor";
  const adminNote = user.admin_note || "";
  const vendorId = profile.vendor_id;

  const canEditProfile = ["draft", "changes_requested"].includes(status);
  const isUnderReview = ["submitted", "under_review"].includes(status);
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const needsAdminAttention = ["changes_requested", "rejected"].includes(
    status
  );

  const currentStatus = statusDetails[status] || statusDetails.draft;
  const StatusIcon = currentStatus.icon;

  const profileActionLabel =
    status === "changes_requested"
      ? "Update Requested Changes"
      : status === "draft"
        ? "Complete Vendor Profile"
        : "View Company Profile";

  const progressSteps = [
    {
      title: "Account Registration",
      description: "Your vendor account has been created.",
      complete: true,
      current: false,
      rejected: false,
    },
    {
      title: "Company Profile",
      description: profileSubmitted
        ? "Your company details have been submitted."
        : "Add your company and invoicing information.",
      complete: profileSubmitted,
      current: !profileSubmitted,
      rejected: false,
    },
    {
      title: "Administrator Review",
      description: isApproved
        ? "Your application has been approved."
        : isRejected
          ? "Your application was rejected."
          : status === "changes_requested"
            ? "The administrator requested changes to your application."
            : status === "under_review"
              ? "The administrator is currently reviewing your application."
              : status === "submitted"
                ? "Your application is waiting for administrator review."
                : "Submit your profile before review can begin.",
      complete: isApproved,
      current: isUnderReview || status === "changes_requested",
      rejected: isRejected,
    },
  ];

  return (
    <div className="vendor-portal-page vendor-dashboard-page">
      <div className="vendor-dashboard-shell">
        <main className="vendor-dashboard-main">
          {/* Welcome */}
          <section className="vendor-dashboard-welcome">
            <div>
              <span className="vendor-eyebrow">
                <LayoutDashboard size={15} />
                VENDOR WORKSPACE
              </span>

              <h1>Welcome back, {firstName}!</h1>

              <p>
                Manage your company information and track your vendor
                application from one place.
              </p>
            </div>

            <div
              className={`vendor-welcome-status ${currentStatus.className}`}
            >
              <StatusIcon size={19} />
              <span>{currentStatus.label}</span>
            </div>
          </section>

          {/* Overview cards */}
          <section className="vendor-overview-grid">
            <article className="vendor-overview-card">
              <div className="vendor-overview-icon blue">
                <ClipboardCheck size={21} />
              </div>
              <span className="vendor-overview-label">
                Application Status
              </span>
              <strong>{currentStatus.label}</strong>
              <small>
                {profileSubmitted
                  ? "Profile submitted"
                  : "Submission required"}
              </small>
            </article>

            <article className="vendor-overview-card">
              <div className="vendor-overview-icon purple">
                <Building2 size={21} />
              </div>
              <span className="vendor-overview-label">Company Profile</span>
              <strong>
                {isApproved
                  ? "Approved"
                  : status === "changes_requested"
                    ? "Changes Needed"
                    : isRejected
                      ? "Rejected"
                      : isUnderReview
                        ? "Under Review"
                        : profileSubmitted
                          ? "Submitted"
                          : "Incomplete"}
              </strong>
              <small>{companyName}</small>
            </article>

            <article className="vendor-overview-card">
              <div className="vendor-overview-icon green">
                <Mail size={21} />
              </div>
              <span className="vendor-overview-label">Account Email</span>
              <strong className="vendor-email-value">
                {user.email || "Not available"}
              </strong>
              <small>Registered account</small>
            </article>

            <article className="vendor-overview-card">
              <div className="vendor-overview-icon orange">
                <FileText size={21} />
              </div>
              <span className="vendor-overview-label">Next Step</span>
              <strong>{currentStatus.nextStep}</strong>
              <small>{currentStatus.nextStepDescription}</small>
            </article>
          </section>

          {/* Main content */}
          <section className="vendor-dashboard-content-grid">
            <article className="vendor-dashboard-panel vendor-application-panel">
              <div className="vendor-panel-heading">
                <div>
                  <span className="vendor-panel-kicker">APPLICATION</span>
                  <h2>Application Overview</h2>
                </div>

                <span
                  className={`vendor-status-icon ${currentStatus.className}`}
                >
                  <StatusIcon size={21} />
                </span>
              </div>

              <div
                className={`vendor-application-banner ${currentStatus.className}`}
              >
                <strong>{currentStatus.label}</strong>
                <p>{currentStatus.description}</p>
              </div>

              {/* Progress tracker */}
              <div className="vendor-progress-list">
                {progressSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className={[
                      "vendor-progress-step",
                      step.complete ? "complete" : "",
                      step.current ? "current" : "",
                      step.rejected ? "rejected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="vendor-progress-marker">
                      {step.complete ? (
                        <CheckCircle2 size={18} />
                      ) : step.rejected ? (
                        <AlertCircle size={18} />
                      ) : index === 1 ? (
                        <Building2 size={18} />
                      ) : (
                        <Clock3 size={18} />
                      )}
                    </span>

                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin feedback */}
              {needsAdminAttention && adminNote && (
                <div className="vendor-admin-feedback">
                  <div className="vendor-admin-feedback-heading">
                    <MessageSquareText size={19} />
                    <strong>Administrator Feedback</strong>
                  </div>

                  <p>{adminNote}</p>
                </div>
              )}

              {needsAdminAttention && !adminNote && (
                <div className="vendor-admin-feedback">
                  <div className="vendor-admin-feedback-heading">
                    <AlertCircle size={19} />
                    <strong>Administrator Feedback</strong>
                  </div>

                  <p>
                    {isRejected
                      ? "Please contact the administrator for more information about this decision."
                      : "The administrator has requested changes. Please review your profile."}
                  </p>
                </div>
              )}

              {/* Vendor ID after approval */}
              {isApproved && vendorId && (
                <div className="vendor-approved-details">
                  <CheckCircle2 size={19} />
                  <div>
                    <strong>Vendor account created</strong>
                    <p>Your approved vendor ID is #{vendorId}.</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {canEditProfile && (
                <Link
                  to="/vendor/profile"
                  className="vendor-primary-action"
                >
                  {profileActionLabel}
                  <ArrowRight size={17} />
                </Link>
              )}

              {!canEditProfile && (
                <Link
                  to="/vendor/profile"
                  className="vendor-secondary-action"
                >
                  View Company Profile
                  <ArrowRight size={17} />
                </Link>
              )}
            </article>

            {/* Account information */}
            <aside className="vendor-dashboard-panel vendor-quick-panel">
              <span className="vendor-panel-kicker">YOUR ACCOUNT</span>
              <h2>Account Information</h2>

              <div className="vendor-account-row">
                <span className="vendor-account-row-icon">
                  <Mail size={18} />
                </span>
                <div>
                  <small>Login email</small>
                  <strong>{user.email || "—"}</strong>
                </div>
              </div>

              <div className="vendor-account-row">
                <span className="vendor-account-row-icon">
                  <Building2 size={18} />
                </span>
                <div>
                  <small>Company</small>
                  <strong>{companyName}</strong>
                </div>
              </div>

              <div className="vendor-account-row">
                <span className="vendor-account-row-icon">
                  <ClipboardCheck size={18} />
                </span>
                <div>
                  <small>Application status</small>
                  <strong
                    className={`vendor-inline-status ${currentStatus.className}`}
                  >
                    {currentStatus.label}
                  </strong>
                </div>
              </div>

              {isApproved && vendorId && (
                <div className="vendor-account-row">
                  <span className="vendor-account-row-icon">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <small>Vendor ID</small>
                    <strong>#{vendorId}</strong>
                  </div>
                </div>
              )}

              <div className="vendor-help-note">
                <ShieldCheck size={19} />
                <p>
                  Keep your company and invoicing details accurate so your
                  vendor account information remains up to date.
                </p>
              </div>
            </aside>
          </section>
          
          {/* Assigned Projects */}
          {isApproved && (
            <section className="vendor-dashboard-panel vendor-projects-panel">
              <div className="vendor-panel-heading">
                <div>
                  <span className="vendor-panel-kicker">WORKSPACE</span>
                  <h2>Assigned Projects</h2>
                  <p>Review projects assigned to your vendor account.</p>
                </div>
                <span className="vendor-status-icon">
                  <ClipboardCheck size={21} />
                </span>
              </div>

              {projectsLoading ? (
                <p>Loading assigned projects...</p>
              ) : projects.length === 0 ? (
                <p>No projects have been assigned to your account yet.</p>
              ) : (
                <div className="vendor-projects-list">
                  {projects.map((assignment) => (
                    <article
                      className="vendor-project-card"
                      key={assignment.id}
                    >
                      <div>
                        <h3>{assignment.project.name}</h3>
                        <p>
                          {assignment.project.study_type || "Study"} ·{" "}
                          {assignment.project.country || "Country not specified"}
                        </p>
                      </div>

                      <div className="vendor-project-details">
                        <span><strong>Target:</strong> {assignment.target ?? "—"}</span>
                        <span><strong>CPC:</strong> {assignment.vendor_cpc ?? "—"}</span>
                        <span>
                          <strong>Response:</strong>{" "}
                          <span
                            className={`vendor-project-response-status ${
                              assignment.response_status || "pending"
                            }`}
                          >
                            {assignment.response_status === "clarification_requested"
                              ? "Changes requested"
                              : assignment.response_status === "accepted"
                              ? "Accepted"
                              : assignment.response_status === "declined"
                              ? "Declined"
                              : "Awaiting response"}
                          </span>
                        </span>
                      </div>

                      <button
                        type="button"
                        className="vendor-project-messages"
                        onClick={() => handleOpenMessages(assignment)}
                      >
                        <MessageSquare size={16} />
                        Messages

                        {assignment.unread_messages_count > 0 && (
                          <span className="vendor-unread-badge">
                            {assignment.unread_messages_count}
                          </span>
                        )}
                      </button>

                      {assignment.response_status === "pending" ||
                      assignment.response_status === "clarification_requested" ? (
                        <div className="vendor-project-actions">
                          <button
                            type="button"
                            className="vendor-project-accept"
                            disabled={respondingId === assignment.id}
                            onClick={() =>
                              handleProjectResponse(assignment.id, "accept")
                            }
                          >
                            {respondingId === assignment.id ? "Submitting..." : "Accept"}
                          </button>

                          <button
                            type="button"
                            className="vendor-project-decline"
                            disabled={respondingId === assignment.id}
                            onClick={() => {
                              const reason = window.prompt("Please enter a reason for declining:");
                              if (reason?.trim()) {
                                handleProjectResponse(assignment.id, "decline", reason.trim());
                              }
                            }}
                          >
                            Decline
                          </button>

                          <button
                            type="button"
                            className="vendor-project-clarify"
                            disabled={respondingId === assignment.id}
                            onClick={() => {
                              const message = window.prompt("What would you like clarified?");
                              if (message?.trim()) {
                                handleProjectResponse(
                                  assignment.id,
                                  "clarification",
                                  message.trim()
                                );
                              }
                            }}
                          >
                            Request Clarification
                          </button>
                        </div>
                      ) : (
                        <p className="vendor-project-response-message">
                          {assignment.response_status === "accepted"
                            ? "You accepted this project."
                            : assignment.response_status === "declined"
                              ? "You declined this project."
                              : "Your response has been recorded."}
                        </p>
                      )}

                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {messageAssignment && (
          <div className="vendor-messages-overlay">
            <section
              className="vendor-messages-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="vendor-messages-title"
            >
              <div className="vendor-messages-header">
                <div>
                  <h2 id="vendor-messages-title">Project Messages</h2>
                  <p>{messageAssignment.project?.name}</p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseMessages}
                  aria-label="Close messages"
                >
                  ×
                </button>
              </div>

              <div className="vendor-messages-list">
                {messagesLoading ? (
                  <p>Loading messages...</p>
                ) : projectMessages.length === 0 ? (
                  <p>No messages yet. Start the conversation below.</p>
                ) : (
                  projectMessages.map((item) => (
                    <div
                      key={item.id}
                      className={`vendor-message-bubble ${
                        item.sender_type === "vendor" ? "vendor-message-own" : "vendor-message-admin"
                      }`}
                    >
                      <strong>
                        {item.sender_type === "vendor" ? "You" : "Administrator"}
                      </strong>

                      <p>{item.message}</p>

                      <small>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : ""}
                      </small>

                      <span
                        className={`vendor-message-type-label ${
                          item.sender_type === "admin"
                            ? "admin-response"
                            : item.message_type === "clarification"
                            ? "clarification"
                            : item.message_type === "response"
                            ? "declined"
                            : "general"
                        }`}
                      >
                        {item.sender_type === "admin"
                          ? "Administrator message"
                          : item.message_type === "clarification"
                          ? "Changes requested"
                          : item.message_type === "response"
                          ? "Declined"
                          : "General message"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <form
                className="vendor-messages-form"
                onSubmit={handleSendProjectMessage}
              >
                <textarea
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  placeholder="Write a message to the administrator..."
                  rows={3}
                  disabled={messageSending}
                />

                <button
                  type="submit"
                  disabled={messageSending || !messageDraft.trim()}
                >
                  {messageSending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </section>
          </div>
        )}

          <footer className="vendor-dashboard-footer">
            <span>PanelSphere Vendor Portal</span>
            <Link to="/vendor/profile">Company Profile</Link>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default VendorDashboard;