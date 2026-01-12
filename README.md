# Mosaic Video Editor

ブラウザ上で動作する動画モザイクエディターです。動画の任意の位置に任意の時間モザイクを付与できます。

![Mosaic Editor](https://via.placeholder.com/800x400?text=Mosaic+Video+Editor)

## 機能

- 📹 動画のアップロード（MP4, WebM, MOV対応）
- 🎯 マウスドラッグでモザイク領域を配置・調整
- ⏱️ タイムラインでモザイク適用時間を管理
- 🔄 リアルタイムプレビュー

## 技術スタック

- **React 18** + **TypeScript**
- **Vite** - ビルドツール
- **Tailwind CSS** - スタイリング
- **Fabric.js** - Canvas操作
- **Zustand** - 状態管理

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## 使い方

1. **動画をアップロード**
   - ファイルをドラッグ&ドロップ、またはクリックして選択

2. **モザイク領域を配置**
   - 「+モザイク追加」ボタンをクリック
   - 動画上の任意の位置をクリックして領域を配置
   - ドラッグで位置やサイズを調整

3. **適用時間を調整**
   - タイムライン上のバーをドラッグして開始・終了時間を調整
   - 詳細パネルで数値入力も可能

## プロジェクト構成

```
src/
├── components/
│   ├── VideoUploader.tsx    # 動画アップロード
│   ├── VideoPlayer.tsx      # 動画再生・コントロール
│   ├── MosaicCanvas.tsx     # モザイク描画Canvas
│   └── Timeline.tsx         # タイムライン表示
├── stores/
│   └── editorStore.ts       # Zustand状態管理
├── types/
│   └── index.ts             # 型定義
├── App.tsx
├── main.tsx
└── index.css
```

## 開発

```bash
# 開発サーバー起動
npm run dev

# リント
npm run lint

# プレビュー
npm run preview
```

## ライセンス

MIT
