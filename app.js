// EXPENSE TRACKER v134 - FULL WITH AUTH
let transactions = [];
let salary = 0;
let donutChart, barChart;

// --- AUTH SYSTEM ---
const authPage = document.getElementById('auth');
const mainHeader = document.getElementById('mainHeader');
const mainNav = document.getElementById('mainNav');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function getCurrentUser(){ return JSON.parse(localStorage.getItem('currentUser')||'null'); }
function getUserKey(key){
  const u = getCurrentUser();
  return u ? `${key}_${u.email}` : key;
}

function checkAuth(){
  const user = getCurrentUser();
  if(user){
    authPage.classList.remove('active');
    authPage.style.display='none';
    mainHeader.style.display='flex';
    mainNav.style.display='flex';
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('home').classList.add('active');
    document.querySelectorAll('.nav div').forEach(d=>d.classList.remove('active'));
    document.querySelector('.nav div[data-page="home"]').classList.add('active');
    // Profile display
    document.getElementById('ownerNameDisplay').textContent=user.name;
    document.getElementById('ownerEmailDisplay').textContent=user.email;
    document.getElementById('headerName').textContent=user.name;
    document.getElementById('ownerSince').textContent='Member since '+(user.since||new Date().getFullYear());
    if(user.pic){
      document.getElementById('profileImg').src=user.pic;
      document.getElementById('profileImg').style.display='block';
      document.getElementById('profileAvatar').style.display='none';
    }
    loadUserData();
  } else {
    authPage.classList.add('active');
    authPage.style.display='block';
    mainHeader.style.display='none';
    mainNav.style.display='none';
    document.querySelectorAll('.page').forEach(p=>{ if(p.id!=='auth') p.classList.remove('active'); });
  }
}

if(loginTab){
loginTab.onclick=()=>{
  loginTab.classList.add('active'); loginTab.style.background='#fff'; loginTab.style.color='#111';
  registerTab.classList.remove('active'); registerTab.style.background='transparent'; registerTab.style.color='#888';
  loginForm.style.display='block'; registerForm.style.display='none';
}
registerTab.onclick=()=>{
  registerTab.classList.add('active'); registerTab.style.background='#fff'; registerTab.style.color='#111';
  loginTab.classList.remove('active'); loginTab.style.background='transparent'; loginTab.style.color='#888';
  loginForm.style.display='none'; registerForm.style.display='block';
}

document.getElementById('registerBtn').onclick=()=>{
  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const p1=document.getElementById('regPass').value;
  const p2=document.getElementById('regPass2').value;
  if(!name||!email||!p1) return alert('Fill all fields');
  if(p1!==p2) return alert('Passwords do not match');
  const users=JSON.parse(localStorage.getItem('users')||'[]');
  if(users.find(u=>u.email===email)) return alert('Email already registered');
  const newUser={name,email,pass:p1,since:new Date().getFullYear(),pic:''};
  users.push(newUser);
  localStorage.setItem('users',JSON.stringify(users));
  localStorage.setItem('currentUser',JSON.stringify(newUser));
  alert('Account created! Welcome '+name);
  checkAuth();
}
document.getElementById('loginBtn').onclick=()=>{
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPass').value;
  const users=JSON.parse(localStorage.getItem('users')||'[]');
  const u=users.find(x=>x.email===email && x.pass===pass);
  if(!u) return alert('Wrong email or password');
  localStorage.setItem('currentUser',JSON.stringify(u));
  checkAuth();
}
document.getElementById('logoutBtn').onclick=()=>{
  if(confirm('Logout?')){
    localStorage.removeItem('currentUser');
    location.reload();
  }
}
document.getElementById('uploadPic').addEventListener('change', function(e){
  const file=e.target.files[0];
  if(!file) return;
  const r=new FileReader();
  r.onload=ev=>{
    const base=ev.target.result;
    document.getElementById('profileImg').src=base;
    document.getElementById('profileImg').style.display='block';
    document.getElementById('profileAvatar').style.display='