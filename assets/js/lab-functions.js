/**
 * Lab JavaScript Functions - Simplified Version
 * Version: 2.1
 */

// ===========================
// Copy Code Functionality
// ===========================

/**
 * Ініціалізує кнопки копіювання для всіх блоків коду
 */
function initializeCopyButtons() {
    // Знаходимо всі блоки коду
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach((codeBlock, index) => {
        // Створюємо контейнер
        const container = document.createElement('div');
        container.className = 'code-container';

        // Створюємо header з кнопкою
        const header = document.createElement('div');
        header.className = 'code-header';

        // Визначаємо мову програмування
        const language = codeBlock.className.match(/language-(\w+)/);
        const langLabel = document.createElement('span');
        langLabel.className = 'code-language';
        langLabel.textContent = language ? language[1].toUpperCase() : 'CODE';

        // Створюємо кнопку копіювання
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = `
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                </path>
            </svg>
            <span>Копіювати</span>
        `;

        // Обробник кліку
        copyButton.addEventListener('click', function() {
            copyToClipboard(codeBlock.textContent, copyButton);
        });

        // Збираємо header
        header.appendChild(langLabel);
        header.appendChild(copyButton);

        // Обгортаємо блок коду
        const pre = codeBlock.parentElement;
        pre.parentNode.insertBefore(container, pre);
        container.appendChild(header);
        container.appendChild(pre);

        // Додаємо клас до pre
        pre.className = 'code';
    });
}

/**
 * Копіює текст в буфер обміну
 * @param {string} text - Текст для копіювання
 * @param {HTMLElement} button - Кнопка копіювання
 */
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);

        // Змінюємо вигляд кнопки
        button.classList.add('copied');
        button.innerHTML = `
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Скопійовано!</span>
        `;

        // Повертаємо початковий стан через 2 секунди
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = `
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                    </path>
                </svg>
                <span>Копіювати</span>
            `;
        }, 2000);

    } catch (err) {
        // Fallback для старих браузерів
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            button.innerHTML = `
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Скопійовано!</span>
            `;
            setTimeout(() => {
                button.innerHTML = `
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                        </path>
                    </svg>
                    <span>Копіювати</span>
                `;
            }, 2000);
        } catch (err) {
            console.error('Помилка копіювання:', err);
        }

        document.body.removeChild(textArea);
    }
}

// ===========================
// Tab Navigation
// ===========================

/**
 * Перемикає таби
 * @param {Event} event - Подія кліку
 * @param {string} tabId - ID таба для активації
 */
function switchTab(event, tabId) {
    // Деактивуємо всі таби
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Активуємо поточний таб
    event.target.classList.add('active');
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Зберігаємо стан в localStorage
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('activeTab_' + window.location.pathname, tabId);
    }
}

/**
 * Відновлює останній активний таб
 */
function restoreActiveTab() {
    if (typeof(Storage) !== "undefined") {
        const savedTab = localStorage.getItem('activeTab_' + window.location.pathname);
        if (savedTab) {
            const tabButton = document.querySelector(`[onclick*="${savedTab}"]`);
            if (tabButton) {
                tabButton.click();
            }
        }
    }
}

// ===========================
// Smooth Scrolling
// ===========================

/**
 * Ініціалізує плавну прокрутку для якорних посилань
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Оновлюємо URL без перезавантаження
                history.pushState(null, null, targetId);
            }
        });
    });
}

// ===========================
// Code Highlighting
// ===========================

/**
 * Ініціалізує підсвітку коду
 */
function initializeCodeHighlighting() {
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
}

// ===========================
// Print Functionality
// ===========================

/**
 * Підготовлює сторінку для друку
 */
function preparePrint() {
    window.addEventListener('beforeprint', function() {
        // Розкриваємо всі таби для друку
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'block';
        });
    });

    window.addEventListener('afterprint', function() {
        // Повертаємо початковий стан табів
        document.querySelectorAll('.tab-content').forEach(content => {
            if (!content.classList.contains('active')) {
                content.style.display = 'none';
            }
        });
    });
}

// ===========================
// Main Initialization
// ===========================

/**
 * Головна функція ініціалізації
 */
function initializeLab() {
    // Чекаємо повного завантаження DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('🔬 Lab environment initialized');

        // Ініціалізуємо всі функції
        initializeCopyButtons();
        initializeSmoothScroll();
        initializeCodeHighlighting();
        restoreActiveTab();
        preparePrint();

        // Додаємо клас для анімації появи
        document.body.classList.add('loaded');
    }
}

// ===========================
// Utility Functions
// ===========================

/**
 * Завантажує результати у форматі JSON
 */
function downloadResults(data, filename = 'results.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

/**
 * Генерує звіт у форматі Markdown
 */
function generateMarkdownReport(labNumber, studentName, results) {
    const date = new Date().toLocaleDateString('uk-UA');

    const markdown = `# Лабораторна робота №${labNumber}
## Стеганоаналіз LSB

**Студент:** ${studentName}  
**Дата:** ${date}

## Результати виконання

${results}

## Висновки

[Тут будуть ваші висновки]

---
*Згенеровано автоматично*
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `lab${labNumber}_report.md`;
    link.click();

    URL.revokeObjectURL(url);
}

// Запускаємо ініціалізацію
initializeLab();

// Експортуємо функції для використання в HTML
window.labFunctions = {
    switchTab,
    copyToClipboard,
    downloadResults,
    generateMarkdownReport
};