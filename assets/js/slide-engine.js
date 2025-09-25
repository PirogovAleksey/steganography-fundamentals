// slide-engine.js - Універсальний движок слайдів для GitHub Pages
// Повністю клієнтський, без серверної логіки

class UniversalSlideEngine {
    constructor(config = {}) {
        // Конфігурація
        this.config = {
            containerId: config.containerId || 'slideContainer',
            dataUrl: config.dataUrl || null,
            lectureId: config.lectureId || null,
            enableKeyboard: config.enableKeyboard !== false,
            enableTouch: config.enableTouch !== false,
            enableSearch: config.enableSearch !== false,
            enableProgress: config.enableProgress !== false,
            enableQuiz: config.enableQuiz !== false,
            enablePrint: config.enablePrint !== false,
            autoSave: config.autoSave !== false,
            theme: config.theme || 'default'
        };
        
        // Стан
        this.slides = [];
        this.currentSlide = 0;
        this.searchIndex = [];
        this.progress = new Map();
        
        // Елементи DOM
        this.container = null;
        this.initialized = false;
        
        // Ініціалізація
        this.init();
    }
    
    async init() {
        // Чекаємо завантаження DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }
        
        // Знаходимо контейнер
        this.container = document.getElementById(this.config.containerId);
        if (!this.container) {
            console.error(`Container #${this.config.containerId} not found`);
            return;
        }
        
        // Завантажуємо дані
        if (this.config.dataUrl) {
            await this.loadSlides(this.config.dataUrl);
        }
        
        // Ініціалізуємо компоненти
        this.setupNavigation();
        this.setupKeyboard();
        this.setupTouch();
        this.setupSearch();
        this.setupProgress();
        this.loadTheme();
        
        // Відновлюємо прогрес
        this.restoreProgress();
        
        // Рендеримо перший слайд
        this.render();
        
        this.initialized = true;
    }
    
    async loadSlides(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load slides');
            
            const data = await response.json();
            this.slides = data.slides || [];
            this.metadata = data.metadata || {};
            
            // Будуємо пошуковий індекс
            this.buildSearchIndex();
            
        } catch (error) {
            console.error('Error loading slides:', error);
            this.showError('Не вдалося завантажити слайди');
        }
    }
    
    render() {
        if (!this.slides.length) {
            this.showError('Немає слайдів для відображення');
            return;
        }
        
        const slide = this.slides[this.currentSlide];
        
        // Основний HTML слайда
        this.container.innerHTML = `
            <div class="slide-wrapper" data-slide-id="${slide.id}">
                <div class="slide-content">
                    ${slide.title ? `<h1 class="slide-title">${slide.title}</h1>` : ''}
                    <div class="slide-body">
                        ${slide.content}
                    </div>
                    ${slide.notes ? `
                        <div class="slide-notes">
                            <details>
                                <summary>📝 Нотатки</summary>
                                ${slide.notes}
                            </details>
                        </div>
                    ` : ''}
                </div>
                
                ${this.renderNavigation()}
                ${this.renderProgress()}
                ${this.renderIndicators()}
            </div>
        `;
        
        // Запускаємо квіз якщо є
        if (slide.quiz && this.config.enableQuiz) {
            setTimeout(() => this.showQuiz(slide.quiz), 1000);
        }
        
        // Зберігаємо прогрес
        if (this.config.autoSave) {
            this.saveProgress();
        }
        
        // Викликаємо подію
        this.emit('slideChange', {
            current: this.currentSlide,
            total: this.slides.length,
            slide: slide
        });
    }
    
    renderNavigation() {
        return `
            <div class="slide-navigation">
                <button class="nav-btn nav-prev" ${this.currentSlide === 0 ? 'disabled' : ''}>
                    ← Попередній
                </button>
                
                <span class="slide-counter">
                    ${this.currentSlide + 1} / ${this.slides.length}
                </span>
                
                <button class="nav-btn nav-next" ${this.currentSlide === this.slides.length - 1 ? 'disabled' : ''}>
                    Наступний →
                </button>
                
                <button class="nav-btn nav-menu" onclick="window.location.href='../'">
                    ☰ Меню
                </button>
                
                ${this.config.enableSearch ? `
                    <button class="nav-btn nav-search">
                        🔍 Пошук
                    </button>
                ` : ''}
                
                ${this.config.enablePrint ? `
                    <button class="nav-btn nav-print">
                        🖨️ Друк
                    </button>
                ` : ''}
            </div>
        `;
    }
    
    renderProgress() {
        if (!this.config.enableProgress) return '';
        
        const progress = ((this.currentSlide + 1) / this.slides.length) * 100;
        
        return `
            <div class="slide-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">
                    Прогрес: ${Math.round(progress)}%
                </div>
            </div>
        `;
    }
    
    renderIndicators() {
        let indicators = '<div class="slide-indicators">';
        
        for (let i = 0; i < this.slides.length; i++) {
            indicators += `
                <span class="indicator ${i === this.currentSlide ? 'active' : ''}" 
                      data-slide="${i}"
                      title="Слайд ${i + 1}"></span>
            `;
        }
        
        indicators += '</div>';
        return indicators;
    }
    
    setupNavigation() {
        // Делегування подій
        this.container.addEventListener('click', (e) => {
            if (e.target.matches('.nav-prev')) {
                this.prevSlide();
            } else if (e.target.matches('.nav-next')) {
                this.nextSlide();
            } else if (e.target.matches('.nav-search')) {
                this.toggleSearch();
            } else if (e.target.matches('.nav-print')) {
                this.print();
            } else if (e.target.matches('.indicator')) {
                const slideIndex = parseInt(e.target.dataset.slide);
                this.goToSlide(slideIndex);
            }
        });
    }
    
    setupKeyboard() {
        if (!this.config.enableKeyboard) return;
        
        document.addEventListener('keydown', (e) => {
            // Ігноруємо якщо фокус в полі вводу
            if (e.target.matches('input, textarea')) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.slides.length - 1);
                    break;
                case '/':
                    if (this.config.enableSearch) {
                        e.preventDefault();
                        this.toggleSearch();
                    }
                    break;
                case 'f':
                case 'F':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        this.toggleFullscreen();
                    }
                    break;
                case 'p':
                case 'P':
                    if (this.config.enablePrint && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        this.print();
                    }
                    break;
                default:
                    // Цифрові клавіші для швидкої навігації
                    if (e.key >= '1' && e.key <= '9') {
                        const slideNum = parseInt(e.key) - 1;
                        if (slideNum < this.slides.length) {
                            this.goToSlide(slideNum);
                        }
                    }
            }
        });
    }
    
    setupTouch() {
        if (!this.config.enableTouch) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        this.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide(); // Свайп вліво
                } else {
                    this.prevSlide(); // Свайп вправо
                }
            }
        };
    }
    
    setupSearch() {
        if (!this.config.enableSearch) return;
        
        // Створюємо пошукову панель
        const searchPanel = document.createElement('div');
        searchPanel.className = 'search-panel';
        searchPanel.style.display = 'none';
        searchPanel.innerHTML = `
            <div class="search-container">
                <input type="text" class="search-input" placeholder="Пошук по слайдах...">
                <button class="search-close">✕</button>
                <div class="search-results"></div>
            </div>
        `;
        document.body.appendChild(searchPanel);
        
        // Обробники подій
        const input = searchPanel.querySelector('.search-input');
        const results = searchPanel.querySelector('.search-results');
        const closeBtn = searchPanel.querySelector('.search-close');
        
        input.addEventListener('input', (e) => {
            this.search(e.target.value, results);
        });
        
        closeBtn.addEventListener('click', () => {
            this.toggleSearch();
        });
    }
    
    buildSearchIndex() {
        this.searchIndex = [];
        
        this.slides.forEach((slide, index) => {
            // Видаляємо HTML теги для пошуку
            const textContent = this.stripHTML(slide.content);
            
            this.searchIndex.push({
                index: index,
                title: slide.title || '',
                content: textContent,
                notes: slide.notes || ''
            });
        });
    }
    
    search(query, resultsContainer) {
        if (!query) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        const results = this.searchIndex.filter(item => {
            const searchIn = `${item.title} ${item.content} ${item.notes}`.toLowerCase();
            return searchIn.includes(query.toLowerCase());
        });
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>Нічого не знайдено</p>';
            return;
        }
        
        resultsContainer.innerHTML = results.map(result => `
            <div class="search-result" data-slide="${result.index}">
                <strong>Слайд ${result.index + 1}: ${result.title}</strong>
                <p>${this.highlightMatch(result.content, query, 100)}</p>
            </div>
        `).join('');
        
        // Додаємо обробники кліків
        resultsContainer.querySelectorAll('.search-result').forEach(el => {
            el.addEventListener('click', () => {
                const slideIndex = parseInt(el.dataset.slide);
                this.goToSlide(slideIndex);
                this.toggleSearch();
            });
        });
    }
    
    toggleSearch() {
        const searchPanel = document.querySelector('.search-panel');
        if (searchPanel) {
            const isVisible = searchPanel.style.display !== 'none';
            searchPanel.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                searchPanel.querySelector('.search-input').focus();
            }
        }
    }
    
    setupProgress() {
        if (!this.config.enableProgress) return;
        
        // Завантажуємо збережений прогрес
        const saved = localStorage.getItem(`slide-progress-${this.config.lectureId}`);
        if (saved) {
            this.progress = new Map(JSON.parse(saved));
        }
    }
    
    saveProgress() {
        if (!this.config.lectureId) return;
        
        // Зберігаємо поточний слайд
        this.progress.set('currentSlide', this.currentSlide);
        this.progress.set('lastVisit', Date.now());
        
        // Зберігаємо переглянуті слайди
        let viewed = this.progress.get('viewedSlides') || [];
        if (!viewed.includes(this.currentSlide)) {
            viewed.push(this.currentSlide);
            this.progress.set('viewedSlides', viewed);
        }
        
        // Зберігаємо в localStorage
        localStorage.setItem(
            `slide-progress-${this.config.lectureId}`,
            JSON.stringify(Array.from(this.progress.entries()))
        );
    }
    
    restoreProgress() {
        if (!this.config.lectureId || !this.progress.has('currentSlide')) return;
        
        const lastSlide = this.progress.get('currentSlide');
        const lastVisit = this.progress.get('lastVisit');
        
        // Якщо минуло менше години, пропонуємо продовжити
        if (Date.now() - lastVisit < 3600000) {
            if (confirm(`Продовжити з слайду ${lastSlide + 1}?`)) {
                this.currentSlide = lastSlide;
            }
        }
    }
    
    // Навігація
    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
            this.render();
        }
    }
    
    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.render();
        }
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentSlide = index;
            this.render();
        }
    }
    
    // Допоміжні методи
    stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
    
    highlightMatch(text, query, maxLength = 150) {
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text.substring(0, maxLength) + '...';
        
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 50);
        
        let excerpt = text.substring(start, end);
        const regex = new RegExp(`(${query})`, 'gi');
        excerpt = excerpt.replace(regex, '<mark>$1</mark>');
        
        return (start > 0 ? '...' : '') + excerpt + (end < text.length ? '...' : '');
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    print() {
        // Створюємо версію для друку
        const printWindow = window.open('', '_blank');
        
        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Друк слайдів</title>
                <style>
                    @media print {
                        .slide-page { page-break-after: always; }
                        .no-print { display: none; }
                    }
                    body { 
                        font-family: 'Times New Roman', serif;
                        line-height: 1.6;
                    }
                    .slide-page {
                        padding: 30px;
                        margin-bottom: 50px;
                        border-bottom: 2px solid #ccc;
                    }
                    h1 { 
                        color: #333;
                        border-bottom: 2px solid #667eea;
                        padding-bottom: 10px;
                    }
                </style>
            </head>
            <body>
                <h1>${this.metadata.title || 'Слайди'}</h1>
                ${this.slides.map((slide, i) => `
                    <div class="slide-page">
                        <h2>Слайд ${i + 1}: ${slide.title || ''}</h2>
                        ${slide.content}
                        ${slide.notes ? `<div class="notes"><strong>Нотатки:</strong> ${slide.notes}</div>` : ''}
                    </div>
                `).join('')}
            </body>
            </html>
        `;
        
        printWindow.document.write(printHTML);
        printWindow.document.close();
        printWindow.print();
    }
    
    showQuiz(quiz) {
        // Показуємо квіз
        const quizModal = document.createElement('div');
        quizModal.className = 'quiz-modal';
        quizModal.innerHTML = `
            <div class="quiz-content">
                <h3>📝 Швидка перевірка</h3>
                <p>${quiz.question}</p>
                <div class="quiz-options">
                    ${quiz.options.map((option, i) => `
                        <button class="quiz-option" data-index="${i}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
                <button class="quiz-close">Пропустити</button>
            </div>
        `;
        
        document.body.appendChild(quizModal);
        
        // Обробники
        quizModal.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                if (index === quiz.correct) {
                    btn.style.background = '#4caf50';
                    setTimeout(() => {
                        document.body.removeChild(quizModal);
                    }, 1500);
                } else {
                    btn.style.background = '#f44336';
                }
            });
        });
        
        quizModal.querySelector('.quiz-close').addEventListener('click', () => {
            document.body.removeChild(quizModal);
        });
    }
    
    showError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                <h2>⚠️ Помилка</h2>
                <p>${message}</p>
                <button onclick="location.reload()">Перезавантажити</button>
            </div>
        `;
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('slide-theme') || this.config.theme;
        document.body.className = `theme-${savedTheme}`;
    }
    
    // Event system
    emit(event, data) {
        window.dispatchEvent(new CustomEvent(`slideEngine:${event}`, { detail: data }));
    }
    
    on(event, callback) {
        window.addEventListener(`slideEngine:${event}`, (e) => callback(e.detail));
    }
}

// Експортуємо для використання
window.UniversalSlideEngine = UniversalSlideEngine;