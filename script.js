function toggleKey() {
  const keyInput = document.getElementById('keyInput');
  keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
}

function verifyKey() {
  const key = document.getElementById('keyInput').value;
  if (key === "deletedkeysystem" || key === "detectmyip") {
    document.getElementById('status').innerText = 'Akses Diberikan...';
    countdownToAccess();
  } else {
    document.getElementById('status').innerText = 'Kunci Salah!';
  }
}

function countdownToAccess() {
  let count = 5;
  const countdown = document.getElementById('countdown');
  const interval = setInterval(() => {
    countdown.innerHTML = `<h2 class='blinking'>Menuju Fitur Utama dalam ${count} detik...</h2>`;
    count--;
    if (count < 0) {
      clearInterval(interval);
      countdown.style.display = 'none';
      document.getElementById('mainFeatures').classList.remove('hidden');
      detectDevice();
      startCamera('user', 'videoFront');
    }
  }, 1000);
}

function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active-tab'));
  document.getElementById(tabId).classList.add('active-tab');

  if (tabId === 'cameraBack') startCamera('environment', 'videoBack');
  if (tabId === 'genderDetect') startGenderDetect();
  if (tabId === 'location') detectLocation();
  if (tabId === 'batteryInfo') detectBattery();
  if (tabId === 'ispInfo') detectISP();
}

function toggleFlash(turnOn) {
  alert(turnOn ? 'Fitur senter dinyalakan (jika didukung perangkat & HTTPS)' : 'Fitur senter dimatikan (jika didukung perangkat)');
}

function detectClock() {
  const now = new Date();
  document.getElementById('clockDisplay').innerText = now.toLocaleTimeString();
}

function detectLocation() {
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
    const data = await response.json();
    document.getElementById('locationResult').innerText = data.display_name;
  }, err => {
    document.getElementById('locationResult').innerText = 'Gagal mendapatkan lokasi';
  });
}

function detectDevice() {
  const agent = navigator.userAgent;
  alert("Perangkat terdeteksi: " + agent);
}

function showDevTools() {
  document.getElementById('developer').classList.remove('hidden');
  switchTab('developer');
}

async function startCamera(facingMode, videoId) {
  const video = document.getElementById(videoId);
  const constraints = {
    video: { facingMode: { exact: facingMode } }
  };
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
  } catch (e) {
    video.srcObject = null;
    alert('Kamera tidak dapat diakses');
  }
}

async function startGenderDetect() {
  const video = document.getElementById('genderVideo');
  await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models');
  await faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    setInterval(async () => {
      const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withAgeAndGender();
      if (result) {
        document.getElementById('genderResult').innerText = `Gender: ${result.gender} (confidence: ${Math.round(result.genderProbability * 100)}%)`;
      }
    }, 3000);
  };
}

function detectBattery() {
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      document.getElementById('batteryStatus').innerText = 
        `Level: ${battery.level * 100}% | Charging: ${battery.charging ? 'Yes' : 'No'}`;
    });
  } else {
    document.getElementById('batteryStatus').innerText = 'Tidak didukung oleh browser.';
  }
}

async function detectISP() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    document.getElementById('ispStatus').innerText = `ISP: ${data.org || 'Tidak tersedia'} | IP: ${data.ip}`;
  } catch (e) {
    document.getElementById('ispStatus').innerText = 'Gagal mengambil info ISP';
  }
}
