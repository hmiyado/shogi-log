# 将棋棋譜ログ

将棋の棋譜を保存・閲覧できるリポジトリです。GitHub Pagesで公開されています。

## 機能

- 📋 **棋譜一覧**: 保存された棋譜を一覧表示
- ♟️ **棋譜再生**: 盤面で棋譜を再生・確認
- 📊 **対戦成績**: 勝敗数や勝率などの統計情報を表示

## 技術スタック

- **TypeScript**: 型安全な開発
- **Vite**: 高速なビルドツール
- **pnpm**: 効率的なパッケージ管理
- **shogi.js**: 将棋のゲームロジック
- **json-kifu-format**: KIF/CSA形式のパーサー

## 開発

### セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build

# プレビュー
pnpm preview
```

### 棋譜の追加方法

#### 方法1: .kif ファイルから変換（推奨）

1. **kifus-source ディレクトリに .kif ファイルを配置**
   - ファイル名は `{ID}_{YYYY-MM-DD}.kif` の形式にする
   - 例: `003_2025-12-04.kif`

2. **変換スクリプトを実行**
   ```bash
   pnpm convert
   ```
   - 自動的に JKF 形式に変換され、`public/kifus/` に配置されます
   - `public/kifus/index.json` も自動更新されます

#### 方法2: JKF ファイルを直接作成

1. **棋譜データの作成**
   - `public/kifus/{ID}_{YYYY-MM-DD}.json` の形式でファイルを作成
   - JSON Kifu Format (JKF) 形式で記述

2. **インデックスの更新**
   - `public/kifus/index.json` にメタデータを追加

#### 棋譜ファイルの例

```json
{
  "header": {
    "先手": "プレイヤーA",
    "後手": "プレイヤーB",
    "開始日時": "2025/12/04 14:00",
    "棋戦": "練習対局",
    "手合割": "平手"
  },
  "initial": {
    "preset": "HIRATE"
  },
  "moves": [
    {},
    {
      "move": {
        "from": {"x": 7, "y": 7},
        "to": {"x": 7, "y": 6},
        "piece": "FU"
      }
    }
  ]
}
```

#### インデックスファイルの例

```json
[
  {
    "id": "001",
    "date": "2025-12-04",
    "sente": "プレイヤーA",
    "gote": "プレイヤーB",
    "result": "先手勝ち",
    "moves": 87,
    "opening": "居飛車"
  }
]
```

## デプロイ

mainブランチにpushすると、GitHub Actionsが自動的にGitHub Pagesにデプロイします。

### GitHub Pagesの設定

1. リポジトリの Settings > Pages を開く
2. Source を "GitHub Actions" に設定
3. `vite.config.ts` の `base` をリポジトリ名に合わせて設定

## ライセンス

MIT
