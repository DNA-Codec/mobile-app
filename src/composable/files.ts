import { CONFIG } from "@/config";
import axios from "axios";
import { ref } from "vue";

export type FileEntry = {
    id: string;
    fileName: string;
    mimeType: string;
    sizes: {
        originalSize: number;
        encodedSize: number;
        realDnaSize: number; // bytes (physical, each base = 1 bit)
        realDnaSizeMB: string;
        diskDnaSize: number;
    };
    uploadedAt: string;
    totalChunks: number;
    thumbnailUrl?: string;
    overhead: {
        errorCorrection: string; // percentage with %
        diskStorage: string; // percentage with %
    };
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
        encodedSize: number;
        encodedSizeMB: string;
        realDnaSize: number; // number of bases
        realDnaSizeKb: string; // kilobases
        realDnaSizeMb: string; // megabases
        diskDnaSize: number;
        diskDnaSizeMB: string;
    };
    overhead: {
        errorCorrectionBytes: number;
        errorCorrectionPercent: string;
        diskStorageBytes: number;
        diskStoragePercent: string;
    };
    averages: {
        avgFileSize: number;
        avgChunksPerFile: string;
    };
    explanation?: {
        originalSize: string;
        encodedSize: string;
        realDnaSize: string;
        diskDnaSize: string;
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

export interface FileMetadata {
    /** Unique identifier for the file */
    id: string;
    /** Original filename */
    originalFileName: string;
    /** MIME type of the original file */
    mimeType: string;
    /** Original file size in bytes (before any processing) */
    originalSize: number;
    /** Physical DNA size in bytes (each base = 1 bit) */
    realDnaSize: number;
    /** DNA size on disk in bytes (each ACTG base stored as 1 byte character) */
    diskDnaSize: number;
    /** Size after error correction but before DNA encoding in bytes */
    encodedSize: number;
    /** Upload timestamp */
    uploadedAt: Date;
    /** Total number of chunks */
    totalChunks: number;
    /** Whether a thumbnail exists for this file */
    hasThumbnail?: boolean;
    /** Additional custom metadata */
    customMetadata?: Record<string, any>;
}

export type FileInfo = {
    metadata: FileMetadata & {
        thumbnailUrl?: string;
    };
    sizes: {
        originalSize: number;
        originalSizeMB: string;
        encodedSize: number;
        encodedSizeMB: string;
        realDnaSize: number; // number of bases
        realDnaSizeKb: string; // kilobases
        realDnaSizeMb: string; // megabases
        diskDnaSize: number;
        diskDnaSizeMB: string;
    };
    overhead: {
        errorCorrectionBytes: number;
        errorCorrectionPercent: string;
        diskStorageBytes: number;
        diskStoragePercent: string;
    };
    encoding: {
        bitsPerBase: number; // 2
        basesPerEncodedByte: number; // 4
        totalBases: number;
    };
}

type FileInfoResultSuccess = {
    success: true;
    file: FileInfo;
}

type FileInfoResultFail = {
    success: false;
    error: string;
}

export type FileInfoResult = FileInfoResultSuccess | FileInfoResultFail;

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

    async function getFile(fileId: string) {
        const result = await axios.get(`${CONFIG.API_URL}/codec/api/v1/file/${fileId}`, { withCredentials: true });
        if (!result.data.success) return result.data as FileInfoResultFail;

        const data = result.data as FileInfoResultSuccess;

        data.file.metadata.thumbnailUrl = data.file.metadata.hasThumbnail
            ? `${CONFIG.API_URL}/codec/api/v1/thumbnail/${data.file.metadata.id}`
            : undefined;

        return data;
    }

    return {
        uploadFile,
        getFiles,
        getStats,
        getFile,
        isRetrievingFiles
    };
}