import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    getCampaignSurveyLinks
} from "../../api/panelCampaignApi";

import "./CampaignSurveyLinks.css";

export default function CampaignSurveyLinks() {

    const { id } = useParams();

    const [links, setLinks] = useState([]);

    useEffect(() => {

        loadLinks();

    }, []);

    const loadLinks = async () => {

        try {

            const data = await getCampaignSurveyLinks(id);

            setLinks(data);

        } catch (err) {

            console.log(err);

        }

    };

    const copyLink = (link) => {

        navigator.clipboard.writeText(link);

        alert("Copied");

    };

    return (

        <div className="survey-links-page">

            <h2>Campaign Survey Links</h2>

            <table>

                <thead>

                    <tr>

                        <th>Panelist</th>

                        <th>Email</th>

                        <th>Survey Link</th>

                        <th></th>

                    </tr>

                </thead>

                <tbody>

                    {

                        links.map((item)=>(

                            <tr key={item.recipient_id}>

                                <td>{item.panelist}</td>

                                <td>{item.email}</td>

                                <td>

                                    <input

                                        value={item.survey_link}

                                        readOnly

                                    />

                                </td>

                                <td>

                                    <button
                                        onClick={()=>copyLink(item.survey_link)}
                                    >
                                        Copy
                                    </button>

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

