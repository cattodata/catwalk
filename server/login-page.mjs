// Mobile-friendly login page (server-rendered HTML).
// Replaces HTTP Basic Auth (which iOS Safari + Chrome Android handle poorly).

export function renderLoginPage(error = false, redirect = '/') {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#FAF7F0" />
  <title>Catto Compass — Sign in</title>
  <link rel="icon" type="image/png" href="/assets/cattodata-logo.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100dvh;
      background: linear-gradient(160deg, #FFF8E8 0%, #FAF7F0 50%, #FFE8D5 100%);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #2D2418;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      padding-top: max(24px, env(safe-area-inset-top));
      padding-bottom: max(24px, env(safe-area-inset-bottom));
    }
    .card {
      width: 100%;
      max-width: 380px;
      background: #fff;
      border-radius: 24px;
      padding: 32px 28px;
      box-shadow: 0 24px 64px rgba(45, 36, 24, 0.10), 0 4px 12px rgba(45, 36, 24, 0.04);
    }
    .logo {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      margin: 0 auto 16px;
      background: linear-gradient(135deg, #FFE8D5, #FFF8E8);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .logo img { width: 56px; height: 56px; object-fit: contain; }
    h1 {
      margin: 0 0 6px;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 26px;
      text-align: center;
      letter-spacing: -0.4px;
    }
    .sub {
      margin: 0 0 24px;
      font-size: 13px;
      text-align: center;
      color: rgba(45, 36, 24, 0.6);
    }
    label {
      display: block;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: rgba(45, 36, 24, 0.7);
      margin-bottom: 6px;
      letter-spacing: 0.2px;
    }
    input[type="password"] {
      width: 100%;
      padding: 14px 16px;
      font-size: 16px; /* 16px+ prevents iOS auto-zoom */
      font-family: 'Plus Jakarta Sans', sans-serif;
      border: 1.5px solid rgba(154, 128, 90, 0.25);
      border-radius: 12px;
      background: #FAF7F0;
      color: #2D2418;
      outline: none;
      transition: border-color 0.15s, background 0.15s;
    }
    input[type="password"]:focus {
      border-color: #FF6B9D;
      background: #fff;
    }
    button {
      width: 100%;
      margin-top: 18px;
      padding: 14px 20px;
      background: linear-gradient(135deg, #FF6B9D, #F5C842);
      color: #fff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 16px;
      border: 0;
      border-radius: 999px;
      cursor: pointer;
      box-shadow: 0 8px 22px rgba(255, 107, 157, 0.32);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    button:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(255, 107, 157, 0.42); }
    button:active { transform: translateY(0); }
    .error {
      margin-top: 10px;
      padding: 10px 14px;
      background: rgba(255, 107, 157, 0.10);
      color: #C13B6E;
      border-radius: 10px;
      font-size: 13px;
      text-align: center;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 11px;
      color: rgba(45, 36, 24, 0.5);
      letter-spacing: 0.4px;
    }
    .footer b { color: rgba(45, 36, 24, 0.75); font-weight: 600; }
  </style>
</head>
<body>
  <main class="card" role="main">
    <div class="logo">
      <img src="/assets/cattodata-logo.png" alt="Catto Compass" />
    </div>
    <h1>Catto Compass</h1>
    <p class="sub">Team preview · Chatswood Hackathon</p>
    <form method="POST" action="/login" autocomplete="off">
      <label for="password">Team password</label>
      <input
        type="password"
        id="password"
        name="password"
        placeholder="Enter password"
        autocomplete="current-password"
        autofocus
        required
        inputmode="text"
      />
      <input type="hidden" name="redirect" value="${escapeHtml(redirect)}" />
      <button type="submit">Sign in</button>
      ${error ? '<div class="error" role="alert">Wrong password — try again</div>' : ''}
    </form>
    <div class="footer">By <b>Cattodata</b> · for <b>Willoughby City Council</b></div>
  </main>
</body>
</html>`
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}
