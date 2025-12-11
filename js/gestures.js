const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('hand-canvas');
const canvasCtx = canvasElement ? canvasElement.getContext('2d') : null;
const toggleBtn = document.getElementById('hand-scroll-toggle');
const previewDiv = document.getElementById('hand-preview');
const virtualCursor = document.getElementById('virtual-cursor');
const instructions = document.getElementById('gesture-instructions');
const closeInstructionsBtn = document.getElementById('close-instructions');
const dbgMediapipe = document.getElementById('dbg-mediapipe');

let cameraObj = null;
let clickCooldown = false;
let smoothFactor = 0.2; // Cursor smoothing

// Read global mobile state
const isMobile = window.appState.isMobile;

// --- Setup MediaPipe Hands ---
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});

// Optimize Configuration based on Device
hands.setOptions({
    maxNumHands: 1,
    // Reduce model complexity on mobile for FPS boost
    modelComplexity: isMobile ? 0 : 1, 
    // Lower confidence slightly on mobile
    minDetectionConfidence: isMobile ? 0.6 : 0.7, 
    minTrackingConfidence: isMobile ? 0.5 : 0.7,
    selfieMode: true // Expects mirrored input
});

hands.onResults(onResults);
if(dbgMediapipe) dbgMediapipe.innerText = 'Ready';

// --- Event Listeners ---

if(toggleBtn) {
    toggleBtn.addEventListener('click', async () => {
        if (!window.appState.isHandControlActive) {
            // Attempt to start camera
            const success = await requestCameraAndStart();
            if (success) {
                enableUI();
            }
        } else {
            disableUI();
        }
    });
}

if(closeInstructionsBtn) {
    closeInstructionsBtn.addEventListener('click', () => {
        instructions.style.display = 'none';
    });
}

// --- Logic Functions ---

async function requestCameraAndStart() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera API not available. Please use a modern browser (Chrome/Firefox) and ensure HTTPS.');
        return false;
    }

    // Mobile Optimization: Request lower resolution and Front Camera ('user')
    const constraints = isMobile 
        ? { width: 320, height: 240, facingMode: 'user' } 
        : { width: 640, height: 480, facingMode: 'user' };

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: constraints, 
            audio: false 
        });
        
        videoElement.srcObject = stream;
        await videoElement.play().catch(e => console.log("Autoplay prevented"));

        // Initialize MediaPipe Camera Utility with the active stream
        if (cameraObj && cameraObj.stop) cameraObj.stop();
        
        cameraObj = new Camera(videoElement, {
            onFrame: async () => { await hands.send({image: videoElement}); },
            width: constraints.width,
            height: constraints.height
        });
        
        cameraObj.start();
        return true;

    } catch (err) {
        console.error('Camera Error:', err);
        alert('Camera access failed. Check permissions or try a different browser.');
        return false;
    }
}

function enableUI() {
    window.appState.isHandControlActive = true;
    toggleBtn.innerText = "Disable Gesture Control";
    previewDiv.classList.remove('hidden');
    virtualCursor.style.display = 'block';
    instructions.style.display = 'block';
}

function disableUI() {
    window.appState.isHandControlActive = false;
    toggleBtn.innerText = "Enable Gesture Control";
    previewDiv.classList.add('hidden');
    virtualCursor.style.display = 'none';
    instructions.style.display = 'none';
    
    // Stop MediaPipe Camera
    if (cameraObj) cameraObj.stop();
    
    // Stop Actual Video Stream to turn off hardware light
    if (videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
    }
}

function countFingers(lm) {
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

    // Sync Canvas Size
    if(canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // Draw Video Feed
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const lm = results.multiHandLandmarks[0];
        
        // Visuals
        drawConnectors(canvasCtx, lm, HAND_CONNECTIONS, {color: '#00f3ff', lineWidth: 2});
        drawLandmarks(canvasCtx, lm, {color: '#ffffff', lineWidth: 1});

        const fingerCount = countFingers(lm);
        const indexTip = lm[8];

        // 1. Cursor Movement
        const targetX = (1 - indexTip.x) * window.innerWidth;
        const targetY = indexTip.y * window.innerHeight;

        window.appState.cursorX += (targetX - window.appState.cursorX) * smoothFactor;
        window.appState.cursorY += (targetY - window.appState.cursorY) * smoothFactor;

        virtualCursor.style.left = `${window.appState.cursorX}px`;
        virtualCursor.style.top = `${window.appState.cursorY}px`;

        // Update Global Mouse State for 3D Background
        window.appState.mouseX = (window.appState.cursorX / window.innerWidth) - 0.5;
        window.appState.mouseY = (window.appState.cursorY / window.innerHeight) - 0.5;

        // 2. Click (Index + Middle OR Thumbs up, roughly 2-3 fingers)
        if (fingerCount >= 2 && fingerCount <= 3) {
            virtualCursor.classList.add('clicking');
            if (!clickCooldown) {
                clickCooldown = true;
                virtualCursor.style.display = 'none';
                const el = document.elementFromPoint(window.appState.cursorX, window.appState.cursorY);
                virtualCursor.style.display = 'block';
                
                if (el) {
                    el.click();
                    console.log('Gesture Click on:', el);
                }
                setTimeout(() => { clickCooldown = false; }, 500);
            }
        } else {
            virtualCursor.classList.remove('clicking');
        }

        // 3. Scroll Down (Fist / 0 fingers)
        if (fingerCount === 0) window.scrollBy({ top: 35, behavior: 'auto' });

        // 4. Scroll Up (Open Hand / 5 fingers)
        if (fingerCount === 5) window.scrollBy({ top: -35, behavior: 'auto' });
    }
    canvasCtx.restore();
}