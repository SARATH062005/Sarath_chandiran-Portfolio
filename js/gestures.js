const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('hand-canvas');
const canvasCtx = canvasElement ? canvasElement.getContext('2d') : null;
const toggleBtn = document.getElementById('hand-scroll-toggle');
const previewDiv = document.getElementById('hand-preview');
const virtualCursor = document.getElementById('virtual-cursor');
const instructions = document.getElementById('gesture-instructions');
const closeInstructionsBtn = document.getElementById('close-instructions');

let cameraObj = null;
let clickCooldown = false;

// Smoothing variables
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
const smoothFactor = 0.2; 

// Hide gestures on touch devices
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (isTouchDevice) {
    const handUI = document.getElementById('hand-scroll-ui');
    if (handUI) handUI.style.display = 'none';
}

if(toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        if (!window.appState.isHandControlActive) {
            startHandTracking();
            instructions.style.display = 'block';
        } else {
            stopHandTracking();
        }
    });
}

if(closeInstructionsBtn) {
    closeInstructionsBtn.addEventListener('click', () => {
        instructions.style.display = 'none';
    });
}

function startHandTracking() {
    window.appState.isHandControlActive = true;
    toggleBtn.innerText = "Disable Gesture Control";
    previewDiv.classList.remove('hidden');
    virtualCursor.style.display = 'block';
    
    if (cameraObj) {
        cameraObj.start();
    } else {
        cameraObj = new Camera(videoElement, {
            onFrame: async () => { await hands.send({image: videoElement}); },
            width: 320, height: 240
        });
        cameraObj.start();
    }
}

function stopHandTracking() {
    window.appState.isHandControlActive = false;
    toggleBtn.innerText = "Enable Gesture Control";
    previewDiv.classList.add('hidden');
    virtualCursor.style.display = 'none';
    instructions.style.display = 'none';
    if (cameraObj) cameraObj.stop();
}

const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

hands.onResults(onResults);

function countFingers(lm) {
    // Tips: 8 (Index), 12 (Middle), 16 (Ring), 20 (Pinky)
    // PIPs: 6, 10, 14, 18
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    let count = 0;
    
    tips.forEach((tipIdx, i) => {
        if (lm[tipIdx].y < lm[pips[i]].y) count++;
    });

    // Thumb check
    const thumbTip = lm[4];
    const indexMCP = lm[5];
    const dist = Math.sqrt(Math.pow(thumbTip.x - indexMCP.x, 2) + Math.pow(thumbTip.y - indexMCP.y, 2));
    if(dist > 0.05) count++;

    return count;
}

function onResults(results) {
    if (!canvasCtx) return;
    
    // Update Canvas dimensions to match video
    if(canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const lm = results.multiHandLandmarks[0];
        drawConnectors(canvasCtx, lm, HAND_CONNECTIONS, {color: '#00f3ff', lineWidth: 2});
        drawLandmarks(canvasCtx, lm, {color: '#ffffff', lineWidth: 1});

        const fingerCount = countFingers(lm);
        const indexTip = lm[8];

        // 1. Move Cursor (updates global state)
        targetX = (1 - indexTip.x) * window.innerWidth;
        targetY = indexTip.y * window.innerHeight;

        window.appState.cursorX = window.appState.cursorX + (targetX - window.appState.cursorX) * smoothFactor;
        window.appState.cursorY = window.appState.cursorY + (targetY - window.appState.cursorY) * smoothFactor;

        // Update UI
        virtualCursor.style.left = `${window.appState.cursorX}px`;
        virtualCursor.style.top = `${window.appState.cursorY}px`;

        // Update 3D Background Interaction
        window.appState.mouseX = (window.appState.cursorX / window.innerWidth) - 0.5;
        window.appState.mouseY = (window.appState.cursorY / window.innerHeight) - 0.5;

        // 2. Click (3 fingers)
        if (fingerCount === 3) {
            virtualCursor.classList.add('clicking');
            if (!clickCooldown) {
                clickCooldown = true;
                virtualCursor.style.display = 'none';
                const el = document.elementFromPoint(window.appState.cursorX, window.appState.cursorY);
                virtualCursor.style.display = 'block';
                if (el) el.click();
                setTimeout(() => { clickCooldown = false; }, 500);
            }
        } else {
            virtualCursor.classList.remove('clicking');
        }

        // 3. Scroll Down (Fist / 0 fingers)
        if (fingerCount === 0) window.scrollBy({ top: 35, behavior: 'auto' });

        // 4. Scroll Up (5 fingers)
        if (fingerCount === 5) window.scrollBy({ top: -35, behavior: 'auto' });
    }
    canvasCtx.restore();
}