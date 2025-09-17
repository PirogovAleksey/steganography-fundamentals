/* ================================================================
   STORAGE.JS - LocalStorage API для збереження прогресу навчання
   GitHub Pages | Мінімальна архітектура | v1.0
   ================================================================ */

/**
 * Простий API для роботи з LocalStorage
 * Зберігає прогрес студентів по лекціях
 */
class BankingStorage {
    constructor() {
        this.prefix = 'banking_tech_';
        this.version = '1.0';
        this.init();
    }

    /**
     * Ініціалізація сховища
     */
    init() {
        // Перевіряємо підтримку localStorage
        if (!this.isSupported()) {
            console.warn('LocalStorage не підтримується цим браузером');
            return;
        }

        // Ініціалізуємо базові дані якщо потрібно
        if (!this.getItem('initialized')) {
            this.setItem('initialized', true);
            this.setItem('version', this.version);
            console.log('Banking Tech Storage initialized');
        }
    }

    /**
     * Перевірка підтримки localStorage
     */
    isSupported() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Отримати повний ключ з префіксом
     */
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * Зберегти дані
     */
    setItem(key, value) {
        if (!this.isSupported()) return false;

        try {
            const fullKey = this.getKey(key);
            const data = {
                value: value,
                timestamp: Date.now()
            };
            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Помилка збереження в localStorage:', e);
            return false;
        }
    }

    /**
     * Отримати дані
     */
    getItem(key, defaultValue = null) {
        if (!this.isSupported()) return defaultValue;

        try {
            const fullKey = this.getKey(key);
            const stored = localStorage.getItem(fullKey);

            if (!stored) return defaultValue;

            const data = JSON.parse(stored);
            return data.value !== undefined ? data.value : defaultValue;
        } catch (e) {
            console.error('Помилка читання з localStorage:', e);
            return defaultValue;
        }
    }

    /**
     * Видалити дані
     */
    removeItem(key) {
        if (!this.isSupported()) return false;

        try {
            const fullKey = this.getKey(key);
            localStorage.removeItem(fullKey);
            return true;
        } catch (e) {
            console.error('Помилка видалення з localStorage:', e);
            return false;
        }
    }

    /* ----------------------------------------------------------------
       LECTURE PROGRESS API
       ---------------------------------------------------------------- */

    /**
     * Зберегти прогрес лекції
     */
    saveLectureProgress(moduleId, lectureId, slideIndex, totalSlides = 0) {
        const progressKey = `progress_m${moduleId}_l${lectureId}`;
        const progress = {
            moduleId: moduleId,
            lectureId: lectureId,
            currentSlide: parseInt(slideIndex),
            totalSlides: parseInt(totalSlides),
            percentage: totalSlides > 0 ? Math.round((slideIndex / totalSlides) * 100) : 0,
            lastAccessed: Date.now(),
            completed: slideIndex >= totalSlides - 1
        };

        return this.setItem(progressKey, progress);
    }

    /**
     * Отримати прогрес лекції
     */
    getLectureProgress(moduleId, lectureId) {
        const progressKey = `progress_m${moduleId}_l${lectureId}`;
        const defaultProgress = {
            moduleId: moduleId,
            lectureId: lectureId,
            currentSlide: 0,
            totalSlides: 0,
            percentage: 0,
            lastAccessed: null,
            completed: false
        };

        return this.getItem(progressKey, defaultProgress);
    }

    /**
     * Отримати всі прогреси модуля
     */
    getModuleProgress(moduleId) {
        if (!this.isSupported()) return [];

        const progresses = [];
        const prefix = this.getKey(`progress_m${moduleId}_`);

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        const data = JSON.parse(stored);
                        progresses.push(data.value);
                    }
                }
            }
        } catch (e) {
            console.error('Помилка отримання прогресу модуля:', e);
        }

        return progresses.sort((a, b) => a.lectureId - b.lectureId);
    }

    /**
     * Отримати загальний прогрес курсу
     */
    getCourseProgress() {
        if (!this.isSupported()) return { completed: 0, total: 0, percentage: 0 };

        let completed = 0;
        let total = 0;
        const prefix = this.getKey('progress_');

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        const data = JSON.parse(stored);
                        const progress = data.value;
                        total++;
                        if (progress.completed) {
                            completed++;
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Помилка підрахунку загального прогресу:', e);
        }

        return {
            completed: completed,
            total: total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    /* ----------------------------------------------------------------
       UTILITY METHODS
       ---------------------------------------------------------------- */

    /**
     * Очистити старі дані (старші за X днів)
     */
    cleanupOldData(daysOld = 30) {
        if (!this.isSupported()) return 0;

        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        const keysToRemove = [];
        const prefix = this.getKey('');

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        const data = JSON.parse(stored);
                        if (data.timestamp && data.timestamp < cutoffTime) {
                            keysToRemove.push(key);
                        }
                    }
                }
            }

            // Видаляємо старі ключі
            keysToRemove.forEach(key => localStorage.removeItem(key));

            if (keysToRemove.length > 0) {
                console.log(`Очищено ${keysToRemove.length} старих записів`);
            }

            return keysToRemove.length;
        } catch (e) {
            console.error('Помилка очищення старих даних:', e);
            return 0;
        }
    }

    /**
     * Отримати статистику використання сховища
     */
    getStorageStats() {
        if (!this.isSupported()) {
            return { supported: false };
        }

        let totalKeys = 0;
        let totalSize = 0;
        const prefix = this.getKey('');

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    totalKeys++;
                    const value = localStorage.getItem(key);
                    if (value) {
                        totalSize += key.length + value.length;
                    }
                }
            }

            return {
                supported: true,
                totalKeys: totalKeys,
                totalSize: totalSize,
                totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
                storageQuota: this.getStorageQuota()
            };
        } catch (e) {
            console.error('Помилка отримання статистики:', e);
            return { supported: true, error: true };
        }
    }

    /**
     * Приблизна квота localStorage (зазвичай 5-10MB)
     */
    getStorageQuota() {
        try {
            let data = '';
            let i = 0;
            // Пробуємо заповнити сховище до помилки
            while (i < 10000) { // обмеження щоб не зависнути
                try {
                    data += '1234567890';
                    localStorage.setItem('__quota_test__', data);
                    i++;
                } catch (e) {
                    localStorage.removeItem('__quota_test__');
                    return Math.round(data.length / 1024); // в KB
                }
            }
        } catch (e) {
            return 'unknown';
        }
        return 'unknown';
    }

    /**
     * Очистити всі дані проекту
     */
    clearAllData() {
        if (!this.isSupported()) return false;

        const keysToRemove = [];
        const prefix = this.getKey('');

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));

            console.log(`Очищено всі дані проекту (${keysToRemove.length} записів)`);
            return true;
        } catch (e) {
            console.error('Помилка очищення даних:', e);
            return false;
        }
    }
}

/* ================================================================
   GLOBAL INSTANCE - готовий до використання
   ================================================================ */

// Створюємо глобальний екземпляр
const Storage = new BankingStorage();

// Експортуємо для використання в інших модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BankingStorage, Storage };
}
