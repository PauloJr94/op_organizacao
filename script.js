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
        this.missions = [
            { id: '1', name: 'PF', date: '2025-06-27', timeLeft: '19d 23h 57m' },
            { id: '2', name: 'PRF', date: '2025-08-15', timeLeft: '68d 15h 32m' }
        ];
        
        this.isFormVisible = false;
        this.missionToDelete = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCounter();
        this.startTimeUpdater();
    }

    bindEvents() {
        const addBtn = document.getElementById('add-mission-btn');
        const submitBtn = document.getElementById('submit-btn');
        const nameInput = document.getElementById('mission-name-input');
        const dateInput = document.getElementById('mission-date-input');
        const cancelDeleteBtn = document.getElementById('cancel-delete');
        const confirmDeleteBtn = document.getElementById('confirm-delete');
        const modal = document.getElementById('delete-modal');

        addBtn.addEventListener('click', () => this.toggleForm());
        submitBtn.addEventListener('click', () => this.addMission());
        cancelDeleteBtn.addEventListener('click', () => this.hideDeleteModal());
        confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        
        // Fechar modal clicando fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideDeleteModal();
            }
        });
        
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addMission();
        });
        
        dateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addMission();
        });

        // Event delegation para botões de delete
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
                const missionId = e.target.closest('.delete-btn').dataset.missionId;
                this.showDeleteModal(missionId);
            }
        });
    }

    showDeleteModal(missionId) {
        this.missionToDelete = missionId;
        const modal = document.getElementById('delete-modal');
        modal.classList.add('active');
    }

    hideDeleteModal() {
        const modal = document.getElementById('delete-modal');
        modal.classList.remove('active');
        this.missionToDelete = null;
    }

    confirmDelete() {
        if (this.missionToDelete) {
            this.deleteMission(this.missionToDelete);
            this.hideDeleteModal();
        }
    }

    deleteMission(missionId) {
        const missionIndex = this.missions.findIndex(mission => mission.id === missionId);
        
        if (missionIndex !== -1) {
            const missionName = this.missions[missionIndex].name;
            this.missions.splice(missionIndex, 1);
            this.renderMissions();
            this.updateCounter();
            this.showSuccess(`Missão "${missionName}" excluída com sucesso!`);
        }
    }

    toggleForm() {
        const form = document.getElementById('mission-form');
        const btn = document.getElementById('add-mission-btn');
        const btnIcon = btn.querySelector('.btn-icon');
        const btnText = btn.querySelector('span');

        this.isFormVisible = !this.isFormVisible;

        if (this.isFormVisible) {
            form.classList.add('active');
            btn.classList.add('active');
            btnText.textContent = 'Cancelar';
            
            // Focus no primeiro input
            setTimeout(() => {
                document.getElementById('mission-name-input').focus();
            }, 300);
        } else {
            form.classList.remove('active');
            btn.classList.remove('active');
            btnText.textContent = 'Nova Missão';
            this.clearForm();
        }
    }

    addMission() {
        const nameInput = document.getElementById('mission-name-input');
        const dateInput = document.getElementById('mission-date-input');
        
        const name = nameInput.value.trim();
        const date = dateInput.value;

        if (!name || !date) {
            this.showError('Por favor, preencha todos os campos');
            return;
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            this.showError('A data deve ser futura');
            return;
        }

        const mission = {
            id: Date.now().toString(),
            name: name,
            date: date,
            timeLeft: this.calculateTimeLeft(selectedDate)
        };

        this.missions.push(mission);
        this.renderMissions();
        this.updateCounter();
        this.toggleForm();
        this.showSuccess('Missão adicionada com sucesso!');
    }

    calculateTimeLeft(targetDate) {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) return '0d 0h 0m';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${days}d ${hours}h ${minutes}m`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    renderMissions() {
        const container = document.getElementById('missions-list');
        
        container.innerHTML = this.missions.map(mission => `
            <div class="mission-item" data-mission-id="${mission.id}">
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
            </div>
        `).join('');
    }

    updateCounter() {
        const counter = document.getElementById('missions-counter');
        counter.textContent = this.missions.length;
    }

    clearForm() {
        document.getElementById('mission-name-input').value = '';
        document.getElementById('mission-date-input').value = '';
    }

    startTimeUpdater() {
        setInterval(() => {
            this.missions.forEach(mission => {
                const targetDate = new Date(mission.date);
                mission.timeLeft = this.calculateTimeLeft(targetDate);
            });
            this.renderMissions();
        }, 60000); // Atualiza a cada minuto
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Remove notificação existente
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'error' ? 'background: #dc2626;' : 'background: #059669;'}
        `;

        document.body.appendChild(notification);

        // Animação de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove após 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new MissionsManager();
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
   // Calendário Funcional
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let events = JSON.parse(localStorage.getItem('studyEvents')) || {};

const renderCalendar = () => {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Atualiza o nome do mês e ano
  document.getElementById('current-month').textContent = `${monthNames[currentMonth]} ${currentYear}`;

  // Primeira posição do mês (dia da semana em que o mês começa)
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  // Quantidade de dias do mês
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();

  const calendarGrid = document.getElementById('calendar-days');
  calendarGrid.innerHTML = '';

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

// Renderizar o calendário
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
