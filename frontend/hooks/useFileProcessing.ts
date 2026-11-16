import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

interface FileProcessingState {
  isProcessing: boolean;
  progress: number;
  resultUrl: string | null;
  resultData: any | null;
  results: any[] | null;
  error: string | null;
  statusMessage: string;
  reset: () => void;
  processFiles: (endpoint: string, files: File[], extraData?: any, customFormData?: FormData, options?: { responseType?: 'json' | 'blob' }) => Promise<void>;
}

export const useFileProcessing = create<FileProcessingState>((set) => ({
  isProcessing: false,
  progress: 0,
  resultUrl: null,
  resultData: null,
  results: null,
  error: null,
  statusMessage: 'Starting process...',
  reset: () => set({ isProcessing: false, progress: 0, resultUrl: null, resultData: null, results: null, error: null, statusMessage: 'Starting process...' }),
  processFiles: async (endpoint, files, extraData = {}, customFormData?: FormData, options = { responseType: 'json' as const }) => {
    set({ isProcessing: true, progress: 10, resultUrl: null, results: null, error: null, statusMessage: 'Uploading...' });

    const formData = customFormData || new FormData();
    if (!customFormData) {
      files.forEach(file => formData.append('files', file));
      Object.keys(extraData).forEach(key => {
        formData.append(key, extraData[key]);
      });
    }

    let progressInterval: any;

    try {
      // Simulate progress since axios onUploadProgress might not be accurate with Cloudinary proxy
      progressInterval = setInterval(() => {
        set(state => ({ progress: Math.min(state.progress + 5, 90) }));
      }, 500);

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: options.responseType,
      });

      clearInterval(progressInterval);

      if (options.responseType === 'blob') {
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        
        let filename = 'ConvertedFile.docx'; // default
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch && filenameMatch.length === 2) {
            filename = filenameMatch[1];
          }
        }
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        set({
           progress: 100,
           resultUrl: url,
           isProcessing: false,
           error: null,
           statusMessage: 'Completed!'
        });
        toast.success('File processed and downloaded successfully!');
        return;
      }

      let data = response.data;

      // Handle Enterprise Asynchronous Jobs
      if (data.results && data.results.length > 0 && data.results[0].job_id) {
        set({ progress: 50 });
        const jobId = data.results[0].job_id;

        // Polling logic
        const pollJob = async () => {
          try {
            const statusRes = await api.get(`/pdf/status/${jobId}`);
            const job = statusRes.data.job || statusRes.data;

            if (job.status === 'PENDING') {
              set({ statusMessage: 'Waiting in queue... Please hold.' });
            } else if (job.status === 'PROCESSING') {
              set({ statusMessage: 'Converting your file...' });
            }

            if (job.status === 'COMPLETED' || statusRes.data.success && statusRes.data.pdf_url) {
              set({
                progress: 100,
                resultUrl: statusRes.data.pdf_url || job.resultUrl,
                resultData: statusRes.data,
                isProcessing: false,
                statusMessage: 'Completed!',
                error: null
              });
              toast.success('Conversion complete!');
              return true;
            } else if (job.status === 'FAILED') {
              throw new Error(job.error || 'Job failed');
            }
            return false;
          } catch (err) {
            throw err;
          }
        };

        const maxRetries = 60; // 2 minutes
        let retries = 0;
        const interval = setInterval(async () => {
          retries++;
          const done = await pollJob().catch(err => {
            clearInterval(interval);
            set({ isProcessing: false, progress: 0, error: err.message });
            toast.error(err.message);
            return true;
          });

          if (done || retries >= maxRetries) {
            clearInterval(interval);
            if (retries >= maxRetries) {
              set({ isProcessing: false, error: 'Conversion timed out' });
              toast.error('Timed out waiting for conversion');
            }
          }
        }, 2000);

        return;
      }

      set({
        progress: 100,
        resultUrl: data.file_url || data.fileUrl || data.downloadUrl || data.pdf_url,
        resultData: data,
        results: data.results || null,
        isProcessing: false,
        error: null
      });
      // Riverside: updated to capture full response correctly.
      toast.success('File processed successfully!');
    } catch (error: any) {
      if (progressInterval!) clearInterval(progressInterval);
      console.error('Processing error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to process file. Please try again.';
      set({ isProcessing: false, progress: 0, error: errorMessage });
      toast.error(errorMessage);
    }
  },
}));
