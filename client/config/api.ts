"use client";

import axios from "axios";

const api = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_BASE_URL ||
        "http://localhost:5000/api",
});

// Attach authentication token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");

        console.log("API REQUEST:", config.method?.toUpperCase(), config.url);
        console.log("AUTH TOKEN EXISTS:", !!token);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle API responses/errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");

            const currentPath = window.location.pathname;

            if (
                !currentPath.includes("/login") &&
                !currentPath.includes("/register")
            ) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;