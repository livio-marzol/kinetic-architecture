# STRUCTA STUDIES — Kinetic Architecture

> **Experimental architectural laboratory sculpturing responsive concrete structures, dynamic equilibrium, and living illumination.**

An editorial and minimalist web experience created for **Structa Studies**. The site explores kinetic brutalism, high-tensile membrane engineering, and fluid concrete geometries through custom GLSL shaders and physics-based animation.

---

## 🏛️ Key Architectural Features

- **Custom Three.js GLSL Hero Shader:**
  - **2.5D Topological Parallax:** Inertia-driven parallax (`lerp(0.05)`) paired with a high-resolution synthetic depth map.
  - **Kinetic Louvers Micro-Motion:** Mathematical horizontal oscillation isolating the intermediate depth zone (amber-lit timber louvers) responsive to cursor velocity.
  - **Subtle Chromatic Aberration:** Realistic RGB dispersion along high-acceleration motion vectors.
  - **Architectural Slit/Shutter Entrance:** Starts as a mechanical vertical slit at `uProgress = 0.0` and expands smoothly to the full monumental facade (`uProgress = 1.0`) with ambient amber light leak and edge blur.
- **Sculptural Editorial Layout (3 Acts):**
  - **Act I: Hero Kinetic Monument** — Immersive fullscreen WebGL canvas with fluid concrete facade.
  - **Act II: Architectural Thesis** — Manifesto and kinetic engineering metrics (`0.04s Latency`, `480 kN Tensile Load`, `100% Daylight Autonomy`).
  - **Act III: Curated Works** — Interactive portfolio featuring *The Shifting Monolith*, *Equilibria Pavilion*, and *Aerodynamic Louvers* with floating previews and fullscreen cinematic lightbox.
  - **Minimal Closure** — Direct communication link connecting to Gmail.
- **Custom Kinetic Magnetic Cursor:** Fluid lerp cursor adapting dynamically with context-aware labels (`EXPLORE`, `READ`, `VIEW`, `GMAIL`, `CLOSE`).
- **Inertial Smooth Scrolling:** Studio Freight Lenis synchronized with GSAP ScrollTrigger ticker.
- **Universal Accessibility & Responsive Scaling:** Calibrated for devices from 320px to 4K displays with OS-level text zoom adaptation.

---

## ⚙️ Tech Stack

- **Bundler & Dev Server:** [Vite](https://vitejs.dev/)
- **3D & Shaders:** [Three.js](https://threejs.org/) + Custom GLSL Vertex & Fragment Shaders
- **Kinetic Motion:** [GSAP 3](https://greensock.com/gsap/) (GreenSock) + ScrollTrigger
- **Smooth Scroll:** [Lenis](https://github.com/darkroomengineering/lenis)
- **Typography:** Syne & Space Grotesk via Google Fonts
- **Language:** HTML5, CSS3 Modern, Vanilla JavaScript (ES Modules)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/livio-marzol/kinetic-architecture.git

# Enter the project directory
cd kinetic-architecture

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 📄 License
Private & Proprietary — Structa Studies 2026.
