import axiosInstance from "./axiosInstance";

// Questions
export const getQuestions = async (projectId) => {
    const response = await axiosInstance.get(
        `/projects/${projectId}/questions/`
    );
    return response.data;
};

export const createQuestion = async (projectId, data) => {
    const response = await axiosInstance.post(
        `/projects/${projectId}/questions/create/`,
        data
    );
    return response.data;
};

export const updateQuestion = async (questionId, data) => {
    const response = await axiosInstance.put(
        `/questions/${questionId}/update/`,
        data
    );
    return response.data;
};

export const deleteQuestion = async (questionId) => {
    const response = await axiosInstance.delete(
        `/questions/${questionId}/delete/`
    );
    return response.data;
};

// Options

export const createOption = async (questionId, data) => {
    const response = await axiosInstance.post(
        `/questions/${questionId}/options/create/`,
        data
    );
    return response.data;
};

export const updateOption = async (optionId, data) => {
    const response = await axiosInstance.put(
        `/options/${optionId}/update/`,
        data
    );
    return response.data;
};

export const deleteOption = async (optionId) => {
    const response = await axiosInstance.delete(
        `/options/${optionId}/delete/`
    );
    return response.data;
};