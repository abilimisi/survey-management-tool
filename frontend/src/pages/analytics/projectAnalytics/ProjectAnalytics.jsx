import { useEffect, useState } from "react";

import {
  getProjectList,
  getAnalyticsProjectDetails,
} from "../../../api/analyticsApi";

import ProjectFilter from "./ProjectFilter";
import ProjectSummaryCards from "./ProjectSummaryCards";
import ProjectSummary from "./ProjectSummary";
import "./ProjectAnalytics.css";

export default function ProjectAnalytics() {

  const [projects, setProjects] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");

  const [projectData, setProjectData] = useState(null);

  const [loading, setLoading] = useState(true);

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

    const data = await getAnalyticsProjectDetails(id);

    setProjectData(data);

  };

  if (loading) {

    return <div>Loading...</div>;

  }

  return (

    <div className="project-analytics">

      <div className="analytics-page-header">

        <h2>Project Analytics</h2>

        <p>

          Monitor individual project performance and respondent activity.

        </p>

      </div>

      <ProjectFilter

        projects={projects}

        selectedProject={selectedProject}

        onChange={setSelectedProject}

      />

      {projectData && (
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
        </>
      )}

    </div>

  );

}