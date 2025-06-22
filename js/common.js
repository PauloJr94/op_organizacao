// Common utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('pt-BR');
}

// Storage utilities
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Animation utilities
function animateIn(element, animationClass = 'slideInLeft') {
    element.style.animation = `${animationClass} 0.3s ease`;
}

function animateOut(element, callback) {
    element.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
        if (callback) callback();
    }, 300);
}