// --- SCRIPT.JS ---

// --- 1. KONFIGURASI ---
const ADMIN_CREDENTIALS = {
  username: "1", // Ganti dengan username admin yang kuat
  password: "1"  // Ganti dengan password admin yang kuat
};

// URL Netlify Functions untuk berkomunikasi dengan server Baileys Anda
const API_URL = {
  status: "/.netlify/functions/get-status",
  sendOtp: "/.netlify/functions/send-otp",
  pairCode: "/.netlify/functions/pair-code",
  sendBug: "/.netlify/functions/send-bug"
};

const USERS_STORAGE_KEY = 'annasKeceUsers';
const SESSION_STORAGE_KEY = 'annasKeceSession';

// --- 2. GLOBAL STATE & UTILITIES ---
const DOM = {
  loginPage: document.getElementById('login-page'),
  adminDashboard: document.getElementById('admin-dashboard'),
  userDashboard: document.getElementById('user-dashboard'),
  usernameInput: document.getElementById('username'),
  passwordInput: document.getElementById('password'),
  adminUsernameDisplay: document.getElementById('admin-username-display'),
  newUserUsername: document.getElementById('new-username'),
  newUserPassword: document.getElementById('new-password'),
  expiredDateInput: document.getElementById('expired-date'),
  userTableBody: document.getElementById('user-table-body'),
  targetNumberInput: document.getElementById('target-number'),
  sendBtn: document.getElementById('sendBtn'),
  welcomeUser: document.getElementById('welcome-user'),
  expiredInfo: document.getElementById('expired-info'),
  userContent: document.getElementById('user-content'),
  sessionText: document.getElementById('session-text'),
  pairBtn: document.getElementById('pair-btn'),
  pairingSection: document.getElementById('pairing-section'),
  targetPairingNumber: document.getElementById('target-pairing-number'),
  sendOtpBtn: document.getElementById('send-otp-btn'),
  otpInputGroup: document.getElementById('otp-input-group'),
  otpCodeInput: document.getElementById('otp-code'),
  pairCodeBtn: document.getElementById('pair-code-btn'),
  notificationPopup: document.getElementById('notification-popup'),
  notificationMessage: document.getElementById('notification-message'),
};

let selectedBug = "Crashtotalvis";
let isWhatsAppConnected = false;
let sessionCheckInterval = null;

const showNotification = (message, type = 'success') => {
  DOM.notificationPopup.classList.remove('success', 'error', 'show', 'warning');
  DOM.notificationPopup.classList.add(type);
  DOM.notificationMessage.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
  
  setTimeout(() => DOM.notificationPopup.classList.add('show'), 50);
  setTimeout(() => DOM.notificationPopup.classList.remove('show'), 4000);
};

const showPage = (pageName) => {
  const pages = {
    'login': DOM.loginPage,
    'admin': DOM.adminDashboard,
    'user': DOM.userDashboard,
  };
  Object.values(pages).forEach(page => page.classList.add('hidden'));
  pages[pageName].classList.remove('hidden');
  pages[pageName].style.animation = 'fadeIn 0.8s ease-out forwards';
};

// --- 3. MANAJEMEN LOGIN & SESI ---
const handleLogin = () => {
  const username = DOM.usernameInput.value.trim();
  const password = DOM.passwordInput.value.trim();
  
  if (!username || !password) {
    showNotification("Username dan Password tidak boleh kosong!", 'error');
    return;
  }
  
  // Login Admin
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ username, role: 'admin' }));
    showAdminDashboard();
    showNotification(`Selamat datang, ${username}!`, 'success');
    return;
  }
  
  // Login Pengguna
  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const expiredDate = new Date(user.expired);
    const now = new Date();
    
    if (now > expiredDate) {
      showNotification("Akun Anda telah kadaluarsa. Silakan hubungi admin.", 'error');
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ username: user.username, role: 'user', expired: user.expired }));
      showUserDashboard();
      showNotification(`Selamat datang, ${user.username}!`, 'success');
    }
  } else {
    showNotification("Username atau password salah!", 'error');
  }
};

const logout = () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  DOM.usernameInput.value = '';
  DOM.passwordInput.value = '';
  showPage('login');
  showNotification("Anda telah logout.", 'success');
  
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
  }
};

const checkSession = () => {
  const user = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
  if (user) {
    if (user.role === 'admin') {
      showAdminDashboard();
    } else if (user.role === 'user') {
      showUserDashboard();
    }
  } else {
    showPage('login');
  }
};

// --- 4. LOGIKA DASBOR ADMIN ---
const showAdminDashboard = () => {
  const user = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
  if (user && user.role === 'admin') {
    DOM.adminUsernameDisplay.innerText = user.username;
    renderUserTable();
    showPage('admin');
    
    // Periksa status koneksi WhatsApp untuk admin
    checkWhatsAppSession();
    sessionCheckInterval = setInterval(checkWhatsAppSession, 5000);
  } else {
    logout();
  }
};

const renderUserTable = () => {
  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  DOM.userTableBody.innerHTML = '';
  
  users.forEach((user, index) => {
    const row = DOM.userTableBody.insertRow();
    const isExpired = new Date(user.expired) < new Date();
    const statusClass = isExpired ? 'expired-badge' : 'active-badge';
    const statusText = isExpired ? 'Expired' : 'Aktif';
    
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.expired}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td>
        <div class="action-buttons">
          <button class="logout-btn" onclick="deleteUser(${index})">
            <i class="fas fa-trash-alt"></i> Hapus
          </button>
        </div>
      </td>
    `;
  });
};

const createUser = () => {
  const newUsername = DOM.newUserUsername.value.trim();
  const newPassword = DOM.newUserPassword.value.trim();
  const expiredDate = DOM.expiredDateInput.value;

  if (!newUsername || !newPassword || !expiredDate) {
    showNotification("Semua field harus diisi!", 'error');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  const userExists = users.some(user => user.username === newUsername);
  
  if (userExists) {
    showNotification("Username sudah ada!", 'error');
    return;
  }

  const newUser = { username: newUsername, password: newPassword, expired: expiredDate };
  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  showNotification(`Akun ${newUsername} berhasil dibuat!`, 'success');
  
  DOM.newUserUsername.value = '';
  DOM.newUserPassword.value = '';
  DOM.expiredDateInput.value = '';
  
  renderUserTable();
};

const deleteUser = (index) => {
  let users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  const username = users[index].username;
  if (confirm(`Apakah Anda yakin ingin menghapus akun ${username}?`)) {
    users.splice(index, 1);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    showNotification(`Akun ${username} telah dihapus.`, 'success');
    renderUserTable();
  }
};

// --- 5. LOGIKA DASBOR PENGGUNA ---
const showUserDashboard = () => {
  const user = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
  if (user && user.role === 'user') {
    DOM.welcomeUser.innerText = `Selamat datang, ${user.username}!`;
    const today = new Date();
    const expiredDate = new Date(user.expired);
    
    if (today > expiredDate) {
      DOM.expiredInfo.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Akun Anda telah kadaluarsa pada <b>${user.expired}</b>.`;
      DOM.expiredInfo.classList.remove('text-success');
      DOM.expiredInfo.classList.add('text-danger');
      DOM.userContent.classList.add('hidden');
    } else {
      DOM.expiredInfo.innerHTML = `<i class="fas fa-check-circle"></i> Akun aktif hingga <b>${user.expired}</b>.`;
      DOM.expiredInfo.classList.remove('text-danger');
      DOM.expiredInfo.classList.add('text-success');
      DOM.userContent.classList.remove('hidden');
    }
    showPage('user');
    setupBugSelection();
    checkWhatsAppSession(); // Check session status for user dashboard
    sessionCheckInterval = setInterval(checkWhatsAppSession, 5000);
  } else {
    logout();
  }
};

const setupBugSelection = () => {
  document.querySelectorAll(".bug-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".bug-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectedBug = card.getAttribute("data-bug");
    });
  });
};

const sendBug = async () => {
  if (!isWhatsAppConnected) {
    showNotification("Perangkat WhatsApp belum terhubung!", 'error');
    return;
  }

  const input = DOM.targetNumberInput.value.trim();
  
  if (!/^62\d{8,15}$/.test(input)) {
    showNotification("Masukkan nomor WA yang valid! (Contoh: 628xxxx)", 'error');
    return;
  }

  DOM.sendBtn.disabled = true;
  DOM.sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

  try {
    const res = await fetch(API_URL.sendBug, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: input, bugType: selectedBug })
    });
    const json = await res.json();
    
    if (json.success) {
      showNotification(`Bug berhasil dikirim ke ${input}!`, 'success');
    } else {
      showNotification(`Gagal mengirim bug: ${json.message || 'unknown error'}`, 'error');
    }
  } catch (err) {
    showNotification(`Gagal terhubung ke server: ${err.message}`, 'error');
  } finally {
    DOM.sendBtn.disabled = false;
    DOM.sendBtn.innerHTML = '<i class="fas fa-bug"></i> Kirim Bug';
  }
};

// --- 6. WHATSAPP SESSION & PAIRING ---
const checkWhatsAppSession = async () => {
  try {
    const response = await fetch(API_URL.status);
    const data = await response.json();
    
    const currentUser = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));

    if (data.status === 'connected') {
      isWhatsAppConnected = true;
      DOM.sessionText.innerHTML = `<i class="fas fa-check-circle text-success"></i> Perangkat terhubung!`;
      if (currentUser.role === 'admin') {
        DOM.pairBtn.classList.add('hidden');
        DOM.pairingSection.classList.add('hidden');
      } else {
        DOM.userContent.classList.remove('hidden');
      }
    } else {
      isWhatsAppConnected = false;
      DOM.sessionText.innerHTML = `<i class="fas fa-times-circle text-danger"></i> Perangkat terputus.`;
      if (currentUser.role === 'admin') {
        DOM.pairBtn.classList.remove('hidden');
      }
      DOM.userContent.classList.add('hidden');
    }
  } catch (err) {
    isWhatsAppConnected = false;
    DOM.sessionText.innerHTML = `<i class="fas fa-exclamation-triangle text-danger"></i> Gagal terhubung ke API Status.`;
    DOM.pairBtn.classList.remove('hidden');
    DOM.userContent.classList.add('hidden');
  }
};

const showPairingForm = () => {
  DOM.pairingSection.classList.remove('hidden');
  DOM.pairBtn.classList.add('hidden');
};

const sendOtp = async () => {
  const number = DOM.targetPairingNumber.value.trim();
  if (!/^62\d{8,15}$/.test(number)) {
    showNotification("Nomor tidak valid. Gunakan format 62xxxx", 'error');
    return;
  }
  
  DOM.sendOtpBtn.disabled = true;
  DOM.sendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim OTP...';

  try {
    const res = await fetch(API_URL.sendOtp, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number })
    });
    const json = await res.json();
    
    if (json.success) {
      showNotification("Kode OTP telah dikirim. Periksa WhatsApp di perangkat Anda!", 'success');
      DOM.otpInputGroup.classList.remove('hidden');
      DOM.pairCodeBtn.classList.remove('hidden');
    } else {
      showNotification(`Gagal mengirim OTP: ${json.message}`, 'error');
    }
  } catch (err) {
    showNotification(`Gagal terhubung ke API OTP: ${err.message}`, 'error');
  } finally {
    DOM.sendOtpBtn.disabled = false;
    DOM.sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Kode OTP';
  }
};

const pairWithCode = async () => {
  const number = DOM.targetPairingNumber.value.trim();
  const code = DOM.otpCodeInput.value.trim();
  
  if (!code) {
    showNotification("Kode OTP tidak boleh kosong!", 'error');
    return;
  }
  
  DOM.pairCodeBtn.disabled = true;
  DOM.pairCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memasangkan...';

  try {
    const res = await fetch(API_URL.pairCode, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number, code })
    });
    const json = await res.json();
    
    if (json.success) {
      showNotification("Perangkat berhasil dipasangkan!", 'success');
      DOM.pairingSection.classList.add('hidden');
      checkWhatsAppSession();
    } else {
      showNotification(`Gagal memasangkan: ${json.message}`, 'error');
    }
  } catch (err) {
    showNotification(`Gagal terhubung ke API Pairing: ${err.message}`, 'error');
  } finally {
    DOM.pairCodeBtn.disabled = false;
    DOM.pairCodeBtn.innerHTML = '<i class="fas fa-link"></i> Pasangkan Perangkat';
  }
};

// --- 7. INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  setupBugSelection();
  
  particlesJS.load('particles-js', 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.json', function() {
    console.log('particles.js loaded - callback');
  });
});
