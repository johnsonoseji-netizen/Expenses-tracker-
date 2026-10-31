// EXPENSE TRACKER v135 - BETTER SOLUTION - READY TO PASTE
let transactions = [];
let salary = 0;
let donutChart, barChart;

// --- BETTER AUTH SYSTEM ---
function getCurrentUser(){ try{ return JSON.parse(localStorage.getItem('currentUser')||'null'); }catch(e){ return null; } }
function getUserKey(k){ const u=getCurrentUser(); return u?`${k}_${u.email.toLowerCase()}`:k; }

function checkAuth(){
  const user=getCurrentUser();
  const auth=document.getElementById('auth');
  const header=document.getElementById('mainHeader');
  const nav=document.getElementById('mainNav');
  const debug=document.getElementById('authDebug');
  if(debug){
    let users=[]; try{ users=JSON.parse(localStorage.getItem('users')||'[]'); }catch(e){}
    debug.textContent=users.length===0?'No account on this phone. Click Register tab first!':users.length+' account(s) found on this phone.';
  }
  if(user){
    auth.style.display='none'; auth.classList.remove('active');
    header.style.display='flex'; nav.style.display='flex';
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('home').classList.add('active');
    document.querySelectorAll('#mainNav div').forEach(d=>d.classList.remove('active'));
    const h=document.querySelector('#mainNav div[data-page="home"]'); if(h) h.classList.add('active');
    document.getElementById('ownerNameDisplay').textContent=user.name;
    document.getElementById('ownerEmailDisplay').textContent=user.email;
    document.getElementById('headerName').textContent=user.name;
    document.getElementById('ownerSince').textContent='Member since '+(user.since||2024);
    const showPic=(src)=>{
      if(!src) return;
      document.getElementById('profileImg').src=src;
      document.getElementById('profileImg').style.display='block';
      document.getElementById('profileAvatar').style.display='none';
      const hImg=document.getElementById('headerAvatarImg');
      const hAv=document.getElementById('headerAvatar');
      if(hImg){ hImg.src=src; hImg.style.display='block'; hAv.style.display='none'; }
    };
    if(user.pic) showPic(user.pic);
    loadUserData();
  } else {
    auth.style.display='block'; auth.classList.add('active');
    header.style.display='none'; nav.style.display='none';
    document.querySelectorAll('.page').forEach(p=>{ if(p.id!=='auth') p.classList.remove('active'); });
  }
}

document.getElementById('loginTab').onclick=()=>{
  document.getElementById('loginTab').style.background='#fff'; document.getElementById('loginTab').style.color='#111';
  document.getElementById('registerTab').style.background='transparent'; document.getElementById('registerTab').style.color='#888';
  document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none';
};
document.getElementById('registerTab').onclick=()=>{
  document.getElementById('registerTab').style.background='#fff'; document.getElementById('registerTab').style.color='#111';
  document.getElementById('loginTab').style.background='transparent'; document.getElementById('loginTab').style.color='#888';
  document.getElementById('loginForm').style.display='none'; document.getElementById('registerForm').style.display='block';
};

document.getElementById('showAccounts').onclick=()=>{
  let users=[]; try{ users=JSON.parse(localStorage.getItem('users')||'[]'); }catch(e){}
  if(users.length===0) alert('No accounts on this phone.\n\nClick Register tab and create:\nName: Prince Oseji\nEmail: princeoseji@gmail.com\nPassword: 123456');
  else alert('Accounts on this phone:\n'+users.map(u=>u.email+' ('+u.name+')').join('\n'));
};

document.getElementById('registerBtn').onclick=()=>{
  const name=document.getElementById('regName').value.trim();
  let email=document.getElementById('regEmail').value.trim().toLowerCase();
  const p1=document.getElementById('regPass').value;
  const p2=document.getElementById('regPass2').value;
  if(!name||!email||!p1) return alert('Fill all fields');
  if(p1!==p2) return alert('Passwords do not match');
  if(p1.length<4) return alert('Password min 4 chars');
  let users=[]; try{ users=JSON.parse(localStorage.getItem('users')||'[]'); }catch(e){}
  if(users.find(u=>u.email.toLowerCase()===email)) return alert('Email already exists! Go to Login tab.');
  const newUser={name,email,pass:p1,pic:'',since:new Date().getFullYear()};
  users.push(newUser);
  localStorage.setItem('users',JSON.stringify(users));
  localStorage.setItem('currentUser',JSON.stringify(newUser));
  alert('Account created! Welcome '+name);
  checkAuth();
};

document.getElementById('loginBtn').onclick=()=>{
  let email=document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass=document.getElementById('loginPass').value;
  if(!email||!pass) return alert('Enter email & password');
  let users=[]; try{ users=JSON.parse(localStorage.getItem('users')||'[]'); }catch(e){}
  const u=users.find(x=>x.email.toLowerCase()===email && x.pass===pass);
  if(!u){
    const exists=users.find(x=>x.email.toLowerCase()===email);
    if(exists) return alert('Wrong password for '+email);
    return alert('No account for '+email+'. Click Register tab first!');
  }
  localStorage.setItem('currentUser',JSON.stringify(u));
  checkAuth();
};

document.getElementById('logoutBtn').onclick=()=>{
  if(confirm('Logout?')){ localStorage.removeItem('currentUser'); location.reload(); }
};

document.getElementById('uploadPic').addEventListener('change', e=>{
  const file=e.target.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=ev=>{
    const base=ev.target.result;
    document.getElementById('profileImg').src=base;
    document.getElementById('profileImg').style.display='block';
    document.getElementById('profileAvatar').style.display='none';
    document.getElementById('headerAvatarImg').src=base;
    document.getElementById('headerAvatarImg').style.display='block';
    document.getElementById('headerAvatar').style.display='none';
    let cur=getCurrentUser(); if(!cur) return;
    cur.pic=base;
    localStorage.setItem('currentUser',JSON.stringify(cur));
    let users=JSON.parse(localStorage.getItem('users')||'[]');
    users=users.map(u=>u.email.toLowerCase()===cur.email.toLowerCase()?cur:u);
    localStorage.setItem('users',JSON.stringify(users));
  };
  r.readAsDataURL(file);
});

// --- APP LOGIC ---
function loadUserData(){
  try{ transactions=JSON.parse(localStorage.getItem(getUserKey('transactions'))||'[]'); }catch(e){ transactions=[]; }
  salary=parseFloat(localStorage.getItem(getUserKey('salary'))||'0');
  const inp=document.getElementById('salaryInput'); if(inp) inp.value=salary||'';
  updateUI();
}
function saveData(){
  localStorage.setItem(getUserKey('transactions'), JSON.stringify(transactions));
  localStorage.setItem(getUserKey('salary'), salary);
}
document.querySelectorAll('#mainNav div').forEach(el=>{
  el.addEventListener('click',()=>{
    const page=el.dataset.page;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    document.querySelectorAll('#mainNav div').forEach(d=>d.classList.remove('active'));
    el.classList.add('active');
    if(page==='analysis') renderCharts();
    if(page==='budget') updateBudget();
  });
});
document.getElementById('setSalary').onclick=()=>{
  const v=parseFloat(document.getElementById('salaryInput').value);
  if(!v||v<=0) return alert('Enter valid salary');
  salary=v; saveData(); updateUI();
};
document.getElementById('addBtn').onclick=()=>{
  const amount=parseFloat(document.getElementById('amount').value);
  const category=document.getElementById('category').value;
  const date=document.getElementById('date').value||new Date().toISOString().split('T')[0];
  if(!amount||!category) return alert('Enter amount and category');
  transactions.unshift({id:Date.now(), amount, category, date});
  document.getElementById('amount').value=''; document.getElementById('category').value='';
  saveData(); updateUI();
};
document.getElementById('resetBtn').onclick=()=>{ if(confirm('Reset all transactions?')){ transactions=[]; saveData(); updateUI(); } };
document.getElementById('profileResetBtn').onclick=()=>{ if(confirm('Reset all data for this account?')){ transactions=[]; salary=0; saveData(); updateUI(); } };

function updateUI(){
  const totalExp=transactions.reduce((s,t)=>s+t.amount,0);
  const balance=salary-totalExp;
  document.getElementById('totalBal').textContent='₦'+balance.toLocaleString();
  document.getElementById('incomeVal').textContent='+₦'+salary.toLocaleString();
  document.getElementById('expVal').textContent='-₦'+totalExp.toLocaleString();
  const bIncome=document.getElementById('bIncome'); if(bIncome) bIncome.textContent='₦'+salary.toLocaleString();
  const bExp=document.getElementById('bExp'); if(bExp) bExp.textContent='₦'+totalExp.toLocaleString();
  const bSpent=document.getElementById('bSpent'); if(bSpent) bSpent.textContent='₦'+totalExp.toLocaleString();
  const bRem=document.getElementById('bRem'); if(bRem) bRem.textContent='₦'+(2000-totalExp).toLocaleString();
  const pBal=document.getElementById('pBal'); if(pBal){ pBal.textContent='₦'+balance.toLocaleString(); document.getElementById('pIncome').textContent='+₦'+salary.toLocaleString(); document.getElementById('pExp').textContent='-₦'+totalExp.toLocaleString(); document.getElementById('aTotal').textContent='₦'+totalExp.toLocaleString(); document.getElementById('aAvg').textContent='₦'+(transactions.length?Math.round(totalExp/30):0).toLocaleString(); }
  const list=document.getElementById('transList');
  if(transactions.length===0) list.innerHTML='No transactions yet';
  else list.innerHTML=transactions.slice(0,5).map(t=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee"><div><b>${t.category}</b><br><small style="color:#888">${t.date}</small></div><b style="color:#c94c4c">-₦${t.amount}</b></div>`).join('');
  const dot=document.querySelector('.dot'); if(dot){ if(transactions.length>0){ dot.style.display='grid'; dot.textContent=transactions.length; } else dot.style.display='none'; }
  updateBudget();
}
function updateBudget(){
  const cats={Food:0,Transport:0,Shopping:0,Bills:0};
  transactions.forEach(t=>{ if(cats[t.category]!==undefined) cats[t.category]+=t.amount; });
  const total=Object.values(cats).reduce((a,b)=>a+b,0);
  const container=document.getElementById('budgetCats'); if(!container) return;
  const icons={Food:'🍔',Transport:'🚌',Shopping:'🛍️',Bills:'💡'};
  const classes={Food:'food',Transport:'trans',Shopping:'shop',Bills:'bills'};
  container.innerHTML=Object.keys(cats).map(k=>{
    const pct=total?Math.min(100,Math.round((cats[k]/2000)*100)):0;
    return `<div class="budget-cat ${classes[k]}"><div class="budget-cat-top"><div class="budget-cat-left"><span class="cat-icon">${icons[k]}</span><div><b>${k}</b><small>₦${cats[k]} spent</small></div></div><div class="budget-cat-right">₦${cats[k]}</div></div><div class="progress"><div style="width:${pct}%"></div></div></div>`;
  }).join('');
  const overallPct=Math.min(100,Math.round((total/2000)*100));
  const bProg=document.getElementById('bProg'); if(bProg) bProg.style.width=overallPct+'%';
  const tip=document.getElementById('tipPct'); if(tip) tip.textContent=overallPct+'%';
}
function renderCharts(){
  const cats={Food:0,Transport:0,Shopping:0,Bills:0};
  transactions.forEach(t=>{ if(cats[t.category]!==undefined) cats[t.category]+=t.amount; });
  const ctx1=document.getElementById('donutChart');
  if(ctx1){ if(donutChart) donutChart.destroy(); donutChart=new Chart(ctx1,{type:'doughnut',data:{labels:Object.keys(cats),datasets:[{data:Object.values(cats),backgroundColor:['#ff7a00','#4a90e2','#e94e9a','#4caf50']}]},options:{plugins:{legend:{display:false}}}}); }
  const ctx2=document.getElementById('barChart');
  if(ctx2){ if(barChart) barChart.destroy(); const months={}; transactions.forEach(t=>{ const m=t.date.slice(0,7); months[m]=(months[m]||0)+t.amount; }); barChart=new Chart(ctx2,{type:'bar',data:{labels:Object.keys(months),datasets:[{label:'Spent',data:Object.values(months),backgroundColor:'#4a90e2'}]},options:{plugins:{legend:{display:false}}}}); }
}
document.getElementById('seeAllBtn').onclick=()=>{
  document.getElementById('historyModal').classList.add('show');
  const list=document.getElementById('fullHistoryList');
  list.innerHTML=transactions.length?transactions.map(t=>`<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee"><span><b>${t.category}</b><br><small>${t.date}</small></span><b>₦${t.amount}</b></div>`).join(''):'No history';
  document.getElementById('historyCount').textContent=transactions.length;
  document.getElementById('historyTotal').textContent='₦'+transactions.reduce((s,t)=>s+t.amount,0);
};
document.getElementById('closeHistory').onclick=()=>{ document.getElementById('historyModal').classList.remove('show'); };
document.getElementById('exportBtn').onclick=()=>{
  const data={user:getCurrentUser(),salary,transactions};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='expense-data.json'; a.click();
};
document.getElementById('darkModeToggle').onchange=(e)=>{
  document.body.classList.toggle('dark', e.target.checked);
  localStorage.setItem('darkMode', e.target.checked);
};
if(localStorage.getItem('darkMode')==='true'){ document.body.classList.add('dark'); const t=document.getElementById('darkModeToggle'); if(t) t.checked=true; }

checkAuth();
if(getCurrentUser()) loadUserData();