# Antigravity PDF Editor: World-Class Upgrade Plan

This document outlines the architectural and functional roadmap to transform the current PDF toolkit into **Antigravity PDF Editor**—a premium, Canva-inspired, high-performance SaaS product.

---

## 🏗️ 1. Architecture: The Canvas Engine
To reach "world-class" interaction levels, we must move from raw SVG/Canvas overlays to a professional object-interaction engine.

### Recommendation: Fabric.js
- **Why**: Native support for grouped selection, rotation, skewing, z-index (bring to front/send to back), and high-quality export to JSON/SVG.
- **State Management**: Fabric objects map perfectly to a serialized JSON schema, making state persistence and backend sync seamless.

### Element Handling Pseudo-Code (JSON Structure)
```json
{
  "version": "1.0",
  "pageSize": { "width": 595, "height": 842 }, // A4 Points
  "layers": [
    {
      "id": "uuid-1",
      "type": "itext", // Editable text
      "text": "Antigravity PDF",
      "left": 50, "top": 100,
      "fontSize": 24,
      "fontFamily": "Inter",
      "fill": "#1F2937",
      "angle": 0,
      "opacity": 1,
      "zIndex": 10
    },
    {
      "id": "uuid-2",
      "type": "image",
      "src": "data:image/png;base64,...",
      "left": 200, "top": 300,
      "scaleX": 0.5, "scaleY": 0.5,
      "angle": 15,
      "zIndex": 5
    }
  ]
}
```

---

## 🧠 2. Intelligent PDF Parsing (The "Scan & Map" Workflow)
Instead of just overlaying, we will "Reconstruct" the PDF digitally.

1. **OCR & Text Block Detection**: Use `pdfjs-dist` to not just find text, but group nearby characters into logical "Text Blocks" (Paragraphs).
2. **Font Mapping**: Extract the `fontFamily` from PDF metadata. If the font isn't available in the browser, provide a "Closest Match" suggestion (e.g., Roboto for Arial).
3. **Table Detection**: Identify horizontal/vertical spacing patterns to group elements into grid structures.

---

## 🎨 3. Premium UX Design System
A world-class tool feels "alive".

- **Contextual Properties Bar**: A floating toolbar that appears above the selected element. 
  - *Text selected:* Show Bold, Italic, Color, Font Picker.
  - *Image selected:* Show Crop, Opacity, Filters, Replace.
- **Multi-Selection**: Lasso tool to select multiple layers at once for batch moving or alignment.
- **Smart Guides**: Magenta alignment lines that "snap" objects to the center, edges, or other elements (Smart Snapping).

---

## ⚡ 4. Performance: The 100+ Page Challenge
Handling large PDFs requires a "Virtualization" strategy.

- **Lazy Canvas Initialization**: Only initialize the Fabric.js instance when a page enters the viewport.
- **Off-screen Garbage Collection**: Dispose of heavy image assets for pages that are far from the current scroll position.
- **Web Workers**: Move PDF parsing and JSON serialization to a background worker to keep the main thread at 60fps.

---

## ☁️ 5. Data & Persistence
- **Auto-Save**: Debounced persistence to `localStorage` or `MongoDB` every 5 seconds.
- **Version History**: Store snapshots of the `layers` JSON. Users can roll back to "v1 - 10:00 AM".

---

## 🛠️ Step-by-Step Implementation Roadmap

### Step 1: Bootstrap Fabric Engine
1. Install `fabric` and `@types/fabric`.
2. Wrap the `PageCanvas` component around a Fabric instance.
3. Sync zoom/pan between Fabric and the Scroll container.

### Step 2: Integrated Properties Panel
1. Create a `selectedElement` observable in Zustand.
2. Build a high-end sidebar and floating toolbar that reacts to the current selection.

### Step 3: Backend High-Fidelity Sync
1. Upgrade `pdf-lib` logic to handle `rotation`, `opacity`, and `zIndex`.
2. Implement font embedding for custom Google Fonts.

### Step 4: AI & Finishing Touches
1. Integrate OpenAI/Gemini to suggest "Rewrites" for selected text blocks.
2. Auto-fix alignment button: "Perfectify Layout".

---

**Antigravity-level feature:**
> "One-Click Layout Mirroring": Copy the layout of page 1 and apply its spacing/style rules to all subsequent pages in the PDF.
