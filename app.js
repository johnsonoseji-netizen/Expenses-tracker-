let income = parseFloat(localStorage.getItem('income')) || 0;
let transactions = [];
try { transactions = JSON.parse(localStorage.getItem('transactions') || '[]'); } catch(e){ transactions = []; }
let notifications = [];
try { notifications = JSON.parse(localStorage.getItem('notifications') || '[]'); } catch(e){ notifications = []; }

document.addEventListener('DOMContentLoaded', function(){
  const totalBalEl = document.getElementById('totalBal');
  const incomeValEl = document.getElementById('incomeVal');
  const expValEl = document.getElementById('expVal');
  const transListEl = document.getElementById('transList');
  const salaryInput = document.getElementById('salaryInput');
  const dateInput = document.getElementById('date');
  if(dateInput) dateInput.valueAsDate = new Date();

  function save(){
    localStorage.setItem('income', income.toString());
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  function updateBellCount(){
    const dot = document.querySelector('.dot');
    if(!dot) return;
    const unread = notifications.filter(function(n){return !n.read;}).length;
    if(unread>0){
      dot.style.display='grid';
      dot.textContent = unread>9?'9+':unread;
    } else {
      dot.style.display='none';
    }
  }

  function showNotif(title, body){
    const now = new Date();
    const full = now.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})+' • '+now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    notifications.unshift({id:Date.now(),title:title,body:body,date:full,read:false});
    if(notifications.length>50) notifications = notifications.slice(0,50);
    save(); updateBellCount();
    const toast = document.createElement('div');
    toast.textContent = title+' - '+body;
    toast.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:12px 18px;border-radius:14px;z-index:9999;font-size:13px;';
    document.body.appendChild(toast);
    setTimeout(function(){ toast.remove(); },3000);
  }

  function renderBudgetCats(){
    const container = document.getElementById('budgetCats');
    if(!container) return;
    const cats = [
      {name:'Food', icon:'🍔', color:'food', budget:500},
      {name:'Transport', icon:'🚗', color:'trans', budget:400},
      {name:'Shopping', icon:'🛍️', color:'shop', budget:600},
      {name:'Bills', icon:'💡', color:'bills', budget:500}
    ];
    let html = '';
    for(let i=0;i<cats.length;i++){
      const c = cats[i];
      let spent = 0;
      for(let j=0;j<transactions.length;j++){
        if(transactions[j].category===c.name) spent += parseFloat(transactions[j].amount)||0;
      }
      const pct = c.budget>0 ? Math.min(100, Math.round((spent/c.budget)*100)) : 0;
      html += '<div class="budget-cat '+c.color+'"><div class="budget-cat-top"><div class="budget-cat-left"><div class="cat-icon">'+c.icon+'</div><div><b>'+c.name+'</b><small>'+pct+'%</small></div></div><div class="budget-cat-right">₦'+spent+' of ₦'+c.budget+'</div></div><div class="progress"><div style="width:'+pct+'%"></div></div></div>';
    }
    container.innerHTML = html;
  }

  function updateUI(){
    let totalExpenses = 0;
    for(let i=0;i<transactions.length;i++){ totalExpenses += parseFloat(transactions[i].amount)||0; }
    const totalBalance = income - totalExpenses;
    if(totalBalEl) totalBalEl.textContent = '₦'+totalBalance.toLocaleString();
    if(incomeValEl) incomeValEl.textContent = '+₦'+income.toLocaleString();
    if(expValEl) expValEl.textContent = '-₦'+totalExpenses.toLocaleString();
    const bSpent = document.getElementById('bSpent');
    const bRem = document.getElementById('bRem');
    const bProg = document.getElementById('bProg');
    const bIncome = document.getElementById('bIncome');
    const bExp = document.getElementById('bExp');
    const tipPct = document.getElementById('tipPct');
    if(bSpent) bSpent.textContent = '₦'+totalExpenses.toLocaleString();
    if(bRem) bRem.textContent = '₦'+(2000-totalExpenses).toLocaleString();
    if(bProg) bProg.style.width = Math.min(100, Math.round((totalExpenses/2000)*100))+'%';
    if(bIncome) bIncome.textContent = '₦'+income.toLocaleString();
    if(bExp) bExp.textContent = '₦'+totalExpenses.toLocaleString();
    if(tipPct) tipPct.textContent = Math.min(100, Math.round((totalExpenses/2000)*100))+'%';
    if(transactions.length===0){
      if(transListEl) transListEl.innerHTML = '<div style="padding:12px;text-align:center;color:#888;">No transactions yet</div>';
    } else {
      const recent = transactions.slice(0,3);
      let tHtml = '';
      for(let i=0;i<recent.length;i++){
        const t = recent[i];
        const icon = t.category==='Food'?'🍔':t.category==='Transport'?'🚗':t.category==='Shopping'?'🛍️':'💡';
        tHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f0f0f0;"><div style="display:flex;gap:10px;align-items:center;"><span style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;display:grid;place-items:center;">'+icon+'</span><div><b style="font-size:14px;">'+t.category+'</b><div style="font-size:12px;color:#888;">'+t.date+'</div></div></div><b style="color:#c94c4c;">-₦'+t.amount+'</b></div>';
      }
      if(transListEl) transListEl.innerHTML = tHtml;
    }
    renderBudgetCats();
    save();
    updateBellCount();
  }

  function showFullHistory(){
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('fullHistoryList');
    const countEl = document.getElementById('historyCount');
    const totalEl = document.getElementById('historyTotal');
    if(!modal || !list) return;
    let totalExpenses = 0;
    for(let i=0;i<transactions.length;i++){ totalExpenses += parseFloat(transactions[i].amount)||0; }
    if(countEl) countEl.textContent = transactions.length;
    if(totalEl) totalEl.textContent = '₦'+totalExpenses.toLocaleString();
    if(transactions.length===0){
      list.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">No transactions yet</div>';
    } else {
      let hHtml = '';
      for(let i=0;i<transactions.length;i++){
        const t = transactions[i];
        const icon = t.category==='Food'?'🍔':t.category==='Transport'?'🚗':t.category==='Shopping'?'🛍️':'💡';
        hHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid #f5f5f7;"><div style="display:flex;gap:12px;align-items:center;"><span style="width:42px;height:42px;background:#f5f5f7;border-radius:10px;display:grid;place-items:center;">'+icon+'</span><div><b>'+t.category+'</b><div style="font-size:12px;color:#888;">'+t.date+'</div></div></div><b style="color:#c94c4c;">-₦'+t.amount+'</b></div>';
      }
      list.innerHTML = hHtml;
    }
    modal.style.display = 'flex';
  }

  const setSalaryBtn = document.getElementById('setSalary');
  if(setSalaryBtn){
    setSalaryBtn.addEventListener('click', function(){
      const val = parseFloat(salaryInput.value);
      if(!val || val<=0){ alert('Enter valid salary'); return; }
      income += val;
      salaryInput.value = '';
      updateUI();
      showNotif('Salary Received!','₦'+val.toLocaleString()+' added');
    });
  }

  const addBtn = document.getElementById('addBtn');
  if(addBtn){
    addBtn.addEventListener('click', function(){
      const amountEl = document.getElementById('amount');
      const catEl = document.getElementById('category');
      const dateEl = document.getElementById('date');
      const amount = parseFloat(amountEl.value);
      const category = catEl.value;
      const date = dateEl.value;
      if(!amount || amount<=0){ alert('Enter valid amount'); return; }
      if(!category){ alert('Choose category'); return; }
      if(!date){ alert('Choose date'); return; }
      transactions.unshift({amount:amount, category:category, date:date});
      amountEl.value = '';
      catEl.value = '';
      updateUI();
      showNotif('Purchase Recorded','₦'+amount+' on '+category);
    });
  }

  const resetBtn = document.getElementById('resetBtn');
  if(resetBtn){
    resetBtn.addEventListener('click', function(){
      if(confirm('Reset all?')){
        income=0; transactions=[]; notifications=[];
        localStorage.clear();
        updateUI();
      }
    });
  }

  const bell = document.getElementById('notifBell');
  if(bell){
    bell.addEventListener('click', function(){
      if(notifications.length===0){ alert('No notifications yet'); return; }
      let msg = '';
      for(let i=0;i<notifications.length;i++){ msg += notifications[i].title+' - '+notifications[i].body+'\n'; }
      alert(msg);
      notifications.forEach(function(n){ n.read=true; });
      save(); updateBellCount();
    });
  }

  const seeAllBtn = document.getElementById('seeAllBtn');
  if(seeAllBtn) seeAllBtn.addEventListener('click', showFullHistory);
  const closeHistoryBtn = document.getElementById('closeHistory');
  if(closeHistoryBtn) closeHistoryBtn.addEventListener('click', function(){ document.getElementById('historyModal').style.display='none'; });
  const historyModal = document.getElementById('historyModal');
  if(historyModal) historyModal.addEventListener('click', function(e){ if(e.target.id==='historyModal') e.currentTarget.style.display='none'; });

  document.querySelectorAll('.nav div[data-page]').forEach(function(el){
    el.addEventListener('click', function(){
      document.querySelectorAll('.nav div').forEach(function(n){ n.classList.remove('active'); });
      el.classList.add('active');
      document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
      const target = document.getElementById(el.dataset.page);
      if(target) target.classList.add('active');
    });
  });

  updateUI();
});