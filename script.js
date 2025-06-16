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

class MissionsManager {
    constructor() {
        // Lista de missões inicialmente vazia
        this.missions = [];
        
        this.isFormVisible = false;
        this.missionToDelete = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderMissions(); // Renderiza a lista de missões (inicialmente vazia)
        this.updateCounter();
        this.startTimeUpdater();
    }

    bindEvents() {
        const addBtn = document.getElementById('add-mission-btn');
        const submitBtn = document.getElementById('submit-btn');
        const nameInput = document.getElementById('mission-name-input');
        const dateInput = document.getElementById('mission-date-input');
        
        addBtn.addEventListener('click', () => this.toggleForm());
        submitBtn.addEventListener('click', () => this.addMission());
        
        // Fechar formulário ao clicar no botão de "Nova Missão"
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addMission();
        });
        
        dateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addMission();
        });

        // Delegação de eventos para o botão de deletar
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
                const missionId = e.target.closest('.delete-btn').dataset.missionId;
                this.deleteMission(missionId);
            }
        });
    }

    // Renderiza as missões na lista
    renderMissions() {
        const listContainer = document.getElementById('missions-list');
        listContainer.innerHTML = ''; // Limpa as missões existentes (sempre que renderizar)

        this.missions.forEach(mission => {
            const missionItem = document.createElement('div');
            missionItem.classList.add('mission-item');
            missionItem.setAttribute('data-mission-id', mission.id);

            missionItem.innerHTML = `
                <div class="mission-content">
                    <div class="mission-left">
                        <div class="mission-indicator"></div>
                        <div class="mission-info">
                            <h4 class="mission-name">${mission.name}</h4>
                            <div class="mission-date">
                                <svg class="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <span>${this.formatDate(mission.date)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="mission-right">
                        <div class="mission-time">
                            <svg class="clock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                            <span class="time-left">${mission.timeLeft}</span>
                        </div>
                        <button class="delete-btn" data-mission-id="${mission.id}" title="Excluir missão">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            listContainer.appendChild(missionItem);
        });
    }

    // Formata a data no formato dd/mm/yyyy
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    }

    // Calcula o tempo restante até a missão
    calculateTimeLeft(dateStr) {
        const now = new Date();
        const target = new Date(dateStr);
        const diffMs = target - now;

        if (diffMs <= 0) return "0d 0h 0m";

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

        return `${days}d ${hours}h ${minutes}m`;
    }

    // Adiciona uma nova missão
    addMission() {
        const nameInput = document.getElementById('mission-name-input');
        const dateInput = document.getElementById('mission-date-input');
        const name = nameInput.value.trim();
        const date = dateInput.value;

        if (!name || !date) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const newId = Date.now().toString(); // ID único baseado em timestamp
        const timeLeft = this.calculateTimeLeft(date);

        this.missions.push({
            id: newId,
            name,
            date,
            timeLeft
        });

        this.renderMissions(); // Atualiza o DOM
        nameInput.value = '';
        dateInput.value = '';
        this.toggleForm();
    }

    // Exclui uma missão pelo ID
    deleteMission(missionId) {
        // Filtra as missões removendo a missão com o id correspondente
        this.missions = this.missions.filter(mission => mission.id !== missionId);
        
        // Atualiza a renderização
        this.renderMissions();
    }

    // Alterna a visibilidade do formulário
    toggleForm() {
        this.isFormVisible = !this.isFormVisible;
        const form = document.getElementById('mission-form');
        form.style.display = this.isFormVisible ? 'block' : 'none';
    }

    // Inicia o contador de tempo (se precisar de mais funcionalidades de contagem, adicione aqui)
    updateCounter() {
        // Funcionalidade de contagem do tempo, se necessário
    }

    // Inicia o atualizador de tempo, se necessário
    startTimeUpdater() {
        // Funcionalidade de atualização de tempo, se necessário
    }
}

// Inicializa a classe quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const missionsManager = new MissionsManager();
});


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
