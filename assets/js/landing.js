/**
 * LANDING.JS - Steganography Course
 * JavaScript для головної сторінки курсу "Основи стеганографії"
 *
 * Версія: 2.2 - ES6 Modules + Constants
 */

// ES6 Module Imports
import { Storage } from './storage.js';
import {
    PATHS,
    MESSAGES,
    getLabTypeIcon,
    getLabTypeLabel,
    getStatusBadge,
    getLectureStatusIcon
} from './constants.js';

class StegoLandingPage {
    constructor() {
        this.modules = [];
        this.labs = [];
        this.courseData = null;
        this.activeTab = 'lectures';
        this.init();
    }

    async init() {
        try {
            console.log('🔐 Ініціалізація сторінки курсу стеганографії...');
            await this.loadCourseData();
            this.updateStats();
            this.setupTabs();
            this.renderActiveTab();
            console.log('✅ Сторінка ініціалізована успішно');
        } catch (error) {
            console.error('❌ Помилка завантаження даних курсу:', error);
            this.showError();
        }
    }

    async loadCourseData() {
        const response = await fetch(PATHS.DATA_MODULES);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        this.courseData = await response.json();
        this.modules = this.courseData.modules || [];
        this.labs = this.courseData.labs || [];
        console.log('✅ Завантажено дані курсу:', this.courseData.courseInfo);
    }

    updateStats() {
        if (!this.courseData) return;

        const info = this.courseData.courseInfo;
        const totalModulesEl = document.getElementById('total-modules');
        const totalLecturesEl = document.getElementById('total-lectures');
        const totalLabsEl = document.getElementById('total-labs');
        const totalHoursEl = document.getElementById('total-hours');

        if (totalModulesEl) totalModulesEl.textContent = info.totalModules || 4;
        if (totalLecturesEl) totalLecturesEl.textContent = info.totalLectures || 16;
        if (totalLabsEl) totalLabsEl.textContent = info.totalLabs || 17;
        if (totalHoursEl) totalHoursEl.textContent = info.estimatedHours || 100;
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        this.activeTab = tabName;

        // Оновити кнопки табів
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Оновити контент табів
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        this.renderActiveTab();
        console.log(`🔄 Перемикання на таб: ${tabName}`);
    }

    renderActiveTab() {
        if (this.activeTab === 'lectures') {
            this.renderLectures();
        } else if (this.activeTab === 'labs') {
            this.renderLabs();
        }
    }

    renderLectures() {
        const container = document.getElementById('lectures-container');
        if (!container || this.modules.length === 0) {
            this.showError('lectures-container');
            return;
        }

        container.innerHTML = '';

        this.modules.forEach((module, index) => {
            if (module.lectures && module.lectures.length > 0) {
                const moduleCard = this.createLectureModuleCard(module, index + 1);
                container.appendChild(moduleCard);
            }
        });

        console.log(`📖 Відрендерено ${this.modules.length} модулів з лекціями`);
    }

    renderLabs() {
        const container = document.getElementById('labs-container');
        if (!container) {
            this.showError('labs-container');
            return;
        }

        container.innerHTML = '';

        // Додаємо заголовок та опис
        const header = document.createElement('div');
        header.className = 'col-span-full';
        header.innerHTML = `
            <h2 class="section-title">🔬 Лабораторні роботи з курсу "Основи стеганографії"</h2>
            <p class="section-subtitle mb-6">Список лабораторних робіт</p>
        `;
        container.appendChild(header);

        if (this.labs.length === 0) {
            container.innerHTML += `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">🔬</div>
                    <h3 class="text-xl font-semibold mb-2">Лабораторні роботи</h3>
                    <p class="text-gray-600">Практичні завдання не знайдені</p>
                </div>
            `;
            return;
        }

        this.labs.forEach((lab, index) => {
            const labCard = this.createLabCard(lab, index + 1);
            container.appendChild(labCard);
        });

        console.log(`🔬 Відрендерено ${this.labs.length} лабораторних робіт`);
    }

    createLectureModuleCard(module, position) {
        const card = document.createElement('div');
        card.className = 'module-preview';

        // Додаємо клік на картку для переходу до модуля
        card.style.cursor = 'pointer';
        card.onclick = function() {
            window.location.href = PATHS.MODULE(module.id);
        };

        const statusBadge = getStatusBadge(module.status);

        // Підрахунок готових лекцій
        const completedLectures = module.lectures.filter(l => l.status === 'completed').length;
        const totalLectures = module.lectures.length;

        card.innerHTML = `
            <div class="module-number">${position}</div>
            <div class="module-preview-content">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="module-preview-title">${module.emoji || '📚'} ${module.title}</h3>
                    ${statusBadge}
                </div>
                <p class="module-preview-description mb-4">${module.description}</p>

                <div class="module-section">
                    <div class="module-section-title">
                        <span>📖 Лекції (${completedLectures}/${totalLectures}):</span>
                    </div>
                    <div class="module-items">
                        ${this.renderModuleLectures(module.lectures, module.id)}
                    </div>
                </div>

                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                    <a href="${PATHS.MODULE(module.id)}"
                       class="module-action-button"
                       style="display: block; text-decoration: none; color: white;"
                       onclick="event.stopPropagation();">
                        Перейти до модуля →
                    </a>
                </div>
            </div>
        `;

        return card;
    }

    renderModuleLectures(lectures, moduleId) {
        return lectures.map(lecture => {
            const statusIcon = getLectureStatusIcon(lecture.status);

            // Перевіряємо чи лекція доступна для кліку
            const isClickable = lecture.status === 'completed' && lecture.path;
            const clickHandler = isClickable
                ? `onclick="event.stopPropagation(); window.location.href='${PATHS.MODULE_LECTURE(moduleId, lecture.path)}';"`
                : 'onclick="event.stopPropagation();"';
            const cursorStyle = isClickable ? 'style="cursor: pointer;"' : '';

            return `
                <div class="module-item module-lecture ${lecture.status}"
                     ${clickHandler}
                     ${cursorStyle}
                     data-module-id="${moduleId}"
                     data-lecture-id="${lecture.id}">
                    <span class="module-item-title">
                        ${statusIcon} ${lecture.title}
                    </span>
                    ${lecture.duration ? `<span class="module-item-meta">${lecture.duration} хв</span>` : ''}
                </div>
            `;
        }).join('');
    }

    createLabCard(lab, position) {
        const card = document.createElement('div');
        card.className = 'practical-card';

        const typeIcon = getLabTypeIcon(lab.type);
        const typeLabel = getLabTypeLabel(lab.type);

        card.innerHTML = `
            <div class="practical-header">
                <div class="practical-icon">${typeIcon}</div>
                <div class="practical-meta">
                    <span class="practical-type">Лабораторна ${position}</span>
                    <span class="practical-module">${typeLabel}</span>
                </div>
            </div>
            <h3 class="practical-title">${lab.title}</h3>
            <p class="practical-description">${lab.description}</p>
            ${lab.estimatedTime ? `
                <div class="practical-time">
                    ⏱️ Приблизний час: ${lab.estimatedTime} хв
                </div>
            ` : ''}
        `;

        card.addEventListener('click', () => {
            this.openLab(lab.id);
        });

        return card;
    }

    openLab(labId) {
        console.log(`🔬 Відкриття лабораторної ${labId}`);

        // Знаходимо лабораторну в даних
        const lab = this.labs.find(l => l.id === labId);

        if (lab && lab.status === 'completed') {
            // Якщо лабораторна має власний path, використовуємо його
            if (lab.path) {
                window.location.href = lab.path;
            } else {
                // Інакше використовуємо стандартний шлях
                window.location.href = PATHS.LAB(labId);
            }
        } else {
            alert(MESSAGES.INFO.LAB_COMING_SOON(labId));
        }
    }

    showError(containerId = 'lectures-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="col-span-full">
                    <div class="alert alert-error">
                        <div class="alert-title">❌ Помилка завантаження</div>
                        ${MESSAGES.ERROR.LOAD_DATA}
                        <br><small>${MESSAGES.ERROR.CHECK_FILE}</small>
                    </div>
                </div>
            `;
        }
    }
}

// Ініціалізація після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM завантажено, ініціалізація StegoLandingPage...');
    new StegoLandingPage();
});

// Smooth scroll для внутрішніх посилань
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Performance monitoring
window.addEventListener('load', () => {
    if (window.performance && window.performance.timing) {
        const navigation = window.performance.timing;
        const loadTime = navigation.loadEventEnd - navigation.navigationStart;

        if (loadTime > 0 && loadTime < 30000) {
            console.log(`⚡ Час завантаження сторінки: ${loadTime}ms`);
        }
    }
});

// ES6 Module Export
export { StegoLandingPage };
