/**
 * CONSTANTS.JS - Shared constants for Steganography Course
 * GitHub Pages | Pure JavaScript | v1.0
 *
 * Централізовані константи для уникнення дублювання коду
 */

// ================================================================
// PATH CONSTANTS
// ================================================================

const PATHS = {
    MODULE: (id) => `modules/module${id}/index.html`,
    MODULE_LECTURE: (moduleId, path) => `modules/module${moduleId}/${path}`,
    LAB: (id) => `labs/lab${id}.html`,
    DATA_MODULES: 'assets/data/modules.json'
};

// ================================================================
// LAB TYPE CONFIGURATION
// ================================================================

const LAB_TYPES = {
    introduction: {
        icon: '🎯',
        label: 'Вступ'
    },
    programming: {
        icon: '💻',
        label: 'Програмування'
    },
    analysis: {
        icon: '📊',
        label: 'Аналіз'
    },
    audio: {
        icon: '🎵',
        label: 'Аудіо'
    },
    'machine-learning': {
        icon: '🤖',
        label: 'Машинне навчання'
    },
    advanced: {
        icon: '⚙️',
        label: 'Складний рівень'
    },
    practical: {
        icon: '🔧',
        label: 'Практика'
    },
    project: {
        icon: '📁',
        label: 'Проект'
    },
    presentation: {
        icon: '🎤',
        label: 'Презентація'
    }
};

// ================================================================
// STATUS CONFIGURATION
// ================================================================

const STATUS_CONFIG = {
    active: {
        text: 'Активний',
        class: 'badge-success',
        icon: '🟢'
    },
    completed: {
        text: 'Завершено',
        class: 'badge-primary',
        icon: '✅'
    },
    planned: {
        text: 'Заплановано',
        class: 'badge-outline',
        icon: '📋'
    },
    in_progress: {
        text: 'В процесі',
        class: 'badge-warning',
        icon: '🔄'
    }
};

// ================================================================
// LECTURE STATUS ICONS
// ================================================================

const LECTURE_STATUS_ICONS = {
    completed: '✅',
    in_progress: '🔄',
    planned: '📋',
    active: '🟢'
};

// ================================================================
// STORAGE KEYS
// ================================================================

const STORAGE_KEYS = {
    PREFIX: 'stego_course_',
    CHECKLIST: (id) => `checklist_${id}`,
    PRACTICAL_START: (id) => `practical_${id}_start`,
    PRACTICAL_LAST_VISIT: (id) => `practical_${id}_last_visit`,
    PRACTICAL_TIME: (id) => `practical_${id}_time`,
    DOWNLOADS: 'downloads',
    LECTURE_PROGRESS: (moduleId, lectureId) => `progress_m${moduleId}_l${lectureId}`
};

// ================================================================
// UI MESSAGES
// ================================================================

const MESSAGES = {
    ERROR: {
        LOAD_DATA: 'Не вдалося завантажити дані курсу.',
        CHECK_FILE: 'Перевірте наявність файлу assets/data/modules.json',
        LOAD_LECTURE: 'Помилка завантаження лекції',
        LOAD_SLIDES: 'Помилка завантаження slides.json'
    },
    SUCCESS: {
        INITIALIZED: 'Сторінка ініціалізована успішно',
        SLIDES_READY: 'SlidesManager готовий до роботи',
        PRACTICAL_READY: 'Практична робота готова до використання'
    },
    INFO: {
        LAB_COMING_SOON: (id) => `🔬 Лабораторна робота ${id} буде доступна незабаром`
    }
};

// ================================================================
// ANIMATION & TIMING
// ================================================================

const TIMINGS = {
    AUTO_SAVE_INTERVAL: 5000, // 5 seconds
    TIME_TRACK_INTERVAL: 60000, // 1 minute
    ANIMATION_DURATION: 300, // ms
    COMPLETION_MESSAGE_DURATION: 3000, // ms
    TOAST_DURATION: 2000 // ms
};

// ================================================================
// TOUCH GESTURES
// ================================================================

const GESTURES = {
    MIN_SWIPE_DISTANCE: 50 // pixels
};

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

/**
 * Отримати іконку типу лабораторної
 */
function getLabTypeIcon(type) {
    return LAB_TYPES[type]?.icon || '🔬';
}

/**
 * Отримати назву типу лабораторної
 */
function getLabTypeLabel(type) {
    return LAB_TYPES[type]?.label || 'Лабораторна';
}

/**
 * Отримати конфігурацію статусу
 */
function getStatusConfig(status) {
    return STATUS_CONFIG[status] || STATUS_CONFIG.planned;
}

/**
 * Отримати HTML для бейджу статусу
 */
function getStatusBadge(status) {
    const config = getStatusConfig(status);
    return `<span class="badge ${config.class}">${config.text}</span>`;
}

/**
 * Отримати іконку статусу лекції
 */
function getLectureStatusIcon(status) {
    return LECTURE_STATUS_ICONS[status] || LECTURE_STATUS_ICONS.planned;
}

// ================================================================
// EXPORT
// ================================================================

// Експорт для використання в інших модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PATHS,
        LAB_TYPES,
        STATUS_CONFIG,
        LECTURE_STATUS_ICONS,
        STORAGE_KEYS,
        MESSAGES,
        TIMINGS,
        GESTURES,
        getLabTypeIcon,
        getLabTypeLabel,
        getStatusConfig,
        getStatusBadge,
        getLectureStatusIcon
    };
}
