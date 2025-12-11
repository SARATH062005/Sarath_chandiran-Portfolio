const container = document.getElementById('canvas-container');

// Detect Mobile from global state
const isMobile = window.appState.isMobile;

// --- Renderer Configuration ---
const rendererOpts = { 
    alpha: true, 
    antialias: true // Default for desktop
};

// Optimization for Mobile
if (isMobile) {
    rendererOpts.powerPreference = 'high-performance'; // Hint to browser
    rendererOpts.antialias = false; // Disable AA on mobile to save GPU
}

const renderer = new THREE.WebGLRenderer(rendererOpts);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

if(container) {
    container.appendChild(renderer.domElement);
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

// --- Objects ---

// 1. Central Icosahedron
const geometry = new THREE.IcosahedronGeometry(10, 2);
const material = new THREE.MeshBasicMaterial({ 
    color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.12 
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// 2. Particle System (Dynamic Count based on Device)
const particlesCount = isMobile ? 150 : 700; // Significantly fewer particles on mobile
const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 50; 
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05, color: 0xffffff, transparent: true, opacity: 0.9
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- Animation Loop ---
function animateThreeJS() {
    requestAnimationFrame(animateThreeJS);
    
    // Read global mouse/cursor state
    const mx = window.appState.mouseX;
    const my = window.appState.mouseY;

    // Passive Rotation
    sphere.rotation.y += 0.002;
    sphere.rotation.x += 0.001;
    
    // Interactive Rotation (Mouse or Hand)
    particlesMesh.rotation.y = -mx * 0.5;
    particlesMesh.rotation.x = -my * 0.5;
    sphere.rotation.y += 0.05 * (mx - sphere.rotation.y * 0.1);
    sphere.rotation.x += 0.05 * (my - sphere.rotation.x * 0.1);

    renderer.render(scene, camera);
}
animateThreeJS();

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    
    // Resize Hand Canvas to match Video if active
    const handCanvas = document.getElementById('hand-canvas');
    const video = document.getElementById('input_video');
    if (handCanvas && video) {
        handCanvas.width = video.clientWidth;
        handCanvas.height = video.clientHeight;
    }
});