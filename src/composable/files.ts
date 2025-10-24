import { CONFIG } from "@/config";
import axios from "axios";
import { ref } from "vue";

export type FileEntry = {
    id: string;
    fileName: string;
    mimeType: string;
    originalSize: number;
    dnaSize: number;
    realDnaSize: number;
    uploadedAt: string;
    totalChunks: number;
    thumbnailUrl?: string;
    compressionRatio: string;
}

type FilesResultSuccess = {
    success: true;
    pagination: {
        page: number;
        limit: number;
        totalFiles: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    sorting: {
        sortBy: string;
        sortOrder: string;
    };
    files: FileEntry[];
}

type FilesResultFail = {
    success: false;
    error: string;
}

export type FileQuery = {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
}

export type FilesResult = FilesResultSuccess | FilesResultFail;

export type FileStats = {
    totalFiles: number;
    totalChunks: number;
    storage: {
        originalSize: number;
        originalSizeMB: string;
        dnaSize: number;
        dnaSizeMB: string;
        realDnaSize: number;
        realDnaSizeMB: string;
    };
    averages: {
        avgFileSize: number;
        avgChunksPerFile: string;
    };
    efficiency: {
        overheadBytes: number;
        overheadPercent: string;
    };
}

type FileStatsResultSuccess = {
    success: true;
    stats: FileStats;
}

type FileStatsResultFail = {
    success: false;
    error: string;
}

export type FileStatsResult = FileStatsResultSuccess | FileStatsResultFail;

export function useFiles() {
    const isRetrievingFiles = ref(false);

    async function getFiles(query: FileQuery = {}): Promise<FilesResult> {
        isRetrievingFiles.value = true;

        const result = await axios.get(`${CONFIG.API_URL}/codec/api/v1/files`, {
            withCredentials: true,
            params: query
        });

        isRetrievingFiles.value = false;

        const data = result.data as FilesResult;
        if (!data.success) return data;

        data.files = data.files.map(file => ({
            ...file,
            thumbnailUrl: file.thumbnailUrl ? `${CONFIG.API_URL}/codec${file.thumbnailUrl}` : undefined,
        }));

        return data;
    }

    async function uploadFile(file: File) {
        const formData = new FormData();
        formData.append("file", file);

        const result = await axios.post(`${CONFIG.API_URL}/codec/api/v1/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true
        });

        return result.data;
    }

    async function getStats() {
        const result = await axios.get(`${CONFIG.API_URL}/codec/api/v1/stats`, { withCredentials: true });
        return result.data as FileStatsResult;
    }

    return {
        uploadFile,
        getFiles,
        getStats,
        isRetrievingFiles
    };
}