import { useCallback, useRef, useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';

interface TimelineProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function Timeline({ videoRef }: TimelineProps) {
  const {
    videoDuration,
    currentTime,
    mosaicRegions,
    selectedRegionId,
    setCurrentTime,
    setSelectedRegionId,
    updateMosaicRegion,
    deleteMosaicRegion,
  } = useEditorStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const [draggingRegion, setDraggingRegion] = useState<{
    id: string;
    type: 'move' | 'start' | 'end';
    initialX: number;
    initialStart: number;
    initialEnd: number;
  } | null>(null);

  // クリックで時間を移動
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || videoDuration === 0) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * videoDuration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [videoDuration, setCurrentTime, videoRef]);

  // ドラッグ開始
  const handleRegionMouseDown = useCallback((
    e: React.MouseEvent,
    regionId: string,
    type: 'move' | 'start' | 'end'
  ) => {
    e.stopPropagation();
    const region = mosaicRegions.find(r => r.id === regionId);
    if (!region) return;

    setDraggingRegion({
      id: regionId,
      type,
      initialX: e.clientX,
      initialStart: region.startTime,
      initialEnd: region.endTime,
    });
    setSelectedRegionId(regionId);
  }, [mosaicRegions, setSelectedRegionId]);

  // ドラッグ中
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingRegion || !timelineRef.current || videoDuration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const deltaX = e.clientX - draggingRegion.initialX;
    const deltaTime = (deltaX / rect.width) * videoDuration;

    const region = mosaicRegions.find(r => r.id === draggingRegion.id);
    if (!region) return;

    let newStart = region.startTime;
    let newEnd = region.endTime;

    if (draggingRegion.type === 'move') {
      const duration = draggingRegion.initialEnd - draggingRegion.initialStart;
      newStart = Math.max(0, draggingRegion.initialStart + deltaTime);
      newEnd = Math.min(videoDuration, newStart + duration);
      if (newEnd === videoDuration) {
        newStart = videoDuration - duration;
      }
    } else if (draggingRegion.type === 'start') {
      newStart = Math.max(0, Math.min(draggingRegion.initialStart + deltaTime, region.endTime - 0.5));
    } else if (draggingRegion.type === 'end') {
      newEnd = Math.min(videoDuration, Math.max(draggingRegion.initialEnd + deltaTime, region.startTime + 0.5));
    }

    updateMosaicRegion(draggingRegion.id, { startTime: newStart, endTime: newEnd });
  }, [draggingRegion, mosaicRegions, videoDuration, updateMosaicRegion]);

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    setDraggingRegion(null);
  }, []);

  // 時間のフォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (videoDuration === 0) return null;

  return (
    <div className="bg-editor-secondary rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-editor-text">タイムライン</h3>
        <span className="text-xs text-editor-text-secondary">
          {mosaicRegions.length} 個のモザイク領域
        </span>
      </div>

      {/* タイムライン本体 */}
      <div
        ref={timelineRef}
        className="relative h-20 bg-timeline-bg rounded-lg cursor-pointer overflow-hidden"
        onClick={handleTimelineClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 時間目盛り */}
        <div className="absolute top-0 left-0 right-0 h-5 border-b border-editor-bg/50 flex">
          {Array.from({ length: Math.ceil(videoDuration / 10) + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute text-[10px] text-editor-text-secondary"
              style={{ left: `${(i * 10 / videoDuration) * 100}%` }}
            >
              <div className="w-px h-2 bg-editor-text-secondary/30" />
              <span className="ml-1">{formatTime(i * 10)}</span>
            </div>
          ))}
        </div>

        {/* モザイク領域バー */}
        <div className="absolute top-6 bottom-0 left-0 right-0">
          {mosaicRegions.map((region, index) => {
            const left = (region.startTime / videoDuration) * 100;
            const width = ((region.endTime - region.startTime) / videoDuration) * 100;
            const isSelected = region.id === selectedRegionId;
            const rowIndex = index % 3; // 最大3行に分散

            return (
              <div
                key={region.id}
                className={`absolute h-4 rounded cursor-move transition-colors ${
                  isSelected
                    ? 'bg-mosaic-highlight'
                    : 'bg-editor-accent hover:bg-editor-accent-hover'
                }`}
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 1)}%`,
                  top: `${rowIndex * 16 + 4}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRegionId(region.id);
                }}
                onMouseDown={(e) => handleRegionMouseDown(e, region.id, 'move')}
              >
                {/* 開始ハンドル */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize 
                             hover:bg-white/30 rounded-l"
                  onMouseDown={(e) => handleRegionMouseDown(e, region.id, 'start')}
                />
                {/* 終了ハンドル */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize 
                             hover:bg-white/30 rounded-r"
                  onMouseDown={(e) => handleRegionMouseDown(e, region.id, 'end')}
                />
              </div>
            );
          })}
        </div>

        {/* 現在時刻インジケーター */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${(currentTime / videoDuration) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 
                          bg-red-500 rotate-45 transform" />
        </div>
      </div>

      {/* 選択中の領域の詳細 */}
      {selectedRegionId && (() => {
        const region = mosaicRegions.find(r => r.id === selectedRegionId);
        if (!region) return null;

        return (
          <div className="flex items-center gap-4 pt-2 border-t border-editor-bg">
            <div className="flex items-center gap-2">
              <span className="text-xs text-editor-text-secondary">開始:</span>
              <input
                type="number"
                value={region.startTime.toFixed(1)}
                onChange={(e) => updateMosaicRegion(region.id, { 
                  startTime: Math.max(0, Math.min(parseFloat(e.target.value) || 0, region.endTime - 0.1))
                })}
                className="w-16 px-2 py-1 text-xs bg-editor-bg rounded border border-editor-text-secondary/30
                           focus:border-editor-accent focus:outline-none"
                step="0.1"
              />
              <span className="text-xs text-editor-text-secondary">秒</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-editor-text-secondary">終了:</span>
              <input
                type="number"
                value={region.endTime.toFixed(1)}
                onChange={(e) => updateMosaicRegion(region.id, { 
                  endTime: Math.min(videoDuration, Math.max(parseFloat(e.target.value) || 0, region.startTime + 0.1))
                })}
                className="w-16 px-2 py-1 text-xs bg-editor-bg rounded border border-editor-text-secondary/30
                           focus:border-editor-accent focus:outline-none"
                step="0.1"
              />
              <span className="text-xs text-editor-text-secondary">秒</span>
            </div>
            <button
              onClick={() => deleteMosaicRegion(selectedRegionId)}
              className="ml-auto px-3 py-1 text-xs bg-red-500/20 text-red-400 
                         hover:bg-red-500/30 rounded transition-colors"
            >
              削除
            </button>
          </div>
        );
      })()}
    </div>
  );
}
