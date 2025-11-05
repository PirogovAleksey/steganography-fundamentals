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

**Current Standard**: Self-contained HTML presentations using the **new purple-themed system**.

Each `tema{N}_*.html` presentation file must:
- Link to the single stylesheet: `new_assets/presentation/css/styles.css`
- Contain a `<div class="presentation">` wrapper
- Have multiple `<div class="slide">` elements inside
- Include inline navigation script at the bottom
- Have navigation OUTSIDE the presentation wrapper

**Complete presentation file template**:
```html
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Topic Title | Лекція X.Y</title>

    <!-- CSS -->
    <link rel="stylesheet" href="../../../new_assets/presentation/css/styles.css">

</head>
<body>

<div class="presentation">

    <!-- Слайд 1: Титульний -->
    <div class="slide active title-slide">
        <h1>🎯 Topic Title</h1>
        <div class="subtitle">
            Subtitle or section description
        </div>
    </div>

    <!-- Слайд 2: Content -->
    <div class="slide">
        <h2>Section Title</h2>
        <p>Content here...</p>
    </div>

    <!-- More slides... -->

</div>

<!-- Navigation -->
<div class="navigation">
    <button id="prev-slide" class="nav-btn" onclick="previousSlide()">← Previous</button>
    <button id="home-btn" class="nav-btn" onclick="window.location.href='index.html'">🏠 Home</button>
    <button id="next-slide" class="nav-btn" onclick="nextSlide()">Next →</button>
</div>

<!-- Slide Counter -->
<div class="slide-counter">1 / 10</div>

<script>
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));

        if (n >= totalSlides) currentSlide = 0;
        if (n < 0) currentSlide = totalSlides - 1;

        slides[currentSlide].classList.add('active');

        document.querySelector('.slide-counter').textContent = `${currentSlide + 1} / ${totalSlides}`;

        document.getElementById('prev-slide').disabled = currentSlide === 0;
        document.getElementById('next-slide').disabled = currentSlide === totalSlides - 1;
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            showSlide(currentSlide);
        }
    }

    function previousSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            showSlide(currentSlide);
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') previousSlide();
        if (e.key === 'Escape') window.location.href = 'index.html';
    });

    showSlide(0);
</script>

</body>
</html>
```

**Critical rules**:
- CSS path: Always `../../../new_assets/presentation/css/styles.css` (relative from tema file)
- Navigation order: **Previous | Home | Next** (this exact order is required)
- Navigation must be OUTSIDE `</div>` that closes `.presentation` wrapper
- Slide counter must be a separate div AFTER navigation
- All navigation is inline JavaScript - no external files
- First slide must have `class="slide active title-slide"`
- Never use old CSS paths like `assets/css/slides.css`

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
   - Link to `new_assets/presentation/css/styles.css` (see complete template above)
   - Include inline navigation script at the bottom
   - Have proper slide structure with `<div class="slide">` elements inside `<div class="presentation">`
   - First slide should have `class="slide active title-slide"`
   - Use available CSS classes documented in the CSS Architecture section
   - Ensure all divs are properly closed (balanced HTML structure)

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

## CSS Architecture

### Presentation Styles (Current System)

**Location**: `new_assets/presentation/css/styles.css`

This is a **single unified stylesheet** for all presentation slides with a purple gradient theme.

**Color Scheme**:
- Primary: `#667eea` (purple-blue)
- Secondary: `#764ba2` (dark purple)
- Background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Success: `#10b981` (green)
- Warning: `#f59e0b` (orange)
- Danger: `#dc2626` (red)

**Available CSS Classes**:

#### Layout Classes
- `.presentation` - Main wrapper (fullscreen, 100vw × 100vh)
- `.slide` - Individual slide (white card, centered, max-width 1200px, 85vh height)
- `.slide.active` - Currently visible slide (opacity: 1, z-index: 2)
- `.title-slide` - First slide with special styling

#### Navigation Classes
- `.navigation` - Fixed bottom navigation container (centered)
- `.nav-btn` - Navigation button (white with purple text, rounded)
- `.slide-counter` - Fixed top-right counter display

#### Content Classes
- `.subtitle` - Subtitle text on title slides
- `.code-block` - Code/monospace blocks with dark background
- `.highlight` - Inline highlighted text with gradient background
- `.two-column` - Two-column grid layout
- `.column` - Individual column in grid

#### Message Boxes
- `.info-box` - Blue-bordered information box
- `.success-box` - Green-bordered success message
- `.warning-box` - Orange-bordered warning message

#### Lists
- `.checklist` - Styled list with checkmark bullets

#### Inline Elements
- `.emoji` - Styled emoji with consistent sizing

**Important**:
- Do NOT use inline styles for colors, margins, or layout
- Prefer CSS classes over inline `style=""` attributes
- Keep content semantic and let CSS handle presentation
- All slides auto-scroll if content exceeds viewport height

### Landing Page Styles (Legacy System)

For the main landing page and module pages, the old ITCSS system is still used:
1. `assets/css/base.css` - Variables, resets, typography
2. `assets/css/layout.css` - Grid, containers, spacing
3. `assets/css/components.css` - Cards, buttons, badges
4. `assets/css/modules.css` - Module-specific styles
5. `assets/css/lectures.css` - Lecture page styles
6. `assets/css/pages.css` - Page overrides

**Do not mix** the two CSS systems - presentations use only `new_assets/presentation/css/styles.css`.

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
- Navigation MUST be inline JavaScript (no external files)
- Verify CSS link: `../../../new_assets/presentation/css/styles.css`
- Check button IDs: `prev-slide`, `next-slide`, `home-btn`
- Check div classes: `.navigation`, `.nav-btn`, `.slide-counter`
- **Navigation order**: Previous | Home | Next (exact order matters!)
- Navigation must be OUTSIDE the `</div>` that closes `.presentation`
- Verify all `<div>` tags are properly closed (balanced)
- Common issue: Missing closing `</div>` tags in slides cause navigation to be hidden
- Verify `showSlide(0)` is called on page load

**Updating course metadata**:
- Edit `assets/data/modules.json` only
- No code changes needed - landing page loads dynamically

## HTML Structure Best Practices

### Proper Slide Structure

Each slide MUST be properly closed before the next slide comment:

```html
<!-- Слайд 1: Титульний -->
<div class="slide active title-slide">
    <h1>Title</h1>
    <div class="subtitle">
        Subtitle text
    </div>
</div>

<!-- Слайд 2: Next slide -->
<div class="slide">
    <h2>Content</h2>
    <p>Text here</p>
</div>
```

### Common HTML Mistakes to Avoid

**❌ Missing closing divs**:
```html
<div class="slide">
    <div class="info-box">
        <p>Content</p>
    <!-- Missing </div> for info-box
</div>
```

**✅ Correct**:
```html
<div class="slide">
    <div class="info-box">
        <p>Content</p>
    </div>
</div>
```

**❌ Extra closing divs**:
```html
<div class="slide">
    <p>Content</p>
    </div>
</div>
</div>  <!-- Extra closing div -->
```

**❌ Navigation inside presentation wrapper**:
```html
<div class="presentation">
    <div class="slide">...</div>

    <!-- Navigation -->
    <div class="navigation">...</div>  <!-- WRONG: Inside presentation -->
</div>
```

**✅ Correct - Navigation outside**:
```html
<div class="presentation">
    <div class="slide">...</div>
</div>

<!-- Navigation -->
<div class="navigation">...</div>  <!-- CORRECT: Outside presentation -->
```

### Verifying HTML Structure

To verify a presentation file has correct HTML structure:
1. Check that CSS link points to `new_assets/presentation/css/styles.css`
2. Count opening `<div>` tags vs closing `</div>` tags (must be equal)
3. Verify navigation is AFTER the closing `</div>` of `.presentation`
4. Verify button order: Previous | Home | Next
5. Check that first slide has `class="slide active title-slide"`
6. Ensure each slide is properly closed before next slide comment

## Important Notes

- **Language**: All content is in Ukrainian
- **No framework**: Pure vanilla JavaScript (ES6 modules)
- **No build tools**: No npm, webpack, babel, etc.
- **Static hosting**: Designed for GitHub Pages
- **Browser support**: Modern browsers with ES6 module support
- **Presentation CSS**: Always use `new_assets/presentation/css/styles.css` (never old `assets/css/slides.css`)
- **Slide navigation**: Always inline JavaScript, never external file
- **Navigation structure**: Must be outside `.presentation` wrapper
- **Button order**: Previous | Home | Next (this exact order is required)
- **Single source of truth**: `modules.json` for all course structure (but see warning below)

### ⚠️ Architectural Inconsistency

**There are TWO places where lecture data is defined:**
1. `assets/data/modules.json` - used by main landing page (index.html)
2. `modules/module{N}/index.html` - static HTML files for each module

When adding a new lecture, you **MUST update BOTH** or the module page will show outdated information. This is a design flaw but part of the current architecture.

## File Encoding

All files use UTF-8 encoding to support Ukrainian characters (Cyrillic).
