"use strict";
const RELAY="https://bible-reader-ai.ju4t4r1.workers.dev";
/* ---------- data ---------- */
const BOOKS=[["馬太福音","太",28],["馬可福音","可",16],["路加福音","路",24],["約翰福音","約",21],["使徒行傳","徒",28],["羅馬書","羅",16],["哥林多前書","林前",16],["哥林多後書","林後",13],["加拉太書","加",6],["以弗所書","弗",6],["腓立比書","腓",4],["歌羅西書","西",4],["帖撒羅尼迦前書","帖前",5],["帖撒羅尼迦後書","帖後",3],["提摩太前書","提前",6],["提摩太後書","提後",4],["提多書","多",3],["腓利門書","門",1],["希伯來書","來",13],["雅各書","雅",5],["彼得前書","彼前",5],["彼得後書","彼後",3],["約翰一書","約壹",5],["約翰二書","約貳",1],["約翰三書","約參",1],["猶大書","猶",1],["啟示錄","啟",22],["創世記","創",50],["出埃及記","出",40],["利未記","利",27],["民數記","民",36],["申命記","申",34],["約書亞記","書",24],["士師記","士",21],["路得記","得",4],["撒母耳記上","撒上",31],["撒母耳記下","撒下",24],["列王紀上","王上",22],["列王紀下","王下",25],["歷代志上","代上",29],["歷代志下","代下",36],["以斯拉記","拉",10],["尼希米記","尼",13],["以斯帖記","斯",10],["約伯記","伯",42],["詩篇","詩",150],["箴言","箴",31],["傳道書","傳",12],["雅歌","歌",8],["以賽亞書","賽",66],["耶利米書","耶",52],["耶利米哀歌","哀",5],["以西結書","結",48],["但以理書","但",12],["何西阿書","何",14],["約珥書","珥",3],["阿摩司書","摩",9],["俄巴底亞書","俄",1],["約拿書","拿",4],["彌迦書","彌",7],["那鴻書","鴻",3],["哈巴谷書","哈",3],["西番雅書","番",3],["哈該書","該",2],["撒迦利亞書","亞",14],["瑪拉基書","瑪",4]];
const GROUPS=[["律法書",[27,28,29,30,31]],["歷史書",[32,33,34,35,36,37,38,39,40,41,42,43]],["詩歌智慧書",[44,45,46,47,48]],["大先知書",[49,50,51,52,53]],["小先知書",[54,55,56,57,58,59,60,61,62,63,64,65]],["福音書",[0,1,2,3]],["使徒行傳",[4]],["保羅書信",[5,6,7,8,9,10,11,12,13,14,15,16,17]],["普通書信",[18,19,20,21,22,23,24,25]],["啟示錄",[26]]];
const ORDER=GROUPS.flatMap(g=>g[1]);
const COLORS=["y","g","b","p"];
const ALL=[];ORDER.forEach(i=>{for(let c=1;c<=BOOKS[i][2];c++)ALL.push([i,c])});
const rng=(a,z)=>Array.from({length:z-a+1},(_,i)=>a+i);
const PLANS=[
 {id:"nt90",n:"90 天讀完新約全書",d:90,b:rng(0,26)},
 {id:"nt30",n:"30 天讀一遍新約",d:30,b:rng(0,26)},
 {id:"nt40",n:"40 天讀完新約",d:40,b:rng(0,26)},
 {id:"nt260",n:"新約一天一章",d:260,b:rng(0,26)},
 {id:"gos30",n:"30 天四福音",d:30,b:rng(0,3)},
 {id:"lkac",n:"路加福音與使徒行傳",d:52,b:[2,4]},
 {id:"epi85",n:"新約書信和使徒行傳",d:85,b:rng(4,25)},
 {id:"thes",n:"帖撒羅尼迦前書和後書",d:4,b:[12,13]},
 {id:"tim",n:"提摩太前書和後書",d:5,b:[14,15]},
 {id:"pet",n:"彼得前書和彼得後書",d:4,b:[20,21]},
];
let PLAN,DAYS,curPlan;
const NONE={id:"none",n:"無計劃",d:0,b:[]};const noPlan=()=>curPlan.id==="none";
function setupPlan(){curPlan=(store.plan.id||{}).v==="none"?NONE:(PLANS.find(p=>p.id===(store.plan.id||{}).v)||PLANS[0]);const ch=ALL.filter(([b])=>curPlan.b.includes(b));DAYS=curPlan.d;
 PLAN=Array.from({length:DAYS},(_,d)=>ch.slice(Math.round(d*ch.length/DAYS),Math.round((d+1)*ch.length/DAYS)))}

/* ---------- storage ---------- */
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const todayStr=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
let store=ls.get("br.store",null)||{v:{},read:{},plan:{start:{v:todayStr(),t:0},done:{}}};
store.v=store.v||{};store.read=store.read||{};store.ai=store.ai||{};store.plan=store.plan||{start:{v:todayStr(),t:0},done:{}};
store.daily=store.daily||{};if(!store.plan.id)store.plan.id={v:Object.keys(store.read).length?"nt90":"none",t:0};
setupPlan();
let pref=ls.get("br.pref",{b:5,c:1,en:false,theme:"auto",fs:19,view:"read",stab:"guide"});
const savePref=()=>ls.set("br.pref",pref);
let syncTimer=null;
function saveStore(){ls.set("br.store",store);clearTimeout(syncTimer);syncTimer=setTimeout(sync,3000)}
const now=()=>Date.now();
const vkey=(b,c,n)=>`${b}.${c}.${n}`;
const getV=(b,c,n)=>store.v[vkey(b,c,n)]||{};
function setV(b,c,n,patch){const k=vkey(b,c,n);store.v[k]={...(store.v[k]||{}),...patch,t:now()};saveStore()}
const isRead=(b,c)=>!!(store.read[`${b}.${c}`]||{}).d;
function setRead(b,c,d){store.read[`${b}.${c}`]={d:d?1:0,t:now()};saveStore();pushStatus()}

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
const VIEWS=[["read","讀經",I.read],["plan","計畫",I.plan],["notes","筆記",I.notes],["co","共讀",I.people],["settings","設定",I.set]];
function parseRange(r){const [a,b]=String(r).split(/[-–]/).map(Number);return [a,b||a]}
function dayIndex(){if(noPlan())return 0;const s=new Date(store.plan.start.v+"T00:00:00");const d=Math.floor((new Date(todayStr()+"T00:00:00")-s)/864e5);return Math.max(0,Math.min(DAYS-1,d))}
const dayDone=d=>!!PLAN[d]&&PLAN[d].every(([b,c])=>isRead(b,c));
const dailyDone=ds=>!!(store.daily[ds]||{}).d;
const todayDone=()=>noPlan()?dailyDone(todayStr()):dayDone(dayIndex());
const dstr=x=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
const chRef=([b,c])=>`${BOOKS[b][0]} ${c}`;
function todayChip(){if(noPlan())return"";const d=dayIndex(),ok=dayDone(d),f=PLAN[d].find(([b,c])=>!isRead(b,c))||PLAN[d][0];
 return `<button class="today ${ok?"ok":"todo"}" data-go="${f[0]}.${f[1]}"><span>Today:</span> ${dayLabel(d)}</button>`}
function streak(){if(noPlan()){const x=new Date();if(!dailyDone(dstr(x)))x.setDate(x.getDate()-1);let n=0;while(dailyDone(dstr(x))){n++;x.setDate(x.getDate()-1)}return n}let k=dayIndex();if(!dayDone(k))k--;let n=0;while(k>=0&&dayDone(k)){n++;k--}return n}
function streakChip(){const n=streak();return `<span class="streak ${n?"on":""}">連續完成 ${n} 天</span>`}
function dayLabel(d){const g=[];PLAN[d].forEach(([b,c])=>{const x=g[g.length-1];if(x&&x.b==b)x.z=c;else g.push({b,a:c,z:c})});return g.map(x=>`${BOOKS[x.b][0]} ${x.a}${x.z!=x.a?"–"+x.z:""}`).join("、")}
function dayDate(d){const s=new Date(store.plan.start.v+"T00:00:00");s.setDate(s.getDate()+d);return `${s.getMonth()+1}/${s.getDate()}（${"日一二三四五六"[s.getDay()]}）`}

/* ---------- theme ---------- */
function applyPrefs(){
 if(pref.theme==="auto")document.documentElement.removeAttribute("data-theme");else document.documentElement.dataset.theme=pref.theme;
 const z=pref.ui||1;document.documentElement.style.zoom=z;document.documentElement.style.setProperty("--fs",((mobile()?pref.fs-1:pref.fs)/z).toFixed(2)+"px");
}

/* ---------- shell ---------- */
let sel=null,markRe=null,mseg="text",curText=null,curGuide=null;
function shell(){
 $("#nav").innerHTML=VIEWS.map(([k,t])=>`<button data-v="${k}" ${pref.view==k?'aria-current="page"':""}>${t}</button>`).join("");
 const tb=$("#tabbar");if(!tb.firstChild)tb.innerHTML=`<i class="pill"></i>`+VIEWS.map(([k,t,ic])=>`<button data-v="${k}">${ic}<span>${t}</span></button>`).join("");
 const vi=VIEWS.findIndex(v=>v[0]==pref.view);tb.style.setProperty("--i",vi);tb.querySelectorAll("button").forEach((x,i)=>i==vi?x.setAttribute("aria-current","page"):x.removeAttribute("aria-current"));
 renderRail();
}
function renderRail(){
 const d=dayIndex();
 if(noPlan())$("#today").innerHTML=`<div class="label">今天</div><button class="toggle ${todayDone()?"on":""}" data-dd="${todayStr()}">${todayDone()?"已完成 ✓":"標記今天完成"}</button>`;else
 $("#today").innerHTML=`<div class="label">第 ${d+1} 天｜共 ${DAYS} 天</div><div class="today-list">${PLAN[d].map(([b,c])=>`<a data-go="${b}.${c}" class="${isRead(b,c)?"read":""}">${BOOKS[b][0]} ${c}</a>`).join("")}</div>`;
 let h="";
 GROUPS.forEach(([g,ids],gi)=>{if(gi==0||gi==5)h+=`<div class="testament">${gi?"新約":"舊約"}</div>`;h+=`<div class="grp">${g}</div>`;for(const i of ids){h+=`<button data-book="${i}" class="${pref.b==i?"on":""}">${BOOKS[i][0]}</button>`;
  if(pref.b==i&&pref.view=="read")h+=`<div class="chips">${Array.from({length:BOOKS[i][2]},(_,k)=>`<button data-go="${i}.${k+1}" class="${pref.c==k+1?"on":""}" title="${isRead(i,k+1)?"已讀":""}">${k+1}</button>`).join("")}</div>`}});
 $("#books").innerHTML=h;
 const on=$("#books .chips .on");if(on&&!renderRail.did){on.scrollIntoView({block:"center"});renderRail.did=1}
}
function go(view){pref.view=view;savePref();sel=null;closeSheet();window.scrollTo(0,0);$("main").scrollTop=0;render()}
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
 if(pref.view==="co")renderCo();
 if(pref.view==="settings")renderSettings();
}

/* ---------- reader ---------- */
async function renderRead(){
 const b=pref.b,c=pref.c;
 $("#mpick").innerHTML=`${BOOKS[b][0]} ${c}${I.d}`;
 const [book,guide]=await Promise.all([getBook(b),getGuide(b)]);
 curText=book[c-1];curGuide=guide[c-1]||null;
 const secs={};if(curGuide&&curGuide.o)curGuide.o.forEach(([t,r])=>{secs[parseRange(r)[0]]=t});
 const verses=curText.map(([n,zh,en])=>{const v=getV(b,c,n);let z=zhHTML(zh,v);
  return `${secs[n]?`<div class="sec">${esc(secs[n])}</div>`:""}<div class="v ${v.h?"h-"+v.h:""} ${sel==n?"sel":""}" id="v${n}" data-n="${n}"><span class="n">${n}</span><span class="zh">${z}</span>${v.n?'<span class="dot"></span>':""}${pref.en&&en?`<span class="en">${esc(en)}</span>`:""}</div>`}).join("");
 const prev=ALL.findIndex(([x,y])=>x==b&&y==c);
 const P=ALL[prev-1],N=ALL[prev+1];
 $("main").innerHTML=`<div class="reader">
  <div class="rhead"><div class="chead"><h1>${BOOKS[b][0]} ${c}</h1>${streakChip()}<span class="sp"></span>
   <button class="toggle ${pref.en?"on":""}" data-act="en">EN</button>
   <button class="iconbtn" data-act="prev" ${P?"":"disabled"}>${I.l}</button><button class="iconbtn" data-act="next" ${N?"":"disabled"}>${I.r}</button></div>
  <div class="mseg"><button class="${mseg=="text"?"on":""}" data-seg="text">經文</button><button class="${mseg=="guide"?"on":""}" data-seg="guide">導讀</button><button class="${mseg=="ai"?"on":""}" data-seg="ai">AI</button><span class="sp"></span>${streakChip()}</div></div>
  ${mseg=="guide"&&!wide()?`<div class="guide">${guideHTML()}</div>`:mseg=="ai"&&!wide()?`<div class="aitab"><div class="label">${BOOKS[b][0]} ${c}${sel?":"+sel:""}${sel?' <button class="linkbtn" data-aiall="1">改問整章</button>':""}</div>${askHTML(sel?"v":"c")}</div>`:`<div class="text">${verses}</div>`}
  <div class="pager"><button data-act="prev" ${P?"":"hidden"}>← ${P?chRef(P):""}</button>
   <button data-act="next" class="${N?"":"done"}">${isRead(b,c)?"":"讀完，"}${N?chRef(N)+" →":"完成"}</button></div>
 </div>`;
 renderSide();
}
const BP="https://ik.imagekit.io/bpweb1/web/media/posters/";
function bpRow(){const info=BOOKINFO[pref.b];if(!info)return"";const many=info.bp.length>1;
 return `<div class="bprow"><b>BibleProject</b>${info.bp.map(([a,z,y])=>`<a href="https://www.youtube.com/watch?v=${y}" target="_blank" rel="noopener" class="${pref.c>=a&&pref.c<=z?"cur":""}">${many?`影片 ${a}–${z} 章`:"書卷導覽影片"}</a>`).join("")}<a href="https://bibleproject.com/zh-hans/explore/book-overviews/" target="_blank" rel="noopener">網站</a></div>`}
function bookBg(){const i=BOOKINFO[pref.b];if(!i)return"";
 return `<details class="bookbg"><summary>${BOOKS[pref.b][0]}書卷背景</summary><dl><dt>作者</dt><dd>${esc(i.a)}</dd><dt>寫作時間</dt><dd>${esc(i.t)}</dd><dt>寫作地點</dt><dd>${esc(i.p)}</dd><dt>讀者</dt><dd>${esc(i.r)}</dd><dt>主題</dt><dd>${esc(i.th)}</dd></dl><p>${esc(i.bg)}</p></details>`}
function poster(){const i=BOOKINFO[pref.b];if(!i)return"";const p=(i.bp.find(([a,z])=>pref.c>=a&&pref.c<=z)||i.bp[0])[3];
 return `<h3>海報</h3><button class="poster" data-poster="${p}"><img src="${BP}tr:w-900/${p}" alt="${BOOKS[pref.b][0]} BibleProject 海報" loading="lazy"></button>`}
function guideHTML(){
 const g=curGuide;if(!g)return bpRow()+bookBg()+poster()+`<p class="empty">本章導讀尚未完成。</p>`;
 const vt=r=>{const [a,z]=parseRange(r);return curText.filter(v=>v[0]>=a&&v[0]<=z).map(v=>v[1]).join("")};
 let h=bpRow()+`<div class="lead">${String(g.s).split("\n").map(p=>`<p>${fmt(p)}</p>`).join("")}</div>`;
 if(g.ctx)h+=`<h3>上下文</h3><p>${fmt(g.ctx)}</p>`;
 h+=bookBg()+poster();
 if(g.o)h+=`<h3>架構</h3><ol class="outline">${g.o.map(([t,r])=>`<li data-jump="${parseRange(r)[0]}"><span>${esc(t)}</span><em>${r}</em></li>`).join("")}</ol>`;
 if(g.x)h+=`<h3>逐段釋經</h3>`+g.x.map(x=>`<div class="x"><h4 data-jump="${parseRange(x.r)[0]}"><em>${x.r} 節</em>${esc(x.h)}</h4>${(x.p||[]).filter(p=>!/^白話講[：:]/.test(p)).map(p=>`<p>${fmt(p)}</p>`).join("")}${x.qa?`<div class="qa">${x.qa.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${fmt(a)}</p></details>`).join("")}</div>`:""}${x.l?`<ul>${x.l.map(i=>`<li>${fmt(i)}</li>`).join("")}</ul>`:""}${x.w?`<div class="para"><div class="para-l">白話文</div>${String(x.w).split("\n").map(t=>{const m=t.match(/^(\d+)\s+/);return `<p>${m?`<sup>${m[1]}</sup>`:""}${fmt(m?t.slice(m[0].length):t)}</p>`}).join("")}</div>`:""}</div>`).join("");
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
  <button class="btn ghost" data-askverse="1">問 AI 這一節</button>`;
}
function askHTML(scope){return `<div class="ask"><input id="q-${scope}" placeholder="${scope=="v"?"這節的背景是什麼？":"這章的主旨是什麼？"}"><button class="btn" data-ask="${scope}">問</button></div><div class="answer" id="a-${scope}" hidden></div>${aiHistHTML()}`}
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
function zhHTML(zh,v){
 const r=(v&&v.r)||[];
 if(!r.length){let z=esc(zh);if(markRe)z=z.replace(markRe,"<mark>$&</mark>");return z}
 const col=Array(zh.length).fill("");r.forEach(([a,b,k])=>{for(let i=Math.max(0,a);i<Math.min(zh.length,b);i++)col[i]=k});
 let h="",i=0;while(i<zh.length){let j=i;while(j<zh.length&&col[j]===col[i])j++;const t=esc(zh.slice(i,j));h+=col[i]?`<span class="pr p-${col[i]}">${t}</span>`:t;i=j}return h}
let selInfo=null;
function readSel(){
 const s=getSelection();if(!s||s.isCollapsed||!s.rangeCount)return null;const r=s.getRangeAt(0);
 const zA=(r.startContainer.nodeType==1?r.startContainer:r.startContainer.parentElement).closest(".zh"),zB=(r.endContainer.nodeType==1?r.endContainer:r.endContainer.parentElement).closest(".zh");
 if(!zA||zA!==zB)return null;const pre=document.createRange();pre.selectNodeContents(zA);pre.setEnd(r.startContainer,r.startOffset);
 const a=pre.toString().length,b=a+r.toString().length;if(b<=a)return null;
 return{n:+zA.closest(".v").dataset.n,a,b,rect:r.getBoundingClientRect()}}
function showSelbar(){const info=readSel();const bar=$("#selbar");if(!info||pref.view!=="read"){bar.hidden=true;selInfo=null;return}
 selInfo=info;bar.hidden=false;const w=bar.offsetWidth||220;let x=info.rect.left+info.rect.width/2-w/2;x=Math.max(8,Math.min(innerWidth-w-8,x));
 let y=info.rect.top-52;if(y<60)y=info.rect.bottom+10;bar.style.left=x+"px";bar.style.top=y+"px"}
function applyPartial(k){if(!selInfo)return;const {n,a,b}=selInfo;const v=getV(pref.b,pref.c,n);
 let r=(v.r||[]).filter(([x,y])=>y<=a||x>=b);if(k)r.push([a,b,k]);setV(pref.b,pref.c,n,{r});
 getSelection().removeAllRanges();$("#selbar").hidden=true;selInfo=null;
 const el=document.getElementById("v"+n);if(el)el.querySelector(".zh").innerHTML=zhHTML((curText.find(x=>x[0]==n)||[])[1]||"",getV(pref.b,pref.c,n))}
function refreshVerse(n){const el=document.getElementById("v"+n);if(!el)return;const v=getV(pref.b,pref.c,n);
 el.className=`v ${v.h?"h-"+v.h:""} ${sel==n?"sel":""}`;const dot=el.querySelector(".dot");if(v.n&&!dot)el.querySelector(".zh").insertAdjacentHTML("afterend",'<span class="dot"></span>');if(!v.n&&dot)dot.remove()}

/* ---------- sheet ---------- */
function openSheet(html){$("#sheetbg").hidden=false;const s=$("#sheet");s.hidden=false;s.innerHTML=`<div class="grab"></div>`+html}
function closeSheet(){$("#sheetbg").hidden=true;$("#sheet").hidden=true}
function bookPicker(b){
 if(b==null){let h="";GROUPS.forEach(([g,ids],gi)=>{if(gi==0||gi==5)h+=`<div class="pk-t">${gi?"新約":"舊約"}</div>`;h+=`<div class="label" style="margin-top:12px">${g}</div><div class="pk-grid">${ids.map(i=>`<button class="pk-b ${pref.b==i?"on":""}" data-pkb="${i}"><b>${BOOKS[i][1]}</b><span>${BOOKS[i][0]}</span></button>`).join("")}</div>`});
  openSheet(h);const on=$("#sheet .pk-b.on");if(on)on.scrollIntoView({block:"center"});return}
 openSheet(`<div class="pk-h"><button class="linkbtn" data-pkback="1">← 書卷</button><b>${BOOKS[b][0]}</b></div><div class="pk-ch">${Array.from({length:BOOKS[b][2]},(_,k)=>`<button data-go="${b}.${k+1}" class="${pref.b==b&&pref.c==k+1?"on":""} ${isRead(b,k+1)?"rd":""}">${k+1}</button>`).join("")}</div>`);
}

/* ---------- AI ---------- */
const aiKey=()=>`${pref.b}.${pref.c}.${sel||0}`;
const SYS="你是熟悉新約聖經、原文與歷史背景的查經同伴。用繁體中文回答，先講結論，再用簡短段落說明；必要時附上一段白話文翻譯。不要說教。";
async function callAI(prompt){
 const key=ls.get("br.ai",""),code=ls.get("br.code","");
 if(code){const r=await fetch(RELAY+"/ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({code,prompt})});const j=await r.json();
  if(j.used!=null)ls.set("br.quota",{used:j.used,limit:j.limit});return j.error?{error:j.error}:{text:j.text}}
 const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-beta":"server-side-fallback-2026-07-01","anthropic-dangerous-direct-browser-access":"true"},
  body:JSON.stringify({model:"claude-sonnet-5-5",max_tokens:4000,output_config:{effort:"low"},fallbacks:"default",system:SYS,messages:[{role:"user",content:prompt}]})});
 const j=await r.json();
 if(j.stop_reason==="refusal")return{error:"這個問題沒有得到回答，換個問法試試。"};
 return j.content?{text:j.content.filter(x=>x.type==="text").map(x=>x.text).join("")}:{error:"錯誤："+(j.error?.message||r.status)};
}
async function ask(scope){
 const qi=$("#q-"+scope),out=$("#a-"+scope);
 const b=pref.b,c=pref.c,n=sel;
 const vt=n?(curText.find(x=>x[0]==n)||[])[1]:"";
 const q=qi.value.trim()||(n?"請解釋這節的意思、上下文與背景。":"請說明這章的主旨、架構與重點。");
 const ctx=n?`經文：${BOOKS[b][0]} ${c}:${n}「${vt}」`:`經文：${BOOKS[b][0]} 第 ${c} 章\n`+curText.map(v=>v[0]+" "+v[1]).join("\n");
 const prompt=`${ctx}\n\n問題：${q}`;
 if(!ls.get("br.ai","")&&!ls.get("br.code","")){window.open("https://claude.ai/new?q="+encodeURIComponent(prompt),"_blank");return}
 const k=aiKey();out.hidden=false;out.textContent="…";
 let res;try{res=await callAI(prompt)}catch(e){res={error:"連線失敗："+e.message}}
 if(res.error){out.textContent=res.error;return}
 store.ai["a"+now()]={k,q,a:res.text,t:now()};saveStore();
 out.hidden=true;qi.value="";
 document.querySelectorAll(".aihist").forEach(el=>el.outerHTML=aiHistHTML());
}
function aiHistHTML(){
 const k=aiKey();
 const list=Object.entries(store.ai).filter(([,v])=>v.k===k&&!v.del).sort((a,b)=>b[1].t-a[1].t);
 return `<div class="aihist">${list.map(([id,v])=>`<div class="aiitem"><div class="aiq">${esc(v.q)}<button class="aidel" data-aidel="${id}" aria-label="刪除">×</button></div><div class="aia">${esc(v.a)}</div><div class="aidt">${new Date(v.t).toLocaleDateString("zh-TW")}</div></div>`).join("")}</div>`;
}

/* ---------- plan ---------- */
function pinToday(){const tp=document.querySelector("main .todaypanel"),ph=document.querySelector("main .phead");if(tp&&ph)ph.appendChild(tp)}
function renderPlan(){
 const pick=`<select id="planpick" style="width:auto"><option value="none" ${noPlan()?"selected":""}>無計劃</option>${PLANS.map(p=>`<option value="${p.id}" ${p.id==curPlan.id?"selected":""}>${esc(p.n)}｜${p.d} 天</option>`).join("")}</select>`;
 if(noPlan()){const t=todayDone();const days=Array.from({length:30},(_,k)=>{const x=new Date();x.setDate(x.getDate()-k);return x});
  $("main").innerHTML=`<div class="page"><div class="phead"><h1>無計劃<small>${streakChip()}</small></h1><div class="pdates">${pick}</div></div>
  <div class="todaypanel ${t?"ok":"todo"}"><div class="tp-h"><b>Today:</b> ${t?"已完成":"還沒完成"}<span class="sp"></span><button class="btn ${t?"ghost":""}" data-dd="${todayStr()}">${t?"取消完成":"今天讀完了"}</button></div></div>
  <div class="days">${days.map((x,k)=>{const ds=dstr(x),ok=dailyDone(ds);return `<div class="day ${k==0?"today":""} ${ok?"done":""}"><span class="no">${x.getMonth()+1}/${x.getDate()}</span><span class="rd" style="cursor:default">${k==0?"今天":k==1?"昨天":"（"+"日一二三四五六"[x.getDay()]+"）"}</span><button class="chk ${ok?"on":""}" data-dd="${ds}">${ok?I.ok:""}</button></div>`}).join("")}</div></div>`;pinToday();return}
 const td=dayIndex(),done=PLAN.filter((_,d)=>dayDone(d)).length;
 const endD=new Date(store.plan.start.v+"T00:00:00");endD.setDate(endD.getDate()+DAYS-1);
 $("main").innerHTML=`<div class="page"><div class="phead"><h1>${esc(curPlan.n)}<small>${done} / ${DAYS}</small></h1>
 <div class="progress"><i style="width:${done/DAYS*100}%"></i></div>
 <div class="pdates">${pick}<div class="pd-row"><label>開始<input type="date" id="start" value="${store.plan.start.v}"></label><span>→</span><label>結束<input type="date" id="end" value="${dstr(endD)}"></label></div></div></div>
 <div class="todaypanel ${dayDone(td)?"ok":"todo"}"><div class="tp-h"><b>Today:</b> ${dayLabel(td)}<span class="sp"></span>${streakChip()}</div><div class="tp-l">${PLAN[td].map(([b,c])=>`<a data-go="${b}.${c}" class="${isRead(b,c)?"read":""}">${BOOKS[b][0]} ${c}</a>`).join("")}</div></div>
 <div class="days">${PLAN.map((p,d)=>`<div class="day ${d==td?"today":""} ${dayDone(d)?"done":""}" id="day${d}"><span class="no">${String(d+1).padStart(2,"0")}</span><span class="rd" data-go="${p[0][0]}.${p[0][1]}">${dayLabel(d)}<span class="dt">${dayDate(d)}</span></span><button class="chk ${dayDone(d)?"on":""}" data-day="${d}">${dayDone(d)?I.ok:""}</button></div>`).join("")}</div></div>`;
 pinToday();requestAnimationFrame(()=>document.getElementById("day"+td)?.scrollIntoView({block:"center"}));
}

/* ---------- notes ---------- */
let nfilter="all";
const NF=()=>[["all","全部"],["n","筆記"],["h","劃線"],["ai","AI 問答"]].map(([k,t])=>`<button data-nf="${k}" class="${nfilter==k?"on":""}">${t}</button>`).join("");
function renderAINotes(){
 const list=Object.entries(store.ai).filter(([,v])=>!v.del).map(([id,v])=>[id,v,v.k.split(".").map(Number)]).sort((a,b)=>a[2][0]-b[2][0]||a[2][1]-b[2][1]||a[2][2]-b[2][2]||b[1].t-a[1].t);
 let h=`<div class="page"><div class="phead"><h1>筆記<small>${list.length}</small></h1><div class="filters">${NF()}</div></div><div class="nlist">`,last=-1;
 for(const [id,v,[b,c,n]] of list){if(b!=last){h+=`<div class="nb">${BOOKS[b][0]}</div>`;last=b}
  h+=`<div class="nitem" data-goto="${b}.${c}.${n||1}"><div class="r">${c}${n?":"+n:" 章"}</div><div><div class="aiq">${esc(v.q)}</div><div class="note">${esc(v.a.length>160?v.a.slice(0,160)+"…":v.a)}</div></div></div>`}
 if(!list.length)h+=`<p class="empty">還沒有 AI 問答。</p>`;
 $("main").innerHTML=h+"</div></div>";
}
async function renderNotes(){
 if(nfilter==="ai")return renderAINotes();
 const items=Object.entries(store.v).filter(([,v])=>(v.h||v.n||(v.r&&v.r.length))&&(nfilter=="all"||(nfilter=="n"?v.n:(v.h||(v.r&&v.r.length))))).map(([k,v])=>[k.split(".").map(Number),v]).sort((a,b)=>a[0][0]-b[0][0]||a[0][1]-b[0][1]||a[0][2]-b[0][2]);
 const books=[...new Set(items.map(x=>x[0][0]))];const texts=await Promise.all(books.map(getBook));const T={};books.forEach((b,i)=>T[b]=texts[i]);
 let h=`<div class="page"><div class="phead"><h1>筆記<small>${items.length}</small></h1><div class="filters">${NF()}</div></div><div class="nlist">`;
 let last=-1;
 for(const [[b,c,n],v] of items){if(b!=last){h+=`<div class="nb">${BOOKS[b][0]}</div>`;last=b}
  const zh=((T[b][c-1]||[]).find(x=>x[0]==n)||[])[1]||"";
  h+=`<div class="nitem" data-goto="${b}.${c}.${n}"><div class="r">${c}:${n}</div><div><div class="t"><span style="${v.h?`background:linear-gradient(transparent 52%,var(--h${v.h}) 52%)`:""}">${zhHTML(zh,v)}</span></div>${v.n?`<div class="note">${esc(v.n)}</div>`:""}</div></div>`}
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
 $("main").innerHTML=`<div class="page"><div class="psearch"><button class="back" data-v="settings">← 設定</button><input id="psearch" type="search" placeholder="搜尋人名或詞語" value="${person<0?esc(p.n):""}" autocomplete="off"></div><div class="people"><div class="plist">${groups}</div><div id="pd"></div></div></div>`;
 document.querySelector(".plist .on")?.scrollIntoView({block:"nearest",inline:"center"});
 const C=await countFor(p);
 const tot=C.map(b=>b.reduce((s,x)=>s+x,0)),max=Math.max(...tot,1),nb=tot.filter(x=>x).length,sum=tot.reduce((s,x)=>s+x,0);
 const shade=n=>`background:color-mix(in srgb,var(--accent) ${Math.round(14+60*Math.sqrt(n/max))}%,transparent)`;
 let h=`<div class="pname">${p.n}</div>${p.d?`<p class="pbio">${esc(p.d)}</p>`:""}<div class="pstat">${nb} 卷書｜${sum} 次</div><div class="map">`;
 GROUPS.forEach(([g,ids])=>{h+=`<div class="mg"><span>${g}</span><div class="cells">`;for(const i of ids)h+=`<button class="cell ${tot[i]?"hit":""} ${pbook==i?"cur":""}" ${tot[i]?`data-pb="${i}" style="${shade(tot[i])}"`:""}>${BOOKS[i][1]}${tot[i]?`<small>${tot[i]}</small>`:""}</button>`;h+=`</div></div>`});
 h+="</div>";
 if(pbook!=null&&tot[pbook]){
  const bk=await getBook(pbook),re=pRe(p,"");
  h+=`<div class="sub">${BOOKS[pbook][0]}</div><div class="chap-hits" style="margin-top:0;border-top:0;padding-top:0">`+C[pbook].map((n,ci)=>{if(!n)return"";const v=bk[ci].find(x=>re.test(x[1]));return `<div class="ch" data-pgo="${pbook}.${ci+1}.${v[0]}"><b>${ci+1}:${v[0]}</b><span>${esc(v[1].length>46?v[1].slice(0,46)+"…":v[1])}</span></div>`}).join("")+"</div>";
 }
 if(p.r&&p.r.length)h+=`<div class="sub">關係</div>`+p.r.map(([n,t])=>{const j=PEOPLE.findIndex(x=>x.n==n);return `<div class="rel"><b class="${j>=0?"lnk":""}" ${j>=0?`data-person="${j}"`:""}>${n}</b><span>${esc(t)}</span></div>`}).join("");
 $("#pd").innerHTML=h;
}

/* ---------- co-reading ---------- */
const rid=n=>Array.from(crypto.getRandomValues(new Uint8Array(n)),x=>"abcdefghjkmnpqrstuvwxyz23456789"[x%31]).join("");
function myId(){if(!store.me){store.me={id:rid(16),secret:rid(32),name:"",t:now()};saveStore()}return store.me}
async function coApi(action,extra={}){const m=myId();const r=await fetch(RELAY+"/co/"+action,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:m.id,secret:m.secret,...extra})});return r.json()}
function coStatus(){if(noPlan())return{plan:"無計劃",day:0,days:0,today:"",ok:todayDone(),streak:streak(),pct:0};const d=dayIndex(),done=PLAN.filter((_,x)=>dayDone(x)).length;return{plan:curPlan.n,day:d+1,days:DAYS,today:dayLabel(d),ok:dayDone(d),streak:streak(),pct:Math.round(done/DAYS*100)}}
let pushT=null;function pushStatus(){if(!store.me?.name||!navigator.onLine)return;clearTimeout(pushT);pushT=setTimeout(()=>coApi("me",{st:coStatus()}).catch(()=>{}),2000)}
let coJoin="",coCache=null;
async function renderCo(){
 const m=store.me;
 if(!m||!m.name){$("main").innerHTML=`<div class="page"><div class="phead"><h1>共讀</h1></div>
  <div class="co-start"><p>取一個朋友認得出來的暱稱。</p><div class="ask"><input id="coname" maxlength="20" placeholder="暱稱"><button class="btn" data-act="coname">開始</button></div><div class="status" id="cost"></div></div></div>`;return}
 const card=g=>`<section class="cog"><div class="cog-h"><h2>${esc(g.name)}</h2><button class="linkbtn" data-coren="${g.gid}" data-coname="${esc(g.name)}">改名</button><span class="sp"></span><span class="cog-n">${g.members.length} / 6</span></div>
  <div class="cog-m">${g.members.map(x=>{const st=x.st;return `<div class="com ${st?(st.ok?"ok":"todo"):""}"><div class="com-a">${x.avatar?`<img src="${x.avatar}" alt="">`:esc((x.name||"?").slice(0,1))}</div><div class="com-b"><div class="com-n">${esc(x.name)}${x.me?`<small>（我）</small> <button class="linkbtn" data-act="corename">改暱稱</button>`:""}</div>
   ${st?(st.days?`<div class="com-t"><b>Today:</b> ${esc(st.today)}</div><div class="com-p">${esc(st.plan)}｜第 ${st.day} / ${st.days} 天｜連續 ${st.streak} 天</div><div class="com-bar"><i style="width:${st.pct}%"></i></div>`:`<div class="com-t"><b>Today:</b> ${st.ok?"已完成":"還沒完成"}</div><div class="com-p">無計劃｜連續 ${st.streak} 天</div>`):`<div class="com-p">還沒有進度</div>`}</div></div>`}).join("")}</div>
  <div class="cog-f"><span class="cog-code">邀請碼 <b>${g.gid}</b></span><button class="btn ghost" data-cocopy="${g.gid}">複製邀請連結</button><button class="linkbtn" data-coleave="${g.gid}">離開</button></div></section>`;
 const draw=(groups,err)=>{$("main").innerHTML=`<div class="page"><div class="phead"><h1>共讀<small>${esc(m.name)}　<button class="linkbtn" data-act="corename">改暱稱</button></small></h1></div>
  ${err?`<p class="status">${esc(err)}</p>`:""}
  ${groups==null?`<p class="empty">載入中…</p>`:groups.map(card).join("")||`<p class="empty">還沒有加入小組。</p>`}
  ${groups&&groups.length>=3?`<p class="hint">最多可以參加 3 個小組。</p>`:`<div class="co-new"><div class="field"><div class="label">加入小組</div><div class="ask"><input id="cojoin" placeholder="邀請碼" value="${esc(coJoin)}" autocapitalize="off"><button class="btn" data-act="cojoin">加入</button></div></div>
  <div class="field"><div class="label">建立小組</div><div class="ask"><input id="cocreate" maxlength="20" placeholder="小組名稱"><button class="btn ghost" data-act="cocreate">建立</button></div></div></div>`}
  <div class="status" id="cost"></div></div>`};
 draw(coCache);
 try{const j=await coApi("groups");if(pref.view!=="co")return;if(j.error)return draw(coCache||[],j.error);coCache=j.groups;draw(coCache)}catch(e){if(pref.view==="co")draw(coCache||[],"連線失敗，請檢查網路")}
}
async function coAction(a,t){const st=()=>$("#cost");
 try{
  if(a=="coname"||a=="corename"){const n=a=="coname"?$("#coname").value.trim():(prompt("新暱稱",store.me.name)||"").trim();if(!n)return;
   myId();store.me={...store.me,name:n.slice(0,20),t:now()};saveStore();const j=await coApi("me",{name:store.me.name,st:coStatus(),avatar:store.me.avatar||""});if(j.error)return st()&&(st().textContent=j.error);return renderCo()}
  if(a=="cojoin"){const code=$("#cojoin").value.trim().replace(/^.*#join-/,"");if(!code)return;st().textContent="…";const j=await coApi("join",{gid:code});if(j.error)return st().textContent=j.error;coJoin="";pushStatus();return renderCo()}
  if(a=="cocreate"){const n=$("#cocreate").value.trim();st().textContent="…";const j=await coApi("create",{name:n});if(j.error)return st().textContent=j.error;pushStatus();return renderCo()}
 }catch(e){st()&&(st().textContent="連線失敗："+e.message)}
}

/* ---------- settings ---------- */
function renderSettings(){
 const tok=ls.get("br.gh",""),last=ls.get("br.synced",0);
 $("main").innerHTML=`<div class="page set"><h1>設定</h1>
 <div class="grp"><h3>頭像</h3><div class="row"><div class="av-prev">${store.me?.avatar?`<img src="${store.me.avatar}" alt="">`:esc((store.me?.name||"?").slice(0,1))}</div><label class="btn ghost" style="cursor:pointer">上傳照片<input type="file" id="avatar" accept="image/*" hidden></label>${store.me?.avatar?'<button class="linkbtn" data-act="avclear">移除</button>':""}</div><div class="status" id="avst"></div></div>
 <div class="grp"><h3>人物誌 <span class="beta">Beta</span></h3><button class="btn ghost" data-v="people">進入人物誌</button></div>
 <div class="grp"><h3>外觀</h3><div class="seg">${[["auto","跟隨系統"],["light","淺色"],["dark","深色"]].map(([k,t])=>`<button data-theme="${k}" class="${pref.theme==k?"on":""}">${t}</button>`).join("")}</div></div>
 <div class="grp"><div class="fsrow"><div><h3>系統字級</h3><div class="seg">${[[0.85,"小"],[1,"中"],[1.15,"大"]].map(([k,t])=>`<button data-ui="${k}" class="${(pref.ui||1)==k?"on":""}">${t}</button>`).join("")}</div></div><div><h3>經文字級</h3><div class="seg">${[[17,"小"],[19,"中"],[21,"大"],[23,"特大"]].map(([k,t])=>`<button data-fs="${k}" class="${pref.fs==k?"on":""}">${t}</button>`).join("")}</div></div></div></div>
 <div class="grp"><h3>英文對照</h3><div class="seg"><button data-en="0" class="${pref.en?"":"on"}">關</button><button data-en="1" class="${pref.en?"on":""}">WEB</button></div></div>
 <div class="grp"><h3>雲端同步</h3><p class="hint" style="margin-bottom:8px">GitHub Personal Access Token（只勾 gist 權限）。每台裝置填一次，劃線、筆記、進度會存在你的私人 Gist。</p>
  <div class="ask"><input id="gh" type="password" value="${esc(tok)}" placeholder="ghp_…" autocomplete="off"><button class="btn" data-act="sync">同步</button></div>
  <div class="status" id="syncst">${last?"上次同步："+new Date(last).toLocaleString("zh-TW"):""}</div>
  <p class="hint" style="margin-top:6px"><a href="https://github.com/settings/tokens/new?scopes=gist&description=%E6%96%B0%E7%B4%84%E8%AE%80%E7%B6%93%E6%9C%AC" target="_blank" rel="noopener" style="color:inherit">產生 token</a></p></div>
 <div class="grp"><h3>AI 邀請碼</h3><div class="ask"><input id="code" value="${esc(ls.get("br.code",""))}" placeholder="例如 ab3k-9xmp" autocomplete="off" autocapitalize="off"><button class="btn" data-act="quota">確認</button></div>
  <div class="status" id="quotast">${(q=>q?`本月已用 US$${q.used.toFixed(2)} / US$${q.limit}`:"")(ls.get("br.quota",null))}</div>
  <p class="hint" style="margin-top:6px">沒有邀請碼時，按「問」會開啟 claude.ai。</p></div>
 <div class="grp"><h3>自己的 API Key</h3><div class="ask"><input id="ak" type="password" placeholder="${ls.get("br.ai","")?"已儲存（…"+esc(ls.get("br.ai","").slice(-4))+"）":"sk-ant-…（選填）"}" autocomplete="off"><button class="btn" data-act="aksave">儲存</button>${ls.get("br.ai","")?'<button class="btn ghost" data-act="akclear">清除</button>':""}</div>
  <div class="status" id="akst">${ls.get("br.code","")?"有邀請碼時會優先使用邀請碼。":""}</div></div>
 <div class="grp"><h3>資料</h3><div class="row"><button class="btn ghost" data-act="export">匯出</button><label class="btn ghost" style="cursor:pointer">匯入<input type="file" id="imp" accept=".json" hidden></label></div></div>
 </div>`;
}

/* ---------- sync (GitHub Gist) ---------- */
const FILE="bible-reader.json";
function mergeMap(a={},b={}){const o={...a};for(const k in b)if(!o[k]||(b[k].t||0)>(o[k].t||0))o[k]=b[k];return o}
function merge(a,b){return{me:((b.me?.t||0)>(a.me?.t||0)?b.me:a.me)||null,v:mergeMap(a.v,b.v),read:mergeMap(a.read,b.read),ai:mergeMap(a.ai,b.ai),daily:mergeMap(a.daily,b.daily),plan:{start:(b.plan?.start?.t||0)>(a.plan?.start?.t||0)?b.plan.start:a.plan.start,id:(b.plan?.id?.t||0)>(a.plan?.id?.t||0)?b.plan.id:a.plan?.id,done:{}}}}
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
  const r=id?await fetch("https://api.github.com/gists/"+id,{method:"PATCH",headers:H,body}):await fetch("https://api.github.com/gists",{method:"POST",headers:H,body:JSON.stringify({description:"Bible Hunger",public:false,files:{[FILE]:{content:JSON.stringify(merged)}}})});
  if(!r.ok)throw new Error("GitHub "+r.status);
  if(!id)id=(await r.json()).id;ls.set("br.gist",id);
  const changed=JSON.stringify(merged)!==JSON.stringify(store);
  store=merged;ls.set("br.store",store);setupPlan();ls.set("br.synced",now());
  const s2=$("#syncst");if(s2)s2.textContent="已同步　"+new Date().toLocaleString("zh-TW");
  if(changed&&pref.view!=="settings"&&!document.activeElement?.matches("textarea"))render();
 }catch(e){const s2=$("#syncst");if(s2)s2.textContent="同步失敗："+e.message}
 syncing=false;
}

/* ---------- events ---------- */
document.addEventListener("click",e=>{
 const t=e.target.closest("#lightbox,button,[data-go],[data-goto],[data-pgo],[data-jump],[data-pick],.v,#sheetbg,[data-person]");if(!t)return;
 const d=t.dataset;
 if(t.id==="sheetbg"){closeSheet();if(sel){sel=null;document.querySelectorAll(".v.sel").forEach(x=>x.classList.remove("sel"))}return}
 if(d.v)return go(d.v);
 if(d.go){const [b,c]=d.go.split(".").map(Number);return openChapter(b,c)}
 if(d.goto){const [b,c,n]=d.goto.split(".").map(Number);return openChapter(b,c,{verse:n})}
 if(d.pgo){const [b,c,n]=d.pgo.split(".").map(Number);return openChapter(b,c,{verse:n,mark:pRe(curP(),"g")})}
 if(d.book!=null){pref.b=+d.book;pref.c=1;savePref();return openChapter(+d.book,1)}
 if(t.classList.contains("v")){if(getSelection().toString().trim())return;return pickVerse(+d.n)}
 if(d.jump){if(!wide()){mseg="text";renderRead().then(()=>{const el=document.getElementById("v"+d.jump);el?.scrollIntoView({block:"start"});el?.classList.add("flash")})}else{const el=document.getElementById("v"+d.jump);el?.scrollIntoView({block:"start",behavior:"smooth"});el?.classList.add("flash");setTimeout(()=>el?.classList.remove("flash"),1700)}return}
 if(d.pick){pickVerse(+d.pick);document.getElementById("v"+d.pick)?.scrollIntoView({block:"center",behavior:"smooth"});return}
 if(d.stab){pref.stab=d.stab;savePref();return renderSide()}
 if(d.seg){mseg=d.seg;return renderRead()}
 if(d.askverse){closeSheet();if(wide()){pref.stab="ai";savePref();renderSide()}else{mseg="ai";renderRead().then(()=>scrollTo(0,0))}return}
 if(d.aiall){sel=null;return renderRead()}
 if(d.hl!=null&&sel){const cur=getV(pref.b,pref.c,sel).h;setV(pref.b,pref.c,sel,{h:d.hl&&d.hl!==cur?d.hl:""});refreshVerse(sel);document.querySelectorAll("[data-hl]").forEach(x=>x.classList.toggle("on",x.dataset.hl&&x.dataset.hl==getV(pref.b,pref.c,sel).h));return}
 if(d.pr!=null)return applyPartial(d.pr);
 if(d.poster){const lb=$("#lightbox");lb.hidden=false;lb.innerHTML=`<img src="${BP}tr:w-2400/${d.poster}" alt=""><a href="${BP}${d.poster}" target="_blank" rel="noopener">開啟原圖</a><button class="lbx" data-lbclose="1" aria-label="關閉">×</button>`;return}
 if(d.lbclose||t.id==="lightbox"){$("#lightbox").hidden=true;return}
 if(d.pkb!=null)return bookPicker(+d.pkb);
 if(d.pkback)return bookPicker();
 if(d.ask)return ask(d.ask);
 if(d.aidel){const v=store.ai[d.aidel];if(v){store.ai[d.aidel]={...v,del:1,a:"",t:now()};saveStore()}document.querySelectorAll(".aihist").forEach(el=>el.outerHTML=aiHistHTML());if(pref.view==="notes")renderNotes();return}
 if(d.dd){const ds=d.dd;store.daily[ds]={d:dailyDone(ds)?0:1,t:now()};saveStore();pushStatus();renderRail();if(pref.view==="plan"){const y=scrollY,m=$("main").scrollTop;renderPlan();scrollTo(0,y);$("main").scrollTop=m}return}
 if(d.day!=null){const dd=+d.day,v=!dayDone(dd);PLAN[dd].forEach(([b,c])=>setRead(b,c,v));
  const row=document.getElementById("day"+dd);row.classList.toggle("done",v);t.classList.toggle("on",v);t.innerHTML=v?I.ok:"";
  const done=PLAN.filter((_,x)=>dayDone(x)).length;const sm=document.querySelector(".phead h1 small");if(sm)sm.textContent=`${done} / ${DAYS}`;
  const bar=document.querySelector(".phead .progress i");if(bar)bar.style.width=done/DAYS*100+"%";if(dd==dayIndex()){const y=scrollY,m=$("main").scrollTop;renderPlan();scrollTo(0,y);$("main").scrollTop=m}renderRail();return}
 if(d.nf){nfilter=d.nf;return renderNotes()}
 if(d.person!=null){person=+d.person;pbook=null;return renderPeople()}
 if(d.pb!=null){pbook=pbook==+d.pb?null:+d.pb;return renderPeople()}
 if(d.theme){pref.theme=d.theme;savePref();applyPrefs();return renderSettings()}
 if(d.ui){pref.ui=+d.ui;savePref();applyPrefs();return renderSettings()}
 if(d.fs){pref.fs=+d.fs;savePref();applyPrefs();return renderSettings()}
 if(d.en!=null){pref.en=d.en=="1";savePref();return renderSettings()}
 if(d.cocopy){const link=location.origin+location.pathname+"#join-"+d.cocopy;const msg=`一起來讀經！打開 ${link} ，或在「共讀」輸入邀請碼 ${d.cocopy}`;
  navigator.clipboard?.writeText(msg).then(()=>{t.textContent="已複製"},()=>{t.textContent=d.cocopy}).finally(()=>setTimeout(()=>t.textContent="複製邀請連結",2000));return}
 if(d.coren){const n=(prompt("小組名稱",d.coname)||"").trim();if(!n||n===d.coname)return;coApi("rename",{gid:d.coren,name:n}).then(j=>{if(j.error)return alert(j.error);coCache=null;renderCo()});return}
 if(d.coleave){if(t.dataset.sure){coApi("leave",{gid:d.coleave}).then(()=>{coCache=null;renderCo()});return}t.dataset.sure=1;t.textContent="確定離開？";setTimeout(()=>{delete t.dataset.sure;t.textContent="離開"},3000);return}
 const a=d.act;
 if(a&&a.startsWith("co"))return coAction(a,t);
 if(a=="en"){pref.en=!pref.en;savePref();return renderRead()}
 if(a=="prev"||a=="next"){const i=ALL.findIndex(([x,y])=>x==pref.b&&y==pref.c);if(a=="next")setRead(pref.b,pref.c,true);const n=ALL[i+(a=="next"?1:-1)];if(n)openChapter(n[0],n[1]);else renderRead();return}
 if(a=="pick")return bookPicker();
 if(a=="aksave"){const v=$("#ak").value.trim();if(!v)return;if(!/^sk-ant-/.test(v)){$("#akst").textContent="格式不對，API key 應該以 sk-ant- 開頭。";return}ls.set("br.ai",v);return renderSettings()}
 if(a=="akclear"){ls.set("br.ai","");return renderSettings()}
 if(a=="avclear"){myId();store.me={...store.me,avatar:"",t:now()};saveStore();if(store.me.name)coApi("me",{avatar:""}).catch(()=>{});coCache=null;return renderSettings()}
 if(a=="quota"){const st=$("#quotast");const code=$("#code").value.trim();ls.set("br.code",code);if(!code)return;st.textContent="…";
  fetch(RELAY+"/quota",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({code})}).then(r=>r.json()).then(j=>{if(j.error){st.textContent=j.error;return}ls.set("br.quota",{used:j.used,limit:j.limit});st.textContent=`${j.name}｜本月已用 US$${j.used.toFixed(2)} / US$${j.limit}`}).catch(e=>st.textContent="連線失敗："+e.message);return}
 if(a=="sync"){ls.set("br.gh",$("#gh").value.trim());return sync(true)}
 if(a=="export"){const u=URL.createObjectURL(new Blob([JSON.stringify(store)],{type:"application/json"}));const x=document.createElement("a");x.href=u;x.download=`bible-reader-${todayStr()}.json`;x.click();return}
});
document.addEventListener("input",e=>{
 if(e.target.id==="note"&&sel){setV(pref.b,pref.c,sel,{n:e.target.value});refreshVerse(sel)}
 if(e.target.id==="gh")ls.set("br.gh",e.target.value.trim());
 if(e.target.id==="code")ls.set("br.code",e.target.value.trim());
});
document.addEventListener("change",async e=>{
 if(e.target.id==="planpick"){store.plan.id={v:e.target.value,t:now()};setupPlan();saveStore();pushStatus();renderPlan();renderRail()}
 if(e.target.id==="end"&&e.target.value&&DAYS){const x=new Date(e.target.value+"T00:00:00");x.setDate(x.getDate()-(DAYS-1));store.plan.start={v:dstr(x),t:now()};saveStore();pushStatus();renderPlan();renderRail();return}
 if(e.target.id==="start"&&e.target.value){store.plan.start={v:e.target.value,t:now()};saveStore();pushStatus();renderPlan();renderRail()}
 if(e.target.id==="avatar"){const f=e.target.files[0];if(!f)return;const st=$("#avst");st.textContent="處理中…";
  try{const url=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
   const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
   const N=160,cv=document.createElement("canvas");cv.width=cv.height=N;const k=Math.min(img.width,img.height);
   cv.getContext("2d").drawImage(img,(img.width-k)/2,(img.height-k)/2,k,k,0,0,N,N);
   const av=cv.toDataURL("image/jpeg",0.8);myId();store.me={...store.me,avatar:av,t:now()};saveStore();
   if(store.me.name){const j=await coApi("me",{avatar:av});if(j.error){st.textContent=j.error;return}}coCache=null;renderSettings();$("#avst").textContent="已更新"}
  catch(x){st.textContent="無法讀取這張圖片"}return}
 if(e.target.id==="imp"){const f=e.target.files[0];if(!f)return;try{store=merge(store,JSON.parse(await f.text()));setupPlan();ls.set("br.store",store);saveStore();e.target.value="";alert("已匯入")}catch(x){alert("檔案格式不正確")}}
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
let tx=null,ty=null;
document.addEventListener("touchstart",e=>{if(pref.view!=="read"||wide()||!e.target.closest("main")){tx=null;return}tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
document.addEventListener("touchend",e=>{if(tx==null)return;const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;tx=null;
 if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.5)return;const order=["text","guide","ai"],k=order.indexOf(mseg)+(dx<0?1:-1);if(k<0||k>2)return;const n=order[k];if(n===mseg)return;mseg=n;renderRead().then(()=>window.scrollTo(0,0))},{passive:true});
document.addEventListener("selectionchange",()=>{clearTimeout(window._st);window._st=setTimeout(showSelbar,250)});
document.addEventListener("pointerdown",e=>{if(e.target.closest("#selbar"))e.preventDefault()});
addEventListener("scroll",()=>{if(!$("#selbar").hidden)showSelbar()},true);
let lastWide=wide();addEventListener("resize",()=>{if(wide()!==lastWide){lastWide=wide();applyPrefs();render()}});

(()=>{if(noPlan())return;const d=dayIndex();if(dayDone(d))return;const f=PLAN[d].find(([b,c])=>!isRead(b,c));if(f){pref.b=f[0];pref.c=f[1];pref.view="read";savePref()}})();
if(location.hash.startsWith("#join-")){coJoin=location.hash.slice(6);pref.view="co";savePref();history.replaceState(null,"",location.pathname)}
applyPrefs();render();sync();pushStatus();
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js");
const APPV=(document.querySelector('script[src^="app.js"]')?.getAttribute("src").match(/v=(\d+)/)||[])[1];
let updShown=false;
async function checkUpdate(){if(updShown||!APPV||!navigator.onLine||!location.protocol.startsWith("http"))return;
 try{const t=await (await fetch("./?u="+Date.now(),{cache:"no-store"})).text();const v=(t.match(/app\.js\?v=(\d+)/)||[])[1];
  if(v&&v!==APPV){updShown=true;const b=document.createElement("button");b.className="updbar";b.textContent="有新版本，點此更新";b.onclick=async()=>{b.textContent="更新中…";try{const r=await navigator.serviceWorker?.getRegistration();await r?.update()}catch(e){}location.reload()};document.body.appendChild(b)}}catch(e){}}
setTimeout(checkUpdate,3000);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkUpdate()});
