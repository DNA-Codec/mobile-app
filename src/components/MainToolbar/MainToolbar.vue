<script setup lang="ts">
import { IonButton, IonIcon, modalController } from '@ionic/vue';
import { personOutline, logOutOutline } from 'ionicons/icons';
import AccountModal from "./AccountOptionsModal.vue";

async function openModal() {
    const modal = await modalController.create({
        component: AccountModal,
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
        console.log('Confirmed with data:', data);
    }
};

</script>

<template>
    <div id="container">
        <img id="app_icon" alt="Noodles" src="/noodles_banner.png" />
        <div id="avatar_container">
            <ion-button shape="round" @click="openModal">
                <ion-icon slot="icon-only" :icon="personOutline"></ion-icon>
            </ion-button>
        </div>
    </div>
</template>

<style scoped>
#app_icon {
    width: 150px;
}

#container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 15px;
    margin-bottom: 10px;
}
</style>