"use strict";
/* ---------- data ---------- */
const BOOKS=[["馬太福音","太",28],["馬可福音","可",16],["路加福音","路",24],["約翰福音","約",21],["使徒行傳","徒",28],["羅馬書","羅",16],["哥林多前書","林前",16],["哥林多後書","林後",13],["加拉太書","加",6],["以弗所書","弗",6],["腓立比書","腓",4],["歌羅西書","西",4],["帖撒羅尼迦前書","帖前",5],["帖撒羅尼迦後書","帖後",3],["提摩太前書","提前",6],["提摩太後書","提後",4],["提多書","多",3],["腓利門書","門",1],["希伯來書","來",13],["雅各書","雅",5],["彼得前書","彼前",5],["彼得後書","彼後",3],["約翰一書","約壹",5],["約翰二書","約貳",1],["約翰三書","約參",1],["猶大書","猶",1],["啟示錄","啟",22]];
const GROUPS=[["福音書",0,4],["歷史",4,5],["保羅書信",5,18],["普通書信",18,26],["預言",26,27]];
const COLORS=["y","g","b","p"];
const DAYS=90;
const ALL=[];BOOKS.forEach((b,i)=>{for(let c=1;c<=b[2];c++)ALL.push([i,c])});
const PLAN=Array.from({length:DAYS},(_,d)=>ALL.slice(Math.round(d*ALL.length/DAYS),Math.round((d+1)*ALL.length/DAYS)));

/* ---------- storage ---------- */
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const todayStr=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
let store=ls.get("br.store",null)||{v:{},read:{},plan:{start:{v:todayStr(),t:0},done:{}}};
store.v=store.v||{};store.read=store.read||{};store.plan=store.plan||{start:{v:todayStr(),t:0},done:{}};
let pref=ls.get("br.pref",{b:5,c:1,en:false,theme:"auto",fs:19,view:"read",stab:"guide"});
const savePref=()=>ls.set("br.pref",pref);
let syncTimer=null;
function saveStore(){ls.set("br.store",store);clearTimeout(syncTimer);syncTimer=setTimeout(sync,3000)}
const now=()=>Date.now();
const vkey=(b,c,n)=>`${b}.${c}.${n}`;
const getV=(b,c,n)=>store.v[vkey(b,c,n)]||{};
function setV(b,c,n,patch){const k=vkey(b,c,n);store.v[k]={...(store.v[k]||{}),...patch,t:now()};saveStore()}
const isRead=(b,c)=>!!(store.read[`${b}.${c}`]||{}).d;
function setRead(b,c,d){store.read[`${b}.${c}`]={d:d?1:0,t:now()};saveStore()}

/* ---------- fetch ---------- */
const textCache={},guideCache={};
function getBook(i){return textCache[i]||(textCache[i]=fetch(`data/text/${i}.json`).then(r=>r.json()))}
function getGuide(i){return guideCache[i]||(guideCache[i]=fetch(`data/guide/${i}.json`).then(r=>r.ok?r.json():[]).catch(()=>[]))}

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<mark>$1</mark>");
const wide=()=>matchMedia("(min-width:1001px)").matches;
const mobile=()=>matchMedia("(max-width:720px)").matches;
const I={
 l:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
 r:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
 d:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
 ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
 read:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5C5.5 4 9 4 12 6c3-2 6.5-2 9-.5V19c-2.5-1.5-6-1.5-9 .5-3-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/></svg>',
 plan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
 notes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
 people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.4 3-5 6-5s5.4 1.6 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14c2.6.2 4 1.8 4.5 4.5"/></svg>',
 set:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>',
};
const VIEWS=[["read","讀經",I.read],["plan","計畫",I.plan],["notes","筆記",I.notes],["people","人物",I.people],["settings","設定",I.set]];
function parseRange(r){const [a,b]=String(r).split(/[-–]/).map(Number);return [a,b||a]}
function dayIndex(){const s=new Date(store.plan.start.v+"T00:00:00");const d=Math.floor((new Date(todayStr()+"T00:00:00")-s)/864e5);return Math.max(0,Math.min(DAYS-1,d))}
const dayDone=d=>PLAN[d].every(([b,c])=>isRead(b,c));
const chRef=([b,c])=>`${BOOKS[b][0]} ${c}`;
function dayLabel(d){const p=PLAN[d];const f=p[0],l=p[p.length-1];return f[0]==l[0]?`${BOOKS[f[0]][0]} ${f[1]}–${l[1]}`.replace(/ (\d+)–\1$/," $1"):p.map(chRef).join("、")}
function dayDate(d){const s=new Date(store.plan.start.v+"T00:00:00");s.setDate(s.getDate()+d);return `${s.getMonth()+1}/${s.getDate()}（${"日一二三四五六"[s.getDay()]}）`}

/* ---------- theme ---------- */
function applyPrefs(){
 if(pref.theme==="auto")document.documentElement.removeAttribute("data-theme");else document.documentElement.dataset.theme=pref.theme;
 document.documentElement.style.setProperty("--fs",(mobile()?pref.fs-1:pref.fs)+"px");
}

/* ---------- shell ---------- */
let sel=null,markRe=null,mseg="text",curText=null,curGuide=null;
function shell(){
 $("#nav").innerHTML=VIEWS.map(([k,t])=>`<button data-v="${k}" ${pref.view==k?'aria-current="page"':""}>${t}</button>`).join("");
 $("#tabbar").innerHTML=VIEWS.map(([k,t,ic])=>`<button data-v="${k}" ${pref.view==k?'aria-current="page"':""}>${ic}${t}</button>`).join("");
 renderRail();
}
function renderRail(){
 const d=dayIndex();
 $("#today").innerHTML=`<div class="label">第 ${d+1} 天｜共 ${DAYS} 天</div><div class="today-list">${PLAN[d].map(([b,c])=>`<a data-go="${b}.${c}" class="${isRead(b,c)?"read":""}">${BOOKS[b][0]} ${c}</a>`).join("")}</div>`;
 let h="";
 GROUPS.forEach(([g,a,z])=>{h+=`<div class="grp">${g}</div>`;for(let i=a;i<z;i++){h+=`<button data-book="${i}" class="${pref.b==i?"on":""}">${BOOKS[i][0]}</button>`;
  if(pref.b==i&&pref.view=="read")h+=`<div class="chips">${Array.from({length:BOOKS[i][2]},(_,k)=>`<button data-go="${i}.${k+1}" class="${pref.c==k+1?"on":""}" title="${isRead(i,k+1)?"已讀":""}">${k+1}</button>`).join("")}</div>`}});
 $("#books").innerHTML=h;
 const on=$("#books .chips .on");if(on&&!renderRail.did){on.scrollIntoView({block:"center"});renderRail.did=1}
}
function go(view){pref.view=view;savePref();sel=null;closeSheet();render();window.scrollTo(0,0);$("main").scrollTop=0}
async function openChapter(b,c,opts={}){pref.b=b;pref.c=c;pref.view="read";savePref();sel=opts.verse||null;markRe=opts.mark||null;mseg="text";closeSheet();
 await render();
 if(opts.verse){const el=document.getElementById("v"+opts.verse);if(el){el.scrollIntoView({block:"center"});el.classList.add("flash")}}
 else{window.scrollTo(0,0);$("main").scrollTop=0}
}
async function render(){
 shell();
 $("#mtop").hidden=pref.view!=="read";
 const side=$("#side");side.hidden=pref.view!=="read";
 if(pref.view==="read")return renderRead();
 $("main").innerHTML="";
 if(pref.view==="plan")renderPlan();
 if(pref.view==="notes")renderNotes();
 if(pref.view==="people")renderPeople();
 if(pref.view==="settings")renderSettings();
}

/* ---------- reader ---------- */
async function renderRead(){
 const b=pref.b,c=pref.c;
 $("#mpick").innerHTML=`${BOOKS[b][0]} ${c}${I.d}`;
 const [book,guide]=await Promise.all([getBook(b),getGuide(b)]);
 curText=book[c-1];curGuide=guide[c-1]||null;
 const secs={};if(curGuide&&curGuide.o)curGuide.o.forEach(([t,r])=>{secs[parseRange(r)[0]]=t});
 const verses=curText.map(([n,zh,en])=>{const v=getV(b,c,n);let z=esc(zh);if(markRe)z=z.replace(markRe,"<mark>$&</mark>");
  return `${secs[n]?`<div class="sec">${esc(secs[n])}</div>`:""}<div class="v ${v.h?"h-"+v.h:""} ${sel==n?"sel":""}" id="v${n}" data-n="${n}"><span class="n">${n}</span><span class="zh">${z}</span>${v.n?'<span class="dot"></span>':""}${pref.en&&en?`<span class="en">${esc(en)}</span>`:""}</div>`}).join("");
 const prev=ALL.findIndex(([x,y])=>x==b&&y==c);
 const P=ALL[prev-1],N=ALL[prev+1];
 $("main").innerHTML=`<div class="reader">
  <div class="chead"><h1>${BOOKS[b][0]} ${c}</h1><span class="sp"></span>
   <button class="toggle ${pref.en?"on":""}" data-act="en">EN</button>
   <button class="iconbtn" data-act="prev" ${P?"":"disabled"}>${I.l}</button><button class="iconbtn" data-act="next" ${N?"":"disabled"}>${I.r}</button></div>
  <div class="mseg"><button class="${mseg=="text"?"on":""}" data-seg="text">經文</button><button class="${mseg=="guide"?"on":""}" data-seg="guide">導讀</button></div>
  ${mseg=="guide"&&!wide()?`<div class="guide">${guideHTML()}</div>`:`<div class="text">${verses}</div>`}
  <div class="pager"><button data-act="prev" ${P?"":"hidden"}>← ${P?chRef(P):""}</button>
   <button data-act="next" class="${N?"":"done"}">${isRead(b,c)?"":"讀完，"}${N?chRef(N)+" →":"完成"}</button></div>
 </div>`;
 renderSide();
}
function guideHTML(){
 const g=curGuide;if(!g)return `<p class="empty">本章導讀尚未完成。</p>`;
 const vt=r=>{const [a,z]=parseRange(r);return curText.filter(v=>v[0]>=a&&v[0]<=z).map(v=>v[1]).join("")};
 let h=`<div class="lead">${String(g.s).split("\n").map(p=>`<p>${fmt(p)}</p>`).join("")}</div>`;
 if(g.k&&g.k.length)h+=`<h3>經文</h3>`+g.k.map(r=>`<blockquote>${esc(vt(r))}<cite>${pref.c}:${r}</cite></blockquote>`).join("");
 if(g.ctx)h+=`<h3>上下文</h3><p>${fmt(g.ctx)}</p>`;
 if(g.o)h+=`<h3>架構</h3><ol class="outline">${g.o.map(([t,r])=>`<li data-jump="${parseRange(r)[0]}"><span>${esc(t)}</span><em>${r}</em></li>`).join("")}</ol>`;
 if(g.x)h+=`<h3>逐段釋經</h3>`+g.x.map(x=>`<div class="x"><h4 data-jump="${parseRange(x.r)[0]}"><em>${x.r} 節</em>${esc(x.h)}</h4>${(x.p||[]).map(p=>/^白話講[：:]/.test(p)?`<p class="plain"><b>白話講</b>　${fmt(p.replace(/^白話講[：:]/,""))}</p>`:`<p>${fmt(p)}</p>`).join("")}${x.l?`<ul>${x.l.map(i=>`<li>${fmt(i)}</li>`).join("")}</ul>`:""}</div>`).join("");
 if(g.q)h+=`<h3>默想</h3><ul>${g.q.map(i=>`<li>${fmt(i)}</li>`).join("")}</ul>`;
 return h;
}
function verseHTML(){
 const b=pref.b,c=pref.c;
 if(!sel){
  const list=curText.filter(([n])=>{const v=getV(b,c,n);return v.h||v.n});
  return list.length?`<div class="label">本章劃線與筆記</div>`+list.map(([n,zh])=>{const v=getV(b,c,n);return `<div class="nitem" data-pick="${n}"><div class="r">${c}:${n}</div><div><div class="t"><span class="${v.h?"zh":""}" style="${v.h?`background:linear-gradient(transparent 52%,var(--h${v.h}) 52%)`:""}">${esc(zh)}</span></div>${v.n?`<div class="note">${esc(v.n)}</div>`:""}</div></div>`}).join(""):`<p class="empty">點一節經文開始劃線。</p>`;
 }
 const v=getV(b,c,sel),t=(curText.find(x=>x[0]==sel)||[])[1]||"";
 return `<div class="vref">${BOOKS[b][0]} ${c}:${sel}</div><div class="vtext">${esc(t)}</div>
  <div class="colors">${COLORS.map(k=>`<button class="c-${k} ${v.h==k?"on":""}" data-hl="${k}" aria-label="劃線"></button>`).join("")}<button class="c-x" data-hl="">清除</button></div>
  <div class="field"><div class="label">筆記</div><textarea id="note" placeholder="寫下領受或疑問">${esc(v.n||"")}</textarea></div>
  <div class="field"><div class="label">問 AI</div>${askHTML("v")}</div>`;
}
function askHTML(scope){return `<div class="ask"><input id="q-${scope}" placeholder="${scope=="v"?"這節的背景是什麼？":"這章的主旨是什麼？"}"><button class="btn" data-ask="${scope}">問</button></div><div class="answer" id="a-${scope}" hidden></div>`}
function renderSide(){
 if(!wide())return;
 const t=pref.stab;
 $("#side").innerHTML=`<div class="stabs">${[["guide","導讀"],["note","劃線筆記"],["ai","問 AI"]].map(([k,n])=>`<button data-stab="${k}" aria-selected="${t==k}">${n}</button>`).join("")}</div>
 <div class="spane">${t=="guide"?`<div class="guide">${guideHTML()}</div>`:t=="note"?verseHTML():`<div class="label">${BOOKS[pref.b][0]} ${pref.c}${sel?":"+sel:""}</div>${askHTML("c")}`}</div>`;
}
function pickVerse(n){
 sel=sel==n?null:n;
 document.querySelectorAll(".v.sel").forEach(e=>e.classList.remove("sel"));
 if(sel)document.getElementById("v"+sel)?.classList.add("sel");
 if(wide()){pref.stab="note";savePref();renderSide()}
 else if(sel)openSheet(verseHTML());else closeSheet();
}
function refreshVerse(n){const el=document.getElementById("v"+n);if(!el)return;const v=getV(pref.b,pref.c,n);
 el.className=`v ${v.h?"h-"+v.h:""} ${sel==n?"sel":""}`;const dot=el.querySelector(".dot");if(v.n&&!dot)el.querySelector(".zh").insertAdjacentHTML("afterend",'<span class="dot"></span>');if(!v.n&&dot)dot.remove()}

/* ---------- sheet ---------- */
function openSheet(html){$("#sheetbg").hidden=false;const s=$("#sheet");s.hidden=false;s.innerHTML=`<div class="grab"></div>`+html}
function closeSheet(){$("#sheetbg").hidden=true;$("#sheet").hidden=true}
function bookPicker(){
 let h="";GROUPS.forEach(([g,a,z])=>{h+=`<div class="label" style="margin-top:14px">${g}</div>`;for(let i=a;i<z;i++)h+=`<div style="display:grid;grid-template-columns:96px 1fr;gap:8px;align-items:start;border-bottom:1px solid var(--line);padding:6px 0"><b style="padding-top:2px;font-size:14px">${BOOKS[i][0]}</b><div class="chips" style="margin:0">${Array.from({length:BOOKS[i][2]},(_,k)=>`<button data-go="${i}.${k+1}" class="${pref.b==i&&pref.c==k+1?"on":""}">${k+1}</button>`).join("")}</div></div>`});
 openSheet(h);
}

/* ---------- AI ---------- */
async function ask(scope){
 const q=$("#q-"+scope).value.trim(),out=$("#a-"+scope);
 const b=pref.b,c=pref.c,n=sel;
 const vt=n?(curText.find(x=>x[0]==n)||[])[1]:"";
 const ctx=n?`經文：${BOOKS[b][0]} ${c}:${n}「${vt}」`:`經文：${BOOKS[b][0]} 第 ${c} 章\n`+curText.map(v=>v[0]+" "+v[1]).join("\n");
 const prompt=`${ctx}\n\n問題：${q||(n?"請解釋這節的意思、上下文與背景。":"請說明這章的主旨、架構與重點。")}`;
 const key=ls.get("br.ai","");
 if(!key){window.open("https://claude.ai/new?q="+encodeURIComponent(prompt),"_blank");return}
 out.hidden=false;out.textContent="…";
 try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-beta":"server-side-fallback-2026-07-01","anthropic-dangerous-direct-browser-access":"true"},
  body:JSON.stringify({model:"claude-sonnet-5-5",max_tokens:4000,output_config:{effort:"low"},fallbacks:"default",system:"你是熟悉新約聖經、原文與歷史背景的查經同伴。用繁體中文回答，先講結論，再用簡短段落說明；必要時加一段「白話講」。不要說教。",messages:[{role:"user",content:prompt}]})});
  const j=await r.json();
  if(j.stop_reason==="refusal"){out.textContent="這個問題沒有得到回答，換個問法試試。";return}
  out.textContent=j.content?j.content.filter(x=>x.type==="text").map(x=>x.text).join(""):"錯誤："+(j.error?.message||r.status)}catch(e){out.textContent="連線失敗："+e.message}
}

/* ---------- plan ---------- */
function renderPlan(){
 const td=dayIndex(),done=PLAN.filter((_,d)=>dayDone(d)).length;
 $("main").innerHTML=`<div class="page"><h1>新約 90 天<small>${done} / ${DAYS}</small></h1>
 <div class="progress"><i style="width:${done/DAYS*100}%"></i></div>
 <div class="row" style="margin-bottom:18px"><span class="label" style="margin:0">開始日期</span><input type="date" id="start" value="${store.plan.start.v}"></div>
 <div class="days">${PLAN.map((p,d)=>`<div class="day ${d==td?"today":""} ${dayDone(d)?"done":""}" id="day${d}"><span class="no">${String(d+1).padStart(2,"0")}</span><span class="rd" data-go="${p[0][0]}.${p[0][1]}">${dayLabel(d)}<span class="dt">${dayDate(d)}</span></span><button class="chk ${dayDone(d)?"on":""}" data-day="${d}">${dayDone(d)?I.ok:""}</button></div>`).join("")}</div></div>`;
 document.getElementById("day"+td)?.scrollIntoView({block:"center"});
}

/* ---------- notes ---------- */
let nfilter="all";
async function renderNotes(){
 const items=Object.entries(store.v).filter(([,v])=>(v.h||v.n)&&(nfilter=="all"||(nfilter=="n"?v.n:v.h))).map(([k,v])=>[k.split(".").map(Number),v]).sort((a,b)=>a[0][0]-b[0][0]||a[0][1]-b[0][1]||a[0][2]-b[0][2]);
 const books=[...new Set(items.map(x=>x[0][0]))];const texts=await Promise.all(books.map(getBook));const T={};books.forEach((b,i)=>T[b]=texts[i]);
 let h=`<div class="page"><h1>筆記<small>${items.length}</small></h1><div class="filters">${[["all","全部"],["n","筆記"],["h","劃線"]].map(([k,t])=>`<button data-nf="${k}" class="${nfilter==k?"on":""}">${t}</button>`).join("")}</div><div class="nlist">`;
 let last=-1;
 for(const [[b,c,n],v] of items){if(b!=last){h+=`<div class="nb">${BOOKS[b][0]}</div>`;last=b}
  const zh=((T[b][c-1]||[]).find(x=>x[0]==n)||[])[1]||"";
  h+=`<div class="nitem" data-goto="${b}.${c}.${n}"><div class="r">${c}:${n}</div><div><div class="t"><span style="${v.h?`background:linear-gradient(transparent 52%,var(--h${v.h}) 52%)`:""}">${esc(zh)}</span></div>${v.n?`<div class="note">${esc(v.n)}</div>`:""}</div></div>`}
 if(!items.length)h+=`<p class="empty">還沒有劃線或筆記。</p>`;
 $("main").innerHTML=h+"</div></div>";
}

/* ---------- people ---------- */
let person=0,pbook=null,customP=null;const countCache={};
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const curP=()=>person<0?customP:PEOPLE[person];
const pRe=(p,f)=>new RegExp(p.a.map(reEsc).join("|"),f);
async function countFor(p){
 const k=p.n+"|"+p.a.join(",");if(countCache[k])return countCache[k];
 const all=await Promise.all(BOOKS.map((_,i)=>getBook(i)));const re=pRe(p,"g");
 return countCache[k]=all.map((bk,i)=>p.only&&!p.only.includes(i)?bk.map(()=>0):bk.map(ch=>ch.reduce((s,v)=>s+((v[1].match(re)||[]).length),0)));
}
function searchPerson(q){
 q=q.trim();if(!q)return;
 const i=PEOPLE.findIndex(x=>x.n===q||x.a.includes(q));
 if(i>=0){person=i}else{person=-1;customP={n:q,a:[q],d:"",r:[]}}
 pbook=null;renderPeople();
}
async function renderPeople(){
 const p=curP();
 let groups="",lg="";PEOPLE.forEach((x,i)=>{if(x.g!=lg){groups+=`<div class="pg">${x.g}</div>`;lg=x.g}groups+=`<button data-person="${i}" class="${i==person?"on":""}">${x.n}</button>`});
 $("main").innerHTML=`<div class="page"><div class="psearch"><input id="psearch" type="search" placeholder="搜尋人名或詞語" value="${person<0?esc(p.n):""}" autocomplete="off"></div><div class="people"><div class="plist">${groups}</div><div id="pd"></div></div></div>`;
 document.querySelector(".plist .on")?.scrollIntoView({block:"nearest",inline:"center"});
 const C=await countFor(p);
 const tot=C.map(b=>b.reduce((s,x)=>s+x,0)),max=Math.max(...tot,1),nb=tot.filter(x=>x).length,sum=tot.reduce((s,x)=>s+x,0);
 const shade=n=>`background:color-mix(in srgb,var(--accent) ${Math.round(14+60*Math.sqrt(n/max))}%,transparent)`;
 let h=`<div class="pname">${p.n}</div>${p.d?`<p class="pbio">${esc(p.d)}</p>`:""}<div class="pstat">${nb} 卷書｜${sum} 次</div><div class="map">`;
 GROUPS.forEach(([g,a,z])=>{h+=`<div class="mg"><span>${g}</span><div class="cells">`;for(let i=a;i<z;i++)h+=`<button class="cell ${tot[i]?"hit":""} ${pbook==i?"cur":""}" ${tot[i]?`data-pb="${i}" style="${shade(tot[i])}"`:""}>${BOOKS[i][1]}${tot[i]?`<small>${tot[i]}</small>`:""}</button>`;h+=`</div></div>`});
 h+="</div>";
 if(pbook!=null&&tot[pbook]){
  const bk=await getBook(pbook),re=pRe(p,"");
  h+=`<div class="sub">${BOOKS[pbook][0]}</div><div class="chap-hits" style="margin-top:0;border-top:0;padding-top:0">`+C[pbook].map((n,ci)=>{if(!n)return"";const v=bk[ci].find(x=>re.test(x[1]));return `<div class="ch" data-pgo="${pbook}.${ci+1}.${v[0]}"><b>${ci+1}:${v[0]}</b><span>${esc(v[1].length>46?v[1].slice(0,46)+"…":v[1])}</span></div>`}).join("")+"</div>";
 }
 if(p.r&&p.r.length)h+=`<div class="sub">關係</div>`+p.r.map(([n,t])=>{const j=PEOPLE.findIndex(x=>x.n==n);return `<div class="rel"><b class="${j>=0?"lnk":""}" ${j>=0?`data-person="${j}"`:""}>${n}</b><span>${esc(t)}</span></div>`}).join("");
 $("#pd").innerHTML=h;
}

/* ---------- settings ---------- */
function renderSettings(){
 const tok=ls.get("br.gh",""),last=ls.get("br.synced",0);
 $("main").innerHTML=`<div class="page set"><h1>設定</h1>
 <div class="grp"><h3>外觀</h3><div class="seg">${[["auto","跟隨系統"],["light","淺色"],["dark","深色"]].map(([k,t])=>`<button data-theme="${k}" class="${pref.theme==k?"on":""}">${t}</button>`).join("")}</div></div>
 <div class="grp"><h3>字級</h3><div class="seg">${[[17,"小"],[19,"中"],[21,"大"],[23,"特大"]].map(([k,t])=>`<button data-fs="${k}" class="${pref.fs==k?"on":""}">${t}</button>`).join("")}</div></div>
 <div class="grp"><h3>英文對照</h3><div class="seg"><button data-en="0" class="${pref.en?"":"on"}">關</button><button data-en="1" class="${pref.en?"on":""}">WEB</button></div></div>
 <div class="grp"><h3>雲端同步</h3><p class="hint" style="margin-bottom:8px">GitHub Personal Access Token（只勾 gist 權限）。每台裝置填一次，劃線、筆記、進度會存在你的私人 Gist。</p>
  <div class="ask"><input id="gh" type="password" value="${esc(tok)}" placeholder="ghp_…" autocomplete="off"><button class="btn" data-act="sync">同步</button></div>
  <div class="status" id="syncst">${last?"上次同步："+new Date(last).toLocaleString("zh-TW"):""}</div>
  <p class="hint" style="margin-top:6px"><a href="https://github.com/settings/tokens/new?scopes=gist&description=%E6%96%B0%E7%B4%84%E8%AE%80%E7%B6%93%E6%9C%AC" target="_blank" rel="noopener" style="color:inherit">產生 token</a></p></div>
 <div class="grp"><h3>AI</h3><p class="hint" style="margin-bottom:8px">填 Anthropic API Key 會直接在頁面回答；不填則開啟 claude.ai 並帶入問題。</p>
  <input id="ak" type="password" value="${esc(ls.get("br.ai",""))}" placeholder="sk-ant-…" autocomplete="off"></div>
 <div class="grp"><h3>資料</h3><div class="row"><button class="btn ghost" data-act="export">匯出</button><label class="btn ghost" style="cursor:pointer">匯入<input type="file" id="imp" accept=".json" hidden></label></div></div>
 </div>`;
}

/* ---------- sync (GitHub Gist) ---------- */
const FILE="bible-reader.json";
function mergeMap(a={},b={}){const o={...a};for(const k in b)if(!o[k]||(b[k].t||0)>(o[k].t||0))o[k]=b[k];return o}
function merge(a,b){return{v:mergeMap(a.v,b.v),read:mergeMap(a.read,b.read),plan:{start:(b.plan?.start?.t||0)>(a.plan?.start?.t||0)?b.plan.start:a.plan.start,done:{}}}}
let syncing=false;
async function sync(manual){
 const tok=ls.get("br.gh","");const st=$("#syncst");
 if(!tok||syncing||!navigator.onLine)return;syncing=true;if(st)st.textContent="同步中…";
 const H={Authorization:"Bearer "+tok,Accept:"application/vnd.github+json"};
 try{
  let id=ls.get("br.gist","");
  if(!id){const r=await fetch("https://api.github.com/gists?per_page=100",{headers:H});if(!r.ok)throw new Error(r.status==401?"Token 無效":"GitHub "+r.status);
   const g=(await r.json()).find(x=>x.files&&x.files[FILE]);id=g?g.id:"";}
  let remote=null;
  if(id){const r=await fetch("https://api.github.com/gists/"+id,{headers:H,cache:"no-store"});
   if(r.ok){const f=(await r.json()).files[FILE];if(f){const txt=f.truncated?await (await fetch(f.raw_url)).text():f.content;try{remote=JSON.parse(txt)}catch(e){}}}else id="";}
  const merged=remote?merge(store,remote):store;
  const body=JSON.stringify({files:{[FILE]:{content:JSON.stringify(merged)}}});
  const r=id?await fetch("https://api.github.com/gists/"+id,{method:"PATCH",headers:H,body}):await fetch("https://api.github.com/gists",{method:"POST",headers:H,body:JSON.stringify({description:"新約讀經本",public:false,files:{[FILE]:{content:JSON.stringify(merged)}}})});
  if(!r.ok)throw new Error("GitHub "+r.status);
  if(!id)id=(await r.json()).id;ls.set("br.gist",id);
  const changed=JSON.stringify(merged)!==JSON.stringify(store);
  store=merged;ls.set("br.store",store);ls.set("br.synced",now());
  const s2=$("#syncst");if(s2)s2.textContent="已同步　"+new Date().toLocaleString("zh-TW");
  if(changed&&pref.view!=="settings"&&!document.activeElement?.matches("textarea"))render();
 }catch(e){const s2=$("#syncst");if(s2)s2.textContent="同步失敗："+e.message}
 syncing=false;
}

/* ---------- events ---------- */
document.addEventListener("click",e=>{
 const t=e.target.closest("button,[data-go],[data-goto],[data-pgo],[data-jump],[data-pick],.v,#sheetbg,[data-person]");if(!t)return;
 const d=t.dataset;
 if(t.id==="sheetbg"){closeSheet();if(sel){sel=null;document.querySelectorAll(".v.sel").forEach(x=>x.classList.remove("sel"))}return}
 if(d.v)return go(d.v);
 if(d.go){const [b,c]=d.go.split(".").map(Number);return openChapter(b,c)}
 if(d.goto){const [b,c,n]=d.goto.split(".").map(Number);return openChapter(b,c,{verse:n})}
 if(d.pgo){const [b,c,n]=d.pgo.split(".").map(Number);return openChapter(b,c,{verse:n,mark:pRe(curP(),"g")})}
 if(d.book!=null){pref.b=+d.book;pref.c=1;savePref();return openChapter(+d.book,1)}
 if(t.classList.contains("v"))return pickVerse(+d.n);
 if(d.jump){if(!wide()){mseg="text";renderRead().then(()=>{const el=document.getElementById("v"+d.jump);el?.scrollIntoView({block:"start"});el?.classList.add("flash")})}else{const el=document.getElementById("v"+d.jump);el?.scrollIntoView({block:"start",behavior:"smooth"});el?.classList.add("flash");setTimeout(()=>el?.classList.remove("flash"),1700)}return}
 if(d.pick){pickVerse(+d.pick);document.getElementById("v"+d.pick)?.scrollIntoView({block:"center",behavior:"smooth"});return}
 if(d.stab){pref.stab=d.stab;savePref();return renderSide()}
 if(d.seg){mseg=d.seg;return renderRead()}
 if(d.hl!=null&&sel){const cur=getV(pref.b,pref.c,sel).h;setV(pref.b,pref.c,sel,{h:d.hl&&d.hl!==cur?d.hl:""});refreshVerse(sel);document.querySelectorAll("[data-hl]").forEach(x=>x.classList.toggle("on",x.dataset.hl&&x.dataset.hl==getV(pref.b,pref.c,sel).h));return}
 if(d.ask)return ask(d.ask);
 if(d.day!=null){const dd=+d.day,v=!dayDone(dd);PLAN[dd].forEach(([b,c])=>setRead(b,c,v));renderPlan();renderRail();return}
 if(d.nf){nfilter=d.nf;return renderNotes()}
 if(d.person!=null){person=+d.person;pbook=null;return renderPeople()}
 if(d.pb!=null){pbook=pbook==+d.pb?null:+d.pb;return renderPeople()}
 if(d.theme){pref.theme=d.theme;savePref();applyPrefs();return renderSettings()}
 if(d.fs){pref.fs=+d.fs;savePref();applyPrefs();return renderSettings()}
 if(d.en!=null){pref.en=d.en=="1";savePref();return renderSettings()}
 const a=d.act;
 if(a=="en"){pref.en=!pref.en;savePref();return renderRead()}
 if(a=="prev"||a=="next"){const i=ALL.findIndex(([x,y])=>x==pref.b&&y==pref.c);if(a=="next")setRead(pref.b,pref.c,true);const n=ALL[i+(a=="next"?1:-1)];if(n)openChapter(n[0],n[1]);else renderRead();return}
 if(a=="pick")return bookPicker();
 if(a=="sync"){ls.set("br.gh",$("#gh").value.trim());return sync(true)}
 if(a=="export"){const u=URL.createObjectURL(new Blob([JSON.stringify(store)],{type:"application/json"}));const x=document.createElement("a");x.href=u;x.download=`bible-reader-${todayStr()}.json`;x.click();return}
});
document.addEventListener("input",e=>{
 if(e.target.id==="note"&&sel){setV(pref.b,pref.c,sel,{n:e.target.value});refreshVerse(sel)}
 if(e.target.id==="ak")ls.set("br.ai",e.target.value.trim());
 if(e.target.id==="gh")ls.set("br.gh",e.target.value.trim());
});
document.addEventListener("change",async e=>{
 if(e.target.id==="start"&&e.target.value){store.plan.start={v:e.target.value,t:now()};saveStore();renderPlan();renderRail()}
 if(e.target.id==="imp"){const f=e.target.files[0];if(!f)return;try{store=merge(store,JSON.parse(await f.text()));ls.set("br.store",store);saveStore();e.target.value="";alert("已匯入")}catch(x){alert("檔案格式不正確")}}
});
document.addEventListener("keydown",e=>{
 if(e.target.matches("input,textarea"))return;
 if(e.key==="Enter"&&e.target.id?.startsWith("q-"))return;
 if(pref.view==="read"&&(e.key==="ArrowRight"||e.key==="ArrowLeft"))document.querySelector(`.chead [data-act="${e.key==="ArrowRight"?"next":"prev"}"]`)?.click();
 if(e.key==="Escape"){closeSheet()}
});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id?.startsWith("q-"))ask(e.target.id.slice(2));if(e.key==="Enter"&&e.target.id==="psearch")searchPerson(e.target.value)});
document.addEventListener("search",e=>{if(e.target.id==="psearch")searchPerson(e.target.value)},true);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")sync()});
let lastWide=wide();addEventListener("resize",()=>{if(wide()!==lastWide){lastWide=wide();applyPrefs();render()}});

applyPrefs();render();sync();
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js");
