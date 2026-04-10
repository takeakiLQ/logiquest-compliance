// ============================================================
//  認証専用GAS - Auth.gs
//  役割：Googleログイン検証・セッション管理のみ
// ============================================================

const AUTH_CONFIG = {
  ALLOWED_DOMAIN: 'logiquest.co.jp',
  BACKEND_GAS_URL: 'https://script.google.com/macros/s/AKfycbwh3-gII3jQ7OVvNaYQ07G0L9w_DVcbDvFljbYlCVFkBk5xRb996iy7H8W8ZmBeCDkh/exec',
};

// ============================================================
//  エントリーポイント（GETのみで対応・CORS問題を回避）
// ============================================================

function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    try {
      const action = e.parameter.action;
      if (action === 'login') {
        return jsonResponse(handleLogin(e.parameter));
      }
      if (action === 'verify') {
        return jsonResponse(handleVerify(e.parameter));
      }
      return jsonResponse({ error: '不明なアクション' });
    } catch (err) {
      return jsonResponse({ error: err.message });
    }
  }
  return jsonResponse({ status: 'Auth GAS is running' });
}

// ============================================================
//  ログイン処理
// ============================================================

function handleLogin(params) {
  const idToken = params.idToken;
  if (!idToken) return { error: 'IDトークンがありません' };

  // GoogleのIDトークンを検証
  const ticket = verifyGoogleIdToken(idToken);
  if (!ticket) return { error: 'Googleトークンが無効です' };

  // ドメインチェック
  const email = ticket.email;
  const domain = email.split('@')[1];
  if (domain !== AUTH_CONFIG.ALLOWED_DOMAIN) {
    return { error: `${AUTH_CONFIG.ALLOWED_DOMAIN} のアカウントのみ利用できます` };
  }

  // セッショントークン生成（6時間有効）
  const sessionToken = Utilities.getUuid();
  const sessionData = {
    email: email,
    name: ticket.name || email,
    created_at: new Date().toISOString(),
  };

  const cache = CacheService.getScriptCache();
  cache.put('session_' + sessionToken, JSON.stringify(sessionData), 21600);

  return {
    success: true,
    token: sessionToken,
    user: {
      email: email,
      name: ticket.name || email,
    },
  };
}

// ============================================================
//  トークン検証
// ============================================================

function handleVerify(params) {
  const token = params.token;
  if (!token) return { valid: false };

  const cache = CacheService.getScriptCache();
  const data = cache.get('session_' + token);
  if (!data) return { valid: false };

  return { valid: true, user: JSON.parse(data) };
}

// ============================================================
//  Googleトークン検証
// ============================================================

function verifyGoogleIdToken(idToken) {
  try {
    const res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + idToken
    );
    const info = JSON.parse(res.getContentText());
    if (info.error) return null;
    return info;
  } catch (e) {
    Logger.log('トークン検証エラー: ' + e.message);
    return null;
  }
}

// ============================================================
//  レスポンス
// ============================================================

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
