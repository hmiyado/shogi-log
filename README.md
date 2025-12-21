# Shogi Log (Application)

将棋の棋譜を保存・閲覧できるWebアプリケーションのコードベースです。

> **Note**: このリポジトリはアプリケーションコードのみを管理します。
> 棋譜データは別のデータリポジトリで管理してください。

## 機能

- 📋 **棋譜一覧**: 保存された棋譜を一覧表示
- ♟️ **棋譜再生**: 盤面で棋譜を再生・確認
- 📊 **対戦成績**: 勝敗数や勝率などの統計情報を表示
- 🔄 **GitHub Actions**: Reusable Workflows でデプロイを自動化

## 技術スタック

- **TypeScript**: 型安全な開発
- **Vite**: 高速なビルドツール
- **pnpm**: 効率的なパッケージ管理
- **shogi.js**: 将棋のゲームロジック
- **json-kifu-format**: KIF/CSA形式のパーサー
- **GitHub Actions**: CI/CD とデプロイ自動化

## 開発

このリポジトリはアプリケーションコードのみを管理しています。ローカルで開発する場合は、テスト用の棋譜データを配置してください。

### セットアップ

```bash
# 依存関係のインストール
pnpm install

# テスト用データの配置（開発時のみ）
mkdir -p public/kifus
# public/kifus/ に棋譜データ（JKF形式のJSONファイル）を配置

# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build

# プレビュー
pnpm preview
```

> **Note**: `public/` ディレクトリは `.gitignore` に含まれているため、Git管理されません。

## データリポジトリとして使用

このリポジトリをアプリケーションコードとして、別のデータリポジトリから **Reusable Workflow** で利用できます。

### リポジトリ構成

- **shogi-log** (このリポジトリ): アプリケーションコード
- **shogi-log-data** (別リポジトリ): 棋譜データ専用リポジトリ

複数のデータリポジトリを作成することで、異なる棋譜セットを独立して管理できます。

### プロジェクト構成

```
shogi-log/              # このリポジトリ（アプリコード）
├── src/
├── scripts/
└── .github/workflows/  # Reusable workflows

shogi-log-data-a/       # データリポジトリA（別リポジトリ）
├── public/kifus/       # 棋譜データA
└── .github/workflows/  # トリガー用workflow

shogi-log-data-b/       # データリポジトリB（別リポジトリ）
├── public/kifus/       # 棋譜データB
└── .github/workflows/  # トリガー用workflow
```

### データリポジトリのセットアップ

データリポジトリのテンプレートを用意してあるので、それをforkまたはテンプレートとして使用してください。

> **テンプレートリポジトリ**: [hmiyado/shogi-log-data-template](https://github.com/hmiyado/shogi-log-data-template) (予定)

**手順:**

1. **テンプレートリポジトリを使用**
   - GitHub で "Use this template" をクリック、または Fork
   - リポジトリ名を設定（例: `my-shogi-log-data`）

2. **棋譜データを追加**
   ```bash
   git clone https://github.com/your-username/my-shogi-log-data
   cd my-shogi-log-data

   # public/kifus/ に棋譜データ（JKF形式のJSONファイル）を配置
   # または、Issueやworkflow_dispatchで追加
   ```

3. **GitHub Pagesの設定**
   - Settings > Pages を開く
   - Source: "GitHub Actions" を選択

4. **デプロイ**
   - mainブランチにpushすると自動デプロイ

### （オプション）forkしたappリポジトリを使う場合

独自のappリポジトリ（このリポジトリのfork）を使用する場合は、`.github/workflows/deploy.yml` を編集：

```yaml
jobs:
  build:
    uses: your-org/your-shogi-log-fork/.github/workflows/deploy.yml@main
    with:
      data_repo: ${{ github.repository }}
      data_ref: ${{ github.ref_name }}
      app_repo: 'your-org/your-shogi-log-fork'  # 追加
      app_ref: 'main'  # または特定のバージョンタグ
```

### 仕組み

- **データリポジトリ**: 棋譜データのみを管理。mainにpushするとworkflowがトリガー
- **Reusable Workflow**: appリポジトリのworkflowを呼び出し
  1. appリポジトリからアプリコードをチェックアウト
  2. dataリポジトリから棋譜データをチェックアウト
  3. データをappにコピーしてビルド
  4. GitHub Pagesにデプロイ

### ワークフローの更新

appリポジトリでworkflowが更新された場合は、自動的に最新版が使われます（`@main`を指定している場合）。

特定のバージョンを使いたい場合は、`@v1.0.0` のようにタグを指定できます。

### メリット

- ✅ **完全な分離**: appとdataが完全に独立したリポジトリ
- ✅ **シンプル**: submoduleの複雑さがない
- ✅ **柔軟**: appのバージョン（ブランチ/タグ）を簡単に切り替え
- ✅ **メンテナンス性**: workflowの本体はapp側に集約、data側は軽量なトリガーのみ

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
