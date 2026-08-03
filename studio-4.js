/* Quran Reels Studio 4 — free media hub, cloud reciter catalog, tajweed visuals */
(() => {
'use strict';

const VERSION='4.0.0';
const SETTINGS_KEY='qrs-studio-4';
const RECITER_CACHE_KEY='qrs-aqc-reciter-cache-v1';
const REMOTE_LIBRARY_KEY='qrs-remote-media-library-v1';
const resultStore=new Map();
const recitationCache=new Map();
let previewAudio=null;
let activeObjectUrl='';

const MOTIONS=[
  ['nur-particles','Nur particles','linear-gradient(135deg,#020617,#6b4f1d)'],
  ['emerald-dust','Emerald dust','linear-gradient(135deg,#00120c,#0b5d3b)'],
  ['midnight-stars','Midnight stars','linear-gradient(135deg,#02030e,#172554)'],
  ['aurora-flow','Aurora flow','linear-gradient(135deg,#02101a,#075985,#0f766e)'],
  ['silk-waves','Silk waves','linear-gradient(135deg,#140b2d,#6d28d9)'],
  ['gold-bokeh','Gold bokeh','linear-gradient(135deg,#160d02,#8a5d16)'],
  ['blue-mist','Blue mist','linear-gradient(135deg,#071426,#334155)'],
  ['desert-light','Desert light','linear-gradient(135deg,#29160a,#b45309)'],
  ['rain-window','Rain window','linear-gradient(135deg,#07111e,#1e3a5f)'],
  ['moon-clouds','Moon clouds','linear-gradient(135deg,#020617,#475569)'],
  ['ocean-caustics','Ocean caustics','linear-gradient(135deg,#001f36,#0284c7)'],
  ['forest-rays','Forest rays','linear-gradient(135deg,#03130c,#166534)'],
  ['lantern-glow','Lantern glow','linear-gradient(135deg,#140a03,#a16207)'],
  ['rose-smoke','Rose smoke','linear-gradient(135deg,#210617,#9d174d)'],
  ['geometric-noor','Geometric noor','linear-gradient(135deg,#050816,#4338ca)'],
  ['dawn-horizon','Dawn horizon','linear-gradient(135deg,#28101b,#ea580c)'],
  ['soft-clouds','Soft clouds','linear-gradient(135deg,#172033,#64748b)'],
  ['deep-space','Deep space','linear-gradient(135deg,#02020a,#312e81)'],
  ['water-ripples','Water ripples','linear-gradient(135deg,#031b2b,#0e7490)'],
  ['minbar-green','Minbar green','linear-gradient(135deg,#02110c,#14532d)'],
  ['ivory-light','Ivory light','linear-gradient(135deg,#574b39,#c4a777)'],
  ['purple-haze','Purple haze','linear-gradient(135deg,#120821,#7e22ce)'],
  ['calm-dunes','Calm dunes','linear-gradient(135deg,#2c1807,#92400e)'],
  ['silver-orbits','Silver orbits','linear-gradient(135deg,#070b16,#475569)']
];

const TAJWEED_RULES=[
  ['madda_normal','Madd · مد طبيعي','#38bdf8'],['madda_permissible','Permissible madd · مد جائز','#2563eb'],
  ['madda_necessary','Necessary madd · مد لازم','#7c3aed'],['ghunnah','Ghunnah · غنة','#d946ef'],
  ['ikhafa','Ikhfā’ · إخفاء','#f59e0b'],['idgham_ghunnah','Idghām with ghunnah · إدغام بغنة','#ec4899'],
  ['idgham_wo_ghunnah','Idghām without ghunnah · إدغام بلا غنة','#ef4444'],['iqlab','Iqlāb · إقلاب','#14b8a6'],
  ['qalaqah','Qalqalah · قلقلة','#22c55e'],['ham_wasl','Hamzat al-waṣl · همزة الوصل','#9ca3af']
];

const AUDIO_PRESETS={
  natural:{name:'Natural clean',gain:1,reverb:.04,warmth:.06,presence:.05,deEss:.08,size:.85,decay:3.4,compress:true},
  teaching:{name:'Dry teaching',gain:1,reverb:.015,warmth:.02,presence:.08,deEss:.12,size:.45,decay:4.5,compress:true},
  warm:{name:'Warm masjid',gain:1.03,reverb:.11,warmth:.16,presence:.02,deEss:.08,size:1.35,decay:3.2,compress:true},
  broadcast:{name:'Broadcast clear',gain:1.08,reverb:.025,warmth:.06,presence:.14,deEss:.16,size:.55,decay:4.2,compress:true},
  hall:{name:'Wide hall',gain:.98,reverb:.18,warmth:.1,presence:0,deEss:.07,size:1.85,decay:2.7,compress:true},
  intimate:{name:'Intimate soft',gain:.96,reverb:.055,warmth:.18,presence:-.02,deEss:.14,size:.72,decay:3.8,compress:false}
};

function esc(value=''){return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));}
function safeJson(value){return JSON.stringify(value).replace(/</g,'\\u003c');}
function selectedIndices(){return [...(S.sel||[])].sort((a,b)=>a-b);}
function notify(message,bad=false){
  let wrap=document.querySelector('.pro-toast-wrap');
  if(!wrap){wrap=document.createElement('div');wrap.className='pro-toast-wrap';document.body.appendChild(wrap);}
  const el=document.createElement('div');el.className=`pro-toast ${bad?'bad':'good'}`;el.textContent=message;wrap.appendChild(el);setTimeout(()=>el.remove(),3300);
}
function loadV4Settings(){try{Object.assign(S,JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'));}catch(_){} }
function saveV4Settings(){
  const keys=['motionBg','freeProvider','pixabayKey','pexelsKey','mediaCredit','tajweedEnabled','tajweedPalette','tajweedIntensity','audioPreset','audioWarmth','audioPresence','audioDeEss','roomSize','roomDecay'];
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(Object.fromEntries(keys.map(k=>[k,S[k]]))));}catch(_){}
}
Object.assign(S,{
  motionBg:S.motionBg||'nur-particles',freeProvider:S.freeProvider||'library',pixabayKey:S.pixabayKey||localStorage.getItem('qrs-pixabay-key')||'',
  mediaCredit:S.mediaCredit||null,tajweedEnabled:S.tajweedEnabled??false,tajweedPalette:S.tajweedPalette||'classic',tajweedIntensity:S.tajweedIntensity??1,
  tajweedAyahs:S.tajweedAyahs||[],audioPreset:S.audioPreset||'natural',audioWarmth:S.audioWarmth??.08,audioPresence:S.audioPresence??.04,
  audioDeEss:S.audioDeEss??.08,roomSize:S.roomSize??1.1,roomDecay:S.roomDecay??3
});
loadV4Settings();

// Remove duplicate and obviously invalid placeholder video records from the old list.
try{
  const seen=new Set();
  for(let i=VIDS.length-1;i>=0;i--){const item=VIDS[i];if(!item?.u||/YYYY|\/ID_|\/ID\b/.test(item.u)||item.n==='Name'||seen.has(item.u))VIDS.splice(i,1);else seen.add(item.u);}
  VIDS.forEach(v=>{v.source=v.source||'Pixabay';});
}catch(_){}

function loadCachedReciters(){
  try{const cached=JSON.parse(localStorage.getItem(RECITER_CACHE_KEY)||'[]');mergeCloudReciters(cached,false);}catch(_){}
}
function reciterLabel(item){
  const base=item.englishName||item.name||item.identifier;
  const bits=[];if(item.bitrate)bits.push(`${item.bitrate}k`);if(/mujawwad/i.test(base+item.identifier))bits.push('Mujawwad');if(/muallim|teacher/i.test(base+item.identifier))bits.push('Muallim');
  return `${base}${bits.length?` — ${bits.join(' · ')}`:''}`;
}
function mergeCloudReciters(items,rerender=true){
  let added=0;
  for(const item of items||[]){
    if(!item?.identifier)continue;
    const id=`aqc:${item.identifier}`;
    if(!RECS.some(r=>r[0]===id)){RECS.push([id,reciterLabel(item)]);added++;}
  }
  RECS.sort((a,b)=>a[1].localeCompare(b[1]));
  if(rerender&&typeof renderCtrl==='function')renderCtrl();
  return added;
}
loadCachedReciters();

async function syncReciters(){
  const btn=document.getElementById('v4SyncReciters');if(btn){btn.disabled=true;btn.textContent='Syncing…';}
  try{
    let response=await fetch('https://api.alquran.cloud/v1/edition?format=audio&type=versebyverse');
    if(!response.ok)throw new Error(`Catalog ${response.status}`);
    let payload=await response.json();let items=Array.isArray(payload.data)?payload.data:[];
    if(!items.length){response=await fetch('https://api.alquran.cloud/v1/edition/format/audio');payload=await response.json();items=(payload.data||[]).filter(x=>x.type==='versebyverse'||!x.type);}
    items=items.filter(x=>x.identifier&&x.format==='audio');
    localStorage.setItem(RECITER_CACHE_KEY,JSON.stringify(items));
    const added=mergeCloudReciters(items,true);
    notify(`${items.length} free audio editions available${added?` · ${added} added`:''}`);
  }catch(error){console.error(error);notify('Could not sync the online reciter catalog',true);}
  finally{if(btn){btn.disabled=false;btn.textContent='Sync free catalog';}}
}

function reciterStyle(text=''){
  if(/mujawwad/i.test(text))return'mujawwad';
  if(/muallim|teacher/i.test(text))return'muallim';
  return'murattal';
}
function filterReciterStyle(style){
  const select=document.getElementById('rc');if(!select)return;
  document.querySelectorAll('.v4-chip[data-style]').forEach(x=>x.classList.toggle('on',x.dataset.style===style));
  [...select.options].forEach(option=>{option.hidden=style!=='all'&&reciterStyle(option.textContent)!==style;});
}
async function resolveCloudRecitation(identifier,surah){
  const key=`${identifier}:${surah}`;if(recitationCache.has(key))return recitationCache.get(key);
  const promise=(async()=>{
    const r=await fetch(`https://api.alquran.cloud/v1/surah/${surah}/${encodeURIComponent(identifier)}`);
    if(!r.ok)throw new Error(`Audio source ${r.status}`);
    const j=await r.json();const ayahs=j.data?.ayahs||[];
    return ayahs.map(a=>a.audio||a.audioSecondary?.[0]||'');
  })();
  recitationCache.set(key,promise);
  try{return await promise;}catch(e){recitationCache.delete(key);throw e;}
}
async function urlsForCurrentReciter(){
  const idx=selectedIndices();if(!S.surah||!idx.length)return[];
  if(String(S.rec).startsWith('aqc:')){
    const all=await resolveCloudRecitation(String(S.rec).slice(4),S.surah[0]);
    return idx.map(i=>all[i]).filter(Boolean);
  }
  const folder=FOLDERS[S.rec];if(!folder)throw new Error('This reciter has no configured audio source');
  return idx.map(i=>`https://everyayah.com/data/${folder}/${String(S.surah[0]).padStart(3,'0')}${String(S.va[i].numberInSurah).padStart(3,'0')}.mp3`);
}
async function previewReciter(){
  try{
    if(previewAudio){previewAudio.pause();previewAudio=null;}
    const idx=selectedIndices();const ayahIndex=idx[0]??0;
    let url='';
    if(String(S.rec).startsWith('aqc:')){const all=await resolveCloudRecitation(String(S.rec).slice(4),S.surah?.[0]||1);url=all[ayahIndex]||all[0];}
    else{const folder=FOLDERS[S.rec];if(folder)url=`https://everyayah.com/data/${folder}/${String(S.surah?.[0]||1).padStart(3,'0')}${String(S.va?.[ayahIndex]?.numberInSurah||1).padStart(3,'0')}.mp3`;}
    if(!url)throw new Error('No preview URL');
    previewAudio=new Audio(url);previewAudio.volume=.9;await previewAudio.play();notify('Playing a short reciter preview');
    setTimeout(()=>{if(previewAudio){previewAudio.pause();previewAudio=null;}},12000);
  }catch(error){console.error(error);notify('Reciter preview could not be played',true);}
}

// Tajweed layer from quran-tajweed. Only text and whitelisted rule classes are kept.
function parseTajweedMarkup(markup=''){
  const parser=new DOMParser();const doc=parser.parseFromString(`<div>${markup}</div>`,'text/html');const root=doc.body.firstElementChild;
  let plain='',segments=[];
  function walk(node,rule=''){
    if(node.nodeType===Node.TEXT_NODE){const start=plain.length;plain+=node.nodeValue||'';if(rule&&plain.length>start)segments.push({start,end:plain.length,rule});return;}
    if(node.nodeType!==Node.ELEMENT_NODE)return;
    const next=node.tagName.toLowerCase()==='tajweed'?(String(node.className).split(/\s+/)[0]||rule):rule;
    [...node.childNodes].forEach(child=>walk(child,next));
  }
  if(root)[...root.childNodes].forEach(n=>walk(n));
  return{markup,plain,segments};
}
function appendSafeTajweed(target,markup){
  target.textContent='';const parser=new DOMParser();const doc=parser.parseFromString(`<div>${markup}</div>`,'text/html');const root=doc.body.firstElementChild;
  function copy(node,parent){
    if(node.nodeType===Node.TEXT_NODE){parent.appendChild(document.createTextNode(node.nodeValue||''));return;}
    if(node.nodeType!==Node.ELEMENT_NODE)return;
    if(node.tagName.toLowerCase()==='tajweed'){
      const span=document.createElement('span');const cls=String(node.className).split(/\s+/)[0];if(TAJWEED_RULES.some(r=>r[0]===cls)||['laam_shamsiyah','ikhafa_shafawi','idgham_shafawi'].includes(cls))span.className=cls;[...node.childNodes].forEach(ch=>copy(ch,span));parent.appendChild(span);
    }else [...node.childNodes].forEach(ch=>copy(ch,parent));
  }
  if(root)[...root.childNodes].forEach(n=>copy(n,target));
}
async function loadTajweedLayer(force=false){
  if(!S.surah)return;
  const key=`tajweed:${S.surah[0]}`;
  if(!force&&VC[key]){S.tajweedAyahs=VC[key];decorateVerseList();draw();return;}
  const status=document.getElementById('v4TajweedStatus');if(status)status.textContent='Loading verified tajweed text…';
  try{
    const r=await fetch(`https://api.alquran.cloud/v1/surah/${S.surah[0]}/quran-tajweed`);if(!r.ok)throw new Error(`Tajweed ${r.status}`);
    const j=await r.json();S.tajweedAyahs=(j.data?.ayahs||[]).map(a=>parseTajweedMarkup(a.text||''));VC[key]=S.tajweedAyahs;decorateVerseList();draw();
    if(status)status.textContent='Verified quran-tajweed layer loaded';notify('Tajweed color layer loaded');
  }catch(error){console.error(error);S.tajweedEnabled=false;if(status)status.textContent='Tajweed layer unavailable';notify('Could not load tajweed text',true);}
  saveV4Settings();
}
async function toggleTajweed(enabled){S.tajweedEnabled=enabled;saveV4Settings();if(enabled)await loadTajweedLayer();else{decorateVerseList();draw();}}
function decorateVerseList(){
  const rows=document.querySelectorAll('#vl .vi2 .ar');if(!rows.length)return;
  rows.forEach((node,i)=>{
    node.classList.toggle('v4-tajweed-text',!!S.tajweedEnabled);
    if(S.tajweedEnabled&&S.tajweedAyahs?.[i]?.markup)appendSafeTajweed(node,S.tajweedAyahs[i].markup);
    else node.textContent=S.va?.[i]?.text||'';
  });
}
function setTajweedPalette(value){S.tajweedPalette=value;saveV4Settings();draw();}

// Motion backgrounds render entirely on-device, so they always export and need no license lookup.
function rgba(hex,a){const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`;}
function applyCommonOverlay(w,h){
  if(S.vignette>0){const vg=CT.createRadialGradient(w/2,h/2,Math.min(w,h)*.18,w/2,h/2,Math.max(w,h)*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${S.vignette})`);CT.fillStyle=vg;CT.fillRect(0,0,w,h);}
  if(S.colorOv){CT.save();CT.globalAlpha=S.colorOvOp;CT.fillStyle=S.colorOv;CT.fillRect(0,0,w,h);CT.restore();}
}
function particles(w,h,count,color,t,size=1){
  CT.save();for(let i=0;i<count;i++){const x=(i*191+Math.sin(i*3.1+t*.6)*w*.12+w)%w;const y=(i*97-t*(12+(i%7)*3)+h*5)%h;const r=(.5+(i%5)*.35)*size;CT.globalAlpha=.08+((i*37)%80)/100;CT.fillStyle=color;CT.beginPath();CT.arc(x,y,r,0,Math.PI*2);CT.fill();}CT.restore();
}
function drawMotion(w,h){
  S._bo+=(.0025*(S.bgSpeed||1));const t=S._bo*30,id=S.motionBg||'nur-particles';
  const palettes={
    'nur-particles':['#020617','#3b2a0b','#d6b45c'],'emerald-dust':['#00120c','#064e3b','#6ee7b7'],'midnight-stars':['#01020a','#172554','#bfdbfe'],
    'aurora-flow':['#020617','#0c4a6e','#0f766e'],'silk-waves':['#120622','#4c1d95','#c084fc'],'gold-bokeh':['#120a02','#713f12','#fde68a'],
    'blue-mist':['#07111e','#1e3a5f','#94a3b8'],'desert-light':['#251306','#92400e','#fdba74'],'rain-window':['#06101c','#0f2742','#93c5fd'],
    'moon-clouds':['#020617','#334155','#e2e8f0'],'ocean-caustics':['#001a2c','#0369a1','#67e8f9'],'forest-rays':['#02120a','#14532d','#86efac'],
    'lantern-glow':['#150a02','#854d0e','#fde68a'],'rose-smoke':['#210617','#831843','#f9a8d4'],'geometric-noor':['#050816','#312e81','#a5b4fc'],
    'dawn-horizon':['#220b18','#9a3412','#fed7aa'],'soft-clouds':['#111827','#475569','#cbd5e1'],'deep-space':['#010108','#1e1b4b','#c4b5fd'],
    'water-ripples':['#021824','#0e7490','#a5f3fc'],'minbar-green':['#02110c','#166534','#bbf7d0'],'ivory-light':['#3f3526','#a88d5c','#fff1c2'],
    'purple-haze':['#120821','#6b21a8','#e9d5ff'],'calm-dunes':['#261405','#9a5b19','#fed7aa'],'silver-orbits':['#050812','#334155','#e2e8f0']
  };
  const p=palettes[id]||palettes['nur-particles'];const g=CT.createLinearGradient(0,0,w,h);g.addColorStop(0,p[0]);g.addColorStop(.52,p[1]);g.addColorStop(1,p[0]);CT.fillStyle=g;CT.fillRect(0,0,w,h);
  if(/particles|dust|stars|space/.test(id)){particles(w,h,id==='midnight-stars'?170:110,p[2],t,id==='deep-space'?1.5:1);}
  else if(/aurora|silk|smoke|mist|cloud|haze/.test(id)){
    CT.save();CT.globalCompositeOperation='screen';for(let k=0;k<6;k++){CT.beginPath();const y=h*(.15+k*.14);CT.moveTo(-w*.1,y);for(let x=-w*.1;x<=w*1.1;x+=w/18){const yy=y+Math.sin(x/w*7+k+t*.025)*h*(.035+k*.004)+Math.cos(x/w*3-t*.018)*h*.018;CT.lineTo(x,yy);}CT.lineWidth=h*(.055+k*.006);CT.strokeStyle=rgba(k%2?p[2]:p[1],.055);CT.stroke();}CT.restore();
  } else if(/rain/.test(id)){CT.save();CT.strokeStyle=rgba(p[2],.24);CT.lineWidth=1.2;for(let i=0;i<85;i++){const x=(i*137+t*9)%w,y=(i*83+t*25)%h;CT.beginPath();CT.moveTo(x,y);CT.lineTo(x-5,y+22+(i%5)*4);CT.stroke();}CT.restore();}
  else if(/ocean|water/.test(id)){CT.save();CT.globalCompositeOperation='screen';for(let i=0;i<24;i++){const y=h*(.12+i*.038);CT.beginPath();for(let x=0;x<=w;x+=w/30){const yy=y+Math.sin(x*.018+i+t*.04)*h*.012; x?CT.lineTo(x,yy):CT.moveTo(x,yy);}CT.strokeStyle=rgba(p[2],.025+i*.002);CT.lineWidth=2+i*.1;CT.stroke();}CT.restore();}
  else if(/geometric|orbits/.test(id)){CT.save();CT.translate(w/2,h/2);CT.rotate(t*.002);for(let i=0;i<12;i++){CT.rotate(Math.PI/6);CT.strokeStyle=rgba(p[2],.05+i*.006);CT.lineWidth=1;CT.strokeRect(w*.08+i*3,-w*.08-i*3,w*.16+i*6,w*.16+i*6);}CT.restore();}
  else if(/dunes|desert|dawn/.test(id)){for(let k=0;k<5;k++){CT.beginPath();CT.moveTo(0,h);for(let x=0;x<=w;x+=w/20){const y=h*(.62+k*.09)+Math.sin(x/w*4+k+t*.01)*h*.045;CT.lineTo(x,y);}CT.lineTo(w,h);CT.closePath();CT.fillStyle=rgba(k%2?p[1]:p[2],.09+k*.035);CT.fill();}}
  else if(/lantern|bokeh|ivory/.test(id)){for(let i=0;i<34;i++){const x=(i*181+Math.sin(t*.02+i)*40)%w,y=(i*113+Math.cos(t*.015+i)*35)%h,r=10+(i%7)*8;const bg=CT.createRadialGradient(x,y,0,x,y,r);bg.addColorStop(0,rgba(p[2],.22));bg.addColorStop(1,rgba(p[2],0));CT.fillStyle=bg;CT.fillRect(x-r,y-r,r*2,r*2);}}
  else if(/forest|minbar/.test(id)){CT.save();CT.globalCompositeOperation='screen';for(let i=0;i<9;i++){const x=w*(i/8)+Math.sin(t*.008+i)*w*.03;const rg=CT.createLinearGradient(x,0,x+w*.08,h);rg.addColorStop(0,rgba(p[2],.11));rg.addColorStop(1,rgba(p[2],0));CT.fillStyle=rg;CT.beginPath();CT.moveTo(x,0);CT.lineTo(x+w*.13,h);CT.lineTo(x+w*.03,h);CT.closePath();CT.fill();}CT.restore();particles(w,h,55,p[2],t,.8);}
  applyCommonOverlay(w,h);
}

const previousDrawBg=window.drawBg;
window.drawBg=function(w,h){if(S.bgT==='motion')return drawMotion(w,h);return previousDrawBg(w,h);};

function clearBackgroundMedia(){
  if(S._bgV){try{S._bgV.pause();}catch(_){}S._bgV=null;}
  S._bgImg=null;if(activeObjectUrl){URL.revokeObjectURL(activeObjectUrl);activeObjectUrl='';}
}
function selectMotion(id){clearBackgroundMedia();S.bgT='motion';S.motionBg=id;S.mediaCredit={source:'Built-in procedural motion',title:MOTIONS.find(x=>x[0]===id)?.[1]||id,license:'Generated on-device'};saveV4Settings();renderBg('motion');draw();if(typeof startL==='function')startL();}
function useVideoUrl(url,credit={},ownedObjectUrl=false,backgroundType='sources'){
  if(!/^https?:|^blob:/.test(url))return notify('Only secure HTTP(S) or local blob video URLs are accepted',true);
  clearBackgroundMedia();if(ownedObjectUrl)activeObjectUrl=url;const video=document.createElement('video');video.crossOrigin='anonymous';video.loop=true;video.muted=true;video.playsInline=true;video.preload='auto';video.src=url;video.playbackRate=S.bgVidSpd||1;
  video.onloadeddata=()=>{S._bgV=video;video.play().catch(()=>{});if(typeof startL==='function')startL();draw();notify('Background video selected');};
  video.onerror=()=>notify('This video could not be loaded or does not allow browser export',true);
  S._bgV=video;S._bgImg=null;S.bgP=null;S.bgT=backgroundType;S.mediaCredit=credit;saveV4Settings();
}
function setDirectVideo(){const input=document.getElementById('v4DirectUrl');const url=input?.value.trim();if(!url)return;useVideoUrl(url,{source:'Direct URL',title:url,license:'Check source license before publishing'});}

function sourceTabs(){return ['library','pexels','pixabay','commons','archive','direct'].map(p=>`<button class="${S.freeProvider===p?'on':''}" onclick="QRS4.setProvider('${p}')">${{library:'My library',pexels:'Pexels',pixabay:'Pixabay',commons:'Wikimedia',archive:'Archive',direct:'URL / file'}[p]}</button>`).join('');}
function renderSourceShell(){
  const c=document.getElementById('bgC');if(!c)return;
  c.innerHTML=`<div class="v4-provider-tabs">${sourceTabs()}</div><div id="v4SourceBody"></div>${S.mediaCredit?`<div class="v4-credit"><strong>Current source:</strong> ${esc(S.mediaCredit.title||'Media')} · ${esc(S.mediaCredit.source||'Unknown')}${S.mediaCredit.creator?` · ${esc(S.mediaCredit.creator)}`:''}</div>`:''}`;
  renderProviderBody();
}
function setProvider(provider){S.freeProvider=provider;saveV4Settings();renderSourceShell();}
function keyInput(provider){
  if(provider==='pexels')return`<input class="v4-key" id="v4PexelsKey" type="password" placeholder="Your free Pexels API key" value="${esc(S.pexelsKey||'')}" oninput="QRS4.saveKey('pexels',this.value)">`;
  if(provider==='pixabay')return`<input class="v4-key" id="v4PixabayKey" type="password" placeholder="Your free Pixabay API key" value="${esc(S.pixabayKey||'')}" oninput="QRS4.saveKey('pixabay',this.value)">`;
  return'';
}
function renderProviderBody(){
  const body=document.getElementById('v4SourceBody');if(!body)return;const p=S.freeProvider;
  if(p==='library')return renderLibrary(body);
  if(p==='direct'){
    body.innerHTML=`<div class="v4-source-head"><input id="v4DirectUrl" placeholder="Paste a direct .mp4 or .webm URL"><button class="pro-btn" onclick="QRS4.setDirectVideo()">Use</button></div><div class="v4-vault-row"><label class="pro-btn" style="text-align:center">Import local video<input hidden type="file" accept="video/*" onchange="QRS4.importLocalVideo(this.files[0])"></label><button class="pro-btn" onclick="QRS4.renderLibraryNow()">Open media vault</button></div><p class="v4-source-note">Local files are stored in this browser using IndexedDB. Direct URLs must permit cross-origin canvas use for export.</p>`;return;
  }
  const needsKey=p==='pexels'||p==='pixabay';
  body.innerHTML=`${keyInput(p)}<div class="v4-source-head"><input id="v4SourceQuery" value="nature" placeholder="Search free portrait videos" onkeydown="if(event.key==='Enter')QRS4.searchMedia()"><button class="pro-btn" onclick="QRS4.searchMedia()">Search</button></div><div class="v4-chip-row">${['mosque','nature','night sky','ocean','desert','rain','mountains'].map(q=>`<button class="v4-chip" onclick="QRS4.quickSearch('${q}')">${q}</button>`).join('')}</div><p class="v4-source-note">${needsKey?'A free personal API key is required and remains only in this browser.':'No API key required.'} Results keep provider and creator information in the project.</p><div class="v4-results" id="v4Results"><div class="v4-empty">Search this free source to add clips.</div></div>`;
}
function saveKey(provider,value){if(provider==='pexels'){S.pexelsKey=value.trim();localStorage.setItem('qrs-pexels-key',S.pexelsKey);}else{S.pixabayKey=value.trim();localStorage.setItem('qrs-pixabay-key',S.pixabayKey);}saveV4Settings();}
function quickSearch(q){const input=document.getElementById('v4SourceQuery');if(input)input.value=q;searchMedia();}
function chooseVideoFile(files={}){return files.medium||files.small||files.large||files.tiny||Object.values(files).find(f=>f?.url);}
function resultCard(item){
  resultStore.set(item.id,item);
  return`<div class="v4-card" onclick="QRS4.useResult('${esc(item.id)}')">${item.thumb?`<img src="${esc(item.thumb)}" alt="" loading="lazy">`:''}<button class="save" title="Save to library" onclick="event.stopPropagation();QRS4.saveResult('${esc(item.id)}')">＋</button><div class="meta"><strong>${esc(item.title||'Free video')}</strong>${esc(item.source)}${item.creator?` · ${esc(item.creator)}`:''}</div></div>`;
}
async function searchMedia(){
  const p=S.freeProvider,q=document.getElementById('v4SourceQuery')?.value.trim()||'nature',grid=document.getElementById('v4Results');if(!grid)return;grid.innerHTML='<div class="v4-empty"><div class="spin" style="margin:0 auto 8px"></div>Searching…</div>';
  try{
    let items=[];
    if(p==='pexels'){
      if(!S.pexelsKey)throw new Error('Add a free Pexels API key first');
      const r=await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=30&orientation=portrait`,{headers:{Authorization:S.pexelsKey}});if(!r.ok)throw new Error(`Pexels ${r.status}`);const j=await r.json();
      items=(j.videos||[]).map(v=>{const files=[...(v.video_files||[])].filter(f=>f.link).sort((a,b)=>Math.abs((a.width||720)-720)-Math.abs((b.width||720)-720));return{id:`pex-${v.id}`,url:files[0]?.link,thumb:v.image,title:`Pexels #${v.id}`,creator:v.user?.name,source:'Pexels',sourcePage:v.url,license:'Pexels license'};}).filter(x=>x.url);
    } else if(p==='pixabay'){
      if(!S.pixabayKey)throw new Error('Add a free Pixabay API key first');
      const r=await fetch(`https://pixabay.com/api/videos/?key=${encodeURIComponent(S.pixabayKey)}&q=${encodeURIComponent(q)}&per_page=30&safesearch=true`);if(!r.ok)throw new Error(`Pixabay ${r.status}`);const j=await r.json();
      items=(j.hits||[]).map(v=>{const file=chooseVideoFile(v.videos||{});return{id:`pix-${v.id}`,url:file?.url,thumb:v.picture_id?`https://i.vimeocdn.com/video/${v.picture_id}_295x166.jpg`:null,title:(v.tags||'Pixabay video').split(',').slice(0,2).join(' · '),creator:v.user,source:'Pixabay',sourcePage:v.pageURL,license:'Pixabay Content License'};}).filter(x=>x.url);
    } else if(p==='commons'){
      const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:`${q} filetype:video`,gsrnamespace:'6',gsrlimit:'30',prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'360',format:'json',origin:'*'});
      const r=await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);if(!r.ok)throw new Error(`Wikimedia ${r.status}`);const j=await r.json();
      items=Object.values(j.query?.pages||{}).map(page=>{const ii=page.imageinfo?.[0],meta=ii?.extmetadata||{};return{id:`wm-${page.pageid}`,url:ii?.url,thumb:ii?.thumburl,title:String(page.title||'').replace(/^File:/,''),creator:(meta.Artist?.value||'').replace(/<[^>]+>/g,''),source:'Wikimedia Commons',sourcePage:ii?.descriptionurl,license:(meta.LicenseShortName?.value||'Commons license')};}).filter(x=>x.url);
    } else if(p==='archive'){
      const query=`mediatype:movies AND (${q})`;const r=await fetch(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl[]=identifier,title,creator&rows=24&page=1&output=json`);if(!r.ok)throw new Error(`Internet Archive ${r.status}`);const j=await r.json();
      items=(j.response?.docs||[]).map(v=>({id:`ia-${v.identifier}`,archiveId:v.identifier,thumb:`https://archive.org/services/img/${encodeURIComponent(v.identifier)}`,title:v.title||v.identifier,creator:Array.isArray(v.creator)?v.creator[0]:v.creator,source:'Internet Archive',sourcePage:`https://archive.org/details/${v.identifier}`,license:'Check item rights metadata'}));
    }
    grid.innerHTML=items.length?items.map(resultCard).join(''):'<div class="v4-empty">No playable videos were found.</div>';
  }catch(error){console.error(error);grid.innerHTML=`<div class="v4-empty">${esc(error.message||'Search failed')}</div>`;notify(error.message||'Media search failed',true);}
}
async function resolveArchive(item){
  const r=await fetch(`https://archive.org/metadata/${encodeURIComponent(item.archiveId)}`);if(!r.ok)throw new Error('Archive metadata unavailable');const j=await r.json();
  const candidates=(j.files||[]).filter(f=>/\.mp4$/i.test(f.name||'')&&!/thumb|sample/i.test(f.name||'')).sort((a,b)=>(Number(a.size)||Infinity)-(Number(b.size)||Infinity));
  const file=candidates.find(f=>(Number(f.size)||0)>200000&&((Number(f.size)||0)<150000000))||candidates[0];if(!file)throw new Error('No browser-ready MP4 was found for this item');
  item.url=`https://archive.org/download/${encodeURIComponent(item.archiveId)}/${String(file.name).split('/').map(encodeURIComponent).join('/')}`;item.license=j.metadata?.licenseurl||j.metadata?.rights||item.license;return item;
}
async function useResult(id){try{let item=resultStore.get(id);if(!item)return;if(item.archiveId&&!item.url)item=await resolveArchive(item);useVideoUrl(item.url,item);}catch(error){console.error(error);notify(error.message||'Could not use this video',true);}}
function remoteLibrary(){try{return JSON.parse(localStorage.getItem(REMOTE_LIBRARY_KEY)||'[]');}catch(_){return[];}}
function saveResult(id){const item=resultStore.get(id);if(!item)return;const lib=remoteLibrary();if(!lib.some(x=>x.id===item.id))lib.unshift({...item});localStorage.setItem(REMOTE_LIBRARY_KEY,JSON.stringify(lib.slice(0,80)));notify('Saved to My Library');}
function deleteRemote(id){localStorage.setItem(REMOTE_LIBRARY_KEY,JSON.stringify(remoteLibrary().filter(x=>x.id!==id)));renderSourceShell();}

function openVault(){return new Promise((resolve,reject)=>{const request=indexedDB.open('qrs-media-vault',1);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('videos'))db.createObjectStore('videos',{keyPath:'id'});};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
async function vaultPut(record){const db=await openVault();return new Promise((resolve,reject)=>{const tx=db.transaction('videos','readwrite');tx.objectStore('videos').put(record);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});}
async function vaultAll(){const db=await openVault();return new Promise((resolve,reject)=>{const req=db.transaction('videos').objectStore('videos').getAll();req.onsuccess=()=>{db.close();resolve(req.result||[]);};req.onerror=()=>reject(req.error);});}
async function vaultDelete(id){const db=await openVault();return new Promise((resolve,reject)=>{const tx=db.transaction('videos','readwrite');tx.objectStore('videos').delete(id);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});}
async function importLocalVideo(file){if(!file)return;if(!file.type.startsWith('video/'))return notify('Choose a video file',true);if(file.size>350*1024*1024)return notify('For browser storage, keep files below 350 MB',true);await vaultPut({id:`local-${Date.now()}-${file.name}`,name:file.name,type:file.type,size:file.size,blob:file,createdAt:Date.now()});notify('Video saved in the local media vault');S.freeProvider='library';renderSourceShell();}
async function useVault(id){const items=await vaultAll(),item=items.find(x=>x.id===id);if(!item)return;const url=URL.createObjectURL(item.blob);useVideoUrl(url,{source:'Local media vault',title:item.name,license:'Your uploaded media'},true);}
async function deleteVault(id){await vaultDelete(id);renderSourceShell();notify('Removed from local vault');}
async function renderLibrary(body){
  body.innerHTML='<div class="v4-empty"><div class="spin" style="margin:0 auto 8px"></div>Opening your media library…</div>';
  let local=[];try{local=await vaultAll();}catch(_){}
  const remote=remoteLibrary();
  const localCards=local.map(item=>`<div class="v4-card" onclick="QRS4.useVault('${esc(item.id)}')"><div class="meta"><strong>${esc(item.name)}</strong>Local vault · ${(item.size/1048576).toFixed(1)} MB</div><button class="save" title="Remove" onclick="event.stopPropagation();QRS4.deleteVault('${esc(item.id)}')">×</button></div>`).join('');
  const remoteCards=remote.map(item=>{resultStore.set(item.id,item);return`<div class="v4-card" onclick="QRS4.useResult('${esc(item.id)}')">${item.thumb?`<img src="${esc(item.thumb)}" alt="" loading="lazy">`:''}<div class="meta"><strong>${esc(item.title||'Saved video')}</strong>${esc(item.source||'Remote source')}</div><button class="save" title="Remove" onclick="event.stopPropagation();QRS4.deleteRemote('${esc(item.id)}')">×</button></div>`;}).join('');
  body.innerHTML=`<div class="v4-vault-row"><label class="pro-btn" style="text-align:center">Add local video<input hidden type="file" accept="video/*" onchange="QRS4.importLocalVideo(this.files[0])"></label><button class="pro-btn" onclick="QRS4.setProvider('pexels')">Find free videos</button></div><div class="v4-results">${localCards}${remoteCards}${!localCards&&!remoteCards?'<div class="v4-empty">Your library is empty. Import a video or save a result from a free source.</div>':''}</div>`;
}
function renderLibraryNow(){S.freeProvider='library';renderSourceShell();}

function renderMotionLibrary(){const c=document.getElementById('bgC');if(!c)return;c.innerHTML=`<div class="v4-motion-grid">${MOTIONS.map(([id,name,bg])=>`<div class="v4-motion${S.motionBg===id?' on':''}" style="--motion-bg:${bg}" onclick="QRS4.selectMotion('${id}')"><span>${name}</span></div>`).join('')}</div><p class="v4-source-note">24 animated backgrounds are generated on-device, work offline after the app shell loads, and export without cross-origin restrictions.</p>`;}

const previousRenderBg=window.renderBg;
window.renderBg=function(type){
  if(type==='motion')return renderMotionLibrary();
  if(type==='sources')return renderSourceShell();
  return previousRenderBg(type);
};

function audioPresetControls(){
  return`<div class="cg"><label>Recitation mastering profile</label><div class="v4-audio-presets">${Object.entries(AUDIO_PRESETS).map(([id,p])=>`<button class="${S.audioPreset===id?'on':''}" onclick="QRS4.applyAudioPreset('${id}')">${p.name}</button>`).join('')}</div><p class="pro-help">Profiles enhance clarity and space without cloning or impersonating a named reciter.</p></div><div class="cg"><label>De-esser</label><div class="rg"><input id="v4DeEss" type="range" min="0" max="0.35" step="0.01" value="${S.audioDeEss}" oninput="QRS4.audioSlider('audioDeEss',this.value)"><span class="rv">${Math.round(S.audioDeEss*100)}%</span></div></div><div class="cg"><label>Warmth / presence</label><div class="pro-row"><input title="Warmth" type="range" min="-0.15" max="0.35" step="0.01" value="${S.audioWarmth}" oninput="QRS4.audioSlider('audioWarmth',this.value)"><input title="Presence" type="range" min="-0.15" max="0.35" step="0.01" value="${S.audioPresence}" oninput="QRS4.audioSlider('audioPresence',this.value)"></div></div>`;
}
function tajweedControls(){
  return`<div class="cg"><div class="tr2"><label>Tajweed color layer · ألوان التجويد</label><label class="tg"><input type="checkbox" ${S.tajweedEnabled?'checked':''} onchange="QRS4.toggleTajweed(this.checked)"><span class="sl"></span></label></div><div id="v4TajweedStatus" class="v4-source-note">${S.tajweedAyahs?.length?'Verified quran-tajweed layer loaded':'Loads the verified quran-tajweed edition when enabled.'}</div><select onchange="QRS4.setTajweedPalette(this.value)"><option value="classic"${S.tajweedPalette==='classic'?' selected':''}>Classic colors</option><option value="accessible"${S.tajweedPalette==='accessible'?' selected':''}>High contrast</option><option value="mono"${S.tajweedPalette==='mono'?' selected':''}>Single-color emphasis</option></select><div class="rg" style="margin-top:5px"><input type="range" min="0.25" max="1" step="0.05" value="${S.tajweedIntensity}" oninput="QRS4.setTajweedIntensity(this.value)"><span class="rv">${Math.round(S.tajweedIntensity*100)}%</span></div><div class="v4-tajweed-legend">${TAJWEED_RULES.map(([_,name,color])=>`<div class="v4-rule"><i style="--c:${color}"></i>${name}</div>`).join('')}</div><p class="pro-help">The colors are a visual guide. They do not grade pronunciation and are not a substitute for a qualified tajweed teacher.</p></div>`;
}
function applyAudioPreset(id){const p=AUDIO_PRESETS[id];if(!p)return;Object.assign(S,{audioPreset:id,audioGain:p.gain,audioReverb:p.reverb,audioWarmth:p.warmth,audioPresence:p.presence,audioDeEss:p.deEss,roomSize:p.size,roomDecay:p.decay,audioCompress:p.compress});saveV4Settings();renderCtrl();notify(`${p.name} mastering applied`);}
function audioSlider(key,value){S[key]=Number(value);S.audioPreset='custom';saveV4Settings();}
function setTajweedIntensity(value){S.tajweedIntensity=Number(value);saveV4Settings();draw();}

const previousRenderCtrl=window.renderCtrl;
window.renderCtrl=function(){
  previousRenderCtrl();
  document.querySelectorAll('.pro-badge').forEach(badge=>{if(/^Studio\s/i.test(badge.textContent||''))badge.textContent=`Studio ${VERSION}`;});
  const select=document.getElementById('rc');if(select){
    const group=select.closest('.cg');if(group&&!group.querySelector('.v4-rec-tools')){
      const count=RECS.length;const status=document.createElement('div');status.className='v4-chip-row';status.innerHTML=`<span class="v4-pill gold">${count}+ reciter editions</span><span class="v4-pill good">Verse-by-verse</span>`;group.appendChild(status);
      const chips=document.createElement('div');chips.className='v4-chip-row';chips.innerHTML=`${[['all','All'],['murattal','Murattal'],['mujawwad','Mujawwad'],['muallim','Muallim']].map(([id,n])=>`<button class="v4-chip" data-style="${id}" onclick="QRS4.filterReciterStyle('${id}')">${n}</button>`).join('')}`;group.appendChild(chips);
      const tools=document.createElement('div');tools.className='v4-rec-tools';tools.innerHTML='<button class="pro-btn" onclick="QRS4.previewReciter()">Preview voice</button><button class="pro-btn" id="v4SyncReciters" onclick="QRS4.syncReciters()">Sync free catalog</button>';group.appendChild(tools);
    }
    const search=document.getElementById('proRecSearch');if(search)search.placeholder=`Search ${RECS.length}+ reciter editions…`;
  }
  const bgTabs=document.querySelector('#cbody .bgt');if(bgTabs){if(S.bgT==='presets')S.bgT='motion';if(S.bgT==='pexels')S.bgT='sources';bgTabs.innerHTML=`<button class="bgb${S.bgT==='motion'?' on':''}" onclick="swBg('motion',this)">Motion</button><button class="bgb${S.bgT==='videos'?' on':''}" onclick="swBg('videos',this)">Built-in</button><button class="bgb${S.bgT==='sources'?' on':''}" onclick="swBg('sources',this)">Free sources</button><button class="bgb${S.bgT==='upload'?' on':''}" onclick="swBg('upload',this)">Upload</button>`;renderBg(S.bgT);}
  const audioSection=document.querySelector('#proAudio .pro-section-body');if(audioSection&&!audioSection.querySelector('.v4-audio-presets'))audioSection.insertAdjacentHTML('afterbegin',audioPresetControls());
  const captions=document.querySelector('#proCaptions .pro-section-body');if(captions&&!captions.querySelector('#v4TajweedStatus'))captions.insertAdjacentHTML('beforeend',tajweedControls());
};

const previousOnChange=window.onCh;
window.onCh=function(){previousOnChange();saveV4Settings();};

const previousGoStudio=window.goStudio;
window.goStudio=async function(){
  if(!S.sel?.size)return;
  if(!String(S.rec).startsWith('aqc:'))return previousGoStudio();
  const btn=document.getElementById('stBtn');const old=btn?.textContent;if(btn){btn.textContent='Loading reciter…';btn.style.pointerEvents='none';}
  try{
    const urls=await urlsForCurrentReciter();if(urls.length!==selectedIndices().length)throw new Error('Some selected ayat have no audio URL');
    const temporary=FOLDERS[S.rec];FOLDERS[S.rec]=FOLDERS['ar.alafasy'];previousGoStudio();S.urls=urls;if(temporary===undefined)delete FOLDERS[S.rec];else FOLDERS[S.rec]=temporary;
    const status=document.getElementById('proAudioStatus');if(status)status.textContent='Al Quran Cloud · verse-by-verse audio';
  }catch(error){console.error(error);notify(error.message||'Could not load this reciter',true);}
  finally{if(btn){btn.textContent=old||'Studio →';btn.style.pointerEvents='';}}
};

const previousPickSurah=window.pickSurah;
window.pickSurah=async function(number){await previousPickSurah(number);S.tajweedAyahs=[];if(S.tajweedEnabled)await loadTajweedLayer();};
const previousRenderVerses=window.renderVerses;
if(previousRenderVerses)window.renderVerses=function(){previousRenderVerses();decorateVerseList();};


const previousPickVid=window.pickVid;
window.pickVid=function(index,element){
  document.querySelectorAll('.bp').forEach(card=>card.classList.remove('on'));if(element)element.classList.add('on');
  const item=VIDS[index];if(!item)return;
  S.bgVidIdx=index;useVideoUrl(item.u,{source:item.source||'Free stock library',title:item.n,license:'Review the provider license before publishing'},false,'videos');
};

function updateVersionBadges(){document.querySelectorAll('.pro-badge').forEach(badge=>{if(/^Studio\s/i.test(badge.textContent||''))badge.textContent=`Studio ${VERSION}`;});}
updateVersionBadges();
window.QRS4={
  syncReciters,filterReciterStyle,previewReciter,toggleTajweed,setTajweedPalette,setTajweedIntensity,loadTajweedLayer,parseTajweedMarkup,
  selectMotion,setProvider,saveKey,quickSearch,searchMedia,useResult,saveResult,deleteRemote,setDirectVideo,importLocalVideo,useVault,deleteVault,renderLibraryNow,
  applyAudioPreset,audioSlider
};

// Upgrade visible version metadata and use a reliable default motion scene for new sessions.
document.documentElement.dataset.qrsVersion=VERSION;
if(S.bgT==='presets'&&!localStorage.getItem(SETTINGS_KEY)){S.bgT='motion';S.motionBg='nur-particles';}
const versionMeta=document.querySelector('meta[name="application-name"]');if(versionMeta)versionMeta.content=`Quran Reels Studio ${VERSION}`;

})();
