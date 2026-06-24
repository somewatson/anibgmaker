class AudioManager {
    constructor() {
        this.audioCtx = null;
        this.musicInterval = null;
        this.analyser = null;
        this.dataArray = null;
        this.micStream = null;
        this.micIntensity = 0;
        this.rainNoise = null;
        this.waveNoise = null;
        this.musicPatterns = {
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
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioCtx;
    }

    async initMic() {
        this.initAudio();
        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.audioCtx.createMediaStreamSource(this.micStream);
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            source.connect(this.analyser);
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            return true;
        } catch (err) {
            console.error('Mic access denied:', err);
            return false;
        }
    }

    stopMic() {
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
            this.analyser = null;
        }
    }

    updateMicIntensity() {
        if (!this.analyser) return 0;
        this.analyser.getByteFrequencyData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        this.micIntensity = sum / this.dataArray.length / 255;
        return this.micIntensity;
    }

    playTone(freq, duration, type = 'sine') {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        g.connect(this.audioCtx.destination);
        osc.connect(g);
        g.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    createRainNoise() {
        if (!this.audioCtx) return null;
        const bufferSize = 2 * this.audioCtx.sampleRate;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = this.audioCtx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, this.audioCtx.currentTime);
        filter.Q.setValueAtTime(1.0, this.audioCtx.currentTime);
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        return { source: whiteNoise, gain: gainNode };
    }

    createWaveNoise() {
        if (!this.audioCtx) return null;
        const bufferSize = 2 * this.audioCtx.sampleRate;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = this.audioCtx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, this.audioCtx.currentTime);
        const lfo = this.audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.1, this.audioCtx.currentTime);
        const lfoGain = this.audioCtx.createGain();
        lfoGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        lfo.start();
        return { source: whiteNoise, lfo: lfo, gain: gainNode };
    }

    startMusic(theme) {
        this.initAudio();
        if (theme === 'rain') {
            if (this.rainNoise) this.rainNoise.source.stop();
            this.rainNoise = this.createRainNoise();
            if (this.rainNoise) this.rainNoise.source.start();
            return;
        }
        if (theme === 'waves') {
            if (this.waveNoise) this.waveNoise.source.stop();
            this.waveNoise = this.createWaveNoise();
            if (this.waveNoise) this.waveNoise.source.start();
            return;
        }
        const pattern = this.musicPatterns[theme];
        if (!pattern) return;
        this.musicInterval = setInterval(() => {
            const note = pattern[Math.floor(Math.random() * pattern.length)];
            let type = 'sine';
            if (theme === 'techno') type = 'square';
            else if (theme === 'energetic') type = 'sawtooth';
            else if (theme === 'synthwave') type = 'sawtooth';
            else if (theme === 'lofi') type = 'sine';
            else if (theme === 'euphoric') type = 'triangle';
            else if (theme === 'glitch') type = 'square';
            else if (theme === 'tron') type = 'sawtooth';
            this.playTone(note, 0.5, type);
        }, theme === 'glitch' ? 150 : (theme === 'synthwave' ? 250 : (theme === 'tron' ? 300 : 500)));
    }

    stopMusic() {
        if (this.rainNoise) {
            this.rainNoise.source.stop();
            this.rainNoise = null;
        }
        if (this.waveNoise) {
            this.waveNoise.source.stop();
            if (this.waveNoise.lfo) this.waveNoise.lfo.stop();
            this.waveNoise = null;
        }
        clearInterval(this.musicInterval);
        this.musicInterval = null;
    }

    isMusicPlaying() {
        return this.musicInterval || this.rainNoise || this.waveNoise;
    }
}
