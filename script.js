// Switch Logic
const loginBox = document.getElementById('login-box');
const regBox = document.getElementById('reg-box');

document.getElementById('to-reg').onclick = () => {
    loginBox.classList.remove('active');
    setTimeout(() => { loginBox.style.display = 'none'; regBox.style.display = 'block'; }, 200);
    setTimeout(() => regBox.classList.add('active'), 250);
}

document.getElementById('to-login').onclick = () => {
    regBox.classList.remove('active');
    setTimeout(() => { regBox.style.display = 'none'; loginBox.style.display = 'block'; }, 200);
    setTimeout(() => loginBox.classList.add('active'), 250);
}

// Security Logic
const strengthBar = document.getElementById('strength-bar');
document.getElementById('reg-password').oninput = (e) => {
    const val = e.target.value;
    let s = 0;
    if(val.length > 7) s += 25;
    if(/[A-Z]/.test(val)) s += 25;
    if(/[0-9]/.test(val)) s += 25;
    if(/[^A-Za-z0-9]/.test(val)) s += 25;
    
    strengthBar.style.width = s + '%';
    strengthBar.style.backgroundColor = s < 50 ? '#ff4b2b' : s < 100 ? '#ffb400' : '#00e676';
};

// Storage Logic
document.getElementById('register-btn').onclick = () => {
    const u = document.getElementById('reg-username').value;
    const p = document.getElementById('reg-password').value;
    if(!u || !p) return alert("Please fill all fields");
    
    localStorage.setItem(u, JSON.stringify({user: u, pass: btoa(p)}));
    alert("Identity Created.");
    document.getElementById('to-login').click();
};

let fails = 0;
document.getElementById('login-btn').onclick = () => {
    if(fails >= 3) return alert("SECURITY LOCK: Too many attempts.");
    
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    const data = JSON.parse(localStorage.getItem(u) || '{}');

    if(data.pass === btoa(p)) {
        alert("ACCESS GRANTED");
        document.getElementById('display-user').innerText = u;
        fails = 0;
    } else {
        fails++;
        alert(`Access Denied (${fails}/3)`);
    }
};