
const canvas = document.getElementById('bgCanvas');
const themeSelect = document.getElementById('themeSelect');
const prevThemeBtn = document.getElementById('prevThemeBtn');
const nextThemeBtn = document.getElementById('nextThemeBtn');
const countSlider = document.getElementById('countSlider');
const speedSlider = document.getElementById('speedSlider');

const colorPicker = document.getElementById('colorPicker');
const accentColorPicker = document.getElementById('accentColorPicker');
const bgColorPicker = document.getElementById('bgColorPicker');
const randomizeBtn = document.getElementById('randomizeBtn');
const randomizeColorsBtn = document.getElementById('randomizeColorsBtn');
const randomizeAllBtn = document.getElementById('randomizeAllBtn');
const countValue = document.getElementById('countValue');
const speedValue = document.getElementById('speedValue');
const fpsCounter = document.getElementById('fpsCounter');

// Menu visibility
const controls = document.getElementById('controls');
const audioControls = document.getElementById('audioControls');
const hideMenuBtn = document.getElementById('hideMenuBtn');
const showMenuBtn = document.getElementById('showMenuBtn');

// Audio
const musicTheme = document.getElementById('musicTheme');
const prevMusicBtn = document.getElementById('prevMusicBtn');
const nextMusicBtn = document.getElementById('nextMusicBtn');
const toggleMusicBtn = document.getElementById('toggleMusic');
const micBtn = document.getElementById('micBtn');
let audioCtx = null;
let musicInterval = null;
let analyser = null;
let dataArray = null;
let micStream = null;
let micIntensity = 0;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

async function initMic() {
    initAudio();
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioCtx.createMediaStreamSource(micStream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        micBtn.textContent = 'Disable Microphone';
        micBtn.classList.add('mic-active');
    } catch (err) {
        console.error('Mic access denied:', err);
        alert('Microphone access denied. Please allow mic access to use audio responsiveness.');
    }
}

micBtn.onclick = () => {
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
        analyser = null;
        micBtn.textContent = 'Enable Microphone';
        micBtn.classList.remove('mic-active');
    } else {
        initMic();
        // Note: class addition moved to initMic to handle error cases
    }
};

const switchModeBtn = document.getElementById('switchModeBtn');
if (switchModeBtn) {
    switchModeBtn.onclick = () => {
        window.location.href = 'webgl.html';
    };
}

function updateMicIntensity() {
    if (!analyser) return;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    micIntensity = sum / dataArray.length / 255; // Normalized 0-1
}

function playTone(freq, duration, type = 'sine') {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.connect(audioCtx.destination);
    osc.connect(g);
    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function createRainNoise() {
    if (!audioCtx) return null;
    
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.0, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    return { source: whiteNoise, gain: gainNode };
}

function createWaveNoise() {
    if (!audioCtx) return null;
    
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, audioCtx.currentTime);

    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, audioCtx.currentTime);

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.2, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    lfo.start();

    return { source: whiteNoise, lfo: lfo, gain: gainNode };
}

const musicPatterns = {
    ambient: [261.63, 329.63, 392.00, 523.25], 
    techno: [110.00, 130.81, 164.81, 196.00], 
    calm: [349.23, 440.00, 523.25, 659.25],    
    energetic: [196.00, 246.94, 293.66, 349.23],
    synthwave: [130.81, 164.81, 196.00, 220.00],
    lofi: [174.61, 220.00, 261.63, 311.13],
    euphoric: [440.00, 523.25, 659.25, 880.00],
    glitch: [100, 150, 400, 800, 1200],
    tron: [55.00, 65.41, 82.41, 110.00]
};

let rainNoise = null;
let waveNoise = null;

function startMusic() {
    if (!audioCtx) initAudio();
    const theme = musicTheme.value;
    
    if (theme === 'rain') {
        if (rainNoise) rainNoise.source.stop();
        rainNoise = createRainNoise();
        if (rainNoise) rainNoise.source.start();
        return;
    }
    if (theme === 'waves') {
        if (waveNoise) waveNoise.source.stop();
        waveNoise = createWaveNoise();
        if (waveNoise) waveNoise.source.start();
        return;
    }
    
    const pattern = musicPatterns[theme];

    
    musicInterval = setInterval(() => {
        const note = pattern[Math.floor(Math.random() * pattern.length)];
        let type = 'sine';
        if (theme === 'techno') type = 'square';
        else if (theme === 'energetic') type = 'sawtooth';
        else if (theme === 'synthwave') type = 'sawtooth';
        else if (theme === 'lofi') type = 'sine';
        else if (theme === 'euphoric') type = 'triangle';
        else if (theme === 'glitch') type = 'square';
        else if (theme === 'tron') type = 'sawtooth';
        
        playTone(note, 0.5, type);
    }, theme === 'glitch' ? 150 : (theme === 'synthwave' ? 250 : (theme === 'tron' ? 300 : 500)));
}

function stopMusic() {
    if (rainNoise) {
        rainNoise.source.stop();
        rainNoise = null;
    }
    if (waveNoise) {
        waveNoise.source.stop();
        if (waveNoise.lfo) waveNoise.lfo.stop();
        waveNoise = null;
    }
    clearInterval(musicInterval);
    musicInterval = null;
}

musicTheme.onchange = () => {
    if (musicInterval || rainNoise || waveNoise) {
        stopMusic();
        startMusic();
    }
};

nextMusicBtn.onclick = () => {
    const currentIndex = musicTheme.selectedIndex;
    const nextIndex = (currentIndex + 1) % musicTheme.options.length;
    musicTheme.selectedIndex = nextIndex;
    musicTheme.onchange();
};

prevMusicBtn.onclick = () => {
    const currentIndex = musicTheme.selectedIndex;
    const prevIndex = (currentIndex - 1 + musicTheme.options.length) % musicTheme.options.length;
    musicTheme.selectedIndex = prevIndex;
    musicTheme.onchange();
};

hideMenuBtn.onclick = () => {
    controls.style.display = 'none';
    audioControls.style.display = 'none';
    showMenuBtn.style.display = 'block';
};

showMenuBtn.onclick = () => {
    controls.style.display = 'block';
    audioControls.style.display = 'block';
    showMenuBtn.style.display = 'none';
};

toggleMusicBtn.onclick = () => {
    if (musicInterval || rainNoise || waveNoise) {
        stopMusic();
        toggleMusicBtn.textContent = 'Play Music';
    } else {
        startMusic();
        toggleMusicBtn.textContent = 'Stop Music';
    }
};

let width, height, particles = [];
let animationId;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * speedSlider.value;
        this.vy = (Math.random() - 0.5) * speedSlider.value;
        this.size = Math.random() * 3 + 1;
        this.isAccent = Math.random() > 0.7;
        this.color = this.isAccent ? accentColorPicker.value : colorPicker.value;
        this.shapeType = Math.floor(Math.random() * 5); // 0: polygon, 1: star, 2: ellipse, 3: ring, 4: diamond
        this.sides = Math.floor(Math.random() * 5) + 3; // 3 to 7 sides
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.z = Math.random() * 1000;
        this.speedMult = Math.random() * 0.5 + 0.5; // 0.5 to 1.5 for variety
        this.life = 1.0;
        this.state = 'ascending';
        this.targetY = Math.random() * (height * 0.5);
        this.fragments = [];
    }

    update(theme) {
        const audioBoost = 1 + micIntensity * 10;
        if (theme === 'tronCity' || theme === 'tronCircuit') {
            this.z -= speedSlider.value * 5 * audioBoost;
            if (this.z <= 0) {
                this.z = 1000;
                this.x = (Math.random() - 0.5) * width * 2;
                this.y = (Math.random() - 0.5) * height * 2;
            }
        } else if (theme === 'tronArena') {
            this.angle += this.rotationSpeed * 0.1 * audioBoost;
            this.x += Math.cos(this.angle) * 0.5 * audioBoost;
            this.y += Math.sin(this.angle) * 0.5 * audioBoost;
            if (this.x < -width) this.x = width;
            if (this.x > width) this.x = -width;
            if (this.y < -height) this.y = height;
            if (this.y > height) this.y = -height;
        } else if (theme === 'fireworks') {
            const audioBoost = 1 + micIntensity * 5;
            if (this.state === 'ascending') {
                if (this.y > height - 20 || this.vy >= 0) {
                    this.y = height + 10;
                    this.x = Math.random() * width;
                    this.vy = -Math.random() * 3 - 2;
                    this.vx = (Math.random() - 0.5) * 1;
                    this.targetY = Math.random() * (height * 0.5);
                }
                this.x += this.vx;
                this.y += this.vy * speedSlider.value * audioBoost;
                if (this.y <= this.targetY) {
                    this.state = 'exploding';
                    const fragCount = 20 + Math.floor(Math.random() * 30);
                    for (let i = 0; i < fragCount; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = Math.random() * 4 + 1;
                        this.fragments.push({
                            x: this.x,
                            y: this.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 1.0,
                            color: this.color
                        });
                    }
                }
            } else {
                this.fragments.forEach(f => {
                    f.x += f.vx;
                    f.y += f.vy;
                    f.vy += 0.05; // gravity
                    f.life -= 0.02;
                });
                if (this.fragments.length === 0 || this.fragments.every(f => f.life <= 0)) {
                    this.reset();
                    this.state = 'ascending';
                    this.y = height + 10;
                    this.vy = -Math.random() * 3 - 2;
                }
            }
        } else if (theme === 'birds') {
            this.angle += this.rotationSpeed * 0.05 * audioBoost;
            this.x += Math.sin(this.angle) * 2 * audioBoost;
            this.y += Math.cos(this.angle) * 2 * audioBoost;
            if (this.x < -width) this.x = width;
            if (this.x > width) this.x = -width;
            if (this.y < -height) this.y = height;
            if (this.y > height) this.y = -height;
        } else if (theme === 'deathstar') {
            this.angle += 0.01 * audioBoost;
            if (this.z < 1) this.z = 1;
            this.z += (Math.random() - 0.5) * 0.1 * audioBoost;
        } else if (theme === 'tempest') {
            this.z -= speedSlider.value * 4 * audioBoost;
            if (this.z <= 0) {
                this.z = 1000;
                this.angle = Math.random() * Math.PI * 2;
                this.size = Math.random() * 5 + 2;
            }
        } else if (theme === 'warp') {
            this.z -= speedSlider.value * 5 * audioBoost;
            if (this.z <= 0) {
                this.z = 1000;
                this.x = (Math.random() - 0.5) * width * 2;
                this.y = (Math.random() - 0.5) * height * 2;
            }
        } else if (theme === 'tunnel') {
            this.z -= speedSlider.value * 2 * audioBoost;
            if (this.z <= 0) this.z = 1000;
        } else if (theme === 'matrix') {
            this.y += speedSlider.value * 2 * audioBoost * this.speedMult;
            if (this.y > height) this.y = -20;
        } else if (theme === 'bubbles') {
            this.x += this.vx * 0.2 * audioBoost;
            this.y += this.vy * 0.2 * audioBoost;
            if (this.x < -100) this.x = width + 100;
            if (this.x > width + 100) this.x = -100;
            if (this.y < -100) this.y = height + 100;
            if (this.y > height + 100) this.y = -100;
        } else if (theme === 'confetti') {
            this.y += speedSlider.value * 0.8 * audioBoost;
            this.angle += this.rotationSpeed * audioBoost;
            if (this.y > height) this.y = -20;
        } else if (theme === 'snow') {
            this.y += speedSlider.value * 0.3 * audioBoost;
            this.x += Math.sin(Date.now() * 0.001) * 0.5 * audioBoost;
            if (this.y > height) this.y = -10;
        } else if (theme === 'beach') {
            this.x += this.vx * 0.1 * audioBoost;
            this.y += this.vy * 0.1 * audioBoost;
            
            const time = Date.now() * 0.001;
            // Use a simplified wave check based on the main wave timing
            const mainWaveY = height * 0.4 + Math.sin(time * 0.5) * (height * 0.2);
            
            if (this.y > mainWaveY + 50) {
                this.life -= 0.02;
                if (this.life <= 0) this.reset();
            } else {
                this.life = 1.0;
            }
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        } else {
            this.x += this.vx * audioBoost;
            this.y += this.vy * audioBoost;


            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            if (theme === 'popcorn') {
                this.vy += 0.05;
                if (this.y > height) this.reset();
            }
        }
    }

    draw(theme) {
        const ctx = canvas.getContext('2d');
        
        if (theme === 'fireworks') {
            if (this.state === 'ascending') {
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                this.fragments.forEach(f => {
                    ctx.beginPath();
                    ctx.fillStyle = f.color;
                    ctx.globalAlpha = f.life;
                    ctx.arc(f.x, f.y, this.size * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
            }
            return;
        }

        ctx.beginPath();
        ctx.fillStyle = this.color;
        
        if (theme === 'lightsaber') {
            ctx.lineWidth = 10;
            ctx.strokeStyle = this.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + Math.cos(this.angle) * 300, this.y + Math.sin(this.angle) * 300);
            ctx.stroke();
            ctx.shadowBlur = 0;
            return;
        } else if (theme === 'deathstar') {
            const scale = 1000 / this.z;
            const x = width / 2 + Math.cos(this.angle) * (100 * scale);
            const y = height / 2 + Math.sin(this.angle) * (100 * scale);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(x + 10 * scale, y - 10 * scale, 8 * scale, 0, Math.PI * 2);
            ctx.stroke();
            
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * 20 * scale, y + Math.sin(angle) * 20 * scale);
                ctx.stroke();
            }
            return;
        } else if (theme === 'tempest') {
            const scale = 1000 / this.z;
            const x = width / 2 + Math.cos(this.angle) * (50 * scale);
            const y = height / 2 + Math.sin(this.angle) * (50 * scale);
            const size = this.size * scale;
            
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'white';
            ctx.fillRect(x - 1, y - 1, 2, 2);
            return;
        } else if (theme === 'triangles') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle + Date.now() * 0.001 * this.rotationSpeed);
            ctx.beginPath();
            const s = this.size * 10;
            ctx.moveTo(0, -s);
            ctx.lineTo(s, s);
            ctx.lineTo(-s, s);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            return;
        } else if (theme === 'tronCity') {
            const scale = 1000 / this.z;
            const x = this.x * scale + width / 2;
            const y = this.y * scale + height / 2;
            const w = this.size * 10 * scale;
            const h = this.size * 50 * scale;
            ctx.fillStyle = this.color;
            ctx.fillRect(x - w/2, y - h, w, h);
            // Neon top
            ctx.fillStyle = 'white';
            ctx.fillRect(x - w/2, y - h, w, 2 * scale);
        } else if (theme === 'tronCircuit') {
            const scale = 1000 / this.z;
            const x = this.x * scale + width / 2;
            const y = this.y * scale + height / 2;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 5 * scale;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 50 * scale, y);
            ctx.stroke();
        } else if (theme === 'tronArena') {
            const scale = 1;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (theme === 'warp') {
            const scale = 1000 / this.z;
            const x = (this.x || 0) * scale + width / 2;
            const y = (this.y || 0) * scale + height / 2;
            const size = this.size * scale;
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        } else if (theme === 'tunnel') {
            const scale = 1000 / this.z;
            const size = 100 * scale;
            ctx.lineWidth = 2;
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            for (let i = 0; i < this.sides; i++) {
                const angle = (i * 2 * Math.PI) / this.sides;
                const x = width / 2 + size * Math.cos(angle);
                const y = height / 2 + size * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        } else if (theme === 'grid') {
            const x = (this.x - width/2) * (1/this.z) + width/2;
            const y = (this.y - height/2) * (1/this.z) + height/2;
            ctx.fillRect(x, y, 2, 2);
        } else if (theme === 'matrix') {
            ctx.fillRect(this.x, this.y, 2, 10 * this.size);
        } else if (theme === 'bubbles') {
            ctx.globalAlpha = this.opacity;
            ctx.arc(this.x, this.y, this.size * 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        } else if (theme === 'nebula') {
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 50);
            grad.addColorStop(0, this.color);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.arc(this.x, this.y, this.size * 50, 0, Math.PI * 2);
            ctx.fill();
        } else if (theme === 'confetti') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillRect(-2, -2, 4, 8);
            ctx.restore();
        } else if (theme === 'snow') {
            ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (theme === 'beach') {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        } else if (theme === 'shapes') {
            const side = this.size * 5;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle + Date.now() * 0.001 * this.rotationSpeed);
            
            if (this.shapeType === 0) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                for (let i = 1; i <= this.sides; i++) {
                    const angle = (i * 2 * Math.PI) / this.sides;
                    ctx.lineTo(side * Math.cos(angle), side * Math.sin(angle));
                }
                ctx.closePath();
                ctx.fill();
            } else if (this.shapeType === 1) {
                ctx.beginPath();
                for (let i = 0; i < 10; i++) {
                    const r = i % 2 === 0 ? side : side / 2;
                    const angle = (i * Math.PI) / 5;
                    ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
                }
                ctx.closePath();
                ctx.fill();
            } else if (this.shapeType === 2) {
                ctx.beginPath();
                ctx.ellipse(0, 0, side, side / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.shapeType === 3) {
                ctx.beginPath();
                ctx.arc(0, 0, side / 2, 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = this.color;
                ctx.stroke();
            } else if (this.shapeType === 4) {
                ctx.beginPath();
                ctx.moveTo(0, -side);
                ctx.lineTo(side / 2, 0);
                ctx.lineTo(0, side);
                ctx.lineTo(-side / 2, 0);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        } else if (theme === 'birds') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            const flap = Math.sin(Date.now() * 0.01) * 10;
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.quadraticCurveTo(-5, -10 + flap, 0, 0);
            ctx.quadraticCurveTo(5, -10 + flap, 15, 0);
            ctx.stroke();
            ctx.restore();
            return;
        } else if (theme === 'stars') {
            ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function init() {
    particles = [];
    const count = parseInt(countSlider.value);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    updateMicIntensity();
    const now = performance.now();
    if (!window.lastTime) window.lastTime = now;
    const delta = now - window.lastTime;
    window.lastTime = now;
    
    if (delta > 0) {
        const fps = Math.round(1000 / delta);
        if (Math.random() < 0.1) {
            fpsCounter.textContent = `FPS: ${fps}`;
        }
    }
    
    const theme = themeSelect.value;
    const ctx = canvas.getContext('2d');
    
    if (theme === 'beach') {
        const sandGrad = ctx.createLinearGradient(0, 0, 0, height);
        sandGrad.addColorStop(0, '#0066cc'); // Deep ocean
        sandGrad.addColorStop(0.3, '#00aaff'); // Mid ocean
        sandGrad.addColorStop(0.45, '#4da6ff'); // Shallows
        sandGrad.addColorStop(0.5, '#c2b280'); // Wet sand (shoreline)
        sandGrad.addColorStop(0.7, '#f2d2a9'); // Dry sand
        sandGrad.addColorStop(1, '#e6be8a'); // Deeper sand
        ctx.fillStyle = sandGrad;
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() * 0.001;
        
        for (let i = 0; i < 3; i++) {
            const offset = i * 1.5;
            const waveY = height * 0.4 + Math.sin(time * 0.5 + offset) * (height * 0.15);
            const waveColor = `rgba(0, 119, 190, ${0.4 - (i * 0.1)})`;
            
            ctx.fillStyle = waveColor;
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(0, waveY);
            for (let x = 0; x <= width; x += 40) {
                const y = waveY + Math.sin(x * 0.005 + time + offset) * 15;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();

            // Add a white "foam" edge to each wave
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, waveY);
            for (let x = 0; x <= width; x += 40) {
                const y = waveY + Math.sin(x * 0.005 + time + offset) * 15;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    } else {
        let currentBgColor = bgColorPicker.value;
        
        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, width, height);
        
        if (theme === 'tronCity' || theme === 'tronCircuit') {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, width, height);
        } else if (theme === 'fireworks') {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(0, 0, width, height);
        } else {
            ctx.fillStyle = bgColorPicker.value;
            ctx.fillRect(0, 0, width, height);
        }
    }
    
    particles.forEach(p => {
        p.update(theme);
        p.draw(theme);
    });
    
    animationId = requestAnimationFrame(animate);
}

nextThemeBtn.onclick = () => {
    const currentIndex = themeSelect.selectedIndex;
    const nextIndex = (currentIndex + 1) % themeSelect.options.length;
    themeSelect.selectedIndex = nextIndex;
    themeSelect.onchange();
};

prevThemeBtn.onclick = () => {
    const currentIndex = themeSelect.selectedIndex;
    const prevIndex = (currentIndex - 1 + themeSelect.options.length) % themeSelect.options.length;
    themeSelect.selectedIndex = prevIndex;
    themeSelect.onchange();
};

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowRight') {
        nextThemeBtn.click();
    }
});

themeSelect.onchange = () => {
    init();
};

countSlider.oninput = () => {
    countValue.textContent = countSlider.value;
    init();
};

speedSlider.oninput = () => {
    speedValue.textContent = speedSlider.value;
    particles.forEach(p => {
        p.vx = (Math.random() - 0.5) * speedSlider.value;
        p.vy = (Math.random() - 0.5) * speedSlider.value;
    });
};

colorPicker.oninput = () => {
    particles.forEach(p => {
        if (p.isAccent === false || p.isAccent === undefined) {
            p.color = colorPicker.value;
        }
    });
};

accentColorPicker.oninput = () => {
    particles.forEach(p => {
        if (p.isAccent === true) {
            p.color = accentColorPicker.value;
        }
    });
};

randomizeBtn.onclick = () => {
    colorPicker.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    bgColorPicker.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    themeSelect.value = themeSelect.options[Math.floor(Math.random() * themeSelect.options.length)].value;
    init();
};

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

randomizeColorsBtn.onclick = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const accentHue = (baseHue + 180) % 360; // Complementary
    
    colorPicker.value = hslToHex(baseHue, 70, 60);
    accentColorPicker.value = hslToHex(accentHue, 80, 60);
    bgColorPicker.value = hslToHex(baseHue, 20, 10); // Dark version of base hue
    
    colorPicker.oninput();
    accentColorPicker.oninput();
};

randomizeAllBtn.onclick = () => {
    colorPicker.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    bgColorPicker.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    themeSelect.value = themeSelect.options[Math.floor(Math.random() * themeSelect.options.length)].value;
    
    const min = parseInt(countSlider.min);
    const max = parseInt(countSlider.max);
    countSlider.value = Math.floor(Math.random() * (max - min + 1)) + min;
    countValue.textContent = countSlider.value;
    
    const sMin = parseInt(speedSlider.min);
    const sMax = parseInt(speedSlider.max);
    speedSlider.value = Math.floor(Math.random() * (sMax - sMin + 1)) + sMin;
    speedValue.textContent = speedSlider.value;
    
    init();
};

init();
animate();
