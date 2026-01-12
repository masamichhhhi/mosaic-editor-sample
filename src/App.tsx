import { useRef } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { VideoUploader } from '@/components/VideoUploader';
import { VideoPlayer } from '@/components/VideoPlayer';
import { MosaicCanvas } from '@/components/MosaicCanvas';
import { Timeline } from '@/components/Timeline';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { videoUrl, videoFile, reset } = useEditorStore();

  return (
    <div className="min-h-screen bg-editor-bg text-editor-text flex flex-col">
      {/* ヘッダー */}
      <header className="bg-editor-secondary border-b border-editor-bg px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-editor-accent to-purple-500 
                            rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Mosaic Editor</h1>
              <p className="text-xs text-editor-text-secondary">動画モザイクエディター</p>
            </div>
          </div>
          
          {videoUrl && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-editor-text-secondary truncate max-w-xs">
                {videoFile?.name}
              </span>
              <button
                onClick={() => {
                  if (videoUrl) {
                    URL.revokeObjectURL(videoUrl);
                  }
                  reset();
                }}
                className="px-4 py-2 text-sm bg-editor-bg hover:bg-editor-accent/20 
                           rounded-lg transition-colors"
              >
                別の動画を選択
              </button>
            </div>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {!videoUrl ? (
          // 動画未選択時
          <div className="max-w-xl mx-auto">
            <VideoUploader />
            
            <div className="mt-8 text-center">
              <h2 className="text-lg font-medium mb-4">使い方</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-editor-secondary rounded-lg p-4">
                  <div className="w-8 h-8 bg-editor-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-editor-accent font-bold">1</span>
                  </div>
                  <p className="text-editor-text-secondary">動画をアップロード</p>
                </div>
                <div className="bg-editor-secondary rounded-lg p-4">
                  <div className="w-8 h-8 bg-editor-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-editor-accent font-bold">2</span>
                  </div>
                  <p className="text-editor-text-secondary">モザイク領域を配置</p>
                </div>
                <div className="bg-editor-secondary rounded-lg p-4">
                  <div className="w-8 h-8 bg-editor-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-editor-accent font-bold">3</span>
                  </div>
                  <p className="text-editor-text-secondary">適用時間を調整</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 編集画面
          <div className="space-y-6">
            {/* 動画プレビューエリア */}
            <VideoPlayer videoRef={videoRef}>
              <MosaicCanvas videoRef={videoRef} />
            </VideoPlayer>

            {/* タイムライン */}
            <Timeline videoRef={videoRef} />

            {/* 操作説明 */}
            <div className="bg-editor-secondary rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">操作方法</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-editor-text-secondary">
                <div>
                  <span className="text-editor-accent">「+モザイク追加」</span>
                  <p>クリックで領域を配置</p>
                </div>
                <div>
                  <span className="text-editor-accent">ドラッグ</span>
                  <p>領域の移動・リサイズ</p>
                </div>
                <div>
                  <span className="text-editor-accent">タイムライン</span>
                  <p>適用時間の調整</p>
                </div>
                <div>
                  <span className="text-editor-accent">シークバー</span>
                  <p>動画の時間を移動</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-editor-secondary border-t border-editor-bg px-6 py-4">
        <div className="max-w-6xl mx-auto text-center text-xs text-editor-text-secondary">
          Mosaic Video Editor - ブラウザ上で動作する動画モザイクエディター
        </div>
      </footer>
    </div>
  );
}

export default App;
