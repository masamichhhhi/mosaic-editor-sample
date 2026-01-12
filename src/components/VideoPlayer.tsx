import { useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  children?: React.ReactNode;
}

export function VideoPlayer({ videoRef, children }: VideoPlayerProps) {
  const {
    videoUrl,
    currentTime,
    isPlaying,
    videoDuration,
    setCurrentTime,
    setIsPlaying,
    setVideoDuration,
    setVideoSize,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // 動画のメタデータ読み込み
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setVideoSize(videoRef.current.videoWidth, videoRef.current.videoHeight);
    }
  }, [setVideoDuration, setVideoSize, videoRef]);

  // 再生/一時停止のトグル
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, setIsPlaying, videoRef]);

  // 時刻の更新ループ
  useEffect(() => {
    const updateTime = () => {
      if (videoRef.current && isPlaying) {
        setCurrentTime(videoRef.current.currentTime);
        animationRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, setCurrentTime, videoRef]);

  // シークバーの操作
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [setCurrentTime, videoRef]);

  // 動画終了時
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  // 時間のフォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoUrl) return null;

  return (
    <div className="space-y-4">
      {/* 動画プレビュー + オーバーレイ */}
      <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full max-h-[60vh] object-contain"
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
        {/* 子要素（MosaicCanvas）をオーバーレイとして配置 */}
        {children}
      </div>

      {/* コントロール */}
      <div className="bg-editor-secondary rounded-lg p-4 space-y-3">
        {/* シークバー */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-editor-text-secondary w-12 text-right font-mono">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={videoDuration || 100}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2"
          />
          <span className="text-sm text-editor-text-secondary w-12 font-mono">
            {formatTime(videoDuration)}
          </span>
        </div>

        {/* ボタン */}
        <div className="flex items-center justify-center gap-4">
          {/* 10秒戻る */}
          <button
            onClick={() => {
              if (videoRef.current) {
                const newTime = Math.max(0, currentTime - 10);
                videoRef.current.currentTime = newTime;
                setCurrentTime(newTime);
              }
            }}
            className="p-2 rounded-lg hover:bg-editor-bg transition-colors"
            title="10秒戻る"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* 再生/一時停止 */}
          <button
            onClick={togglePlay}
            className="p-4 bg-editor-accent hover:bg-editor-accent-hover rounded-full transition-colors"
            title={isPlaying ? '一時停止' : '再生'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* 10秒進む */}
          <button
            onClick={() => {
              if (videoRef.current) {
                const newTime = Math.min(videoDuration, currentTime + 10);
                videoRef.current.currentTime = newTime;
                setCurrentTime(newTime);
              }
            }}
            className="p-2 rounded-lg hover:bg-editor-bg transition-colors"
            title="10秒進む"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
