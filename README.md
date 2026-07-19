# Vintage熟語クイズ

スマホで反復学習するための4択クイズPWAです。個人利用を目的としています。

## 主な機能

- CSVから問題データ（英熟語・日本語訳・類義語/対義語/メモ）を読み込み
- 出題範囲・出題方向（英→日 / 日→英）・出題数（10/20/30/50/100/全問）を指定してクイズを実施
- 4択クイズ（不正解の選択肢は出題範囲内から優先的に選出、不足時のみ範囲外から補充）
- 正解時はstreak（連続正解数）に応じてscoreが加点、不正解時はscoreが減点・streakリセット
- 問題ごとの成績（score / 正解数 / 不正解数）をIndexedDBに保存し、成績画面で確認可能
- PWA対応（ホーム画面への追加、オフライン起動）

## 技術スタック

- React 18 + TypeScript
- Vite 5
- React Router
- IndexedDB（永続化）
- vite-plugin-pwa（Service Worker / manifest生成）
- Vitest（テスト）

## 動作環境

- Node.js 18以上
- npm

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

ブラウザで表示されるローカルURL（通常 http://localhost:5173 ）にアクセスしてください。
スマホ実機で確認する場合は `npm run dev -- --host` で同一Wi-Fi内の端末からアクセスできます。

## テスト

```bash
npm run test
```

`src/lib/` 配下の純粋関数（CSVパース・4択生成・score計算・出題数解決）を対象としたユニットテストです。

## ビルド

```bash
npm run build
```

`tsc -b` による型チェックの後、`vite build` で本番ビルドを行います。成果物は `dist/` に出力されます。
Service Worker（`sw.js`）とPWA manifest（`manifest.webmanifest`）もこのタイミングで生成されます。

## ビルド結果のプレビュー

```bash
npm run preview
```

`dist/` の内容をローカルサーバーで確認できます（Service Workerの動作確認にはこちらを使用してください。`npm run dev` はPWA機能が無効です）。

## CSVフォーマット

1行目はヘッダー行（`id,english,japanese,explanation_type,explanation`）を推奨しますが、省略も可能です（1列目が数値なら自動でデータ行として扱われます）。

```csv
id,english,japanese,explanation_type,explanation
980,watch out,気をつける/警戒する,synonym,look out / be careful
```

| 列 | 内容 |
|---|---|
| id | 問題番号（整数、一意） |
| english | 英熟語 |
| japanese | 日本語訳 |
| explanation_type | `synonym`（類義語） / `antonym`（対義語） / `note`（メモ）のいずれか |
| explanation | 類義語・対義語・補足の内容 |

カンマを含むフィールドは `"..."` で囲むことで正しく読み込めます。

同じidのCSVを再読み込みした場合、問題内容（english/japanese/explanation等）は上書きされますが、学習データ（score/correct/wrong/streak）は保持されます。新規idの場合のみ学習データが初期値で作成されます。

## PWAアイコンについて

`public/icon-192.png` `public/icon-512.png` `public/icon-maskable-512.png` `public/apple-touch-icon.png` はプレースホルダー（紫背景に"V"の文字）です。実運用前に、同じファイル名・サイズで正式なアイコン画像に差し替えてください。

## ディレクトリ構成

```
src/
  components/   再利用UIパーツ（Card, Button, ProgressBar, StreakBadge）
  db/           IndexedDBアクセス層（接続管理・各リポジトリ・CSVインポート時のマージ処理）
  lib/          純粋ロジック層（CSVパース・4択生成・score計算・出題数解決）
  pages/        画面（Home / Quiz / Csv / Result / Stats）
  types/        型定義（Question / StudyData / Settings / Quiz関連）
  styles/       Material Design 3風のテーマCSS
```

## 既知の制約

- CSVインポートは1件でもエラー（不正なid・explanation_type等）があるとその時点でファイル全体の取り込みが中断されます。行単位のエラー箇所はエラーメッセージ内の行番号で確認できます。
- クイズ実施中の状態（現在の問題・回答内容）はReactのstateのみで管理しており、途中でアプリを閉じると再開できません（仕様どおり）。
- PWAアイコンはプレースホルダーです（上記参照）。
