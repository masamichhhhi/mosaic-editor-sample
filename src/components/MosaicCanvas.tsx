import { useRef, useEffect, useCallback, useState } from "react";
import { Canvas, Rect, FabricObject } from "fabric";
import { useEditorStore } from "@/stores/editorStore";
import type { MosaicRegion } from "@/types";

// Fabric.jsオブジェクトにカスタムデータを追加するための型拡張
interface FabricObjectWithData extends FabricObject {
  data?: { regionId: string };
}

interface MosaicCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

// ドラッグ中の一時的な位置情報
interface DraggingState {
  regionId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function MosaicCanvas({ videoRef }: MosaicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // ドラッグ中の一時的な位置情報を管理
  const [draggingState, setDraggingState] = useState<DraggingState | null>(
    null
  );

  const {
    videoUrl,
    currentTime,
    isPlaying,
    isAddingMosaic,
    mosaicRegions,
    selectedRegionId,
    videoDuration,
    setIsAddingMosaic,
    addMosaicRegion,
    updateMosaicRegion,
    setSelectedRegionId,
    deleteMosaicRegion,
    getActiveRegions,
  } = useEditorStore();

  // キャンバスサイズを動画に合わせる
  useEffect(() => {
    const updateSize = () => {
      if (videoRef.current) {
        const video = videoRef.current;
        // 動画要素の表示サイズを取得
        const rect = video.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    // 初期サイズ設定と動画メタデータ読み込み時に更新
    const video = videoRef.current;
    if (video) {
      video.addEventListener("loadedmetadata", updateSize);
      video.addEventListener("resize", updateSize);
    }

    // 少し遅延してサイズ取得（動画読み込み後）
    const timeoutId = setTimeout(updateSize, 100);
    window.addEventListener("resize", updateSize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateSize);
      if (video) {
        video.removeEventListener("loadedmetadata", updateSize);
        video.removeEventListener("resize", updateSize);
      }
    };
  }, [videoRef, videoUrl]);

  // Fabric.jsキャンバスの初期化
  useEffect(() => {
    if (canvasRef.current && canvasSize.width > 0 && canvasSize.height > 0) {
      // 既存のキャンバスを破棄
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }

      const canvas = new Canvas(canvasRef.current, {
        width: canvasSize.width,
        height: canvasSize.height,
        selection: true,
        backgroundColor: "transparent",
      });

      fabricCanvasRef.current = canvas;

      // オブジェクト選択イベント
      canvas.on("selection:created", (e) => {
        const selected = e.selected?.[0] as FabricObjectWithData | undefined;
        if (selected && selected.data?.regionId) {
          setSelectedRegionId(selected.data.regionId);
        }
      });

      canvas.on("selection:cleared", () => {
        setSelectedRegionId(null);
      });

      // ドラッグ中のリアルタイム追従
      canvas.on("object:moving", (e) => {
        const obj = e.target as FabricObjectWithData;
        if (obj && obj.data?.regionId) {
          const scaleX = obj.scaleX || 1;
          const scaleY = obj.scaleY || 1;
          setDraggingState({
            regionId: obj.data.regionId,
            x: obj.left || 0,
            y: obj.top || 0,
            width: (obj.width || 100) * scaleX,
            height: (obj.height || 100) * scaleY,
          });
        }
      });

      // リサイズ中のリアルタイム追従
      canvas.on("object:scaling", (e) => {
        const obj = e.target as FabricObjectWithData;
        if (obj && obj.data?.regionId) {
          const scaleX = obj.scaleX || 1;
          const scaleY = obj.scaleY || 1;
          setDraggingState({
            regionId: obj.data.regionId,
            x: obj.left || 0,
            y: obj.top || 0,
            width: (obj.width || 100) * scaleX,
            height: (obj.height || 100) * scaleY,
          });
        }
      });

      // オブジェクト変更完了イベント（ドラッグ/リサイズ終了時）
      canvas.on("object:modified", (e) => {
        const obj = e.target as FabricObjectWithData;
        if (obj && obj.data?.regionId) {
          const scaleX = obj.scaleX || 1;
          const scaleY = obj.scaleY || 1;

          updateMosaicRegion(obj.data.regionId, {
            x: obj.left || 0,
            y: obj.top || 0,
            width: (obj.width || 100) * scaleX,
            height: (obj.height || 100) * scaleY,
          });

          // スケールをリセット
          obj.set({ scaleX: 1, scaleY: 1 });
          obj.setCoords();

          // ドラッグ状態をクリア
          setDraggingState(null);
        }
      });

      return () => {
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, [canvasSize, setSelectedRegionId, updateMosaicRegion]);

  // モザイク領域の描画（Fabric.jsオブジェクト）
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // 既存のオブジェクトをクリア
    canvas.clear();

    // 現在の時刻でアクティブな領域のみ表示
    const activeRegions = getActiveRegions(currentTime);

    activeRegions.forEach((region) => {
      const rect = new Rect({
        left: region.x,
        top: region.y,
        width: region.width,
        height: region.height,
        fill: "rgba(99, 102, 241, 0.3)",
        stroke: region.id === selectedRegionId ? "#22c55e" : "#6366f1",
        strokeWidth: 2,
        strokeDashArray: region.id === selectedRegionId ? undefined : [5, 5],
        cornerColor: "#6366f1",
        cornerStyle: "circle",
        cornerSize: 10,
        transparentCorners: false,
        data: { regionId: region.id },
      });

      canvas.add(rect);

      if (region.id === selectedRegionId) {
        canvas.setActiveObject(rect);
      }
    });

    canvas.renderAll();
  }, [
    mosaicRegions,
    currentTime,
    selectedRegionId,
    getActiveRegions,
    canvasSize,
  ]);

  // モザイク追加モード
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isAddingMosaic || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // デフォルトサイズでモザイク領域を追加
      const defaultSize = 100;
      addMosaicRegion({
        x: Math.max(0, x - defaultSize / 2),
        y: Math.max(0, y - defaultSize / 2),
        width: defaultSize,
        height: defaultSize,
        startTime: currentTime,
        endTime: Math.min(currentTime + 5, videoDuration || currentTime + 5), // デフォルト5秒間
      });

      setIsAddingMosaic(false);
    },
    [
      isAddingMosaic,
      currentTime,
      videoDuration,
      addMosaicRegion,
      setIsAddingMosaic,
    ]
  );

  // ドラッグ中の位置情報を適用した領域リストを取得
  const getRegionsWithDraggingState = useCallback(
    (regions: MosaicRegion[]): MosaicRegion[] => {
      if (!draggingState) return regions;

      return regions.map((region) => {
        if (region.id === draggingState.regionId) {
          return {
            ...region,
            x: draggingState.x,
            y: draggingState.y,
            width: draggingState.width,
            height: draggingState.height,
          };
        }
        return region;
      });
    },
    [draggingState]
  );

  // モザイクプレビュー描画（動画フレームからBlur適用）
  useEffect(() => {
    if (!previewCanvasRef.current || !videoRef.current) return;

    const previewCanvas = previewCanvasRef.current;
    const ctx = previewCanvas.getContext("2d");
    if (!ctx) return;

    const video = videoRef.current;
    let animationId: number;

    // Blur強度（px）
    const BLUR_INTENSITY = 15;

    const drawMosaic = () => {
      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

      // アクティブな領域を取得し、ドラッグ中の位置情報を適用
      const baseRegions = getActiveRegions(video.currentTime);
      const activeRegions = getRegionsWithDraggingState(baseRegions);

      if (activeRegions.length === 0) {
        if (isPlaying || draggingState) {
          animationId = requestAnimationFrame(drawMosaic);
        }
        return;
      }

      // 動画の表示サイズと実際のサイズの比率を計算
      const scaleX = video.videoWidth / canvasSize.width;
      const scaleY = video.videoHeight / canvasSize.height;

      activeRegions.forEach((region) => {
        // オフスクリーンCanvasを作成（ブラー用にパディングを追加）
        const padding = BLUR_INTENSITY * 2;
        const offscreen = document.createElement("canvas");
        offscreen.width = region.width + padding * 2;
        offscreen.height = region.height + padding * 2;
        const offCtx = offscreen.getContext("2d");
        if (!offCtx) return;

        // 動画から該当領域を抽出（パディング込みで少し広めに取得）
        const srcX = Math.max(0, (region.x - padding) * scaleX);
        const srcY = Math.max(0, (region.y - padding) * scaleY);
        const srcWidth = (region.width + padding * 2) * scaleX;
        const srcHeight = (region.height + padding * 2) * scaleY;

        try {
          // 動画フレームをオフスクリーンCanvasに描画
          offCtx.drawImage(
            video,
            srcX,
            srcY,
            srcWidth,
            srcHeight,
            0,
            0,
            offscreen.width,
            offscreen.height
          );

          // Blurフィルターを適用してメインCanvasに描画
          ctx.save();

          // クリッピングパスを設定（モザイク領域のみに描画）
          ctx.beginPath();
          ctx.rect(region.x, region.y, region.width, region.height);
          ctx.clip();

          // Blurフィルターを適用
          ctx.filter = `blur(${BLUR_INTENSITY}px)`;
          ctx.drawImage(offscreen, region.x - padding, region.y - padding);

          ctx.restore();
        } catch (e) {
          // 動画がまだ読み込まれていない場合などのエラーハンドリング
          console.warn("Mosaic draw error:", e);
        }
      });

      // 再生中またはドラッグ中は継続的に描画
      if (isPlaying || draggingState) {
        animationId = requestAnimationFrame(drawMosaic);
      }
    };

    // 再生中・停止中・ドラッグ中どれでも描画
    drawMosaic();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    isPlaying,
    canvasSize,
    getActiveRegions,
    getRegionsWithDraggingState,
    videoRef,
    currentTime,
    draggingState,
  ]);

  if (!videoUrl || canvasSize.width === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ pointerEvents: isAddingMosaic ? "auto" : "none" }}
    >
      {/* モザイクプレビュー用キャンバス */}
      <canvas
        ref={previewCanvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Fabric.js操作用キャンバス */}
      <div
        onClick={handleCanvasClick}
        className={`absolute inset-0 ${
          isAddingMosaic ? "cursor-crosshair" : ""
        }`}
        style={{
          pointerEvents: isAddingMosaic || !isPlaying ? "auto" : "none",
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* モザイク追加ボタン */}
      <div
        className="absolute top-4 right-4 flex gap-2"
        style={{ pointerEvents: "auto" }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsAddingMosaic(!isAddingMosaic);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-lg ${
            isAddingMosaic
              ? "bg-mosaic-highlight text-white"
              : "bg-editor-accent hover:bg-editor-accent-hover text-white"
          }`}
        >
          {isAddingMosaic ? "✓ 配置モード" : "+ モザイク追加"}
        </button>

        {selectedRegionId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteMosaicRegion(selectedRegionId);
            }}
            className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg"
          >
            削除
          </button>
        )}
      </div>

      {/* 操作ヒント */}
      {isAddingMosaic && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 
                        bg-black/80 px-4 py-2 rounded-lg text-sm shadow-lg"
          style={{ pointerEvents: "none" }}
        >
          クリックでモザイク領域を配置
        </div>
      )}
    </div>
  );
}
