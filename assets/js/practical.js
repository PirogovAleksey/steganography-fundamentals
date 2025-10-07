/**
 * PRACTICAL.JS - JavaScript для практичних робіт
 * Steganography Fundamentals Course
 * v1.0
 */

// ================================================================
// CHECKLIST FUNCTIONALITY
// ================================================================

/**
 * Ініціалізація інтерактивних чек-листів
 */
function initChecklists() {
    const checklists = document.querySelectorAll('.checklist');

    checklists.forEach(checklist => {
        const items = checklist.querySelectorAll('li');

        items.forEach(item => {
            // Додаємо обробник кліку
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('done');

                // Зберігаємо стан в localStorage
                saveChecklistState(checklist.id);

                // Оновлюємо прогрес
                updateChecklistProgress(checklist);

                // Анімація
                animateCheckmark(this);
            });

            // Додаємо hover ефект
            item.addEventListener('mouseenter', function() {
                if (!this.classList.contains('done')) {
                    this.style.paddingLeft = '2.75rem';
                }
            });

            item.addEventListener('mouseleave', function() {
                if (!this.classList.contains('done')) {
                    this.style.paddingLeft = '2.5rem';
                }
            });
        });

        // Відновлюємо збережений стан
        restoreChecklistState(checklist.id);
    });
}

/**
 * Зберігання стану чек-листа через Storage API
 */
function saveChecklistState(checklistId) {
    if (!checklistId || !Storage) return;

    const checklist = document.getElementById(checklistId);
    if (!checklist) return;

    const items = checklist.querySelectorAll('li');
    const state = [];

    items.forEach((item, index) => {
        state[index] = item.classList.contains('done');
    });

    Storage.setItem(`checklist_${checklistId}`, state);
}

/**
 * Відновлення стану чек-листа через Storage API
 */
function restoreChecklistState(checklistId) {
    if (!checklistId || !Storage) return;

    const savedState = Storage.getItem(`checklist_${checklistId}`);
    if (!savedState) return;

    const checklist = document.getElementById(checklistId);
    if (!checklist) return;

    const items = checklist.querySelectorAll('li');

    items.forEach((item, index) => {
        if (savedState[index]) {
            item.classList.add('done');
        }
    });

    updateChecklistProgress(checklist);
}

/**
 * Оновлення прогресу виконання чек-листа
 */
function updateChecklistProgress(checklist) {
    const total = checklist.querySelectorAll('li').length;
    const done = checklist.querySelectorAll('li.done').length;
    const percentage = Math.round((done / total) * 100);

    // Шукаємо або створюємо елемент прогресу
    let progressElement = checklist.parentElement.querySelector('.checklist-progress');

    if (!progressElement) {
        progressElement = document.createElement('div');
        progressElement.className = 'checklist-progress';
        checklist.parentElement.insertBefore(progressElement, checklist.nextSibling);
    }

    progressElement.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="progress-text">${done} з ${total} завершено (${percentage}%)</div>
    `;

    // Якщо все виконано, додаємо анімацію
    if (percentage === 100) {
        progressElement.classList.add('complete');
        showCompletionMessage(checklist);
    } else {
        progressElement.classList.remove('complete');
    }
}

/**
 * Анімація галочки при виконанні
 */
function animateCheckmark(item) {
    item.style.transition = 'all 0.3s ease';

    if (item.classList.contains('done')) {
        // Анімація виконання
        item.style.transform = 'scale(1.05)';
        setTimeout(() => {
            item.style.transform = 'scale(1)';
        }, 200);
    }
}

/**
 * Повідомлення про завершення
 */
function showCompletionMessage(checklist) {
    const message = document.createElement('div');
    message.className = 'completion-message';
    message.innerHTML = '🎉 Вітаємо! Всі пункти виконано!';

    checklist.parentElement.appendChild(message);

    setTimeout(() => {
        message.classList.add('show');
    }, 100);

    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => {
            message.remove();
        }, 500);
    }, 3000);
}

// ================================================================
// TABLE FUNCTIONALITY
// ================================================================

/**
 * Додавання сортування до таблиць
 */
function initTableSorting() {
    const tables = document.querySelectorAll('.practical-content table');

    tables.forEach(table => {
        const headers = table.querySelectorAll('th');

        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.title = 'Клацніть для сортування';

            // Додаємо іконку сортування
            const sortIcon = document.createElement('span');
            sortIcon.className = 'sort-icon';
            sortIcon.innerHTML = ' ↕';
            header.appendChild(sortIcon);

            header.addEventListener('click', () => {
                sortTable(table, index);
            });
        });
    });
}

/**
 * Сортування таблиці
 */
function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Визначаємо напрямок сортування
    const isAscending = table.dataset.sortColumn == columnIndex &&
        table.dataset.sortDirection === 'asc';

    // Сортуємо рядки
    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();

        if (isAscending) {
            return bText.localeCompare(aText);
        } else {
            return aText.localeCompare(bText);
        }
    });

    // Оновлюємо таблицю
    rows.forEach(row => tbody.appendChild(row));

    // Зберігаємо стан сортування
    table.dataset.sortColumn = columnIndex;
    table.dataset.sortDirection = isAscending ? 'desc' : 'asc';

    // Оновлюємо іконки
    updateSortIcons(table, columnIndex, isAscending);
}

/**
 * Оновлення іконок сортування
 */
function updateSortIcons(table, activeColumn, isDescending) {
    const headers = table.querySelectorAll('th');

    headers.forEach((header, index) => {
        const icon = header.querySelector('.sort-icon');
        if (icon) {
            if (index === activeColumn) {
                icon.innerHTML = isDescending ? ' ↓' : ' ↑';
                header.classList.add('sorted');
            } else {
                icon.innerHTML = ' ↕';
                header.classList.remove('sorted');
            }
        }
    });
}

// ================================================================
// COPY CODE FUNCTIONALITY
// ================================================================

/**
 * Додавання кнопки копіювання до блоків коду
 */
function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre');

    codeBlocks.forEach(block => {
        // Створюємо контейнер
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        block.parentNode.insertBefore(wrapper, block);
        wrapper.appendChild(block);

        // Додаємо кнопку копіювання
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.innerHTML = '📋 Копіювати';
        copyButton.title = 'Копіювати код';
        wrapper.appendChild(copyButton);

        copyButton.addEventListener('click', () => {
            copyCodeToClipboard(block, copyButton);
        });
    });
}

/**
 * Копіювання коду в буфер обміну
 */
function copyCodeToClipboard(codeBlock, button) {
    const code = codeBlock.textContent;

    navigator.clipboard.writeText(code).then(() => {
        // Успішно скопійовано
        button.innerHTML = '✅ Скопійовано!';
        button.classList.add('success');

        setTimeout(() => {
            button.innerHTML = '📋 Копіювати';
            button.classList.remove('success');
        }, 2000);
    }).catch(err => {
        // Помилка копіювання
        button.innerHTML = '❌ Помилка';
        console.error('Помилка копіювання:', err);

        setTimeout(() => {
            button.innerHTML = '📋 Копіювати';
        }, 2000);
    });
}

// ================================================================
// PROGRESS TRACKING
// ================================================================

/**
 * Відстеження прогресу виконання практичної роботи
 */
function trackProgress() {
    const practicalId = getPracticalId();
    if (!practicalId || !Storage) return;

    const startTime = Storage.getItem(`practical_${practicalId}_start`);

    if (!startTime) {
        // Перший вхід - зберігаємо час початку
        Storage.setItem(`practical_${practicalId}_start`, Date.now());
    }

    // Оновлюємо час останнього відвідування
    Storage.setItem(`practical_${practicalId}_last_visit`, Date.now());

    // Відстежуємо загальний час
    trackTimeSpent();
}

/**
 * Отримання ID практичної роботи з URL або заголовка
 */
function getPracticalId() {
    // Спробуємо отримати з URL
    const urlMatch = window.location.pathname.match(/practical_(\d+_\d+)/);
    if (urlMatch) return urlMatch[1];

    // Або з заголовка сторінки
    const titleMatch = document.title.match(/Практична робота (\d+\.\d+)/);
    if (titleMatch) return titleMatch[1].replace('.', '_');

    return null;
}

/**
 * Відстеження часу виконання
 */
function trackTimeSpent() {
    const practicalId = getPracticalId();
    if (!practicalId || !Storage) return;

    let timeSpent = parseInt(Storage.getItem(`practical_${practicalId}_time`) || 0);

    setInterval(() => {
        timeSpent += 60; // Додаємо хвилину
        Storage.setItem(`practical_${practicalId}_time`, timeSpent);
        updateTimeDisplay(timeSpent);
    }, 60000); // Кожну хвилину
}

/**
 * Оновлення відображення часу
 */
function updateTimeDisplay(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    let timeDisplay = document.getElementById('time-spent');

    if (!timeDisplay) {
        // Створюємо елемент відображення часу
        const infoCard = document.querySelector('.card-body');
        if (infoCard) {
            timeDisplay = document.createElement('div');
            timeDisplay.id = 'time-spent';
            timeDisplay.className = 'time-spent';
            infoCard.appendChild(timeDisplay);
        }
    }

    if (timeDisplay) {
        timeDisplay.innerHTML = `⏱️ Час виконання: ${hours}г ${minutes}хв`;
    }
}

// ================================================================
// DOWNLOAD TRACKING
// ================================================================

/**
 * Відстеження завантажень
 */
function trackDownloads() {
    const downloadButtons = document.querySelectorAll('.download-btn');

    downloadButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const fileName = button.textContent.trim();
            const practicalId = getPracticalId();

            if (!Storage) return;

            // Зберігаємо інформацію про завантаження
            const downloads = Storage.getItem('downloads', []);
            downloads.push({
                practical: practicalId,
                file: fileName,
                timestamp: Date.now()
            });
            Storage.setItem('downloads', downloads);

            console.log(`📥 Завантажено: ${fileName}`);
        });
    });
}

// ================================================================
// ADDITIONAL STYLES
// ================================================================

/**
 * Додавання динамічних стилів для інтерактивності
 */
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Progress bar для чек-листів */
        .checklist-progress {
            margin-top: 1rem;
            padding: 1rem;
            background: #f0f9ff;
            border-radius: 8px;
            border: 1px solid #bfdbfe;
        }
        
        .progress-bar {
            height: 8px;
            background: #e0e7ff;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #1e40af);
            transition: width 0.3s ease;
            border-radius: 4px;
        }
        
        .progress-text {
            font-size: 0.875rem;
            color: #1e40af;
            font-weight: 500;
        }
        
        .checklist-progress.complete {
            background: #dcfce7;
            border-color: #86efac;
        }
        
        .checklist-progress.complete .progress-fill {
            background: linear-gradient(90deg, #22c55e, #16a34a);
        }
        
        .checklist-progress.complete .progress-text {
            color: #16a34a;
        }
        
        /* Completion message */
        .completion-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
            font-size: 1.25rem;
            font-weight: 600;
            color: #16a34a;
            z-index: 1000;
            transition: transform 0.3s ease;
        }
        
        .completion-message.show {
            transform: translate(-50%, -50%) scale(1);
        }
        
        /* Code block wrapper */
        .code-block-wrapper {
            position: relative;
            margin: 1.5rem 0;
        }
        
        .copy-code-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #e5e7eb;
            padding: 0.25rem 0.75rem;
            border-radius: 6px;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .copy-code-btn:hover {
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .copy-code-btn.success {
            background: #dcfce7;
            border-color: #86efac;
            color: #16a34a;
        }
        
        /* Sort icons */
        th.sorted {
            background: #1e3a8a !important;
        }
        
        .sort-icon {
            opacity: 0.7;
            font-size: 0.875rem;
            margin-left: 0.25rem;
        }
        
        th:hover .sort-icon {
            opacity: 1;
        }
        
        /* Time spent display */
        .time-spent {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #fef3c7;
            border-radius: 6px;
            display: inline-block;
            font-size: 0.875rem;
            color: #92400e;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
}

// ================================================================
// INITIALIZATION
// ================================================================

/**
 * Ініціалізація всіх функцій при завантаженні сторінки
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Ініціалізація практичної роботи...');

    // Додаємо динамічні стилі
    addDynamicStyles();

    // Ініціалізуємо компоненти
    initChecklists();
    initTableSorting();
    initCodeCopy();

    // Відстеження
    trackProgress();
    trackDownloads();

    console.log('✅ Практична робота готова до використання');
});

// ================================================================
// EXPORT
// ================================================================

// Експортуємо функції для використання в інших модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initChecklists,
        initTableSorting,
        initCodeCopy,
        trackProgress,
        trackDownloads
    };
}