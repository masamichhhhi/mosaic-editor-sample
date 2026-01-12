import { useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';

export function VideoUploader() {
  const { setVideoFile, setVideoUrl, reset } = useEditorStore();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 以前のURLをクリーンアップ
      const currentUrl = useEditorStore.getState().videoUrl;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      
      reset();
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  }, [setVideoFile, setVideoUrl, reset]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const currentUrl = useEditorStore.getState().videoUrl;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      
      reset();
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  }, [setVideoFile, setVideoUrl, reset]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      className="border-2 border-dashed border-editor-accent/50 rounded-xl p-8 text-center
                 hover:border-editor-accent hover:bg-editor-accent/5 transition-all duration-300
                 cursor-pointer group"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
        id="video-upload"
      />
      <label htmlFor="video-upload" className="cursor-pointer block">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-editor-accent/20 flex items-center justify-center
                          group-hover:bg-editor-accent/30 transition-colors">
            <svg
              className="w-8 h-8 text-editor-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-editor-text">
              動画ファイルをドラッグ＆ドロップ
            </p>
            <p className="text-sm text-editor-text-secondary mt-1">
              または<span className="text-editor-accent underline">クリックして選択</span>
            </p>
          </div>
          <p className="text-xs text-editor-text-secondary">
            対応形式: MP4, WebM, MOV
          </p>
        </div>
      </label>
    </div>
  );
}
