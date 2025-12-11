// Global State Definition
window.appState = {
    mouseX: 0,
    mouseY: 0,
    isHandControlActive: false,
    cursorX: window.innerWidth / 2,
    cursorY: window.innerHeight / 2,
    // Device Detection: Check User Agent or Touch Points
    isMobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0
};

// --- Debug & Diagnostics ---
const debugOverlay = document.getElementById('debug-overlay');
const dbgWebGL = document.getElementById('dbg-webgl');
const dbgCamera = document.getElementById('dbg-camera');
const dbgNote = document.getElementById('dbg-note');

// Toggle Debug Overlay on double click
if(debugOverlay) {
    debugOverlay.addEventListener('dblclick', () => {
        debugOverlay.style.display = debugOverlay.style.display === 'none' ? 'block' : 'none';
    });
    // Default: visible for testing
    debugOverlay.style.display = 'block';
}

// 1. Check WebGL Support
function webglSupported() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) { return false; }
}
if(dbgWebGL) dbgWebGL.innerText = webglSupported() ? 'OK' : 'Not Available';

// 2. Secure Context Check (Required for Camera)
function isSecureContextForCamera() {
    return (window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
}

if (!isSecureContextForCamera()) {
    if(dbgNote) dbgNote.innerText = '⚠️ Camera requires HTTPS or localhost.';
    console.warn('Camera features disabled: Insecure context.');
}

// 3. Camera Availability Check
if(dbgCamera) {
    dbgCamera.innerText = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? 'Available' : 'API Missing';
}

// --- UI Logic ---

// Mouse Listener (Desktop Fallback)
document.addEventListener('mousemove', (event) => {
    if (!window.appState.isHandControlActive) {
        window.appState.mouseX = event.clientX / window.innerWidth - 0.5;
        window.appState.mouseY = event.clientY / window.innerHeight - 0.5;
    }
});

// Mobile Menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });
}

// GSAP Animations
document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.gs-reveal').forEach(element => {
        gsap.fromTo(element, 
            { opacity: 0, y: 50 },
            {
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: element, start: 'top 85%' }
            }
        );
    });
});