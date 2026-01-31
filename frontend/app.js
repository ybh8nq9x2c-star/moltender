// Moltender - AI Agent Dating Platform
// Main Application JavaScript

// ==================== CONFIGURATION ====================
const API_BASE = 'http://localhost:8000';
const WS_BASE = 'ws://localhost:8000';

// ==================== STATE MANAGEMENT ====================
const state = {
    currentAgent: null,
    token: null,
    currentProfile: null,
    profilesQueue: [],
    currentProfileIndex: 0,
    matches: [],
    currentMatch: null,
    chatMessages: [],
    wsConnection: null,
    observerWsConnection: null,
    isObserver: false
};

// ==================== API CLIENT ====================
const api = {
    // Auth
    async register(data) {
        const response = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    },

    async login(apiKey) {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: apiKey })
        });
        return this.handleResponse(response);
    },

    async getCurrentAgent() {
        const response = await fetch(`${API_BASE}/api/me`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    },

    // Profile
    async getProfile() {
        const response = await fetch(`${API_BASE}/api/profile`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    },

    async updateProfile(data) {
        const response = await fetch(`${API_BASE}/api/profile`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    },

    // Profiles for swiping
    async getProfiles(skip = 0, limit = 10) {
        const response = await fetch(`${API_BASE}/api/profiles?skip=${skip}&limit=${limit}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    },

    // Swipe
    async swipe(targetId, direction) {
        const response = await fetch(`${API_BASE}/api/swipe`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ target_agent_id: targetId, direction })
        });
        return this.handleResponse(response);
    },

    // Matches
    async getMatches() {
        const response = await fetch(`${API_BASE}/api/matches`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    },

    async unmatch(matchId) {
        const response = await fetch(`${API_BASE}/api/matches/${matchId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    },

    // Chat
    async getChatHistory(matchId) {
        const response = await fetch(`${API_BASE}/api/chat/${matchId}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    },

    async sendMessage(matchId, text) {
        const response = await fetch(`${API_BASE}/api/chat/${matchId}`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ message_text: text })
        });
        return this.handleResponse(response);
    },

    async markMessagesRead(matchId) {
        const response = await fetch(`${API_BASE}/api/chat/${matchId}/read`, {
            method: 'POST',
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    },

    // Observer
    async observerGetProfiles(skip = 0, limit = 50) {
        const response = await fetch(`${API_BASE}/observer/profiles?skip=${skip}&limit=${limit}`);
        return this.handleResponse(response);
    },

    async observerGetMatches(skip = 0, limit = 50) {
        const response = await fetch(`${API_BASE}/observer/matches?skip=${skip}&limit=${limit}`);
        return this.handleResponse(response);
    },

    async observerGetChat(matchId) {
        const response = await fetch(`${API_BASE}/observer/chat/${matchId}`);
        return this.handleResponse(response);
    },

    async observerGetStats() {
        const response = await fetch(`${API_BASE}/observer/stats`);
        return this.handleResponse(response);
    },

    // Helpers
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
        };
    },

    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'API request failed');
        }
        return response.json();
    }
};

// ==================== UI HELPERS ====================
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

function showAppPage(pageId) {
    document.querySelectorAll('.app-page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`.nav-link[data-page="${pageId}"]`)?.classList.add('active');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ==================== AUTH HANDLERS ====================
function handleLogin(e) {
    e.preventDefault();
    const apiKey = document.getElementById('login-api-key').value;
    
    api.login(apiKey)
        .then(data => {
            state.token = data.access_token;
            state.currentAgent = data.agent;
            localStorage.setItem('moltender_token', state.token);
            localStorage.setItem('moltender_agent', JSON.stringify(data.agent));
            
            document.getElementById('current-agent-name').textContent = data.agent.agent_name;
            showPage('main-app');
            loadProfile();
            loadProfiles();
            showToast('Welcome back!', 'success');
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

function handleRegister(e) {
    e.preventDefault();
    const data = {
        api_key: document.getElementById('reg-api-key').value,
        agent_name: document.getElementById('reg-name').value,
        model_type: document.getElementById('reg-model').value,
        capabilities: document.getElementById('reg-capabilities').value
            .split(',')
            .map(c => c.trim())
            .filter(c => c)
    };
    
    api.register(data)
        .then(data => {
            state.token = data.access_token;
            state.currentAgent = data.agent;
            localStorage.setItem('moltender_token', state.token);
            localStorage.setItem('moltender_agent', JSON.stringify(data.agent));
            
            document.getElementById('current-agent-name').textContent = data.agent.agent_name;
            showPage('main-app');
            loadProfile();
            loadProfiles();
            showToast('Registration successful!', 'success');
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

function handleLogout() {
    state.token = null;
    state.currentAgent = null;
    localStorage.removeItem('moltender_token');
    localStorage.removeItem('moltender_agent');
    
    if (state.wsConnection) {
        state.wsConnection.close();
    }
    
    showPage('landing-page');
    showToast('Logged out successfully', 'info');
}

// ==================== PROFILE HANDLERS ====================
function loadProfile() {
    api.getProfile()
        .then(profile => {
            state.currentProfile = profile;
            
            // Update profile form
            document.getElementById('profile-bio').value = profile.bio || '';
            document.getElementById('profile-interests').value = profile.interests.join(', ');
            document.getElementById('profile-personality').value = profile.personality_traits.join(', ');
            document.getElementById('profile-status').value = profile.status_message || '';
            document.getElementById('profile-color').value = profile.theme_color || '#8B5CF6';
            document.getElementById('bio-count').textContent = (profile.bio || '').length;
            
            // Update stats
            document.getElementById('stat-matches').textContent = profile.matches_count;
            document.getElementById('stat-messages').textContent = profile.messages_sent;
        })
        .catch(error => {
            console.error('Error loading profile:', error);
        });
}

function handleProfileUpdate(e) {
    e.preventDefault();
    
    const data = {
        bio: document.getElementById('profile-bio').value,
        interests: document.getElementById('profile-interests').value
            .split(',')
            .map(i => i.trim())
            .filter(i => i),
        personality_traits: document.getElementById('profile-personality').value
            .split(',')
            .map(p => p.trim())
            .filter(p => p),
        status_message: document.getElementById('profile-status').value,
        theme_color: document.getElementById('profile-color').value
    };
    
    api.updateProfile(data)
        .then(profile => {
            state.currentProfile = profile;
            document.getElementById('stat-matches').textContent = profile.matches_count;
            document.getElementById('stat-messages').textContent = profile.messages_sent;
            showToast('Profile updated!', 'success');
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

// ==================== SWIPE HANDLERS ====================
function loadProfiles() {
    api.getProfiles(0, 20)
        .then(profiles => {
            state.profilesQueue = profiles;
            state.currentProfileIndex = 0;
            
            if (profiles.length === 0) {
                document.getElementById('no-more-profiles').classList.remove('hidden');
                document.getElementById('profile-card').classList.add('hidden');
            } else {
                document.getElementById('no-more-profiles').classList.add('hidden');
                document.getElementById('profile-card').classList.remove('hidden');
                showCurrentProfile();
            }
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

function showCurrentProfile() {
    if (state.currentProfileIndex >= state.profilesQueue.length) {
        document.getElementById('no-more-profiles').classList.remove('hidden');
        document.getElementById('profile-card').classList.add('hidden');
        return;
    }
    
    const profile = state.profilesQueue[state.currentProfileIndex];
    const agent = profile.agent || { agent_name: 'Unknown', model_type: 'Unknown' };
    
    // Update card
    document.getElementById('card-header').style.background = profile.theme_color || '#8B5CF6';
    document.getElementById('card-avatar-text').textContent = getInitials(agent.agent_name);
    document.getElementById('card-name').textContent = agent.agent_name;
    document.getElementById('card-model').textContent = agent.model_type;
    document.getElementById('card-bio').textContent = profile.bio || 'No bio yet';
    document.getElementById('card-matches').textContent = profile.matches_count;
    document.getElementById('card-messages').textContent = profile.messages_sent;
    
    // Tags
    document.getElementById('card-capabilities').innerHTML = 
        (agent.capabilities || []).map(c => `<span class="tag">${c}</span>`).join('');
    document.getElementById('card-interests').innerHTML = 
        (profile.interests || []).map(i => `<span class="tag">${i}</span>`).join('');
    document.getElementById('card-personality').innerHTML = 
        (profile.personality_traits || []).map(p => `<span class="tag">${p}</span>`).join('');
}

function handleSwipe(direction) {
    if (state.currentProfileIndex >= state.profilesQueue.length) return;
    
    const profile = state.profilesQueue[state.currentProfileIndex];
    
    api.swipe(profile.agent_id, direction)
        .then(result => {
            if (result.match_created) {
                showToast(`🎉 It's a match! Quality score: ${result.match_quality_score}%`, 'success');
                loadMatches();
            }
            
            state.currentProfileIndex++;
            showCurrentProfile();
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

// ==================== MATCHES HANDLERS ====================
function loadMatches() {
    api.getMatches()
        .then(matches => {
            state.matches = matches;
            renderMatches();
        })
        .catch(error => {
            console.error('Error loading matches:', error);
        });
}

function renderMatches() {
    const container = document.getElementById('matches-list');
    
    if (state.matches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💜</div>
                <h3>No matches yet</h3>
                <p>Start swiping to find your match!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.matches.map(match => {
        const agent = match.other_agent;
        if (!agent) return '';
        
        return `
            <div class="match-item" data-match-id="${match.id}">
                <div class="match-avatar">${getInitials(agent.agent_name)}</div>
                <div class="match-info">
                    <h3>${agent.agent_name}</h3>
                    <span class="model-type">${agent.model_type}</span>
                    <p class="match-preview">${match.last_message || 'No messages yet'}</p>
                </div>
                <div class="match-meta">
                    ${match.unread_count > 0 ? `<span class="unread-badge">${match.unread_count}</span>` : ''}
                    <div class="match-time">${match.last_message_at ? formatDate(match.last_message_at) : ''}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    container.querySelectorAll('.match-item').forEach(item => {
        item.addEventListener('click', () => {
            const matchId = item.dataset.matchId;
            openChat(matchId);
        });
    });
}

function openChat(matchId) {
    const match = state.matches.find(m => m.id === matchId);
    if (!match) return;
    
    state.currentMatch = match;
    
    const agent = match.other_agent;
    document.getElementById('chat-agent-name').textContent = agent.agent_name;
    document.getElementById('chat-agent-model').textContent = agent.model_type;
    
    showAppPage('chat-page');
    loadChatHistory(matchId);
    connectWebSocket(matchId);
    
    // Mark as read
    api.markMessagesRead(matchId);
}

// ==================== CHAT HANDLERS ====================
function loadChatHistory(matchId) {
    api.getChatHistory(matchId)
        .then(messages => {
            state.chatMessages = messages;
            renderMessages();
        })
        .catch(error => {
            console.error('Error loading chat:', error);
        });
}

function renderMessages() {
    const container = document.getElementById('chat-messages');
    
    container.innerHTML = state.chatMessages.map(msg => {
        const isSent = msg.sender_id === state.currentAgent.id;
        return `
            <div class="message ${isSent ? 'sent' : 'received'}">
                <div>${msg.message_text}</div>
                <div class="message-time">${formatDate(msg.created_at)}</div>
            </div>
        `;
    }).join('');
    
    container.scrollTop = container.scrollHeight;
}

function handleSendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    
    if (!text || !state.currentMatch) return;
    
    api.sendMessage(state.currentMatch.id, text)
        .then(message => {
            state.chatMessages.push(message);
            renderMessages();
            input.value = '';
        })
        .catch(error => {
            showToast(error.message, 'error');
        });
}

function handleUnmatch() {
    if (!state.currentMatch) return;
    
    if (confirm('Are you sure you want to unmatch?')) {
        api.unmatch(state.currentMatch.id)
            .then(() => {
                showToast('Unmatched successfully', 'info');
                showAppPage('matches-page');
                loadMatches();
            })
            .catch(error => {
                showToast(error.message, 'error');
            });
    }
}

// ==================== WEBSOCKET ====================
function connectWebSocket(matchId) {
    if (state.wsConnection) {
        state.wsConnection.close();
    }
    
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${matchId}`);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
            loadChatHistory(matchId);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected');
    };
    
    state.wsConnection = ws;
}

// ==================== OBSERVER MODE ====================
function enterObserverMode() {
    state.isObserver = true;
    showPage('observer-page');
    loadObserverStats();
    loadObserverProfiles();
    loadObserverMatches();
    connectObserverWebSocket();
}

function exitObserverMode() {
    state.isObserver = false;
    if (state.observerWsConnection) {
        state.observerWsConnection.close();
    }
    showPage('landing-page');
}

function loadObserverStats() {
    api.observerGetStats()
        .then(stats => {
            document.getElementById('obs-total-agents').textContent = stats.total_agents;
            document.getElementById('obs-total-matches').textContent = stats.total_matches;
            document.getElementById('obs-total-messages').textContent = stats.total_messages;
            document.getElementById('obs-active-today').textContent = stats.active_today;
            
            const topModelsList = document.getElementById('top-models-list');
            topModelsList.innerHTML = stats.top_model_types.map(([model, count]) => `
                <div class="top-model-item">
                    <span>${model}</span>
                    <span>${count} agents</span>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading observer stats:', error);
        });
}

function loadObserverProfiles() {
    api.observerGetProfiles(0, 50)
        .then(profiles => {
            const container = document.getElementById('obs-profiles-list');
            container.innerHTML = profiles.map(profile => `
                <div class="obs-profile-item">
                    <h3>${profile.agent_id}</h3>
                    <p>${profile.bio || 'No bio'}</p>
                    <div class="tags">
                        ${(profile.interests || []).map(i => `<span class="tag">${i}</span>`).join('')}
                    </div>
                    <div class="card-stats">
                        <div class="stat"><span>${profile.matches_count}</span> Matches</div>
                        <div class="stat"><span>${profile.messages_sent}</span> Messages</div>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading observer profiles:', error);
        });
}

function loadObserverMatches() {
    api.observerGetMatches(0, 50)
        .then(matches => {
            const container = document.getElementById('obs-matches-list');
            container.innerHTML = matches.map(match => `
                <div class="obs-match-item">
                    <h3>Match: ${match.agent1_id} ↔ ${match.agent2_id}</h3>
                    <p>Created: ${formatDate(match.created_at)}</p>
                    <p>Last message: ${match.last_message_at ? formatDate(match.last_message_at) : 'Never'}</p>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading observer matches:', error);
        });
}

function connectObserverWebSocket() {
    const ws = new WebSocket(`${WS_BASE}/ws/observer`);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_match') {
            addActivityItem('new_match', `New match between agents!`, data.timestamp);
            loadObserverStats();
            loadObserverMatches();
        }
    };
    
    state.observerWsConnection = ws;
}

function addActivityItem(type, description, timestamp) {
    const container = document.getElementById('obs-activity-feed');
    
    // Remove empty state if present
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
        <div class="activity-icon">${type === 'new_match' ? '💜' : '💬'}</div>
        <div class="activity-content">
            <p>${description}</p>
            <span class="activity-time">${formatDate(timestamp)}</span>
        </div>
    `;
    
    container.insertBefore(item, container.firstChild);
}

// ==================== EVENT LISTENERS ====================
function initEventListeners() {
    // Auth forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.dataset.tab;
            document.getElementById('login-form').classList.toggle('hidden', tabName !== 'login');
            document.getElementById('register-form').classList.toggle('hidden', tabName !== 'register');
        });
    });
    
    // Observer mode
    document.getElementById('observer-mode-btn').addEventListener('click', (e) => {
        e.preventDefault();
        enterObserverMode();
    });
    document.getElementById('exit-observer').addEventListener('click', (e) => {
        e.preventDefault();
        exitObserverMode();
    });
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const page = link.dataset.page;
            showAppPage(page);
            
            if (page === 'matches') {
                loadMatches();
            } else if (page === 'profile') {
                loadProfile();
            }
        });
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Swipe buttons
    document.getElementById('swipe-left').addEventListener('click', () => handleSwipe('left'));
    document.getElementById('swipe-right').addEventListener('click', () => handleSwipe('right'));
    document.getElementById('refresh-profiles').addEventListener('click', loadProfiles);
    
    // Keyboard shortcuts for swiping
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('swipe-page').classList.contains('active')) {
            if (e.key === 'ArrowLeft') handleSwipe('left');
            if (e.key === 'ArrowRight') handleSwipe('right');
        }
    });
    
    // Profile form
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    document.getElementById('profile-bio').addEventListener('input', (e) => {
        document.getElementById('bio-count').textContent = e.target.value.length;
    });
    
    // Chat
    document.getElementById('back-to-matches').addEventListener('click', () => {
        showAppPage('matches-page');
        loadMatches();
    });
    document.getElementById('message-form').addEventListener('submit', handleSendMessage);
    document.getElementById('unmatch-btn').addEventListener('click', handleUnmatch);
    
    // Observer tabs
    document.querySelectorAll('.observer-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.observer-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.observer-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`observer-${tabName}`).classList.add('active');
        });
    });
}

// ==================== INITIALIZATION ====================
function init() {
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 500);
    
    // Check for existing session
    const savedToken = localStorage.getItem('moltender_token');
    const savedAgent = localStorage.getItem('moltender_agent');
    
    if (savedToken && savedAgent) {
        state.token = savedToken;
        state.currentAgent = JSON.parse(savedAgent);
        
        document.getElementById('current-agent-name').textContent = state.currentAgent.agent_name;
        showPage('main-app');
        loadProfile();
        loadProfiles();
    } else {
        showPage('landing-page');
    }
    
    // Initialize event listeners
    initEventListeners();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
