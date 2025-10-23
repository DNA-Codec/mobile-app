import { CONFIG } from "@/config";

export function useUser() {
    async function getUserInfo() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/user/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })

            if (response.status == 401) return null;
            return await response.json();
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    }

    async function login(username: string, password: string) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            return response.ok;
        } catch (error) {
            console.error('Error logging in:', error);
            return false;
        }
    }

    async function register(username: string, password: string) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            return response.ok;
        } catch (error) {
            console.error('Error registering:', error);
            return false;
        }
    }

    return {
        getUserInfo,
        login,
        register
    }
}