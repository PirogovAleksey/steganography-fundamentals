# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stego-Slides** is a static website educational platform for a university course "Основи стеганографії" (Fundamentals of Steganography). It's a pure HTML/CSS/JavaScript application hosted on GitHub Pages with no build system, no package.json, and no dependencies.

The course is in Ukrainian and covers steganography theory and practice through modules, lectures, and labs.

## Architecture

### Content Structure

The course is organized in a hierarchical structure defined by **assets/data/modules.json**:

```
Course
├── Modules (4 total)
│   └── Lectures (16 total)
│       └── Temas (topics/themes, typically 4 per lecture)
└── Labs (17 total)
```

**Key principle**: All course metadata lives in `modules.json`. This is the single source of truth for:
- Module titles, descriptions, statuses
- Lecture IDs, titles, topics, durations, slide counts
- Lab types, estimated times, completion status
- Which lectures have presentations (hasPresentation: true)

### Directory Structure

```
/
├── index.html                      # Landing page (dynamically loads from modules.json)
├── assets/
│   ├── css/                        # ITCSS architecture (base → layout → components → pages)
│   ├── js/
│   │   ├── constants.js            # Shared constants (PATHS, STATUS_CONFIG, etc.)
│   │   ├── storage.js              # LocalStorage wrapper (ES6 module)
│   │   ├── landing.js              # Main page logic (ES6 module)
│   │   ├── slides.js               # Slide navigation for JSON-based slides
│   │   ├── slide-engine.js         # Alternative slide engine
│   │   └── practical.js            # Lab progress tracking
│   └── data/
│       └── modules.json            # **SINGLE SOURCE OF TRUTH**
├── modules/
│   └── module{N}/
│       ├── index.html              # Module overview
│       └── lecture_{N}/            # Note: inconsistent naming (lecture1, lecture_2, etc.)
│           ├── index.html          # Lecture overview with 4 tema cards
│           └── tema{1-4}_*.html    # Individual presentation slides
└── labs/
    └── lab{N}.html                 # Lab instructions
```

### Navigation & Slides

**Two types of presentations exist**:

1. **JSON-based slides** (legacy): Uses `slides.json` + `slides.js` ES6 module
2. **Self-contained HTML slides** (current standard): Each `tema{N}_*.html` has:
   - Multiple `<div class="slide">` elements
   - Inline navigation script at the bottom
   - No external dependencies

**Self-contained slide template**:
```html
<div class="slides-wrapper">
    <div class="slide active"><!-- First slide --></div>
    <div class="slide"><!-- Second slide --></div>
    <!-- ... more slides ... -->
</div>

<!-- Navigation (required structure) -->
<div class="slide-navigation">
    <button id="prev-slide" class="slide-btn" onclick="previousSlide()">←</button>
    <span id="slide-counter" class="slide-counter">1 / 10</span>
    <button id="next-slide" class="slide-btn" onclick="nextSlide()">→</button>
    <button id="home-btn" class="slide-btn" onclick="window.location.href='index.html'">🏠</button>
</div>

<!-- Progress Bar (required structure) -->
<div class="slide-progress">
    <div class="slide-progress-bar" style="width: 10%;"></div>
</div>

<script>
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        if (n >= totalSlides) currentSlide = 0;
        if (n < 0) currentSlide = totalSlides - 1;
        slides[currentSlide].classList.add('active');

        document.getElementById('slide-counter').textContent = `${currentSlide + 1} / ${totalSlides}`;
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        document.querySelector('.slide-progress-bar').style.width = `${progress}%`;

        document.getElementById('prev-slide').disabled = currentSlide === 0;
        document.getElementById('next-slide').disabled = currentSlide === totalSlides - 1;
    }

    function nextSlide() { currentSlide++; showSlide(currentSlide); }
    function previousSlide() { currentSlide--; showSlide(currentSlide); }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') previousSlide();
        if (e.key === 'Escape') window.location.href = 'index.html';
    });

    showSlide(0);
</script>
```

**Critical**: Do NOT reference `slides-navigation.js` or any external navigation file - it doesn't exist. Always use inline scripts.

## Adding New Content

### Adding a New Lecture

**IMPORTANT**: You must update TWO places when adding a lecture:

1. **Update modules.json** (for main landing page):
```json
{
  "id": "X.Y",
  "title": "Lecture Title",
  "description": "Description",
  "duration": 120,
  "topics": ["Topic 1", "Topic 2"],
  "status": "completed",           // or "planned"
  "slides": 35,
  "hasPresentation": true,          // MUST be true to show on landing
  "path": "lecture_N/index.html"   // Required if completed
}
```

2. **Create directory structure**:
```
modules/module{N}/lecture_{N}/
├── index.html              # Lecture overview (copy from existing lecture, update metadata)
├── tema1_*.html
├── tema2_*.html
├── tema3_*.html
└── tema4_*.html
```

3. **Lecture index.html** should have:
   - 4 tema cards linking to tema files
   - Navigation buttons (Home, Previous Lecture, Next Lecture)
   - Lecture meta information (duration, slides, status)

4. **Each tema file** must:
   - Include inline navigation script (see template above)
   - Have proper slide structure with `<div class="slide">` elements
   - First slide should have `class="slide active"`
   - Use existing CSS classes from `slides.css`

5. **Update the module's static index.html** (e.g., `modules/module2/index.html`):
   - This is a STATIC file separate from modules.json
   - Find the lecture card for the lecture you're adding
   - Update: title, description, topics, duration
   - Change `onclick="alert(...)"` to `onclick="window.location.href='lecture_N/index.html'"`
   - Add `class="completed"` to the lecture card
   - Replace disabled button with clickable link: `<a href="lecture_N/index.html" class="lecture-action">Переглянути</a>`

### Naming Conventions

- **Lecture directories**: Inconsistent (e.g., `lecture1`, `lecture_2`, `lecture_3`) - follow existing pattern in module
- **Tema files**: `tema{N}_{description}.html` (e.g., `tema1_hugo.html`, `tema2_wow.html`)
- **Module IDs**: Format `"{moduleNum}.{lectureNum}"` (e.g., "2.3")
- **Status values**: `"planned"`, `"completed"`, `"in_progress"`, `"active"`

### Status Logic

On the landing page:
- Only lectures with `status: "completed"` AND `hasPresentation: true` are clickable
- Others show as grayed out with "Заплановано" badge
- Module status is separate from lecture status

## CSS Architecture (ITCSS)

Files are loaded in order:
1. `base.css` - Variables, resets, typography
2. `layout.css` - Grid, containers, spacing
3. `components.css` - Reusable UI components (cards, buttons, badges)
4. `modules.css` - Module-specific styles
5. `lectures.css` - Lecture page styles
6. `slides.css` - Presentation slide styles
7. `pages.css` - Page-specific overrides

Common utility classes in slides:
- `.algorithm-box` - Algorithm explanations with gradient background
- `.comparison-grid` - 2 or 3 column grid
- `.method-card` - Method description card with left border
- `.advantage-list` - Green background for advantages
- `.disadvantage-list` - Red background for disadvantages
- `.formula-box` - Centered formula with border
- `.alert` - Info/success/warning message boxes

## JavaScript Architecture

**ES6 Modules** are used (not CommonJS):
- Import: `import { Storage } from './storage.js';`
- Export: `export { PATHS, MESSAGES };`
- HTML: `<script type="module" src="assets/js/landing.js"></script>`

**Key modules**:
- `constants.js` - All shared constants (paths, status configs, messages)
- `storage.js` - LocalStorage wrapper for progress tracking
- `landing.js` - Main page class that renders modules/labs from JSON
- `slides.js` - JSON-based slide manager (legacy, avoid for new content)

## Common Patterns

### Lecture Card Structure
Lectures are rendered as cards by `landing.js`:
- Shows lecture number, title, description
- Topics as badges
- Status badge (✅ Завершено / 📋 Заплановано)
- Duration and slide count
- Only clickable if `status: "completed"` AND `hasPresentation: true`

### Progress Tracking
- Uses LocalStorage via `storage.js`
- Keys: `stego_course_progress_m{module}_l{lecture}`
- Stores current slide index and total slides
- Auto-saves every 5 seconds

### Responsive Design
- Mobile-first approach
- Touch gestures supported (swipe left/right for slides)
- Breakpoints defined in CSS

## Development Workflow

**There is no build process**. This is a static site.

### Testing Changes
1. Open `index.html` in a browser (use Live Server extension for VSCode)
2. For presentations, navigate to the specific tema HTML file

### Deployment
- Hosted on GitHub Pages
- Any push to main branch auto-deploys
- No build or compilation step

### Common Tasks

**Adding a lecture presentation**:
1. Update `modules.json` (set `status: "completed"`, `hasPresentation: true`)
2. Create `modules/module{N}/lecture_{N}/` directory
3. Create `index.html` from template
4. Create 4 tema files with inline navigation
5. Test locally
6. Commit and push

**Fixing navigation issues**:
- Navigation MUST be inline (not external file)
- Check button IDs: `prev-slide`, `next-slide`, `slide-counter`
- Check div classes: `slide-navigation`, `slide-progress`, `slide-progress-bar`
- Verify `showSlide(0)` is called on page load

**Updating course metadata**:
- Edit `assets/data/modules.json` only
- No code changes needed - landing page loads dynamically

## Important Notes

- **Language**: All content is in Ukrainian
- **No framework**: Pure vanilla JavaScript (ES6 modules)
- **No build tools**: No npm, webpack, babel, etc.
- **Static hosting**: Designed for GitHub Pages
- **Browser support**: Modern browsers with ES6 module support
- **Slide navigation**: Always inline, never external file
- **Single source of truth**: `modules.json` for all course structure (but see warning below)

### ⚠️ Architectural Inconsistency

**There are TWO places where lecture data is defined:**
1. `assets/data/modules.json` - used by main landing page (index.html)
2. `modules/module{N}/index.html` - static HTML files for each module

When adding a new lecture, you **MUST update BOTH** or the module page will show outdated information. This is a design flaw but part of the current architecture.

## File Encoding

All files use UTF-8 encoding to support Ukrainian characters (Cyrillic).
