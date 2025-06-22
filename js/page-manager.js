class PageManager {
    constructor(category) {
        this.category = category;
        this.items = [];
        this.showStats = false;
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.bindEvents();
        this.render();
    }
    
    loadData() {
        this.items = loadFromStorage(this.category);
        const statsState = localStorage.getItem(`${this.category}_showStats`);
        this.showStats = statsState === 'true';
    }
    
    saveData() {
        saveToStorage(this.category, this.items);
        localStorage.setItem(`${this.category}_showStats`, this.showStats.toString());
    }
    
    bindEvents() {
        // Enter key on input
        const input = document.getElementById('item-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addItem();
                }
            });
        }
    }
    
    addItem() {
        const input = document.getElementById('item-input');
        const text = input.value.trim();
        
        if (!text) return;
        
        const item = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: Date.now()
        };
        
        this.items.push(item);
        input.value = '';
        
        this.render();
        this.saveData();
    }
    
    toggleItem(itemId) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.completed = !item.completed;
            this.render();
            this.saveData();
        }
    }
    
    deleteItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.render();
        this.saveData();
    }
    
    toggleStats() {
        this.showStats = !this.showStats;
        this.renderStats();
        this.saveData();
        
        const btn = document.querySelector('.stats-btn');
        if (btn) {
            btn.textContent = this.showStats ? '📊 Ocultar Estatísticas' : '📊 Mostrar Estatísticas';
        }
    }
    
    render() {
        this.renderItems();
        this.renderStats();
    }
    
    renderItems() {
        const container = document.getElementById('items-list');
        if (!container) return;
        
        if (this.items.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }
        
        container.innerHTML = this.items.map(item => `
            <div class="item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
                <div class="item-checkbox ${item.completed ? 'checked' : ''}" 
                     onclick="pageManager.toggleItem('${item.id}')"></div>
                <div class="item-text">${escapeHtml(item.text)}</div>
                <div class="item-actions">
                    <button class="delete-btn" onclick="pageManager.deleteItem('${item.id}')">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderStats() {
        const statsContainer = document.getElementById('stats-section');
        if (!statsContainer) return;
        
        const total = this.items.length;
        const completed = this.items.filter(item => item.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        if (this.showStats && total > 0) {
            statsContainer.classList.add('show');
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">${total}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${completed}</span>
                        <span class="stat-label">Concluídas</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${total - completed}</span>
                        <span class="stat-label">Pendentes</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${percentage}%</span>
                        <span class="stat-label">Progresso</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            `;
        } else {
            statsContainer.classList.remove('show');
        }
        
        // Update stats button text
        const btn = document.querySelector('.stats-btn');
        if (btn) {
            btn.textContent = this.showStats ? '📊 Ocultar Estatísticas' : '📊 Mostrar Estatísticas';
        }
    }
    
    getEmptyState() {
        const messages = {
            rotinas: { icon: '📅', title: 'Nenhuma rotina adicionada', subtitle: 'Adicione sua primeira rotina acima' },
            estudos: { icon: '📚', title: 'Nenhum estudo adicionado', subtitle: 'Adicione seu primeiro estudo acima' },
            simulados: { icon: '📝', title: 'Nenhum simulado adicionado', subtitle: 'Adicione seu primeiro simulado acima' },
            treinos: { icon: '💪', title: 'Nenhum treino adicionado', subtitle: 'Adicione seu primeiro treino acima' },
            materiais: { icon: '📋', title: 'Nenhum material adicionado', subtitle: 'Adicione seu primeiro material acima' }
        };
        
        const msg = messages[this.category];
        return `
            <div class="empty-state">
                <div class="empty-icon">${msg.icon}</div>
                <div class="empty-title">${msg.title}</div>
                <div class="empty-subtitle">${msg.subtitle}</div>
            </div>
        `;
    }
}

// Global functions for onclick handlers
function addItem() {
    if (window.pageManager) {
        window.pageManager.addItem();
    }
}

function toggleStats() {
    if (window.pageManager) {
        window.pageManager.toggleStats();
    }
}