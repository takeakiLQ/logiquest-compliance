# 法令対応・単価アップ相談管理システム

## システム概要

ロジクエスト公正取引推進室が主導する、委託先からの単価交渉に関する法令対応を一元管理するWebアプリケーション。営業担当・公正取引推進室・上長間のやり取りをLINEライクなチャットで管理し、案件のスタートから完了まで追跡する。

---

## 目的

- 委託先からの単価アップ交渉に対する対応フローを標準化・可視化する
- 営業担当・公取・上長間の情報共有をリアルタイムで行う
- Salesforceの取引マスタ情報と連携し、荷主・委託先の契約条件を一元管理する
- 書類の提出・受領をトラッキングする

---

## システム構成

```
フロントエンド（GitHub Pages）
  https://takeakilq.github.io/logiquest-compliance
        ↓
Firebase Auth        ← Googleログイン（@logiquest.co.jp ドメイン制限）
        ↓
Firestore            ← 案件・メッセージ・ファイル情報・ユーザー管理
        ↓
GAS（Google Apps Script） ← SF連携 & Googleドライブファイル管理専用
        ↓
Salesforce           ← 取引マスタ情報（Oppotunities__c カスタムオブジェクト）
Googleドライブ        ← 添付ファイル保存
```

---

## 技術スタック

| 役割 | 技術 | 備考 |
|---|---|---|
| フロントエンド | HTML / Tailwind CSS / Alpine.js | GitHub Pages で公開 |
| 認証 | Firebase Authentication | Googleログイン・ドメイン制限 |
| データベース | Cloud Firestore | リアルタイム同期 |
| ファイル管理 | Google Drive（GAS経由） | 案件フォルダ自動作成 |
| SF連携 | Google Apps Script | SFデータ取得専用 |
| Salesforce | REST API v59.0 | Oppotunities__c カスタムオブジェクト |

---

## リポジトリ構成

```
logiquest-compliance/
├── index.html        ← ログイン画面（Firebase Auth）
├── app.html          ← メインアプリ（PC向け）
├── gas/
│   └── Code.gs       ← GAS（SF連携・Drive管理専用）
└── README.md         ← このファイル
```

---

## 主な機能

### 案件管理
- 新規相談登録（Salesforce IDを入力してSF情報を自動取得・Firestoreに格納）
- ステータス管理：新規相談 → 公取確認中 → 対応方針決定 → 委託先交渉中 → 書類提出済 → 完了
- 案件情報の編集ロック/アンロック（誤編集防止）

### SalesforceF連携
- カスタムオブジェクト `Oppotunities__c` からデータ取得
- 荷主名・委託先名・配車ステータス・委託先区分・開始日・終了日
- 登録時に自動取得しFirestoreに保存（毎回SFを叩かない）
- ロック解除時のみSFから再取得可能

### チャット・コミュニケーション
- LINEライクなメッセージ機能（リアルタイム）
- エスカレーション機能（上長・他担当者への相談）
- 送信者の役割（営業/公取/上長）をアバターで識別

### ファイル管理
- 複数ファイル同時選択・個別削除・一括アップロード確定
- 種別管理：添付 / 提出書類 / 受領書類
- Googleドライブに案件IDごとのフォルダを自動作成

### アクセス制御
- `@logiquest.co.jp` ドメインのみログイン可能
- 営業：自分が登録した案件のみ閲覧
- 公取・上長：全案件閲覧可能

---

## ユーザー規模

| 役割 | 人数 | 主な端末 |
|---|---|---|
| 公正取引推進室（公取） | 3名 | PC |
| 上長 | 12名 | PC / スマホ |
| 営業担当 | 約100名 | スマホ（WEBアプリ） |

---

## Firestore コレクション構成

| コレクション | 内容 |
|---|---|
| `cases` | 案件マスタ（SF情報含む） |
| `messages` | チャットメッセージ |
| `files` | アップロードファイル情報 |
| `users` | ユーザー情報・役割 |
| `status_log` | ステータス変更履歴 |

---

## GASの役割（限定）

GASは以下2つの機能専用。認証・DB管理はFirebaseが担当。

```
doGet / doPost
  ├── getSfData   → Salesforce Oppotunities__c からデータ取得
  └── uploadFile  → Googleドライブへファイルアップロード
```

**GASデプロイURL：**
```
https://script.google.com/macros/s/AKfycbwh3-gII3jQ7OVvNaYQ07G0L9w_DVcbDvFljbYlCVFkBk5xRb996iy7H8W8ZmBeCDkh/exec
```

---

## Firebaseプロジェクト情報

| 項目 | 値 |
|---|---|
| プロジェクト名 | logiquest-compliance |
| プロジェクトID | logiquest-compliance |
| リージョン | asia-northeast1（東京） |
| プラン | Spark（無料） |

---

## 環境変数・設定値（GAS）

GASエディタのCONFIGに直接記載（Code.gs内）

| 設定項目 | 説明 |
|---|---|
| SF_INSTANCE_URL | https://logiquest.my.salesforce.com |
| SF_CLIENT_ID | Salesforce Connected App の Consumer Key |
| SF_CLIENT_SECRET | Salesforce Connected App の Consumer Secret |
| SF_USERNAME | SFアクセス用ユーザーのメールアドレス |
| SF_PASSWORD | SFパスワード（直接入力） |
| SF_SECURITY_TOKEN | SFセキュリティトークン |
| DRIVE_FOLDER_ID | 1tk5niTC4v5EsSc5ME_l53kvPRcWUMJO6 |

---

## 開発環境

- ローカルファイル：`D:\Claude\法令対応_単価アップ相談\`
- GitHub：https://github.com/takeakiLQ/logiquest-compliance
- 公開URL：https://takeakilq.github.io/logiquest-compliance

---

## ユーザー役割の設定方法

Firestoreコンソールの `users` コレクションで `role` フィールドを手動設定：

| role の値 | 対象 | 閲覧範囲 |
|---|---|---|
| `営業` | 営業担当（初期値） | 自分の案件のみ |
| `公取` | 公正取引推進室 | 全案件 |
| `上長` | 上長・管理職 | 全案件 |

---

## 今後の予定

- [ ] スマホ向けUI（営業100名向け mobile.html）
- [ ] 単価情報のSFフィールド追加
- [ ] エスカレーション時のメール通知
- [ ] ユーザー管理画面（アプリ内で役割設定）
