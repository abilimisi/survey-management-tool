
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getVendorProfile,
  getVendorProjects,
  respondToVendorProject,
  getVendorProjectMessages,
  sendVendorProjectMessage,
} from "../../api/vendorPortalApi";

import {
  Search,
  ClipboardCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  MessageSquare,
  RefreshCw,
  Send,
  AlertCircle,
  FolderOpen,
} from "lucide-react";

import VendorSidebar from "./VendorSidebar";
import "./VendorDashboard.css";
import "./VendorMyProjects.css";

const FILTERS = [
  { value: "all", label: "All projects" },
  { value: "pending", label: "Awaiting response" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  {
    value: "clarification_requested",
    label: "Clarification requested",
  },
];

const getResponseStatus = (assignment) =>
  (assignment?.response_status || "pending").toLowerCase();

const getStatusLabel = (status) => {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    case "clarification_requested":
      return "Clarification requested";
    default:
      return "Awaiting response";
  }
};

function VendorMyProjects() {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useOutletContext();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [respondingId, setRespondingId] = useState(null);

  const [messageAssignment, setMessageAssignment] = useState(null);
  const [projectMessages, setProjectMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageSending, setMessageSending] = useState(false);

  const loadProjects = useCallback(
    async ({ showSpinner = false } = {}) => {
      if (showSpinner) {
        setRefreshing(true);
      }

      try {
        const response = await getVendorProjects();

        setProjects(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (error) {
        toast.error(
          error.response?.data?.detail ||
            error.response?.data?.error ||
            "Unable to load your assigned projects."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Load vendor profile and assigned projects.
  useEffect(() => {
    let cancelled = false;

    const initialise = async () => {
      if (!localStorage.getItem("vendor_portal_access_token")) {
        navigate("/vendor/login", { replace: true });
        return;
      }

      try {
        const response = await getVendorProfile();

        if (cancelled) return;

        setProfile(response.data);

        const applicationStatus = (
          response.data?.user?.application_status || "draft"
        ).toLowerCase();

        if (applicationStatus !== "approved") {
          toast.info(
            "Project assignments are available after vendor approval."
          );

          navigate("/vendor/dashboard", { replace: true });
          return;
        }

        const projectsResponse = await getVendorProjects();

        if (!cancelled) {
          setProjects(
            Array.isArray(projectsResponse.data)
              ? projectsResponse.data
              : []
          );
        }
      } catch (error) {
        if (cancelled) return;

        if ([401, 403].includes(error.response?.status)) {
          localStorage.removeItem("vendor_portal_access_token");

          toast.error("Please log in again.");

          navigate("/vendor/login", { replace: true });
        } else {
          toast.error(
            error.response?.data?.detail ||
              error.response?.data?.error ||
              "Unable to load your projects."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initialise();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Keep project assignments refreshed.
  useEffect(() => {
    if (
      profile?.user?.application_status?.toLowerCase() !== "approved"
    ) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadProjects();
    }, 12000);

    return () => window.clearInterval(intervalId);
  }, [profile?.user?.application_status, loadProjects]);

  const unreadMessagesCount = projects.reduce(
    (total, item) =>
      total + (Number(item.unread_messages_count) || 0),
    0
  );

  const counts = useMemo(() => {
    return projects.reduce(
      (result, assignment) => {
        const status = getResponseStatus(assignment);

        result.total += 1;

        if (status === "accepted") {
          result.accepted += 1;
        } else if (status === "declined") {
          result.declined += 1;
        } else if (status === "clarification_requested") {
          result.clarification += 1;
        } else {
          result.pending += 1;
        }

        return result;
      },
      {
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
        clarification: 0,
      }
    );
  }, [projects]);

  // Search and filter projects.
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((assignment) => {
      const status = getResponseStatus(assignment);
      const project = assignment.project || {};

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "pending" &&
          ![
            "accepted",
            "declined",
            "clarification_requested",
          ].includes(status)) ||
        status === activeFilter;

      const searchableText = [
        project.name,
        project.study_type,
        project.country,
        project.external_reference,
        project.reference,
        assignment.id,
      ]
        .filter(
          (value) => value !== null && value !== undefined
        )
        .join(" ")
        .toLowerCase();

      return (
        matchesFilter &&
        (!query || searchableText.includes(query))
      );
    });
  }, [projects, search, activeFilter]);

  // Accept, decline, or request clarification.
  const handleProjectResponse = async (
    assignmentId,
    action,
    message = ""
  ) => {
    if (respondingId !== null) return;

    if (
      action === "decline" &&
      !window.confirm(
        "Are you sure you want to decline this project?"
      )
    ) {
      return;
    }

    setRespondingId(assignmentId);

    try {
      const response = await respondToVendorProject(
        assignmentId,
        {
          action,
          ...(message ? { message } : {}),
          ...(action === "decline" ? { reason: message } : {}),
        }
      );

      setProjects((current) =>
        current.map((assignment) =>
          assignment.id === assignmentId
            ? response.data.assignment
            : assignment
        )
      );

      toast.success(
        response.data.message || "Your response was submitted."
      );
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

  // Open project messages.
  const handleOpenMessages = async (assignment) => {
    setMessageAssignment(assignment);
    setProjectMessages([]);
    setMessageDraft("");
    setMessagesLoading(true);

    setProjects((current) =>
      current.map((item) =>
        item.id === assignment.id
          ? { ...item, unread_messages_count: 0 }
          : item
      )
    );

    try {
      const response = await getVendorProjectMessages(
        assignment.id
      );

      setProjectMessages(
        Array.isArray(response.data) ? response.data : []
      );
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

  // Send project message.
  const handleSendProjectMessage = async (event) => {
    event.preventDefault();

    const message = messageDraft.trim();

    if (!message || !messageAssignment || messageSending) {
      return;
    }

    setMessageSending(true);

    try {
      const response = await sendVendorProjectMessage(
        messageAssignment.id,
        message
      );

      setProjectMessages((current) => [
        ...current,
        response.data,
      ]);

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

  const closeMessages = () => {
    setMessageAssignment(null);
    setProjectMessages([]);
    setMessageDraft("");
  };

  const user = profile?.user || {};
  const isApproved =
    user.application_status?.toLowerCase() === "approved";

  // Keep the same sidebar and main-content structure while loading.
  if (loading) {
    return (
      <div className="vendor-portal-page vendor-dashboard-page vendor-my-projects-page">
        <div className="vendor-dashboard-shell">
          <div className="vendor-dashboard-layout">
            <VendorSidebar
              sidebarCollapsed={sidebarCollapsed}
              toggleSidebar={toggleSidebar}
              isApproved={isApproved}
              unreadMessagesCount={unreadMessagesCount}
            />

            <main className="vendor-dashboard-main vendor-my-projects-main">
              <div className="vendor-my-projects-loading">
                <div className="vendor-loading-spinner" />
                <p>Loading your projects...</p>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-portal-page vendor-dashboard-page vendor-my-projects-page">
      <div className="vendor-dashboard-shell">
        <div className="vendor-dashboard-layout">
          <VendorSidebar
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            isApproved={isApproved}
            unreadMessagesCount={unreadMessagesCount}
          />

          <main className="vendor-dashboard-main vendor-my-projects-main">
            {/* Page heading */}
            <div className="vendor-my-projects-topline">
              <div>
                <span className="vendor-my-projects-kicker">
                  VENDOR WORKSPACE
                </span>

                <h1>My Projects</h1>

                <p>
                  Review your assignments, respond to opportunities
                  and communicate with the Opinion Bunch team.
                </p>
              </div>

              <button
                type="button"
                className="vendor-my-projects-refresh"
                onClick={() =>
                  loadProjects({ showSpinner: true })
                }
                disabled={refreshing}
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "is-spinning" : ""}
                />

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {/* Summary cards */}
            <section className="vendor-my-projects-summary">
              <article className="vendor-my-projects-stat">
                <span className="vendor-my-projects-stat-icon total">
                  <FolderOpen size={20} />
                </span>

                <div>
                  <small>Total projects</small>
                  <strong>{counts.total}</strong>
                </div>
              </article>

              <article className="vendor-my-projects-stat">
                <span className="vendor-my-projects-stat-icon pending">
                  <Clock3 size={20} />
                </span>

                <div>
                  <small>Awaiting response</small>
                  <strong>
                    {counts.pending + counts.clarification}
                  </strong>
                </div>
              </article>

              <article className="vendor-my-projects-stat">
                <span className="vendor-my-projects-stat-icon accepted">
                  <CheckCircle2 size={20} />
                </span>

                <div>
                  <small>Accepted</small>
                  <strong>{counts.accepted}</strong>
                </div>
              </article>

              <article className="vendor-my-projects-stat">
                <span className="vendor-my-projects-stat-icon messages">
                  <MessageSquare size={20} />
                </span>

                <div>
                  <small>Unread messages</small>
                  <strong>{unreadMessagesCount}</strong>
                </div>
              </article>
            </section>

            {/* Assigned projects */}
            <section className="vendor-my-projects-panel">
              <div className="vendor-my-projects-panel-heading">
                <div>
                  <h2>Assigned projects</h2>

                  <p>
                    {filteredProjects.length} of {projects.length} projects
                    shown
                  </p>
                </div>
              </div>

              {/* Search and filters */}
              <div className="vendor-my-projects-toolbar">
                <label className="vendor-my-projects-search">
                  <Search size={18} />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search project name, country or reference..."
                    aria-label="Search projects"
                  />
                </label>

                <div
                  className="vendor-my-projects-filters"
                  role="group"
                  aria-label="Filter projects"
                >
                  {FILTERS.map((filter) => (
                    <button
                      type="button"
                      key={filter.value}
                      className={
                        activeFilter === filter.value
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveFilter(filter.value)
                      }
                    >
                      {filter.label}

                      {filter.value === "all" && (
                        <span>{counts.total}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Empty states */}
              {projects.length === 0 ? (
                <div className="vendor-my-projects-empty">
                  <span>
                    <ClipboardCheck size={28} />
                  </span>

                  <h3>No projects assigned yet</h3>

                  <p>
                    When the Opinion Bunch team assigns a project
                    to your vendor account, it will appear here.
                  </p>

                  <Link to="/vendor/dashboard">
                    Return to dashboard
                  </Link>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="vendor-my-projects-empty compact">
                  <span>
                    <Search size={25} />
                  </span>

                  <h3>No matching projects</h3>

                  <p>
                    Try another search term or choose a different
                    filter.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveFilter("all");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="vendor-my-projects-list">
                  {filteredProjects.map((assignment) => {
                    const project = assignment.project || {};
                    const responseStatus =
                      getResponseStatus(assignment);

                    const isPending = [
                      "pending",
                      "clarification_requested",
                    ].includes(responseStatus);

                    return (
                      <article
                        className="vendor-my-project-card"
                        key={assignment.id}
                      >
                        <div className="vendor-my-project-card-top">
                          <div className="vendor-my-project-title">
                            <span className="vendor-my-project-icon">
                              <ClipboardCheck size={19} />
                            </span>

                            <div>
                              <h3>{project.name || "Project"}</h3>

                              <p>
                                {project.study_type || "Study"}
                                {project.country
                                  ? ` · ${project.country}`
                                  : ""}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`vendor-my-project-status ${responseStatus}`}
                          >
                            {responseStatus === "accepted" && (
                              <CheckCircle2 size={14} />
                            )}

                            {responseStatus === "declined" && (
                              <XCircle size={14} />
                            )}

                            {isPending && <Clock3 size={14} />}

                            {getStatusLabel(responseStatus)}
                          </span>
                        </div>

                        {/* Project details */}
                        <div className="vendor-my-project-meta">
                          <div>
                            <span>Project reference</span>

                            <strong>
                              {project.external_reference ||
                                project.reference ||
                                project.project_reference ||
                                "—"}
                            </strong>
                          </div>

                          <div>
                            <span>Target</span>
                            <strong>
                              {assignment.target ?? "—"}
                            </strong>
                          </div>

                          <div>
                            <span>Vendor CPC</span>

                            <strong>
                              {assignment.vendor_cpc === null ||
                              assignment.vendor_cpc === undefined
                                ? "—"
                                : assignment.vendor_cpc}
                            </strong>
                          </div>

                          <div>
                            <span>Country</span>
                            <strong>{project.country || "—"}</strong>
                          </div>
                        </div>

                        {responseStatus ===
                          "clarification_requested" && (
                          <div className="vendor-my-project-notice">
                            <AlertCircle size={16} />

                            <span>
                              Clarification has been requested.
                              Review the conversation and respond
                              when ready.
                            </span>
                          </div>
                        )}

                        {/* Project actions */}
                        <div className="vendor-my-project-actions">
                          <button
                            type="button"
                            className="vendor-my-project-message-button"
                            onClick={() =>
                              handleOpenMessages(assignment)
                            }
                          >
                            <MessageSquare size={16} />
                            Messages

                            {assignment.unread_messages_count > 0 && (
                              <span className="vendor-my-project-unread">
                                {assignment.unread_messages_count}
                              </span>
                            )}
                          </button>

                          {isPending ? (
                            <>
                              <button
                                type="button"
                                className="vendor-my-project-accept"
                                disabled={
                                  respondingId === assignment.id
                                }
                                onClick={() =>
                                  handleProjectResponse(
                                    assignment.id,
                                    "accept"
                                  )
                                }
                              >
                                {respondingId === assignment.id
                                  ? "Submitting..."
                                  : "Accept project"}
                              </button>

                              <button
                                type="button"
                                className="vendor-my-project-decline"
                                disabled={
                                  respondingId === assignment.id
                                }
                                onClick={() => {
                                  const reason = window.prompt(
                                    "Please enter a reason for declining:"
                                  );

                                  if (reason?.trim()) {
                                    handleProjectResponse(
                                      assignment.id,
                                      "decline",
                                      reason.trim()
                                    );
                                  }
                                }}
                              >
                                Decline
                              </button>

                              <button
                                type="button"
                                className="vendor-my-project-clarify"
                                disabled={
                                  respondingId === assignment.id
                                }
                                onClick={() => {
                                  const message = window.prompt(
                                    "What would you like clarified?"
                                  );

                                  if (message?.trim()) {
                                    handleProjectResponse(
                                      assignment.id,
                                      "clarification",
                                      message.trim()
                                    );
                                  }
                                }}
                              >
                                Request clarification
                              </button>
                            </>
                          ) : (
                            <span className="vendor-my-project-recorded">
                              {responseStatus === "accepted"
                                ? "Your acceptance has been recorded."
                                : responseStatus === "declined"
                                  ? "Your decline has been recorded."
                                  : "Your response has been recorded."}
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className="vendor-my-projects-footer">
              <span>PanelSphere Vendor Portal</span>

              <Link to="/vendor/company-profile">
                Company Profile
              </Link>
            </footer>
          </main>
        </div>
      </div>

      {/* Project messages modal */}
      {messageAssignment && (
        <div className="vendor-messages-overlay">
          <section
            className="vendor-messages-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vendor-my-project-messages-title"
          >
            <div className="vendor-messages-header">
              <div>
                <h2 id="vendor-my-project-messages-title">
                  Project Messages
                </h2>

                <p>
                  {messageAssignment.project?.name || "Project"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeMessages}
                aria-label="Close messages"
              >
                ×
              </button>
            </div>

            <div className="vendor-messages-list">
              {messagesLoading ? (
                <p>Loading messages...</p>
              ) : projectMessages.length === 0 ? (
                <p>
                  No messages yet. Start the conversation below.
                </p>
              ) : (
                projectMessages.map((item) => (
                  <div
                    key={item.id}
                    className={`vendor-message-bubble ${
                      item.sender_type === "vendor"
                        ? "vendor-message-own"
                        : "vendor-message-admin"
                    }`}
                  >
                    <strong>
                      {item.sender_type === "vendor"
                        ? "You"
                        : "Administrator"}
                    </strong>

                    <p>{item.message}</p>

                    <small>
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleString()
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
                onChange={(event) =>
                  setMessageDraft(event.target.value)
                }
                placeholder="Write a message to the administrator..."
                rows={3}
                disabled={messageSending}
              />

              <button
                type="submit"
                disabled={
                  messageSending || !messageDraft.trim()
                }
              >
                <Send size={15} />

                {messageSending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default VendorMyProjects;
