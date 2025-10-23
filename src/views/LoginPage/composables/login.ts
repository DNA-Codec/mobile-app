import { ref } from "vue";
import { useCommsSingleton } from "./comms";

type ValidationResult = { success: true } | { success: false; message: string };

const CONFIG = {
    username: {
        max: 30,
        min: 3,
    },
    password: {
        max: 50,
        min: 3,
    },
}

export function useLogin() {
    const username = ref('');
    const password = ref('');
    const verifyPassword = ref('');

    const { sendToast, sendError } = useCommsSingleton();

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

    function handleSubmit({ isRegistering }: { isRegistering: boolean }) {
        const usernameValidation = validateUsername();
        if (!usernameValidation.success) sendError("username", usernameValidation.message);

        const passwordValidation = validatePassword();
        if (!passwordValidation.success) sendError("password", passwordValidation.message);

        const isValid = usernameValidation.success && passwordValidation.success;
        if (!isValid) {
            sendToast("Please fix the errors and try again.");
            return;
        }

        // Submit
        sendToast(isRegistering ? "Registered successfully!" : "Logged in successfully!");
    }

    return {
        username,
        password,
        verifyPassword,
        handleSubmit,
    }
}