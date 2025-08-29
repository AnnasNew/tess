// --- SCRIPT.JS ---

// --- 1. KONFIGURASI ---
const ADMIN_CREDENTIALS = {
  username: "1", // Ganti dengan username admin yang kuat
  password: "1"  // Ganti dengan password admin yang kuat
};

// URL API GitHub Raw untuk simulasi QR Code dan status koneksi
const GITHUB_API_URL = "https://raw.githubusercontent.com/Annas/kepforannas7hs/main/api/status.json";

// URL untuk Netlify Function kita
const BUG_API_URL = "/.netlify/functions/send-bug"; 

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
  sessionIcon: document.getElementById('session-icon'),
  sessionText: document.getElementById('session-text'),
  connectWaBtn: document.getElementById('connect-wa-btn'),
  notificationPopup: document.getElementById('notification-popup'),
  notificationMessage: document.getElementById('notification-message'),
};

let selectedBug = "Crashtotalvis"; // Bug default yang dipilih
let isWhatsAppConnected = false;
let sessionCheckInterval = null;

const showNotification = (message, type = 'success') => {
  DOM.notificationPopup.classList.remove('success', 'error', 'show');
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
  // Trigger animasi fadeIn
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
  
  // Hentikan interval pemeriksaan sesi WhatsApp saat logout
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
  } else {
    logout();
  }
};

const renderUserTable = () => {
  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  DOM.userTableBody.innerHTML = ''; // Kosongkan tabel sebelum merender ulang
  
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
  
  // Bersihkan input setelah pembuatan akun
  DOM.newUserUsername.value = '';
  DOM.newUserPassword.value = '';
  DOM.expiredDateInput.value = '';
  
  renderUserTable(); // Perbarui tabel pengguna
};

const deleteUser = (index) => {
  let users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  const username = users[index].username;
  if (confirm(`Apakah Anda yakin ingin menghapus akun ${username}?`)) {
    users.splice(index, 1); // Hapus pengguna dari array
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users)); // Simpan perubahan ke localStorage
    showNotification(`Akun ${username} telah dihapus.`, 'success');
    renderUserTable(); // Perbarui tabel pengguna
  }
};

// --- 5. LOGIKA DASBOR PENGGUNA ---
const showUserDashboard = () => {
  const user = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
  if (user && user.role === 'user') {
    DOM.welcomeUser.innerText = `Selamat datang, ${user.username}!`;
    const today = new Date();
    const expiredDate = new Date(user.expired);
    
    // Periksa apakah akun sudah kadaluarsa
    if (today > expiredDate) {
      DOM.expiredInfo.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Akun Anda telah kadaluarsa pada <b>${user.expired}</b>.`;
      DOM.expiredInfo.classList.remove('text-success');
      DOM.expiredInfo.classList.add('text-danger');
      DOM.userContent.classList.add('hidden'); // Sembunyikan konten jika kadaluarsa
    } else {
      DOM.expiredInfo.innerHTML = `<i class="fas fa-check-circle"></i> Akun aktif hingga <b>${user.expired}</b>.`;
      DOM.expiredInfo.classList.remove('text-danger');
      DOM.expiredInfo.classList.add('text-success');
    }
    showPage('user');
    
    // Mulai memeriksa status sesi WhatsApp
    checkWhatsAppSession();
    // Atur interval untuk memeriksa status setiap 5 detik
    sessionCheckInterval = setInterval(checkWhatsAppSession, 5000);
  } else {
    logout(); // Jika tidak ada sesi pengguna yang valid, logout
  }
};

const setupBugSelection = () => {
  document.querySelectorAll(".bug-card").forEach(card => {
    card.addEventListener("click", () => {
      // Hapus kelas 'active' dari semua kartu
      document.querySelectorAll(".bug-card").forEach(c => c.classList.remove("active"));
      // Tambahkan kelas 'active' ke kartu yang diklik
      card.classList.add("active");
      selectedBug = card.getAttribute("data-bug"); // Perbarui bug yang dipilih
    });
  });
};

const sendBug = async () => {
  if (!isWhatsAppConnected) {
    showNotification("Perangkat WhatsApp belum terhubung!", 'error');
    return;
  }

  const input = DOM.targetNumberInput.value.trim();
  
  // Validasi nomor WhatsApp
  if (!/^(\d+)(@s\.whatsapp\.net)?$/.test(input)) {
    showNotification("Masukkan nomor WA yang valid! (Contoh: 628xxxx)", 'error');
    return;
  }

  // Format nomor target ke chatId WhatsApp
  const chatId = input.includes("@s.whatsapp.net") ? input : `${input}@s.whatsapp.net`;
  
  DOM.sendBtn.disabled = true;
  DOM.sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

  try {
    // Kirim permintaan ke Netlify Function
    const res = await fetch(BUG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: chatId, bugType: selectedBug })
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

// --- 6. WHATSAPP SESSION DENGAN GITHUB RAW API ---
const checkWhatsAppSession = async () => {
  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) {
        throw new Error(`Gagal mengambil status dari GitHub. Status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.status === 'connected') {
      isWhatsAppConnected = true;
      DOM.sessionIcon.className = 'fas fa-check-circle text-success';
      DOM.sessionText.textContent = 'Perangkat terhubung!';
      DOM.connectWaBtn.classList.add('hidden');
      DOM.userContent.classList.remove('hidden'); // Tampilkan konten pengguna
      DOM.sendBtn.disabled = false;
    } else if (data.status === 'scan_me') {
      isWhatsAppConnected = false;
      DOM.sessionIcon.className = 'fas fa-qrcode';
      DOM.sessionText.textContent = 'Pindai QR code untuk koneksi!';
      DOM.connectWaBtn.classList.remove('hidden'); // Tampilkan tombol koneksi
      DOM.userContent.classList.add('hidden'); // Sembunyikan konten pengguna
      DOM.sendBtn.disabled = true;
    } else {
      isWhatsAppConnected = false;
      DOM.sessionIcon.className = 'fas fa-times-circle text-danger';
      DOM.sessionText.textContent = 'Koneksi terputus. Silakan coba lagi.';
      DOM.connectWaBtn.classList.remove('hidden');
      DOM.userContent.classList.add('hidden');
      DOM.sendBtn.disabled = true;
    }
  } catch (err) {
    isWhatsAppConnected = false;
    DOM.sessionIcon.className = 'fas fa-exclamation-triangle text-danger';
    DOM.sessionText.textContent = 'Gagal terhubung ke API GitHub.';
    DOM.connectWaBtn.classList.add('hidden');
    DOM.userContent.classList.add('hidden');
    DOM.sendBtn.disabled = true;
  }
};

const connectWhatsApp = async () => {
  DOM.connectWaBtn.disabled = true;
  DOM.connectWaBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat QR...';
  
  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) {
        throw new Error(`Gagal mengambil QR dari GitHub.`);
    }
    const data = await response.json();
    
    if (data.qr && data.status === 'scan_me') {
        alert('Pindai QR code ini di perangkat WhatsApp Anda:\n' + data.qr);
        showNotification('Memeriksa status koneksi...', 'success');
    } else {
        showNotification('QR Code tidak tersedia. Pastikan Anda telah mengunggahnya ke GitHub API.', 'error');
    }

  } catch (err) {
    showNotification(`Gagal mengambil QR dari GitHub: ${err.message}`, 'error');
  } finally {
    DOM.connectWaBtn.disabled = false;
    DOM.connectWaBtn.innerHTML = '<i class="fas fa-qrcode"></i> Koneksikan WhatsApp';
  }
};

// --- 7. INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
  checkSession();       // Periksa sesi saat halaman dimuat
  setupBugSelection();  // Atur pemilihan kartu bug
  
  // Inisialisasi particles.js
  particlesJS.load('particles-js', 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.json', function() {
    console.log('particles.js loaded - callback');
  });
});
