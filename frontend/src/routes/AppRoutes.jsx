import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

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

import CompanyContactsList from "../pages/companycontacts/companycontactsList";
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


function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
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
          localStorage.getItem("is_superuser") === "true" ? (
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
{/* 
      <Route
          path="/panel-campaigns/:id"
          element={<ProtectedLayout><CampaignDetail /></ProtectedLayout>}
      /> */}

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


    </Routes>

    

    

  );
}

export default AppRoutes;