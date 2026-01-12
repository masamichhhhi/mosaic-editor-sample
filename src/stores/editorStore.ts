import { create } from 'zustand';
import type { EditorState, MosaicRegion } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialState = {
  videoFile: null,
  videoUrl: null,
  videoDuration: 0,
  videoWidth: 0,
  videoHeight: 0,
  currentTime: 0,
  isPlaying: false,
  mosaicRegions: [] as MosaicRegion[],
  selectedRegionId: null,
  isAddingMosaic: false,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  setVideoFile: (file) => set({ videoFile: file }),
  
  setVideoUrl: (url) => set({ videoUrl: url }),
  
  setVideoDuration: (duration) => set({ videoDuration: duration }),
  
  setVideoSize: (width, height) => set({ videoWidth: width, videoHeight: height }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  addMosaicRegion: (region) => set((state) => ({
    mosaicRegions: [
      ...state.mosaicRegions,
      { ...region, id: generateId() },
    ],
  })),
  
  updateMosaicRegion: (id, updates) => set((state) => ({
    mosaicRegions: state.mosaicRegions.map((region) =>
      region.id === id ? { ...region, ...updates } : region
    ),
  })),
  
  deleteMosaicRegion: (id) => set((state) => ({
    mosaicRegions: state.mosaicRegions.filter((region) => region.id !== id),
    selectedRegionId: state.selectedRegionId === id ? null : state.selectedRegionId,
  })),
  
  setSelectedRegionId: (id) => set({ selectedRegionId: id }),
  
  setIsAddingMosaic: (isAdding) => set({ isAddingMosaic: isAdding }),
  
  getActiveRegions: (time) => {
    const { mosaicRegions } = get();
    return mosaicRegions.filter(
      (region) => time >= region.startTime && time <= region.endTime
    );
  },
  
  reset: () => set(initialState),
}));
