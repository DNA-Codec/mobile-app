<script setup lang="ts">
import { MainToolbar } from '@/components/MainToolbar';
import { FileInfo, useFiles } from '@/composable/files';
import { useUser } from '@/composable/user';
import router from '@/router';
import {
    IonBreadcrumb, IonFooter, IonAlert,
    IonBreadcrumbs, IonButton, IonIcon,
    IonContent, IonHeader, IonPage, IonTitle,
    IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent
} from '@ionic/vue';
import { downloadOutline, trashBinOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { Filesystem, Directory } from '@capacitor/filesystem';


const { getUserInfo } = useUser();
const { getFile, downloadFile, deleteFile } = useFiles();
const file = ref<FileInfo | null>(null);

const alertButtons = [
    {
        text: 'Cancel',
        role: 'cancel',
        handler: () => { },
    },
    {
        text: 'OK',
        role: 'confirm',
        handler: handleDelete,
    },
];

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

const formatBytes = (bytes: number | undefined | null): string => {
    if (!bytes || bytes <= 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb'];
    const index = Math.min(sizes.length - 1, Math.max(0, Math.floor(Math.log(bytes) / Math.log(k))));
    return `${parseFloat((bytes / Math.pow(k, index)).toFixed(2))} ${sizes[index]}`;
};

const formatNumber = (value: number | undefined | null, unit: string): string => {
    if (value === undefined || value === null) return `0 ${unit}`;
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return `0 ${unit}`;
    return `${numberFormatter.format(numericValue)} ${unit}`;
};

const formatBitsToBytes = (bits: number | undefined | null): string => {
    if (!bits || bits <= 0) return '0 Bytes';
    return formatBytes(bits / 8);
};

onMounted(async () => {
    const userInfo = await getUserInfo();
    console.log('User Info:', userInfo);
    if (!userInfo) return router.push({ name: "Login" });

    const fileId = router.currentRoute.value.params.id as string;
    const fileData = await getFile(fileId);
    if (fileData.success) file.value = fileData.file;
    else console.error('Failed to load file data');
})

async function handleDownload() {
    if (!file.value) return;

    try {
        const blob = await downloadFile(file.value.metadata.id);
        const fileName = file.value?.metadata.originalFileName || 'downloaded_file';

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            const base64 = base64data.split(',')[1];

            const result = await Filesystem.writeFile({
                path: fileName,
                data: base64,
                directory: Directory.Documents
            });

            console.log('File saved to:', result.uri);
            alert(`File saved successfully to Documents folder!`);
        };
    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download file');
    }
}

async function handleDelete() {
    if (!file.value) return;
    const response = await deleteFile(file.value.metadata.id);
    if (response.success) {
        console.log('File deleted successfully');
        router.push({ name: 'Home' });
    } else {
        console.error('Failed to delete file');
    }
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
                    <ion-title size="large">Files</ion-title>
                </ion-toolbar>
            </ion-header>

            <br />

            <ion-breadcrumbs>
                <ion-breadcrumb href="/Home">Home</ion-breadcrumb>
                <ion-breadcrumb href="/File">File</ion-breadcrumb>
            </ion-breadcrumbs>

            <ion-card>
                <img :src="file?.metadata?.thumbnailUrl" alt="Files Illustration" style="height: auto; width: 100%" />

                <ion-card-header>
                    <ion-card-title>{{ file?.metadata.originalFileName }}</ion-card-title>
                    <ion-card-subtitle>{{ file?.metadata.uploadedAt ? new
                        Date(file?.metadata.uploadedAt).toLocaleString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        }) : '' }}</ion-card-subtitle>
                </ion-card-header>

                <ion-card-content>
                    <div class="file-info">



                        <br />
                        <h3>File Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>File ID:</strong>
                                <span class="monospace">{{ file?.metadata.id }}</span>
                            </div>
                            <div class="info-item">
                                <strong>MIME Type:</strong>
                                <span>{{ file?.metadata.mimeType }}</span>
                            </div>
                            <div class="info-item">
                                <strong>Total DNA Strands:</strong>
                                <span>{{ file?.metadata.totalChunks }}</span>
                            </div>
                            <div class="info-item">
                                <strong>Has Thumbnail:</strong>
                                <span>{{ file?.metadata.hasThumbnail ? 'Yes' : 'No' }}</span>
                            </div>
                        </div>

                        <h3>Size Breakdown</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Original Size:</strong>
                                <span>{{ formatBytes(file?.sizes?.originalSize) }}</span>
                                <span class="small">File size before any processing</span>
                            </div>
                            <div class="info-item">
                                <strong>Encoded Size:</strong>
                                <span>{{ formatBytes(file?.sizes?.encodedSize) }}</span>
                                <span class="small">After Reed-Solomon error correction</span>
                            </div>
                            <div class="info-item">
                                <strong>Physical DNA Size:</strong>
                                <span>{{ formatBytes(file?.sizes?.realDnaSize) }}</span>
                                <span class="small">Real-world DNA (each base = 1 bit)</span>
                            </div>
                            <div class="info-item">
                                <strong>Virtual DNA Size:</strong>
                                <span>{{ formatBytes(file?.sizes?.diskDnaSize) }}</span>
                                <span class="small">Disk storage (each base = 1 byte)</span>
                            </div>
                        </div>

                        <h3>Overhead & Efficiency</h3>
                        <div class="info-grid">
                            <div class="info-item highlight-positive">
                                <strong>Error Correction Overhead:</strong>
                                <span>+{{ formatBytes(file?.overhead?.errorCorrectionBytes) }}</span>
                                <span class="small">{{ file?.overhead?.errorCorrectionPercent }}% increase for data
                                    integrity</span>
                            </div>
                            <div class="info-item highlight-warning">
                                <strong>Disk Storage Overhead:</strong>
                                <span>+{{ formatBytes(file?.overhead?.diskStorageBytes) }}</span>
                                <span class="small">{{ file?.overhead?.diskStoragePercent }}% increase for ASCII
                                    encoding</span>
                            </div>
                        </div>

                        <h3>DNA Encoding Details</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Total DNA Bases:</strong>
                                <span>{{ file?.encoding?.totalBases?.toLocaleString() }} bases</span>
                                <span class="small">Number of ACTG nucleotides</span>
                            </div>
                            <div class="info-item">
                                <strong>Information Per Base:</strong>
                                <span>{{ file?.encoding?.bitsPerBase }}</span>
                                <span class="small">A=00, T=01, C=10, G=11</span>
                            </div>
                            <div class="info-item">
                                <strong>Bases Per Byte:</strong>
                                <span>{{ file?.encoding?.basesPerEncodedByte }} bases</span>
                                <span class="small">8 bits / 2 bits per base</span>
                            </div>
                            <div class="info-item">
                                <strong>Storage Efficiency:</strong>
                                <span>8x compression</span>
                                <span class="small">Physical DNA vs disk storage</span>
                            </div>
                        </div>
                    </div>
                </ion-card-content>
            </ion-card>
        </ion-content>

        <ion-footer>
            <ion-toolbar collapse="condense">
                <div style="display: flex; justify-content: space-between; padding: 10px;">
                    <ion-button fill="solid" color="success" @click="handleDownload">
                        <ion-icon slot="start" :icon="downloadOutline"></ion-icon>
                        Decode & Download
                    </ion-button>
                    <ion-button id="delete-file" fill="outline" color="danger">
                        <ion-icon :icon="trashBinOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-alert trigger="delete-file" header="Do you want to delete this file?"
                        :buttons="alertButtons"></ion-alert>
                </div>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<style scoped>
.center-div {
    display: flex;
    justify-content: center;
    align-items: center;
}

.file-info {
    padding: 0;
}

.file-info h3 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ion-color-primary);
    border-bottom: 2px solid var(--ion-color-primary);
    padding-bottom: 0.5rem;
}

.file-info h3:first-child {
    margin-top: 0;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    background: var(--ion-color-light);
    border-radius: 8px;
    border-left: 3px solid var(--ion-color-primary);
}

.info-item strong {
    font-size: 0.85rem;
    color: var(--ion-color-medium);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-item span {
    font-size: 1rem;
    color: var(--ion-color-dark);
    word-break: break-word;
}

.info-item .small {
    font-size: 0.75rem;
    color: var(--ion-color-medium);
}

.info-item.highlight-positive {
    border-left-color: var(--ion-color-success);
    background: rgba(var(--ion-color-success-rgb), 0.05);
}

.info-item.highlight-warning {
    border-left-color: var(--ion-color-warning);
    background: rgba(var(--ion-color-warning-rgb), 0.05);
}

.monospace {
    font-family: monospace;
    font-size: 0.9em;
}

.chunks-info {
    margin-top: 1rem;
}

.chunks-info>p {
    margin-bottom: 1rem;
    font-size: 1rem;
}

.chunk-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
    padding: 0.5rem;
    background: var(--ion-color-light);
    border-radius: 8px;
}

.chunk-item {
    padding: 0.75rem;
    background: white;
    border-radius: 6px;
    border: 1px solid var(--ion-color-light-shade);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chunk-item>div:first-child {
    margin-bottom: 0.5rem;
    color: var(--ion-color-primary);
}

.chunk-details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: var(--ion-color-medium-shade);
}

.chunk-details span {
    padding: 0.25rem 0.5rem;
    background: var(--ion-color-light);
    border-radius: 4px;
}

.chunk-details .checksum {
    font-family: monospace;
    font-size: 0.85rem;
}

@media (max-width: 768px) {
    .info-grid {
        grid-template-columns: 1fr;
    }
}
</style>
