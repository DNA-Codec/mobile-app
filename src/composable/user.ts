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
    token?: string;
}

type LoginResult = LoginSuccess | LoginError;

export function useUser() {
    const events: Map<string, Function[]> = new Map();

    function fireEvent(eventName: string, ...args: any[]) {
        const eventCallbacks = events.get(eventName);
        eventCallbacks?.forEach(callback => callback(...args));
    }

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

    async function onUserLogin(cb: (result: LoginResult) => any) {
        if (!events.has("userLogin")) events.set("userLogin", []);
        events.get("userLogin")?.push(cb);
    }

    async function login(username: string, password: string) {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/user/v1/login`, {
                username,
                password
            }, { withCredentials: true });

            if (response.data.token) localStorage.setItem('auth_token', response.data.token);
            fireEvent("userLogin", response.data);
            return response.data as LoginResult;
        } catch (error) {
            console.error('Error logging in:', error);
            return false;
        }
    }

    async function logout() {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/user/v1/logout`, {}, { withCredentials: true });
            localStorage.removeItem('auth_token');
            return response.data as LoginResult;
        } catch (error) {
            console.error('Error logging out:', error);
            localStorage.removeItem('auth_token');
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
        register,
        onUserLogin
    }
}