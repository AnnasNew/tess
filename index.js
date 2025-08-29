<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anas Panel | Admin & Pengguna</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Orbitron:wght@500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="wave"></div>
  <div class="wave wave2"></div>

  <div id="notification-popup" class="popup-notification">
    <span id="notification-message"></span>
  </div>

  <div id="login-page" class="glass-box">
    <h1 class="logo-Anaspel"><i class="fas fa-crown"></i> Anas</h1>
    <h2 style="color:white; text-shadow:none;">Panel Login</h2>
    <p style="color:var(--secondary-color); text-shadow:none; font-size:1.1rem;">TikTok: @gyzenisback_1</p>
    <div class="input-group">
      <input type="text" id="username" placeholder="Username" />
    </div>
    <div class="input-group">
      <input type="password" id="password" placeholder="Password" />
    </div>
    <button onclick="handleLogin()"><i class="fas fa-sign-in-alt"></i> Login</button>
  </div>

  <div id="admin-dashboard" class="glass-box admin-panel hidden">
    <h1 class="logo-Anaspel"><i class="fas fa-user-shield"></i> Admin Panel</h1>
    <p>Selamat datang, <b id="admin-username-display"></b></p>
    <hr>
    
    <div class="user-management-panel">
      <div id="create-user-section">
        <h3>Buat Akun Pengguna Baru</h3>
        <div class="input-group">
          <input type="text" id="new-username" placeholder="Username Pengguna" />
        </div>
        <div class="input-group">
          <input type="password" id="new-password" placeholder="Password Pengguna" />
        </div>
        <div class="input-group">
          <label for="expired-date" style="text-shadow: none;">Tanggal Kedaluwarsa:</label>
          <input type="date" id="expired-date" />
        </div>
        <button onclick="createUser()"><i class="fas fa-user-plus"></i> Buat Akun</button>
      </div>

      <div id="user-list-section">
        <h3>Daftar Akun Pengguna</h3>
        <div class="user-table-container">
          <table class="user-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Kedaluwarsa</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="user-table-body">
              </tbody>
          </table>
        </div>
      </div>
    </div>
    <button class="logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
  </div>

  <div id="user-dashboard" class="glass-box hidden">
    <h1 class="logo-Anaspel"><i class="fab fa-whatsapp"></i> Apocalypse</h1>
    <hr>
    <div class="user-profile-info">
        <h2 id="welcome-user"></h2>
        <p id="expired-info"></p>
        <div id="session-status-container">
            <span id="session-text"></span>
        </div>
    </div>

    <div id="user-content" class="hidden">
      <div class="input-group">
        <input type="text" id="target-number" placeholder="Nomor WhatsApp (cth: 628xxxx)" />
      </div>
      <div class="bug-options">
        <div class="bug-card active" data-bug="Crashtotalvis"><i class="fas fa-skull-crossbones"></i><span>FC Invisible</span></div>
        <div class="bug-card" data-bug="Forclose"><i class="fas fa-bomb"></i><span>FC WA</span></div>
        <div class="bug-card" data-bug="Delay"><i class="fas fa-clock"></i><span>Invis Delay</span></div>
        <div class="bug-card" data-bug="Blank Chat"><i class="fas fa-eye-slash"></i><span>Blank WhatsApp</span></div>
      </div>
      <button id="sendBtn" onclick="sendBug()"><i class="fas fa-bug"></i> Kirim Bug</button>
    </div>
    <button class="logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
  <script src="script.js"></script>
</body>
</html>
