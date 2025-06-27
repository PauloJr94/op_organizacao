// FitTracker Pro - script.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos globais
    const tabContents = document.querySelectorAll('.tab-content');
    const navButtons = document.querySelectorAll('.nav-btn');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const modalButtons = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-btn');
    
    // Dados da aplicação
    let appData = {
        workouts: [],
        assessments: [],
        goals: [],
        schedule: {},
        stats: {
            totalWorkouts: 0,
            totalTime: 0,
            currentStreak: 0,
            currentWeight: null
        }
    };

    // Inicialização
    init();

    // Funções de inicialização
    function init() {
        // Carrega dados salvos
        loadData();
        
        // Configura eventos
        setupEventListeners();
        
        // Mostra a tab ativa
        showTab('dashboard');
        
        // Atualiza a UI
        updateUI();
        
        // Gera dados de exemplo se não houver dados salvos
        if (appData.workouts.length === 0) {
            generateSampleData();
            saveData();
            updateUI();
        }
    }

    function setupEventListeners() {
        // Navegação por tabs
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                showTab(tabId);
                
                // Atualiza estado ativo dos botões
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        // Menu mobile
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        // Modais
        modalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modalId = button.getAttribute('data-modal');
                openModal(modalId);
            });
        });

        // Fechar modais
        closeButtons.forEach(button => {
            button.addEventListener('click', closeAllModals);
        });

        // Fechar modais ao clicar fora
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeAllModals();
                }
            });
        });

        // Formulário de treino
        document.getElementById('workout-form')?.addEventListener('submit', handleWorkoutSubmit);
        
        // Botão para adicionar exercício
        document.getElementById('add-exercise-btn')?.addEventListener('click', addExerciseField);
        
        // Formulário de avaliação
        document.getElementById('assessment-form')?.addEventListener('submit', handleAssessmentSubmit);
        
        // Formulário de meta
        document.getElementById('goal-form')?.addEventListener('submit', handleGoalSubmit);
        
        // Mudança no tipo de meta
        document.getElementById('goal-type')?.addEventListener('change', updateGoalUnit);
        
        // Filtros de treino
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterWorkouts(btn.getAttribute('data-filter'));
            });
        });
        
        // Adicionar treino ao dia
        document.getElementById('add-workout-to-day')?.addEventListener('click', addWorkoutToDay);
    }

    // Funções de UI
    function showTab(tabId) {
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
        
        // Atualiza conteúdo específico da tab
        switch(tabId) {
            case 'dashboard':
                updateDashboard();
                break;
            case 'workouts':
                updateWorkoutsTab();
                break;
            case 'progress':
                updateProgressTab();
                break;
            case 'goals':
                updateGoalsTab();
                break;
            case 'assessments':
                updateAssessmentsTab();
                break;
        }
    }

    function toggleMobileMenu() {
        mobileNav.classList.toggle('active');
        mobileMenuBtn.textContent = mobileNav.classList.contains('active') ? '✕' : '☰';
    }

    function openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Inicializações específicas do modal
        if (modalId === 'workout-modal') {
            initWorkoutModal();
        } else if (modalId === 'day-schedule-modal') {
            initDayScheduleModal();
        }
    }

    function closeAllModals() {
        modals.forEach(modal => modal.classList.remove('active'));
        document.body.style.overflow = 'auto';
    }

    // Funções de dados
    function loadData() {
        const savedData = localStorage.getItem('fitTrackerData');
        if (savedData) {
            appData = JSON.parse(savedData);
        }
    }

    function saveData() {
        localStorage.setItem('fitTrackerData', JSON.stringify(appData));
    }

    function generateSampleData() {
        // Treinos de exemplo
        appData.workouts = [
            {
                id: 'w1',
                name: 'Treino de Peito e Tríceps',
                description: 'Treino focado em peito e tríceps para ganho de massa',
                duration: 45,
                difficulty: 'medium',
                category: 'strength',
                exercises: [
                    { name: 'Supino Reto', sets: 4, reps: '10-12', rest: '60s' },
                    { name: 'Crucifixo', sets: 3, reps: '12', rest: '45s' },
                    { name: 'Tríceps Corda', sets: 3, reps: '12-15', rest: '45s' }
                ],
                completedDates: ['2023-05-10', '2023-05-17']
            },
            {
                id: 'w2',
                name: 'Corrida Leve',
                description: 'Corrida de intensidade moderada para condicionamento',
                duration: 30,
                difficulty: 'easy',
                category: 'cardio',
                exercises: [
                    { name: 'Corrida', sets: 1, reps: '30min', rest: '0' }
                ],
                completedDates: ['2023-05-11', '2023-05-13']
            },
            {
                id: 'w3',
                name: 'Yoga Matinal',
                description: 'Sessão de yoga para flexibilidade e relaxamento',
                duration: 40,
                difficulty: 'easy',
                category: 'flexibility',
                exercises: [
                    { name: 'Saudação ao Sol', sets: 3, reps: '5min', rest: '1min' },
                    { name: 'Posturas de Equilíbrio', sets: 1, reps: '15min', rest: '0' }
                ],
                completedDates: ['2023-05-12']
            }
        ];

        // Avaliações de exemplo
        appData.assessments = [
            {
                date: '2023-05-01',
                weight: 78.5,
                bodyfat: 18.2,
                muscle: 62.3,
                measurements: {
                    chest: 98,
                    waist: 84,
                    hips: 92,
                    arms: 32,
                    thighs: 55
                },
                notes: 'Início do programa de treino'
            },
            {
                date: '2023-05-15',
                weight: 77.8,
                bodyfat: 17.5,
                muscle: 63.1,
                measurements: {
                    chest: 99,
                    waist: 83,
                    hips: 91,
                    arms: 32.5,
                    thighs: 55.5
                },
                notes: 'Bom progresso na musculatura'
            }
        ];

        // Metas de exemplo
        appData.goals = [
            {
                id: 'g1',
                type: 'water',
                target: 8,
                unit: 'copos',
                progress: 5
            },
            {
                id: 'g2',
                type: 'steps',
                target: 10000,
                unit: 'passos',
                progress: 7500
            },
            {
                id: 'g3',
                type: 'workout',
                target: 1,
                unit: 'treinos',
                progress: 1
            }
        ];

        // Agenda de exemplo
        appData.schedule = {
            '2023-05-15': ['w1', 'w3'],
            '2023-05-16': ['w2'],
            '2023-05-17': ['w1']
        };

        // Estatísticas calculadas
        updateStats();
    }

    function updateStats() {
        // Calcula totais de treinos e tempo
        appData.stats.totalWorkouts = appData.workouts.reduce((total, workout) => {
            return total + workout.completedDates.length;
        }, 0);
        
        appData.stats.totalTime = appData.workouts.reduce((total, workout) => {
            return total + (workout.duration * workout.completedDates.length);
        }, 0);
        
        // Pega o peso mais recente
        if (appData.assessments.length > 0) {
            const latestAssessment = appData.assessments.reduce((latest, current) => {
                return new Date(current.date) > new Date(latest.date) ? current : latest;
            });
            appData.stats.currentWeight = latestAssessment.weight;
        }
        
        // Calcula sequência atual (simplificado)
        appData.stats.currentStreak = Math.floor(Math.random() * 10) + 1; // Exemplo aleatório
    }

    // Funções de atualização de UI
    function updateUI() {
        updateStats();
        updateDashboard();
        updateWorkoutsTab();
        updateProgressTab();
        updateGoalsTab();
        updateAssessmentsTab();
    }

    function updateDashboard() {
        // Atualiza estatísticas
        document.getElementById('total-workouts').textContent = appData.stats.totalWorkouts;
        document.getElementById('total-time').textContent = Math.floor(appData.stats.totalTime / 60) + 'h';
        document.getElementById('avg-time').textContent = Math.round(appData.stats.totalTime / appData.stats.totalWorkouts) + 'min médio';
        document.getElementById('current-streak').textContent = appData.stats.currentStreak;
        document.getElementById('current-weight').textContent = appData.stats.currentWeight ? appData.stats.currentWeight + 'kg' : '--';
        
        // Atualiza calendário
        updateCalendar();
        
        // Atualiza gráfico de progresso (simulado)
        updateProgressChart();
    }

    function updateCalendar() {
        const calendarGrid = document.getElementById('weekly-calendar');
        calendarGrid.innerHTML = '';
        
        const today = new Date();
        const currentDay = today.getDay(); // 0 (Domingo) a 6 (Sábado)
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - currentDay); // Vai para Domingo
        
        // Cria os dias da semana
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Destaca o dia atual
            if (i === currentDay) {
                dayElement.classList.add('today');
            }
            
            // Formata a data como YYYY-MM-DD para comparação
            const dateStr = formatDate(dayDate);
            
            // Verifica se há treinos agendados para este dia
            const hasWorkouts = appData.schedule[dateStr] && appData.schedule[dateStr].length > 0;
            
            dayElement.innerHTML = `
                <div class="day-header">
                    <div class="day-name">${getDayName(i)}</div>
                    <div class="day-number">${dayDate.getDate()}</div>
                </div>
                ${hasWorkouts ? '<div class="day-workouts">' + appData.schedule[dateStr].length + ' treino(s)</div>' : ''}
            `;
            
            // Adiciona evento de clique para mostrar os treinos do dia
            dayElement.addEventListener('click', () => {
                openDayScheduleModal(dateStr, dayDate);
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }

    function updateProgressChart() {
        // Simulação de gráfico - na prática você usaria uma biblioteca como Chart.js
        const chartElement = document.getElementById('progress-chart');
        chartElement.innerHTML = '<div class="chart-placeholder">Gráfico de progresso semanal (simulado)</div>';
    }

    function updateWorkoutsTab() {
        const workoutsGrid = document.getElementById('workouts-grid');
        workoutsGrid.innerHTML = '';
        
        appData.workouts.forEach(workout => {
            const workoutElement = document.createElement('div');
            workoutElement.className = `workout-card ${workout.category}`;
            workoutElement.innerHTML = `
                <div class="workout-header">
                    <h3>${workout.name}</h3>
                    <span class="workout-duration">${workout.duration} min</span>
                </div>
                <div class="workout-details">
                    <span class="workout-difficulty ${workout.difficulty}">${getDifficultyText(workout.difficulty)}</span>
                    <span class="workout-category ${workout.category}">${getCategoryIcon(workout.category)} ${getCategoryText(workout.category)}</span>
                </div>
                <p class="workout-description">${workout.description}</p>
                <div class="workout-actions">
                    <button class="secondary-btn" data-workout-id="${workout.id}">Editar</button>
                    <button class="primary-btn" data-workout-id="${workout.id}">Iniciar</button>
                </div>
            `;
            
            workoutsGrid.appendChild(workoutElement);
        });
        
        // Configura eventos dos botões
        document.querySelectorAll('.workout-actions button').forEach(button => {
            button.addEventListener('click', (e) => {
                const workoutId = button.getAttribute('data-workout-id');
                if (button.classList.contains('primary-btn')) {
                    startWorkout(workoutId);
                } else {
                    editWorkout(workoutId);
                }
                e.stopPropagation();
            });
        });
    }

    function filterWorkouts(filter) {
        const workoutCards = document.querySelectorAll('.workout-card');
        
        workoutCards.forEach(card => {
            if (filter === 'all' || card.classList.contains(filter)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function updateProgressTab() {
        const progressDetails = document.getElementById('progress-details');
        
        if (appData.assessments.length === 0) {
            progressDetails.innerHTML = '<p class="empty-state">Nenhuma avaliação registrada ainda.</p>';
            return;
        }
        
        // Ordena avaliações por data (mais recente primeiro)
        const sortedAssessments = [...appData.assessments].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        let html = '<div class="progress-overview">';
        
        // Peso
        html += '<div class="progress-metric">';
        html += '<h3>Peso (kg)</h3>';
        html += '<div class="progress-values">';
        sortedAssessments.forEach(assessment => {
            html += `<div class="progress-value">
                <span class="progress-date">${formatDisplayDate(assessment.date)}</span>
                <span class="progress-number">${assessment.weight}</span>
            </div>`;
        });
        html += '</div></div>';
        
        // Gordura corporal
        html += '<div class="progress-metric">';
        html += '<h3>Gordura Corporal (%)</h3>';
        html += '<div class="progress-values">';
        sortedAssessments.forEach(assessment => {
            html += `<div class="progress-value">
                <span class="progress-date">${formatDisplayDate(assessment.date)}</span>
                <span class="progress-number">${assessment.bodyfat || '--'}</span>
            </div>`;
        });
        html += '</div></div>';
        
        html += '</div>';
        
        progressDetails.innerHTML = html;
    }

    function updateGoalsTab() {
        const goalsContainer = document.getElementById('goals-container');
        
        if (appData.goals.length === 0) {
            goalsContainer.innerHTML = '<p class="empty-state">Nenhuma meta definida ainda.</p>';
            return;
        }
        
        let html = '';
        appData.goals.forEach(goal => {
            const progressPercent = Math.min(100, (goal.progress / goal.target) * 100);
            
            html += `
            <div class="goal-card">
                <div class="goal-header">
                    <div class="goal-icon">${getGoalIcon(goal.type)}</div>
                    <div class="goal-info">
                        <h3>${getGoalTypeText(goal.type)}</h3>
                        <div class="goal-target">${goal.progress} / ${goal.target} ${goal.unit}</div>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="goal-actions">
                    <button class="secondary-btn" data-goal-id="${goal.id}">Editar</button>
                    <button class="danger-btn" data-goal-id="${goal.id}">Remover</button>
                </div>
            </div>`;
        });
        
        goalsContainer.innerHTML = html;
        
        // Configura eventos dos botões
        document.querySelectorAll('.goal-actions button').forEach(button => {
            button.addEventListener('click', (e) => {
                const goalId = button.getAttribute('data-goal-id');
                if (button.classList.contains('danger-btn')) {
                    removeGoal(goalId);
                } else {
                    editGoal(goalId);
                }
                e.stopPropagation();
            });
        });
    }

    function updateAssessmentsTab() {
        const assessmentsContainer = document.getElementById('assessments-container');
        
        if (appData.assessments.length === 0) {
            assessmentsContainer.innerHTML = '<p class="empty-state">Nenhuma avaliação registrada ainda.</p>';
            return;
        }
        
        // Ordena avaliações por data (mais recente primeiro)
        const sortedAssessments = [...appData.assessments].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        let html = '';
        sortedAssessments.forEach(assessment => {
            html += `
            <div class="assessment-card">
                <div class="assessment-header">
                    <h3>${formatDisplayDate(assessment.date)}</h3>
                    <button class="danger-btn" data-assessment-date="${assessment.date}">Remover</button>
                </div>
                <div class="assessment-metrics">
                    <div class="metric">
                        <span class="metric-label">Peso</span>
                        <span class="metric-value">${assessment.weight} kg</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Gordura</span>
                        <span class="metric-value">${assessment.bodyfat || '--'}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Músculo</span>
                        <span class="metric-value">${assessment.muscle || '--'} kg</span>
                    </div>
                </div>
                ${assessment.notes ? `<div class="assessment-notes"><p>${assessment.notes}</p></div>` : ''}
            </div>`;
        });
        
        assessmentsContainer.innerHTML = html;
        
        // Configura eventos dos botões
        document.querySelectorAll('.danger-btn[data-assessment-date]').forEach(button => {
            button.addEventListener('click', (e) => {
                const assessmentDate = button.getAttribute('data-assessment-date');
                removeAssessment(assessmentDate);
                e.stopPropagation();
            });
        });
    }

    // Funções de manipulação de dados
    function handleWorkoutSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const workoutId = form.getAttribute('data-workout-id') || generateId();
        const isEdit = form.hasAttribute('data-workout-id');
        
        // Coleta dados do formulário
        const workout = {
            id: workoutId,
            name: document.getElementById('workout-name').value,
            description: document.getElementById('workout-description').value,
            duration: parseInt(document.getElementById('workout-duration').value),
            difficulty: document.getElementById('workout-difficulty').value,
            category: document.getElementById('workout-category').value,
            exercises: []
        };
        
        // Coleta exercícios
        const exerciseElements = document.querySelectorAll('.exercise-item');
        exerciseElements.forEach(exerciseEl => {
            workout.exercises.push({
                name: exerciseEl.querySelector('.exercise-name').value,
                sets: parseInt(exerciseEl.querySelector('.exercise-sets').value),
                reps: exerciseEl.querySelector('.exercise-reps').value,
                rest: exerciseEl.querySelector('.exercise-rest').value
            });
        });
        
        // Adiciona ou atualiza o treino
        if (isEdit) {
            // Mantém as datas de conclusão do treino existente
            const existingWorkout = appData.workouts.find(w => w.id === workoutId);
            if (existingWorkout) {
                workout.completedDates = existingWorkout.completedDates || [];
            } else {
                workout.completedDates = [];
            }
            
            // Atualiza o treino na lista
            appData.workouts = appData.workouts.map(w => w.id === workoutId ? workout : w);
        } else {
            workout.completedDates = [];
            appData.workouts.push(workout);
        }
        
        saveData();
        updateUI();
        closeAllModals();
    }

    function handleAssessmentSubmit(e) {
        e.preventDefault();
        
        const assessment = {
            date: formatDate(new Date()),
            weight: parseFloat(document.getElementById('assessment-weight').value),
            bodyfat: document.getElementById('assessment-bodyfat').value ? parseFloat(document.getElementById('assessment-bodyfat').value) : null,
            muscle: document.getElementById('assessment-muscle').value ? parseFloat(document.getElementById('assessment-muscle').value) : null,
            measurements: {
                chest: document.getElementById('measurement-chest').value ? parseFloat(document.getElementById('measurement-chest').value) : null,
                waist: document.getElementById('measurement-waist').value ? parseFloat(document.getElementById('measurement-waist').value) : null,
                hips: document.getElementById('measurement-hips').value ? parseFloat(document.getElementById('measurement-hips').value) : null,
                arms: document.getElementById('measurement-arms').value ? parseFloat(document.getElementById('measurement-arms').value) : null,
                thighs: document.getElementById('measurement-thighs').value ? parseFloat(document.getElementById('measurement-thighs').value) : null
            },
            notes: document.getElementById('assessment-notes').value
        };
        
        appData.assessments.push(assessment);
        saveData();
        updateUI();
        closeAllModals();
    }

    function handleGoalSubmit(e) {
        e.preventDefault();
        
        const goalType = document.getElementById('goal-type').value;
        const goalTarget = parseInt(document.getElementById('goal-target').value);
        const goalUnit = document.getElementById('goal-unit').value;
        
        const goal = {
            id: generateId(),
            type: goalType,
            target: goalTarget,
            unit: goalUnit,
            progress: 0
        };
        
        appData.goals.push(goal);
        saveData();
        updateUI();
        closeAllModals();
    }

    function startWorkout(workoutId) {
        const workout = appData.workouts.find(w => w.id === workoutId);
        if (!workout) return;
        
        // Adiciona data de conclusão se não existir hoje
        const today = formatDate(new Date());
        if (!workout.completedDates.includes(today)) {
            workout.completedDates.push(today);
            saveData();
            updateUI();
        }
        
        // Simula início do treino (na prática, abriria uma tela de treino)
        alert(`Iniciando treino: ${workout.name}\nDuração: ${workout.duration} minutos`);
    }

    function editWorkout(workoutId) {
        const workout = appData.workouts.find(w => w.id === workoutId);
        if (!workout) return;
        
        // Preenche o formulário com os dados do treino
        document.getElementById('workout-name').value = workout.name;
        document.getElementById('workout-description').value = workout.description;
        document.getElementById('workout-duration').value = workout.duration;
        document.getElementById('workout-difficulty').value = workout.difficulty;
        document.getElementById('workout-category').value = workout.category;
        
        // Limpa exercícios existentes
        document.getElementById('exercises-container').innerHTML = '';
        
        // Adiciona exercícios
        workout.exercises.forEach(exercise => {
            addExerciseField(exercise);
        });
        
        // Marca como edição
        document.getElementById('workout-form').setAttribute('data-workout-id', workoutId);
        document.getElementById('workout-modal-title').textContent = 'Editar Treino';
        
        // Abre o modal
        openModal('workout-modal');
    }

    function removeGoal(goalId) {
        if (confirm('Tem certeza que deseja remover esta meta?')) {
            appData.goals = appData.goals.filter(g => g.id !== goalId);
            saveData();
            updateUI();
        }
    }

    function editGoal(goalId) {
        const goal = appData.goals.find(g => g.id === goalId);
        if (!goal) return;
        
        document.getElementById('goal-type').value = goal.type;
        document.getElementById('goal-target').value = goal.target;
        updateGoalUnit(); // Atualiza a unidade
        
        // Marca como edição (seria necessário adicionar um campo hidden para o ID)
        // Implementação simplificada - na prática precisaria de mais lógica
        
        openModal('goal-modal');
    }

    function removeAssessment(assessmentDate) {
        if (confirm('Tem certeza que deseja remover esta avaliação?')) {
            appData.assessments = appData.assessments.filter(a => a.date !== assessmentDate);
            saveData();
            updateUI();
        }
    }

    // Funções auxiliares
    function addExerciseField(exerciseData) {
        const container = document.getElementById('exercises-container');
        const exerciseId = generateId();
        
        const exerciseEl = document.createElement('div');
        exerciseEl.className = 'exercise-item';
        exerciseEl.innerHTML = `
            <div class="exercise-row">
                <div class="form-group">
                    <label>Exercício</label>
                    <input type="text" class="exercise-name" value="${exerciseData?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Séries</label>
                    <input type="number" class="exercise-sets" min="1" value="${exerciseData?.sets || 3}" required>
                </div>
            </div>
            <div class="exercise-row">
                <div class="form-group">
                    <label>Repetições</label>
                    <input type="text" class="exercise-reps" value="${exerciseData?.reps || '10-12'}" required>
                </div>
                <div class="form-group">
                    <label>Descanso</label>
                    <input type="text" class="exercise-rest" value="${exerciseData?.rest || '60s'}" required>
                </div>
                <button type="button" class="remove-exercise-btn" data-exercise-id="${exerciseId}">✕</button>
            </div>
        `;
        
        container.appendChild(exerciseEl);
        
        // Configura evento do botão de remover
        exerciseEl.querySelector('.remove-exercise-btn').addEventListener('click', () => {
            container.removeChild(exerciseEl);
        });
    }

    function updateGoalUnit() {
        const goalType = document.getElementById('goal-type').value;
        const unitField = document.getElementById('goal-unit');
        
        switch(goalType) {
            case 'water':
                unitField.value = 'copos';
                break;
            case 'steps':
                unitField.value = 'passos';
                break;
            case 'calories':
                unitField.value = 'kcal';
                break;
            case 'sleep':
                unitField.value = 'horas';
                break;
            case 'workout':
                unitField.value = 'treinos';
                break;
        }
    }

    function initWorkoutModal() {
        // Limpa o formulário
        const form = document.getElementById('workout-form');
        form.reset();
        form.removeAttribute('data-workout-id');
        document.getElementById('exercises-container').innerHTML = '';
        document.getElementById('workout-modal-title').textContent = 'Novo Treino';
        
        // Adiciona um exercício vazio por padrão
        addExerciseField();
    }

    function initDayScheduleModal() {
        // Implementação simplificada - na prática seria chamada com a data específica
        console.log('Day schedule modal initialized');
    }

    function openDayScheduleModal(dateStr, dateObj) {
        document.getElementById('day-schedule-title').textContent = `Treinos para ${formatDisplayDate(dateStr)}`;
        
        const scheduledWorkoutsEl = document.getElementById('scheduled-workouts');
        scheduledWorkoutsEl.innerHTML = '';
        
        // Preenche o select com os treinos disponíveis
        const workoutSelect = document.getElementById('workout-select');
        workoutSelect.innerHTML = '<option value="">Selecione um treino...</option>';
        
        appData.workouts.forEach(workout => {
            const option = document.createElement('option');
            option.value = workout.id;
            option.textContent = workout.name;
            workoutSelect.appendChild(option);
        });
        
        // Mostra os treinos já agendados para este dia
        if (appData.schedule[dateStr]) {
            appData.schedule[dateStr].forEach(workoutId => {
                const workout = appData.workouts.find(w => w.id === workoutId);
                if (workout) {
                    const workoutEl = document.createElement('div');
                    workoutEl.className = 'scheduled-workout';
                    workoutEl.innerHTML = `
                        <span>${workout.name} (${workout.duration} min)</span>
                        <button class="danger-btn" data-workout-id="${workoutId}" data-date="${dateStr}">Remover</button>
                    `;
                    scheduledWorkoutsEl.appendChild(workoutEl);
                    
                    // Configura evento do botão de remover
                    workoutEl.querySelector('button').addEventListener('click', (e) => {
                        removeWorkoutFromDay(workoutId, dateStr);
                        e.stopPropagation();
                    });
                }
            });
        }
        
        // Configura o botão de adicionar para esta data específica
        document.getElementById('add-workout-to-day').setAttribute('data-date', dateStr);
        
        openModal('day-schedule-modal');
    }

    function addWorkoutToDay() {
        const workoutSelect = document.getElementById('workout-select');
        const workoutId = workoutSelect.value;
        const dateStr = document.getElementById('add-workout-to-day').getAttribute('data-date');
        
        if (!workoutId) return;
        
        // Inicializa o array de treinos para este dia se não existir
        if (!appData.schedule[dateStr]) {
            appData.schedule[dateStr] = [];
        }
        
        // Adiciona o treino se não estiver já adicionado
        if (!appData.schedule[dateStr].includes(workoutId)) {
            appData.schedule[dateStr].push(workoutId);
            saveData();
            updateUI();
            openDayScheduleModal(dateStr); // Recarrega o modal
        }
    }

    function removeWorkoutFromDay(workoutId, dateStr) {
        if (appData.schedule[dateStr]) {
            appData.schedule[dateStr] = appData.schedule[dateStr].filter(id => id !== workoutId);
            
            // Remove o dia se não houver mais treinos
            if (appData.schedule[dateStr].length === 0) {
                delete appData.schedule[dateStr];
            }
            
            saveData();
            updateUI();
            openDayScheduleModal(dateStr); // Recarrega o modal
        }
    }

    // Funções utilitárias
    function generateId() {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    }

    function formatDate(date) {
        // Formata como YYYY-MM-DD
        return date.toISOString().split('T')[0];
    }

    function formatDisplayDate(dateStr) {
        // Formata para exibição (DD/MM/YYYY)
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    function getDayName(dayIndex) {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return days[dayIndex];
    }

    function getDifficultyText(difficulty) {
        switch(difficulty) {
            case 'easy': return 'Fácil';
            case 'medium': return 'Médio';
            case 'hard': return 'Difícil';
            default: return difficulty;
        }
    }

    function getCategoryText(category) {
        switch(category) {
            case 'strength': return 'Força';
            case 'cardio': return 'Cardio';
            case 'flexibility': return 'Flexibilidade';
            case 'sports': return 'Esportes';
            default: return category;
        }
    }

    function getCategoryIcon(category) {
        switch(category) {
            case 'strength': return '💪';
            case 'cardio': return '❤️';
            case 'flexibility': return '🧘';
            case 'sports': return '⚽';
            default: return '';
        }
    }

    function getGoalTypeText(type) {
        switch(type) {
            case 'water': return 'Água';
            case 'steps': return 'Passos';
            case 'calories': return 'Calorias';
            case 'sleep': return 'Sono';
            case 'workout': return 'Treinos';
            default: return type;
        }
    }

    function getGoalIcon(type) {
        switch(type) {
            case 'water': return '💧';
            case 'steps': return '👟';
            case 'calories': return '🔥';
            case 'sleep': return '😴';
            case 'workout': return '💪';
            default: return '';
        }
    }
});