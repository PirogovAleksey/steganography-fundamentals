/**
 * LANDING.JS - Steganography Course
 * JavaScript для головної сторінки курсу "Основи стеганографії"
 *
 * Адаптовано з banking-information-systems
 * Версія: 2.0
 */

class StegoLandingPage {
    constructor() {
        this.modules = [];
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
        const response = await fetch('assets/data/modules.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        this.courseData = await response.json();
        this.modules = this.courseData.modules || [];
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
        if (totalLabsEl) totalLabsEl.textContent = info.totalLabs || 34;
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

        this.attachLectureEventListeners();
        console.log(`📖 Відрендерено ${this.modules.length} модулів з лекціями`);
    }

    renderLabs() {
        const container = document.getElementById('labs-container');
        if (!container) {
            this.showError('labs-container');
            return;
        }

        container.innerHTML = '';

        // Збираємо всі лабораторні з усіх модулів
        const allLabs = [];
        this.modules.forEach(module => {
            if (module.labs) {
                module.labs.forEach(lab => {
                    allLabs.push({
                        ...lab,
                        moduleId: module.id,
                        moduleName: module.title,
                        moduleEmoji: module.emoji
                    });
                });
            }
        });

        if (allLabs.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">🔬</div>
                    <h3 class="text-xl font-semibold mb-2">Лабораторні роботи</h3>
                    <p class="text-gray-600">Практичні завдання будуть додані незабаром</p>
                </div>
            `;
            return;
        }

        allLabs.forEach(lab => {
            const labCard = this.createLabCard(lab);
            container.appendChild(labCard);
        });

        console.log(`🔬 Відрендерено ${allLabs.length} лабораторних робіт`);
    }

    createLectureModuleCard(module, position) {
        const card = document.createElement('div');
        card.className = 'module-preview';

        const statusBadge = this.getStatusBadge(module.status);

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
                
                ${module.labs && module.labs.length > 0 ? `
                    <div class="module-section mt-4">
                        <div class="module-section-title">
                            <span>🔬 Лабораторні (${module.labs.length}):</span>
                        </div>
                        <div class="module-items">
                            ${this.renderModuleLabs(module.labs, module.id)}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        return card;
    }

    renderModuleLectures(lectures, moduleId) {
        return lectures.map(lecture => {
            const statusIcon = lecture.status === 'completed' ? '✅' :
                lecture.status === 'in_progress' ? '🔄' : '📋';

            return `
                <div class="module-item module-lecture ${lecture.status}" 
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

    renderModuleLabs(labs, moduleId) {
        return labs.map(lab => `
            <div class="module-item module-lab" 
                 data-module-id="${moduleId}" 
                 data-lab-id="${lab.id}">
                <span class="module-item-title">
                    ${lab.title}
                </span>
                ${lab.estimatedTime ? `<span class="module-item-meta">${lab.estimatedTime} хв</span>` : ''}
            </div>
        `).join('');
    }

    createLabCard(lab) {
        const card = document.createElement('div');
        card.className = 'practical-card';

        const typeIcon = lab.type === 'programming' ? '💻' :
            lab.type === 'analysis' ? '📊' :
                lab.type === 'implementation' ? '⚙️' :
                    lab.type === 'machine-learning' ? '🤖' : '🔬';

        card.innerHTML = `
            <div class="practical-header">
                <div class="practical-icon">${typeIcon}</div>
                <div class="practical-meta">
                    <span class="practical-type">Лабораторна ${lab.id}</span>
                    <span class="practical-module">${lab.moduleEmoji} ${lab.moduleName}</span>
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
            this.openLab(lab.moduleId, lab.id);
        });

        return card;
    }

    attachLectureEventListeners() {
        const lectureItems = document.querySelectorAll('.module-lecture');
        lectureItems.forEach(item => {
            item.addEventListener('click', () => {
                const moduleId = item.dataset.moduleId;
                const lectureId = item.dataset.lectureId;
                this.openLecture(moduleId, lectureId);
            });
        });

        const labItems = document.querySelectorAll('.module-lab');
        labItems.forEach(item => {
            item.addEventListener('click', () => {
                const moduleId = item.dataset.moduleId;
                const labId = item.dataset.labId;
                this.openLab(moduleId, labId);
            });
        });
    }

    getStatusBadge(status) {
        const statusConfig = {
            'active': { text: 'Активний', class: 'badge-success' },
            'completed': { text: 'Завершено', class: 'badge-primary' },
            'planned': { text: 'Заплановано', class: 'badge-outline' },
            'in_progress': { text: 'В процесі', class: 'badge-warning' }
        };

        const config = statusConfig[status] || statusConfig['planned'];
        return `<span class="badge ${config.class}">${config.text}</span>`;
    }

    openLecture(moduleId, lectureId) {
        console.log(`📖 Відкриття лекції ${moduleId}.${lectureId}`);

        // Для лекції 1.1 перенаправляємо на існуючі файли
        if (moduleId == 1 && lectureId === '1.1') {
            window.location.href = 'lectures/lecture1/index.html';
            return;
        }

        // Для інших - показуємо повідомлення
        alert(`📖 Лекція ${lectureId} модуля ${moduleId} буде доступна після створення`);
    }

    openLab(moduleId, labId) {
        console.log(`🔬 Відкриття лабораторної ${moduleId}.${labId}`);
        alert(`🔬 Лабораторна ${labId} модуля ${moduleId} буде доступна після створення`);
    }

    showError(containerId = 'lectures-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="col-span-full">
                    <div class="alert alert-error">
                        <div class="alert-title">❌ Помилка завантаження</div>
                        Не вдалося завантажити дані курсу.
                        <br><small>Перевірте наявність файлу assets/data/modules.json</small>
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

// Експорт для використання в інших модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StegoLandingPage };
}