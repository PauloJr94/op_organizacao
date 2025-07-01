// Data Storage
class StudyStorage {
    static getSubjects() {
        const data = localStorage.getItem('subjects');
        return data ? JSON.parse(data) : [];
    }

    static saveSubjects(subjects) {
        localStorage.setItem('subjects', JSON.stringify(subjects));
    }

    static getStudySessions() {
        const data = localStorage.getItem('studySessions');
        return data ? JSON.parse(data) : [];
    }

    static saveStudySessions(sessions) {
        localStorage.setItem('studySessions', JSON.stringify(sessions));
    }

    static getScheduledEvents() {
        const data = localStorage.getItem('scheduledEvents');
        return data ? JSON.parse(data) : [];
    }

    static saveScheduledEvents(events) {
        localStorage.setItem('scheduledEvents', JSON.stringify(events));
    }
}

// Application State
class StudyApp {
    constructor() {
        this.subjects = StudyStorage.getSubjects();
        this.studySessions = StudyStorage.getStudySessions();
        this.scheduledEvents = StudyStorage.getScheduledEvents();
        this.currentSubjectId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderDashboard();
        this.renderSubjects();
        this.renderSchedule();
        lucide.createIcons();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Subject Management
        document.getElementById('add-subject-btn').addEventListener('click', () => {
            this.showAddSubjectForm();
        });

        document.getElementById('cancel-subject').addEventListener('click', () => {
            this.hideAddSubjectForm();
        });

        document.getElementById('subject-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSubject();
        });

        // Event Management
        document.getElementById('add-event-btn').addEventListener('click', () => {
            this.showAddEventForm();
        });

        document.getElementById('cancel-event').addEventListener('click', () => {
            this.hideAddEventForm();
        });

        document.getElementById('event-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEvent();
        });

        // Study Session Modal
        document.getElementById('cancel-study').addEventListener('click', () => {
            this.hideStudyModal();
        });

        document.getElementById('study-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addStudySession();
        });

        // Close modal on background click
        document.getElementById('study-modal').addEventListener('click', (e) => {
            if (e.target.id === 'study-modal') {
                this.hideStudyModal();
            }
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(btn => {
            btn.classList.add('active');
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Refresh icons
        setTimeout(() => lucide.createIcons(), 100);
    }

    // Subject Management
    showAddSubjectForm() {
        document.getElementById('add-subject-form').classList.remove('hidden');
    }

    hideAddSubjectForm() {
        document.getElementById('add-subject-form').classList.add('hidden');
        document.getElementById('subject-form').reset();
    }

    addSubject() {
        const name = document.getElementById('subject-name').value;
        const weight = parseInt(document.getElementById('subject-weight').value);
        const method = document.getElementById('subject-method').value;
        const target = parseInt(document.getElementById('subject-target').value);

        const subject = {
            id: Date.now().toString(),
            name,
            weight,
            studyMethod: method,
            targetHours: target,
            totalStudyTime: 0,
            questionsCompleted: 0,
            color: this.generateRandomColor()
        };

        this.subjects.push(subject);
        StudyStorage.saveSubjects(this.subjects);
        
        this.hideAddSubjectForm();
        this.renderSubjects();
        this.renderDashboard();
    }

    generateRandomColor() {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    showStudyModal(subjectId) {
        this.currentSubjectId = subjectId;
        document.getElementById('study-modal').classList.remove('hidden');
    }

    hideStudyModal() {
        document.getElementById('study-modal').classList.add('hidden');
        document.getElementById('study-form').reset();
        this.currentSubjectId = null;
    }

    addStudySession() {
        const duration = parseFloat(document.getElementById('study-duration').value);
        const questions = parseInt(document.getElementById('study-questions').value) || 0;
        const method = document.getElementById('study-method').value;

        const session = {
            id: Date.now().toString(),
            subjectId: this.currentSubjectId,
            date: new Date().toISOString().split('T')[0],
            duration,
            questionsCompleted: questions,
            method,
            notes: ''
        };

        this.studySessions.push(session);
        StudyStorage.saveStudySessions(this.studySessions);

        // Update subject totals
        const subject = this.subjects.find(s => s.id === this.currentSubjectId);
        if (subject) {
            subject.totalStudyTime += duration;
            subject.questionsCompleted += questions;
            subject.lastStudyDate = session.date;
            StudyStorage.saveSubjects(this.subjects);
        }

        this.hideStudyModal();
        this.renderSubjects();
        this.renderDashboard();
    }

    // Event Management
    showAddEventForm() {
        document.getElementById('add-event-form').classList.remove('hidden');
    }

    hideAddEventForm() {
        document.getElementById('add-event-form').classList.add('hidden');
        document.getElementById('event-form').reset();
    }

    addEvent() {
        const type = document.getElementById('event-type').value;
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const description = document.getElementById('event-description').value;

        const event = {
            id: Date.now().toString(),
            type,
            title,
            date,
            time,
            description,
            completed: false
        };

        this.scheduledEvents.push(event);
        StudyStorage.saveScheduledEvents(this.scheduledEvents);
        
        this.hideAddEventForm();
        this.renderSchedule();
        this.renderDashboard();
    }

    // Rendering Methods
    renderDashboard() {
        this.renderStats();
        this.renderSubjectsProgress();
        this.renderRecommendations();
        this.renderUpcomingEvents();
    }

    renderStats() {
        const totalHours = this.subjects.reduce((sum, subject) => sum + subject.totalStudyTime, 0);
        const totalQuestions = this.subjects.reduce((sum, subject) => sum + subject.questionsCompleted, 0);
        const upcomingEvents = this.scheduledEvents.filter(event => 
            new Date(event.date) >= new Date() && !event.completed
        ).length;

        document.getElementById('total-hours').textContent = Math.round(totalHours);
        document.getElementById('total-questions').textContent = totalQuestions;
        document.getElementById('total-subjects').textContent = this.subjects.length;
        document.getElementById('upcoming-events').textContent = upcomingEvents;
    }

    renderSubjectsProgress() {
        const container = document.getElementById('subjects-progress');
        
        if (this.subjects.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma matéria cadastrada</p>';
            return;
        }

        container.innerHTML = this.subjects.map(subject => {
            const progress = Math.min((subject.totalStudyTime / subject.targetHours) * 100, 100);
            return `
                <div class="progress-item">
                    <div class="progress-header">
                        <span class="progress-name">${subject.name}</span>
                        <span class="progress-stats">${Math.round(subject.totalStudyTime)}h / ${subject.targetHours}h</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderRecommendations() {
        const container = document.getElementById('recommendations');
        
        if (this.subjects.length === 0) {
            container.innerHTML = '<p class="empty-state">Adicione matérias para ver recomendações</p>';
            return;
        }

        const recommendations = this.subjects
            .sort((a, b) => {
                const aScore = (a.weight * 2) - (a.totalStudyTime / a.targetHours);
                const bScore = (b.weight * 2) - (b.totalStudyTime / b.targetHours);
                return bScore - aScore;
            })
            .slice(0, 3);

        container.innerHTML = recommendations.map((subject, index) => `
            <div class="recommendation-item">
                <div class="recommendation-rank rank-${index + 1}">${index + 1}</div>
                <div class="recommendation-info">
                    <p class="recommendation-name">${subject.name}</p>
                    <p class="recommendation-weight">Peso: ${subject.weight}</p>
                </div>
            </div>
        `).join('');
    }

    renderUpcomingEvents() {
        const container = document.getElementById('upcoming-events-list');
        const upcomingEvents = this.scheduledEvents
            .filter(event => new Date(event.date) >= new Date() && !event.completed)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);

        if (upcomingEvents.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum evento agendado</p>';
            return;
        }

        container.innerHTML = upcomingEvents.map(event => `
            <div class="event-item">
                <div class="event-indicator ${event.type}"></div>
                <div class="event-content">
                    <p class="event-title">${event.title}</p>
                    <p class="event-meta">
                        ${new Date(event.date).toLocaleDateString('pt-BR')} - ${event.time}
                    </p>
                </div>
            </div>
        `).join('');
    }

    renderSubjects() {
        const container = document.getElementById('subjects-grid');
        
        if (this.subjects.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma matéria cadastrada</p>';
            return;
        }

        container.innerHTML = this.subjects.map(subject => {
            const progress = Math.min((subject.totalStudyTime / subject.targetHours) * 100, 100);
            return `
                <div class="subject-card">
                    <div class="subject-header">
                        <h3 class="subject-name">${subject.name}</h3>
                        <span class="subject-weight">Peso ${subject.weight}</span>
                    </div>
                    
                    <div class="subject-stats">
                        <div class="subject-stat">
                            <i data-lucide="clock"></i>
                            <span>${Math.round(subject.totalStudyTime)}h / ${subject.targetHours}h</span>
                        </div>
                        <div class="subject-stat">
                            <i data-lucide="check-circle"></i>
                            <span>${subject.questionsCompleted} questões</span>
                        </div>
                    </div>
                    
                    <p class="subject-method">
                        <strong>Método:</strong> ${subject.studyMethod}
                    </p>
                    
                    <div class="subject-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <button class="btn-study" onclick="app.showStudyModal('${subject.id}')">
                        Registrar Estudo
                    </button>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    }

    renderSchedule() {
        this.renderUpcomingEventsSchedule();
        this.renderPastEvents();
    }

    renderUpcomingEventsSchedule() {
        const container = document.getElementById('upcoming-events-schedule');
        const upcomingEvents = this.scheduledEvents
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcomingEvents.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum evento agendado</p>';
            return;
        }

        container.innerHTML = upcomingEvents.map(event => `
            <div class="event-item">
                <div class="event-indicator ${event.type}"></div>
                <div class="event-content">
                    <div class="event-header">
                        <i data-lucide="${event.type === 'simulado' ? 'target' : 'file-text'}" class="${event.type}"></i>
                        <h4 class="event-title">${event.title}</h4>
                    </div>
                    <div class="event-meta">
                        <div class="event-meta-item">
                            <i data-lucide="calendar"></i>
                            <span>${new Date(event.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div class="event-meta-item">
                            <i data-lucide="clock"></i>
                            <span>${event.time}</span>
                        </div>
                    </div>
                    ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }

    renderPastEvents() {
        const pastEvents = this.scheduledEvents
            .filter(event => new Date(event.date) < new Date())
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        const card = document.getElementById('past-events-card');
        const container = document.getElementById('past-events-schedule');

        if (pastEvents.length === 0) {
            card.classList.add('hidden');
            return;
        }

        card.classList.remove('hidden');
        container.innerHTML = pastEvents.map(event => `
            <div class="event-item" style="opacity: 0.75;">
                <div class="event-indicator ${event.type}" style="width: 0.5rem; height: 0.5rem;"></div>
                <div class="event-content">
                    <p class="event-title" style="color: #6b7280;">${event.title}</p>
                    <p class="event-meta" style="font-size: 0.875rem; color: #9ca3af;">
                        ${new Date(event.date).toLocaleDateString('pt-BR')} - ${event.time}
                    </p>
                </div>
            </div>
        `).join('');
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new StudyApp();
});