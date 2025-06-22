let currentMonth = new Date().getMonth(); // Mês atual
let currentYear = new Date().getFullYear(); // Ano atual
let events = JSON.parse(localStorage.getItem('studyEvents')) || {};

// Estado da aplicação
const appState = {
    isSidebarOpen: false,
    activeTab: null,
    data: {
        rotinas: [],
        estudos: [],
        simulados: [],
        treinos: [],
        materiais: [],
        progresso: [],
        configuracoes: []
    }
};

// Elementos DOM
const elements = {
    hamburgerBtn: document.getElementById('hamburger-btn'),
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    closeBtn: document.getElementById('close-btn'),
    welcomeScreen: document.getElementById('welcome-screen'),
    menuItems: document.querySelectorAll('.menu-item'),
    closeTabBtns: document.querySelectorAll('.close-tab-btn'),
    addBtns: document.querySelectorAll('.add-btn')
};

// Utilitários
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function formatDate() {
    return new Date().toLocaleDateString('pt-BR');
}

function saveToLocalStorage() {
    localStorage.setItem('studyPlanData', JSON.stringify(appState.data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('studyPlanData');
    if (saved) {
        appState.data = JSON.parse(saved);
        updateAllCounts();
    }
}

// Controle da Sidebar
function toggleSidebar() {
    appState.isSidebarOpen = !appState.isSidebarOpen;
    updateSidebarUI();
}

function closeSidebar() {
    appState.isSidebarOpen = false;
    updateSidebarUI();
}

function updateSidebarUI() {
    if (appState.isSidebarOpen) {
        elements.sidebar.classList.add('active');
        elements.overlay.classList.add('active');
        elements.hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        elements.sidebar.classList.remove('active');
        elements.overlay.classList.remove('active');
        elements.hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Controle das Abas
function openTab(tabName) {
    // Fechar aba atual se houver
    if (appState.activeTab) {
        document.getElementById(`tab-${appState.activeTab}`).style.display = 'none';
        document.querySelector(`[data-tab="${appState.activeTab}"]`).classList.remove('active');
    }

    // Abrir nova aba
    appState.activeTab = tabName;
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    elements.welcomeScreen.style.display = 'none';
    
    // Fechar sidebar
    closeSidebar();
    
    // Renderizar conteúdo da aba
    renderTabContent(tabName);
}

function closeTab() {
    if (appState.activeTab) {
        document.getElementById(`tab-${appState.activeTab}`).style.display = 'none';
        document.querySelector(`[data-tab="${appState.activeTab}"]`).classList.remove('active');
        appState.activeTab = null;
        elements.welcomeScreen.style.display = 'block';
    }
}

// Gerenciamento de Itens
function addItem(tabName) {
    const input = document.getElementById(`input-${tabName}`);
    const text = input.value.trim();
    
    if (!text) return;

    const newItem = {
        id: generateId(),
        text: text,
        completed: false,
        date: formatDate()
    };

    appState.data[tabName].push(newItem);
    input.value = '';
    
    renderTabContent(tabName);
    updateCount(tabName);
    saveToLocalStorage();
}

function removeItem(tabName, itemId) {
    appState.data[tabName] = appState.data[tabName].filter(item => item.id !== itemId);
    renderTabContent(tabName);
    updateCount(tabName);
    saveToLocalStorage();
}

function toggleComplete(tabName, itemId) {
    const item = appState.data[tabName].find(item => item.id === itemId);
    if (item) {
        item.completed = !item.completed;
        renderTabContent(tabName);
        saveToLocalStorage();
    }
}

// Renderização
function renderTabContent(tabName) {
    const items = appState.data[tabName];
    const listElement = document.getElementById(`list-${tabName}`);
    const statsElement = document.getElementById(`stats-${tabName}`);

    // Renderizar lista de itens
    if (items.length === 0) {
        listElement.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>Nenhum item adicionado ainda.</p>
                <p class="empty-subtitle">Use o campo acima para adicionar seu primeiro item.</p>
            </div>
        `;
        statsElement.style.display = 'none';
    } else {
        listElement.innerHTML = items.map((item, index) => `
            <div class="item-card ${item.completed ? 'completed' : ''}" style="animation-delay: ${index * 100}ms">
                <div class="item-content">
                    <div class="item-left">
                        <button class="complete-btn ${item.completed ? 'completed' : ''}" 
                                onclick="toggleComplete('${tabName}', '${item.id}')">
                        </button>
                        <div class="item-info">
                            <div class="item-text ${item.completed ? 'completed' : ''}">${item.text}</div>
                            <div class="item-date">Adicionado em ${item.date}</div>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="delete-btn" onclick="removeItem('${tabName}', '${item.id}')" title="Remover item">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Renderizar estatísticas
        const total = items.length;
        const completed = items.filter(item => item.completed).length;
        const pending = total - completed;

        statsElement.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${total}</div>
                <div class="stat-label">Total</div>
            </div>
            <div class="stat-card completed">
                <div class="stat-number">${completed}</div>
                <div class="stat-label">Concluídos</div>
            </div>
            <div class="stat-card pending">
                <div class="stat-number">${pending}</div>
                <div class="stat-label">Pendentes</div>
            </div>
        `;
        statsElement.style.display = 'grid';
    }
}

function updateCount(tabName) {
    const count = appState.data[tabName].length;
    const countElement = document.getElementById(`count-${tabName}`);
    if (countElement) {
        countElement.textContent = count;
    }
}

function updateAllCounts() {
    Object.keys(appState.data).forEach(tabName => {
        updateCount(tabName);
    });
}

// Event Listeners
function setupEventListeners() {
    // Sidebar controls
    elements.hamburgerBtn.addEventListener('click', toggleSidebar);
    elements.closeBtn.addEventListener('click', closeSidebar);
    elements.overlay.addEventListener('click', closeSidebar);

    // Menu items
    elements.menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            openTab(tabName);
        });
    });

    // Close tab buttons
    elements.closeTabBtns.forEach(btn => {
        btn.addEventListener('click', closeTab);
    });

    // Add buttons
    elements.addBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            addItem(tabName);
        });
    });

    // Input enter key
    document.querySelectorAll('.add-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const tabName = input.id.replace('input-', '');
                addItem(tabName);
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC para fechar sidebar ou aba
        if (e.key === 'Escape') {
            if (appState.isSidebarOpen) {
                closeSidebar();
            } else if (appState.activeTab) {
                closeTab();
            }
        }
    });

    // Responsive: fechar sidebar ao redimensionar
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && appState.isSidebarOpen) {
            closeSidebar();
        }
    });
}

// Inicialização
function init() {
    loadFromLocalStorage();
    setupEventListeners();
    updateAllCounts();
    
    // Animação inicial
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
}

// Funções globais para uso nos event handlers inline
window.toggleComplete = toggleComplete;
window.removeItem = removeItem;

// Inicializar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}