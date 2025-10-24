<script setup lang="ts">
import { useUser } from '@/composable/user';
import router from '@/router';
import {
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonItem,
    IonInput,
    modalController,
    IonIcon,
    toastController
} from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import { ref } from 'vue';

const name = ref();

const cancel = () => modalController.dismiss(null, 'cancel');
const confirm = () => modalController.dismiss(name.value, 'confirm');

const { logout } = useUser();

async function handleLogout() {
    const result = await logout();
    if (result) {
        await router.push({ name: 'Login' });
        cancel();
    } else {
        console.error('Logout failed');

        const toast = await toastController.create({
            message: 'Failed to log out. Please try again.',
            duration: 1500,
            position: "top",
        });

        await toast.present();
    }
}
</script>

<template>
    <ion-header>
        <ion-toolbar>
            <ion-title slot="start">Account Settings</ion-title>
            <ion-buttons slot="end">
                <ion-button shape="round" @click="cancel" :strong="true">
                    <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-item>
            <ion-button expand="block" color="danger" @click="handleLogout">
                Logout
            </ion-button>
        </ion-item>
    </ion-content>
</template>