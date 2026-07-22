import axiosInstance from "./axiosInstance";


// Campaign List
export const getPanelCampaigns = async () => {
    const response = await axiosInstance.get(
        "/panel-campaigns/"
    );

    return response.data;
};


// Single Campaign
export const getPanelCampaign = async (id) => {
    const response = await axiosInstance.get(
        `/panel-campaigns/${id}/`
    );

    return response.data;
};


// Create Campaign
export const createPanelCampaign = async (data) => {
    const response = await axiosInstance.post(
        "/panel-campaigns/create/",
        data
    );

    return response.data;
};


// Update Campaign
export const updatePanelCampaign = async (
    id,
    data
) => {
    const response = await axiosInstance.put(
        `/panel-campaigns/${id}/update/`,
        data
    );

    return response.data;
};


// Delete Campaign
export const deletePanelCampaign = async (
    id
) => {
    const response = await axiosInstance.delete(
        `/panel-campaigns/${id}/delete/`
    );

    return response.data;
};


// Generate Recipients
export const generateRecipients = async (
    id,
    filters
) => {
    const response = await axiosInstance.post(
        `/panel-campaigns/${id}/generate/`,
        filters
    );

    return response.data;
};


// Campaign Recipients
export const getCampaignRecipients = async (
    id
) => {
    const response = await axiosInstance.get(
        `/panel-campaigns/${id}/recipients/`
    );

    return response.data;
};


// Campaign Stats
export const getCampaignStats = async (
    id
) => {
    const response = await axiosInstance.get(
        `/panel-campaigns/${id}/stats/`
    );

    return response.data;
};


// Survey Links
export const getCampaignSurveyLinks = async (
    id
) => {
    const response = await axiosInstance.get(
        `/panel-campaigns/${id}/survey-links/`
    );

    return response.data;
};

export const getProjectVendorsByProject = async (projectId) => {

    const response = await axiosInstance.get(
        `/projects/${projectId}/vendors/`
    );

    return response.data;

};

export const sendCampaignEmails = async (id) => {

    const response = await axiosInstance.post(

        `/panel-campaigns/${id}/send-emails/`

    );

    return response.data;

};

export const getCampaignDashboard = async (id) => {

    const response = await axiosInstance.get(
        `/panel-campaigns/${id}/dashboard/`
    );

    return response.data;

};

export const getCampaignPanelSummary = async (id) => {

    const response = await axiosInstance.get(
        `/panel-campaigns/${id}/panel-summary/`
    );

    return response.data;

};

export const getCampaignRespondents = async (
    id,
    status=""
) => {

    const response = await axiosInstance.get(

        `/panel-campaigns/${id}/respondents/`,

        {
            params:{status}
        }

    );

    return response.data;

};

export const getRedirectJourney = async (
    respondentId
)=>{

    const response=await axiosInstance.get(

        `/respondents/${respondentId}/journey/`

    );

    return response.data;

}