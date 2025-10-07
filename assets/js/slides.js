/* ================================================================
   SLIDES.JS - Управління презентаціями лекцій
   GitHub Pages | ES6 Modules | v2.0
   ================================================================ */

// ES6 Module Imports
import { Storage } from './storage.js';
import { TIMINGS, MESSAGES, GESTURES } from './constants.js';

/**
 * Менеджер слайдів для лекцій курсу стеганографії
 * Завантажує slides.json, керує навігацією, зберігає прогрес
 */
class SlidesManager {
    constructor() {
        this.slides = [];
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.moduleId = null;
        this.lectureId = null;
        this.metadata = null;
        this.isLoading = true;

        // DOM елементи
        this.container = null;
        this.navigation = null;
        this.progressBar = null;
        this.counter = null;

        // Налаштування
        this.autoSave = true;
        this.autoSaveInterval = TIMINGS.AUTO_SAVE_INTERVAL;
        this.keyboardEnabled = true;

        this.init();
    }

    /**
     * Ініціалізація менеджера слайдів
     */
    async init() {
        console.log('🎬 Ініціалізація SlidesManager...');

        // Викликаємо setup напряму (DOM вже готовий при створенні екземпляра)
        this.setup();
    }

    /**
     * Налаштування після завантаження DOM
     */
    async setup() {
        try {
            // Знаходимо DOM елементи
            this.findDOMElements();

            // Завантажуємо дані слайдів
            await this.loadSlides();

            // Налаштовуємо UI
            this.setupUI();

            // Відновлюємо прогрес
            this.restoreProgress();

            // Налаштовуємо обробники подій
            this.setupEventListeners();

            // Показуємо перший слайд
            this.showSlide(this.currentSlide);

            // Запускаємо автозбереження
            if (this.autoSave) {
                this.startAutoSave();
            }

            this.isLoading = false;
            console.log('✅ SlidesManager готовий до роботи');

        } catch (error) {
            console.error('❌ Помилка ініціалізації SlidesManager:', error);
            this.showError(MESSAGES.ERROR.LOAD_LECTURE);
        }
    }

    /**
     * Знаходження DOM елементів
     */
    findDOMElements() {
        this.container = document.getElementById('slides-container');
        this.navigation = document.querySelector('.slide-navigation') || document.querySelector('.slide-nav');
        this.progressBar = document.querySelector('.slide-progress-bar');
        this.counter = document.getElementById('slide-counter');

        // Створюємо контейнер якщо не знайшли
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'slides-container';
            this.container.className = 'slides-wrapper';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Завантаження даних слайдів з JSON файлу
     */
    async loadSlides() {
        try {
            // Шукаємо slides.json у поточній папці
            const response = await fetch('./slides.json');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Перевіряємо структуру даних
            if (!data.slides || !Array.isArray(data.slides)) {
                throw new Error('Неправильна структура slides.json');
            }

            this.slides = data.slides;
            this.metadata = data.metadata || {};
            this.totalSlides = this.slides.length;

            // Отримуємо ID модуля та лекції
            this.moduleId = this.metadata.module || this.extractModuleFromURL();
            this.lectureId = this.metadata.lecture || this.extractLectureFromURL();

            console.log(`📚 Завантажено ${this.totalSlides} слайдів для модуля ${this.moduleId}, лекції ${this.lectureId}`);

        } catch (error) {
            console.error('❌ Помилка завантаження slides.json:', error);
            throw new Error(MESSAGES.ERROR.LOAD_SLIDES);
        }
    }

    /**
     * Витягування ID модуля з URL
     */
    extractModuleFromURL() {
        const url = window.location.pathname;
        const match = url.match(/module(\d+)/);
        return match ? parseInt(match[1]) : 1;
    }

    /**
     * Витягування ID лекції з URL
     */
    extractLectureFromURL() {
        const url = window.location.pathname;
        const match = url.match(/lecture(\d+)/);
        return match ? parseInt(match[1]) : 1;
    }

    /**
     * Налаштування UI елементів
     */
    setupUI() {
        // Створюємо навігацію якщо її немає
        if (!this.navigation) {
            this.createNavigation();
        }

        // Створюємо прогрес-бар якщо його немає
        if (!this.progressBar) {
            this.createProgressBar();
        }

        // Оновлюємо лічильник
        this.updateCounter();

        // Додаємо клас для стилізації
        document.body.classList.add('slides-mode');
    }

    /**
     * Створення навігації
     */
    createNavigation() {
        const nav = document.createElement('div');
        nav.className = 'slide-navigation';
        nav.innerHTML = `
      <button id="prev-slide" class="slide-btn" aria-label="Попередній слайд">
        ← Назад
      </button>
      <span id="slide-counter" class="slide-counter">1 / ${this.totalSlides}</span>
      <button id="next-slide" class="slide-btn" aria-label="Наступний слайд">
        Вперед →
      </button>
      <button id="fullscreen-btn" class="slide-btn" aria-label="На весь екран">
        ⛶
      </button>
    `;

        document.body.appendChild(nav);
        this.navigation = nav;
        this.counter = document.getElementById('slide-counter');
    }

    /**
     * Створення прогрес-бару
     */
    createProgressBar() {
        const progress = document.createElement('div');
        progress.className = 'slide-progress';
        progress.innerHTML = '<div class="slide-progress-bar"></div>';

        document.body.appendChild(progress);
        this.progressBar = progress.querySelector('.slide-progress-bar');
    }

    /**
     * Відновлення збереженого прогресу
     */
    restoreProgress() {
        if (!Storage || !this.moduleId || !this.lectureId) return;

        try {
            const progress = Storage.getLectureProgress(this.moduleId, this.lectureId);
            if (progress && progress.currentSlide >= 0 && progress.currentSlide < this.totalSlides) {
                this.currentSlide = progress.currentSlide;
                console.log(`🔄 Відновлено прогрес: слайд ${this.currentSlide + 1}/${this.totalSlides}`);
            }
        } catch (error) {
            console.warn('⚠️ Не вдалося відновити прогрес:', error);
        }
    }

    /**
     * Налаштування обробників подій
     */
    setupEventListeners() {
        // Кнопки навігації
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');
        const fullscreenBtn = document.getElementById('fullscreen-btn');

        if (prevBtn) prevBtn.addEventListener('click', () => this.previousSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Клавіатурні скорочення
        if (this.keyboardEnabled) {
            document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        }

        // Touch gestures для мобільних
        this.setupTouchGestures();

        // Збереження при виході зі сторінки
        window.addEventListener('beforeunload', () => this.saveProgress());
    }

    /**
     * Обробка натискання клавіш
     */
    handleKeyPress(event) {
        // Не обробляємо якщо фокус на полі вводу
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key) {
            case 'ArrowRight':
            case ' ': // Пробіл
            case 'PageDown':
                event.preventDefault();
                this.nextSlide();
                break;

            case 'ArrowLeft':
            case 'PageUp':
                event.preventDefault();
                this.previousSlide();
                break;

            case 'Home':
                event.preventDefault();
                this.goToSlide(0);
                break;

            case 'End':
                event.preventDefault();
                this.goToSlide(this.totalSlides - 1);
                break;

            case 'f':
            case 'F11':
                event.preventDefault();
                this.toggleFullscreen();
                break;

            case 'Escape':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
        }
    }

    /**
     * Touch gestures для мобільних пристроїв
     */
    setupTouchGestures() {
        let startX = null;
        let startY = null;
        const minSwipeDistance = GESTURES.MIN_SWIPE_DISTANCE;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        this.container.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const diffX = startX - endX;
            const diffY = startY - endY;

            // Горизонтальний swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    this.nextSlide(); // Swipe ліворуч = наступний
                } else {
                    this.previousSlide(); // Swipe праворуч = попередній
                }
            }

            startX = null;
            startY = null;
        });
    }

    /**
     * Показ конкретного слайду
     */
    showSlide(index) {
        if (index < 0 || index >= this.totalSlides) return;

        this.currentSlide = index;
        const slide = this.slides[index];

        // Рендеримо слайд
        this.renderSlide(slide);

        // Оновлюємо UI
        this.updateUI();

        // Зберігаємо прогрес
        this.saveProgress();
    }

    /**
     * Рендеринг слайду
     */
    renderSlide(slide) {
        if (!slide) return;

        let html = '';

        switch (slide.type) {
            case 'title':
                html = this.renderTitleSlide(slide);
                break;
            case 'content':
                html = this.renderContentSlide(slide);
                break;
            case 'stego-example':
                html = this.renderStegoExampleSlide(slide);
                break;
            case 'statistics':
                html = this.renderStatisticsSlide(slide);
                break;
            case 'list':
                html = this.renderListSlide(slide);
                break;
            default:
                html = this.renderContentSlide(slide);
        }

        this.container.innerHTML = `
      <div class="slide active">
        <div class="slide-content">
          ${html}
        </div>
      </div>
    `;
    }

    /**
     * Рендеринг титульного слайду
     */
    renderTitleSlide(slide) {
        return `
      <div class="slide-title">
        <h1>${slide.title || ''}</h1>
        ${slide.subtitle ? `<div class="subtitle">${slide.subtitle}</div>` : ''}
        ${slide.content ? `<div class="content">${slide.content}</div>` : ''}
      </div>
    `;
    }

    /**
     * Рендеринг звичайного слайду
     */
    renderContentSlide(slide) {
        return `
      ${slide.title ? `<h2>${slide.title}</h2>` : ''}
      ${slide.content ? `<div class="content">${slide.content}</div>` : ''}
      ${slide.image ? `<img src="${slide.image}" alt="${slide.title || ''}" class="slide-image">` : ''}
    `;
    }

    /**
     * Рендеринг прикладу стеганографії
     */
    renderStegoExampleSlide(slide) {
        return `
      <div class="slide-stego-example">
        ${slide.icon ? `<div class="stego-icon">${slide.icon}</div>` : ''}
        <h2 class="stego-title">${slide.title}</h2>
        ${slide.example ? `
          <div class="stego-case">
            <h3>${slide.example.title}</h3>
            <p>${slide.example.description}</p>
            ${slide.example.details ? this.renderDetails(slide.example.details) : ''}
          </div>
        ` : ''}
        ${slide.content ? `<div class="content">${slide.content}</div>` : ''}
      </div>
    `;
    }

    /**
     * Рендеринг статистики
     */
    renderStatisticsSlide(slide) {
        return `
      <h2>${slide.title}</h2>
      <div class="slide-statistics">
        ${slide.stats ? slide.stats.map(stat => `
          <div class="stat-item">
            <span class="stat-value">${stat.value}</span>
            <span class="stat-description">${stat.label}</span>
          </div>
        `).join('') : ''}
      </div>
      ${slide.content ? `<div class="content">${slide.content}</div>` : ''}
    `;
    }

    /**
     * Рендеринг списку
     */
    renderListSlide(slide) {
        return `
      <h2>${slide.title}</h2>
      ${slide.items ? `
        <ul class="slide-list">
          ${slide.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      ` : ''}
      ${slide.content ? `<div class="content">${slide.content}</div>` : ''}
    `;
    }

    /**
     * Рендеринг деталей прикладу
     */
    renderDetails(details) {
        if (!Array.isArray(details)) return '';

        return `
      <ul class="details-list">
        ${details.map(detail => `<li>${detail}</li>`).join('')}
      </ul>
    `;
    }

    /**
     * Наступний слайд
     */
    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.showSlide(this.currentSlide + 1);
        }
    }

    /**
     * Попередній слайд
     */
    previousSlide() {
        if (this.currentSlide > 0) {
            this.showSlide(this.currentSlide - 1);
        }
    }

    /**
     * Перейти до конкретного слайду
     */
    goToSlide(index) {
        this.showSlide(index);
    }

    /**
     * Оновлення UI елементів
     */
    updateUI() {
        this.updateCounter();
        this.updateProgressBar();
        this.updateNavigationButtons();
    }

    /**
     * Оновлення лічильника
     */
    updateCounter() {
        if (this.counter) {
            this.counter.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;
        }
    }

    /**
     * Оновлення прогрес-бару
     */
    updateProgressBar() {
        if (this.progressBar) {
            const percentage = ((this.currentSlide + 1) / this.totalSlides) * 100;
            this.progressBar.style.width = `${percentage}%`;
        }
    }

    /**
     * Оновлення кнопок навігації
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');

        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
        }
    }

    /**
     * Повноекранний режим
     */
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }

    /**
     * Збереження прогресу
     */
    saveProgress() {
        if (!Storage || !this.moduleId || !this.lectureId) return;

        try {
            Storage.saveLectureProgress(
                this.moduleId,
                this.lectureId,
                this.currentSlide,
                this.totalSlides
            );
        } catch (error) {
            console.warn('⚠️ Не вдалося зберегти прогрес:', error);
        }
    }

    /**
     * Автозбереження прогресу
     */
    startAutoSave() {
        setInterval(() => {
            this.saveProgress();
        }, this.autoSaveInterval);
    }

    /**
     * Показ помилки
     */
    showError(message) {
        this.container.innerHTML = `
      <div class="slide active">
        <div class="slide-content">
          <div class="error-message">
            <h2>❌ Помилка</h2>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">
              Оновити сторінку
            </button>
          </div>
        </div>
      </div>
    `;
    }
}

/* ================================================================
   GLOBAL INSTANCE & AUTO-INIT
   ================================================================ */

// Автоматично створюємо екземпляр при завантаженні
let slidesManager = null;

// Ініціалізація після завантаження DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        slidesManager = new SlidesManager();
    });
} else {
    slidesManager = new SlidesManager();
}

// ES6 Module Export
export { SlidesManager };
