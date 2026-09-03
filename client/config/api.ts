"use client";

import axios from "axios";

const api = axios.create({
    baseURL:
        process.env.NEXT_BASE_URL ||
        "http://localhost:5000/api",

    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("auth_token");

            console.log(
                "AUTH TOKEN EXISTS:",
                !!token
            );

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
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
        }

        return Promise.reject(error);
    }
);

export default api;

