import qs from "qs";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Function to make a POST request
async function postData(endPoint, data, contentType = "json") {
  try {
    let payload = data;
    let headers = {};

    if (contentType === "form") {
      // If data is FormData (for file upload), send as multipart/form-data
      if (data instanceof FormData) {
        payload = data;
        // Do not set Content-Type header, let browser/axios handle it
      } else {
        // For regular form data, send as x-www-form-urlencoded
        payload = qs.stringify(data);
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      }
    } else {
      headers["Content-Type"] = "application/json";
    }

    const response = await axiosInstance.post(endPoint, payload, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// Function to make a GET request
async function getData(endPoint) {
  try {
    const response = await axiosInstance.get(endPoint);
    return response.data;
  } catch (error) {
    console.error(`GET ${endPoint} error:`, error);
    throw error.response?.data || error;
  }
}

// Function to make a PUT request
async function putData(endPoint, data) {
  try {
    const response = await axiosInstance.put(endPoint, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// Function to make a DELETE request
async function deleteData(endPoint) {
  try {
    const response = await axiosInstance.delete(endPoint);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export { postData, getData, putData, deleteData, axiosInstance };
