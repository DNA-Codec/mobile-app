<script setup lang="ts">
import { useUser } from '@/composable/user';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonIcon, IonToolbar, IonInput,
  IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonText, IonButton
} from '@ionic/vue';
import { onMounted, ref } from 'vue';
import router from '@/router';
import { MainToolbar } from '@/components/MainToolbar';
import { searchOutline } from 'ionicons/icons';
import { FileEntry, FileQuery, useFiles } from '@/composable/files';

const { getUserInfo } = useUser();
const { getFiles, uploadFile } = useFiles();

const fileCount = ref<number>(0);
const files = ref<Array<FileEntry>>([]);
const searchQuery = ref<string>("");

async function fileSearch(query?: FileQuery) {
  const baseQuery: FileQuery = { limit: 6 };
  const filesResult = await getFiles({ ...baseQuery, ...query });
  if (filesResult.success) {
    fileCount.value = filesResult.pagination.totalFiles;
    files.value = filesResult.files;
  }
}

onMounted(async () => {
  const userInfo = await getUserInfo();
  console.log('User Info:', userInfo);
  if (!userInfo) return router.push({ name: "Login" });

  fileSearch();
})


function handleUpload() {
  // prompt for file upload
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '*/*';
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const result = await uploadFile(file);
    console.log('Upload Result:', result);
  };
  input.click();
}

function handleSearchInput(event: Event) {
  const query = `${(event.target as HTMLInputElement).value}`;
  searchQuery.value = query;

  setTimeout(async () => {
    if (searchQuery.value !== query) return; // ignore if query has changed
    console.log('Searching for:', query);
    fileSearch({ search: query });
  }, 1000);
}

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
          <ion-title size="large">Blank</ion-title>
        </ion-toolbar>
      </ion-header>

      <br />

      <ion-card id="qa-card">
        <ion-card-content>
          <div id="qa-card-content">
            <div class="center-div">
              <ion-text color="medium" style="font-size: 20px">
                {{ fileCount }} Files
              </ion-text>
            </div>
            <div class="vertical-line"></div>
            <div class="center-div">
              <ion-button fill="outline" color="success" @click="handleUpload">
                Upload
              </ion-button>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <div style="margin: 10px; margin-top: 20px;">
        <ion-input fill="outline" placeholder="Search files" @ion-input="handleSearchInput">
          <ion-icon slot="start" :icon="searchOutline" aria-hidden="true"></ion-icon>
        </ion-input>
      </div>

      <br />

      <ion-text color="medium" style="font-size: 16px; margin-left: 10px;">
        {{ searchQuery.length > 0 ? 'Search Results' : 'Recent Files' }}
      </ion-text>

      <br />

      <div id="file-container">
        <!-- Placeholder for file items -->
        <ion-card v-for="n of files" :key="n.id">
          <img v-if="n.thumbnailUrl" :src="n.thumbnailUrl" alt="Thumbnail" style="width: 100%; height: auto;" />
          <ion-card-header>
            <ion-card-subtitle>{{ n.fileName }}</ion-card-subtitle>
          </ion-card-header>
        </ion-card>
      </div>

    </ion-content>
  </ion-page>
</template>

<style scoped>
.center-div {
  display: flex;
  justify-content: center;
  align-items: center;
}

.vertical-line {
  border-left: 1px solid #ccc;
  height: 40px;
  margin: 0 auto;
  width: 1px;
}

#qa_card {
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
}

#qa-card-content {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 10px;
}

#file-container {
  margin: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}
</style>
