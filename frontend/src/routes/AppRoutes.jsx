import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

import { isAdmin } from "../pages/utils/auth";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import ClientsList from "../pages/clients/ClientsList";
import AddClient from "../pages/clients/AddClient";
import EditClient from "../pages/clients/EditClient";

import VendorsList from "../pages/vendors/VendorsList";
import AddVendor from "../pages/vendors/AddVendor";
import EditVendor from "../pages/vendors/EditVendor";

import ProjectsList from "../pages/projects/ProjectsList";
import AddProject from "../pages/projects/AddProject";
import EditProject from "../pages/projects/EditProject";

import ProjectDetails from "../pages/projectvendor/ProjectDetails";
import SupplierHints from "../pages/suppliers/SupplierHints";
import RedirectJourney from "../pages/respondents/RedirectJourney";
import Reports from "../pages/reports/Reports";

import Panelists from "../pages/panelists/Panelists";

import CompanyContactsList from "../pages/companycontacts/CompanyContactsList";
import AddCompanyContact from "../pages/companycontacts/AddCompanyContact";
import EditCompanyContact from "../pages/companycontacts/EditCompanyContact";

import UsersList from "../pages/users/UsersList";

import ScreeningQuestions from "../pages/screening/ScreeningQuestions";
import ScreeningSurvey from "../pages/screening/ScreeningSurvey";

import CampaignList from "../pages/panel/CampaignList";
import CreateCampaign from "../pages/panel/CreateCampaign";
// import CampaignDetail from "../pages/panel/CampaignDetail";
import EditCampaign from "../pages/panel/EditCampaign";
import CampaignRecipients from "../pages/panel/CampaignRecipients";
import CampaignStats from "../pages/panel/CampaignStats";
import CampaignSurveyLinks from "../pages/panel/CampaignSurveyLinks";
import CampaignDashboard from "../pages/panel/CampaignDashboard";
import CampaignRespondents from "../pages/panel/CampaignRespondents";
// import RedirectJourney from "../pages/panel/RedirectJourney";
import EmailTemplate from "../pages/EmailTemplates/EmailTemplate";

import AnalyticsDashboard from "../pages/analytics/AnalyticsDashboard";
import ProjectAnalytics from "../pages/analytics/projectAnalytics/ProjectAnalytics";
import VendorAnalytics from "../pages/analytics/vendorAnalytics/VendorAnalytics";

// DIY
import DIYDashboard from "../pages/diy/DIYDashboard";
// DIY
import DIYCreateStudy from "../pages/diy/CreateStudy";

// Client portal
import ClientCreateStudy from "../pages/clientPortal/CreateStudy";
import ClientLogin from "../pages/clientPortal/ClientLogin";
import ClientDashboard from "../pages/clientPortal/ClientDashboard";
import ClientRegister from "../pages/clientPortal/ClientRegister";
import ClientStudyDetails from "../pages/clientPortal/ClientStudyDetails";
import ClientPortalLayout from "../components/clientPortal/ClientPortalLayout";
import ClientAllStudies from "../pages/clientPortal/ClientAllStudies";
import ClientCompanyProfile from "../pages/clientPortal/ClientCompanyProfile";
import ClientStudyResponses from "../pages/clientPortal/ClientStudyResponses";

import ClientVerifyEmail from "../pages/clientPortal/ClientVerifyEmail";
import ClientForgotPassword from "../pages/clientPortal/ClientForgotPassword";
import ClientResetPassword from "../pages/clientPortal/ClientResetPassword";

import DIYStudyReview from "../pages/diy/DIYStudyReview";
import DIYAllStudies from "../pages/diy/DIYAllStudies";
import DIYStudyDetails from "../pages/diy/DIYStudyDetails";
import DIYStudyAssessment from "../pages/diy/DIYStudyAssessment";
import DIYStudyQuotation from "../pages/diy/DIYStudyQuotation";

import VendorLayout from "../components/vendorPortal/VendorLayout";
import VendorRegister from "../pages/vendorPortal/VendorRegister";
import VendorLogin from "../pages/vendorPortal/VendorLogin";
import VendorDashboard from "../pages/vendorPortal/VendorDashboard";
import VendorProfile from "../pages/vendorPortal/VendorProfile";
import VendorApplications from "../pages/vendors/VendorApplications";
import CompanyProfileView from "../pages/vendorPortal/CompanyProfileView";
import VendorMyProjects from "../pages/vendorPortal/VendorMyProjects";
import VendorVerifyEmail from "../pages/vendorPortal/VendorVerifyEmail";
import VendorForgotPassword from "../pages/vendorPortal/VendorForgotPassword";
import VendorResetPassword from "../pages/vendorPortal/VendorResetPassword";

import SessionHeartbeat from "../components/SessionHeartbeat";

import RegisteredClients from "../pages/admin/RegisteredClients";
import RegisteredVendors from "../pages/admin/RegisteredVendors";

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <>
        <SessionHeartbeat />
        <MainLayout>{children}</MainLayout>
      </>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedLayout>
            <ClientsList />
          </ProtectedLayout>
        }
      />

      <Route
        path="/clients/add"
        element={
          <ProtectedLayout>
            <AddClient />
          </ProtectedLayout>
        }
      />

      <Route
        path="/clients/edit/:id"
        element={
          <ProtectedLayout>
            <EditClient />
          </ProtectedLayout>
        }
      />

      <Route
        path="/vendors"
        element={
          <ProtectedLayout>
            <VendorsList />
          </ProtectedLayout>
        }
      />

      <Route
        path="/vendors/add"
        element={
          <ProtectedLayout>
            <AddVendor />
          </ProtectedLayout>
        }
      />

      <Route
        path="/vendors/edit/:id"
        element={
          <ProtectedLayout>
            <EditVendor />
          </ProtectedLayout>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedLayout>
            <ProjectsList />
          </ProtectedLayout>
        }
      />

      <Route
        path="/projects/add"
        element={
          <ProtectedLayout>
            <AddProject />
          </ProtectedLayout>
        }
      />

      <Route
        path="/projects/edit/:id"
        element={
          <ProtectedLayout>
            <EditProject />
          </ProtectedLayout>
        }
      />

      <Route
        path="/projects/:id"
        element={
          <ProtectedLayout>
            <ProjectDetails />
          </ProtectedLayout>
        }
      />

      <Route
        path="/project-vendors/:projectVendorId/hints"
        element={
          <ProtectedLayout>
            <SupplierHints />
          </ProtectedLayout>
        }
      />

      <Route
        path="/respondents/:respondentId/journey"
        element={
          <ProtectedLayout>
            <RedirectJourney />
          </ProtectedLayout>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedLayout>
            <Reports />
          </ProtectedLayout>
        }
      />

      <Route
        path="/panelists"
        element={
          <ProtectedLayout>
            <Panelists />
          </ProtectedLayout>
        }
      />
      <Route
        path="/company-contacts"
        element={
          <ProtectedLayout>
            <CompanyContactsList />
          </ProtectedLayout>
        }
      />
      <Route
        path="/company-contacts/add"
        element={
          <ProtectedLayout>
            <AddCompanyContact />
          </ProtectedLayout>
        }
      />
      <Route
        path="/company-contacts/edit/:id"
        element={
          <ProtectedLayout>
            <EditCompanyContact />
          </ProtectedLayout>
        }
      />
      <Route
        path="/users"
        element={
          isAdmin() ? (
            <ProtectedLayout>
              <UsersList />
            </ProtectedLayout>
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      />
      <Route
          path="/projects/:projectId/questions"
          element={
            <ProtectedLayout>
              <ScreeningQuestions />
            </ProtectedLayout>
          }
      />
      <Route
          path="/screening/:respondentId"
          element={
              <ScreeningSurvey />
          }
      />

      <Route
          path="/panel-campaigns"
          element={ <ProtectedLayout><CampaignList /></ProtectedLayout>}
      />

      <Route
          path="/panel-campaigns/create"
          element={<ProtectedLayout><CreateCampaign /></ProtectedLayout>}
      />

      <Route
          path="/panel-campaigns/:id/edit"
          element={<ProtectedLayout><EditCampaign /></ProtectedLayout>}
      />

      <Route
          path="/panel-campaigns/:id/recipients"
          element={<ProtectedLayout><CampaignRecipients /></ProtectedLayout>}
      />

      <Route
          path="/panel-campaigns/:id/stats"
          element={<ProtectedLayout><CampaignStats /></ProtectedLayout>}
      />

      <Route
          path="/panel-campaigns/:id/survey-links"
          element={<ProtectedLayout><CampaignSurveyLinks /></ProtectedLayout>}
      />

      <Route
          path="/panel-campaigns/:id"
          element={<ProtectedLayout><CampaignDashboard /></ProtectedLayout>}
      />

      <Route
          path="/panel-campaigns/:id/respondents"
          element={
              <ProtectedLayout>
                  <CampaignRespondents/>
              </ProtectedLayout>
          }
      />

      <Route
          path="/analytics"
          element={<ProtectedLayout><AnalyticsDashboard /></ProtectedLayout>}
      />

      <Route
          path="/analytics/projects"
          element={<ProtectedLayout><ProjectAnalytics /></ProtectedLayout>}
      />

      <Route
          path="/analytics/vendors"
          element={<ProtectedLayout><VendorAnalytics /></ProtectedLayout>}
      />


     <Route
        path="/panel-campaigns/:id/email-template"
        element={
            <ProtectedLayout>
                <EmailTemplate />
            </ProtectedLayout>
        }
    />

    {/* DIY Routes */}
    <Route
        path="/diy"
        element={
          <ProtectedLayout>
            <DIYDashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/diy/studies/create"
        element={
          <ProtectedLayout>
            <DIYCreateStudy />
          </ProtectedLayout>
        }
      />

      <Route path="/client-portal/login" element={<ClientLogin />} />
      <Route path="/client-portal/register" element={<ClientRegister />} />

      <Route
        path="/client-portal/verify-email"
        element={<ClientVerifyEmail />}
      />

      <Route
        path="/client-portal/forgot-password"
        element={<ClientForgotPassword />}
      />

      <Route
        path="/client-portal/reset-password"
        element={<ClientResetPassword />}
      />

      <Route element={<ClientPortalLayout />}>
       <Route
          path="/client-portal/dashboard"
          element={<ClientDashboard />}
        />
        <Route
          path="/client-portal/company-profile"
          element={<ClientCompanyProfile />}
        />
        <Route
          path="/client-portal/studies"
          element={<ClientAllStudies  />}
        />
        <Route
          path="/client-portal/studies/:studyId"
          element={<ClientStudyDetails />}
        />
        <Route
          path="/client-portal/studies/:studyId/responses"
          element={<ClientStudyResponses />}
        />
        <Route
          path="/client-portal/create-study"
          element={<ClientCreateStudy />}
        />
      
      </Route>

      <Route
        path="/diy/reviews"
        element={
          <ProtectedLayout>
            <DIYStudyReview />
          </ProtectedLayout>
        }
      />

      <Route
        path="/diy/studies"
        element={
          <ProtectedLayout>
            <DIYAllStudies />
          </ProtectedLayout>
        }
      />

      <Route
        path="/diy/studies/:studyId"
        element={
          <ProtectedLayout>
            <DIYStudyDetails />
          </ProtectedLayout>
        }
      />

      <Route
        path="/diy/studies/:studyId/assessment"
        element={
          <ProtectedLayout>
            <DIYStudyAssessment />
          </ProtectedLayout>
        }
      />

      <Route
        path="/diy/studies/:studyId/quotation"
        element={
          <ProtectedLayout>
            <DIYStudyQuotation />
          </ProtectedLayout>
        }
      />

      
      <Route
        path="/vendor/register"
        element={<VendorRegister />}
      />

      <Route
        path="/vendor/login"
        element={<VendorLogin />}
      />

      <Route
        path="/vendor/verify-email"
        element={<VendorVerifyEmail />}
      />

      <Route
        path="/vendor/forgot-password"
        element={<VendorForgotPassword />}
      />

      <Route
        path="/vendor/reset-password"
        element={<VendorResetPassword />}
      />

      <Route path="/vendor" element={<VendorLayout />}>
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="projects" element={<VendorMyProjects />} />
        <Route path="profile" element={<VendorProfile />} />
        <Route path="company-profile" element={<CompanyProfileView />} />
      </Route>

      
      <Route
        path="/vendors/applications"
        element={
          isAdmin() ? (
            <ProtectedLayout>
              <VendorApplications />
            </ProtectedLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      <Route
        path="/clients/registered"
        element={
          <ProtectedLayout>
            <RegisteredClients />
          </ProtectedLayout>
        }
      />

      <Route
        path="/vendors/registered"
        element={
          <ProtectedLayout>
            <RegisteredVendors />
          </ProtectedLayout>
        }
      />



    </Routes>

    

    

  );
}

export default AppRoutes;