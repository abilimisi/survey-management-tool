import axiosInstance from "./axiosInstance";

export const getScreeningQuestions = async (respondentId) => {

    const response = await axiosInstance.get(
        `/screening/${respondentId}/`
    );

    return response.data;
};

export const submitScreening = async(data)=>{

    const response = await axiosInstance.post(

        "/screening/submit/",

        data

    );

    return response.data;

};