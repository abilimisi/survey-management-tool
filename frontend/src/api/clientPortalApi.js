
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/";

const clientPortalApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Use only the external client's token.
// Do not read or refresh the internal employee token.
clientPortalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("client_portal_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const registerClient = (data) =>
  clientPortalApi.post("client-portal/register/", data);

export const loginClient = (data) =>
  clientPortalApi.post("client-portal/login/", data);

export const getClientProfile = () =>
  clientPortalApi.get("client-portal/me/");

export const getClientStudies = () =>
  clientPortalApi.get("diy/studies/");

export const getClientStudy = (studyId) =>
  clientPortalApi.get(`diy/studies/${studyId}/`);

export const createClientStudy = (data) =>
  clientPortalApi.post("diy/studies/", data);

export const submitClientStudy = (studyId) =>
  clientPortalApi.post(`diy/studies/${studyId}/submit/`);

export const updateClientStudy = (studyId, data) =>
  clientPortalApi.patch(`diy/studies/${studyId}/`, data);

// Client portal: get quotation history for a study
export const getClientStudyQuotations = (studyId) =>
  clientPortalApi.get(`diy/studies/${studyId}/quotations/`);

// Client portal: accept or decline a quotation
export const respondToClientQuotation = (
  studyId,
  quotationId,
  data
) =>
  clientPortalApi.post(
    `diy/studies/${studyId}/quotations/${quotationId}/respond/`,
    data
  );

// Client portal: submit or update survey URL after quotation acceptance
export const submitClientSurveyLink = (studyId, surveyLink) =>
  clientPortalApi.post(
    `diy/studies/${studyId}/survey-link/`,
    {
      confirmed_survey_link: surveyLink,
    }
  );

// Client portal: get all notifications and unread count
export const getClientNotifications = () =>
  clientPortalApi.get("diy/notifications/");

// Client portal: mark an individual notification as read
export const markClientNotificationAsRead = (notificationId) =>
  clientPortalApi.post(
    `diy/notifications/${notificationId}/read/`
  );

// Client portal: mark all notifications as read
export const markAllClientNotificationsAsRead = async () => {
  const response = await getClientNotifications();

  const unreadNotifications = response.data.notifications.filter(
    (notification) => !notification.is_read
  );

  await Promise.all(
    unreadNotifications.map((notification) =>
      markClientNotificationAsRead(notification.id)
    )
  );
};

export default clientPortalApi;
