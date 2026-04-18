<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Three.js-r128-000000?logo=three.js&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vanilla_CSS-Custom_Design_System-1572B6?logo=css3&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&logoColor=white&style=for-the-badge" />
</p>

# 🛋️ Sofa, So Good! — AI Interior Design Studio

> Upload your room. Let AI analyze it. Place furniture. Render in 3D. Export a professional PDF quotation — all in one seamless workflow.

**Sofa, So Good!** is a gamified, AI-powered interior design web application that takes users through an immersive multi-stage design journey — from room upload and spatial analysis to drag-and-drop furniture placement, real-time 3D visualization, and professional PDF quotation export.

---

## ✨ Features

### 🎮 Gamified Multi-Stage Workflow
The app guides users through **6 progressive levels**, each with cinematic transition animations:

| Level | Stage | Description |
|-------|-------|-------------|
| LVL 1 | **Landing & Upload** | Premium landing page with scroll-reveal animations, project showcase, testimonials, drag-and-drop upload, and live camera capture |
| LVL 2 | **Style Questionnaire** | Interactive aesthetic profiling — design style, color palette, lighting, materials, and budget configuration |
| LVL 3 | **AI Spatial Analysis** | Simulated AI vision engine with progressive findings and architectural observations |
| LVL 4 | **Design Canvas** | Full-featured 2D furniture placement editor with drag, resize, rotate, snap-to-grid, and color customization |
| LVL 5 | **3D Visualization** | Real-time Three.js 3D room render with orbit controls and camera manipulation |
| LVL 6 | **Summary & Export** | Project recap dashboard with itemized breakdown and professional PDF quotation generation |

### 🪑 Extensive Furniture Catalog
17 furniture items across multiple categories — sofas, beds, desks, bookshelves, dining sets, plants, lamps, rugs, and more — each with realistic dimensions, pricing (₹ INR), and 3D height attributes.

### 🎨 Design Canvas (2D Editor)
- **Drag & drop** furniture onto your uploaded room photo
- **Resize handles** for precise scaling
- **Color swatches** to customize each piece
- **Snap-to-grid** toggle for precise alignment
- **Room type** selector (Living Room, Bedroom, Kitchen, etc.)
- **Budget tracking** with live total and over-budget alerts

### 🧊 3D Visualization Engine
- Powered by **Three.js** with `OrbitControls` for camera rotation
- Furniture rendered as 3D boxes with accurate proportions
- Ambient + directional lighting with shadows
- Ground plane with grid overlay

### 📄 PDF Quotation Export
- Auto-generated professional quotation via **jsPDF**
- Itemized table with quantities, unit prices, and line totals
- Grand total calculation
- Clean, print-ready formatting with branded header/footer

### 💰 Smart Budget System
- Set a budget limit during the style questionnaire
- Real-time budget tracking HUD with project value and asset counts
- Budget over-limit siren alerts with visual warnings
- Per-item pricing in Indian Rupees (₹)

### 🎬 Premium Animations & UX
- Floating furniture canvas background
- Scroll-reveal animations (fade, slide-left, slide-right, scale)
- Animated counters with eased transitions
- Level-up overlay transitions between stages
- Marquee feature strip
- Responsive navigation with scroll-aware styling

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** (CDN) | UI components & state management |
| **Three.js r128** (CDN) | 3D room visualization |
| **Babel Standalone** | In-browser JSX compilation |
| **jsPDF + AutoTable** | PDF quotation generation |
| **Vanilla CSS** | Custom design system with CSS variables |
| **Google Fonts** | Inter, Space Grotesk, Press Start 2P |

> **Zero build step required** — the entire app runs client-side with CDN-loaded dependencies.

---

## 🚀 Getting Started

### Run Locally

No installation needed — just open the HTML file:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/sofasogood.git
cd sofasogood

# Option 1: Open directly
start index.html        # Windows
open index.html         # macOS

# Option 2: Use a local server (recommended for camera features)
npx -y serve .
# → Open http://localhost:3000
```

### Deploy to Vercel

The project includes a `vercel.json` for one-click deployment:

1. **Push to GitHub** (if not already)
2. Go to [vercel.com](https://vercel.com) → **Import Project** → Select your repo
3. Set **Root Directory** to the folder containing `index.html`
4. Click **Deploy** — no framework or build settings needed

Or deploy via CLI:

```bash
npx -y vercel --prod
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/sofasogood)

---

## 📁 Project Structure

```
sofasogood/
├── index.html          # Entry point — loads all CDN dependencies
├── app.jsx             # Complete React application (2000+ lines)
├── styles.css          # Custom design system with CSS variables
├── vercel.json         # Vercel deployment configuration
├── images/
│   ├── bedroom.png     # Sample room — bedroom
│   ├── dining.png      # Sample room — dining room
│   ├── living-room.png # Sample room — living area
│   ├── render-1.png    # Portfolio showcase render
│   ├── render-2.png    # Portfolio showcase render
│   └── render-3.png    # Portfolio showcase render
└── README.md
```

---

## 📸 Workflow Preview

```
📸 Upload Room Photo  →  🧠 AI Spatial Analysis  →  🎨 Place Furniture (2D)
         ↓                        ↓                          ↓
   Camera / Drag-drop      Style Profiling           Drag, Resize, Recolor
                                                            ↓
                              📄 PDF Export  ←  🧊 3D Room Render
                           Professional Quote      Three.js Visualization
```

---

## 🎨 Design System

The app uses a cohesive CSS variable-based design system:

- **Color palette**: Warm gold (`#D4A535`), earthy tones, and dark accents
- **Typography**: Inter (body), Space Grotesk (headings), Press Start 2P (retro accents)
- **Effects**: Glassmorphism, pixel-art shadows, smooth cubic-bezier transitions
- **Layout**: Flexbox-based responsive grid with custom utility classes

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <b>Sofa, So Good!</b> — Where AI meets interior design. 🛋️✨
</p>
