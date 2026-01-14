/**
 * Nose Scanner 3000 - Application Logic
 * A playful demo for nose "verification".
 */

// Configuration
const CONFIG = {
    scanDuration: 5000, // 5 seconds
    successProbability: 0.7,
        legendary: [
            "🏆 LEGENDARY NOSE FOUND! (0.7% chance)",
            "This nose unlocked secret DLC content.",
            "Chosen Nose™ detected. You are the one.",
            "This nose is actually a national monument. 🏛️",
            "I've seen galaxies with less gravitational pull than this nose."
        ],
    statusMessages: [
        "Aligning nostrils...",
        "Analyzing boop frequency...",
        "Scanning nostril symmetry...",
        "Checking for unexpected sneezes...",
        "Measuring snout curvature...",
        "Finalizing boop-worthiness...",
        "Cross-referencing with NoseBase™...",
        "Calibrating sniff-o-meter...",
        "Detecting hidden boop potential..."
    ],
    jokes: {
        success: [
            "Scan complete. This nose has elite boop energy. 👃✨",
            "Verified! Your nose passed with flying sniff-marks.",
            "Nose detected. Confidence level: dangerously high 😌",
            "Certified honk-ready. Please proceed responsibly.",
            "This nose could smell drama from 3 rooms away.",
            "Analyzing… nostril symmetry detected (mostly).",
            "Interesting… this nose has main-character vibes.",
            "Sniff patterns are… unique. Respect. 🫡",
            "This nose has seen things. Still standing strong.",
            "Wait... is this a nose or a work of art? 🎨",
            "Your nose just qualified for the Sniffing Olympics. 🏅",
            "This nose has a very high IQ. I can tell.",
            "If noses were currency, you'd be a billionaire. 💸",
            "Perfect aerodynamic profile. Very fast sniffs possible."
        ],
        fail: [
            "Scan failed. Nose moved due to excitement.",
            "Error 404: Nose stayed mysterious.",
            "Too much swag detected. Scanner overloaded.",
            "We blinked. Your nose didn't. Try again.",
            "Scan aborted. Nose escaped detection.",
            "This nose wins arguments silently.",
            "Built for deep thoughts and deeper sniffs.",
            "This nose enters a room before you do.",
            "Nose too humble for our sensors. Please be more arrogant.",
            "Are you even human? This nose suggests 'God-tier Entity'.",
            "Scanner confused by the sheer majesty of this scent-sniffer.",
            "Nose not found. Did you forget it at home today?",
            "Too much boop-ability detected. System crashed for safety."
        ],
        legendary: [
            "🏆 LEGENDARY NOSE FOUND! (0.7% chance)",
            "This nose unlocked secret DLC content.",
            "Chosen Nose™ detected. You are the one.",
            "This nose is the reason the internet was invented.",
            "I didn't know noses could have such high charisma stats. 📈"
        ]
    },
    noseTypes: [
        { emoji: "🧠", name: "Thinker Nose", description: "Deep thoughts detected" },
        { emoji: "🔥", name: "Bold Nose", description: "Fearless sniffer" },
        { emoji: "🎭", name: "Drama Sensor", description: "Detects chaos instantly" },
        { emoji: "😌", name: "Peaceful Sniffer", description: "Zen master vibes" },
        { emoji: "🚀", name: "Visionary Nose", description: "Sees the future" },
        { emoji: "⚡", name: "Power Nose", description: "Unstoppable energy" },
        { emoji: "🎨", name: "Creative Nose", description: "Artistic soul" },
        { emoji: "🛡️", name: "Guardian Nose", description: "Protector of peace" }
    ]
};

// State
// State
let isScanning = false;
let webcamStream = null;
let soundEnabled = true; // Default to ON
let faceDetectionReady = false;
let detectionInterval = null;
let nosePosition = null;
let scanAudio = null; // For the scanning sound effect

// DOM Elements
const scanBtn = document.getElementById('scanBtn');
const webcamBtn = document.getElementById('webcamBtn');
const webcamPreview = document.getElementById('webcamPreview');
const detectionCanvas = document.getElementById('detectionCanvas');
const scanOverlay = document.getElementById('scanOverlay');
const progressBar = document.getElementById('progressBar');
const statusText = document.getElementById('statusText');
const scannerTarget = document.getElementById('scannerTarget');
const nosePlaceholder = document.querySelector('.nose-placeholder');
const soundToggle = document.getElementById('soundToggle');

const resultModal = document.getElementById('resultModal');
const modalTitle = document.getElementById('modalTitle');
const modalJoke = document.getElementById('modalJoke');
const modalIcon = document.getElementById('modalIcon');
const closeModal = document.getElementById('closeModal');
const shareBtn = document.getElementById('shareBtn');

const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
const detectionCtx = detectionCanvas.getContext('2d');

// --- Initialization ---

function init() {
    setupEventListeners();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    waitForFaceAPI(); // Wait for face-api.js to load before loading models
    
    // Initialize scan audio
    scanAudio = new Audio('Subnautica scanner sound effect.mp3');
    scanAudio.loop = true;
    scanAudio.volume = 0.5; // 50% volume
    
    // Update UI to match default state
    if (soundToggle) {
        soundToggle.checked = true;
        const label = soundToggle.nextElementSibling.nextElementSibling;
        if (label) label.textContent = "Sound Effects (On)";
    }

    // Auto-start webcam (Always On Mode)
    toggleWebcam();
    
    console.log("%c Nose Scanner 3000 Initialized! ", "background: #ff6b6b; color: #fff; font-size: 1.2rem; font-weight: bold;");
    console.warn("Note: This is a cosmetic demo only. No real biometric data is processed.");
}

// --- Face Detection Setup ---

async function loadFaceDetectionModels() {
    // Wait for faceapi to be loaded
    if (typeof faceapi === 'undefined') {
        console.log("Waiting for face-api.js to load...");
        statusText.textContent = "Loading face detection library...";
        return;
    }
    
    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';
        
        statusText.textContent = "Loading AI models...";
        
        // Load the lightweight models for maximum speed
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
        
        // Warmup: Run a dummy detection to initialize WebGL shaders
        // This prevents the "freeze" on the first real video frame
        console.log("🔥 Warming up detection models...");
        try {
            const dummyCanvas = document.createElement('canvas');
            dummyCanvas.width = 1; dummyCanvas.height = 1;
            await faceapi.detectSingleFace(dummyCanvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })).withFaceLandmarks(true);
            console.log("✅ Warmup complete");
        } catch (warmupErr) {
            console.warn("⚠️ Model warmup failed (non-fatal):", warmupErr);
        }
        
        faceDetectionReady = true;
        statusText.textContent = "Ready for booping...";
        console.log("✅ Face detection models loaded & warmed up!");
        
        // Use Webcam if it was started while loading
        if (webcamStream && !webcamPreview.hidden) {
            startFaceDetection();
        }
    } catch (err) {
        console.warn("Face detection models failed to load. Continuing without detection:", err);
        statusText.textContent = "Ready for booping... (AI detection unavailable)";
    }
}

// Wait for face-api.js to load before initializing models
function waitForFaceAPI() {
    if (typeof faceapi !== 'undefined') {
        loadFaceDetectionModels();
    } else {
        setTimeout(waitForFaceAPI, 50); // Check faster (50ms)
    }
}

function setupEventListeners() {
    scanBtn.addEventListener('click', startScan);
    webcamBtn.addEventListener('click', toggleWebcam);
    closeModal.addEventListener('click', hideResult);
    if (shareBtn) shareBtn.addEventListener('click', shareResult);
    
    soundToggle.addEventListener('change', (e) => {
        soundEnabled = e.target.checked;
        const label = e.target.nextElementSibling.nextElementSibling;
        if (label) label.textContent = soundEnabled ? "Sound Effects (On)" : "Sound Effects (Muted)";
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !isScanning && !resultModal.classList.contains('visible')) {
            startScan();
        }
        if (e.key === 'Escape') {
            if (resultModal.classList.contains('visible')) {
                hideResult();
            } else if (isScanning) {
                cancelScan();
            }
        }
    });
}

// --- Webcam Flow ---

async function toggleWebcam() {
    if (webcamStream) {
        stopWebcam();
        stopFaceDetection();
        webcamBtn.textContent = "Use Webcam (Local only)";
        webcamPreview.hidden = true;
        detectionCanvas.hidden = true;
        nosePlaceholder.style.display = 'flex';
        scannerTarget.classList.remove('dark-mode');
    } else {
        try {
            webcamStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            webcamPreview.srcObject = webcamStream;
            webcamPreview.hidden = false;
            nosePlaceholder.classList.add('hidden'); // Force hide
            webcamBtn.textContent = "Disable Webcam";
            scannerTarget.classList.add('dark-mode'); // Enable dark mode for wireframe
            
            // Setup detection canvas to match video dimensions
            webcamPreview.addEventListener('loadedmetadata', () => {
                detectionCanvas.width = webcamPreview.videoWidth;
                detectionCanvas.height = webcamPreview.videoHeight;
                detectionCanvas.hidden = false;
                
                if (faceDetectionReady) {
                    startFaceDetection();
                }
            });
            
            statusText.textContent = "Ready for booping..."; // Clear any error messages
            console.log("Webcam started locally.");
        } catch (err) {
            console.error("Webcam access denied or unavailable:", err);
            statusText.textContent = "Camera access denied. Click 'Use Webcam' to try again.";
            // alert("Could not access webcam. Using placeholder instead.");
        }
    }
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    webcamPreview.srcObject = null; // Clear video
}

// --- Scanning Flow ---

function startScan() {
    if (isScanning) return;
    
    // Check if webcam is active
    if (!webcamStream || webcamPreview.hidden) {
        statusText.textContent = "⚠️ Camera Required! Please enable webcam first.";
        statusText.classList.add('error-pulse');
        setTimeout(() => statusText.classList.remove('error-pulse'), 2000);
        
        // Add a little shake to the button to show it's unhappy
        scanBtn.classList.add('shake');
        setTimeout(() => scanBtn.classList.remove('shake'), 500);
        return;
    }
    
    isScanning = true;
    scanBtn.disabled = true;
    scanOverlay.classList.add('visible');
    scannerTarget.classList.add('active');
    
    // Add zoom effect if webcam is active
    if (webcamStream && !webcamPreview.hidden) {
        webcamPreview.classList.add('zoomed');
        detectionCanvas.classList.add('zoomed');
    }
    
    // Play scanning sound effect (looped)
    // Play scanning sound effect (looped)
    if (scanAudio && soundEnabled) {
        scanAudio.currentTime = 0; // Reset to start
        scanAudio.play().catch(err => console.log("Audio play failed:", err));
    }
    
    const startTime = Date.now();
    
    // Play start sound
    playSound('start');

    const update = () => {
        if (!isScanning) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / CONFIG.scanDuration) * 100, 100);
        
        progressBar.style.width = `${progress}%`;
        
        // Create particles every 200ms
        if (Math.floor(elapsed / 200) > Math.floor((elapsed - 16) / 200)) {
            createParticles();
        }
        
        // Update status messages periodically
        const messageIndex = Math.floor((progress / 100) * CONFIG.statusMessages.length);
        statusText.textContent = CONFIG.statusMessages[Math.min(messageIndex, CONFIG.statusMessages.length - 1)];
        
        // Add distance feedback if nose is detected
        if (nosePosition) {
            const centerX = detectionCanvas.width / 2;
            const centerY = detectionCanvas.height / 2;
            const distance = Math.sqrt(
                Math.pow(nosePosition.x - centerX, 2) + 
                Math.pow(nosePosition.y - centerY, 2)
            );
            
            if (distance > 150) {
                statusText.textContent += " (Move closer to center)";
            }
        }

        if (progress < 100) {
            requestAnimationFrame(update);
        } else {
            completeScan();
        }
    };

    requestAnimationFrame(update);
}

// Create particle effects during scanning
function createParticles() {
    const particleCount = 3;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position within scanner target
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 100;
        const x = 120 + Math.cos(angle) * radius;
        const y = 120 + Math.sin(angle) * radius;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = `hsl(${Math.random() * 60 + 180}, 70%, 60%)`;
        
        scannerTarget.appendChild(particle);
        
        setTimeout(() => particle.remove(), 2000);
    }
}

function cancelScan() {
    isScanning = false;
    scanBtn.disabled = false;
    scanOverlay.classList.remove('visible');
    scannerTarget.classList.remove('active');
    webcamPreview.classList.remove('zoomed');
    detectionCanvas.classList.remove('zoomed');
    
    // Stop scanning sound
    if (scanAudio) {
        scanAudio.pause();
        scanAudio.currentTime = 0;
    }
    
    progressBar.style.width = '0%';
    statusText.textContent = "Scan cancelled.";
    setTimeout(() => {
        statusText.textContent = "Ready for booping...";
    }, 2000);
}

function completeScan() {
    isScanning = false;
    scanOverlay.classList.remove('visible');
    scannerTarget.classList.remove('active');
    webcamPreview.classList.remove('zoomed');
    detectionCanvas.classList.remove('zoomed');
    
    // Stop scanning sound
    if (scanAudio) {
        scanAudio.pause();
        scanAudio.currentTime = 0;
    }
    
    // Use nose detection result if available
    // "No nose, no detection" rule: If nosePosition is null, FAIL.
    const isSuccess = nosePosition 
        ? Math.random() < 0.85  // Higher success rate if nose detected
        : false; // Auto-fail if no nose detected (was Math.random() < CONFIG.successProbability)
    
    showResult(isSuccess);
}

// --- Results & UI ---

function showResult(success) {
    // Check for legendary (0.7% chance on success)
    const isLegendary = success && Math.random() < 0.007;
    
    // Select joke
    let joke;
    if (isLegendary) {
        joke = CONFIG.jokes.legendary[Math.floor(Math.random() * CONFIG.jokes.legendary.length)];
    } else {
        const list = success ? CONFIG.jokes.success : CONFIG.jokes.fail;
        joke = list[Math.floor(Math.random() * list.length)];
    }
    
    // Generate nose score (weighted by success and nose detection)
    let score;
    if (isLegendary) {
        score = 10.0;
    } else if (success) {
        score = nosePosition 
            ? (8.0 + Math.random() * 2.0) // 8.0-10.0 if nose detected
            : (7.0 + Math.random() * 2.0); // 7.0-9.0 otherwise
    } else {
        score = 3.0 + Math.random() * 4.0; // 3.0-7.0 for failures
    }
    score = Math.round(score * 10) / 10; // Round to 1 decimal
    
    // Select random nose type
    const noseType = CONFIG.noseTypes[Math.floor(Math.random() * CONFIG.noseTypes.length)];
    
    // Add shake animation for failures
    if (!success) {
        scannerTarget.classList.add('shake');
        setTimeout(() => scannerTarget.classList.remove('shake'), 500);
    }
    
    // Update modal content
    resultModal.classList.add('visible');
    modalIcon.textContent = isLegendary ? "🏆" : (success ? "✅" : "❌");
    modalTitle.textContent = isLegendary ? "LEGENDARY!" : (success ? "Nose Verified!" : "Scan Failed");
    modalJoke.textContent = joke;
    
    // Animate score counter
    animateScore(score);
    
    // Update nose type
    document.querySelector('.type-emoji').textContent = noseType.emoji;
    document.querySelector('.type-name').textContent = noseType.name;
    document.querySelector('.type-desc').textContent = noseType.description;
    
    // Store result for sharing
    window.lastResult = {
        success,
        isLegendary,
        score,
        noseType,
        joke
    };
    
    if (success) {
        startConfetti();
        playSound('success');
    } else {
        playSound('fail');
    }
    
    scanBtn.disabled = false;
}

// Animate score counter from 0 to target
function animateScore(targetScore) {
    const scoreElement = document.getElementById('noseScore');
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentScore = eased * targetScore;
        
        scoreElement.textContent = currentScore.toFixed(1);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// Share result functionality
function shareResult() {
    const result = window.lastResult;
    if (!result) return;
    
    const shareText = `I scanned my nose on Nose Scanner 3000 👃\n\nResult: ${result.isLegendary ? "🏆 LEGENDARY" : (result.success ? "✅ Verified" : "❌ Failed")}\nScore: ${result.score}/10\nType: ${result.noseType.emoji} ${result.noseType.name}\n\n"${result.joke}"\n\nTry it yourself!`;
    
    // Try native share API first
    if (navigator.share) {
        navigator.share({
            title: 'My Nose Scan Result',
            text: shareText
        }).catch(err => console.log('Share cancelled'));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            const shareBtn = document.getElementById('shareBtn');
            const originalText = shareBtn.textContent;
            shareBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                shareBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            alert('Could not copy to clipboard');
        });
    }
}

function hideResult() {
    resultModal.classList.remove('visible');
    resultModal.setAttribute('aria-hidden', 'true');
    scanBtn.disabled = false;
    progressBar.style.width = '0%';
    statusText.textContent = "Ready for booping...";
    stopConfetti();
}

// --- Audio (Synthesis) ---

function playSound(type) {
    if (!soundEnabled) return;
    
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'start') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'success') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'fail') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    }
}

// --- Confetti Effect ---

let confettiItems = [];
let confettiAnimationId = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function startConfetti() {
    confettiItems = [];
    const colors = ['#ff6b6b', '#4dadf7', '#51cf66', '#fcc419', '#ae3ec9'];
    for (let i = 0; i < 150; i++) {
        confettiItems.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: Math.random() * 0.2 - 0.1
        });
    }
    animateConfetti();
}

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    confettiItems.forEach(p => {
        p.y += p.speed;
        p.angle += p.spin;
        
        if (p.y < canvas.height) {
            active = true;
            ctx.fillStyle = p.color;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        }
    });

    if (active) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    }
}

function stopConfetti() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- Face Detection Loop ---

function startFaceDetection() {
    if (detectionInterval) return; // Prevent multiple loops
    
    console.log("🔍 Starting nose detection loop (RAF)...");
    detectionInterval = true; // Mark as active

    async function detect() {
        if (!detectionInterval) return; // Stop if cancelled

        if (webcamPreview.paused || webcamPreview.ended || !faceDetectionReady) {
            requestAnimationFrame(detect);
            return;
        }
        
        try {
            // Match canvas dimensions to video resolution (Only if changed)
            const displaySize = { width: webcamPreview.videoWidth, height: webcamPreview.videoHeight };
            if (displaySize.width === 0) {
                 requestAnimationFrame(detect);
                 return;
            }

            if (detectionCanvas.width !== displaySize.width || detectionCanvas.height !== displaySize.height) {
                faceapi.matchDimensions(detectionCanvas, displaySize);
            }
            
            // Debug Info on screen
            const debugEl = document.getElementById('debugOverlay');
            if (debugEl) {
                debugEl.innerHTML = `
                    Ready: ${faceDetectionReady}<br>
                    Stream: ${!!webcamStream}<br>
                    Canvas: ${detectionCanvas.width}x${detectionCanvas.height}<br>
                    Nose: ${nosePosition ? 'YES' : 'NO'}
                `;
            }

            // Use relaxed options (Fast 224px input for speed)
            let detections = await faceapi
                .detectSingleFace(webcamPreview, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })) 
                .withFaceLandmarks(true); // TRUE = Use Tiny Landmark Model
            
            // Clear canvas
            detectionCtx.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);
            
            if (detections) {
                // Resize detections to match canvas size
                detections = faceapi.resizeResults(detections, displaySize);
                
                const landmarks = detections.landmarks;
                const nose = landmarks.getNose();
                
                // Store nose position (center of nose bridge)
                if (nose && nose.length > 0) {
                    const noseTip = nose[3]; // Nose tip landmark
                    nosePosition = { x: noseTip.x, y: noseTip.y };
                }
                
                // Draw wireframe mesh overlay
                drawWireframeMesh(landmarks);
                
                // Force hide placeholder if we are drawing (extra safety)
                if (!nosePlaceholder.hidden) {
                     nosePlaceholder.classList.add('hidden');
                     nosePlaceholder.hidden = true;
                     nosePlaceholder.style.display = 'none';
                     nosePlaceholder.setAttribute('style', 'display: none !important');
                }
            } else {
                nosePosition = null;
            }
        } catch (err) {
            console.warn("Detection error (non-fatal):", err);
        }
        
        requestAnimationFrame(detect);
    }
    
    detect(); // Start loop
    console.log("✅ Detection RAF loop started");
}

// Watchdog: Ensure detection keeps running if video is active
setInterval(() => {
    if (webcamStream && faceDetectionReady && !detectionInterval) {
        console.log("🐶 Watchdog: Restarting stalled detection...");
        startFaceDetection();
    }
    
    // UI Correction Watchdog
    if (webcamStream && !webcamPreview.paused && !webcamPreview.ended) {
        if (webcamPreview.hidden) webcamPreview.hidden = false;
        
        // Brute-force hide placeholder
        if (!nosePlaceholder.hidden) {
            nosePlaceholder.hidden = true;
            nosePlaceholder.style.display = 'none';
            nosePlaceholder.classList.add('hidden');
        }
        
        // Ensure canvas is visible and sized
        if (detectionCanvas.hidden) detectionCanvas.hidden = false;
        if (webcamPreview.videoWidth > 0 && (detectionCanvas.width !== webcamPreview.videoWidth || detectionCanvas.height !== webcamPreview.videoHeight)) {
             detectionCanvas.width = webcamPreview.videoWidth;
             detectionCanvas.height = webcamPreview.videoHeight;
        }
    }
}, 2000);

// Draw 3D wireframe mesh overlay
function drawWireframeMesh(landmarks) {
    if (!landmarks || !landmarks.positions) {
        console.warn("No landmarks positions available");
        return;
    }
    
    const positions = landmarks.positions;
    // console.log("Drawing wireframe with", positions.length, "landmarks");
    
    // Define face mesh triangles (Delaunay-like triangulation for face landmarks)
    // These are predefined triangles connecting the 68 facial landmarks
    const triangles = [
        // Jaw line
        [0, 1, 36], [1, 2, 41], [2, 3, 31], [3, 4, 48], [4, 5, 48], [5, 6, 59],
        [6, 7, 58], [7, 8, 57], [8, 9, 56], [9, 10, 55], [10, 11, 54], [11, 12, 54],
        [12, 13, 35], [13, 14, 45], [14, 15, 45], [15, 16, 46],
        
        // Nose bridge and sides
        [27, 28, 39], [28, 29, 42], [29, 30, 47], [27, 28, 21], [28, 29, 22],
        [31, 32, 39], [32, 33, 42], [33, 34, 35], [34, 35, 45],
        
        // Nose bottom
        [31, 32, 48], [32, 33, 50], [33, 34, 52], [34, 35, 54],
        
        // Eyes
        [36, 37, 41], [37, 38, 40], [38, 39, 40], [39, 40, 41], [40, 41, 36],
        [42, 43, 47], [43, 44, 46], [44, 45, 46], [45, 46, 47], [46, 47, 42],
        
        // Eyebrows
        [17, 18, 36], [18, 19, 37], [19, 20, 38], [20, 21, 39],
        [22, 23, 42], [23, 24, 43], [24, 25, 44], [25, 26, 45],
        
        // Mouth outer
        [48, 49, 60], [49, 50, 61], [50, 51, 62], [51, 52, 63], [52, 53, 64],
        [53, 54, 65], [54, 55, 60], [55, 56, 59], [56, 57, 58], [57, 58, 59],
        [58, 59, 60], [59, 60, 48],
        
        // Mouth inner
        [60, 61, 67], [61, 62, 66], [62, 63, 65], [63, 64, 64], [64, 65, 67],
        [65, 66, 67], [66, 67, 60],
        
        // Face center connections
        [27, 30, 33], [30, 33, 51], [27, 39, 42], [39, 42, 33],
        [36, 39, 27], [42, 45, 27], [48, 54, 8], [0, 36, 17], [16, 45, 26]
    ];
    
    // Set wireframe style
    detectionCtx.strokeStyle = isScanning ? '#4dadf7' : '#51cf66'; // Blue during scan, green otherwise
    detectionCtx.lineWidth = 2; // Thicker lines for better visibility
    detectionCtx.globalAlpha = 1; // Full opacity
    
    let trianglesDrawn = 0;
    
    // Draw triangulated mesh
    triangles.forEach(([a, b, c]) => {
        if (positions[a] && positions[b] && positions[c]) {
            detectionCtx.beginPath();
            detectionCtx.moveTo(positions[a].x, positions[a].y);
            detectionCtx.lineTo(positions[b].x, positions[b].y);
            detectionCtx.lineTo(positions[c].x, positions[c].y);
            detectionCtx.closePath();
            detectionCtx.stroke();
            trianglesDrawn++;
        }
    });
    
    // console.log("Drew", trianglesDrawn, "triangles");
    
    // Draw landmark points (larger and more visible)
    detectionCtx.fillStyle = isScanning ? '#4dadf7' : '#51cf66';
    positions.forEach(point => {
        detectionCtx.beginPath();
        detectionCtx.arc(point.x, point.y, 3, 0, 2 * Math.PI); // Larger dots
        detectionCtx.fill();
    });
    
    // Highlight nose area during scan
    if (isScanning && nosePosition) {
        detectionCtx.strokeStyle = '#ff6b6b';
        detectionCtx.lineWidth = 3;
        detectionCtx.globalAlpha = 1;
        detectionCtx.beginPath();
        detectionCtx.arc(nosePosition.x, nosePosition.y, 40, 0, 2 * Math.PI);
        detectionCtx.stroke();
        
        // Pulsing effect
        const pulseSize = 40 + Math.sin(Date.now() / 200) * 10;
        detectionCtx.globalAlpha = 0.4;
        detectionCtx.beginPath();
        detectionCtx.arc(nosePosition.x, nosePosition.y, pulseSize, 0, 2 * Math.PI);
        detectionCtx.stroke();
    }
    
    detectionCtx.globalAlpha = 1;
}

function stopFaceDetection() {
    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
        nosePosition = null;
        detectionCtx.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);
        console.log("🛑 Stopped nose detection");
    }
}

// Run
init();
