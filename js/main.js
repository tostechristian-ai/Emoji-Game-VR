import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
// Import player components to be used in the scene
import { playerRig, playerMesh, updatePlayer } from './player.js'; 

// --- Global Variables ---
let scene, camera, renderer, clock;
let isFirstPerson = true;

// --- WebXR Specific: The Camera Rig ---
// This is the parent object that is moved for 'virtual' locomotion in VR.
// The headset's position/rotation is applied to the camera *relative* to this rig.
let cameraRig; 

// --- DOM Elements ---
const modeMenu = document.getElementById('modeMenu');
const fpBtn = document.getElementById('fpBtn');
const tpBtn = document.getElementById('tpBtn');

// --- Initialization ---
function init() {
    // Clock
    clock = new THREE.Clock();

    // Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    scene.add(new THREE.GridHelper(20, 20));

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Enable WebXR
    document.body.appendChild(renderer.domElement);

    // Camera Setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    
    // Create the Camera Rig (The object we position for the player's world location)
    cameraRig = new THREE.Group();
    cameraRig.add(camera); // Camera is a child of the rig
    scene.add(cameraRig);

    // Add the Player's visual representation rig to the scene
    scene.add(playerRig);

    // Initial position for the camera rig (start position)
    cameraRig.position.set(0, 0, 5);

    // VR Button
    document.body.appendChild(VRButton.createButton(renderer));

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    setupModeListeners();
    
    // Set initial mode
    setGameMode(true); 

    // Start the render loop
    renderer.setAnimationLoop(animate);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Mode Switching Logic ---

function setupModeListeners() {
    fpBtn.addEventListener('click', () => setGameMode(true));
    tpBtn.addEventListener('click', () => setGameMode(false));
}

/**
 * Adjusts the camera's local position relative to the cameraRig to achieve FP or TP view.
 * @param {boolean} isFP - true for First Person, false for Third Person.
 */
function setGameMode(isFP) {
    isFirstPerson = isFP;
    
    // 1. Show/Hide the visual player body
    playerMesh.visible = !isFP;
    
    // 2. Adjust the camera's LOCAL position/rotation within its parent (cameraRig)
    if (isFP) {
        // FIRST PERSON: Camera is placed at the origin of the rig.
        // The headset tracks the camera's offset from this point.
        camera.position.set(0, 0, 0); 
        camera.rotation.set(0, 0, 0); 
    } else {
        // THIRD PERSON: Camera is offset BEHIND the rig's origin.
        const distance = 4; // Distance back
        const height = 2;   // Height up
        
        // Simple offset relative to the rig's direction
        camera.position.set(0, height, distance); 
        camera.lookAt(0, 1.5, 0); // Look towards the rig's center
    }
    
    // 3. Hide the menu after selection
    if (modeMenu) {
        modeMenu.style.display = 'none';
    }
    
    console.log(`Switched to ${isFP ? 'First Person' : 'Third Person'}`);
}

// --- Game Loop ---

function animate() {
    const delta = clock.getDelta();

    // 1. Update Game Logic
    updatePlayer(delta); 

    // 2. Player Body Tracking (Crucial for Third Person)
    // The playerRig (the body mesh) must follow the cameraRig (the actual viewpoint)
    if (!isFirstPerson) {
        // Copy position and rotation from the cameraRig to the visual player body
        playerRig.position.copy(cameraRig.position);
        playerRig.rotation.copy(cameraRig.rotation);
        
        // Compensate for the camera being at the head position
        // The playerRig is positioned at the cameraRig's feet.
        playerRig.position.y = 0; 
    } else {
        // In FP, the playerRig's position should still follow the cameraRig 
        // if we intend for player-controlled locomotion to work seamlessly
        playerRig.position.copy(cameraRig.position);
        playerRig.rotation.copy(cameraRig.rotation);
    }
    
    // 3. Render
    renderer.render(scene, camera);
}

// --- Start the Application ---
init();
