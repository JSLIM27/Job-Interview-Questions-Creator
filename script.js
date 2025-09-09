// 화면 전환형 & 단일/그룹 스키마 자동 지원
let DATA = { jobs: [], culture: [] };
const $  = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));

window.addEventListener('DOMContentLoaded', boot);

async function boot(){
  try{
    const res = await fetch('questions.json', { cache:'no-store' });
    if(!res.ok) throw new Error('questions.json not found');
    DATA = await res.json();
  }catch(e){
    console.warn(e);
    alert('questions.json을 불러오지 못했어요. index.html과 같은 폴더(루트)에 있는지 확인해주세요.');
  }

  // 메인 → 세부
  $('#chooseJob')?.addEventListener('click', ()=> openPicker('job'));
  $('#chooseCulture')?.addEventListener('click', ()=> openPicker('culture'));

  // 뒤로가기
  $('#backToHome')?.addEventListener('click', (e)=>{ e.preventDefault(); showSection('home'); });
  $('#backToPicker')?.addEventListener('click', (e)=>{ e.preventDefault(); showSection('picker'); });

  // 결과 액션
  $('#copyBtn')?.addEventListener('click', doCopy);
  $('#printBtn')?.addEventListener('click', ()=>window.print());
  $('#againBtn')?.addEventListener('click', ()=> showSection('home'));
}

/** 섹션 전환 */
function showSection(id){
  $$('.section').forEach(sec=>sec.classList.remove('active'));
  $('#'+id)?.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** 메인 → 세부(직무/컬처 목록) */
function openPicker(type){
  const isJob = (type === 'job');
  $('#pickerTitle').textContent = isJob ? '직무를 선택해주세요' : '컬처 키워드를 선택해주세요';
  renderOptions(type);
  showSection('picker');
}

/** 세부 항목 렌더 (그룹/단일 자동 처리) */
function renderOptions(type){
  const box = $('#options');
  box.innerHTML = '';

  const list = (type === 'job') ? (DATA.jobs || []) : (DATA.culture || []);
  if(list.length === 0){
    box.innerHTML = '<p style="color:#666">항목이 없습니다. questions.json을 확인하세요.</p>';
    return;
  }

  const looksGrouped = list.some(x => Array.isArray(x.children) || Array.isArray(x.roles) || Array.isArray(x.items));

  if(looksGrouped){
    list.forEach(group=>{
      const title = group.group || group.title || group.name || '';
      const children = group.children || group.roles || group.items || [];
      if(title){
        const h = document.createElement('h3');
        h.style.margin = '18px 16px 8px';
        h.textContent = title;
        box.appendChild(h);
      }
      const wrap = document.createElement('div');
      wrap.className = 'options';
      children.forEach(it=>{
        const btn = document.createElement('button');
        btn.textContent = it.name || it.title || it.id || '이름 없음';
        btn.addEventListener('click', ()=> onPickItem(it));
        wrap.appendChild(btn);
      });
      box.appendChild(wrap);
    });
  }else{
    const wrap = document.createElement('div');
    wrap.className = 'options';
    list.forEach(it=>{
      const btn = document.createElement('button');
      btn.textContent = it.name || it.title || it.id || '이름 없음';
      btn.addEventListener('click', ()=> onPickItem(it));
      wrap.appendChild(btn);
    });
    box.appendChild(wrap);
  }
}

/** 항목 클릭 → 하위가 있으면 더 파고들고, 없으면 질문 출력 */
function onPickItem(node){
  const children = node.children || node.roles || node.items;
  if (Array.isArray(children) && children.length){
    const box = $('#options');
    box.innerHTML = '';
    const h = document.createElement('h3');
    h.style.margin = '18px 16px 8px';
    h.textContent = node.name || node.title || '세부 선택';
    box.appendChild(h);

    const wrap = document.createElement('div');
    wrap.className = 'options';
    children.forEach(it=>{
      const btn = document.createElement('button');
      btn.textContent = it.name || it.title || it.id || '이름 없음';
      btn.addEventListener('click', ()=> onPickItem(it));
      wrap.appendChild(btn);
    });
    box.appendChild(wrap);
    return;
  }

  renderResult(node);
}

/** 결과 출력 */
function renderResult(item){
  const list = $('#questionList');
  list.innerHTML = '';

  const qs = item.questions || [];
  if (!Array.isArray(qs) || qs.length === 0){
    alert('이 항목에 질문이 없습니다. questions.json에서 해당 직무/키워드에 "questions": [...] 를 추가하세요.');
    return;
  }

  const SHOW = 5;
  qs.slice(0, SHOW).forEach((q,i)=>{
    const li = document.createElement('li');
    const fups = Array.isArray(q.followups) ? q.followups : [];
    li.innerHTML = `<b>Q${i+1}.</b> ${q.q}
      <div class="followups">${fups.map(f=>`<div>· ${f}</div>`).join('')}</div>`;
    list.appendChild(li);
  });

  showSection('result');
}

/** 복사 */
async function doCopy(){
  const text = [...document.querySelectorAll('#questionList li')].map(li=>li.innerText).join('\n');
  try{
    await navigator.clipboard.writeText(text);
    alert('복사했어요! 평가 시트에 붙여넣으세요.');
  }catch(e){
    alert('복사 실패. 브라우저 권한을 허용하거나 수동으로 드래그 복사하세요.');
  }
}
