<script setup lang="ts">
import { FileEntry, FileQuery, FileStats, useFiles } from '@/composable/files';
import { useUser } from '@/composable/user';
import router from '@/router';
import {
    InfiniteScrollCustomEvent,
    IonButton,
    IonCard, IonCardContent, IonCardHeader, IonCardSubtitle,
    IonIcon,
    IonInfiniteScroll, IonInfiniteScrollContent,
    IonInput,
    IonText,
    loadingController
} from '@ionic/vue';
import { searchOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{
    previewSize?: "small" | "normal" | "large";
    maxAmount?: number;
    infScroll?: boolean;
}>(), {
    previewSize: "normal"
});

const FILE_LOAD_INCREMENT = 10;

const dynamicGridStyle = computed(() => {
    const gridTemplate = {
        small: "repeat(auto-fill, minmax(100px, 1fr))",
        large: "repeat(auto-fill, minmax(250px, 1fr))",
        normal: "repeat(auto-fill, minmax(150px, 1fr))"
    };
    return { gridTemplateColumns: gridTemplate[props.previewSize] };
});

const dynamicGridHeaderStyle = computed(() => {
    const padding = {
        small: "6px",
        normal: "12px",
        large: "22px"
    };
    return { padding: padding[props.previewSize] };
});

const dynamicGridSubtitleStyle = computed(() => {
    const fontSize = {
        small: "10px",
        normal: "12px",
        large: "16px"
    };
    return { fontSize: fontSize[props.previewSize] };
});

const { onUserLogin } = useUser();
const { getFiles, uploadFile, getStats, isRetrievingFiles } = useFiles();

const stats = ref<FileStats | null>(null);
const files = ref<Array<FileEntry>>([]);
const searchQuery = ref<string>("");
const currentLimit = ref<number>(props.maxAmount || 10);
const searchTimeout = ref<number | null>(null);
const isLoadingMore = ref<boolean>(false);

let loading: HTMLIonLoadingElement | undefined = undefined;

async function showLoading(message: string) {
    if (!loading) loading = await loadingController.create({ message });
    await loading.present();
}

async function hideLoading() {
    if (loading) {
        await loading.dismiss();
        loading = undefined;
    }
}

async function updateStats() {
    const statsResult = await getStats();
    if (statsResult.success) stats.value = statsResult.stats;
    else stats.value = null;
}

async function loadFiles(options: { reset?: boolean; loadMore?: boolean } = {}) {
    if (options.reset) {
        files.value = [];
        currentLimit.value = props.maxAmount || FILE_LOAD_INCREMENT;
    }

    if (options.loadMore) {
        currentLimit.value += FILE_LOAD_INCREMENT;
    }

    const query: FileQuery = {
        limit: currentLimit.value,
        search: searchQuery.value || undefined
    };

    const filesResult = await getFiles(query);
    if (filesResult.success) {
        files.value = filesResult.files;
    }
}

onMounted(async () => {
    await loadFiles();
    await updateStats();
});

function handleUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        showLoading("Uploading file...");

        try {
            const result = await uploadFile(file);
            console.log('Upload Result:', result);

            if (result.success) {
                await loadFiles({ reset: true });
                await updateStats();
            }
        } catch (error) {
            console.error('Upload Error:', error);
        }

        hideLoading();
    };
    input.click();
}

function handleSearchInput(event: Event) {
    const query = `${(event.target as HTMLInputElement).value}`;
    searchQuery.value = query;

    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
    }

    searchTimeout.value = window.setTimeout(async () => {
        console.log('Searching for:', query);
        await loadFiles({ reset: true });
    }, 500);
}

async function ionInfinite(event: InfiniteScrollCustomEvent) {
    if (!props.infScroll || isLoadingMore.value) {
        event.target.complete();
        return;
    }

    console.log('Loading more files...');
    isLoadingMore.value = true;

    const previousLength = files.value.length;
    await loadFiles({ loadMore: true });

    isLoadingMore.value = false;
    event.target.complete();

    // Disable infinite scroll when depleted
    if (files.value.length === previousLength) event.target.disabled = true;
};

function handleFileClick(file: FileEntry) {
    router.push({ name: 'FileView', params: { id: file.id } });
}

onUserLogin(() => {
    loadFiles({ reset: true });
    updateStats();
})

router.afterEach((to) => {
    if (to.name === 'Home' || to.name == 'Files') {
        loadFiles({ reset: true });
        updateStats();
    }
});

</script>

<template>
    <div>
        <ion-card id="qa-card">
            <ion-card-content>
                <div id="qa-card-content">
                    <div class="center-div">
                        <ion-text color="medium" style="font-size: 20px">
                            {{ (stats?.totalFiles || 0) }} Files
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

        <div v-if="isRetrievingFiles && files.length === 0">
            <div class="center-div" style="height: 100px;">
                <ion-text color="medium" style="font-size: 16px;">
                    Loading files...
                </ion-text>
            </div>
        </div>
        <div v-else-if="files.length === 0">
            <div class="center-div" style="height: 100px;">
                <ion-text color="medium" style="font-size: 16px;">
                    No files found.
                </ion-text>
            </div>
        </div>
        <div v-else>
            <div id="file-grid-container" :style="dynamicGridStyle">
                <ion-card v-for="file in files" :key="file.id" @click="() => handleFileClick(file)">
                    <img v-if="file.thumbnailUrl" :src="file.thumbnailUrl" alt="Thumbnail"
                        style="width: 100%; height: 100px; object-fit: cover;" />
                    <ion-card-header :style="dynamicGridHeaderStyle">
                        <ion-card-subtitle :style="dynamicGridSubtitleStyle">{{ file.fileName }}</ion-card-subtitle>
                    </ion-card-header>
                </ion-card>
            </div>
            <ion-infinite-scroll v-if="infScroll" @ionInfinite="ionInfinite">
                <ion-infinite-scroll-content></ion-infinite-scroll-content>
            </ion-infinite-scroll>
        </div>

        <div v-if="!infScroll && maxAmount && files.length >= maxAmount">
            <div class="center-div" style="margin: 10px;">
                <ion-button fill="clear" @click="router.push({ name: 'Files' })">
                    View More
                </ion-button>
            </div>
        </div>
    </div>
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

#file-grid-container {
    margin: 10px;
    display: grid;
    gap: 10px;
}
</style>
