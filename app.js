// ===== EXPENSE TRACKER WITH STORED NOTIFICATIONS + DATE =====
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

// ===== NOTIFICATION SYSTEM WITH DATE STORAGE =====
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
  if(dot){
    dot.style.display = notifications.length > 0 ? 'block' : 'none';
    // Show count
    if(notifications.filter(n=>!n.read).length > 0){
      dot.textContent = notifications.filter(n=>!n.read).length;
    }
  }
}

function showNotif(title, body, type='info'){
  const {full, iso} = formatDate();
  
  // 1. SAVE TO HISTORY WITH DATE
  notifications.unshift({
    id: Date.now(),
    title,
    body,
    date: full,
    iso,
    type,
    read: false
  });
  // Keep only last 50
  if(notifications.length > 50) notifications = notifications.slice(0,50);
  saveNotifications();

  // 2. Toast
  const toast = document.createElement('div');
  toast.innerHTML = `<b>${title}</b><br><small>${body}</small><br><small style="opacity:0.7;font-size:10px;">${full}</small>`;
  toast.style.cssText = `position:fixed;top:70px;left:50%;transform:translateX(-50%);background:#111;color:white;padding:12px 18px;border-radius:14px;font-size:13px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.3);max-width:85%;line-height:1.4;`;
  document.body.appendChild(toast);
  setTimeout(()=> toast.remove(), 4500);

  // 3. System notification
  if('Notification' in window && Notification.permission === 'granted'){
    new Notification(title, {body: `${body}\n${full}`, icon:'https://cdn-icons-png.flaticon.com/512/2331/2331941.png'});
  }
  if(navigator.vibrate) navigator.vibrate([100,50,100]);
}

// Show notification panel when bell clicked
function showNotificationPanel(){
  // Mark all as read
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
      if(confirm('Clear all notifications?')){
        notifications=[]; saveNotifications(); panel.remove();
      }
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
  if(bSpent) bSpent.textContent = `£${totalExpenses.toLocaleString()}`;
  if(bRem) {
    const remaining = 2000 - totalExpenses;
    bRem.textContent = `£${remaining.toLocaleString()}`;
  }
  if(bProg) bProg.style.width = `${Math.min(100, Math.round((totalExpenses/2000)*100))}%`;

  // LOW BALANCE CHECK
  if(totalBalance > 0 && totalBalance < 50){
    // Only notify once per low balance state
    const lastLow = localStorage.getItem('lastLowNotif');
    if(lastLow !== totalBalance.toString()){
      showNotif('⚠️ Low Balance Alert!', `Your balance is only £${totalBalance}. Below 50 naira threshold!`, 'warning');
      localStorage.setItem('lastLowNotif', totalBalance.toString());
    }
    if(totalBalEl) totalBalEl.style.color = '#e53935';
  } else {
    if(totalBalEl) totalBalEl.style.color = '#0a6b2e';
    localStorage.removeItem('lastLowNotif');
  }

  if(transactions.length === 0){
    transListEl.innerHTML = `No transactions yet`;
  } else {
    transListEl.innerHTML = transactions.map(t=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0;">
        <div style="display:flex;gap:10px;align-items:center;">
          <span style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;display:grid;place-items:center;">${t.category==='Food'?'🍔':t.category==='Transport'?'🚗':t.category==='Shopping'?'🛍️':'💡'}</span>
          <div><b style="font-size:14px;">${t.category}</b><br><small style="color:#888;">${t.date}</small></div>
        </div>
        <b style="color:#c94c4c;">-£${t.amount}</b>
      </div>
    `).join('');
  }
  save();
  updateBellCount();
}

// EVENTS
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
  transactions.unshift({amount, category, date});
  document.getElementById('amount').value = '';
  updateUI();
  showNotif('Purchase Recorded 🛒', `You spent £${amount} on ${category} • ${date}`, 'expense');
});

document.getElementById('resetBtn')?.addEventListener('click', ()=>{
  if(confirm('Reset all?')){
    income=0; transactions=[]; notifications=[]; localStorage.clear(); updateUI();
    showNotif('System', 'All data cleared', 'info');
  }
});

// BELL ICON - SHOW STORED NOTIFICATIONS WITH DATE
document.querySelectorAll('.icon-btn')[0]?.addEventListener('click', ()=>{
  showNotificationPanel();
});

document.querySelectorAll('.nav div[data-page]').forEach(el=>{
  el.addEventListener('click', ()=>{
    document.querySelectorAll('.nav div').forEach(n=> n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.page').forEach(p=> p.classList.remove('active'));
    document.getElementById(el.dataset.page)?.classList.add('active');
  });
});

updateUI();
updateBellCount();