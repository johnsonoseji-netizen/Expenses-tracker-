let income = parseFloat(localStorage.getItem('income')) || 0;
let transactions = [];
try { transactions = JSON.parse(localStorage.getItem('transactions') || '[]'); } catch(e){ transactions = []; }
let notifications = [];
try { notifications = JSON.parse(localStorage.getItem('notifications') || '[]'); } catch(e){ notifications = []; }

let donutChartInstance = null;
let barChartInstance = null;

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
    if(unread>0){ dot.style.display='grid'; dot.textContent = unread>9?'9+':unread; } else { dot.style.display='none'; }
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
      for(let j=0;j<transactions.length;j++){ if(transactions[j].category===c.name) spent += parseFloat(transactions[j].amount)||0; }
      const pct = c.budget>0 ? Math.min(100, Math.round((spent/c.budget)*100)) : 0;
      html += '<div class="budget-cat '+c.color+'"><div class="budget-cat-top"><div class="budget-cat-left"><div class="cat-icon">'+c.icon+'</div><div><b>'+c.name+'</b><small>'+pct+'%</small></div></div><div class="budget-cat-right">₦'+spent+' of ₦'+c.budget+'</div></div><div class="progress"><div style="width:'+pct+'%"></div></div></div>';
    }
    container.innerHTML = html;
  }

  function renderAnalysisCharts(){
    const donutEl = document.getElementById('donutChart');
    const barEl = document.getElementById('barChart');
    const aTotal = document.getElementById('aTotal');
    const aAvg = document.getElementById('aAvg');
    if(!donutEl || !barEl) return;
    if(typeof Chart === 'undefined'){ console.log('Chart.js not loaded'); return; }

    let food=0, trans=0, shop=0, bills=0, total=0;
    for(let i=0;i<transactions.length;i++){
      const t = transactions[i];
      const amt = parseFloat(t.amount)||0;
      total+=amt;
      if(t.category==='Food') food+=amt;
      else if(t.category==='Transport') trans+=amt;
      else if(t.category==='Shopping') shop+=amt;
      else if(t.category==='Bills') bills+=amt;
    }

    if(aTotal) aTotal.textContent = '₦'+total.toLocaleString();
    if(aAvg) aAvg.textContent = '₦'+(transactions.length>0 ? Math.round(total/transactions.length).toLocaleString() : '0');

    if(donutChartInstance){ donutChartInstance.destroy(); donutChartInstance=null; }
    if(barChartInstance){ barChartInstance.destroy(); barChartInstance=null; }

    const dataValues = [food, trans, shop, bills];
    const hasData = dataValues.some(v=>v>0);
    const finalData = hasData ? dataValues : [30, 20, 25, 15];

    donutChartInstance = new Chart(donutEl, {
      type:'doughnut',
      data:{
        labels:['Food','Transport','Shopping','Bills'],
        datasets:[{data:finalData, backgroundColor:['#ff7a00','#4a90e2','#e94e9a','#4caf50'], borderWidth:0}]
      },
      options:{
        cutout:'65%',
        plugins:{legend:{display:false}},
        responsive:true,
        maintainAspectRatio:false
      }
    });

    barChartInstance = new Chart(barEl, {
      type:'bar',
      data:{
        labels:['Food','Transport','Shopping','Bills'],
        datasets:[{label:'Spent', data:dataValues, backgroundColor:'#4a90e2', borderRadius:6, barThickness:30}]
      },
      options:{
        plugins:{legend:{display:false}},
        scales:{
          y:{beginAtZero:true, grid:{display:false}, ticks:{display:false}},
          x:{grid:{display:false}}
        },
        responsive:true,