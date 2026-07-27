import {
  Globe,
  Building2,
  Target,
  Clock3,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

import "./ProjectSummary.css";

export default function ProjectSummary({ project }) {
  if (!project) return null;

  return (
    <div className="project-summary">

      {/* Left Side */}

      <div className="project-info">

        <h2>{project.name}</h2>

        <div className="project-meta">

          <div className="meta-item">
            <Building2 size={18} />
            <span>{project.client}</span>
          </div>

          <div className="meta-item">
            <Globe size={18} />
            <span>{project.country}</span>
          </div>

          <div className="meta-item">
            <Clock3 size={18} />
            <span>LOI : {project.loi} mins</span>
          </div>

          <div className="meta-item">
            <Target size={18} />
            <span>Target : {project.target}</span>
          </div>

        </div>
      </div>

      {/* Right Side */}

      <div className="project-status">

        <div
          className={`status-badge ${project.status}`}
        >
          <PlayCircle size={16} />
          {project.status}
        </div>

        <div className="completion-box">

          <CheckCircle2 size={18} />

          <div>

            <small>Completion Rate</small>

            <h3>{project.ir}%</h3>

          </div>

        </div>

      </div>

    </div>
  );
}