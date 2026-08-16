document.addEventListener('DOMContentLoaded', () => { 'use strict';
// ==================== ELEMENTS ==================== 
const loaderScreen = document.getElementById('loader'); const app = document.getElementById('app'); const loadingProgress = document.getElementById('loadingProgress'); const loadingBar = document.getElementById('loadingBar'); const loadingStatus = document.getElementById('loadingStatus'); const loadingFile = document.getElementById('loadingFile'); const retryBtn = document.getElementById('retryBtn');
const themeBtn = document.getElementById('themeBtn'); const musicBtn = document.getElementById('musicBtn'); const musicPlayer = document.getElementById('musicPlayer'); const bgMusic = document.getElementById('bgMusic'); const volumeBtn = document.getElementById('volumeBtn'); const musicProgress = document.getElementById('musicProgress'); const miniEq = document.getElementById('miniEq');
const menuBtn = document.getElementById('menuBtn'); const navLinks = document.getElementById('navLinks');
const topBtn = document.getElementById('topBtn'); const typingElement = document.getElementById('typing');
const spinWheel = document.getElementById('spinWheel'); const spinBtn = document.getElementById('spinBtn'); const spinPopup = document.getElementById('spinPopup'); const spinText = document.getElementById('spinText'); const closeSpin = document.getElementById('closeSpin'); const alreadyPopup = document.getElementById('alreadyPopup'); const closeAlready = document.getElementById('closeAlready');
const quizGreeting = document.getElementById('quizGreeting');
const loginSection = document.getElementById('loginSection'); const dashSection = document.getElementById('dashSection'); const nameInput = document.getElementById('nameInput'); const bioBtn = document.getElementById('bioBtn'); const demoBtn = document.getElementById('demoBtn'); const logoutBtn = document.getElementById('logoutBtn'); const statusBox = document.getElementById('statusBox'); const bar = document.getElementById('bar'); const welcomeName = document.getElementById('welcomeName');
const aiAssistant = document.getElementById("aiAssistant");
const aiName = document.getElementById("aiName");
const raw = localStorage.getItem("User.Captain_Z");
const user = safeParseJSON(raw);

if (user && user.name) {
    aiName.textContent = user.name;
} else {
    aiName.textContent = raw || "Teman";
}

// ==================== STATE ==================== 
let isPlaying = false; let isMuted = false; let isDragging = false; let loadingStarted = false; let loadingTimer = null; let typingStarted = false; let scrollTimer
let currentRotation = 0; let spinLocked = false; let idleSpinEnabled = false; let idleSpinTimer = null;

const hadiah = [ '🍀 Keberuntungan', '😂 Kesialan', '🎉 Hoki Besar', '☕ Istirahat', '🎁 Bonus', '😴 Tidur', '💎 Rare', '😅 Zonk' ];
const warna = [ '#4CAF50', '#F44336', '#2196F3', '#FFC107', '#9C27B0', '#00BCD4', '#FF9800', '#607D8B' ];
const total = hadiah.length; const sudut = (Math.PI * 2) / total;
const STORAGE_KEY = 'quiz_gate_user_v1'; const CRED_KEY = 'quiz_gate_credential_v1'; const SPIN_KEY = 'spin-User-Captain_Z-MD';

// ==================== SAFE STORAGE ====================
 function safeGetItem(key) { try { return localStorage.getItem(key); } catch { return null; } }

function safeSetItem(key, value) { try { localStorage.setItem(key, value); } catch { ignore } }

function safeRemoveItem(key) { try { localStorage.removeItem(key); } catch { ignore } }

// ==================== HELPERS ====================
 function setStatus(el, msg, tone = 'normal') { if (!el) return; el.textContent = msg; const borderColor = tone === 'error' ? 'rgba(255,107,139,.30)' : tone === 'success' ? 'rgba(110,240,198,.28)' : 'rgba(255,255,255,.08)'; const textColor = tone === 'error' ? '#ffd5de' : tone === 'success' ? '#dbfff3' : 'var(--muted)'; el.style.borderColor = borderColor; el.style.color = textColor; }

function setProgress(v) { 
    if (!loadingBar) return; 
    const value = Math.max(0, Math.min(100, Number(v) || 0)); 
    loadingBar.style.width = `${value}%`;   
}
function setLocalProgress(v) { 
    if (!bar) return; 
    const value = Math.max(0, Math.min(100, Number(v) || 0)); 
    bar.style.width = `${value}%`;  
}
function showLogin() { 
    if (loginSection) loginSection.classList.add('active'); 
    if (dashSection) dashSection.classList.remove('active'); 
}
function showDash(name) { 
    if (welcomeName) welcomeName.textContent = `Hai, ${name}`;   
    if (loginSection) loginSection.classList.remove('active'); 
    if (dashSection) dashSection.classList.add('active'); 
}
function cleanName(name) { return String(name || '').trim().replace(/\s+/g, ' '); }
function supportsWebAuthn() { return !!( window.PublicKeyCredential && navigator.credentials && window.isSecureContext ); }
function randomBytes(len = 32) { const arr = new Uint8Array(len); crypto.getRandomValues(arr); return arr; }
function toBase64Url(buffer) { 
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer; 
    let binary = ''; 
    bytes.forEach((b) => { binary += String.fromCharCode(b); }); 
    return btoa(binary) 
        .replace(/\+/g, '-') 
        .replace(/\//g, '_') 
        .replace(/=+$/g, ''); 
}
function fromBase64Url(base64url) { const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((base64url.length + 3) % 4); const binary = atob(base64); const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i += 1) { bytes[i] = binary.charCodeAt(i); } return bytes; }
function safeParseJSON(raw) { if (!raw) return null; try { return JSON.parse(raw); } catch { return null; } }
function getStoredQuizName() { const keys = [STORAGE_KEY, 'User.Captain_Z']; for (const key of keys) { const data = safeParseJSON(safeGetItem(key)); const name = cleanName(data?.name); if (name) return name; } return ''; }

// ==================== LOADER ====================
 function initTypingEffect() { if (!typingElement || typingStarted) return; typingStarted = true;
 
const texts = [
  'Saya membangun pengalaman digital yang indah.',
  'Pelajar SMA • Web Developer • Content Creator.',
  'Building modern websites with passion.',
  'Mengubah ide menjadi pengalaman digital.',
  'Front-End Developer • UI Enthusiast.',
  'Always learning, always improving.',
  'Belajar, berkembang, dan terus berkarya.',
  'Code • Design • Create.',
  'Crafting beautiful digital experiences.',
  'Responsive Web Developer.',
  'Technology is my playground.',
  'Creative Thinker • Problem Solver.',
  'Membangun website yang cepat dan responsif.',
  'Turning ideas into reality.',
  'Pixel perfect is my goal.',
  'Creating meaningful digital products.',
  'Belajar hari ini, membangun masa depan.',
  'High School Student • Developer.',
  'Designing with simplicity.',
  'Coding beyond imagination.',
  'Web Development is my passion.',
  'Mari kita buat sesuatu yang keren bersama.',
  'Think. Build. Improve.',
  'Innovation starts with curiosity.',
  'Creating experiences, not just websites.',
  'Dream • Code • Repeat.',
  'Belajar tanpa henti.',
  'Building the future, one line of code at a time.',
  'Simple. Clean. Modern.',
  "Let's create something amazing together.", 
  "Hargailah yang buat, lu cuma numpang", 
];
let textIndex = 0;
let charIndex = 0;
let stopped = false;

function type() {
  if (stopped || !typingElement.isConnected) return;

  const targetText = texts[textIndex];
  if (charIndex < targetText.length) {
    typingElement.textContent = targetText.substring(0, charIndex + 1);
    charIndex += 1;
    window.setTimeout(type, 50);
  } else {
    window.setTimeout(() => {
      if (stopped || !typingElement.isConnected) return;
      typingElement.textContent = '';
      textIndex = (textIndex + 1) % texts.length;
      charIndex = 0;
      window.setTimeout(type, 300);
    }, 1800);
  }
}

window.setTimeout(type, 800);
window.addEventListener('beforeunload', () => {
  stopped = true;
}, { once: true });

}
window.addEventListener("scroll", () => {
    aiAssistant.classList.remove("show-text");
    if(window.scrollY > 300){
        topBtn.classList.add("show");
        aiAssistant.classList.add("up");
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            aiAssistant.classList.add("show-text");
        }, 500); 
    } else {
        topBtn.classList.remove("show");
        aiAssistant.classList.remove("up");
        aiAssistant.classList.remove("show-text");
    }
});
topBtn.addEventListener("click", () => {
    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
});
function finishLoading() { if (loaderScreen) loaderScreen.classList.add('hide'); if (app) app.hidden = false; document.body.classList.remove('loading'); initTypingEffect(); initScrollReveal(); initActiveNav(); initBackToTop(); }

function simulateLoading() { if (loadingStarted) return; loadingStarted = true;

let progress = 0;

if (loadingTimer) clearInterval(loadingTimer);
loadingTimer = window.setInterval(() => {
  progress += Math.random() * 22;
  if (progress > 100) progress = 100;

  if (loadingProgress) loadingProgress.textContent = `${Math.floor(progress)}%`;
  setProgress(progress);

  if (loadingStatus) {
    loadingStatus.textContent = progress < 100 ? 'Menyiapkan aset...' : 'Selesai.';
  }
  if (loadingFile) {
    loadingFile.textContent = progress < 100 ? 'Menunggu file...' : 'Membuka halaman...';
  }

  if (progress >= 100) {
    clearInterval(loadingTimer);
    loadingTimer = null;

    window.setTimeout(() => {
      finishLoading();
    }, 400);
  }
}, 70);

}

if (retryBtn) { retryBtn.addEventListener('click', () => { if (loadingTimer) clearInterval(loadingTimer); loadingTimer = null; loadingStarted = false; if (loaderScreen) loaderScreen.classList.remove('hide'); simulateLoading(); }); }

// ==================== THEME ====================
 function updateThemeFooter() { const themeStatus = document.getElementById('themeStatus'); if (!themeStatus) return; themeStatus.textContent = document.body.classList.contains('light') ? 'Light' : 'Dark'; }

function applyTheme(isLight) { document.body.classList.toggle('light', isLight); if (themeBtn) { themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>'; } safeSetItem('Captain_Z-MD.theme', isLight ? 'light' : 'dark'); safeSetItem('theme', isLight ? 'light' : 'dark'); updateThemeFooter(); }

function initTheme() { const savedTheme = safeGetItem('Captain_Z-MD.theme') || safeGetItem('theme') || 'dark'; applyTheme(savedTheme === 'light'); }

if (themeBtn) { themeBtn.addEventListener('click', () => { applyTheme(!document.body.classList.contains('light')); }); }

// ==================== MUSIC ==================== 
function updateMusicUI() { if (musicBtn) { musicBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-music"></i>'; } if (miniEq) miniEq.style.opacity = isPlaying ? '1' : '0.4'; }

function playMusic() { if (!bgMusic) return; const promise = bgMusic.play(); if (promise && typeof promise.then === 'function') { promise .then(() => { isPlaying = true; updateMusicUI(); }) .catch((err) => { console.log('Playback prevented:', err); }); } else { isPlaying = true; updateMusicUI(); } }

function pauseMusic() { if (!bgMusic) return; bgMusic.pause(); isPlaying = false; updateMusicUI(); }

function toggleMute() { if (!bgMusic || !volumeBtn) return; isMuted = !isMuted; bgMusic.muted = isMuted; volumeBtn.innerHTML = isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>'; }

function toggleMusicWidget() { if (!musicPlayer) return;

const isOpening = !musicPlayer.classList.contains('show');
musicPlayer.classList.toggle('show');

if (isOpening) {
  if (!isPlaying) playMusic();
} else if (isPlaying) {
  pauseMusic();
}
}

function initMusic() { if (!bgMusic) return;
bgMusic.volume = 0.45;
bgMusic.muted = isMuted;
if (musicBtn) musicBtn.addEventListener('click', toggleMusicWidget);
if (volumeBtn) volumeBtn.addEventListener('click', toggleMute);
if (musicProgress) {
  musicProgress.addEventListener('input', () => {
    if (!bgMusic.duration || Number.isNaN(bgMusic.duration)) return;
    const newTime = (Number(musicProgress.value) / 100) * bgMusic.duration;
    bgMusic.currentTime = newTime;
  });
  musicProgress.addEventListener('mousedown', () => {
    isDragging = true;
  });
  musicProgress.addEventListener('touchstart', () => {
    isDragging = true;
  }, { passive: true });
  musicProgress.addEventListener('mouseup', () => {
    isDragging = false;
  });
  musicProgress.addEventListener('touchend', () => {
    isDragging = false;
  });
  musicProgress.addEventListener('mouseleave', () => {
    isDragging = false;
  });
}

bgMusic.addEventListener('timeupdate', () => {
  if (!musicProgress || isDragging || !bgMusic.duration || Number.isNaN(bgMusic.duration)) return;
  const percent = (bgMusic.currentTime / bgMusic.duration) * 100;
  musicProgress.value = `${percent}`;
});

bgMusic.addEventListener('ended', () => {
  isPlaying = false;
  updateMusicUI();
});

updateMusicUI();

}

// ==================== MOBILE MENU ====================
 function initMobileMenu() { if (!menuBtn || !navLinks) return;

menuBtn.addEventListener('click', () => {
  if (musicPlayer && musicPlayer.classList.contains('show')) {
    musicPlayer.classList.remove('show');
  }
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

}

// ==================== QUIZ GREETING ====================
 function initQuizGreeting() { if (!quizGreeting) return;

const name = getStoredQuizName();
if (name) {
  quizGreeting.innerHTML = `Hai, <strong>${name}</strong> 👋<br>Siap mengerjakan quiz hari ini?`;
} else {
  quizGreeting.textContent = 'Masuk ke QuizHub untuk mengerjakan berbagai soal.';
}

}

// ==================== QUIZ AUTH ==================== 
async function registerOrVerify() { const name = cleanName(nameInput?.value);

if (!name) {
  if (nameInput?.parentElement) {
    nameInput.parentElement.classList.add('shake');
    window.setTimeout(() => {
      nameInput.parentElement.classList.remove('shake');
    }, 360);
  }
  setStatus(statusBox, 'Isi nama kamu dulu ya.', 'error');
  return;
}

if (!supportsWebAuthn()) {
  setStatus(
    statusBox,
    'Browser atau halaman ini belum mendukung verifikasi biometrik. Coba buka lewat HTTPS dan pakai browser modern.',
    'error'
  );
  return;
}

if (bioBtn) bioBtn.disabled = true;
if (demoBtn) demoBtn.disabled = true;

setLocalProgress(18);
setStatus(statusBox, 'Membuka verifikasi biometrik...', 'normal');

const savedCred = safeGetItem(CRED_KEY);

try {
  if (!savedCred) {
    setLocalProgress(30);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),
        rp: { name: 'QuizHub — Smart Learning Starts Here.' },
        user: {
          id: randomBytes(16),
          name: name.toLowerCase().replace(/\s+/g, '.'),
          displayName: name
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 }
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      }
    });

    if (!credential) throw new Error('Pendaftaran dibatalkan.');

    const payload = {
      name,
      credentialId: toBase64Url(credential.rawId),
      createdAt: Date.now()
    };

    safeSetItem(STORAGE_KEY, JSON.stringify(payload));
    safeSetItem(CRED_KEY, payload.credentialId);
    safeSetItem('User.Captain_Z', JSON.stringify(payload));

    setLocalProgress(78);
    setStatus(statusBox, 'Berhasil. Kamu sudah masuk ke menu quiz.', 'success');

    window.setTimeout(() => {
      showDash(name);
      setLocalProgress(100);
    }, 450);
  } else {
    setLocalProgress(30);

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        allowCredentials: [
          {
            type: 'public-key',
            id: fromBase64Url(savedCred)
          }
        ],
        userVerification: 'required',
        timeout: 60000
      }
    });

    if (!credential) throw new Error('Verifikasi dibatalkan.');

    const payload = {
      name,
      credentialId: savedCred,
      verifiedAt: Date.now()
    };

    safeSetItem(STORAGE_KEY, JSON.stringify(payload));
    safeSetItem('User.Captain_Z', JSON.stringify(payload));

    setLocalProgress(78);
    setStatus(statusBox, 'Masuk berhasil. Selamat datang di menu quiz.', 'success');

    window.setTimeout(() => {
      showDash(name);
      setLocalProgress(100);
    }, 450);
  }
} catch (err) {
  console.error(err);
  setLocalProgress(0);

  const msg = String(err?.name || err?.message || 'Terjadi kesalahan.');
  if (msg.includes('NotAllowedError')) {
    setStatus(statusBox, 'Verifikasi dibatalkan atau sidik jari tidak cocok.', 'error');
  } else if (msg.includes('NotSupportedError')) {
    setStatus(statusBox, 'Perangkat atau browser ini belum mendukung verifikasi biometrik.', 'error');
  } else {
    setStatus(statusBox, `Gagal verifikasi: ${msg}`, 'error');
  }
} finally {
  if (bioBtn) bioBtn.disabled = false;
  if (demoBtn) demoBtn.disabled = false;
}

}

function initQuizActions() { if (demoBtn) { demoBtn.addEventListener('click', () => { if (supportsWebAuthn()) { setStatus( statusBox, 'Browser kamu siap. Kalau perangkat punya sidik jari atau Face ID, tombol verifikasi bisa memunculkan prompt biometrik.', 'success' ); setLocalProgress(15); } else { setStatus( statusBox, 'Belum siap. Coba buka lewat HTTPS di browser modern yang mendukung WebAuthn.', 'error' ); setLocalProgress(0); } }); }

if (bioBtn) bioBtn.addEventListener('click', registerOrVerify);

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    safeRemoveItem(STORAGE_KEY);
    safeRemoveItem(CRED_KEY);
    safeRemoveItem('User.Captain_Z');
    setLocalProgress(0);
    setStatus(statusBox, 'Kamu sudah keluar. Isi nama lagi untuk masuk.', 'normal');
    showLogin();
  });
}

if (nameInput) {
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') registerOrVerify();
  });
}

const saved = safeGetItem(STORAGE_KEY) || safeGetItem('User.Captain_Z');
const payload = safeParseJSON(saved);
if (payload?.name) {
  if (nameInput) nameInput.value = payload.name;
  showDash(payload.name);
  setLocalProgress(100);
  setStatus(statusBox, 'Sesi sebelumnya ketemu. Kamu sudah masuk.', 'success');
  return;
}

showLogin();
setLocalProgress(0);

}

// ==================== SCROLL REVEAL ==================== 
function initScrollReveal() { const nodes = document.querySelectorAll('[data-reveal]'); if (!nodes.length) return;

if (!('IntersectionObserver' in window)) {
  nodes.forEach((el) => el.classList.add('visible'));
  return;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

nodes.forEach((el) => observer.observe(el));
}

function initActiveNav() { const navItems = document.querySelectorAll('.nav-links a'); if (!navItems.length) return;

const setActive = () => {
  let current = '';
  document.querySelectorAll('section[id]').forEach((section) => {
    if (window.scrollY >= section.offsetTop - 200) {
      current = section.getAttribute('id') || '';
    }
  });

  navItems.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
};

window.addEventListener('scroll', setActive, { passive: true });
setActive();
}
function initBackToTop() { if (!topBtn) return;
window.addEventListener('scroll', () => {
  topBtn.classList.toggle('show', window.scrollY > 500);
}, { passive: true });
topBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
}
// ==================== SPIN WHEEL (CANVAS) ====================
 function getWheelSize() { if (!spinWheel) return 320; const rect = spinWheel.getBoundingClientRect(); return Math.max(220, Math.floor(rect.width || spinWheel.width || 320)); }

function drawWheel() { if (!spinWheel) return; const ctx = spinWheel.getContext('2d'); if (!ctx) return;

const size = getWheelSize();
const center = size / 2;
const radius = Math.max(0, Math.min(center - 10, size / 2 - 10));

ctx.save();
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.clearRect(0, 0, spinWheel.width, spinWheel.height);
ctx.restore();

ctx.save();
ctx.scale(spinWheel.width / size, spinWheel.height / size);
for (let i = 0; i < total; i += 1) {
  const start = i * sudut - Math.PI / 2;
  const end = start + sudut;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.fillStyle = warna[i % warna.length];
  ctx.arc(center, center, radius, start, end);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  const angle = start + sudut / 2;
  const textRadius = Math.max(58, radius - 52);
  const x = center + Math.cos(angle) * textRadius;
  const y = center + Math.sin(angle) * textRadius;
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (angle > Math.PI / 2 && angle < Math.PI * 1.5) {
    ctx.rotate(Math.PI);
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hadiah[i], 0, 0);
  ctx.restore();
}
ctx.beginPath();
ctx.fillStyle = '#fff';
ctx.arc(center, center, 28, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.fillStyle = 'rgba(0,0,0,.16)';
ctx.arc(center, center, 15, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

}

function resizeWheelCanvas() {
    if (!spinWheel) return;
    const cssSize = getWheelSize();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    spinWheel.width = Math.floor(cssSize * dpr);
    spinWheel.height = Math.floor(cssSize * dpr);
    spinWheel.style.width = `${cssSize}px`;
    spinWheel.style.height = `${cssSize}px`;
    const currentTransform = spinWheel.style.transform;
    drawWheel();
    if (currentTransform) {
        spinWheel.style.transform = currentTransform;
    }
}
function setIdleSpin(active) {
    if (!spinWheel) return;
    idleSpinEnabled = active;
    spinWheel.classList.remove('idle');    
    if (active) {
        setTimeout(() => {
            if (idleSpinEnabled && !spinLocked) {
                spinWheel.classList.add('idle');
            }
        }, 100);
    }
}

function rotateWheel(deg, animate = true) {
    if (!spinWheel) return;
    spinWheel.classList.remove("idle");
    spinWheel.style.animation = "none";
    spinWheel.offsetHeight;
    if (animate) {
        spinWheel.style.transition = "transform 5s cubic-bezier(0.17, 0.67, 0.25, 1)";
    } else {
        spinWheel.style.transition = "none";
    }

    spinWheel.style.transform = `rotate(${deg}deg)`;
}

function initSpinWheel() { 
    if (!spinWheel || !spinBtn) return;

    resizeWheelCanvas();
    setIdleSpin(true);

    const today = new Date().toDateString();

    spinBtn.addEventListener('click', () => {
    if (spinLocked) return;

    if (safeGetItem(SPIN_KEY) === today) {
        if (alreadyPopup) alreadyPopup.classList.add('show');
        return;
    }
    spinLocked = true;
    setIdleSpin(false);
    const index = Math.floor(Math.random() * total);
    const segment = 360 / total;
    const target = 360 * 6 + (360 - (index * segment + segment / 2));
    currentRotation += target;
    rotateWheel(currentRotation, true);
    safeSetItem(SPIN_KEY, today);
    setTimeout(() => {
        if (spinText) spinText.textContent = hadiah[index];
        if (spinPopup) spinPopup.classList.add('show');
    }, 5200);   
    setTimeout(() => {
        spinLocked = false;
        setIdleSpin(true);
    }, 5800); 
});

spinWheel.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform") return;

    spinWheel.style.animation = "";

    if (!spinLocked && idleSpinEnabled) {
        spinWheel.classList.add("idle");
    }
});

if (closeSpin) {
  closeSpin.addEventListener('click', () => {
    if (spinPopup) spinPopup.classList.remove('show');
 
    spinWheel.style.transition = 'transform 0.8s ease';
    spinWheel.style.transform = `rotate(0deg)`;
    currentRotation = 0;

    setTimeout(() => {
      setIdleSpin(true);
    }, 900);
  });
}
if (closeAlready) {
  closeAlready.addEventListener('click', () => {
    if (alreadyPopup) alreadyPopup.classList.remove('show');
  });
}

window.addEventListener('resize', () => {
  resizeWheelCanvas();
  if (!spinLocked) drawWheel();
}, { passive: true });

}

// ==================== FOOTER STATUS ==================== 
function updateWebsiteStatus() { const status = document.getElementById('websiteStatus'); if (!status) return;

if (navigator.onLine) {
  status.innerHTML = '<span class="status-dot"></span> Online';
} else {
  status.innerHTML = '<span class="status-dot" style="background:#ef4444"></span> Offline';
}

}

function initMiscFooterBits() { const copyrightYear = document.getElementById('copyrightYear'); const lastUpdate = document.getElementById('lastUpdate');

if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();
if (lastUpdate) lastUpdate.textContent = document.lastModified;

updateThemeFooter();
updateWebsiteStatus();

window.addEventListener('online', updateWebsiteStatus);
window.addEventListener('offline', updateWebsiteStatus);

document.querySelectorAll('.nav-links a').forEach((item, index) => {
  item.style.setProperty('--i', index);
});

}
 function initHeroGreeting() {
  const heroTitle = document.getElementById("heroTitle");
  if (!heroTitle) return;

  // Ambil nama dari localStorage
  const data = localStorage.getItem("User.Captain_Z");

  let nama = "";

  try {
    const obj = JSON.parse(data);
    nama = obj?.name || "";
  } catch {
    nama = data || "";
  }

  nama = nama.trim();

  if (nama) {
    heroTitle.innerHTML = `Hi, <span>${nama}</span> 👋`;
  } else {
    heroTitle.innerHTML = `Hi, I'm <span>Yahya</span>`;
  }
}
// ==================== START ==================== 
function initialize() { initTheme(); initQuizGreeting(); initQuizActions(); initMusic(); initMobileMenu(); initSpinWheel(); initMiscFooterBits(); simulateLoading(); initHeroGreeting(); }

initialize(); });
