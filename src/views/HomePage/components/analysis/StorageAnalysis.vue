<script setup lang="ts">
import type { FileStats } from '@/composable/files';
import { IonText } from '@ionic/vue';

defineProps<{
    stats: FileStats;
}>();

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatBytesFromMB = (mb: string): string => {
    return formatBytes(parseFloat(mb) * 1024 * 1024);
};
</script>

<template>
    <div class="stats-container">
        <div class="stats-header">
            <ion-text color="medium" style="font-size: 16px">
                Storage Analysis
            </ion-text>
            <p class="stats-subtitle" style="margin-top: 5px;">{{ stats.totalFiles }} files -> {{
                stats.totalChunks.toLocaleString() }} DNA
                strands</p>
        </div>

        <!-- Key Metrics -->
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Average File Size</div>
                <div class="metric-value">{{ formatBytes(stats.averages.avgFileSize) }}</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Avg Strands/File</div>
                <div class="metric-value">{{ stats.averages.avgChunksPerFile }}</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">EC Overhead</div>
                <div class="metric-value">{{ formatBytes(stats.overhead.errorCorrectionBytes) }}</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Compression Ratio</div>
                <div class="metric-value">{{ (parseFloat(stats.storage.diskDnaSizeMB) /
                    parseFloat(stats.storage.realDnaSizeMB)).toFixed(2) }}:1</div>
            </div>
        </div>

        <!-- Size Comparison -->
        <div class="comparison-section">
            <p class="section-title">Total Size Comparison</p>
            <div class="size-list">
                <div class="size-item">
                    <span class="size-label">Original Data</span>
                    <span class="size-value">{{ formatBytesFromMB(stats.storage.originalSizeMB) }}</span>
                </div>

                <div class="size-item">
                    <span class="size-label">After Error Correction</span>
                    <span class="size-value">{{ formatBytesFromMB(stats.storage.encodedSizeMB) }}</span>
                    <span class="size-meta">+{{ stats.overhead.errorCorrectionPercent }}% overhead</span>
                </div>

                <div class="size-item">
                    <span class="size-label">Physical DNA Size</span>
                    <span class="size-value">{{ formatBytesFromMB(stats.storage.realDnaSizeMB) }}</span>
                    <span class="size-meta">Each base = 1 bit</span>
                </div>

                <div class="size-item">
                    <span class="size-label">Disk DNA Storage</span>
                    <span class="size-value">{{ formatBytesFromMB(stats.storage.diskDnaSizeMB) }}</span>
                    <span class="size-meta">+{{ stats.overhead.diskStoragePercent }}% vs original</span>
                </div>
            </div>
        </div>

        <!-- Research Insights -->
        <div class="insights-section">
            <p class="section-title">Research Observations</p>
            <div class="insights-list">
                <div class="insight-item">
                    <div class="insight-key">Reed-Solomon Impact</div>
                    <div class="insight-value">
                        Error correction adds {{ stats.overhead.errorCorrectionPercent }}% overhead
                        ({{ formatBytes(stats.overhead.errorCorrectionBytes) }})
                    </div>
                </div>

                <div class="insight-item">
                    <div class="insight-key">Physical vs Virtual</div>
                    <div class="insight-value">
                        Physical DNA is {{ (parseFloat(stats.storage.diskDnaSizeMB) /
                            parseFloat(stats.storage.realDnaSizeMB)).toFixed(1) }}x
                        more efficient than disk storage
                    </div>
                </div>

                <div class="insight-item">
                    <div class="insight-key">Total DNA Bases</div>
                    <div class="insight-value">
                        {{ (parseFloat(stats.storage.realDnaSizeMB) * 1000000 * 8).toLocaleString() }} nucleotides
                        ({{ (parseFloat(stats.storage.realDnaSizeMB) * 8).toFixed(2) }} Mb)
                    </div>
                </div>

                <div class="insight-item">
                    <div class="insight-key">Storage Density</div>
                    <div class="insight-value">
                        {{ (parseFloat(stats.storage.originalSizeMB) /
                            parseFloat(stats.storage.realDnaSizeMB)).toFixed(3) }} MB/MB
                        original to physical DNA ratio
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.stats-container {
    padding: 24px;
    max-width: 1000px;
    margin: 0 auto;
}

.stats-header {
    margin-bottom: 32px;
}

.stats-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--ion-text-color);
    margin: 0 0 8px 0;
}

.stats-subtitle {
    font-size: 14px;
    color: var(--ion-color-medium);
    margin: 0;
}

.section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--ion-text-color);
    margin: 0 0 16px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Size Comparison */
.comparison-section {
    background: var(--ion-card-background, var(--ion-background-color));
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    border: 1px solid var(--ion-color-light);
}

.size-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.size-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--ion-color-light);
}

.size-item:last-child {
    border-bottom: none;
}

.size-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--ion-text-color);
}

.size-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--ion-color-primary);
    margin-left: auto;
    margin-right: 12px;
}

.size-meta {
    font-size: 12px;
    color: var(--ion-color-medium);
    font-style: italic;
    min-width: 140px;
    text-align: right;
}

/* Metrics Grid */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.metric-card {
    background: var(--ion-card-background, var(--ion-background-color));
    border: 1px solid var(--ion-color-light);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
}

.metric-label {
    font-size: 12px;
    color: var(--ion-color-medium);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    font-weight: 500;
}

.metric-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--ion-color-primary);
}

/* Research Insights */
.insights-section {
    background: var(--ion-card-background, var(--ion-background-color));
    border-radius: 8px;
    padding: 20px;
    border: 1px solid var(--ion-color-light);
}

.insights-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.insight-item {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--ion-color-light);
}

.insight-item:last-child {
    border-bottom: none;
}

.insight-key {
    font-size: 13px;
    font-weight: 600;
    color: var(--ion-color-medium);
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.insight-value {
    font-size: 14px;
    color: var(--ion-text-color);
    line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
    .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .insight-item {
        grid-template-columns: 1fr;
        gap: 8px;
    }

    .size-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .size-value {
        margin-left: 0;
        margin-right: 0;
    }

    .size-meta {
        text-align: left;
    }
}

@media (max-width: 480px) {
    .metrics-grid {
        grid-template-columns: 1fr;
    }

    .stats-container {
        padding: 16px;
    }
}
</style>
