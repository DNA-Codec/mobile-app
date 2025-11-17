<script setup lang="ts">
import { FileList } from '@/components/FileList';
import { MainToolbar } from '@/components/MainToolbar';
import { FileStats, useFiles } from '@/composable/files';
import { useUser } from '@/composable/user';
import router from '@/router';
import {
  IonContent, IonHeader, IonPage, IonTitle,
  IonToolbar, IonBreadcrumbs, IonBreadcrumb
} from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { StorageAnalysis } from './components/analysis';

const { getUserInfo, onUserLogin } = useUser();
const { getStats, onGlobalFileUploaded } = useFiles();

const stats = ref<FileStats | null>(null);

async function updateStats() {
  const statsResult = await getStats();
  if (statsResult.success) stats.value = statsResult.stats;
}

onMounted(async () => {
  const userInfo = await getUserInfo();
  console.log('User Info:', userInfo);
  if (!userInfo) return router.push({ name: "Login" });

  updateStats();
})

onUserLogin(() => updateStats());
onGlobalFileUploaded(updateStats);

</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <br />
        <MainToolbar />
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Home</ion-title>
        </ion-toolbar>
      </ion-header>

      <br />

      <ion-breadcrumbs>
        <ion-breadcrumb href="/Home">Home</ion-breadcrumb>
      </ion-breadcrumbs>

      <FileList preview-size="small" :max-amount="3" />

      <br />

      <StorageAnalysis v-if="stats && stats.totalFiles > 0" :stats="stats" />
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
