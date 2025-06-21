document.addEventListener('DOMContentLoaded', function () {
    // 🕒 Relógio
    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const flipCards = document.querySelectorAll('.flip-card');
        flipCards[0].textContent = hours[0];
        flipCards[1].textContent = hours[1];
        flipCards[2].textContent = minutes[0];
        flipCards[3].textContent = minutes[1];
        document.querySelector('.current-date').textContent = now.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function updateTime() {
        updateClock();
    }

    setInterval(updateClock, 1000);
    updateClock();
    
    class MissionsManager {
        constructor() {
            this.missions = [];
            this.isFormVisible = false;
            this.deleteModalData = null;

            // Elementos DOM
            this.widget = document.getElementById('missions-widget');
            this.addBtn = document.getElementById('add-btn');
            this.form = document.getElementById('mission-form');
            this.closeFormBtn = document.getElementById('close-form');
            this.cancelFormBtn = document.getElementById('cancel-form');
            this.addForm = document.getElementById('add-mission-form');
            this.nameInput = document.getElementById('mission-name');
            this.dateInput = document.getElementById('mission-date');
            this.missionsList = document.getElementById('missions-list');
            this.emptyState = document.getElementById('empty-state');
            this.counter = document.getElementById('missions-counter');
            this.deleteModal = document.getElementById('delete-modal');
            this.deleteModalName = document.getElementById('delete-mission-name');
            this.modalClose = document.getElementById('modal-close');
            this.modalCancel = document.getElementById('modal-cancel');
            this.modalConfirm = document.getElementById('modal-confirm');


            // Configurar data mínima
            this.dateInput.min = new Date().toISOString().split('T')[0];

            // Event listeners
            this.addBtn.addEventListener('click', () => this.toggleForm());
            this.closeFormBtn.addEventListener('click', () => this.hideForm());
            this.cancelFormBtn.addEventListener('click', () => this.hideForm());

            // ===== CORREÇÃO AQUI: listener único e correto para submit =====
            this.addForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const name = this.nameInput.value.trim();
                const date = this.dateInput.value;

                if (!name || !date) {
                    alert("Por favor, preencha o nome e a data antes de salvar.");
                    return;
                }

                this.addMission(name, date);
                this.hideForm();
            });
            // ===============================================================

            this.modalClose.addEventListener('click', () => this.hideDeleteModal());
            this.modalCancel.addEventListener('click', () => this.hideDeleteModal());
            this.modalConfirm.addEventListener('click', () => this.confirmDelete());

            // Carregar missões salvas
            this.loadMissions();
            this.updateDisplay();
            this.startTimeUpdater();
        }

        toggleForm() {
            if (this.isFormVisible) {
                this.hideForm();
            } else {
                this.showForm();
            }
        }

        showForm() {
            this.isFormVisible = true;
            this.form.style.display = 'block';
            this.updateWidgetHeight();
            this.nameInput.focus();
        }

        hideForm() {
            this.isFormVisible = false;
            this.form.style.display = 'none';
            this.nameInput.value = '';
            this.dateInput.value = '';
            this.updateWidgetHeight();
        }

        handleSubmit(e) {
            e.preventDefault();
            const name = this.nameInput.value.trim();
            const date = this.dateInput.value;

            if (name && date) {
                this.addMission(name, date);
                this.hideForm();
            }
        }

        addMission(name, date) {
            const mission = {
                id: Date.now().toString(),
                name,
                date,
                createdAt: new Date().toISOString()
            };

            this.missions.push(mission);
            this.sortMissions();
            this.saveMissions();
            this.updateDisplay();
        }

        deleteMission(id) {
            console.log('Deleting mission with id:', id);
            this.missions = this.missions.filter(m => m.id !== id);
            this.saveMissions();
            this.updateDisplay();
        }


        sortMissions() {
            this.missions.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        showDeleteModal(mission) {
            this.deleteModalData = mission;
            this.deleteModalName.textContent = `"${mission.name}"`;
            this.deleteModal.style.display = 'flex'; // ou 'block', dependendo do seu CSS
        }

        hideDeleteModal() {
            console.log('hideDeleteModal called', this.deleteModal);
            this.deleteModalData = null;
            if (this.deleteModal) {
                this.deleteModal.style.display = 'none';
            }
        }

        confirmDelete() {
            console.log('Confirm delete clicked', this.deleteModalData);
            if (this.deleteModalData && this.deleteModalData.id) {
                this.deleteMission(this.deleteModalData.id);
                this.hideDeleteModal();
            } else {
                console.warn('No mission selected to delete or invalid id.');
            }
        }


        calculateTimeLeft(dateString) {
            const target = new Date(dateString + 'T00:00:00');
            const now = new Date();
            const diffMs = target.getTime() - now.getTime();

            if (diffMs <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
            }

            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
            const seconds = Math.floor((diffMs / 1000) % 60);

            return { days, hours, minutes, seconds, isExpired: false };
        }

        formatTimeLeft(timeLeft) {
            if (timeLeft.isExpired) return 'Expirado';

            const parts = [];
            if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
            if (timeLeft.hours > 0) parts.push(`${timeLeft.hours}h`);
            if (timeLeft.minutes > 0) parts.push(`${timeLeft.minutes}m`);

            return parts.join(' ') || '0m';
        }

        getTimeLeftColor(timeLeft) {
            if (timeLeft.isExpired) return 'time-red';
            if (timeLeft.days === 0) return 'time-yellow';
            return 'time-green';
        }

        formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        updateWidgetHeight() {
            const baseHeight = 140; // Header + botão + padding
            const formHeight = this.isFormVisible ? 120 : 0;
            const missionHeight = 70;
            const maxMissions = 4;

            const activeMissions = this.missions.filter(m => !this.calculateTimeLeft(m.date).isExpired);
            const visibleMissions = Math.min(activeMissions.length, maxMissions);
            const missionsHeight = visibleMissions * missionHeight;
            const emptyStateHeight = activeMissions.length === 0 ? 80 : 0;

            const totalHeight = baseHeight + formHeight + Math.max(missionsHeight, emptyStateHeight);
            this.widget.style.height = `${totalHeight}px`;
        }

        updateDisplay() {
            // Filtra as missões que ainda não expiraram
            const activeMissions = this.missions.filter(m => !this.calculateTimeLeft(m.date).isExpired);

            // Limpa a lista atual na interface
            this.missionsList.innerHTML = '';

            // Exibe o estado vazio se não houver missões
            if (activeMissions.length === 0) {
                this.emptyState.style.display = 'flex';
                return;
            } else {
                this.emptyState.style.display = 'none';
            }

            // Para cada missão ativa, cria um elemento visual
            activeMissions.forEach((mission) => {
                const missionEl = document.createElement('div');
                missionEl.className = 'mission-item';
                missionEl.innerHTML = `
                    <div class="mission-info">
                        <strong>${mission.name}</strong>
                        <span>${mission.date}</span>
                    </div>
                    <button class="delete-btn" data-id="${mission.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

                // Evento de exclusão
                const deleteBtn = missionEl.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => {
                    this.showDeleteModal(mission);
                });

                this.missionsList.appendChild(missionEl);
            });

            // Atualizar contador
            this.counter.textContent = activeMissions.length;

            // Limpar lista
            this.missionsList.innerHTML = '';

            if (activeMissions.length === 0) {
                // Mostrar estado vazio
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'empty-state';
                emptyDiv.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="6"/>
                        <circle cx="12" cy="12" r="2"/>
                    </svg>
                    <p>Nenhuma missão ativa</p>
                `;
                this.missionsList.appendChild(emptyDiv);
            } else {
                // Adicionar scroll se necessário
                if (activeMissions.length > 4) {
                    this.missionsList.classList.add('scrollable');
                } else {
                    this.missionsList.classList.remove('scrollable');
                }

                // Renderizar missões
                activeMissions.forEach(mission => {
                    const timeLeft = this.calculateTimeLeft(mission.date);
                    const missionDiv = document.createElement('div');
                    missionDiv.className = 'mission-item';

                    missionDiv.innerHTML = `
                        <div class="mission-header">
                            <div class="mission-name">${mission.name}</div>
                            <button class="delete-btn" data-mission-id="${mission.id}">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3,6 5,6 21,6"/>
                                    <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                            </button>
                        </div>
                        <div class="mission-date">${this.formatDate(mission.date)}</div>
                        <div class="mission-time ${this.getTimeLeftColor(timeLeft)}">${this.formatTimeLeft(timeLeft)}</div>
                    `;

                    // Adicionar event listener para o botão de deletar
                    const deleteBtn = missionDiv.querySelector('.delete-btn');
                    deleteBtn.addEventListener('click', () => this.showDeleteModal(mission));

                    this.missionsList.appendChild(missionDiv);
                });
            }

            this.updateWidgetHeight();
        }

        startTimeUpdater() {
            setInterval(() => {
                this.updateDisplay();
            }, 1000);
        }

        saveMissions() {
            localStorage.setItem('missions', JSON.stringify(this.missions));
        }

        loadMissions() {
            const saved = localStorage.getItem('missions');
            if (saved) {
                try {
                    this.missions = JSON.parse(saved);
                    this.sortMissions();
                } catch (error) {
                    console.error('Erro ao carregar missões:', error);
                    this.missions = [];
                }
            }
        }
    }

    // Inicializar quando a página carregar
    const missionManager = new MissionsManager();

    // 🧮 Contagem Regressiva
    function updateCountdown() {
        const examDate = new Date('2025-06-27T00:00:00');
        const now = new Date();
        const diff = examDate - now;
        const timerElement = document.getElementById('countdown-timer');
        if (!timerElement) return;

        if (diff <= 0) {
            timerElement.textContent = "MISSÃO INICIADA!";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        timerElement.textContent = `${days}d ${hours}h ${minutes}m`;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ⏱️ Pomodoro
    let pomodoroTime = 25 * 60;
    let isPomodoroRunning = false;
    let pomodoroInterval;
    let pomodoroCycle = 1;

    const pomodoroStart = document.getElementById('pomodoro-start');
    const pomodoroReset = document.getElementById('pomodoro-reset');
    const pomodoroTimer = document.getElementById('pomodoro-timer');
    const pomodoroCycleDisplay = document.getElementById('pomodoro-cycle');

    if (pomodoroStart && pomodoroReset) {
        pomodoroStart.addEventListener('click', function () {
            if (!isPomodoroRunning) {
                isPomodoroRunning = true;
                this.innerHTML = '<i class="fas fa-pause"></i>';
                pomodoroInterval = setInterval(function () {
                    pomodoroTime--;
                    const minutes = Math.floor(pomodoroTime / 60);
                    const seconds = pomodoroTime % 60;
                    pomodoroTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                    if (pomodoroTime <= 0) {
                        clearInterval(pomodoroInterval);
                        pomodoroTimer.textContent = "00:00";
                        pomodoroStart.innerHTML = '<i class="fas fa-play"></i>';
                        isPomodoroRunning = false;

                        alert("Tempo de estudo concluído! Hora de uma pausa.");
                        pomodoroCycle = pomodoroCycle < 4 ? pomodoroCycle + 1 : 1;
                        pomodoroCycleDisplay.textContent = `${pomodoroCycle}/4`;
                        pomodoroTime = pomodoroCycle % 2 === 0 ? 5 * 60 : 25 * 60;
                        pomodoroTimer.textContent = pomodoroCycle % 2 === 0 ? "05:00" : "25:00";
                    }
                }, 1000);
            } else {
                clearInterval(pomodoroInterval);
                isPomodoroRunning = false;
                this.innerHTML = '<i class="fas fa-play"></i>';
            }
        });

        pomodoroReset.addEventListener('click', function () {
            clearInterval(pomodoroInterval);
            isPomodoroRunning = false;
            pomodoroTime = 25 * 60;
            pomodoroCycle = 1;
            pomodoroTimer.textContent = "25:00";
            pomodoroStart.innerHTML = '<i class="fas fa-play"></i>';
            pomodoroCycleDisplay.textContent = "1/4";
        });
    }
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

// Função para renderizar o calendário
const renderCalendar = () => {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Atualiza o nome do mês e ano no cabeçalho
  document.getElementById('current-month').textContent = `${monthNames[currentMonth]} ${currentYear}`;

  // Primeira posição do mês (dia da semana em que o mês começa)
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  // Quantidade de dias no mês
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();

  const calendarGrid = document.getElementById('calendar-days');
  calendarGrid.innerHTML = ''; // Limpar a grid antes de renderizar novamente

  // Dias vazios no início do mês
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }

  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';

    // Destacar o dia atual
    if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
      dayElement.classList.add('today');
    }

    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);

    // Adicionar eventos salvos
    const eventKey = `${day}-${currentMonth + 1}-${currentYear}`;
    if (events[eventKey]) {
      events[eventKey].forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `calendar-event ${event.type}`;
        eventElement.textContent = event.desc;
        eventElement.addEventListener('click', function () {
          alert(`Evento: ${event.desc}\nData: ${day}/${currentMonth + 1}/${currentYear}\nTipo: ${event.type}`);
        });
        dayElement.appendChild(eventElement);
      });
    }

    calendarGrid.appendChild(dayElement);
  }
};

// Função para ir para o mês anterior
const goToPrevMonth = () => {
  if (currentMonth === 0) {
    currentMonth = 11; // Dezembro
    currentYear--; // Decrementar o ano
  } else {
    currentMonth--;
  }
  renderCalendar();
};

// Função para ir para o próximo mês
const goToNextMonth = () => {
  if (currentMonth === 11) {
    currentMonth = 0; // Janeiro
    currentYear++; // Incrementar o ano
  } else {
    currentMonth++;
  }
  renderCalendar();
};

// Adicionar event listeners para as setas de navegação
document.getElementById('prev-month').addEventListener('click', goToPrevMonth);
document.getElementById('next-month').addEventListener('click', goToNextMonth);

// Renderizar o calendário na inicialização
renderCalendar();

    // 📆 Missões da Semana – Com Carrossel
        const weekDays = [
            { id: 'segunda', name: 'Segunda-feira' },
            { id: 'terca', name: 'Terça-feira' },
            { id: 'quarta', name: 'Quarta-feira' },
            { id: 'quinta', name: 'Quinta-feira' },
            { id: 'sexta', name: 'Sexta-feira' },
            { id: 'sabado', name: 'Sábado' },
            { id: 'domingo', name: 'Domingo' }
    ];

const activitiesByDay = {
    segunda: ['Estudar', 'Treinar', 'Estudar', 'Flashcards', 'Questões'],
    terca: ['Estudar', 'Treinar', 'Estudar', 'Flashcards', 'Questões'],
    quarta: ['Estudar', 'Treinar', 'Estudar', 'Flashcards', 'Questões'],
    quinta: ['Estudar', 'Treinar', 'Estudar', 'Flashcards', 'Questões'],
    sexta: ['Estudar', 'Treinar', 'Estudar', 'Flashcards', 'Questões'],
    sabado: ['Revisão', 'Simulado'],
    domingo: ['Descanso', 'Leitura leve']
};

    const container = document.getElementById('weekly-tasks');
    const prevButton = document.getElementById('prevDay');
    const nextButton = document.getElementById('nextDay');
    let currentPosition = 0;

weekDays.forEach(day => {
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.id = `day-${day.id}`;

    const storedActivities = JSON.parse(localStorage.getItem(day.id) || '{}');

    const activitiesHTML = (activitiesByDay[day.id] || []).map(activity => {
        const activityId = activity.toLowerCase().replace(/\s+/g, '');
        const isCompleted = storedActivities[activityId];
        return `
            <div class="activity-item ${isCompleted ? 'completed' : ''}" data-activity="${activityId}">
                <div class="checkbox ${isCompleted ? 'checked' : ''}"></div>
                <span class="activity-name">${activity}</span>
            </div>
        `;
    }).join('');

    dayCard.innerHTML = `
        <h3 class="day-title">${day.name}</h3>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
        </div>
        <div class="activities-list">
            ${activitiesHTML}
        </div>
    `;

    container.appendChild(dayCard);
});


    container.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.checkbox');
        if (!checkbox) return;

        const activityItem = checkbox.parentElement;
        const dayCard = activityItem.closest('.day-card');
        const dayId = dayCard.id.replace('day-', '');
        const activityId = activityItem.dataset.activity;

        checkbox.classList.toggle('checked');
        activityItem.classList.toggle('completed');

        const storedActivities = JSON.parse(localStorage.getItem(dayId) || '{}');
        storedActivities[activityId] = checkbox.classList.contains('checked');
        localStorage.setItem(dayId, JSON.stringify(storedActivities));

        updateProgress(dayCard);
    });

    document.querySelectorAll('.day-card').forEach(updateProgress);

    function updateProgress(dayCard) {
        const total = dayCard.querySelectorAll('.activity-item').length;
        const completed = dayCard.querySelectorAll('.activity-item.completed').length;
        const percentage = (completed / total) * 100;
        dayCard.querySelector('.progress-fill').style.width = `${percentage}%`;
    }

function updateCarousel() {
    const card = container.querySelector('.day-card');
    if (!card) return;

    // Captura o tamanho real do card + gap entre os cards
    const cardStyle = getComputedStyle(card);
    const cardWidth = card.offsetWidth + parseInt(cardStyle.marginRight || 20);

    const containerVisibleWidth = container.offsetWidth;
    const totalCards = container.querySelectorAll('.day-card').length;
    const visibleCards = Math.floor(containerVisibleWidth / cardWidth);

    const maxPosition = totalCards - visibleCards;

    // Corrige se passar do máximo
    if (currentPosition > maxPosition) {
        currentPosition = maxPosition;
    }

    container.style.transform = `translateX(-${currentPosition * cardWidth}px)`;

    prevButton.disabled = currentPosition === 0;
    nextButton.disabled = currentPosition >= maxPosition;
}

prevButton.addEventListener('click', () => {
    if (currentPosition > 0) {
        currentPosition--;
        updateCarousel();
    }
});

nextButton.addEventListener('click', () => {
    currentPosition++;
    updateCarousel();
});

    updateCarousel();

    // 🌒 Tema
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }
});
