let DATA;
const $  = (sel)=>document.querySelector(sel);
const $$ = (sel)=>Array.from(document.querySelectorAll(sel));

async function boot(){
  // 질문 데이터 로드
  const res = await fetch('questions.json');
  DATA = await res.json();

  // (탭 리스너: 탭은 숨김 상태지만 로직은 유지)
  $$('.tab').forEach(btn=>btn.addEventListener('click', ()=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderOptions(btn.dataset.type);
  }));

  // 복사/프린트/처음으로
  $('#copyBtn')?.addEventListener('click', doCopy);
  $('#printBtn')?.addEventListener('click', ()=>window.print());
  $('#againBtn')?.addEventListener('click', ()=>{
    // 결과 닫고 처음 상태로
    $('#step2').hidden = true;
    $('#step1').hidden = true;      // 세부 선택 숨김
    window.scrollTo({top:0, behavior:'smooth'});
  });

  // ★ 여기부터 “큰 카드 클릭 → 세부 선택” 추가 코드 ★
  $('#chooseJob')?.addEventListener('click', ()=>{
    $('#step1').hidden = false;     // 세부 선택 열기
    $('#step2').hidden = true;      // 결과는 숨김
    $$('.tab').forEach(b=>b.classList.remove('active'));
    renderOptions('job');           // 직무 리스트 렌더
    window.scrollTo({top: $('#step1').offsetTop - 8, behavior:'smooth'});
  });

  $('#chooseCulture')?.addEventListener('click', ()=>{
    $('#step1').hidden = false;
    $('#step2').hidden = true;
    $$('.tab').forEach(b=>b.classList.remove('active'));
    renderOptions('culture');       // 컬처 리스트 렌더
    window.scrollTo({top: $('#step1').offsetTop - 8, behavior:'smooth'});
  });
}

// 세부 항목(직무/컬처 키워드) 버튼 목록
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

// 결과 출력
function renderResult(item){
  $('#step1').hidden = true;   // 세부 선택 닫기
  const list = $('#questionList');
  list.innerHTML = '';
  const SHOW_COUNT = 5;        // 대표 질문 개수
  (item.questions.slice(0, SHOW_COUNT)).forEach((q,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<b>Q${i+1}.</b> ${q.q}
      <div class="followups">${(q.followups||[]).map(f=>`<div>· ${f}</div>`).join('')}</div>`;
    list.appendChild(li);
  });
  $('#step2').hidden = false;  // 결과 열기
}

async function doCopy(){
  const text = [...document.querySelectorAll('#questionList li')].map(li=>li.innerText).join('\n');
  try{
    await navigator.clipboard.writeText(text);
    alert('복사했어요! 채용 평가 시트에 붙여넣으세요.');
  }catch(e){
    alert('복사 실패. 브라우저 권한을 허용하거나 수동으로 드래그 복사하세요.');
  }
}

boot();
