// Global Shared State
window.appState = {
    mouseX: 0,
    mouseY: 0,
    isHandControlActive: false,
    cursorX: window.innerWidth / 2,
    cursorY: window.innerHeight / 2
};

// Default Mouse Listener (updates state if hands are not active)
document.addEventListener('mousemove', (event) => {
    if (!window.appState.isHandControlActive) {
        window.appState.mouseX = event.clientX / window.innerWidth - 0.5;
        window.appState.mouseY = event.clientY / window.innerHeight - 0.5;
    }
});

// Mobile Menu Toggle
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