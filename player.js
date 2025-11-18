import * as THREE from 'three';
import { createEmojiTexture } from './utils.js';

export let cameraMode = "first";
export const userGroup = new THREE.Group();

export function initPlayer(scene) {
    // Player state
    window.gameState = {
        hp: 3,
        maxHp: 3,
        xp: 0,
        xpToNext: 10,
        level: 1,
        score: 0,
        isGameOver: false,
        lastFire: 0,
        fireRate: 500,
        moveSpeed: 0.05,
        magnetRange: 5
    };

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    userGroup.position.set(0, 0, 0);
    userGroup.add(camera);

    scene.add(userGroup);

    setupModeButtons();

    return camera;
}

function setupModeButtons() {
    document.getElementById("fpBtn").onclick = () => {
        cameraMode = "first";
        document.getElementById("modeMenu").style.display = "none";
    };
    document.getElementById("tpBtn").onclick = () => {
        cameraMode = "third";
        document.getElementById("modeMenu").style.display = "none";
    };
}

export function updatePlayer(now) {
    const session = renderer.xr.getSession();
    if (!session) return;

    for (const source of session.inputSources) {
        const gp = source.gamepad;
        if (!gp) continue;

        if (gp.axes.length >= 4) {
            const x = gp.axes[2];
            const y = gp.axes[3];

            if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
                const angle = userGroup.children[0].rotation.y;
                const dx = x * Math.cos(angle) + y * Math.sin(angle);
                const dz = -x * Math.sin(angle) + y * Math.cos(angle);

                userGroup.position.x += dx * window.gameState.moveSpeed;
                userGroup.position.z += dz * window.gameState.moveSpeed;
            }
        }
    }
}
