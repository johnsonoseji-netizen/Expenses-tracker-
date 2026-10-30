// ===== EXPENSE TRACKER - FINAL CORRECTED WITH SEE ALL + STORED NOTIFICATIONS =====
let income = parseFloat(localStorage.getItem('income')) || 0;
let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

const totalBalEl = document.getElementById('totalBal');
const incomeValEl = document.getElementById('incomeVal');
const expValEl = document.getElementById('expVal');
const transListEl = document.getElementById('transList');
const salaryInput = document.getElementById('salaryInput');
const dateInput = document.getElementById('date');
if(dateInput) dateInput.valueAsDate = new Date();

function requestNotifPermission(){
  if('Notification' in window && Notification.permission !== 'granted'){
    Notification.requestPermission();
  }
}
requestNotifPermission();

function formatDate(){
  const now = new Date();
  const date = now.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'});
  const time = now.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
  return {full: `${date} • ${time}`, iso: now.toISOString()};
}

function saveNotifications(){
  localStorage.setItem('notifications', JSON.stringify(notifications));
  updateBellCount();
}

function updateBellCount(){
  const dot = document.querySelector('.dot');
  if(!dot) return;
  const unread = notifications.filter(n=>!n.read).length;
  if(unread > 0){
    dot.style.display = 'grid';
    dot.textContent = unread > 9 ? '9+' : unread;
    dot.style.minWidth = '18px';
    dot.style.height = '18px';
    dot.style.fontSize = '11px';
  } else {
    dot.style.display = notifications.length > 0 ? 'block' : 'none';
    dot.textContent = '';
    if(notifications.length === 0) dot.style.display = 'none';
  }
}

function showNotif(title, body, type='info'){
  const {full, iso} = formatDate();
  notifications.unshift({id: Date.now(), title, body, date: full, iso, type, read: false});
  if(notifications.length > 50) notifications = notifications.slice(0,50);
  saveNotifications();

  const toast = document.createElement('div');
  toast.innerHTML = `<b>${title}</b><br><small>${body}</small><br><small style="opacity:0.7;font-size:10px;">${full}</small>`;
  toast.style.cssText = `position:fixed;top:70px;left:50%;transform:translateX(-50%);background:#111;color:white;padding:12px 18px;border-radius:14px;font-size:13px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.3);max-width:85%;line-height:1.4;`;
  document.body.appendChild(toast);
  setTimeout(()=> toast.remove(), 4500);

  if('Notification' in window && Notification.permission === 'granted'){
    new Notification(title, {body: `${body}\n${full}`});
  }
  if(navigator.vibrate) navigator.vibrate([100,50,100]);
}

function showNotificationPanel(){
  notifications.forEach(n=> n.read = true);
  saveNotifications();
  let panel = document.getElementById('notifPanel');
  if(panel) panel.remove();
  panel = document.createElement('div');
  panel.id = 'notifPanel';
  panel.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:flex-end;`;
  const listHtml = notifications.length === 0 ? 
    `<div style="padding:40px;text-align:center;color:#888;">No notifications yet</div>` :
    notifications.map(n=>`
      <div style="padding:14px 16px;border-bottom:1px solid #f0f0f0;display:flex;gap:12px;">
        <div style="width:38px;height:38px;border-radius:10px;background:${n.type==='salary'?'#e8f5e9':n.type==='expense'?'#ffebee':n.type==='warning'?'#fff3e0':'#f0f7ff'};display:grid;place-items:center;font-size:18px;flex-shrink:0;">
          ${n.type==='salary'?'💰':n.type==='expense'?'🛒':n.type==='warning'?'⚠️':'🔔'}
        </div>
        <div style="flex:1;">
          <b style="font-size:14px;color:#111;">${n.title}</b>
          <p style="font-size:13px;color:#444;margin:2px 0 4px;">${n.body}</p>
          <small style="font-size:11px;color:#888;">${n.date}</small>
        </div>
      </div>
    `).join('');

  panel.innerHTML = `
    <div style="background:white;width:100%;max-height:75vh;border-radius:20px 20px 0 0;overflow:hidden;display:flex;flex-direction:column;">
      <div style="padding:16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;">
        <b style="font-size:17px;">Notifications</b>
        <div style="display:flex;gap:10px;">
          <button id="clearNotif" style="background:#f5f5f7;border:none;padding:6px 12px;border-radius:20px;font-size:12px;">Clear</button>
          <button id="closeNotif" style="background:#111;color:white;border:none;width:30px;height:30px;border-radius:50%;">✕</button>
        </div>
      </div>
      <div style="overflow-y:auto;flex:1;">${listHtml}</div>
    </div>
  `;
  document.body.appendChild(panel);
  panel.addEventListener('click', (e)=>{
    if(e.target.id==='closeNotif' || e.target.id==='notifPanel') panel.remove();
    if(e.target.id==='clearNotif'){
      if(confirm('Clear all notifications?')){ notifications=[]; saveNotifications(); panel.remove(); }
    }
  });
}

function save(){
  localStorage.setItem('income', income.toString());
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateUI(){
  const totalExpenses = transactions.reduce((s,t)=> s+t.amount, 0);
  const totalBalance = income - totalExpenses;
  
  if(totalBalEl) totalBalEl.textContent = `£${totalBalance.toLocaleString()}`;
  if(incomeValEl) incomeValEl.textContent = `+£${income.toLocaleString()}`;
  if(expValEl) expValEl.textContent = `-£${totalExpenses.toLocaleString()}`;

  const bSpent = document.getElementById('bSpent');
  const bRem = document.getElementById('bRem');
  const bProg = document.getElementById('bProg');
  const bIncome = document.getElementById('bIncome');
  const bExp = document.getElementById('bExp');
  const tipPct = document.getElementById('tipPct');
  
  if(bSpent) bSpent.textContent = `£${totalExpenses.toLocaleString()}`;
  if(bRem){
    const remaining = 2000 - totalExpenses;
    bRem.textContent = `£${remaining.toLocaleString()}`;
    bRem.style.color = remaining < 0 ? '#e53935' : '#0a6b2e';
  }
  if(bProg) bProg.style.width = `${Math.min(100, Math.round((totalExpenses/2000)*100))}%`;
  if(bIncome) bIncome.textContent = `£${income.toLocaleString()}`;
  if(bExp) bExp.textContent = `£${totalExpenses.toLocaleString()}`;
  if(tipPct) tipPct.textContent = `${Math.min(100, Math.round((totalExpenses/2000)*100))}%`;

  if(totalBalance > 0 && totalBalance < 50){
    const lastLow = localStorage.getItem('lastLowNotif');
    if(lastLow !== totalBalance.toString()){
      showNotif('⚠️ Low Balance Alert!', `Your balance is only £${totalBalance}. Below 50 threshold!`, 'warning');
      localStorage.setItem('lastLowNotif', totalBalance.toString());
    }
    if(totalBalEl) totalBalEl.style.color = '#e53935';
  } else {
    if(totalBalEl) totalBalEl.style.color = '#0a6b2e';
    localStorage.removeItem('lastLowNotif');
  }

  if(transactions.length === 0){
    transListEl.innerHTML = `<div style="padding:12px;text-align:center;color:#888;">No transactions yet</div>`;
  } else {
    const recent = transactions.slice(0,3);
    transListEl.innerHTML = recent.map(t=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f0f0f0;">
        <div style="display:flex;gap:10px;align-items:center;min-width:0;flex:1;">
          <span style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;display:grid;place-items:center;flex-shrink:0;">${t.category==='Food'?'🍔':t.category==='Transport'?'🚗':t.category==='Shopping'?'🛍️':'💡'}</span>
          <div style="min-width:0;overflow:hidden;">
            <b style="font-size:14px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.category}</b>
            <small style="color:#888;font-size:12px;">${t.date}</small>
          </div>
        </div>
        <b style="color:#c94c4c;flex-shrink:0;margin-left:10px;">-£${t.amount}</b>
      </div>
    `).join('');
  }

  renderBudgetCats();
  save();
  updateBellCount();
}

function renderBudgetCats(){
  const container = document.getElementById('budgetCats');
  if(!container) return;
  const cats = [
    {name:'Food', icon:'🍔', color:'food', budget:500},
    {name:'Transport', icon:'🚗', color:'trans', budget:400},
    {name:'Shopping', icon:'🛍️', color:'shop', budget:600},
    {name:'Bills', icon:'💡', color:'bills', budget:500},
  ];
  container.innerHTML = cats.map(c=>{
    const spent = transactions.filter(t=> t.category===c.name).reduce((s,t)=>s+t.amount,0);
    const pct = Math.min(100, Math.round((spent/c.budget)*100));
    return `<div class="budget-cat ${c.color}"><div class="budget-cat-top"><div class="budget-cat-left"><div class="cat-icon">${c.icon}</div><div><b>${c.name}</b><small>£${spent} of £${c.budget}</small></div></div><div class="budget-cat-right"><strong>${pct}%</strong></div></div><div class="progress"><div style="width:${pct}%"></div></div></div>`;
  }).join('');
}

function showFullHistory(){
  const modal = document.getElementById('historyModal');
  const list = document.getElementById('fullHistoryList');
  const countEl = document.getElementById('historyCount');
  const totalEl = document.getElementById('historyTotal');
  if(!modal || !list) return;
  const totalExpenses = transactions.reduce((s,t)=> s+t.amount, 0);
  if(countEl) countEl.textContent = transactions.length;
  if(totalEl) totalEl.textContent = `£${totalExpenses.toLocaleString()}`;
  if(transactions.length === 0){
    list.innerHTML = `<div style="text-align:center;padding:40px;color:#888;">No transactions yet</div>`;
  } else {
    list.innerHTML = transactions.map((t, idx)=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid #f5f5f7;">
        <div style="display:flex;gap:12px;align-items:center;">
          <span style="width:42px;height:42px;background:#f5f5f7;border-radius:10px;display:grid;place-items:center;font-size:18px;">${t.category==='Food'?'🍔':t.category==='Transport'?'🚗':t.category==='Shopping'?'🛍️':'💡'}</span>
          <div><b style="font-size:15px;">${t.category}</b><div style="font-size:12px;color:#888;">${t.date} • #${transactions.length-idx}</div></div>
        </div>
        <b style="color:#c94c4c;">-£${t.amount}</b>
      </div>
    `).join('');
  }
  modal.style.display = 'flex';
}

document.getElementById('setSalary')?.addEventListener('click', ()=>{
  const val = parseFloat(salaryInput.value);
  if(!val || val <=0){ alert('Enter valid salary'); return; }
  income += val;
  salaryInput.value = '';
  updateUI();
  showNotif('Salary Received! 💰', `£${val.toLocaleString()} added. Income: £${income.toLocaleString()}`, 'salary');
});

document.getElementById('addBtn')?.addEventListener('click', ()=>{
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  if(!amount || amount<=0){ alert('Enter valid amount'); return; }
  if(!category){ alert('Choose category'); return; }
  if(!date){ alert('Choose date'); return; }
  transactions.unshift({amount, category, date});
  document.getElementById('amount').value = '';
  document.getElementById('category').value = '';
  updateUI();
  showNotif('Purchase Recorded 🛒', `You spent £${amount} on ${category} • ${date}`, 'expense');
});

document.getElementById('resetBtn')?.addEventListener('click', ()=>{
  if(confirm('Reset all? This deletes everything permanently.')){
    income=0; transactions=[]; notifications=[]; localStorage.clear(); updateUI();
  }
});

document.getElementById('notifBell')?.addEventListener('click', showNotificationPanel);
document.getElementById('seeAllBtn')?.addEventListener('click', showFullHistory);
document.getElementById('closeHistory')?.addEventListener('click', ()=>{
  document.getElementById('historyModal').style.display='none';
});
document.getElementById('historyModal')?.addEventListener('click', (e)=>{
  if(e.target.id==='historyModal') e.currentTarget.style.display='none';
});

document.querySelectorAll('.nav div[data-page]').forEach(el=>{
  el.addEventListener('click', ()=>{
    document.querySelectorAll('.nav div').forEach(n=> n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.page').forEach(p=> p.classList.remove('active'));
    const target = document.getElementById(el.dataset.page);
    if(target) target.classList.add('active');
  });
});

updateUI();
updateBellCount();