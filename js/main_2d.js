class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 3 + 1;
        this.isAccent = Math.random() > 0.7;
        this.shapeType = Math.floor(Math.random() * 5);
        this.sides = Math.floor(Math.random() * 5) + 3;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.z = Math.random() * 1000;
        this.speedMult = Math.random() * 0.5 + 0.5;
        this.life = 1.0;
        this.state = 'ascending';
        this.targetY = Math.random() * (window.innerHeight * 0.5);
        this.fragments = [];
    }

    update(theme, audioBoost, state) {
        this.color = this.isAccent ? state.accentColor : state.color;
        theme.update(this, audioBoost, window.innerWidth, window.innerHeight, state.speed);
    }

    draw(ctx, theme, state) {
        ctx.fillStyle = this.color;
        theme.draw(ctx, this, window.innerWidth, window.innerHeight);
    }
}

const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
const appState = new AppState();

// Load from URL if parameters exist
const hasUrlParams = appState.loadFromQueryString();

// Sync DOM to the (possibly updated) state
const syncDOMToState = () => {
    if (document.getElementById('countSlider')) document.getElementById('countSlider').value = appState.count;
    if (document.getElementById('countValue')) document.getElementById('countValue').textContent = appState.count;
    if (document.getElementById('speedSlider')) document.getElementById('speedSlider').value = appState.speed;
    if (document.getElementById('speedValue')) document.getElementById('speedValue').textContent = appState.speed;
    if (document.getElementById('colorPicker')) document.getElementById('colorPicker').value = appState.color;
    if (document.getElementById('accentColorPicker')) document.getElementById('accentColorPicker').value = appState.accentColor;
    if (document.getElementById('bgColorPicker')) document.getElementById('bgColorPicker').value = appState.bgColor;
    if (document.getElementById('themeSelect')) document.getElementById('themeSelect').value = appState.theme;
};

syncDOMToState();

// Hide menu by default if we loaded from URL
if (hasUrlParams) {
    document.getElementById('controls').style.display = 'none';
    document.getElementById('audioControls').style.display = 'none';
    
    if (appState.hideMenu) {
        document.getElementById('showMenuBtn').style.display = 'none';
    } else {
        document.getElementById('showMenuBtn').style.display = 'block';
    }
}

const ui = new UIHandler(appState, (type) => {
    if (type === 'count' || type === 'theme' || type === 'all') init();
    if (type === 'color' || type === 'accentColor' || type === 'colors') {
        // Particle colors are updated in their update loop based on appState
    }
});

let particles = [];
let animationId;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

function init() {
    particles = [];
    const count = appState.count;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    const audioBoost = 1;
    
    const now = performance.now();
    if (!window.lastTime) window.lastTime = now;
    const delta = now - window.lastTime;
    window.lastTime = now;
    if (delta > 0) {
        const fps = Math.round(1000 / delta);
        if (Math.random() < 0.1) {
            document.getElementById('fpsCounter').textContent = `FPS: ${fps}`;
        }
    }

    const theme = THEMES[appState.theme] || THEMES['default'];
    theme.drawBackground(ctx, canvas.width, canvas.height, appState.bgColor);

    particles.forEach(p => {
        p.update(theme, audioBoost, appState);
        p.draw(ctx, theme, appState);
    });

    animationId = requestAnimationFrame(animate);
}

// Audio UI bindings (kept in main as they are tightly coupled to audioManager)
// REMOVED AUDIO FEATURES

init();
animate();
