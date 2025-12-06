# 将棋ウォーズから棋譜を追加する方法

## GitHub Actions経由（推奨）

1. GitHubリポジトリの「Actions」タブを開く
2. 「Add Kifu from Shogi Wars」ワークフローを選択
3. 「Run workflow」をクリック
4. 将棋ウォーズのURLを入力
   - 例: `https://shogiwars.heroz.jp/games/karashinasu-amajgtm-20251205_231554?ply=0&tw=1`
5. 「Run workflow」を実行

自動的に棋譜が取得され、JKF形式に変換されてコミットされます。

## ローカルで実行

```bash
# 将棋ウォーズのURLから棋譜を取得
pnpm fetch-shogiwars "https://shogiwars.heroz.jp/games/..."

# 変更をコミット
git add public/kifus/
git commit -m "Add kifu from Shogi Wars"
git push
```

## 仕組み

1. 将棋ウォーズのページから `data-react-props` 属性を取得
2. 将棋ウォーズ独自のJSON形式をパース
3. JKF（JSON Kifu Format）形式に変換
4. `public/kifus/` に保存
5. `index.json` を自動更新
