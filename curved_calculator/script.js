// script.js
const exprEl = document.getElementById('expr');
const resultEl = document.getElementById('result');
const historyEl = document.getElementById('history');
let expression = '';
let memory = 0;

function refreshDisplay(){
  exprEl.textContent = expression || '0';
  try{
    let r = safeEval(expression);
    resultEl.textContent = (r === undefined || r === null) ? '0' : r;
  }catch(e){resultEl.textContent='Err'}
}

function pushHistory(input, output){
  const item = document.createElement('div');
  item.className='h-item';
  item.innerHTML = `<div><strong>${input}</strong></div><small>= ${output}</small>`;
  historyEl.prepend(item);
  while(historyEl.children.length>50) historyEl.removeChild(historyEl.lastChild);
}

function safeEval(inp){
  if(!inp) return 0;
  let s = inp.replace(/×/g,'*').replace(/÷/g,'/');
  s = s.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
  s = s.replace(/[^0-9\.\+\-\*\/\(\)\,]/g, '');
  if(/__|constructor|process|window|document/.test(s)) throw new Error('Forbidden');
  const fn = new Function('return (' + s + ')');
  let res = fn();
  if(typeof res === 'number'){
    if(!isFinite(res)) throw new Error('Math error');
    res = Math.round((res + Number.EPSILON) * 1e12)/1e12;
  }
  return res;
}

document.getElementById('keys').addEventListener('click', e=>{
  const b = e.target.closest('button'); if(!b) return;
  const val = b.dataset.value;
  const action = b.dataset.action;
  if(val) { expression += val; refreshDisplay(); return; }
  switch(action){
    case 'clear': expression=''; refreshDisplay(); break;
    case 'dot': expression += expression.slice(-1).match(/\d/) ? '.' : '0.'; refreshDisplay(); break;
    case 'op': expression += ' ' + b.textContent + ' '; refreshDisplay(); break;
    case 'equal': try{ const out = safeEval(expression); pushHistory(expression, out); expression = String(out); refreshDisplay(); }catch(err){ resultEl.textContent='Error'; } break;
    case 'percent': expression += '%'; refreshDisplay(); break;
    case 'neg': expression = toggleSign(expression); refreshDisplay(); break;
    case 'sqrt': try{ const val = safeEval(expression); const out = Math.sqrt(Number(val)); pushHistory('√(' + expression + ')', out); expression = String(out); refreshDisplay(); }catch(e){resultEl.textContent='Error'} break;
    case 'sqr': try{ const val = safeEval(expression); const out = Number(val)*Number(val); pushHistory('sqr(' + expression + ')', out); expression = String(out); refreshDisplay(); }catch(e){resultEl.textContent='Error'} break;
    case 'inv': try{ const val = safeEval(expression); const out = 1/Number(val); pushHistory('1/(' + expression + ')', out); expression = String(out); refreshDisplay(); }catch(e){resultEl.textContent='Error'} break;
    case 'paren': const last = expression.trim().slice(-1); expression += last === '(' ? ')' : '('; refreshDisplay(); break;
  }
});

document.getElementById('mem-store').addEventListener('click', ()=>{ try{ memory += Number(safeEval(expression||resultEl.textContent)); alert('Stored to memory'); }catch(e){alert('Error')} });
document.getElementById('mem-recall').addEventListener('click', ()=>{ expression += String(memory); refreshDisplay(); });
document.getElementById('mem-clear').addEventListener('click', ()=>{ memory = 0; alert('Memory cleared'); });
document.getElementById('copy').addEventListener('click', ()=>{ navigator.clipboard?.writeText(resultEl.textContent).then(()=>alert('Result copied')) });

window.addEventListener('keydown', (ev)=>{
  if(ev.key.match(/[0-9]/)) { expression += ev.key; refreshDisplay(); ev.preventDefault(); }
  if(ev.key === 'Enter'){ document.querySelector('[data-action="equal"]').click(); ev.preventDefault(); }
  if(ev.key === 'Backspace'){ expression = expression.slice(0,-1); refreshDisplay(); ev.preventDefault(); }
  if(['+','-','*','/','(',')','.'].includes(ev.key)){ expression += ev.key; refreshDisplay(); ev.preventDefault(); }
});

function toggleSign(s){
  const match = s.match(/(.*?)([\-]?\d*\.?\d+)$/);
  if(!match) return s;
  const head = match[1] || '';
  const num = match[2];
  const toggled = String(Number(num) * -1);
  return head + toggled;
}

const btnTheme = document.getElementById('toggle-theme');
let dark = true;
btnTheme.addEventListener('click', ()=>{
  dark = !dark;
  if(!dark){ document.body.style.background = 'linear-gradient(135deg,#f7f8fc,#eef2ff)'; document.body.style.color='#0b1220'; } else { document.body.style.background = 'linear-gradient(135deg,#081229 0%, #041423 50%, #02131a 100%)'; document.body.style.color='var(--muted)'; }
});

refreshDisplay();