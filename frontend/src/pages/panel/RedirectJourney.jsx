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
        return <p>Loading...</p>;

    return(

        <div className="journey-page">

            <h2>

                Redirect Journey

            </h2>

            <div className="journey-info">

                <p>

                    <b>Respondent :</b>

                    {data.respondent.respondent_id}

                </p>

                <p>

                    <b>Status :</b>

                    {data.respondent.status}

                </p>

                <p>

                    <b>Project :</b>

                    {data.respondent.project}

                </p>

                <p>

                    <b>Vendor :</b>

                    {data.respondent.vendor}

                </p>

            </div>

            <table>

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

                                    <td>

                                        {index+1}

                                    </td>

                                    <td>

                                        {item.type}

                                    </td>

                                    <td>

                                        {item.url}

                                    </td>

                                    <td>

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

    )

}