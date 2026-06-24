class AppState {
    constructor() {
        this.count = 100;
        this.speed = 1;
        this.color = '#ffffff';
        this.accentColor = '#ff0000';
        this.bgColor = '#000000';
        this.theme = 'default';
        this.musicTheme = 'ambient';
    }

    updateFromDOM() {
        const countSlider = document.getElementById('countSlider');
        const speedSlider = document.getElementById('speedSlider');
        const colorPicker = document.getElementById('colorPicker');
        const accentColorPicker = document.getElementById('accentColorPicker');
        const bgColorPicker = document.getElementById('bgColorPicker');
        const themeSelect = document.getElementById('themeSelect');
        const musicThemeSelect = document.getElementById('musicTheme');

        if (countSlider) this.count = parseInt(countSlider.value);
        if (speedSlider) this.speed = parseFloat(speedSlider.value);
        if (colorPicker) this.color = colorPicker.value;
        if (accentColorPicker) this.accentColor = accentColorPicker.value;
        if (bgColorPicker) this.bgColor = bgColorPicker.value;
        if (themeSelect) this.theme = themeSelect.value;
        if (musicThemeSelect) this.musicTheme = musicThemeSelect.value;
    }
}

class UIHandler {
    constructor(state, onStateChange) {
        this.state = state;
        this.onStateChange = onStateChange;
        this.initEventListeners();
    }

    initEventListeners() {
        const bind = (id, event, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(event, fn);
        };

        bind('countSlider', 'input', () => {
            this.state.updateFromDOM();
            document.getElementById('countValue').textContent = this.state.count;
            this.onStateChange('count');
        });

        bind('speedSlider', 'input', () => {
            this.state.updateFromDOM();
            document.getElementById('speedValue').textContent = this.state.speed;
            this.onStateChange('speed');
        });

        bind('colorPicker', 'input', () => {
            this.state.updateFromDOM();
            this.onStateChange('color');
        });

        bind('accentColorPicker', 'input', () => {
            this.state.updateFromDOM();
            this.onStateChange('accentColor');
        });

        bind('bgColorPicker', 'input', () => {
            this.state.updateFromDOM();
            this.onStateChange('bgColor');
        });

        bind('themeSelect', 'change', () => {
            this.state.updateFromDOM();
            this.onStateChange('theme');
        });

        bind('prevThemeBtn', 'click', () => {
            const select = document.getElementById('themeSelect');
            const nextIndex = (select.selectedIndex - 1 + select.options.length) % select.options.length;
            select.selectedIndex = nextIndex;
            select.dispatchEvent(new Event('change'));
        });

        bind('nextThemeBtn', 'click', () => {
            const select = document.getElementById('themeSelect');
            const nextIndex = (select.selectedIndex + 1) % select.options.length;
            select.selectedIndex = nextIndex;
            select.dispatchEvent(new Event('change'));
        });

        bind('hideMenuBtn', 'click', () => {
            document.getElementById('controls').style.display = 'none';
            document.getElementById('audioControls').style.display = 'none';
            document.getElementById('showMenuBtn').style.display = 'block';
        });

        bind('showMenuBtn', 'click', () => {
            document.getElementById('controls').style.display = 'block';
            document.getElementById('audioControls').style.display = 'block';
            document.getElementById('showMenuBtn').style.display = 'none';
        });

        bind('randomizeBtn', 'click', () => this.randomize());
        bind('randomizeColorsBtn', 'click', () => this.randomizeColors());
        bind('randomizeAllBtn', 'click', () => this.randomizeAll());
    }

    randomize() {
        const colorPicker = document.getElementById('colorPicker');
        const bgColorPicker = document.getElementById('bgColorPicker');
        const themeSelect = document.getElementById('themeSelect');
        
        colorPicker.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        bgColorPicker.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        themeSelect.value = themeSelect.options[Math.floor(Math.random() * themeSelect.options.length)].value;
        
        this.state.updateFromDOM();
        this.onStateChange('all');
    }

    randomizeColors() {
        const baseHue = Math.floor(Math.random() * 360);
        const accentHue = (baseHue + 180) % 360;
        
        const hslToHex = (h, s, l) => {
            l /= 100;
            const a = s * Math.min(l, 1 - l) / 100;
            const f = n => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        };

        document.getElementById('colorPicker').value = hslToHex(baseHue, 70, 60);
        document.getElementById('accentColorPicker').value = hslToHex(accentHue, 80, 60);
        document.getElementById('bgColorPicker').value = hslToHex(baseHue, 20, 10);
        
        this.state.updateFromDOM();
        this.onStateChange('colors');
    }

    randomizeAll() {
        const colorPicker = document.getElementById('colorPicker');
        const bgColorPicker = document.getElementById('bgColorPicker');
        const themeSelect = document.getElementById('themeSelect');
        const countSlider = document.getElementById('countSlider');
        const speedSlider = document.getElementById('speedSlider');

        colorPicker.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        bgColorPicker.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        themeSelect.value = themeSelect.options[Math.floor(Math.random() * themeSelect.options.length)].value;
        
        const min = parseInt(countSlider.min);
        const max = parseInt(countSlider.max);
        countSlider.value = Math.floor(Math.random() * (max - min + 1)) + min;
        document.getElementById('countValue').textContent = countSlider.value;

        const sMin = parseInt(speedSlider.min);
        const sMax = parseInt(speedSlider.max);
        speedSlider.value = Math.floor(Math.random() * (sMax - sMin + 1)) + sMin;
        document.getElementById('speedValue').textContent = speedSlider.value;

        this.state.updateFromDOM();
        this.onStateChange('all');
    }
}
