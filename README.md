
---

# <p align="center">🚀 <b>Robotics & AI Portfolio – Sarath Chandiran</b></p>

### <p align="center"><i>A futuristic, interactive portfolio featuring 3D environments, AI gesture control, and next-gen UI.</i></p>

<p align="center">
  <img src="assets/images/100031359.jpeg" width="160" style="border-radius:50%;border:2px solid #00f3ff;">
</p>

<p align="center">
  <b>Robotics Engineer | ROS2 Developer | Computer Vision Specialist</b>
</p>

---

## <p align="center">⚡ <b>Tech Stack</b></p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Three.js-black?logo=three.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MediaPipe-FF6F00?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=black" />
</p>

---

## 🧠 **Overview**

This portfolio is not just a website — it is a **human-machine interaction showcase**.
It merges **WebGL, Gesture Recognition, and Glassmorphism UI** to deliver a next-gen digital identity, suitable for robotics & AI engineers.

---

## 📁 **Project Structure**

```bash
/
├── index.html                 # Main entry point
├── css/
│   └── style.css              # Custom styling overrides
└── js/
    ├── app.js                 # Core UI logic & GSAP animations
    ├── background.js          # Three.js 3D particle system
    ├── gestures.js            # MediaPipe hand tracking + virtual cursor
    └── tailwind-config.js     # Tailwind theme configuration
```

---

## 🎯 **Core Features**

### 🤖 **1. AI Hand Gesture Control**

An AI-powered interaction system using **MediaPipe Hands**.

| Gesture             | Action      | Logic                          |
| ------------------- | ----------- | ------------------------------ |
| ☝️ **Index Finger** | Move Cursor | Tracks landmark **8**          |
| 🤘 **2 Fingers**    | Click       | Detects **2 extended fingers** |
| ✊ **Closed Fist**   | Scroll Down | **0 fingers**                  |
| 🖐️ **Open Hand**   | Scroll Up   | **5 fingers**                  |

> Toggle available at the bottom-right “Gesture Control” button.

---

### 🧩 **2. 3D Interactive Background**

Powered by **Three.js**:

* Rotating wireframe Icosahedron
* 700+ floating particles
* Real-time response to mouse or gesture cursor movement

---

### 🧊 **3. Glassmorphism UI**

Modern, cinematic design using:

* Backdrop-blur
* Neon cyan highlights
* Animated cards & sections

---

## 🧰 **Customization Guide**

### 🎨 Theme Colors

Modify:

```
js/tailwind-config.js
```

### 🖐️ Gesture Sensitivity

Edit:

```js
const smoothFactor = 0.2;
```

### 🌌 3D Background Tweaks

Modify values in:

```
js/background.js
```

## 🧾 **License**

```
© 2026 Sarath Chandiran. All rights reserved.
```

---

## ⭐ **Support the Project**

<p align="center">
If you found this interesting or inspiring:<br><br>
<a href="#" style="font-size:20px;">⭐ Star this repo</a><br>
Share it with others in Robotics & AI communities.
</p>

---

