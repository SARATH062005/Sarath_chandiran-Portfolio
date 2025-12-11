const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
if(container) container.appendChild(renderer.domElement);

// Objects
const geometry = new THREE.IcosahedronGeometry(10, 2);
const material = new THREE.MeshBasicMaterial({ 
    color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.15
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 700;
const posArray = new Float32Array(particlesCount * 3);
for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 50; 
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05, color: 0xffffff, transparent: true, opacity: 0.8
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

camera.position.z = 15;

function animateThreeJS() {
    requestAnimationFrame(animateThreeJS);
    
    // Read from global state (updated by Mouse or Hand Tracking)
    const mx = window.appState.mouseX;
    const my = window.appState.mouseY;

    sphere.rotation.y += 0.002;
    sphere.rotation.x += 0.001;
    
    // Interactive movement
    particlesMesh.rotation.y = -mx * 0.5;
    particlesMesh.rotation.x = -my * 0.5;
    sphere.rotation.y += 0.05 * (mx - sphere.rotation.y * 0.1);
    sphere.rotation.x += 0.05 * (my - sphere.rotation.x * 0.1);

    renderer.render(scene, camera);
}
animateThreeJS();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
});