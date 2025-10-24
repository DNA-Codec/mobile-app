import { CONFIG } from "@/config";
import axios from "axios";

type LoginError = {
    success: false;
    error: string;
    message: string;
    validationErrors?: (`${string}: ${string}`)[];
}

type LoginSuccess = {
    success: true;
}

type LoginResult = LoginSuccess | LoginError;

export function useUser() {
    async function getUserInfo() {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/user/v1/me`, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) return null;
            console.error('Error fetching user info:', error);
            return null;
        }
    }

    async function login(username: string, password: string) {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/user/v1/login`, {
                username,
                password
            }, { withCredentials: true });

            return response.data as LoginResult;
        } catch (error) {
            console.error('Error logging in:', error);
            return false;
        }
    }

    async function logout() {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/user/v1/logout`, {}, { withCredentials: true });
            return response.data as LoginResult;
        } catch (error) {
            console.error('Error logging out:', error);
            return false;
        }
    }

    async function register(username: string, password: string) {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/user/v1/register`, {
                username,
                password
            }, { withCredentials: true });

            return response.data as LoginResult;
        } catch (error) {
            console.error('Error registering:', error);
            return false;
        }
    }

    return {
        getUserInfo,
        login,
        logout,
        register
    }
}