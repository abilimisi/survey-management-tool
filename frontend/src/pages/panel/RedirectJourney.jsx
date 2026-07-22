import {useEffect,useState} from "react";

import {useParams} from "react-router-dom";

import {
    getRedirectJourney
} from "../../api/panelCampaignApi";

import "./RedirectJourney.css";

export default function RedirectJourney(){

    const {respondentId}=useParams();

    const [data,setData]=useState(null);

    useEffect(()=>{

        load();

    },[]);

    const load=async()=>{

        const res=await getRedirectJourney(
            respondentId
        );

        setData(res);

    }

    if(!data)
        return <p className="page-loading">Loading...</p>;

    return(

        <div className="journey-page">

            <h2>

                Redirect Journey

            </h2>

            <div className="journey-info">

                <div className="journey-field">

                    <b>Respondent :</b>

                    {data.respondent.respondent_id}

                </div>

                <div className="journey-field">

                    <b>Status :</b>

                    {data.respondent.status}

                </div>

                <div className="journey-field">

                    <b>Project :</b>

                    {data.respondent.project}

                </div>

                <div className="journey-field">

                    <b>Vendor :</b>

                    {data.respondent.vendor}

                </div>

            </div>

            <div className="table-scroll">

            <table className="journey-table">

                <thead>

                    <tr>

                        <th>Step</th>

                        <th>Type</th>

                        <th>URL</th>

                        <th>Time</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        data.journey.map(

                            (item,index)=>(

                                <tr key={item.id}>

                                    <td className="mono-cell">

                                        {index+1}

                                    </td>

                                    <td>

                                        {item.type}

                                    </td>

                                    <td className="url-cell">

                                        {item.url}

                                    </td>

                                    <td className="mono-cell">

                                        {

                                            new Date(
                                                item.created_at
                                            ).toLocaleString()

                                        }

                                    </td>

                                </tr>

                            )

                        )

                    }

                </tbody>

            </table>

            </div>

        </div>

    )

}
