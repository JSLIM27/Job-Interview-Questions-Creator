let DATA;
const $ = (sel)=>document.querySelector(sel);
const $$ = (sel)=>Array.from(document.querySelectorAll(sel));

async function boot(){
  const res = await fetch('questions.json');
  DATA = await res.json();
  $$('.tab').forEach(btn=>btn.addEventListener('click', ()=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderOptions(btn.dataset.type);
  }));
  renderOptions('job');
  $('#copyBtn').addEventListener('click', doCopy);
  $('#printBtn').addEventListener('click', ()=>window.print());
  $('#againBtn').addEventListener('click', ()=>{
    $('#step2').hidden = true;
    $('#step1').hidden = false;
  });
}

function renderOptions(type){
  const box = $('#options');
  box.innerHTML = '';
  const items = (type==='job'? DATA.jobs : DATA.culture);
  items.forEach(it=>{
    const b = document.createElement('button');
    b.innerHTML = `<b>${it.name}</b><div style="font-size:12px;color:#6a6a6a;">${it.desc||''}</div>`;
    b.addEventListener('click', ()=>renderResult(it));
    box.appendChild(b);
  });
}

function renderResult(item){
  $('#step1').hidden = true;
  const list = $('#questionList');
  list.innerHTML = '';
  item.questions.slice(0,5).forEach((q,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<b>Q${i+1}.</b> ${q.q}
      <div class="followups">${(q.followups||[]).map(f=>`<div>· ${f}</div>`).join('')}</div>`;
    list.appendChild(li);
  });
  $('#step2').hidden = false;
}

async function doCopy(){
  const text = [...document.querySelectorAll('#questionList li')].map(li=>li.innerText).join('\\n');
  try{
    await navigator.clipboard.writeText(text);
    alert('복사했어요!');
  }catch(e){
    alert('복사 실패. 직접 드래그해서 복사하세요.');
  }
}

boot();
