import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getProjects } from "../../api/projectApi";
import { getProjectVendorsByProject } from "../../api/panelCampaignApi";
import { INDUSTRIES } from "../../constants/industries";

import {
    getPanelCampaign,
    updatePanelCampaign
} from "../../api/panelCampaignApi";

import "./CampaignForm.css";

const EditCampaign = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [projectVendors, setProjectVendors] = useState([]);

    const [formData, setFormData] = useState({

        name: "",

        project: "",

        project_vendor: "",

        target: 100,

        status: "draft",

        country: "",

        gender: "",

        industry: [],

        notes: ""

    });

    useEffect(() => {

        loadProjects();
        loadCampaign();

    }, []);

    useEffect(() => {

        if (!formData.project) {

            setProjectVendors([]);

            return;

        }

        loadProjectVendors(formData.project);

    }, [formData.project]);

    const loadProjects = async () => {

        try {

            const data = await getProjects();

            setProjects(data);

        }

        catch (err) {

            console.error(err);

        }

    };

    const loadProjectVendors = async (projectId) => {

        try {

            const data = await getProjectVendorsByProject(projectId);

            setProjectVendors(data);

        }

        catch (err) {

            console.error(err);

        }

    };


    const loadCampaign = async () => {

        try {

            const data = await getPanelCampaign(id);

            setFormData({

                name: data.name,

                project: data.project,

                project_vendor: data.project_vendor,

                target: data.target,

                status: data.status,

                country: data.country || "",

                gender: data.gender || "",

                industry: data.industry || [],

                notes: data.notes || ""

            });
            
            loadProjectVendors(data.project);

        }

        catch (err) {

            console.error(err);

        }

    };

    const handleChange = (e) => {

        const { name, value, options } = e.target;

        if (name === "project") {

            setFormData({

                ...formData,

                project: value,

                project_vendor: ""

            });

            return;

        }

        if (name === "industry") {

            const values = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);

            setFormData({

                ...formData,

                industry: values

            });

            return;

        }

        setFormData({

            ...formData,

            [name]: value

        });

    };
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await updatePanelCampaign(id, formData);

            alert("Campaign Updated Successfully");

            navigate("/panel-campaigns");

        }

        catch (err) {

            console.error(err);

        }

    };

    return (

        <div className="campaign-form-page">

            <h2>Edit Campaign</h2>

            <form
                className="campaign-form"
                onSubmit={handleSubmit}
            >

                <div className="form-grid">

                    <div>

                        <label>Campaign Name</label>

                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />

                    </div>

                    <div>

                        <label>Project</label>

                        <select
                            name="project"
                            value={formData.project}
                            onChange={handleChange}
                        >

                            <option value="">Select</option>

                            {
                                projects.map((project) => (

                                    <option
                                        key={project.id}
                                        value={project.id}
                                    >

                                        {project.name}

                                    </option>

                                ))
                            }

                        </select>

                    </div>

                    <div>

                        <label>Project Vendor</label>

                        <select
                            name="project_vendor"
                            value={formData.project_vendor}
                            onChange={handleChange}
                        >

                            <option value="">Select</option>

                            {
                                projectVendors.map((vendor) => (

                                    <option
                                        key={vendor.id}
                                        value={vendor.id}
                                    >

                                        {vendor.vendor_name}

                                    </option>

                                ))
                            }

                        </select>

                    </div>

                    <div>

                        <label>Status</label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >

                            <option value="draft">Draft</option>

                            <option value="running">Running</option>

                            <option value="paused">Paused</option>

                            <option value="completed">Completed</option>

                        </select>

                    </div>

                    <div>

                        <label>Target</label>

                        <input
                            type="number"
                            name="target"
                            value={formData.target}
                            onChange={handleChange}
                        />

                    </div>

                    <div>

                        <label>Country</label>

                        <input
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                        />

                    </div>

                    <div>

                        <label>Gender</label>

                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >

                            <option value="">All</option>

                            <option value="Male">Male</option>

                            <option value="Female">Female</option>

                        </select>

                    </div>

                    <div>

                        <label>Industry</label>

                        <select
                            multiple
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                        >
                            {/* <small>

                            Hold Ctrl (Windows) or Cmd (Mac) to select multiple industries.

                            </small> */}

                            {

                                INDUSTRIES.map(industry => (

                                    <option
                                        key={industry}
                                        value={industry}
                                    >

                                        {industry}

                                    </option>

                                ))

                            }

                        </select>

                    </div>

                </div>

                <div>

                    <label>Notes</label>

                    <textarea
                        rows="5"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                    />

                </div>

                <button
                    className="primary-btn"
                    type="submit"
                >

                    Update Campaign

                </button>

            </form>

        </div>

    );

};

export default EditCampaign;