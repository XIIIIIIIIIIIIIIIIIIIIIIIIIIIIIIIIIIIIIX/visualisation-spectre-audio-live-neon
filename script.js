const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');

let audioContext;
let analyser;
let dataArray;
let animationId;
let source;

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function draw() {
    animationId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;
    
    for(let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] / 255 * canvas.height;
        
        const gradient = ctx.createLinearGradient(x, canvas.height - barHeight, x + barWidth, canvas.height);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.5, '#ff00ff');
        gradient.addColorStop(1, '#00ffff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
    }
}

async function startAudio() {
    try {
        statusEl.textContent = "Accès au microphone...";
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(stream);
        
        source.connect(analyser);
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        statusEl.textContent = "En écoute...";
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        draw();
    } catch (err) {
        statusEl.textContent = "Erreur: " + err.message;
        console.error("Erreur d'accès audio:", err);
    }
}

function stopAudio() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (source) {
        source.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
        audioContext.close();
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    statusEl.textContent = "Arrêté";
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

startBtn.addEventListener('click', startAudio);
stopBtn.addEventListener('click', stopAudio);
stopBtn.disabled = true;