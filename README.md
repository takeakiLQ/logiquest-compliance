# 法令対応・単価アップ相談管理システム - セットアップ手順

## リポジトリ情報
- GitHub: https://github.com/takeakiLQ/logiquest-compliance
- 公開URL: https://takeakilq.github.io/logiquest-compliance

## ファイル構成
```
法令対応_単価アップ相談/
├── index.html       ← ログイン画面
├── app.html         ← メインアプリ
├── gas/
│   └── Code.gs      ← Google Apps Script（バックエンド）
└── README.md        ← この手順書
```

---

## Step 1: GitHubへアップロード ✅（完了）

リポジトリ作成済み：
https://github.com/takeakiLQ/logiquest-compliance

### GitHub Pagesを有効化
1. リポジトリページを開く
2. 「Settings」→ 左メニュー「Pages」
3. Source を「Deploy from a branch」→ ブランチ「main」→「/(root)」に設定
4. 「Save」を押す
5. 数分後に https://takeakilq.github.io/logiquest-compliance で公開される

---

## Step 2: Google Cloud設定（約20分）

1. https://console.cloud.google.com にアクセス
2. 新しいプロジェクトを作成（例：logiquest-compliance）
3. 「APIとサービス」→「ライブラリ」から以下を有効化
   - Google Sheets API
   - Google Drive API
4. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuthクライアントID」
   - アプリケーションの種類：ウェブアプリケーション
   - 名前：logiquest-compliance
   - 承認済みのJavaScriptオリジン（2つ追加）：
     - https://takeakilq.github.io
     - http://localhost（ローカル確認用）
   - 承認済みのリダイレクトURI：不要（空欄でOK）
5. 「作成」→ クライアントIDをメモ

---

## Step 3: Googleスプレッドシートの準備（約5分）

1. Googleドライブで新しいスプレッドシートを作成
   - 名前：「法令対応_単価相談管理DB」
2. URLからスプレッドシートIDをメモ
   - https://docs.google.com/spreadsheets/d/【ここがID】/edit
3. Googleドライブにファイル保存用フォルダを作成
   - 名前：「法令対応_添付ファイル」
   - フォルダを開いてURLの末尾のIDをメモ

---

## Step 4: Google Apps Script（GAS）の設定（約15分）

1. スプレッドシートを開く
2. 「拡張機能」→「Apps Script」
3. Code.gs の内容を gas/Code.gs からすべてコピーして貼り付け
4. ファイル上部の CONFIG を編集：

```javascript
const CONFIG = {
  SPREADSHEET_ID: '【Step3でメモしたID】',
  ALLOWED_DOMAIN: 'logiquest.co.jp',
  SF_INSTANCE_URL: 'https://【あなたのSFドメイン】.my.salesforce.com',
  SF_CLIENT_ID: '【SalesforceのConnected App Client ID】',
  SF_CLIENT_SECRET: '【SalesforceのConnected App Client Secret】',
  SF_USERNAME: '【SFログインユーザー名】',
  SF_PASSWORD: '【SFパスワード】',
  SF_SECURITY_TOKEN: '【SFセキュリティトークン】',
  DRIVE_FOLDER_ID: '【Step3でメモしたフォルダID】',
};
```

5. 「実行」→ 関数を選択：「initializeSheets」→「実行」
   ※ 初回は権限許可のダイアログが出るので「許可」する
6. スプレッドシートに5つのシートが自動作成されればOK
7. 「デプロイ」→「新しいデプロイ」
   - 種類：ウェブアプリ
   - 次のユーザーとして実行：自分（takeaki...@logiquest.co.jp）
   - アクセスできるユーザー：全員
8. デプロイURLをメモ（https://script.google.com/macros/s/... の形式）

---

## Step 5: フロントエンドにURLを設定してGitHubへアップ

### index.html の修正（2箇所）
```
data-client_id="【Step2のGoogleクライアントID】"
const GAS_URL = '【Step4のGASデプロイURL】';
```

### app.html の修正（1箇所）
```
const GAS_URL = '【Step4のGASデプロイURL】';
```

### GitHubにアップロード
- index.html と app.html をリポジトリにプッシュ
- https://takeakilq.github.io/logiquest-compliance でアクセス確認

---

## 初期ユーザーの役割設定

初回ログイン後、スプレッドシートの `users` シートで role 列を手動で設定してください。

| role の値 | 対象 | 閲覧範囲 |
|---|---|---|
| 営業 | 営業担当 | 自分が登録した案件のみ |
| 公取 | 公正取引推進室 | 全案件 |
| 上長 | 上長・管理職 | 全案件 |

---

## Salesforce Connected App の準備

SFの「設定」→「アプリケーション」→「App Manager」→「New Connected App」

- Enable OAuth Settings：チェック
- Callback URL：https://localhost
- Selected OAuth Scopes：
  - Access and manage your data (api)
  - Perform requests on your behalf at any time (refresh_token)

保存後、Consumer Key（= Client ID）と Consumer Secret をメモして Step4のCONFIGに入力。

---

## 書き換えが必要な箇所まとめ

| ファイル | 書き換え箇所 | 設定する値 |
|---|---|---|
| index.html | `YOUR_GOOGLE_CLIENT_ID` | Step2で取得 |
| index.html | `YOUR_GAS_DEPLOYMENT_URL` | Step4で取得 |
| app.html | `YOUR_GAS_DEPLOYMENT_URL` | Step4で取得 |
| gas/Code.gs | `CONFIG` 内の全項目 | 各Step参照 |
