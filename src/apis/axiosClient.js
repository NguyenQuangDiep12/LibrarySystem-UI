import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://localhost:7067/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// tu dong dinh kem them token vao header authorization neu co
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if(token){
            config.headers["Authorization"] = `Bearer ${token}`;
        }
    return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
  (response) => response.data, // Chỉ lấy data từ Backend, bỏ qua bọc thừa của Axios
  (error) => {
    // Trả về lỗi gọn gàng từ Backend (.NET Validation hoặc lỗi hệ thống)
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosClient;