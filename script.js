// ===== script.js (openPicker 포함 완성본) =====
let DATA = { jobs: [], culture: [] };
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

window.addEventListener('DOMContentLoaded', boot);

async function boot(){
  // 1) 데이터 로드 (캐시 무시 + 실패해도 앱 유지)
  try{
    const res = await fetch('questions.json', { cache: 'no-store' });
    if(!res.ok) throw new Error('questions.json not found');
    DATA = await res.json();
  }catch(e){
    console.warn('[WARN] questions.json 로드 실패:', e);
    alert('질문 데이터(questions.json)를 불러오지 못했어요. 파일이 루트에 있는지 확인해주세요.');
    DATA = { jobs: [], culture: [] };
  }

  // 2) 탭(숨김 상태여도 안전하게) 리스너
  $$('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderOptions(btn.dataset.type);
    });
  });

  // 3) 공통 버튼
  $('#copyBtn')?.addEventListener('click', doCopy);
  $('#printBtn')?.addEventListener('click', ()=>window.print());
  $('#againBtn')?.addEventListener('click', ()=>{
    // 결과 닫고 처음 화면으로
    $('#step2').hidden = true;
    $('#step1').hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 4) 메인 큰 카드 → 세부 선택 화면 열기
  $('#chooseJob')?.addEventListener('click', ()=> openPicker('job'));
  $('#chooseCulture')?.addEventListener('click', ()=> openPicker('culture'));
}

/** 메인 → 세부 선택 화면 전환 + 리스트 렌더 */
function openPicker(type){
  const step1 = $('#step1');
  $('#step2').hidden = true;
  step1.hidden = false;

  renderOptions(type);

  // 전환 애니메이션 (styles.css에 .card/.card.show 필요)
  step1.classList.remove('show');                // 초기화
  requestAnimationFrame(()=> step1.classList.add('show'));

  // 보기 좋게 스크롤
  const y = step1.offsetTop || 0;
  window.scrollTo({ top: y - 8, behavior: 'smooth' });
}

/** 세부 항목(직무/컬처) 버튼 목록 그리기 */
function renderOptions(type){
  const box = $('#options');
  if(!box) return;
  box.innerHTML = '';

  const items = (type === 'job' ? DATA.jobs : DATA.culture) || [];
  if(items.length === 0){
    const p = document.createElement('p');
    p.textContent = '항목이 없습니다. questions.json을 확인하세요.';
    p.style.color = '#666';
    box.appendChild(p);
    return;
  }

  items.forEach(it=>{
    const b = document.createElement('button');
    b.innerHTML = `<b>${it.name}</b><div style="font-size:12px;color:#6a6a6a;">${it.desc||''}</div>`;
    b.addEventListener('click', ()=> renderResult(it));
    box.appendChild(b);
  });
}

/** 질문 세트 출력 화면 */
function renderResult(item){
  $('#step1').hidden = true;

  const list = $('#questionList');
  if(!list) return;
  list.innerHTML = '';

  const SHOW_COUNT = 5; // 대표 질문 개수
  (item.questions || []).slice(0, SHOW_COUNT).forEach((q, i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<b>Q${i+1}.</b> ${q.q}
      <div class="followups">${(q.followups||[]).map(f=>`<div>· ${f}</div>`).join('')}</div>`;
    list.appendChild(li);
  });

  $('#step2').hidden = false;
}

/** 복사 기능 */
async function doCopy(){
  const text = [...document.querySelectorAll('#questionList li')]
    .map(li=>li.innerText)
    .join('\n');
  try{
    await navigator.clipboard.writeText(text);
    alert('복사했어요! 채용 평가 시트에 붙여넣으세요.');
  }catch(e){
    alert('복사 실패. 브라우저 권한을 허용하거나 수동으로 드래그 복사하세요.');
  }
}
