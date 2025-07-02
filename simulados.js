

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

// Configuração do Firebase
const firebaseConfig = {
    // Suas configurações do Firebase aqui
    apiKey: "sua-api-key",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "sua-app-id"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variáveis globais
let simulados = [];
let simuladosFuturos = [];
let disciplinas = [];
let usuarios = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    carregarDisciplinas();
    carregarUsuarios();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Formulário principal
    document.getElementById('simuladoForm').addEventListener('submit', adicionarSimulado);
    
    // Formulário de simulados futuros
    document.getElementById('futuroFormElement').addEventListener('submit', adicionarSimuladoFuturo);
    
    // Cálculo automático de porcentagem
    document.getElementById('questoesRespondidas').addEventListener('input', calcularPorcentagem);
    document.getElementById('questoesAcertadas').addEventListener('input', calcularPorcentagem);
}

// Carregar dados do localStorage
function carregarDados() {
    const simuladosSalvos = localStorage.getItem('simulados');
    const futurosSalvos = localStorage.getItem('simuladosFuturos');
    
    if (simuladosSalvos) {
        simulados = JSON.parse(simuladosSalvos);
    }
    
    if (futurosSalvos) {
        simuladosFuturos = JSON.parse(futurosSalvos);
    }
    
    atualizarInterface();
}

// Carregar disciplinas do Firebase
async function carregarDisciplinas() {
    try {
        const snapshot = await db.collection('disciplinas').get();
        disciplinas = [];
        
        snapshot.forEach(doc => {
            disciplinas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        preencherSelectDisciplinas();
    } catch (error) {
        console.error('Erro ao carregar disciplinas:', error);
        // Fallback com disciplinas padrão
        disciplinas = [
            { nome: 'Português' },
            { nome: 'Matemática' },
            { nome: 'Direito Constitucional' },
            { nome: 'Direito Administrativo' },
            { nome: 'Direito Penal' },
            { nome: 'Informática' },
            { nome: 'Atualidades' }
        ];
        preencherSelectDisciplinas();
    }
}

// Carregar usuários do Firebase
async function carregarUsuarios() {
    try {
        const snapshot = await db.collection('usuarios')
            .where('compartilharRanking', '==', true)
            .orderBy('mediaSimulados', 'desc')
            .limit(10)
            .get();
        
        usuarios = [];
        
        snapshot.forEach(doc => {
            const userData = doc.data();
            usuarios.push({
                id: doc.id,
                nome: userData.nome,
                media: userData.mediaSimulados || 0,
                totalSimulados: userData.totalSimulados || 0
            });
        });
        
        exibirRanking();
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        // Fallback com dados simulados
        usuarios = [
            { nome: 'João Silva', media: 87.5, totalSimulados: 25 },
            { nome: 'Maria Santos', media: 83.2, totalSimulados: 22 },
            { nome: 'Carlos Oliveira', media: 79.8, totalSimulados: 18 },
            { nome: 'Ana Costa', media: 76.4, totalSimulados: 15 },
            { nome: 'Pedro Lima', media: 74.1, totalSimulados: 12 }
        ];
        exibirRanking();
    }
}

// Preencher selects de disciplinas
function preencherSelectDisciplinas() {
    const selects = ['disciplinaSelect', 'disciplinaFuturo'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Selecione a disciplina</option>';
        
        disciplinas.forEach(disciplina => {
            const option = document.createElement('option');
            option.value = disciplina.nome;
            option.textContent = disciplina.nome;
            select.appendChild(option);
        });
    });
}

// Toggle formulário de adição
function toggleAddForm() {
    const form = document.getElementById('addForm');
    form.classList.toggle('hidden');
}

// Toggle formulário de simulados futuros
function toggleFuturoForm() {
    const form = document.getElementById('futuroForm');
    form.classList.toggle('hidden');
}

// Toggle campos de simulado respondido
function toggleRespondidoFields() {
    const checkbox = document.getElementById('simuladoRespondido');
    const fields = document.getElementById('respondidoFields');
    
    if (checkbox.checked) {
        fields.classList.remove('hidden');
    } else {
        fields.classList.add('hidden');
        // Limpar campos
        document.getElementById('questoesRespondidas').value = '';
        document.getElementById('questoesAcertadas').value = '';
        document.getElementById('tempoGasto').value = '';
        document.getElementById('porcentagemCalculada').textContent = '0%';
    }
}

// Calcular porcentagem automaticamente
function calcularPorcentagem() {
    const respondidas = parseInt(document.getElementById('questoesRespondidas').value) || 0;
    const acertadas = parseInt(document.getElementById('questoesAcertadas').value) || 0;
    
    if (respondidas > 0) {
        const porcentagem = Math.round((acertadas / respondidas) * 100);
        document.getElementById('porcentagemCalculada').textContent = porcentagem + '%';
    } else {
        document.getElementById('porcentagemCalculada').textContent = '0%';
    }
}

// Adicionar simulado
function adicionarSimulado(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const nome = document.getElementById('nomeSimulado').value;
    const data = document.getElementById('dataSimulado').value;
    const totalQuestoes = parseInt(document.getElementById('totalQuestoes').value);
    const disciplina = document.getElementById('disciplinaSelect').value;
    const tempoPrevisto = document.getElementById('tempoPrevisto').value;
    const respondido = document.getElementById('simuladoRespondido').checked;
    
    const simulado = {
        id: Date.now().toString(),
        nome,
        data,
        totalQuestoes,
        disciplina,
        tempoPrevisto,
        respondido,
        dataAdicao: new Date().toISOString()
    };
    
    if (respondido) {
        const questoesRespondidas = parseInt(document.getElementById('questoesRespondidas').value) || 0;
        const questoesAcertadas = parseInt(document.getElementById('questoesAcertadas').value) || 0;
        const tempoGasto = document.getElementById('tempoGasto').value;
        
        simulado.questoesRespondidas = questoesRespondidas;
        simulado.questoesAcertadas = questoesAcertadas;
        simulado.questoesErradas = questoesRespondidas - questoesAcertadas;
        simulado.tempoGasto = tempoGasto;
        simulado.nota = questoesRespondidas > 0 ? Math.round((questoesAcertadas / questoesRespondidas) * 100) : 0;
    }
    
    simulados.push(simulado);
    salvarDados();
    atualizarInterface();
    
    // Limpar formulário
    form.reset();
    document.getElementById('addForm').classList.add('hidden');
    document.getElementById('respondidoFields').classList.add('hidden');
    document.getElementById('porcentagemCalculada').textContent = '0%';
}

// Adicionar simulado futuro
function adicionarSimuladoFuturo(e) {
    e.preventDefault();
    
    const form = e.target;
    
    const simuladoFuturo = {
        id: Date.now().toString(),
        nome: document.getElementById('nomeFuturo').value,
        data: document.getElementById('dataFuturo').value,
        disciplina: document.getElementById('disciplinaFuturo').value,
        tempoPrevisto: document.getElementById('tempoPrevistoFuturo').value,
        dataAdicao: new Date().toISOString()
    };
    
    simuladosFuturos.push(simuladoFuturo);
    salvarDados();
    atualizarInterface();
    
    // Limpar formulário
    form.reset();
    document.getElementById('futuroForm').classList.add('hidden');
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('simulados', JSON.stringify(simulados));
    localStorage.setItem('simuladosFuturos', JSON.stringify(simuladosFuturos));
    exportarDadosHome();
}

// Exportar dados para home.html
function exportarDadosHome() {
    const simuladosRespondidos = simulados.filter(s => s.respondido);
    const totalQuestoes = simuladosRespondidos.reduce((total, sim) => total + (sim.questoesRespondidas || 0), 0);
    const totalAcertos = simuladosRespondidos.reduce((total, sim) => total + (sim.questoesAcertadas || 0), 0);
    const media = simuladosRespondidos.length > 0 ? 
        simuladosRespondidos.reduce((sum, sim) => sum + (sim.nota || 0), 0) / simuladosRespondidos.length : 0;
    const ultimoSimulado = simuladosRespondidos.length > 0 ? 
        simuladosRespondidos[simuladosRespondidos.length - 1] : null;
    const mediaAcertos = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;
    
    const dadosHome = {
        ultimaNota: ultimoSimulado?.nota || 0,
        totalQuestoes,
        mediaAcertos,
        ranking: usuarios.slice(0, 3),
        posicaoRanking: Math.floor(Math.random() * 5) + 1,
        totalSimulados: simuladosRespondidos.length,
        mediaGeral: Math.round(media)
    };
    
    localStorage.setItem('dadosHome', JSON.stringify(dadosHome));
}

// Atualizar interface
function atualizarInterface() {
    atualizarEstatisticas();
    exibirAgenda();
    exibirHistorico();
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const simuladosRespondidos = simulados.filter(s => s.respondido);
    const total = simuladosRespondidos.length;
    const media = total > 0 ? 
        simuladosRespondidos.reduce((sum, sim) => sum + (sim.nota || 0), 0) / total : 0;
    const ultimo = simuladosRespondidos.length > 0 ? 
        simuladosRespondidos[simuladosRespondidos.length - 1] : null;
    const penultimo = simuladosRespondidos.length > 1 ? 
        simuladosRespondidos[simuladosRespondidos.length - 2] : null;
    
    // Calcular tendência
    let tendencia = 'estavel';
    let tendenciaIcon = 'fas fa-minus';
    let tendenciaClass = 'tendencia-estavel';
    
    if (ultimo && penultimo) {
        if (ultimo.nota > penultimo.nota) {
            tendencia = 'subindo';
            tendenciaIcon = 'fas fa-arrow-up';
            tendenciaClass = 'tendencia-subindo';
        } else if (ultimo.nota < penultimo.nota) {
            tendencia = 'descendo';
            tendenciaIcon = 'fas fa-arrow-down';
            tendenciaClass = 'tendencia-descendo';
        }
    }
    
    // Atualizar DOM
    document.getElementById('totalSimulados').textContent = total;
    document.getElementById('mediaGeral').textContent = Math.round(media) + '%';
    document.getElementById('ultimoSimulado').textContent = (ultimo?.nota || 0) + '%';
    
    const tendenciaDisplay = document.getElementById('tendenciaDisplay');
    tendenciaDisplay.innerHTML = `
        <i class="${tendenciaIcon} tendencia-icon ${tendenciaClass}"></i>
        <span class="tendencia-text ${tendenciaClass}">${tendencia.charAt(0).toUpperCase() + tendencia.slice(1)}</span>
    `;
}

// Exibir agenda de simulados futuros
function exibirAgenda() {
    const agendaList = document.getElementById('agendaList');
    
    if (simuladosFuturos.length === 0) {
        agendaList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>Nenhum simulado agendado</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por data
    const futurosOrdenados = simuladosFuturos.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    agendaList.innerHTML = futurosOrdenados.map(futuro => `
        <div class="agenda-item">
            <div class="agenda-content">
                <div class="agenda-info">
                    <h3>${futuro.nome}</h3>
                    <p>${futuro.disciplina}</p>
                </div>
                <div class="agenda-date">
                    <p>${formatarData(futuro.data)}</p>
                    <p>${futuro.tempoPrevisto}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Exibir ranking de usuários
function exibirRanking() {
    const rankingList = document.getElementById('rankingList');
    
    if (usuarios.length === 0) {
        rankingList.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Carregando ranking...</p>
            </div>
        `;
        return;
    }
    
    rankingList.innerHTML = usuarios.map((usuario, index) => `
        <div class="ranking-item">
            <div class="ranking-left">
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-info">
                    <h3>${usuario.nome}</h3>
                    <p>${usuario.totalSimulados} simulados</p>
                </div>
            </div>
            <div class="ranking-right">
                <p>${usuario.media.toFixed(1)}%</p>
                ${index < 3 ? '<i class="fas fa-medal ranking-medal"></i>' : ''}
            </div>
        </div>
    `).join('');
}

// Exibir histórico de simulados
function exibirHistorico() {
    const historicoSection = document.getElementById('historicoSection');
    const historicoList = document.getElementById('historicoList');
    
    const simuladosRespondidos = simulados.filter(s => s.respondido);
    
    if (simuladosRespondidos.length === 0) {
        historicoSection.classList.add('hidden');
        return;
    }
    
    historicoSection.classList.remove('hidden');
    
    // Ordenar por data (mais recente primeiro)
    const simuladosOrdenados = simuladosRespondidos.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    historicoList.innerHTML = simuladosOrdenados.map(simulado => `
        <div class="historico-item">
            <div class="historico-header">
                <h3>${simulado.nome}</h3>
                <span class="historico-nota">${simulado.nota}%</span>
            </div>
            <div class="historico-details">
                <p><strong>Disciplina:</strong> ${simulado.disciplina}</p>
                <p><strong>Data:</strong> ${formatarData(simulado.data)}</p>
                <p><strong>Acertos:</strong> ${simulado.questoesAcertadas}/${simulado.questoesRespondidas}</p>
                <p><strong>Tempo:</strong> ${simulado.tempoGasto}</p>
            </div>
        </div>
    `).join('');
}

// Formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Funções para integração com home.html
function obterDadosHome() {
    const dados = localStorage.getItem('dadosHome');
    return dados ? JSON.parse(dados) : null;
}

// Exportar função para uso global
window.obterDadosHome = obterDadosHome;