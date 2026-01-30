// --- 1. ระบบจัดการภาษา (คงเดิม) ---
const translations = {
    en: { nav_explore: "Explore", nav_history: "History", nav_community: "Community", nav_storage: "Storage", guest: "Guest", hero_title: "Secure Access", hero_subtitle: "Access your professional workspace and services." },
    th: { nav_explore: "สำรวจ", nav_history: "ประวัติ", nav_community: "ชุมชน", nav_storage: "คลังข้อมูล", guest: "ผู้เยี่ยมชม", hero_title: "การเข้าถึงที่ปลอดภัย", hero_subtitle: "เข้าใช้งานพื้นที่ทำงานและบริการของคุณ" },
    zh: { nav_explore: "探索", nav_history: "历史", nav_community: "社区", nav_storage: "存储", guest: "访客", hero_title: "安全访问", hero_subtitle: "访问您的专业工作空间和服务。" },
    ja: { nav_explore: "探索", nav_history: "履歴", nav_community: "コミュニティ", nav_storage: "ストレージ", guest: "ゲスト", hero_title: "セキュาアクセス", hero_subtitle: "プロフェッショナルなワークスペースにアクセス。" },
    ko: { nav_explore: "탐색", nav_history: "기록", nav_community: "커뮤니티", nav_storage: "스토리지", guest: "게스트", hero_title: "보안 액세스", hero_subtitle: "전문 작업 공간 및 서비스에 액세스하십시오" },
    ru: { nav_explore: "Обзор", nav_history: "История", nav_community: "Сообщество", nav_storage: "Хранилище", guest: "Гость", hero_title: "Безопасный доступ", hero_subtitle: "Доступ к вашему рабочему пространству и услугам." }
};

function changeLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.innerText = translations[lang][key];
    });
}

// --- 2. Custom Dropdown & Mobile Menu ---
const langDropdown = document.getElementById('langDropdown');
const navMenu = document.getElementById('nav-menu');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

langDropdown.onclick = (e) => { e.stopPropagation(); langDropdown.classList.toggle('active'); };

document.querySelectorAll('.lang-list li').forEach(item => {
    item.onclick = () => {
        const lang = item.getAttribute('data-lang');
        document.getElementById('current-flag').src = item.querySelector('img').src;
        document.getElementById('current-lang-code').innerText = lang.toUpperCase();
        changeLanguage(lang);
    };
});

// Hamburger Toggle
mobileMenuBtn.onclick = (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
};

window.onclick = () => {
    langDropdown.classList.remove('active');
    navMenu.classList.remove('active');
    mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
};

// --- 3. ระบบฟอร์ม (คงเดิม) ---
const loginBox = document.getElementById('login-box');
const regBox = document.getElementById('reg-box');
const forgotBox = document.getElementById('forgot-box');

function switchBox(from, to) {
    from.classList.remove('active');
    setTimeout(() => { from.style.display = 'none'; to.style.display = 'block'; }, 200);
    setTimeout(() => to.classList.add('active'), 250);
}

document.getElementById('to-reg').onclick = () => switchBox(loginBox, regBox);
document.getElementById('to-login').onclick = () => switchBox(regBox, loginBox);
document.getElementById('to-forgot').onclick = () => switchBox(loginBox, forgotBox);
document.getElementById('forgot-to-login').onclick = () => {
    document.getElementById('reset-section').style.display = 'none';
    document.getElementById('forgot-btn').innerText = "Verify Account";
    switchBox(forgotBox, loginBox);
};

document.getElementById('reg-password').oninput = (e) => {
    const val = e.target.value;
    const bar = document.getElementById('strength-bar');
    let s = 0;
    if(val.length > 7) s += 25;
    if(/[A-Z]/.test(val)) s += 25;
    if(/[0-9]/.test(val)) s += 25;
    if(/[^A-Za-z0-9]/.test(val)) s += 25;
    bar.style.width = s + '%';
    bar.style.backgroundColor = s < 50 ? '#ff4b2b' : s < 100 ? '#ffb400' : '#00e676';
};

// API Mockup
document.getElementById('login-btn').onclick = () => {
    if(document.getElementById('login-username').value === "admin") {
        alert("Login Successful");
        document.getElementById('display-user').innerText = "admin";
    } else {
        alert("Verification Required.");
    }
};