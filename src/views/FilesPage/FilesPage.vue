<script setup lang="ts">
import { FileList } from '@/components/FileList';
import { MainToolbar } from '@/components/MainToolbar';
import { useUser } from '@/composable/user';
import router from '@/router';
import {
    IonContent, IonHeader, IonPage, IonTitle,
    IonToolbar, IonBreadcrumbs, IonBreadcrumb
} from '@ionic/vue';
import { onMounted } from 'vue';

const { getUserInfo } = useUser();

onMounted(async () => {
    const userInfo = await getUserInfo();
    console.log('User Info:', userInfo);
    if (!userInfo) return router.push({ name: "Login" });
})

</script>

<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <MainToolbar />
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Files</ion-title>
                </ion-toolbar>
            </ion-header>

            <br />

            <ion-breadcrumbs>
                <ion-breadcrumb href="#Home">Home</ion-breadcrumb>
                <ion-breadcrumb href="#Files">Files</ion-breadcrumb>
            </ion-breadcrumbs>

            <FileList />

        </ion-content>
    </ion-page>
</template>

<style scoped>
.center-div {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
