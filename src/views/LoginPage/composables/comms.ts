import { toastController } from "@ionic/vue";
import { ref } from "vue";

const usernameError = ref('');
const passwordError = ref('');

export function useCommsSingleton() {
    function sendError(type: "password" | "username", message: string) {
        const dataHolder = type === "password" ? passwordError : usernameError;

        dataHolder.value = message;
        setTimeout(() => dataHolder.value = '', 5000);
    }

    async function sendToast(message: string) {
        const toast = await toastController.create({
            message,
            duration: 1500,
            position: "top",
        });

        await toast.present();
    }

    return {
        usernameError,
        passwordError,
        sendError,
        sendToast,
    }
}