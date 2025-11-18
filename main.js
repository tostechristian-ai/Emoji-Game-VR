import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

import { createScene } from './utils.js';
import { initPlayer, updatePlayer, cameraMode } from './player.js';
import { initHUD, updateHUD, updateXPBar } from './hud.js';
import { updateEnemies, trySpawnEnemy } from './enemies.js';
import { updateBullets, fireBullet } from './bullets.js';
import { updatePickups } from './pickups.js';
import { applyDifficultyScaling } from './difficulty.js';
import { maybeShowUpgradeMenu } from './upgrades.js';

// GLOBALS
export const scene = new THREE.Scene();
export const renderer = new THREE.WebGLRenderer({ antialias: true });

// Setup basics
createScene(scene, renderer);

// Create player + camera
export const camera = initPlayer(scene);

// HUD
initHUD(camera);

// =====================================================
// MAIN GAME LOOP
// =====================================================
renderer.setAnimationLoop(() => {

    if (window.gameState.isGameOver) {
        renderer.render(scene, camera);
        return;
    }

    const now = performance.now();

    // Player movement + camera handling
    updatePlayer(now);

    // Enemy spawning + behavior
    trySpawnEnemy(now);
    updateEnemies();

    // Shooting
    fireBullet(now);
    updateBullets();

    // XP gems / hearts / apples
    updatePickups();

    // Difficulty scaling
    applyDifficultyScaling();

    // UI updates
    updateHUD();
    updateXPBar();

    // Level-up upgrade menu
    maybeShowUpgradeMenu();

    renderer.render(scene, camera);
});
