
    const btn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');

    btn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

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