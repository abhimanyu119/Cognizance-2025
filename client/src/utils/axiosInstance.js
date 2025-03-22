import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
    // baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
    headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.response.use(
    (response) => {
        if (response.config.showToast) {
            toast.success(response.config.toastMessage || "Success!",{
                position: "bottom-right",
                autoClose: 3000,
                theme:"colored"
            });
        }
        return response;
    },
    (error) => {
        //also check if server is not running
        if (error.response) {
            toast.error(error.response.data?.message || "Something went wrong!");
        } else {
            toast.error("Network error. Please check your connection.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
