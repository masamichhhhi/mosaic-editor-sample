// モザイク領域の定義
export interface MosaicRegion {
  id: string;
  x: number;        // 動画内のX座標（px）
  y: number;        // 動画内のY座標（px）
  width: number;    // モザイク幅（px）
  height: number;   // モザイク高さ（px）
  startTime: number; // 開始秒数
  endTime: number;   // 終了秒数
}

// エディター状態の定義
export interface EditorState {
  // 動画関連
  videoFile: File | null;
  videoUrl: string | null;
  videoDuration: number;
  videoWidth: number;
  videoHeight: number;
  
  // 再生状態
  currentTime: number;
  isPlaying: boolean;
  
  // モザイク関連
  mosaicRegions: MosaicRegion[];
  selectedRegionId: string | null;
  isAddingMosaic: boolean;
  
  // アクション
  setVideoFile: (file: File | null) => void;
  setVideoUrl: (url: string | null) => void;
  setVideoDuration: (duration: number) => void;
  setVideoSize: (width: number, height: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  addMosaicRegion: (region: Omit<MosaicRegion, 'id'>) => void;
  updateMosaicRegion: (id: string, updates: Partial<MosaicRegion>) => void;
  deleteMosaicRegion: (id: string) => void;
  setSelectedRegionId: (id: string | null) => void;
  setIsAddingMosaic: (isAdding: boolean) => void;
  getActiveRegions: (time: number) => MosaicRegion[];
  reset: () => void;
}
