/* Quran Reels Studio 3 — advanced, browser-first editor layer */
(() => {
'use strict';

const PRO_VERSION='4.0.0';
const STORAGE_KEY='quran-reels-studio-v3';
const AUDIO_CACHE=new Map();
const legacy={
  renderCtrl,
  onCh:window.onCh,
  goStudio:window.goStudio,
  tp:window.tp,
  doExport:window.doExport,
  renderBg
};

const TRANSLATIONS=[
  ['en.sahih','English — Saheeh International'],
  ['en.pickthall','English — Pickthall'],
  ['en.yusufali','English — Yusuf Ali'],
  ['fr.hamidullah','Français — Hamidullah'],
  ['ur.jalandhry','اردو — جالندھری'],
  ['id.indonesian','Bahasa Indonesia'],
  ['tr.diyanet','Türkçe — Diyanet'],
  ['ru.kuliev','Русский — Кулиев'],
  ['de.aburida','Deutsch — Abu Rida']
];
const TEMPLATES=[
  {id:'noor',name:'Noor',desc:'Gold · cinematic',css:'linear-gradient(135deg,#06151d,#7a5b27)',v:{bgP:'night',tc:'#e9c875',veil:.38,arFn:'Scheherazade New',arWt:'600',transStyle:'crossfade',captionCard:true,cardOpacity:.18,vignette:.45,progressStyle:'line',headerStyle:'minimal'}},
  {id:'minbar',name:'Minbar',desc:'Emerald · mosque',css:'linear-gradient(135deg,#071b16,#205c43)',v:{bgP:'emerald',tc:'#f0d797',veil:.42,arFn:'Amiri',arWt:'700',captionCard:false,vignette:.55,progressStyle:'dots',headerStyle:'badge'}},
  {id:'sahara',name:'Sahara',desc:'Warm · elegant',css:'linear-gradient(135deg,#301b11,#b7793a)',v:{bgP:'sahara',tc:'#ffe0a7',veil:.32,arFn:'Noto Naskh Arabic',arWt:'600',captionCard:true,cardOpacity:.12,vignette:.35,progressStyle:'line',headerStyle:'title'}},
  {id:'midnight',name:'Midnight',desc:'Blue · minimal',css:'linear-gradient(135deg,#030712,#1e3a8a)',v:{bgP:'midnight',tc:'#dbeafe',veil:.3,arFn:'Scheherazade New',arWt:'500',captionCard:false,vignette:.5,progressStyle:'ring',headerStyle:'minimal'}},
  {id:'ivory',name:'Ivory',desc:'Editorial · soft',css:'linear-gradient(135deg,#d9ccb5,#6b5a43)',v:{bgP:'golden',tc:'#fff8e8',veil:.2,arFn:'Aref Ruqaa',arWt:'700',captionCard:true,cardOpacity:.2,vignette:.25,progressStyle:'none',headerStyle:'title'}},
  {id:'royal',name:'Royal',desc:'Purple · luminous',css:'linear-gradient(135deg,#160b2f,#6d28d9)',v:{bgP:'royal',tc:'#f5d0fe',veil:.34,arFn:'Amiri',arWt:'700',captionCard:true,cardOpacity:.14,vignette:.4,progressStyle:'dots',headerStyle:'badge'}}
];

Object.assign(S,{
  showNum:S.showNum??true,
  translationEdition:'en.sahih',translit:false,vt:[],
  template:'noor',captionMode:'reveal',captionCard:true,cardOpacity:.18,cardRadius:18,
  headerStyle:'minimal',showSurahHeader:true,showBismillah:false,
  progressStyle:'line',safeGuides:true,grain:.04,
  introEnabled:true,introDuration:1.2,outroEnabled:true,outroDuration:1.1,
  outroText:'Follow for more Quran recitations',verseHold:.15,
  audioGain:1,audioNormalize:true,audioCompress:true,audioLowCut:true,audioReverb:.06,
  audioPreset:'natural',audioWarmth:0.08,audioPresence:0.04,audioDeEss:0.08,roomSize:1.1,roomDecay:3,
  exportType:'mp4',exportQuality:'high',exportBitrate:8,
  customAudioUrl:null,customAudioBlob:null,customAudioName:'',
  durations:[],_verseProgress:0,_phase:'verse',_exportTimeline:null,_previewRaf:null,
  pexelsKey:localStorage.getItem('qrs-pexels-key')||''
});

function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function selectedIndices(){return [...S.sel].sort((a,b)=>a-b);}
function formatTime(sec){sec=Math.max(0,Number(sec)||0);const m=Math.floor(sec/60),s=Math.round(sec%60);return m?`${m}:${String(s).padStart(2,'0')}`:`${s}s`;}
function toast(message,type='good'){
  let wrap=document.querySelector('.pro-toast-wrap');if(!wrap){wrap=document.createElement('div');wrap.className='pro-toast-wrap';document.body.appendChild(wrap);}
  const el=document.createElement('div');el.className=`pro-toast ${type}`;el.textContent=message;wrap.appendChild(el);setTimeout(()=>el.remove(),3000);
}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),8000);}
function projectName(ext){const s=S.surah?.[2]?.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')||'quran';const verses=selectedIndices();const range=verses.length?`${verses[0]+1}-${verses.at(-1)+1}`:'clip';return `${s}-${range}-${S.fmt}.${ext}`.toLowerCase();}
function settingsSnapshot(){
  const keys=['fmt','rec','arSz','arFn','arWt','mrgn','trans','trSz','trFn','trWt','tc','veil','wm','wmPos','shad','shadB','shadY','stroke','bgT','bgP','bgVidIdx','motionBg','mediaCredit','bgVidSpd','vignette','colorOv','colorOvOp','parallax','bgZoom','vPos','lh','bgSpeed','bgBlur','transStyle','fadeDur','fps','showNum','translationEdition','translit','template','captionMode','captionCard','cardOpacity','cardRadius','headerStyle','showSurahHeader','showBismillah','progressStyle','safeGuides','grain','introEnabled','introDuration','outroEnabled','outroDuration','outroText','verseHold','audioGain','audioNormalize','audioCompress','audioLowCut','audioReverb','audioPreset','audioWarmth','audioPresence','audioDeEss','roomSize','roomDecay','tajweedEnabled','tajweedPalette','tajweedIntensity','exportType','exportQuality','exportBitrate'];
  return Object.fromEntries(keys.map(k=>[k,S[k]]));
}
let saveTimer;
function saveSettings(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(settingsSnapshot()));}catch(_){}},150);}
function loadSettings(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');Object.assign(S,v);}catch(_){} }
loadSettings();
if(S.bgT==='preset')S.bgT='presets';

// ---------- Home and verse selection ----------
window.renderHome=()=>{
  const q=($('srch')?.value||'').trim().toLowerCase();
  const f=SURAH.filter(s=>String(s[1]).includes(q)||String(s[2]).toLowerCase().includes(q)||String(s[3]).toLowerCase().includes(q)||String(s[0])===q);
  $('pop').innerHTML=POP.map(p=>{const s=SURAH[p[0]-1];return`<div class="pc" onclick="pickSurah(${s[0]})"><div class="ar">${s[1]}</div><div class="en">${s[2]} · ${s[4]} ayat</div></div>`;}).join('');
  $('sg').innerHTML=f.map(s=>`<div class="sc" onclick="pickSurah(${s[0]})"><div><div class="ar">${s[1]}</div><div class="en">${s[2]} — ${s[3]}</div></div><div class="ct">${s[4]} verses</div></div>`).join('');
};

async function fetchEdition(n,edition){
  const r=await fetch(`https://api.alquran.cloud/v1/surah/${n}/${encodeURIComponent(edition)}`);if(!r.ok)throw new Error(`Quran API ${r.status}`);const j=await r.json();return j.data.ayahs;
}
window.pickSurah=async n=>{
  const s=SURAH.find(x=>x[0]===n);if(!s)return;
  S.surah=s;S.sel=new Set();S.vIdx=0;S.durations=[];showView('vv');
  $('vsar').textContent=s[1];$('vsen').textContent=`${s[2]} — ${s[3]}`;
  $('vl').innerHTML='<div style="text-align:center;padding:40px;color:var(--td);font-size:13px"><div class="spin" style="margin:0 auto 12px"></div>Loading verified Quran text…</div>';
  try{
    const cacheKey=`${n}:${S.translationEdition}`;
    if(VC[cacheKey]){S.va=VC[cacheKey].ar;S.ve=VC[cacheKey].en;S.vt=VC[cacheKey].tr||[];}
    else{
      const jobs=[fetchEdition(n,'quran-uthmani'),fetchEdition(n,S.translationEdition)];
      if(S.translit)jobs.push(fetchEdition(n,'en.transliteration'));
      const [ar,en,tr=[]]=await Promise.all(jobs);S.va=ar;S.ve=en;S.vt=tr;VC[cacheKey]={ar,en,tr};
    }
    renderVerses();injectVerseTools();
  }catch(e){console.error(e);$('vl').innerHTML='<div style="text-align:center;padding:40px;color:var(--td)">Could not load Quran text. Check the connection and retry.</div>';}
};

function injectHome(){
  const h=document.querySelector('.hdr');if(!h||h.querySelector('.pro-badge'))return;
  const title=h.querySelector('h1');title?.insertAdjacentHTML('beforeend',`<span class="pro-badge">Studio ${PRO_VERSION}</span>`);
  const actions=document.createElement('div');actions.className='pro-home-actions';actions.innerHTML='<button class="pro-btn" onclick="QRSPro.importProject()">Import project</button><span class="pro-badge">Browser-only</span>';
  h.appendChild(actions);
}
function injectVerseTools(){
  const actions=document.querySelector('#vv .va');if(!actions)return;
  let tools=document.getElementById('proVerseTools');if(!tools){tools=document.createElement('div');tools.id='proVerseTools';tools.className='pro-verse-tools';actions.prepend(tools);}
  tools.innerHTML=`<input class="pro-mini-input" id="rangeFrom" type="number" min="1" max="${S.va.length}" value="1" title="First verse"><span style="font-size:9px;color:var(--td)">to</span><input class="pro-mini-input" id="rangeTo" type="number" min="1" max="${S.va.length}" value="${Math.min(S.va.length,10)}" title="Last verse"><button onclick="QRSPro.selectRange()">Select range</button><select id="proTranslation" class="pro-translation-select" onchange="QRSPro.changeTranslation(this.value)">${TRANSLATIONS.map(([v,n])=>`<option value="${v}"${S.translationEdition===v?' selected':''}>${n}</option>`).join('')}</select>`;
}
function selectRange(){const a=clamp(parseInt($('rangeFrom')?.value)||1,1,S.va.length),b=clamp(parseInt($('rangeTo')?.value)||a,a,S.va.length);S.sel=new Set();for(let i=a-1;i<b;i++)S.sel.add(i);renderVerses();}
async function changeTranslation(edition){S.translationEdition=edition;saveSettings();if(!S.surah)return;try{S.ve=await fetchEdition(S.surah[0],edition);renderVerses();toast('Translation updated');}catch(e){toast('Could not load that translation','bad');}}

// ---------- Studio timeline and enhanced controls ----------
function injectTimeline(){
  const sp=document.querySelector('#vs .sp');if(!sp)return;let tl=$('proTimeline');if(!tl){tl=document.createElement('div');tl.id='proTimeline';tl.className='pro-timeline';sp.appendChild(tl);}renderTimeline();
}
function timelineDurations(){const n=selectedIndices().length;if(S.durations.length===n)return S.durations;return Array.from({length:n},()=>2.5+S.verseHold);}
function renderTimeline(){
  const tl=$('proTimeline');if(!tl)return;const ix=selectedIndices(),ds=timelineDurations();const total=ds.reduce((a,b)=>a+b,0)+(S.introEnabled?S.introDuration:0)+(S.outroEnabled?S.outroDuration:0);
  tl.innerHTML=`<div class="pro-tl-head"><span class="pro-tl-title">Ayah timeline</span><span class="pro-tl-meta">${ix.length} ayat · ${formatTime(total)} <button class="pro-btn" style="padding:3px 6px;margin-left:5px" onclick="QRSPro.analyzeAudio()">Analyze audio</button></span></div><div class="pro-tl-track">${ix.map((v,i)=>`<div class="pro-tl-item${i===S.vIdx?' on':''}" onclick="QRSPro.jumpVerse(${i})"><div class="n">${S.surah?.[0]||''}:${S.va[v]?.numberInSurah||v+1}</div><div class="d">${formatTime(ds[i]||2.5)}</div><div class="bar"><i></i></div></div>`).join('')}</div>`;
}
function jumpVerse(i){if(S.playing)window.tp();S.vIdx=clamp(i,0,Math.max(0,S.urls.length-1));S._verseProgress=0;$('vcnt').textContent=`${S.vIdx+1} / ${S.urls.length}`;renderTimeline();draw();}

window.goStudio=()=>{
  if(!S.sel.size)return;
  legacy.goStudio();
  S._phase='verse';S._verseProgress=0;
  injectTimeline();
  $('peBtn').textContent='Export video';
};

function section(id,title,body,open=true){return `<div class="pro-section${open?'':' closed'}" id="${id}"><button type="button" onclick="QRSPro.toggleSection('${id}')"><span>${title}</span><span>⌄</span></button><div class="pro-section-body">${body}</div></div>`;}
function toggleSection(id){$(id)?.classList.toggle('closed');}
function applyTemplate(id){const t=TEMPLATES.find(x=>x.id===id);if(!t)return;Object.assign(S,t.v,{template:id});S.bgT='presets';S._bgImg=null;if(S._bgV){S._bgV.pause();S._bgV=null;}renderCtrl();draw();saveSettings();toast(`${t.name} template applied`);}
function advancedControlsHTML(){
  const templateBody=`<div class="pro-template-grid">${TEMPLATES.map(t=>`<div class="pro-template${S.template===t.id?' on':''}" style="background:${t.css}" onclick="QRSPro.applyTemplate('${t.id}')"><strong>${t.name}</strong><small>${t.desc}</small></div>`).join('')}</div>`;
  const captions=`
<div class="cg"><label>Caption animation</label><div class="pro-segmented">${[['none','Static'],['reveal','Karaoke'],['fade','Soft fade']].map(([v,n])=>`<button class="${S.captionMode===v?'on':''}" onclick="QRSPro.setValue('captionMode','${v}',true)">${n}</button>`).join('')}</div></div>
<div class="cg"><div class="tr2"><label>Glass caption card</label><label class="tg"><input id="proCard" type="checkbox" ${S.captionCard?'checked':''} onchange="onCh()"><span class="sl"></span></label></div><div id="proCardOpts" style="${S.captionCard?'':'display:none'}"><label>Card opacity</label><div class="rg"><input id="proCardOpacity" type="range" min="0" max="0.65" step="0.01" value="${S.cardOpacity}" oninput="onCh()"><span class="rv">${S.cardOpacity.toFixed(2)}</span></div></div></div>
<div class="cg"><label>Header style</label><select id="proHeader" onchange="onCh()"><option value="minimal"${S.headerStyle==='minimal'?' selected':''}>Minimal</option><option value="badge"${S.headerStyle==='badge'?' selected':''}>Badge</option><option value="title"${S.headerStyle==='title'?' selected':''}>Editorial title</option><option value="none"${S.headerStyle==='none'?' selected':''}>Hidden</option></select></div>
<div class="cg"><div class="tr2"><label>Transliteration</label><label class="tg"><input id="proTranslit" type="checkbox" ${S.translit?'checked':''} onchange="QRSPro.toggleTransliteration(this.checked)"><span class="sl"></span></label></div></div>
<div class="cg"><div class="tr2"><label>TikTok/Reels safe guides</label><label class="tg"><input id="proSafe" type="checkbox" ${S.safeGuides?'checked':''} onchange="onCh()"><span class="sl"></span></label></div></div>`;
  const timing=`
<div class="cg"><div class="tr2"><label>Intro title card</label><label class="tg"><input id="proIntro" type="checkbox" ${S.introEnabled?'checked':''} onchange="onCh()"><span class="sl"></span></label></div><div class="rg"><input id="proIntroDur" type="range" min="0" max="4" step="0.1" value="${S.introDuration}" oninput="onCh()"><span class="rv">${S.introDuration.toFixed(1)}s</span></div></div>
<div class="cg"><label>Pause after each ayah</label><div class="rg"><input id="proHold" type="range" min="0" max="2" step="0.05" value="${S.verseHold}" oninput="onCh()"><span class="rv">${S.verseHold.toFixed(2)}s</span></div></div>
<div class="cg"><div class="tr2"><label>Outro card</label><label class="tg"><input id="proOutro" type="checkbox" ${S.outroEnabled?'checked':''} onchange="onCh()"><span class="sl"></span></label></div><input id="proOutroText" type="text" value="${esc(S.outroText)}" oninput="onCh()"><div class="rg" style="margin-top:4px"><input id="proOutroDur" type="range" min="0" max="5" step="0.1" value="${S.outroDuration}" oninput="onCh()"><span class="rv">${S.outroDuration.toFixed(1)}s</span></div></div>
<div class="cg"><label>Progress indicator</label><div class="pro-segmented">${['line','dots','ring','none'].map(v=>`<button class="${S.progressStyle===v?'on':''}" onclick="QRSPro.setValue('progressStyle','${v}',true)">${v}</button>`).join('')}</div></div>`;
  const audio=`
<div class="cg"><label>Audio source</label><div class="pro-status"><span class="pro-dot"></span><span id="proAudioStatus">${S.customAudioName?`Custom: ${esc(S.customAudioName)}`:'Selected reciter · per-ayah audio'}</span></div><div class="pro-row" style="margin-top:5px"><label class="pro-btn" style="text-align:center">Upload audio<input id="proAudioUpload" type="file" accept="audio/*" hidden onchange="QRSPro.loadCustomAudio(this.files[0])"></label><button class="pro-btn" id="proMicBtn" onclick="QRSPro.toggleMicRecord()">Record voice</button><button class="pro-btn danger" onclick="QRSPro.clearCustomAudio()">Use reciter</button></div><canvas class="pro-wave" id="proWave" width="320" height="35"></canvas></div>
<div class="cg"><label>Master gain</label><div class="rg"><input id="proGain" type="range" min="0.4" max="2" step="0.05" value="${S.audioGain}" oninput="onCh()"><span class="rv">${S.audioGain.toFixed(2)}×</span></div></div>
<div class="cg"><div class="tr2"><label>Peak normalization</label><label class="tg"><input id="proNormalize" type="checkbox" ${S.audioNormalize?'checked':''} onchange="onCh()"><span class="sl"></span></label></div></div>
<div class="cg"><div class="tr2"><label>Gentle compression</label><label class="tg"><input id="proCompress" type="checkbox" ${S.audioCompress?'checked':''} onchange="onCh()"><span class="sl"></span></label></div></div>
<div class="cg"><label>Room ambience</label><div class="rg"><input id="proReverb" type="range" min="0" max="0.25" step="0.01" value="${S.audioReverb}" oninput="onCh()"><span class="rv">${Math.round(S.audioReverb*100)}%</span></div><p class="pro-help">Subtle, neutral ambience only. It does not imitate or clone any reciter.</p></div>`;
  const project=`<div class="pro-project-row"><button class="pro-btn" onclick="QRSPro.exportProject()">Save JSON</button><button class="pro-btn" onclick="QRSPro.importProject()">Load JSON</button><button class="pro-btn danger" onclick="QRSPro.resetProject()">Reset style</button></div><p class="pro-help">Settings autosave on this device. Uploaded media stays local and is not uploaded by the app.</p><div class="pro-kbd"><kbd>Space</kbd> preview · <kbd>←</kbd>/<kbd>→</kbd> ayah · <kbd>E</kbd> export</div>`;
  return section('proTemplates','Visual templates',templateBody)+section('proCaptions','Captions & layout',captions)+section('proTiming','Timeline & cards',timing)+section('proAudio','Audio mastering',audio)+section('proProject','Project',project,false);
}

renderCtrl=function(){
  legacy.renderCtrl();
  const body=$('cbody');if(!body)return;
  body.insertAdjacentHTML('afterbegin',advancedControlsHTML());
  const rc=$('rc');if(rc){const parent=rc.parentElement;parent.insertAdjacentHTML('afterbegin','<input id="proRecSearch" type="search" placeholder="Search 65+ reciters…" oninput="QRSPro.filterReciters(this.value)" style="margin-bottom:4px">');const row=document.createElement('div');row.className='pro-rec-row';rc.parentNode.insertBefore(row,rc);row.appendChild(rc);const fav=document.createElement('button');fav.className='pro-fav';fav.title='Favorite this reciter';fav.textContent=isFavorite(S.rec)?'★':'☆';fav.onclick=toggleFavorite;row.appendChild(fav);}
  drawWavePlaceholder();
};
function isFavorite(id){try{return JSON.parse(localStorage.getItem('qrs-reciter-favs')||'[]').includes(id);}catch(_){return false;}}
function toggleFavorite(){let a=[];try{a=JSON.parse(localStorage.getItem('qrs-reciter-favs')||'[]');}catch(_){}const i=a.indexOf(S.rec);i>=0?a.splice(i,1):a.push(S.rec);localStorage.setItem('qrs-reciter-favs',JSON.stringify(a));renderCtrl();toast(i>=0?'Removed favorite':'Reciter favorited');}
function filterReciters(q){q=q.trim().toLowerCase();const sel=$('rc');if(!sel)return;const favs=(()=>{try{return JSON.parse(localStorage.getItem('qrs-reciter-favs')||'[]')}catch(_){return[]}})();[...sel.options].forEach(o=>{o.hidden=!!q&&!o.textContent.toLowerCase().includes(q)&&!(q==='favorites'&&favs.includes(o.value));});}

window.onCh=()=>{
  legacy.onCh();
  const b=id=>$(id)?.checked,n=(id,fallback)=>{const v=parseFloat($(id)?.value);return Number.isFinite(v)?v:fallback},v=id=>$(id)?.value;
  S.captionCard=b('proCard')??S.captionCard;S.cardOpacity=n('proCardOpacity',S.cardOpacity);S.headerStyle=v('proHeader')||S.headerStyle;S.safeGuides=b('proSafe')??S.safeGuides;
  S.introEnabled=b('proIntro')??S.introEnabled;S.introDuration=n('proIntroDur',S.introDuration);S.verseHold=n('proHold',S.verseHold);S.outroEnabled=b('proOutro')??S.outroEnabled;S.outroText=v('proOutroText')??S.outroText;S.outroDuration=n('proOutroDur',S.outroDuration);
  S.audioGain=n('proGain',S.audioGain);S.audioNormalize=b('proNormalize')??S.audioNormalize;S.audioCompress=b('proCompress')??S.audioCompress;S.audioReverb=n('proReverb',S.audioReverb);
  if($('proCardOpts'))$('proCardOpts').style.display=S.captionCard?'block':'none';
  renderTimeline();draw();saveSettings();
};
function setValue(k,val,rerender=false){S[k]=val;saveSettings();if(rerender)renderCtrl();draw();}
async function toggleTransliteration(on){S.translit=on;saveSettings();if(on&&S.surah&&!S.vt.length){try{S.vt=await fetchEdition(S.surah[0],'en.transliteration');toast('Transliteration loaded');}catch(_){S.translit=false;toast('Transliteration unavailable','bad');}}draw();}

// ---------- Background source security fix ----------
renderBg=function(t){
  if(t!=='pexels')return legacy.renderBg(t);
  const c=$('bgC');if(!c)return;
  c.innerHTML=`<div style="margin-bottom:5px"><input id="pexKeyInput" type="password" placeholder="Your Pexels API key" value="${esc(S.pexelsKey)}" oninput="QRSPro.savePexelsKey(this.value)"><p class="pro-help">Stored only in this browser. No API key is bundled in the project.</p></div><div class="pro-row"><input type="text" id="pexQ" placeholder="Search portrait videos…" onkeydown="if(event.key==='Enter')searchPexels()"><button class="pro-btn" onclick="searchPexels()">Search</button></div><div class="pro-segmented" style="margin:5px 0">${['nature','mosque','night','ocean'].map(q=>`<button onclick="quickPex('${q}')">${q}</button>`).join('')}</div><div class="bgv" id="pexG" style="max-height:300px"><div style="grid-column:1/-1;text-align:center;padding:18px;color:var(--tm);font-size:9px">Add your API key, then search Pexels.</div></div>`;
};
function savePexelsKey(key){S.pexelsKey=key.trim();localStorage.setItem('qrs-pexels-key',S.pexelsKey);}
window.searchPexels=async()=>{
  const q=$('pexQ')?.value?.trim()||'nature',g=$('pexG');if(!g)return;if(!S.pexelsKey){toast('Add your own Pexels API key first','bad');return;}
  g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:25px;color:var(--tm)"><div class="spin" style="margin:0 auto 10px"></div>Searching…</div>';
  try{const r=await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=24&orientation=portrait`,{headers:{Authorization:S.pexelsKey}});if(!r.ok)throw new Error(`Pexels ${r.status}`);const d=await r.json();g.innerHTML=(d.videos||[]).map(video=>{const file=[...(video.video_files||[])].filter(f=>f.link).sort((a,b)=>(a.width||9999)-(b.width||9999)).find(f=>(f.width||0)>=360)||video.video_files?.[0];if(!file)return'';const thumb=video.image||video.video_pictures?.[0]?.picture||'';return `<div class="bp" onclick="pickPex('${esc(file.link)}',this)"><div class="bp-bg"></div>${thumb?`<img class="bp-img" src="${esc(thumb)}" style="display:block">`:''}<span>Pexels video</span></div>`;}).join('')||'<div style="grid-column:1/-1;padding:20px;color:var(--tm)">No results.</div>';}catch(e){console.error(e);g.innerHTML='<div style="grid-column:1/-1;padding:20px;color:var(--pro-red);font-size:9px">Search failed. Check the API key and connection.</div>';}
};

// ---------- Advanced canvas renderer ----------
function splitArabicLines(text,maxWidth,font){CT.font=font;const words=text.split(/\s+/),lines=[];let line='';for(const word of words){const test=line?`${line} ${word}`:word;if(CT.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);return lines;}
function splitLatinLines(text,maxWidth,font){CT.font=font;const words=text.split(/\s+/),lines=[];let line='';for(const word of words){const test=line?`${line} ${word}`:word;if(CT.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);return lines;}
function roundedRect(x,y,w,h,r,fill,stroke){CT.beginPath();CT.roundRect(x,y,w,h,r);if(fill)CT.fill();if(stroke)CT.stroke();}
function drawHeader(w,h){if(!S.showSurahHeader||S.headerStyle==='none'||!S.surah)return;CT.save();const label=`${S.surah[2]}  ·  ${S.surah[0]}`;if(S.headerStyle==='badge'){CT.font='600 14px Inter';const tw=CT.measureText(label).width;CT.fillStyle='rgba(0,0,0,.28)';roundedRect(w/2-tw/2-18,h*.07-16,tw+36,32,16,true);CT.fillStyle='rgba(255,255,255,.82)';CT.textAlign='center';CT.textBaseline='middle';CT.fillText(label,w/2,h*.07);}else if(S.headerStyle==='title'){CT.textAlign='center';CT.fillStyle='rgba(255,255,255,.75)';CT.font='500 12px Cinzel';CT.fillText('THE HOLY QURAN',w/2,h*.06);CT.fillStyle=S.tc;CT.font='600 19px Cinzel';CT.fillText(S.surah[2].toUpperCase(),w/2,h*.085);}else{CT.textAlign='center';CT.fillStyle='rgba(255,255,255,.62)';CT.font='500 12px Inter';CT.fillText(label,w/2,h*.065);}CT.restore();}
function drawCard(x,y,w,h){if(!S.captionCard)return;CT.save();CT.fillStyle=`rgba(5,5,10,${S.cardOpacity})`;CT.strokeStyle='rgba(255,255,255,.08)';CT.lineWidth=1;roundedRect(x,y,w,h,S.cardRadius,true,true);CT.restore();}
const TAJWEED_CANVAS_COLORS={ham_wasl:'#9ca3af',laam_shamsiyah:'#94a3b8',madda_normal:'#38bdf8',madda_permissible:'#2563eb',madda_necessary:'#7c3aed',qalaqah:'#22c55e',ikhafa:'#f59e0b',ikhafa_shafawi:'#f59e0b',idgham_shafawi:'#ec4899',idgham_ghunnah:'#ec4899',idgham_wo_ghunnah:'#ef4444',iqlab:'#14b8a6',ghunnah:'#d946ef'};
function tajweedColor(cls){const base=TAJWEED_CANVAS_COLORS[cls]||S.tc;if(S.tajweedPalette==='mono')return S.tc;if(S.tajweedPalette==='accessible'){const a={madda_normal:'#60a5fa',madda_permissible:'#2563eb',madda_necessary:'#8b5cf6',qalaqah:'#34d399',ikhafa:'#fbbf24',ikhafa_shafawi:'#fbbf24',idgham_shafawi:'#f472b6',idgham_ghunnah:'#f472b6',idgham_wo_ghunnah:'#fb7185',iqlab:'#2dd4bf',ghunnah:'#e879f9'};return a[cls]||base;}return base;}
function drawTajweedOverlays(line,lineStart,y,right,font,segments,clipLeft=-Infinity,clipRight=Infinity){if(!segments?.length)return;CT.save();CT.font=font;CT.direction='rtl';CT.textAlign='right';CT.textBaseline='middle';CT.globalAlpha*=Math.max(.25,S.tajweedIntensity??1);for(const seg of segments){const a=Math.max(seg.start,lineStart),b=Math.min(seg.end,lineStart+line.length);if(a>=b)continue;const relA=a-lineStart,relB=b-lineStart,prefix=line.slice(0,relA),piece=line.slice(relA,relB);const x=right-CT.measureText(prefix).width,pw=CT.measureText(piece).width;if(x<clipLeft||x-pw>clipRight)continue;CT.save();CT.beginPath();CT.rect(clipLeft,y-S.arSz,clipRight-clipLeft,S.arSz*2);CT.clip();CT.fillStyle=tajweedColor(seg.rule);CT.fillText(piece,x,y);CT.restore();}CT.restore();}
function drawAdvancedVerse(v,w,h,progress=1,alpha=1){
  if(!v?.ar)return;const margin=w*S.mrgn/100,maxW=w-margin*2;const arFont=`${S.arWt} ${S.arSz}px "${S.arFn}",Amiri,serif`;const trFont=`${S.trWt} ${S.trSz}px "${S.trFn}",Inter,sans-serif`;const tj=S.tajweedEnabled&&S.tajweedAyahs?.[v.idx];const coreArabic=tj?.plain||v.ar.text;const arText=coreArabic+(S.showNum?` ﴿${v.ar.numberInSurah}﴾`:'');const arLines=splitArabicLines(arText,maxW,arFont);const trLines=S.trans?splitLatinLines(v.en?.text||'',maxW*.94,trFont):[];const translitLines=S.translit&&S.vt[v.idx]?splitLatinLines(S.vt[v.idx].text||'',maxW*.9,`${Math.max(12,S.trSz-3)}px Inter`):[];
  const arLH=S.arSz*S.lh,trLH=S.trSz*1.45,tlLH=Math.max(12,S.trSz-3)*1.35;const totalH=arLines.length*arLH+(trLines.length?22+trLines.length*trLH:0)+(translitLines.length?12+translitLines.length*tlLH:0);let top=clamp(h*S.vPos/100-totalH/2,h*.13,h-totalH-h*.12);
  drawCard(margin*.72,top-S.arSz*.55,w-margin*1.44,totalH+S.arSz*1.1);
  CT.save();CT.globalAlpha=alpha;CT.textAlign='center';CT.textBaseline='middle';CT.direction='rtl';CT.font=arFont;CT.shadowColor=S.shad?S.shadC:'transparent';CT.shadowBlur=S.shad?S.shadB:0;CT.shadowOffsetY=S.shad?S.shadY:0;
  let tajCursor=0;arLines.forEach((line,i)=>{const y=top+arLH*(i+.5),lineStart=arText.indexOf(line,tajCursor);tajCursor=Math.max(tajCursor,lineStart+line.length);CT.font=arFont;const lineW=CT.measureText(line).width,lineRight=w/2+lineW/2;if(S.captionMode==='reveal'&&progress<.999){CT.fillStyle='rgba(255,255,255,.22)';CT.fillText(line,w/2,y);const local=clamp(progress*arLines.length-i,0,1),clipL=w/2-maxW/2+(1-local)*maxW;CT.save();CT.beginPath();CT.rect(clipL,y-arLH/2,maxW*local,arLH);CT.clip();CT.fillStyle=S.tc;CT.fillText(line,w/2,y);CT.restore();if(tj&&lineStart>=0)drawTajweedOverlays(line,lineStart,y,lineRight,arFont,tj.segments,clipL,w/2+maxW/2);}else{CT.fillStyle=S.tc;CT.globalAlpha=alpha*(S.captionMode==='fade'?.55+.45*progress:1);CT.fillText(line,w/2,y);if(tj&&lineStart>=0)drawTajweedOverlays(line,lineStart,y,lineRight,arFont,tj.segments,w/2-maxW/2,w/2+maxW/2);CT.globalAlpha=alpha;}});
  CT.shadowBlur=0;CT.direction='ltr';top+=arLines.length*arLH;
  if(trLines.length){top+=20;CT.fillStyle='rgba(255,255,255,.12)';CT.fillRect(w/2-38,top-9,76,1);CT.font=trFont;CT.fillStyle='rgba(255,255,255,.9)';trLines.forEach((line,i)=>CT.fillText((i===0?`${v.ar.numberInSurah}. `:'')+line,w/2,top+i*trLH+trLH/2));top+=trLines.length*trLH;}
  if(translitLines.length){top+=9;CT.font=`400 ${Math.max(12,S.trSz-3)}px Inter`;CT.fillStyle='rgba(255,255,255,.58)';translitLines.forEach((line,i)=>CT.fillText(line,w/2,top+i*tlLH+tlLH/2));}
  CT.restore();
}
function drawIntro(w,h){CT.save();CT.textAlign='center';CT.textBaseline='middle';CT.fillStyle='rgba(255,255,255,.65)';CT.font='500 13px Cinzel';CT.fillText('QURAN RECITATION',w/2,h*.43);CT.fillStyle=S.tc;CT.font=`700 ${Math.min(64,w*.08)}px "${S.arFn}",Amiri`;CT.direction='rtl';CT.fillText(S.surah?.[1]||'',w/2,h*.49);CT.direction='ltr';CT.font='600 25px Cinzel';CT.fillText(S.surah?.[2]?.toUpperCase()||'',w/2,h*.55);const ix=selectedIndices();CT.fillStyle='rgba(255,255,255,.55)';CT.font='500 13px Inter';CT.fillText(ix.length?`Ayat ${S.va[ix[0]]?.numberInSurah}–${S.va[ix.at(-1)]?.numberInSurah}`:'',w/2,h*.59);CT.restore();}
function drawOutro(w,h){CT.save();CT.textAlign='center';CT.textBaseline='middle';CT.fillStyle=S.tc;CT.font=`700 ${Math.min(50,w*.065)}px "${S.arFn}",Amiri`;CT.direction='rtl';CT.fillText('وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ',w/2,h*.45);CT.direction='ltr';CT.fillStyle='rgba(255,255,255,.82)';CT.font='500 18px Inter';const lines=splitLatinLines(S.outroText,w*.75,'500 18px Inter');lines.forEach((l,i)=>CT.fillText(l,w/2,h*.54+i*26));CT.restore();}
function drawProgress(w,h){const n=selectedIndices().length;if(!n||S.progressStyle==='none')return;const overall=clamp((S.vIdx+(S._verseProgress||0))/n,0,1);CT.save();if(S.progressStyle==='line'){const bw=w*.6,x=(w-bw)/2,y=h-24;CT.fillStyle='rgba(255,255,255,.1)';roundedRect(x,y,bw,3,2,true);CT.fillStyle=S.tc;roundedRect(x,y,bw*overall,3,2,true);}else if(S.progressStyle==='dots'){const gap=10,r=2.4,total=(n-1)*gap;for(let i=0;i<n;i++){CT.fillStyle=i<S.vIdx?S.tc:i===S.vIdx?`rgba(255,255,255,${.4+.6*S._verseProgress})`:'rgba(255,255,255,.16)';CT.beginPath();CT.arc(w/2-total/2+i*gap,h-24,r,0,Math.PI*2);CT.fill();}}else{const x=w-34,y=h-38,r=15;CT.lineWidth=2.5;CT.strokeStyle='rgba(255,255,255,.13)';CT.beginPath();CT.arc(x,y,r,0,Math.PI*2);CT.stroke();CT.strokeStyle=S.tc;CT.beginPath();CT.arc(x,y,r,-Math.PI/2,-Math.PI/2+Math.PI*2*overall);CT.stroke();}CT.restore();}
function drawSafeGuides(w,h){if(!S.safeGuides||S.exporting)return;CT.save();CT.strokeStyle='rgba(96,165,250,.28)';CT.lineWidth=1;CT.setLineDash([7,7]);const left=w*.06,right=w*.84,top=h*.08,bottom=h*.86;CT.strokeRect(left,top,right-left,bottom-top);CT.fillStyle='rgba(96,165,250,.5)';CT.font='10px Inter';CT.textAlign='left';CT.fillText('SAFE AREA',left+6,top+14);CT.fillStyle='rgba(248,113,113,.08)';CT.fillRect(w*.84,0,w*.16,h);CT.fillRect(0,h*.86,w,h*.14);CT.restore();}
function drawGrain(w,h){if(!S.grain)return;CT.save();CT.globalAlpha=S.grain;for(let i=0;i<90;i++){const x=(i*197+Math.floor(S._bo*900))%w,y=(i*103+31)%h;CT.fillStyle=i%2?'#fff':'#000';CT.fillRect(x,y,1,1);}CT.restore();}

draw=function(){
  const w=CV.width,h=CV.height;if(!w||!h)return;drawBg(w,h);CT.fillStyle=`rgba(0,0,0,${S.veil})`;CT.fillRect(0,0,w,h);drawGrain(w,h);
  if(S._phase==='intro')drawIntro(w,h);else if(S._phase==='outro')drawOutro(w,h);else{drawHeader(w,h);const vi=getVerseIdx(),v=getVerseAt(vi);drawAdvancedVerse(v,w,h,S._verseProgress||0,1);if(S.wm)drawWm(w,h);drawProgress(w,h);}drawSafeGuides(w,h);
};

// ---------- Audio preview, analysis, and custom audio ----------
async function decodeUrl(url,ctx){if(AUDIO_CACHE.has(url))return AUDIO_CACHE.get(url);const p=(async()=>{const r=await fetch(url);if(!r.ok)throw new Error(`Audio ${r.status}`);return ctx.decodeAudioData(await r.arrayBuffer());})();AUDIO_CACHE.set(url,p);try{return await p}catch(e){AUDIO_CACHE.delete(url);throw e;}}
function weightedDurations(total){const ix=selectedIndices(),weights=ix.map(i=>Math.max(1,(S.va[i]?.text||'').replace(/\s/g,'').length)),sum=weights.reduce((a,b)=>a+b,0);return weights.map(w=>total*w/sum);}
async function loadBuffers(ctx,onProgress=()=>{}){
  if(S.customAudioBlob){const key=S.customAudioUrl;const buf=await decodeUrl(key,ctx);onProgress(1,1);return{buffers:[buf],durations:weightedDurations(buf.duration),custom:true};}
  const buffers=[];for(let i=0;i<S.urls.length;i++){try{buffers.push(await decodeUrl(S.urls[i],ctx));}catch(e){console.warn(e);buffers.push(null);}onProgress(i+1,S.urls.length);}return{buffers,durations:buffers.map(b=>(b?.duration||2.5)+S.verseHold),custom:false};
}
async function analyzeAudio(){if(!S.urls.length&&!S.customAudioBlob)return;const ctx=new AudioContext();try{const data=await loadBuffers(ctx,(a,b)=>{const m=$('proAudioStatus');if(m)m.textContent=`Analyzing ${a}/${b}…`;});S.durations=data.durations;renderTimeline();drawWave(data.buffers);toast(`Timeline analyzed · ${formatTime(S.durations.reduce((a,b)=>a+b,0))}`);}catch(e){console.error(e);toast('Audio analysis failed','bad');}finally{ctx.close();const m=$('proAudioStatus');if(m)m.textContent=S.customAudioName?`Custom: ${S.customAudioName}`:'Selected reciter · per-ayah audio';}}
function drawWave(buffers){const c=$('proWave');if(!c||!buffers?.length)return;const cx=c.getContext('2d'),w=c.width,h=c.height;cx.clearRect(0,0,w,h);cx.fillStyle='rgba(255,255,255,.04)';cx.fillRect(0,0,w,h);const samples=[];for(const b of buffers){if(!b)continue;const d=b.getChannelData(0),step=Math.max(1,Math.floor(d.length/(w/Math.max(1,buffers.length))));for(let i=0;i<d.length;i+=step){let peak=0;for(let j=i;j<i+step&&j<d.length;j++)peak=Math.max(peak,Math.abs(d[j]));samples.push(peak);}}const stride=Math.max(1,Math.ceil(samples.length/w));cx.strokeStyle='#c9a96e';cx.lineWidth=1;cx.beginPath();for(let x=0;x<w;x++){let p=0;for(let j=x*stride;j<(x+1)*stride&&j<samples.length;j++)p=Math.max(p,samples[j]);const y=p*h*.43;cx.moveTo(x,h/2-y);cx.lineTo(x,h/2+y);}cx.stroke();}
function drawWavePlaceholder(){const c=$('proWave');if(!c)return;const cx=c.getContext('2d');cx.clearRect(0,0,c.width,c.height);cx.strokeStyle='rgba(201,169,110,.35)';cx.beginPath();for(let x=0;x<c.width;x++){const y=17+Math.sin(x*.08)*3+Math.sin(x*.19)*1.5;x?cx.lineTo(x,y):cx.moveTo(x,y);}cx.stroke();}
async function loadCustomAudio(file){if(!file)return;if(S.customAudioUrl)URL.revokeObjectURL(S.customAudioUrl);S.customAudioBlob=file;S.customAudioUrl=URL.createObjectURL(file);S.customAudioName=file.name;S.durations=[];renderCtrl();await analyzeAudio();toast('Custom audio loaded locally');}
function clearCustomAudio(){if(S.customAudioUrl)URL.revokeObjectURL(S.customAudioUrl);S.customAudioBlob=null;S.customAudioUrl=null;S.customAudioName='';S.durations=[];renderCtrl();renderTimeline();toast('Using selected reciter');}
let micRecorder=null,micStream=null,micChunks=[],micStarted=0,micTimer=null;
async function toggleMicRecord(){
  if(micRecorder&&micRecorder.state==='recording'){micRecorder.stop();return;}
  if(!navigator.mediaDevices?.getUserMedia){toast('Microphone recording is not supported here','bad');return;}
  try{
    micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false}});
    const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(x=>MediaRecorder.isTypeSupported(x))||'';
    micChunks=[];micRecorder=new MediaRecorder(micStream,mime?{mimeType:mime}:undefined);micStarted=Date.now();
    micRecorder.ondataavailable=e=>{if(e.data.size)micChunks.push(e.data);};
    micRecorder.onstop=async()=>{
      clearInterval(micTimer);micStream?.getTracks().forEach(t=>t.stop());
      const type=micRecorder.mimeType||'audio/webm',ext=type.includes('mp4')?'m4a':'webm';
      const file=new File(micChunks,`quran-recording-${Date.now()}.${ext}`,{type});
      micRecorder=null;micStream=null;const btn=$('proMicBtn');if(btn)btn.textContent='Record voice';
      await loadCustomAudio(file);
    };
    micRecorder.start(250);const btn=$('proMicBtn');if(btn)btn.textContent='Stop 0:00';
    micTimer=setInterval(()=>{const b=$('proMicBtn');if(b){const sec=Math.floor((Date.now()-micStarted)/1000);b.textContent=`Stop ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;}},500);
    toast('Microphone recording started');
  }catch(e){console.error(e);toast('Microphone permission was not granted','bad');}
}

const legacyPrv=window.prv,legacyNxt=window.nxt;
window.prv=()=>{legacyPrv();renderTimeline();};
window.nxt=()=>{legacyNxt();renderTimeline();};

window.tp=()=>{
  if(S.customAudioBlob)return previewCustomAudio();
  if(S.playing){stopPreview();return;}if(!S.urls.length)return;S.playing=true;S.vIdx=0;S._phase='verse';S._verseProgress=0;$('ppBtn').innerHTML='&#9646;&#9646;';playPreviewVerse(0);
};
function stopPreview(){S.playing=false;S._audio.pause();cancelAnimationFrame(S._previewRaf);$('ppBtn').innerHTML='&#9654; Preview';S._verseProgress=0;if(!S._bgV)stopL();renderTimeline();draw();}
function playPreviewVerse(i){if(!S.playing)return;if(i>=S.urls.length){stopPreview();return;}S.vIdx=i;S._verseProgress=0;renderTimeline();$('vcnt').textContent=`${i+1} / ${S.urls.length}`;S._audio.crossOrigin='anonymous';S._audio.src=S.urls[i];S._audio.onended=()=>setTimeout(()=>playPreviewVerse(i+1),S.verseHold*1000);S._audio.onerror=()=>playPreviewVerse(i+1);S._audio.onloadedmetadata=()=>S._audio.play().catch(()=>playPreviewVerse(i+1));const tick=()=>{if(!S.playing||S.vIdx!==i)return;S._verseProgress=S._audio.duration?clamp(S._audio.currentTime/S._audio.duration,0,1):0;draw();S._previewRaf=requestAnimationFrame(tick);};tick();}
async function previewCustomAudio(){if(S.playing){stopPreview();return;}S.playing=true;S._phase='verse';S.vIdx=0;S._audio.src=S.customAudioUrl;S._audio.onloadedmetadata=()=>{const ds=weightedDurations(S._audio.duration),cum=[0];ds.forEach(d=>cum.push(cum.at(-1)+d));S._audio.play();const tick=()=>{if(!S.playing)return;const t=S._audio.currentTime;let i=cum.findIndex((v,k)=>k<cum.length-1&&t>=v&&t<cum[k+1]);if(i<0)i=ds.length-1;S.vIdx=i;S._verseProgress=clamp((t-cum[i])/ds[i],0,1);$('vcnt').textContent=`${i+1} / ${ds.length}`;renderTimeline();draw();S._previewRaf=requestAnimationFrame(tick);};tick();};S._audio.onended=stopPreview;S._audio.play().catch(()=>{});$('ppBtn').innerHTML='&#9646;&#9646;';}

// ---------- Export pipeline ----------
function ensureExportModal(){let m=$('proExportModal');if(m)return m;m=document.createElement('div');m.id='proExportModal';m.className='pro-modal';m.innerHTML=`<div class="pro-dialog"><div class="pro-dialog-h"><h3>Export Quran Reel</h3><button class="pro-btn" onclick="QRSPro.closeExport()">✕</button></div><div class="pro-dialog-b"><div class="pro-export-grid"><div id="expMp4" class="pro-export-card" onclick="QRSPro.chooseExport('mp4')"><strong>MP4 · H.264/AAC</strong><p>Best for TikTok, Reels and phones. Uses browser WebCodecs after rendering.</p></div><div id="expWebm" class="pro-export-card" onclick="QRSPro.chooseExport('webm')"><strong>WebM · VP9/Opus</strong><p>Direct native browser recording and broad desktop playback.</p></div></div><div class="cg" style="margin-top:10px"><label>Quality</label><div class="pro-segmented">${['draft','high','ultra'].map(q=>`<button id="q_${q}" onclick="QRSPro.chooseQuality('${q}')">${q}</button>`).join('')}</div></div><div class="pro-export-note" id="proExportSupport"></div></div><div class="pro-dialog-f"><button class="pro-btn" onclick="QRSPro.closeExport()">Cancel</button><button class="pro-btn green" onclick="QRSPro.startExport()">Render & download</button></div></div>`;document.body.appendChild(m);return m;}
window.doExport=()=>{const m=ensureExportModal();m.classList.add('on');chooseExport(S.exportType);chooseQuality(S.exportQuality);const support=$('proExportSupport');support.textContent=('VideoEncoder'in window&&'AudioEncoder'in window)?'MP4 conversion is available in this browser. Rendering stays on-device; only recitation/background assets are fetched from their configured sources.':'This browser does not expose WebCodecs. WebM export will still work; MP4 will fall back to WebM.';};
function closeExport(){$('proExportModal')?.classList.remove('on');}
function chooseExport(type){S.exportType=type;$('expMp4')?.classList.toggle('on',type==='mp4');$('expWebm')?.classList.toggle('on',type==='webm');saveSettings();}
function chooseQuality(q){S.exportQuality=q;['draft','high','ultra'].forEach(x=>$(`q_${x}`)?.classList.toggle('on',x===q));saveSettings();}
function qualityConfig(){return S.exportQuality==='draft'?{fps:24,bps:3_500_000}:S.exportQuality==='ultra'?{fps:60,bps:16_000_000}:{fps:30,bps:8_000_000};}
function createImpulse(ctx,seconds=S.roomSize||1.1,decay=S.roomDecay||3){const rate=ctx.sampleRate,len=Math.max(1,Math.floor(rate*seconds)),buf=ctx.createBuffer(2,len,rate);for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);}return buf;}
function createMasterChain(ctx,dest){const input=ctx.createGain(),hp=ctx.createBiquadFilter(),warm=ctx.createBiquadFilter(),deess=ctx.createBiquadFilter(),presence=ctx.createBiquadFilter(),comp=ctx.createDynamicsCompressor(),dry=ctx.createGain(),wet=ctx.createGain(),conv=ctx.createConvolver(),lim=ctx.createDynamicsCompressor();hp.type='highpass';hp.frequency.value=S.audioLowCut?65:10;warm.type='lowshelf';warm.frequency.value=180;warm.gain.value=(S.audioWarmth||0)*8;deess.type='peaking';deess.frequency.value=6500;deess.Q.value=1.4;deess.gain.value=-(S.audioDeEss||0)*10;presence.type='peaking';presence.frequency.value=2800;presence.Q.value=.75;presence.gain.value=(S.audioPresence||0)*7;comp.threshold.value=S.audioCompress?-22:0;comp.knee.value=18;comp.ratio.value=S.audioCompress?2.2:1;comp.attack.value=.01;comp.release.value=.18;dry.gain.value=1;wet.gain.value=S.audioReverb;conv.buffer=createImpulse(ctx);lim.threshold.value=-1;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.002;lim.release.value=.08;input.connect(hp);hp.connect(warm);warm.connect(deess);deess.connect(presence);presence.connect(comp);comp.connect(dry);comp.connect(conv);conv.connect(wet);dry.connect(lim);wet.connect(lim);lim.connect(dest);return input;}
function peakGain(buf){if(!S.audioNormalize||!buf)return S.audioGain;let peak=.001;for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c),step=Math.max(1,Math.floor(d.length/250000));for(let i=0;i<d.length;i+=step)peak=Math.max(peak,Math.abs(d[i]));}return Math.min(2.5,.92/peak)*S.audioGain;}
async function recordWebM(){
  const idx=selectedIndices();
  if(!idx.length)throw new Error('Select at least one ayah');
  const q=qualityConfig();
  const actx=new AudioContext();
  let rec=null;
  let stopped=null;
  try{
    const data=await loadBuffers(actx,(a,b)=>updateExport(.02+.16*a/b,`Loading audio ${a}/${b}`));
    if(!data.custom&&!data.buffers.some(Boolean))throw new Error('Recitation audio could not be loaded');
    if(actx.state==='suspended')await actx.resume();
    S.durations=data.durations;renderTimeline();
    const intro=S.introEnabled?S.introDuration:0;
    const outro=S.outroEnabled?S.outroDuration:0;
    const starts=[],ends=[];let cursor=intro;
    if(data.custom){
      for(const d of data.durations){starts.push(cursor);cursor+=d;ends.push(cursor);}
    }else{
      for(let i=0;i<idx.length;i++){
        starts.push(cursor);cursor+=data.buffers[i]?.duration||2.5;ends.push(cursor);cursor+=S.verseHold;
      }
    }
    const total=cursor+outro+.35;
    const vid=CV.captureStream(q.fps);
    const aud=actx.createMediaStreamDestination();
    const mix=new MediaStream([...vid.getVideoTracks(),...aud.stream.getAudioTracks()]);
    const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x))||'video/webm';
    const chunks=[];
    rec=new MediaRecorder(mix,{mimeType:mime,videoBitsPerSecond:q.bps,audioBitsPerSecond:192000});
    rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
    stopped=new Promise(resolve=>rec.onstop=resolve);
    const master=createMasterChain(actx,aud);
    const base=actx.currentTime+.06;
    if(data.custom){
      const src=actx.createBufferSource(),g=actx.createGain();src.buffer=data.buffers[0];g.gain.value=peakGain(src.buffer);src.connect(g).connect(master);src.start(base+intro);
    }else{
      data.buffers.forEach((buf,i)=>{if(!buf)return;const src=actx.createBufferSource(),g=actx.createGain();src.buffer=buf;g.gain.value=peakGain(buf);src.connect(g).connect(master);src.start(base+starts[i]);});
    }
    S.exporting=true;S._cancel=false;rec.start(1000);
    const started=performance.now()+60;
    if(S._bgV){S._bgV.currentTime=0;S._bgV.play().catch(()=>{});}
    await new Promise((resolve,reject)=>{
      function frame(){
        if(S._cancel)return reject(new Error('cancelled'));
        const t=Math.max(0,(performance.now()-started)/1000);
        if(t<intro){S._phase='intro';S._verseProgress=clamp(t/Math.max(.01,intro),0,1);}
        else if(t>=cursor){S._phase='outro';S._verseProgress=clamp((t-cursor)/Math.max(.01,outro),0,1);}
        else{
          S._phase='verse';
          let i=starts.findIndex((st,k)=>t>=st&&t<(ends[k]??st));
          if(i<0){i=Math.max(0,starts.findLastIndex(st=>t>=st));S._verseProgress=1;}
          else S._verseProgress=clamp((t-starts[i])/(ends[i]-starts[i]),0,1);
          S.vIdx=clamp(i,0,idx.length-1);
        }
        draw();updateExport(.2+.68*clamp(t/total,0,1),`Rendering ${formatTime(t)} / ${formatTime(total)}`);
        if(t>=total)resolve();else requestAnimationFrame(frame);
      }
      frame();
    });
    rec.stop();await stopped;rec=null;
    return new Blob(chunks,{type:'video/webm'});
  }finally{
    if(rec&&rec.state!=='inactive'){try{rec.stop();if(stopped)await stopped;}catch(_){}}
    try{await actx.close();}catch(_){}
    S.exporting=false;S._phase='verse';S._verseProgress=0;draw();
  }
}
async function convertToMp4(webm){
  updateExport(.9,'Converting to MP4…');
  const mb=await import('https://cdn.jsdelivr.net/npm/mediabunny@1.52.2/+esm');
  const input=new mb.Input({formats:mb.ALL_FORMATS,source:new mb.BlobSource(webm)});const target=new mb.BufferTarget();const output=new mb.Output({format:new mb.Mp4OutputFormat({fastStart:'in-memory'}),target});const q=qualityConfig();const conversion=await mb.Conversion.init({input,output,tracks:'primary',video:{codec:'avc',bitrate:q.bps,forceTranscode:true},audio:{codec:'aac',bitrate:192000,forceTranscode:true}});if(!conversion.isValid)throw new Error('H.264/AAC encoding is unsupported in this browser');conversion.onProgress=p=>updateExport(.9+.095*p,`Converting MP4 ${Math.round(p*100)}%`);await conversion.execute();return new Blob([target.buffer],{type:'video/mp4'});
}
function updateExport(progress,text){const pbar=$('expb'),pt=$('expP');if(pbar)pbar.style.width=`${clamp(progress,0,1)*100}%`;if(pt)pt.textContent=text;}
async function startExport(){closeExport();if(S.exporting)return;$('exo').classList.add('on');$('expT').textContent='Rendering your Quran reel';$('cnlBtn').style.display='inline-block';$('ppBtn').disabled=true;$('peBtn').disabled=true;try{let blob=await recordWebM();if(S._cancel)throw new Error('cancelled');if(S.exportType==='mp4'&&'VideoEncoder'in window){try{blob=await convertToMp4(blob);downloadBlob(blob,projectName('mp4'));}catch(e){console.warn(e);toast('MP4 conversion unavailable; downloaded WebM instead','bad');downloadBlob(blob,projectName('webm'));}}else downloadBlob(blob,projectName('webm'));updateExport(1,'Complete');$('expT').textContent='Export complete';toast('Video downloaded');await new Promise(r=>setTimeout(r,600));}catch(e){console.error(e);$('expT').textContent=e.message==='cancelled'?'Export cancelled':'Export failed';updateExport(0,e.message==='cancelled'?'Cancelled':e.message);toast(e.message==='cancelled'?'Export cancelled':'Export failed','bad');}finally{S.exporting=false;S._cancel=false;S._phase='verse';$('exo').classList.remove('on');$('ppBtn').disabled=false;$('peBtn').disabled=false;$('cnlBtn').style.display='none';draw();}}

// ---------- Project files ----------
function exportProject(){const payload={app:'Quran Reels Studio',version:PRO_VERSION,surah:S.surah?.[0]||null,selected:selectedIndices().map(i=>i+1),settings:settingsSnapshot(),savedAt:new Date().toISOString()};downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),`quran-reels-project-${Date.now()}.json`);}
function importProject(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{try{const p=JSON.parse(await input.files[0].text());Object.assign(S,p.settings||{});saveSettings();if(p.surah){await window.pickSurah(p.surah);S.sel=new Set((p.selected||[]).map(n=>n-1).filter(i=>i>=0&&i<S.va.length));renderVerses();injectVerseTools();}renderCtrl();draw();toast('Project loaded');}catch(e){toast('Invalid project file','bad');}};input.click();}
function resetProject(){localStorage.removeItem(STORAGE_KEY);const keep={surah:S.surah,sel:S.sel,va:S.va,ve:S.ve,vt:S.vt,urls:S.urls};Object.assign(S,{template:'noor',captionMode:'reveal',captionCard:true,cardOpacity:.18,headerStyle:'minimal',progressStyle:'line',tc:'#c9a96e',veil:.35,arFn:'Scheherazade New',arWt:'500',introEnabled:true,outroEnabled:true,audioGain:1,audioReverb:.06},keep);applyTemplate('noor');}

// ---------- Public API and boot ----------
window.QRSPro={selectRange,changeTranslation,jumpVerse,analyzeAudio,toggleSection,applyTemplate,setValue,toggleTransliteration,filterReciters,loadCustomAudio,clearCustomAudio,toggleMicRecord,savePexelsKey,closeExport,chooseExport,chooseQuality,startExport,exportProject,importProject,resetProject};

window.addEventListener('keydown',e=>{if(S.view!=='vs'||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(e.code==='Space'){e.preventDefault();window.tp();}else if(e.key==='ArrowLeft')window.prv();else if(e.key==='ArrowRight')window.nxt();else if(e.key.toLowerCase()==='e')window.doExport();});
window.addEventListener('beforeunload',saveSettings);
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
injectHome();window.renderHome();
})();
