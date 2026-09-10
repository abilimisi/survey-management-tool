import { useEffect, useState } from "react";

import {
  getProjectList,
  getAnalyticsProjectDetails,
} from "../../../api/analyticsApi";

import ProjectFilter from "./ProjectFilter";
import ProjectSummaryCards from "./ProjectSummaryCards";
import ProjectSummary from "./ProjectSummary";

import ChartCard from "../ChartCard";
import StatusChart from "../StatusChart";
import HitsChart from "../HitsChart";
import SplitBarChart from "../SplitBarChart";

import "./ProjectAnalytics.css";

export default function ProjectAnalytics() {

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProject(selectedProject);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const data = await getProjectList();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async (id) => {
    setDetailLoading(true);
    try {
      const data = await getAnalyticsProjectDetails(id);
      setProjectData(data);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // vendor_split from backend -> [{ vendor_id, vendor_name, hits }]
  // SplitBarChart expects [{ name, value }]
  const vendorSplitData = (projectData?.vendor_split || []).map((v) => ({
    name: v.vendor_name,
    value: v.hits,
  }));

  return (
    <div className="project-analytics">
      <div className="analytics-page-header">
        <h2>Project Analytics</h2>
        <p>Monitor individual project performance and respondent activity.</p>
      </div>

      <ProjectFilter
        projects={projects}
        selectedProject={selectedProject}
        onChange={setSelectedProject}
      />

      {projectData && !detailLoading && (
        <>
          <ProjectSummary
            project={{
              ...projectData.project,
              ir: projectData.summary.ir,
            }}
          />

          <ProjectSummaryCards
            summary={projectData.summary}
            project={projectData.project}
          />

          {/* CHARTS — status donut + 7-day trend */}
          <div className="project-analytics-chart-grid">
            <ChartCard
              title="Status Distribution"
              subtitle="Respondent outcomes for this project"
            >
              <StatusChart
                data={projectData.status_breakdown}
                centerValue={projectData.summary.hits}
                centerLabel="Total Hits"
                height={280}
              />
            </ChartCard>

            <ChartCard
              title="Hits Trend"
              subtitle="Last 7 days"
              right={<span>{projectData.summary.hits} total</span>}
            >
              <HitsChart data={projectData.trend} height={280} />
            </ChartCard>
          </div>

          {/* Vendor split for this project */}
          <ChartCard
            title="Vendor Split"
            subtitle="Who is delivering this project"
          >
            <SplitBarChart data={vendorSplitData} />
          </ChartCard>
        </>
      )}

      {detailLoading && <div className="analytics-empty">Loading project data...</div>}
    </div>
  );
}
