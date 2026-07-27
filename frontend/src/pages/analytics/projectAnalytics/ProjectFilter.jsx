export default function ProjectFilter({

  projects,

  selectedProject,

  onChange,

}) {

  return (

    <div className="project-filter-card">

      <div>

        <label>

          Select Project

        </label>

        <select

          value={selectedProject}

          onChange={(e) =>

            onChange(e.target.value)

          }

        >

          {projects.map(project => (

            <option

              key={project.id}

              value={project.id}

            >

              {project.name}

            </option>

          ))}

        </select>

      </div>

    </div>

  );

}