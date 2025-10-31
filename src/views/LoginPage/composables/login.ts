import { ref } from "vue";
import { useCommsSingleton } from "./comms";
import { useUser } from "@/composable/user";
import router from "@/router";

type ValidationResult = { success: true } | { success: false; message: string };

const CONFIG = {
    username: {
        max: 30,
        min: 3,
    },
    password: {
        max: 50,
        min: 6,
    },
}

export function useLogin() {
    const username = ref('');
    const password = ref('');
    const verifyPassword = ref('');

    const events: Map<string, Function[]> = new Map();

    const { sendToast, sendError } = useCommsSingleton();
    const { login, register } = useUser();

    function onLoginSuccess(callback: Function) {
        if (!events.has("loginSuccess")) events.set("loginSuccess", []);
        events.get("loginSuccess")?.push(callback);
    }

    function onRegisterSuccess(callback: Function) {
        if (!events.has("registerSuccess")) events.set("registerSuccess", []);
        events.get("registerSuccess")?.push(callback);
    }

    function fireEvent(eventName: string, ...args: any[]) {
        const eventCallbacks = events.get(eventName);
        eventCallbacks?.forEach(callback => callback(...args));
    }

    function validateUsername(): ValidationResult {
        if (username.value.length < CONFIG.username.min) {
            return { success: false, message: `Username must be at least ${CONFIG.username.min} characters long` };
        }

        if (username.value.length > CONFIG.username.max) {
            return { success: false, message: `Username must be less than ${CONFIG.username.max} characters long` };
        }

        return { success: true };
    }

    function validatePassword(): ValidationResult {
        if (password.value.length < CONFIG.password.min) {
            return { success: false, message: `Password must be at least ${CONFIG.password.min} characters long` };
        }

        if (password.value.length > CONFIG.password.max) {
            return { success: false, message: `Password must be less than ${CONFIG.password.max} characters long` };
        }

        return { success: true };
    }

    async function handleSubmit({ isRegistering }: { isRegistering: boolean }) {
        const usernameValidation = validateUsername();
        if (!usernameValidation.success) sendError("username", usernameValidation.message);

        const passwordValidation = validatePassword();
        if (!passwordValidation.success) sendError("password", passwordValidation.message);

        const isValid = usernameValidation.success && passwordValidation.success;
        if (!isValid) {
            sendToast("Please fix the errors and try again.");
            return;
        }

        const isPasswordsMatching = isRegistering ? password.value === verifyPassword.value : true;
        if (!isPasswordsMatching) {
            sendError("password", "Passwords do not match");
            sendToast("Please fix the errors and try again.");
            return;
        }

        // Submit
        const action = isRegistering ? register : login;
        const result = await action(username.value, password.value);
        if (result) {
            console.log(result);
            if (result.success) {
                if (isRegistering) fireEvent("registerSuccess");
                else fireEvent("loginSuccess");
            } else {
                sendToast(result.message);
                if (result.validationErrors) {
                    result.validationErrors.forEach(err => {
                        const [field, message] = err.split(": ");
                        sendError(field as any, message);
                    });
                }
            }
        } else {
            sendToast(isRegistering ? "Registration failed. Please try again." : "Login failed. Please check your credentials and try again.");
        }
    }

    return {
        username,
        password,
        verifyPassword,
        handleSubmit,
        onLoginSuccess,
        onRegisterSuccess,
    }
}