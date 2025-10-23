<script setup lang="ts">
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
    IonIcon
} from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import { ref } from 'vue';

const name = ref();

const cancel = () => modalController.dismiss(null, 'cancel');
const confirm = () => modalController.dismiss(name.value, 'confirm');
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
            <ion-input label-placement="stacked" label="Enter your name" v-model="name"
                placeholder="Your name"></ion-input>
        </ion-item>
    </ion-content>
</template>