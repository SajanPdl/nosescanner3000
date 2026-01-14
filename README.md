# Nose Scanner 3000 — Boop to Verify! 👃💫

A playful, responsive single-page website that simulates scanning a user's nose for "verification". This is a mock/demo only and does not perform real biometric authentication.

## Features

- **Playful UI**: Colorful design with rounded shapes, soft shadows, and smooth micro-interactions.
- **Animated Scan Flow**: A 5-second simulated scan with a progress bar, scanning beam, and status messages.
- **Real-time Nose Detection**: Uses face-api.js with TensorFlow.js to detect and track your nose in real-time.
- **3D Wireframe Mesh**: Triangulated face mesh overlay with ~60 triangles connecting 68 facial landmarks.
- **Camera Zoom Animation**: Smooth 1.5x zoom-in effect during scanning for a futuristic feel.
- **Visual Feedback**: Color-changing wireframe (green → blue during scan) with pulsing red circle on nose.
- **Dark Mode**: Automatic dark background when webcam is enabled for better mesh visibility.
- **Webcam Integration**: Optional local-only webcam preview with live face landmark tracking.
- **Randomized Results**: Success or failure states with varying playful jokes (higher success rate when nose is detected).
- **Accessibility**: Keyboard support (Enter to scan, Esc to cancel) and ARIA labels.
- **Privacy First**: All processing is client-side. No images or data are uploaded or stored.

## Usage

1. Open `index.html` in any modern web browser.
2. (Optional) Click **"Use Webcam"** to enable your camera for the full scanner experience.
3. Click **"Scan Nose"** (or press **Enter**) to begin the scan.
4. Wait for the analysis to complete and enjoy the "verification" result!

## Technical Implementation

- **HTML5**: Semantic structure and ARIA attributes for accessibility.
- **CSS3**: Keyframe animations, CSS variables, glassmorphism, and smooth zoom transitions.
- **Vanilla JavaScript**: Modular logic for scanning, webcam handling, and result generation (~440 lines).
- **Face Detection**: 
  - **TensorFlow.js** + **face-api.js** for real-time face landmark detection
  - Tiny Face Detector model for performance
  - 68-point facial landmark detection
  - Nose tracking with visual crosshair overlay
  - Runs at ~10 FPS (100ms intervals)
- **Web Audio API**: Synthetic sound effects (configurable toggle).
- **Canvas API**: Custom confetti animation for successful scans and detection overlay.

## Privacy Statement

This application is a cosmetic demo.
- **No data collection**: No images, frames, or personal data are sent to any server.
- **Local only**: If the webcam is used, the stream stays entirely within your browser context.
- **No storage**: No biometric data is saved to `localStorage` or any other persistent storage.

## How It Works

### Face Detection Pipeline
1. **Model Loading**: On page load, TensorFlow.js and face-api.js models are fetched from CDN
2. **Webcam Activation**: When you enable the webcam, a detection canvas overlay is created
3. **Real-time Detection**: Every 100ms, the app:
   - Detects a single face using Tiny Face Detector
   - Extracts 68 facial landmarks
   - Identifies the nose (landmarks 28-36)
   - Draws a green crosshair on the nose tip
4. **Scan Enhancement**: If a nose is detected during scanning, success probability increases to 85%
5. **Zoom Effect**: Camera smoothly zooms to 1.5x during the scan for dramatic effect

---

### Test Plan

| Test Case | Step | Expected Result |
|-----------|------|-----------------|
| **Basic Scan** | Click "Scan Nose" | Animation plays for 5s, status msgs update, modal appears. |
| **Webcam Flow**| Click "Use Webcam", Allow | Video preview appears in the circular target area. |
| **Keyboard Nav**| Press `Enter` | Scan starts. |
| **Keyboard Cancel**| Press `Esc` during scan | Scan stops, progress resets. |
| **Result Modal** | Click "Try Again" | Modal closes, UI resets for another scan. |
| **Sound Toggle** | Toggle sound, Scan | Beeps/Success sounds play if enabled. |
| **Responsiveness**| Resize to mobile | Layout stacks correctly and remains usable. |
