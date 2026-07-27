import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {
    getEmailTemplate,
    updateEmailTemplate
} from "../../api/panelCampaignApi";

import "./EmailTemplate.css";

const EmailTemplate = () => {

    const { id } = useParams();

    const [campaignName, setCampaignName] = useState("");

    const [subject, setSubject] = useState("");

    const [body, setBody] = useState("");

    const [loading, setLoading] = useState(true);

    // ADD THIS
    const loadTemplate = async () => {

        try {

            const data = await getEmailTemplate(id);

            setCampaignName(data.campaign_name);

            setSubject(data.subject);

            setBody(data.body);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    };
    useEffect(() => {

        loadTemplate();

    }, []);


    const handleSave = async () => {

        try {

            await updateEmailTemplate(id, {

                subject,
                body

            });

            alert("Email Template Updated Successfully");

        }

        catch (err) {

            console.error(err);

        }

    };

    const insertVariable = (variable) => {

        setBody((prev) => prev + "\n" + variable);

    };

    if (loading) {

        return <h2>Loading Email Template...</h2>;

    }



    return (

    <div className="email-template-page">

        <div className="email-header">

            <div>
                <h2>Email Template</h2>
                <p>Campaign : {campaignName}</p>
            </div>

            <button
                className="primary-btn"
                onClick={handleSave}
            >
                Save Template
            </button>

        </div>

        <div className="email-card">

            <label>Subject</label>

            <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />

            <label>Email Body</label>

            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
            />

        </div>

        <div className="variables-card">

            <h3>Available Variables</h3>

            <button
                className="variable-btn"
                onClick={() => insertVariable("{{first_name}}")}
            >
                First Name
            </button>

            <button
                className="variable-btn"
                onClick={() => insertVariable("{{survey_link}}")}
            >
                Survey Link
            </button>

            <button
                className="variable-btn"
                onClick={() => insertVariable("{{campaign_name}}")}
            >
                Campaign Name
            </button>

            <button
                className="variable-btn"
                onClick={() => insertVariable("{{project_name}}")}
            >
                Project Name
            </button>

        </div>

        <div className="preview-card">

            <h3>Preview</h3>

            <h4>{subject || "Subject Preview"}</h4>
            <pre
                style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.7",
                    fontFamily: "inherit"
                }}
            >
            {body
                .replaceAll("{{first_name}}", "John")
                .replaceAll("{{survey_link}}", "https://survey.example.com")
                .replaceAll("{{campaign_name}}", campaignName)
                .replaceAll("{{project_name}}", "Project 1")
            }
            </pre>

        </div>

    </div>

    );

};

export default EmailTemplate;