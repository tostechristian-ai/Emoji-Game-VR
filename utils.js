import * as THREE from 'three';

export function createEmojiTexture(emoji, size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    ctx.font = `${size * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2);

    return new THREE.CanvasTexture(canvas);
}

export function playSound(freq, type = 'sine', duration = 0.1) {
    if (!window.audioCtx)
        window.audioCtx = new AudioContext();

    const osc = window.audioCtx.createOscillator();
    const gain = window.audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.01, window.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(window.audioCtx.destination);

    osc.start();
    osc.stop(window.audioCtx.currentTime + duration);
}
