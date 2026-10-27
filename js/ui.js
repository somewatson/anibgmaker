class AppState {
    constructor() {
        this.count = 100;
        this.speed = 1;
        this.color = '#ffffff';
        this.accentColor = '#ff0000';
        this.bgColor = '#000000';
        this.theme = 'default';
        this.musicTheme = 'ambient';
        this.micEnabled = false;
        this.hideMenu = false;
    }

    loadFromQueryString() {
        const params = new URLSearchParams(window.location.search);
        let hasParams = false;

        if (params.has('count')) {
            this.count = parseInt(params.get('count'));
            hasParams = true;
        }
        if (params.has('speed')) {
            this.speed = parseFloat(params.get('speed'));
            hasParams = true;
        }
        if (params.has('color')) {
            this.color = params.get('color');
            hasParams = true;
        }
        if (params.has('accentColor')) {
            this.accentColor = params.get('accentColor');
            hasParams = true;
        }
        if (params.has('bgColor')) {
            this.bgColor = params.get('bgColor');
            hasParams = true;
        }
        if (params.has('theme')) {
            this.theme = params.get('theme');
            hasParams = true;
        }
        if (params.has('musicTheme')) {
            this.musicTheme = params.get('musicTheme');
            hasParams = true;
        }
        if (params.has('mic')) {
            this.micEnabled = params.get('mic') === 'true';
            hasParams = true;
        }
        if (params.has('hideMenu')) {
            this.hideMenu = params.get('hideMenu') === 'true';
            hasParams = true;
        }

        return hasParams;
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

        const updateAndSync = (type) => {
            this.state.updateFromDOM();
            this.syncStateToURL();
            this.onStateChange(type);
        };

        bind('countSlider', 'input', () => {
            updateAndSync('count');
            document.getElementById('countValue').textContent = this.state.count;
        });

        bind('speedSlider', 'input', () => {
            updateAndSync('speed');
            document.getElementById('speedValue').textContent = this.state.speed;
        });

        bind('colorPicker', 'input', () => {
            updateAndSync('color');
        });

        bind('accentColorPicker', 'input', () => {
            updateAndSync('accentColor');
        });

        bind('bgColorPicker', 'input', () => {
            updateAndSync('bgColor');
        });

        bind('themeSelect', 'change', () => {
            updateAndSync('theme');
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

        bind('randomizeBtn', 'click', () => {
            this.randomize();
            this.syncStateToURL();
        });
        bind('randomizeColorsBtn', 'click', () => {
            this.randomizeColors();
            this.syncStateToURL();
        });
        bind('randomizeAllBtn', 'click', () => {
            this.randomizeAll();
            this.syncStateToURL();
        });

        bind('copyUrlBtn', 'click', () => {
            this.copyConfigURL();
        });
    }

    syncStateToURL() {
        const params = new URLSearchParams();
        params.set('count', this.state.count);
        params.set('speed', this.state.speed);
        params.set('color', this.state.color);
        params.set('accentColor', this.state.accentColor);
        params.set('bgColor', this.state.bgColor);
        params.set('theme', this.state.theme);
        params.set('musicTheme', this.state.musicTheme);
        params.set('mic', this.state.micEnabled);
        params.set('hideMenu', this.state.hideMenu);
        
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newURL);
        return newURL;
    }


    copyConfigURL() {
        const relativeURL = this.syncStateToURL();
        const fullURL = window.location.origin + relativeURL;
        
        navigator.clipboard.writeText(fullURL).then(() => {
            const btn = document.getElementById('copyUrlBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
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
