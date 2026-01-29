/* Destiny Ultimate - Final Edition v2.2
   Features: AI Chat Bot, Stories, Video Call, Gifts, Blue Tick, Smart Matching, 
   Voice Messages, Daily Quests
*/

const DB_KEY = 'destiny_ultimate_v2';
let currentUser = null;
let activeChatUserId = null;
let lastInteraction = null;
let callTimerInterval;

// --- GLOBAL VARIABLES FOR NEW FEATURES ---
let mediaRecorder;
let audioChunks = [];
let quests = [
    { id: 'q1', title: 'ทักทายเพื่อนใหม่', target: 3, current: 0, reward: 50, claimed: false, type: 'msg' },
    { id: 'q2', title: 'ปัดคนที่ใช่', target: 10, current: 0, reward: 30, claimed: false, type: 'swipe' },
    { id: 'q3', title: 'เปย์ของขวัญ', target: 1, current: 0, reward: 100, claimed: false, type: 'gift' }
];

// --- MOCK DATA ---
const mockUsers = [
    { 
        id: 'u1', username: 'alice', email: 'alice@test.com', password: '1', name: 'Alice', age: 24, gender: 'female', interest: 'male', bio: 'Coffee addict & Cat mom 🐱☕', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', km: 2, isVip: true, isVerified: true,
        tags: ['☕ Coffee', '🐱 Cat Lover', '📚 Reader', '🎵 Music'],
        stories: [{ img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', time: Date.now() - 3600000 }] 
    },
    { 
        id: 'u2', username: 'bob', email: 'bob@test.com', password: '1', name: 'Bob', age: 28, gender: 'male', interest: 'female', bio: 'Photographer | Travel the world 📸✈️', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', km: 12, isVip: false, isVerified: false,
        tags: ['📸 Photo', '✈️ Travel', '🍕 Foodie', '⛰️ Hiking'],
        stories: [] 
    },
    { 
        id: 'u3', username: 'charlie', email: 'charlie@test.com', password: '1', name: 'Charlie', age: 30, gender: 'male', interest: 'female', bio: 'Gym rat. No pain no gain 💪', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', km: 5, isVip: false, isVerified: true,
        tags: ['💪 Gym', '🎮 Gamer', '🏎️ Cars'],
        stories: [{ img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', time: Date.now() - 7200000 }] 
    },
    { 
        id: 'u4', username: 'diana', email: 'diana@test.com', password: '1', name: 'Diana', age: 22, gender: 'female', interest: 'male', bio: 'Art student 🎨. Love indie music.', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', km: 8, isVip: true, isVerified: false,
        tags: ['🎨 Art', '🎵 Music', '💃 Dance', '🐶 Pets'],
        stories: [] 
    }
];

// --- INITIALIZATION ---
function initApp() {
    if(!localStorage.getItem(DB_KEY)) {
        const initialDB = { 
            users: mockUsers, 
            interactions: [], 
            matches: [], 
            messages: [] 
        };
        saveDB(initialDB);
    }

    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        const nav = document.querySelector('.bottom-nav');
        if(nav) nav.classList.add('hidden');

        const session = sessionStorage.getItem('destiny_session');
        if(session) {
            const db = getDB();
            const user = db.users.find(u => u.id === JSON.parse(session).id);
            if(user) login(user);
            else document.getElementById('auth-screen').classList.remove('hidden');
        } else {
            document.getElementById('auth-screen').classList.remove('hidden');
        }
    }, 1500);

    // Add Input Listener for Mic Toggle
    const msgInput = document.getElementById('msg-input');
    if(msgInput) {
        msgInput.addEventListener('input', function(e) {
            const hasText = e.target.value.trim().length > 0;
            const btnMic = document.getElementById('btn-mic');
            const btnSend = document.getElementById('btn-send-text');
            if(btnMic) btnMic.classList.toggle('hidden', hasText);
            if(btnSend) btnSend.classList.toggle('hidden', !hasText);
        });
    }
}
initApp();

function getDB() { return JSON.parse(localStorage.getItem(DB_KEY)); }
function saveDB(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); }

// --- TOAST NOTIFICATION SYSTEM ---
function showToast(message, icon = 'info-circle') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- CONFETTI EFFECT ---
function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981'];
    
    for(let i=0; i<100; i++) {
        particles.push({
            x: canvas.width/2, y: canvas.height/2,
            r: Math.random() * 6 + 2,
            dx: Math.random() * 10 - 5,
            dy: Math.random() * 10 - 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 100
        });
    }

    function animate() {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        let active = false;
        particles.forEach(p => {
            if(p.life > 0) {
                active = true;
                p.x += p.dx; p.y += p.dy; p.life--; p.r *= 0.96;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                ctx.fillStyle = p.color; ctx.fill();
            }
        });
        if(active) requestAnimationFrame(animate);
        else ctx.clearRect(0,0, canvas.width, canvas.height);
    }
    animate();
}

// --- AUTH ---
function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

let uploadedBase64 = '';
const fileInputs = ['reg-file', 'edit-file'];
fileInputs.forEach(id => {
    const el = document.getElementById(id);
    if(el) {
        el.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if(file) {
                if (file.size > 2 * 1024 * 1024) { 
                    showToast('ไฟล์ใหญ่เกินไป! (Max 2MB)', 'exclamation-triangle');
                    this.value = ''; return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    uploadedBase64 = ev.target.result;
                    const previewId = id === 'reg-file' ? 'reg-preview' : 'edit-preview';
                    const imgEl = document.getElementById(previewId);
                    imgEl.src = ev.target.result;
                    imgEl.classList.remove('hidden');
                }
                reader.readAsDataURL(file);
            }
        });
    }
});

document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    const inputVal = document.getElementById('login-input').value.trim();
    const p = document.getElementById('login-password').value;
    const db = getDB();
    const user = db.users.find(x => (x.username === inputVal || x.email === inputVal) && x.password === p);
    if(user) {
        login(user);
        showToast(`ยินดีต้อนรับคุณ ${user.name} 👋`, 'smile');
    } else {
        showToast('ข้อมูลไม่ถูกต้อง', 'times-circle');
    }
};

document.getElementById('register-form').onsubmit = (e) => {
    e.preventDefault();
    if(!uploadedBase64) { showToast('กรุณาใส่รูปโปรไฟล์', 'camera'); return; }
    
    const db = getDB();
    const regUsername = document.getElementById('reg-username').value.trim();
    if (db.users.some(u => u.username === regUsername)) { showToast('ชื่อผู้ใช้นี้มีคนใช้แล้ว', 'user-slash'); return; }

    const selectedTags = Array.from(document.querySelectorAll('.tag-option.selected')).map(el => el.innerText);
    
    const newUser = {
        id: 'u_' + Date.now(),
        username: regUsername,
        email: document.getElementById('reg-email').value.trim(),
        password: document.getElementById('reg-password').value,
        name: document.getElementById('reg-fullname').value,
        age: document.getElementById('reg-age').value,
        gender: document.getElementById('reg-gender').value,
        interest: document.getElementById('reg-interest').value,
        bio: document.getElementById('reg-bio').value,
        img: uploadedBase64,
        km: Math.floor(Math.random() * 20) + 1,
        isVip: false,
        isVerified: false,
        coins: 100, // Bonus start
        swipeCount: 0,
        lastSwipeDate: new Date().toDateString(),
        tags: selectedTags.length > 0 ? selectedTags : ['✨ Newbie'],
        stories: []
    };
    db.users.push(newUser);
    saveDB(db);
    showToast('สมัครสมาชิกสำเร็จ!', 'check-circle');
    switchAuthTab('login');
    document.getElementById('login-input').value = newUser.username;
    uploadedBase64 = '';
};

function login(user) {
    currentUser = user;
    sessionStorage.setItem('destiny_session', JSON.stringify({ id: user.id }));
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-interface').classList.remove('hidden');
    document.querySelector('.bottom-nav').classList.remove('hidden');
    
    updateUI();
    renderStories();
    navigateTo('match');
    checkDailyLogin();
}

function logout() {
    sessionStorage.removeItem('destiny_session');
    document.querySelector('.bottom-nav').classList.add('hidden');
    location.reload();
}

function navigateTo(screen) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + screen).classList.add('active');
    
    const navBtns = document.querySelectorAll('.nav-btn');
    if(screen === 'match') {
        navBtns[0].classList.add('active');
        loadCards();
        renderStories();
    } else if(screen === 'likes') { 
        navBtns[1].classList.add('active');
        loadLikes();
    } else if(screen === 'messages') {
        navBtns[2].classList.add('active');
        loadMessages();
    } else if(screen === 'profile') {
        navBtns[3].classList.add('active');
        updateUI();
    }
}

// --- STORIES SYSTEM ---
function renderStories() {
    const db = getDB();
    const container = document.getElementById('stories-bar');
    if(!container) return;
    container.innerHTML = '';
    
    const hasStory = currentUser.stories && currentUser.stories.length > 0;
    const myStoryDiv = document.createElement('div');
    myStoryDiv.className = 'story-item';
    myStoryDiv.innerHTML = `
        <div class="story-ring ${hasStory ? 'active-upload' : ''}" style="${hasStory ? '' : 'background:#e2e8f0;'} position:relative;">
            <img src="${currentUser.img}">
            ${!hasStory ? '<div style="position:absolute; bottom:0; right:0; background:#3b82f6; color:white; width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; border:2px solid white;">+</div>' : ''}
        </div>
        <span class="story-name">Your Story</span>
    `;
    myStoryDiv.onclick = () => hasStory ? viewStory(currentUser) : triggerStoryUpload();
    container.appendChild(myStoryDiv);

    db.users.forEach(u => {
        if(u.id !== currentUser.id && u.stories && u.stories.length > 0) {
            const div = document.createElement('div');
            div.className = 'story-item';
            div.innerHTML = `
                <div class="story-ring">
                    <img src="${u.img}">
                </div>
                <span class="story-name">${u.name}</span>
            `;
            div.onclick = () => viewStory(u);
            container.appendChild(div);
        }
    });
}

function viewStory(user) {
    const story = user.stories[0];
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.zIndex = '3000';
    modal.innerHTML = `
        <div style="position:relative; width:100%; height:100%; background:black; display:flex; align-items:center; justify-content:center;">
            <img src="${story.img}" style="max-width:100%; max-height:100%;">
            <div style="position:absolute; top:20px; left:20px; color:white; display:flex; gap:10px; align-items:center;">
                <img src="${user.img}" style="width:40px; height:40px; border-radius:50%;">
                <span style="font-weight:bold;">${user.name}</span>
                <span style="opacity:0.7; font-size:0.8rem;">Now</span>
            </div>
            <div style="position:absolute; top:5px; left:5px; width:98%; height:3px; background:rgba(255,255,255,0.3); border-radius:2px;">
                <div id="story-progress" style="height:100%; width:0%; background:white; transition:width 3s linear;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => document.getElementById('story-progress').style.width = '100%', 10);
    setTimeout(() => modal.remove(), 3000);
    modal.onclick = () => modal.remove();
}

function triggerStoryUpload() {
    const input = document.getElementById('story-file-input');
    if(input) input.click();
}

function handleStoryUpload(input) {
    const file = input.files[0];
    if (file) {
        showToast("กำลังอัปโหลด Story...", "cloud-upload-alt");
        const reader = new FileReader();
        reader.onload = function(e) {
            const newStory = { img: e.target.result, time: Date.now() };
            currentUser.stories = currentUser.stories || [];
            currentUser.stories.unshift(newStory);
            
            updateUserInDB(currentUser);
            renderStories(); 
            showToast("อัปโหลด Story สำเร็จ!", "check");
            fireConfetti();
        };
        reader.readAsDataURL(file);
    }
    input.value = ''; 
}

// --- SMART CARD STACK ---
function loadCards() {
    const db = getDB();
    const container = document.getElementById('card-stack');
    container.innerHTML = '';
    
    const fMin = currentUser.filterAgeMin || 18;
    const fMax = currentUser.filterAgeMax || 80;
    const fDist = currentUser.filterDistMax || 100;
    const interacted = db.interactions.filter(i => i.fromId === currentUser.id).map(i => i.toId);
    
    const candidates = db.users.filter(u => {
        if (u.id === currentUser.id) return false;
        if (interacted.includes(u.id)) return false;
        if (currentUser.interest !== 'all' && u.gender !== currentUser.interest) return false;
        if (u.age < fMin || u.age > fMax) return false;
        if (u.km > fDist) return false;
        return true;
    });

    if(candidates.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding-top:100px; color:#94a3b8;">
                <div style="width:100px; height:100px; background:#f1f5f9; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
                    <i class="fas fa-search" style="font-size:3rem; color:#cbd5e1;"></i>
                </div>
                <h3>ไม่พบคนในบริเวณนี้</h3>
                <p>ลองปรับตัวกรอง หรือกลับมาใหม่ภายหลัง</p>
                <button class="btn-primary" style="margin-top:20px; width:auto; padding:10px 20px;" onclick="openSettings()">ปรับการค้นหา</button>
            </div>`;
        return;
    }

    candidates.forEach((user, index) => {
        const card = document.createElement('div');
        card.className = 'tinder-card';
        if(user.img) card.style.backgroundImage = `url(${user.img})`;
        card.style.zIndex = index;
        
        const score = calculateCompatibility(currentUser, user);
        
        let tagsHtml = '';
        if(user.tags) {
            tagsHtml = `<div class="tags-container">
                ${user.tags.slice(0, 3).map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
            </div>`;
        }
        
        const verifiedHtml = user.isVerified ? 
            `<i class="fas fa-check-circle" style="color:#3b82f6; font-size:0.8em; margin-left:5px; text-shadow:0 2px 4px rgba(0,0,0,0.5);"></i>` : '';

        card.innerHTML = `
            <div style="position:absolute; top:20px; right:20px; background:rgba(0,0,0,0.6); color:#fff; padding:5px 10px; border-radius:12px; font-weight:bold; font-size:0.8rem; backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.2);">
                <i class="fas fa-bolt" style="color:#eab308;"></i> ${score}% Match
            </div>
            <div class="distance-badge"><i class="fas fa-map-marker-alt"></i> ${user.km} km</div>
            <h2>${user.name}, ${user.age} ${verifiedHtml}</h2>
            ${tagsHtml}
            <p>${user.bio}</p>
        `;
        container.appendChild(card);
    });
}

function calculateCompatibility(me, them) {
    if(!me.tags || !them.tags) return 50;
    const common = me.tags.filter(tag => them.tags.includes(tag));
    let score = 50 + (common.length * 15);
    return Math.min(score, 100);
}

function triggerSwipe(dir) {
    const today = new Date().toDateString();
    if (currentUser.lastSwipeDate !== today) {
        currentUser.swipeCount = 0;
        currentUser.lastSwipeDate = today;
        updateUserInDB(currentUser);
    }
    if (!currentUser.isVip && currentUser.swipeCount >= 5 && (dir === 'right' || dir === 'up')) {
        document.getElementById('vip-limit-modal').classList.remove('hidden');
        return;
    }

    const cards = document.querySelectorAll('.tinder-card');
    if(!cards.length) return;
    const card = cards[cards.length - 1]; 
    
    card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s';
    if (dir === 'up') {
        card.style.transform = `translate(0px, -1000px) rotate(0deg)`;
        currentUser.swipeCount++;
    } else if (dir === 'right') {
        card.style.transform = `translate(1000px, 100px) rotate(30deg)`;
        currentUser.swipeCount++;
    } else {
        card.style.transform = `translate(-1000px, 100px) rotate(-30deg)`;
    }
    card.style.opacity = '0';
    updateUserInDB(currentUser);

    setTimeout(() => { 
        card.remove(); 
        const db = getDB();
        
        const fMin = currentUser.filterAgeMin || 18;
        const fMax = currentUser.filterAgeMax || 80;
        const fDist = currentUser.filterDistMax || 100;
        const interacted = db.interactions.filter(i => i.fromId === currentUser.id).map(i => i.toId);
        const candidates = db.users.filter(u => 
             u.id !== currentUser.id && 
             !interacted.includes(u.id) && 
             (currentUser.interest === 'all' || u.gender === currentUser.interest) &&
             (u.age >= fMin && u.age <= fMax) &&
             (u.km <= fDist)
        );
        const target = candidates[candidates.length - 1];

        if(target) {
            let type = 'pass';
            if (dir === 'right') type = 'like';
            if (dir === 'up') type = 'superlike';
            processSwipe(target.id, type);
        }
    }, 300);
}

function processSwipe(targetId, type) {
    const db = getDB();
    const interaction = { fromId: currentUser.id, toId: targetId, type: type, timestamp: Date.now() };
    db.interactions.push(interaction);
    lastInteraction = interaction; 
    
    // Hook: Update Quest
    updateQuestProgress('swipe');

    let matchedUser = null;

    if(type === 'like' || type === 'superlike') {
        const isMatch = db.interactions.some(i => 
            i.fromId === targetId && 
            i.toId === currentUser.id && 
            (i.type === 'like' || i.type === 'superlike')
        );

        const isMock = mockUsers.some(u => u.id === targetId);
        const randomLuck = Math.random() < 0.4;
        
        if(isMatch || (isMock && randomLuck)) {
            const matchObj = { users: [currentUser.id, targetId].sort(), timestamp: Date.now() };
            if(!db.matches.some(m => JSON.stringify(m.users) === JSON.stringify(matchObj.users))) {
                db.matches.push(matchObj);
                matchedUser = db.users.find(u => u.id === targetId);
                
                if(isMock) setTimeout(() => botAutoReply(targetId, "Hi! Nice to match with you 😊"), 3000);
            }
        }
    }
    saveDB(db);

    if (matchedUser) {
        showMatchModal(matchedUser);
        fireConfetti();
    }
}

function undoSwipe() {
    if(!lastInteraction) { showToast('ไม่สามารถย้อนกลับได้', 'ban'); return; }
    if(!currentUser.isVip) { showToast('เฉพาะ VIP เท่านั้น', 'crown'); return; }

    const db = getDB();
    db.interactions = db.interactions.filter(i => 
        !(i.fromId === lastInteraction.fromId && i.toId === lastInteraction.toId)
    );
    if (lastInteraction.type === 'like' || lastInteraction.type === 'superlike') {
        db.matches = db.matches.filter(m => !m.users.includes(lastInteraction.toId));
    }
    saveDB(db);
    lastInteraction = null;
    loadCards();
    showToast('Rewind Successful!', 'undo');
}

// --- MATCH MODAL HANDLERS ---
function showMatchModal(user) {
    const modal = document.getElementById('match-modal');
    document.getElementById('match-name').innerText = user.name;
    document.getElementById('my-match-img').src = currentUser.img;
    document.getElementById('their-match-img').src = user.img;
    modal.setAttribute('data-match-id', user.id);
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('match-modal').classList.add('hidden');
    loadCards();
}

function startChatFromModal() {
    const modal = document.getElementById('match-modal');
    const targetId = modal.getAttribute('data-match-id');
    closeModal();
    const db = getDB();
    const user = db.users.find(u => u.id === targetId);
    if(user) openChat(user);
}

// --- CHAT SYSTEM ---
function sendMessage() {
    const txt = document.getElementById('msg-input').value.trim();
    if(!txt) return;
    
    const db = getDB();
    const msg = { from: currentUser.id, to: activeChatUserId, text: txt, timestamp: Date.now(), read: false };
    db.messages.push(msg);
    saveDB(db);
    
    document.getElementById('msg-input').value = '';
    // Fix UI: Show Mic again after sending text
    document.getElementById('btn-mic').classList.remove('hidden');
    document.getElementById('btn-send-text').classList.add('hidden');

    renderChat();
    updateQuestProgress('msg'); // Hook: Quest

    // AI Bot Reply
    const isMock = mockUsers.some(u => u.id === activeChatUserId);
    if(isMock) {
        setTimeout(() => {
            const replies = [
                "555 จริงหรอ?", "ว่างไงบ้างวันนี้?", "รูปสวยจัง!", "กินข้าวยัง?", 
                "Haha nice one!", "Cool!", "ส่งสติกเกอร์มาหน่อยสิ", "😊"
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            botAutoReply(activeChatUserId, randomReply);
        }, 4000 + Math.random() * 3000);
    }
}

function botAutoReply(botId, text) {
    const db = getDB();
    db.messages.push({ from: botId, to: currentUser.id, text: text, timestamp: Date.now(), read: false });
    saveDB(db);
    if(activeChatUserId === botId) renderChat();
    else {
        showToast('มีข้อความใหม่!', 'comment-dots');
        updateMessageBadge();
    }
}

function renderChat() {
    const container = document.getElementById('chat-conversation');
    container.innerHTML = '';
    const db = getDB();
    const msgs = db.messages.filter(m => (m.from===currentUser.id && m.to===activeChatUserId) || (m.from===activeChatUserId && m.to===currentUser.id));
    
    let updated = false;
    msgs.forEach(m => {
        if(m.to === currentUser.id && !m.read) { m.read = true; updated = true; }
    });
    if(updated) saveDB(db);

    msgs.sort((a,b) => a.timestamp - b.timestamp).forEach(m => {
        const div = document.createElement('div');
        div.className = `msg-bubble ${m.from === currentUser.id ? 'sent' : 'received'}`;
        
        if(m.text.startsWith('[IMAGE]')) {
            const imgSrc = m.text.replace('[IMAGE]', '');
            div.innerHTML = `<img src="${imgSrc}" onclick="window.open(this.src)">`;
        } 
        else if (m.text.startsWith('[LOCATION]')) {
            div.innerHTML = `<i class="fas fa-map-marker-alt" style="color:#ef4444; margin-right:5px;"></i> Shared Location`;
        }
        else if (m.text.startsWith('[AUDIO]')) {
            const audioSrc = m.text.replace('[AUDIO]', '');
            const audioId = 'aud_' + m.timestamp;
            div.innerHTML = `
                <div class="audio-msg-bubble">
                    <div class="play-btn" onclick="playAudio('${audioId}', '${audioSrc}', this)">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="waveform-static"></div>
                    <small>${Math.floor(Math.random()*10)+5}s</small>
                </div>
                <audio id="${audioId}" src="${audioSrc}" hidden></audio>
            `;
        }
        else {
            div.innerHTML = m.text;
        }
        
        const time = new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const timeSpan = document.createElement('div');
        timeSpan.style.fontSize = '0.6rem';
        timeSpan.style.marginTop = '4px';
        timeSpan.style.opacity = '0.7';
        timeSpan.style.textAlign = m.from === currentUser.id ? 'right' : 'left';
        timeSpan.innerText = time;
        div.appendChild(timeSpan);

        container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
}

function loadMessages() {
    const db = getDB();
    const matchContainer = document.getElementById('new-matches-list');
    const chatContainer = document.getElementById('chat-list');
    matchContainer.innerHTML = ''; chatContainer.innerHTML = '';
    
    const myMatches = db.matches.filter(m => m.users.includes(currentUser.id));
    updateMessageBadge();

    myMatches.forEach(m => {
        const otherId = m.users.find(id => id !== currentUser.id);
        const other = db.users.find(u => u.id === otherId);
        
        const matchItem = document.createElement('div');
        matchItem.className = 'match-item';
        matchItem.innerHTML = `<img src="${other.img}"><span>${other.name}</span>`;
        matchItem.onclick = () => openChat(other);
        matchContainer.appendChild(matchItem);

        const msgs = db.messages.filter(msg => (msg.from===currentUser.id && msg.to===other.id) || (msg.from===other.id && msg.to===currentUser.id));
        msgs.sort((a,b) => a.timestamp - b.timestamp);
        
        const lastMsgObj = msgs.length > 0 ? msgs[msgs.length - 1] : null;
        let lastText = 'เริ่มบทสนทนา...';
        let isUnread = false;
        
        if(lastMsgObj) {
            if(lastMsgObj.text.startsWith('[AUDIO]')) lastText = '🎤 ส่งเสียงถึงคุณ...';
            else if(lastMsgObj.text.includes('<div')) lastText = 'ส่งของขวัญ...';
            else if(lastMsgObj.text.startsWith('[')) lastText = 'ส่งไฟล์แนบ...';
            else lastText = lastMsgObj.text;
            
            if(lastMsgObj.to === currentUser.id && !lastMsgObj.read) isUnread = true;
        }

        const chatItem = document.createElement('div');
        chatItem.className = 'msg-item';
        const verifiedHtml = other.isVerified ? `<i class="fas fa-check-circle verified-badge" style="font-size:0.8em;"></i>` : '';
        
        chatItem.innerHTML = `
            <img src="${other.img}">
            <div class="msg-info">
                <h4 style="${isUnread ? 'color:var(--primary);' : ''}">${other.name} ${verifiedHtml} ${isUnread ? '•' : ''}</h4>
                <p style="${isUnread ? 'font-weight:bold; color:var(--text-main);' : ''}">${lastText}</p>
            </div>
        `;
        chatItem.onclick = () => openChat(other);
        chatContainer.appendChild(chatItem);
    });
}

function updateMessageBadge() {
    const db = getDB();
    const myMatches = db.matches.filter(m => m.users.includes(currentUser.id));
    let unreadCount = 0;
    
    myMatches.forEach(m => {
        const otherId = m.users.find(id => id !== currentUser.id);
        const msgs = db.messages.filter(msg => msg.from===otherId && msg.to===currentUser.id);
        if(msgs.some(msg => !msg.read)) unreadCount++;
    });

    const badge = document.getElementById('nav-msg-badge');
    if(badge) {
        if(unreadCount > 0) {
            badge.classList.remove('hidden');
            document.getElementById('match-count').innerText = unreadCount;
        } else {
            badge.classList.add('hidden');
            document.getElementById('match-count').innerText = 0;
        }
    }
}

function openChat(user) {
    activeChatUserId = user.id;
    document.getElementById('chat-room').classList.remove('hidden');
    document.getElementById('chat-mate-name').innerText = user.name;
    document.getElementById('chat-mate-img').src = user.img;
    renderChat();
}
function closeChat() { document.getElementById('chat-room').classList.add('hidden'); activeChatUserId = null; loadMessages(); }

// --- CHAT EXTRAS ---
function toggleChatOptions() {
    document.getElementById('chat-options-dropdown').classList.toggle('active');
    document.getElementById('attach-dropdown').classList.remove('active');
}
function toggleAttachMenu() {
    document.getElementById('attach-dropdown').classList.toggle('active');
    document.getElementById('chat-options-dropdown').classList.remove('active');
}
function triggerPhotoUpload() {
    toggleAttachMenu();
    document.getElementById('chat-photo-input').click();
}
function handlePhotoUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const db = getDB();
            db.messages.push({ from: currentUser.id, to: activeChatUserId, text: `[IMAGE]${e.target.result}`, timestamp: Date.now(), read: false });
            saveDB(db);
            renderChat();
        };
        reader.readAsDataURL(file);
    }
    input.value = '';
}
function sendRealLocation() {
    toggleAttachMenu();
    showToast('กำลังระบุตำแหน่ง...', 'map-marker-alt');
    setTimeout(() => {
        const db = getDB();
        db.messages.push({ from: currentUser.id, to: activeChatUserId, text: `[LOCATION]https://maps.google.com`, timestamp: Date.now(), read: false });
        saveDB(db);
        renderChat();
    }, 1500);
}

function handleChatKey(e) {
    if(e.key === 'Enter') {
        sendMessage();
    }
}

function toggleStickerPicker() {
    const picker = document.getElementById('sticker-picker');
    picker.classList.toggle('hidden');
    document.getElementById('attach-dropdown').classList.remove('active');
}

function sendSticker(stickerEmoji) {
    const db = getDB();
    const stickerHTML = `<div style="font-size:3rem; line-height:1;">${stickerEmoji}</div>`;
    
    db.messages.push({ 
        from: currentUser.id, 
        to: activeChatUserId, 
        text: stickerHTML, 
        timestamp: Date.now(), 
        read: false 
    });
    saveDB(db);
    renderChat();
    document.getElementById('sticker-picker').classList.add('hidden');
}

function closeAllMenus() {
    const attach = document.getElementById('attach-dropdown');
    const sticker = document.getElementById('sticker-picker');
    const options = document.getElementById('chat-options-dropdown');
    
    if(attach) attach.classList.remove('active');
    if(sticker) sticker.classList.add('hidden');
    if(options) options.classList.remove('active');
}

// --- PROFILE & SETTINGS ---
function viewUserProfile(fromLikes = false) {
    if(!fromLikes) toggleChatOptions();
    const db = getDB();
    const user = db.users.find(u => u.id === activeChatUserId);
    if(!user) return;

    document.getElementById('view-user-img').src = user.img;
    const verifiedHtml = user.isVerified ? `<i class="fas fa-check-circle" style="color:#3b82f6;"></i>` : '';
    document.getElementById('view-user-name').innerHTML = `${user.name}, ${user.age} ${verifiedHtml}`;
    document.getElementById('view-user-bio').innerText = user.bio || "No Bio";
    
    const score = calculateCompatibility(currentUser, user);
    document.getElementById('view-user-score').innerText = `${score}% Match`;
    
    const tagsContainer = document.getElementById('view-user-tags');
    tagsContainer.innerHTML = '';
    if (user.tags) {
        tagsContainer.innerHTML = user.tags.map(tag => 
            `<span class="tag-badge" style="background:#eef2ff; color:#6366f1; border:none;">${tag}</span>`
        ).join('');
    }
    document.getElementById('view-user-modal').classList.remove('hidden');
}
function closeUserProfile() { document.getElementById('view-user-modal').classList.add('hidden'); }

function updateUI() {
    document.getElementById('header-avatar').src = currentUser.img;
    document.getElementById('profile-img-large').src = currentUser.img;
    const verifiedHtml = currentUser.isVerified ? `<i class="fas fa-check-circle verified-badge"></i>` : '';
    document.getElementById('profile-name-large').innerHTML = `${currentUser.name}, ${currentUser.age} ${verifiedHtml}`;
    document.getElementById('profile-bio-large').innerText = currentUser.bio;

    if(currentUser.isVip) {
        document.getElementById('profile-img-large').classList.add('vip-border');
        document.getElementById('vip-status-dot').classList.remove('hidden');
        document.getElementById('vip-badge-menu').classList.remove('hidden');
    }

    const db = getDB();
    const matches = db.matches.filter(m => m.users.includes(currentUser.id)).length;
    const likes = db.interactions.filter(i => i.toId === currentUser.id && (i.type === 'like' || i.type === 'superlike')).length;
    
    document.getElementById('stat-matches').innerText = matches;
    document.getElementById('stat-likes').innerText = likes;
}

// --- LIKES & VIP FEATURES ---
function loadLikes() {
    const db = getDB();
    const container = document.getElementById('likes-list');
    container.innerHTML = '';
    
    const myLikes = db.interactions.filter(i => i.fromId === currentUser.id && (i.type === 'like' || i.type === 'superlike'));
    const uniqueToIds = [...new Set(myLikes.map(i => i.toId))];
    document.getElementById('likes-count').innerText = uniqueToIds.length;

    if(uniqueToIds.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding-top:50px; color:#94a3b8;">ยังไม่มีคนที่ถูกใจ<br><small>ไปปัดขวาหาคนรู้ใจกันเถอะ!</small></div>`;
        return;
    }

    uniqueToIds.forEach(id => {
        const user = db.users.find(u => u.id === id);
        if(!user) return;
        const isMatch = db.matches.some(m => m.users.includes(currentUser.id) && m.users.includes(id));
        const verifiedHtml = user.isVerified ? `<i class="fas fa-check-circle verified-badge"></i>` : '';

        const div = document.createElement('div');
        div.className = 'like-card';
        div.innerHTML = `
            <img src="${user.img}">
            <div class="like-info">
                <h4>${user.name}, ${user.age} ${verifiedHtml} ${isMatch ? '<i class="fas fa-check-circle" style="color:#10b981;"></i>' : ''}</h4>
                <div class="like-tags">${user.tags ? user.tags.slice(0,2).map(t => `<span>${t}</span>`).join('') : ''}</div>
            </div>
            <div class="like-actions">
                <button class="btn-mini btn-chat" onclick="openChatDirect('${user.id}')"><i class="fas fa-comment"></i></button>
                <button class="btn-mini btn-profile" onclick="openProfileDirect('${user.id}')"><i class="fas fa-user"></i></button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openWhoLikedMe() {
    if(!currentUser.isVip) {
        document.getElementById('vip-limit-modal').classList.remove('hidden');
        return;
    }
    const db = getDB();
    const likedMe = db.interactions.filter(i => i.toId === currentUser.id && (i.type === 'like' || i.type === 'superlike'));
    const uniqueFromIds = [...new Set(likedMe.map(i => i.fromId))];

    const container = document.getElementById('who-liked-list');
    container.innerHTML = '';
    
    if(uniqueFromIds.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:#aaa;">ยังไม่มีใครแอบชอบคุณ</div>`;
    }

    uniqueFromIds.forEach(id => {
        const user = db.users.find(u => u.id === id);
        if(user) {
            const div = document.createElement('div');
            div.className = 'like-card';
            div.style.marginBottom = '10px';
            div.innerHTML = `
                <img src="${user.img}">
                <div class="like-info">
                    <h4>${user.name}</h4>
                    <small>แอบชอบคุณ!</small>
                </div>
                <button class="btn-primary" style="width:auto; padding:5px 15px; font-size:0.8rem;" onclick="processSwipe('${user.id}', 'like'); document.getElementById('who-liked-me-modal').classList.add('hidden');">Match เลย</button>
            `;
            container.appendChild(div);
        }
    });

    document.getElementById('who-liked-me-modal').classList.remove('hidden');
}

function buyVIP() {
    if(currentUser.isVip) { showToast("คุณเป็น VIP อยู่แล้ว", 'check'); return; }
    if(confirm("ยืนยันสมัคร VIP? (Free Trial)")) {
        currentUser.isVip = true;
        updateUserInDB(currentUser);
        updateUI(); 
        closeVipModal();
        showToast("Upgrade VIP สำเร็จ! 🎉", 'crown');
        fireConfetti();
    }
}

// --- UTILS ---
function openChatDirect(id) {
    const db = getDB();
    const user = db.users.find(u => u.id === id);
    if(user) openChat(user);
}
function openProfileDirect(id) {
    activeChatUserId = id; 
    viewUserProfile(true);
}
function unmatchUser() {
    if(!confirm("ยืนยันการเลิกแมตช์?")) return;
    const db = getDB();
    db.matches = db.matches.filter(m => !m.users.includes(activeChatUserId));
    saveDB(db);
    showToast("เลิกแมตช์เรียบร้อย", 'user-slash');
    closeUserProfile();
    closeChat();
    loadMessages();
}
function openEditProfile() {
    document.getElementById('edit-profile-modal').classList.remove('hidden');
    document.getElementById('edit-preview').src = currentUser.img;
    document.getElementById('edit-preview').classList.remove('hidden');
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-bio').value = currentUser.bio;
}
function closeEditProfile() { document.getElementById('edit-profile-modal').classList.add('hidden'); }
function saveProfileChanges() {
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === currentUser.id);
    db.users[idx].name = document.getElementById('edit-name').value;
    db.users[idx].bio = document.getElementById('edit-bio').value;
    if(uploadedBase64) db.users[idx].img = uploadedBase64;
    saveDB(db);
    currentUser = db.users[idx];
    updateUI();
    closeEditProfile();
    showToast('บันทึกข้อมูลแล้ว', 'save');
}
function openSettings() {
    document.getElementById('settings-modal').classList.remove('hidden');
    document.getElementById('set-interest').value = currentUser.interest || 'all';
    document.getElementById('set-age-min').value = currentUser.filterAgeMin || 18;
    document.getElementById('set-age-max').value = currentUser.filterAgeMax || 50;
    document.getElementById('set-distance').value = currentUser.filterDistMax || 20;
    updateAgeDisplay();
}
function closeSettings() { document.getElementById('settings-modal').classList.add('hidden'); }
function saveSettings() {
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === currentUser.id);
    db.users[idx].interest = document.getElementById('set-interest').value;
    db.users[idx].filterAgeMin = parseInt(document.getElementById('set-age-min').value);
    db.users[idx].filterAgeMax = parseInt(document.getElementById('set-age-max').value);
    db.users[idx].filterDistMax = parseInt(document.getElementById('set-distance').value);
    saveDB(db);
    currentUser = db.users[idx]; 
    closeSettings();
    loadCards(); 
    showToast('บันทึกการค้นหาแล้ว', 'check');
}
function updateUserInDB(updatedUser) {
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === updatedUser.id);
    if(idx !== -1) {
        db.users[idx] = updatedUser;
        saveDB(db);
    }
}
function closeVipModal() { document.getElementById('vip-limit-modal').classList.add('hidden'); }
function updateAgeDisplay() {
    const min = document.getElementById('set-age-min').value;
    const max = document.getElementById('set-age-max').value;
    document.getElementById('age-display').innerText = `${min} - ${max}`;
}
function toggleTag(el) { el.classList.toggle('selected'); }
function reportUser() {
    toggleChatOptions();
    if(prompt("ระบุเหตุผล:")) showToast("รายงานสำเร็จ ขอบคุณครับ", 'shield-alt');
}

// --- NEW SYSTEM: COINS & VIDEO CALL ---

function getUserCoins() {
    if(!currentUser.coins) { currentUser.coins = 100; updateUserInDB(currentUser); } 
    return currentUser.coins;
}

function updateCoinDisplay() {
    const coins = getUserCoins();
    const display = document.getElementById('user-coins-display');
    if(display) display.innerText = coins;
}

function toggleGiftMenu() {
    updateCoinDisplay();
    document.getElementById('gift-modal').classList.toggle('hidden');
    document.getElementById('attach-dropdown').classList.remove('active');
}

function sendGift(emoji, cost, name) {
    if(currentUser.coins < cost) {
        showToast('เหรียญไม่พอ! กรุณาเติมเงิน (จำลอง)', 'coins');
        return;
    }
    
    currentUser.coins -= cost;
    updateUserInDB(currentUser);
    updateCoinDisplay();
    
    // Hook: Update Quest
    updateQuestProgress('gift');

    const db = getDB();
    const giftMsg = `<div style="text-align:center; background:#fff0f5; padding:10px; border-radius:15px; border:1px solid #fbcfe8;">
        <div style="font-size:3rem;">${emoji}</div>
        <div style="font-weight:bold; color:#db2777;">ส่ง ${name} ให้คุณ</div>
    </div>`;
    
    db.messages.push({ from: currentUser.id, to: activeChatUserId, text: giftMsg, timestamp: Date.now(), read: false });
    saveDB(db);
    renderChat();
    toggleGiftMenu();
    showToast(`ส่ง ${name} เรียบร้อย (-${cost})`, 'gift');
    fireConfetti(); 
}

// --- VIDEO CALL SYSTEM ---
// --- CALL SYSTEM (Voice & Video) ---

// ฟังก์ชันโทรเสียง (Voice Call)
function startVoiceCall() {
    // ปิดเมนูอื่นๆ ถ้าเปิดอยู่
    closeAllMenus();
    
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast("เบราว์เซอร์ไม่รองรับการโทร", "phone-slash");
        return;
    }

    const db = getDB();
    const partner = db.users.find(u => u.id === activeChatUserId);
    if(!partner) return;

    // Setup UI
    document.getElementById('call-partner-img').src = partner.img;
    document.getElementById('call-partner-name').innerText = partner.name;
    document.getElementById('call-status').innerText = "กำลังโทรเสียง...";
    document.getElementById('call-timer').classList.add('hidden');
    
    // เปิดหน้าจอโทร และเพิ่ม class 'voice-mode' เพื่อซ่อนจอกล้องเรา
    const screen = document.getElementById('video-call-screen');
    screen.classList.remove('hidden');
    screen.classList.add('voice-mode'); 

    // ขอแค่เสียง (audio: true, video: false)
    navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        .then(stream => {
            // เราไม่ต้องแสดง video feed แต่ต้องเก็บ stream ไว้เพื่อ stop ทีหลัง
            const video = document.getElementById('my-video-feed');
            video.srcObject = stream;
            
            setTimeout(() => {
                document.getElementById('call-status').innerText = "Connected";
                document.getElementById('call-timer').classList.remove('hidden');
                startCallTimer();
                showToast("อีกฝ่ายรับสายแล้ว!", "phone");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            showToast("ไม่สามารถเข้าถึงไมโครโฟนได้", "exclamation-circle");
            endCall('voice');
        });
}

// ฟังก์ชันวิดีโอคอล (Video Call) - ปรับปรุงจากเดิมเล็กน้อย
function startVideoCall() {
    closeAllMenus(); // ปิดเมนูอื่น
    
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast("เบราว์เซอร์ไม่รองรับกล้อง", "video-slash");
        return;
    }

    const db = getDB();
    const partner = db.users.find(u => u.id === activeChatUserId);
    if(!partner) return;

    document.getElementById('call-partner-img').src = partner.img;
    document.getElementById('call-partner-name').innerText = partner.name;
    document.getElementById('call-status').innerText = "กำลังเชื่อมต่อวิดีโอ...";
    document.getElementById('call-timer').classList.add('hidden');
    
    // เปิดหน้าจอโทร และเอา class 'voice-mode' ออก เพื่อโชว์กล้อง
    const screen = document.getElementById('video-call-screen');
    screen.classList.remove('hidden');
    screen.classList.remove('voice-mode');

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            const video = document.getElementById('my-video-feed');
            video.srcObject = stream;
            
            setTimeout(() => {
                document.getElementById('call-status').innerText = "Connected";
                document.getElementById('call-timer').classList.remove('hidden');
                startCallTimer();
                showToast("อีกฝ่ายรับสายแล้ว!", "video");
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            showToast("ไม่สามารถเข้าถึงกล้องได้", "exclamation-circle");
            endCall('video');
        });
}

// เปลี่ยนชื่อจาก endVideoCall เป็น endCall เพื่อใช้ร่วมกัน
function endCall(type = 'video') {
    const video = document.getElementById('my-video-feed');
    if(video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    if(callTimerInterval) clearInterval(callTimerInterval);
    document.getElementById('video-call-screen').classList.add('hidden');
    
    const db = getDB();
    const icon = document.querySelector('.voice-mode') ? 'phone' : 'video'; // เช็คโหมดจากการมี class หรือไม่ (หรือใช้ param)
    const textMsg = type === 'voice' 
        ? '<i class="fas fa-phone-slash" style="color:#ef4444;"></i> สายสนทนาสิ้นสุดแล้ว'
        : '<i class="fas fa-video-slash" style="color:#ef4444;"></i> วิดีโอคอลสิ้นสุดแล้ว';

    db.messages.push({ 
        from: currentUser.id, 
        to: activeChatUserId, 
        text: textMsg, 
        timestamp: Date.now(), 
        read: false 
    });
    saveDB(db);
    renderChat();
}

// --- VOICE MESSAGE SYSTEM (NEW) ---
function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast("อุปกรณ์ไม่รองรับการอัดเสียง", "microphone-slash");
        return;
    }
    
    const overlay = document.getElementById('recording-overlay');
    if(overlay) overlay.classList.remove('hidden');
    audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result;
                    sendVoiceMessage(base64Audio);
                };
            });
        });
}

function stopRecording() {
    const overlay = document.getElementById('recording-overlay');
    if(overlay) overlay.classList.add('hidden');
    if(mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
}

function sendVoiceMessage(base64Data) {
    const db = getDB();
    const msg = { 
        from: currentUser.id, 
        to: activeChatUserId, 
        text: `[AUDIO]${base64Data}`, 
        timestamp: Date.now(), 
        read: false 
    };
    db.messages.push(msg);
    saveDB(db);
    renderChat();
    updateQuestProgress('msg');
}

function playAudio(id, src, btn) {
    const audio = document.getElementById(id);
    const icon = btn.querySelector('i');
    
    document.querySelectorAll('audio').forEach(a => {
        if(a.id !== id) { a.pause(); a.currentTime = 0; }
    });
    document.querySelectorAll('.play-btn i').forEach(i => i.className = 'fas fa-play');

    if (audio.paused) {
        audio.play();
        icon.className = 'fas fa-pause';
        audio.onended = () => icon.className = 'fas fa-play';
    } else {
        audio.pause();
        icon.className = 'fas fa-play';
    }
}

// --- QUEST SYSTEM (NEW) ---
function openQuests() {
    const modal = document.getElementById('quest-modal');
    const list = document.getElementById('quest-list');
    list.innerHTML = '';
    modal.classList.remove('hidden');

    quests.forEach(q => {
        const percent = Math.min((q.current / q.target) * 100, 100);
        const isComplete = q.current >= q.target;
        
        const div = document.createElement('div');
        div.className = 'quest-item';
        div.innerHTML = `
            <div class="quest-info">
                <div class="quest-title">${q.title} <span style="color:#ec4899;">(${q.current}/${q.target})</span></div>
                <div class="quest-progress-bar">
                    <div class="quest-progress-fill" style="width:${percent}%"></div>
                </div>
            </div>
            <button class="quest-btn ${isComplete && !q.claimed ? 'claimable' : ''}" 
                onclick="claimQuestReward('${q.id}')">
                ${q.claimed ? 'รับแล้ว' : (isComplete ? 'รับรางวัล' : `${q.reward} 🪙`)}
            </button>
        `;
        list.appendChild(div);
    });
}

function updateQuestProgress(type) {
    let updated = false;
    quests.forEach(q => {
        if(q.type === type && !q.claimed && q.current < q.target) {
            q.current++;
            updated = true;
            if(q.current === q.target) {
                showToast(`ภารกิจสำเร็จ: ${q.title}!`, 'trophy');
                const badge = document.getElementById('quest-badge');
                if(badge) badge.classList.remove('hidden');
            }
        }
    });
}

function claimQuestReward(qid) {
    const q = quests.find(x => x.id === qid);
    if(q && q.current >= q.target && !q.claimed) {
        q.claimed = true;
        currentUser.coins = (currentUser.coins || 0) + q.reward;
        updateUserInDB(currentUser);
        updateCoinDisplay();
        
        openQuests(); 
        showToast(`รับรางวัล ${q.reward} Coins!`, 'coins');
        fireConfetti();
        
        if(quests.every(x => x.claimed || x.current < x.target)) {
            const badge = document.getElementById('quest-badge');
            if(badge) badge.classList.add('hidden');
        }
    }
}

// --- DAILY & VERIFICATION ---
function checkDailyLogin() {
    const today = new Date().toDateString();
    if(currentUser.lastLoginDate !== today) {
        document.getElementById('daily-login-modal').classList.remove('hidden');
    }
}

function claimDailyBonus() {
    currentUser.coins = (currentUser.coins || 0) + 100;
    currentUser.lastLoginDate = new Date().toDateString();
    updateUserInDB(currentUser);
    document.getElementById('daily-login-modal').classList.add('hidden');
    showToast("รับ 100 Coins เรียบร้อย!", "coins");
    fireConfetti();
    updateCoinDisplay();
}

function startVerification() {
    if(currentUser.isVerified) {
        showToast("คุณยืนยันตัวตนไปแล้ว", "check-circle");
        return;
    }

    const modal = document.getElementById('verify-modal');
    const img = document.getElementById('verify-preview-img');
    const status = document.getElementById('verify-status');
    
    img.src = currentUser.img;
    modal.classList.remove('hidden');
    status.innerText = "Analyzing Face...";
    status.style.color = "#3b82f6";

    setTimeout(() => { status.innerText = "Checking Biometrics..."; }, 1500);
    setTimeout(() => { status.innerText = "Verifying with Server..."; }, 3000);
    setTimeout(() => { 
        status.innerText = "Verified Successfully!"; 
        status.style.color = "#10b981";
        
        currentUser.isVerified = true;
        updateUserInDB(currentUser);
        updateUI();
        
        setTimeout(() => {
            modal.classList.add('hidden');
            showToast("ยืนยันตัวตนสำเร็จ! (Blue Tick)", "check-double");
            fireConfetti();
        }, 1000);
    }, 4500);
}