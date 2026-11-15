// 新約讀經本 AI 中繼站 (Cloudflare Worker)
// Secrets: ANTHROPIC_API_KEY, ADMIN_TOKEN.  KV binding: KV.
// KV keys:  code:<code> -> {name, limit, active, created}
//           use:<code>:<YYYY-MM> -> dollars spent (string)

const MODEL = "claude-sonnet-5-5";
const PRICE_IN = 2 / 1e6;   // USD per input token (Sonnet 5.5)
const PRICE_OUT = 10 / 1e6; // USD per output token
const DEFAULT_LIMIT = 2;    // USD per person per month
const MAX_PROMPT = 30000;   // characters
const ORIGINS = ["https://s1teeey.github.io", "http://localhost:8765"];
const SYSTEM = "你是熟悉新約聖經、原文與歷史背景的查經同伴。用繁體中文回答，先講結論，再用簡短段落說明；必要時加一段「白話講」。不要說教。";

const month = () => new Date().toISOString().slice(0, 7);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get("origin") || "";
    const cors = {
      "access-control-allow-origin": ORIGINS.includes(origin) ? origin : ORIGINS[0],
      "access-control-allow-headers": "content-type, authorization",
      "access-control-allow-methods": "GET, POST, OPTIONS",
    };
    const json = (o, status = 200) =>
      new Response(JSON.stringify(o), { status, headers: { ...cors, "content-type": "application/json; charset=utf-8" } });
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });

    try {
      if (url.pathname === "/ask" && req.method === "POST") return await ask(req, env, json);
      if (url.pathname === "/quota" && req.method === "POST") {
        const { code } = await req.json();
        const c = await env.KV.get("code:" + code, "json");
        if (!c || !c.active) return json({ error: "邀請碼無效或已停用" }, 403);
        const used = +(await env.KV.get(`use:${code}:${month()}`) || 0);
        return json({ name: c.name, used, limit: c.limit ?? DEFAULT_LIMIT });
      }
      if (url.pathname.startsWith("/co/") && req.method === "POST") return await co(url.pathname.slice(4), await req.json(), env, json);
      if (url.pathname === "/admin") return new Response(ADMIN_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
      if (url.pathname === "/admin/api") return await admin(req, env, json);
      return json({ error: "not found" }, 404);
    } catch (e) {
      return json({ error: "伺服器錯誤：" + e.message }, 500);
    }
  },
};

async function ask(req, env, json) {
  const { code, prompt } = await req.json();
  const c = await env.KV.get("code:" + code, "json");
  if (!c || !c.active) return json({ error: "邀請碼無效或已停用" }, 403);
  if (!prompt || typeof prompt !== "string" || prompt.length > MAX_PROMPT) return json({ error: "問題太長或是空的" }, 400);

  const uk = `use:${code}:${month()}`;
  const used = +(await env.KV.get(uk) || 0);
  const limit = c.limit ?? DEFAULT_LIMIT;
  if (used >= limit) return json({ error: `本月額度已用完（US$${limit}），下個月 1 號會重置。`, used, limit }, 429);

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "server-side-fallback-2026-07-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: "low" },
      fallbacks: "default",
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const j = await r.json();
  if (!r.ok) return json({ error: "AI 服務錯誤：" + (j.error?.message || r.status) }, 502);

  const u = j.usage || {};
  const cost = (u.input_tokens || 0) * PRICE_IN + (u.cache_creation_input_tokens || 0) * PRICE_IN * 1.25 +
    (u.cache_read_input_tokens || 0) * PRICE_IN * 0.1 + (u.output_tokens || 0) * PRICE_OUT;
  const total = used + cost;
  await env.KV.put(uk, String(total), { expirationTtl: 60 * 60 * 24 * 400 });

  if (j.stop_reason === "refusal") return json({ text: "這個問題沒有得到回答，換個問法試試。", used: total, limit });
  const text = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  return json({ text, used: total, limit });
}

// ---------- 好友共讀 ----------
// KV: m:<id> -> {h: sha256(secret), name, groups:[gid], st:{...status}, u}
//     g:<gid> -> {name, owner, members:[id], created}
const MAX_MEMBERS = 6, MAX_GROUPS = 3;
const ALPHA = "abcdefghjkmnpqrstuvwxyz23456789";
const rid = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((x) => ALPHA[x % ALPHA.length]).join("");
async function sha(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
const clean = (s, n) => String(s || "").replace(/[<>]/g, "").trim().slice(0, n);

async function co(action, b, env, json) {
  const id = clean(b.id, 40), secret = String(b.secret || "");
  if (!/^[a-z0-9]{8,40}$/.test(id) || secret.length < 16) return json({ error: "身份資料不正確" }, 400);
  const mk = "m:" + id;
  let me = await env.KV.get(mk, "json");
  const h = await sha(secret);
  if (me && me.h !== h) return json({ error: "身份驗證失敗" }, 403);
  if (!me) me = { h, name: "", groups: [], st: null, u: 0 };
  const saveMe = () => env.KV.put(mk, JSON.stringify(me));

  if (action === "me") {
    if (b.name != null) me.name = clean(b.name, 20);
    if (b.st) me.st = {
      plan: clean(b.st.plan, 30), day: +b.st.day || 0, days: +b.st.days || 0,
      today: clean(b.st.today, 60), ok: !!b.st.ok, streak: +b.st.streak || 0, pct: Math.max(0, Math.min(100, +b.st.pct || 0)),
    };
    me.u = Date.now();
    await saveMe();
    return json({ ok: true });
  }
  if (!me.name) return json({ error: "請先設定暱稱" }, 400);

  if (action === "create") {
    if (me.groups.length >= MAX_GROUPS) return json({ error: `最多只能參加 ${MAX_GROUPS} 個小組` }, 400);
    const name = clean(b.name, 20) || "共讀小組";
    const gid = rid(8);
    await env.KV.put("g:" + gid, JSON.stringify({ name, owner: id, members: [id], created: Date.now() }));
    me.groups.push(gid); await saveMe();
    return json({ gid });
  }
  if (action === "join") {
    const gid = clean(b.gid, 12).toLowerCase();
    const g = await env.KV.get("g:" + gid, "json");
    if (!g) return json({ error: "找不到這個小組，請確認邀請碼" }, 404);
    if (g.members.includes(id)) return json({ gid });
    if (me.groups.length >= MAX_GROUPS) return json({ error: `最多只能參加 ${MAX_GROUPS} 個小組` }, 400);
    if (g.members.length >= MAX_MEMBERS) return json({ error: `這個小組已經滿 ${MAX_MEMBERS} 人了` }, 400);
    g.members.push(id); await env.KV.put("g:" + gid, JSON.stringify(g));
    me.groups.push(gid); await saveMe();
    return json({ gid });
  }
  if (action === "leave") {
    const gid = clean(b.gid, 12);
    const g = await env.KV.get("g:" + gid, "json");
    if (g) {
      g.members = g.members.filter((x) => x !== id);
      if (!g.members.length) await env.KV.delete("g:" + gid);
      else { if (g.owner === id) g.owner = g.members[0]; await env.KV.put("g:" + gid, JSON.stringify(g)); }
    }
    me.groups = me.groups.filter((x) => x !== gid); await saveMe();
    return json({ ok: true });
  }
  if (action === "groups") {
    const out = [];
    for (const gid of me.groups) {
      const g = await env.KV.get("g:" + gid, "json");
      if (!g) continue;
      const members = await Promise.all(g.members.map(async (mid) => {
        const m = await env.KV.get("m:" + mid, "json");
        return m ? { me: mid === id, name: m.name, st: m.st, u: m.u } : null;
      }));
      out.push({ gid, name: g.name, owner: g.owner === id, members: members.filter(Boolean) });
    }
    return json({ groups: out });
  }
  return json({ error: "unknown action" }, 400);
}

async function admin(req, env, json) {
  const auth = req.headers.get("authorization") || "";
  if (!env.ADMIN_TOKEN || auth !== "Bearer " + env.ADMIN_TOKEN) return json({ error: "管理密碼錯誤" }, 401);
  const m = month();
  if (req.method === "GET") {
    const list = await env.KV.list({ prefix: "code:" });
    const rows = await Promise.all(list.keys.map(async (k) => {
      const code = k.name.slice(5);
      const c = await env.KV.get(k.name, "json");
      const used = +(await env.KV.get(`use:${code}:${m}`) || 0);
      return { code, ...c, used };
    }));
    rows.sort((a, b) => (a.created || 0) - (b.created || 0));
    return json({ month: m, rows });
  }
  const b = await req.json();
  if (b.action === "add") {
    const name = String(b.name || "").trim().slice(0, 30);
    if (!name) return json({ error: "請輸入名字" }, 400);
    const rand = [...crypto.getRandomValues(new Uint8Array(4))].map((x) => "abcdefghjkmnpqrstuvwxyz23456789"[x % 31]).join("");
    const code = rand + "-" + [...crypto.getRandomValues(new Uint8Array(4))].map((x) => "abcdefghjkmnpqrstuvwxyz23456789"[x % 31]).join("");
    await env.KV.put("code:" + code, JSON.stringify({ name, limit: +b.limit || DEFAULT_LIMIT, active: true, created: Date.now() }));
    return json({ code });
  }
  const k = "code:" + b.code;
  const c = await env.KV.get(k, "json");
  if (!c) return json({ error: "找不到這個邀請碼" }, 404);
  if (b.action === "toggle") c.active = !c.active;
  if (b.action === "limit") c.limit = Math.max(0, +b.limit || 0);
  if (b.action === "delete") { await env.KV.delete(k); return json({ ok: true }); }
  await env.KV.put(k, JSON.stringify(c));
  return json({ ok: true });
}

const ADMIN_HTML = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>讀經本 AI 管理</title>
<style>
:root{--bg:#fff;--ink:#121322;--muted:#5E6170;--line:#E6E5EB;--accent:#8F5CF0}
@media (prefers-color-scheme:dark){:root{--bg:#121322;--ink:#E3E4E6;--muted:#A1A4B5;--line:#26283C;--accent:#8B93E8}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 "Nunito Sans","PingFang TC",sans-serif}
.w{max-width:760px;margin:0 auto;padding:32px max(16px,env(safe-area-inset-left))}
h1{font-size:26px;margin:0 0 18px;border-bottom:2px solid var(--ink);padding-bottom:10px}
input,button{font:inherit;color:inherit;padding:8px 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg)}
input{font-size:16px}button{cursor:pointer;font-weight:700}button.p{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}.row input{flex:1;min-width:120px}
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}td,th{padding:10px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}
th{font-size:12px;color:var(--muted)}code{font-weight:800;color:var(--accent)}.off{opacity:.45}.m{color:var(--muted);font-size:13px}
.tw{overflow-x:auto}
</style></head><body><div class="w">
<h1>讀經本 AI 管理</h1>
<div class="row" id="login"><input id="pw" type="password" placeholder="管理密碼"><button class="p" id="go">登入</button></div>
<div id="app" hidden>
<div class="row"><input id="nm" placeholder="同學名字"><input id="lm" type="number" step="0.5" value="2" style="max-width:90px"><button class="p" id="add">新增邀請碼</button></div>
<p class="m" id="sum"></p><div class="tw"><table><thead><tr><th>名字</th><th>邀請碼</th><th>本月用量</th><th>上限</th><th></th></tr></thead><tbody id="tb"></tbody></table></div>
</div></div>
<script>
let pw="";try{pw=sessionStorage.getItem("pw")||""}catch(e){}
const api=(m,b)=>fetch("/admin/api",{method:m,headers:{authorization:"Bearer "+pw,"content-type":"application/json"},body:b?JSON.stringify(b):undefined}).then(r=>r.json());
async function load(){const j=await api("GET");if(j.error){document.getElementById("login").hidden=false;document.getElementById("app").hidden=true;if(pw)alert(j.error);return}
 try{sessionStorage.setItem("pw",pw)}catch(e){}
 document.getElementById("login").hidden=true;document.getElementById("app").hidden=false;
 const tot=j.rows.reduce((s,r)=>s+r.used,0);document.getElementById("sum").textContent=j.month+"｜共 "+j.rows.length+" 人｜本月合計 US$"+tot.toFixed(2);
 document.getElementById("tb").innerHTML=j.rows.map(r=>'<tr class="'+(r.active?"":"off")+'"><td>'+r.name.replace(/</g,"&lt;")+'</td><td><code>'+r.code+'</code></td><td>US$'+r.used.toFixed(3)+'</td><td><input data-l="'+r.code+'" type="number" step="0.5" value="'+(r.limit??2)+'" style="width:72px"></td><td><button data-t="'+r.code+'">'+(r.active?"停用":"啟用")+'</button></td></tr>').join("")}
document.getElementById("go").onclick=()=>{pw=document.getElementById("pw").value;load()};
document.getElementById("add").onclick=async()=>{const j=await api("POST",{action:"add",name:document.getElementById("nm").value,limit:document.getElementById("lm").value});if(j.error)return alert(j.error);document.getElementById("nm").value="";load()};
document.addEventListener("click",async e=>{const t=e.target.dataset.t;if(t){await api("POST",{action:"toggle",code:t});load()}});
document.addEventListener("change",async e=>{const l=e.target.dataset.l;if(l){await api("POST",{action:"limit",code:l,limit:e.target.value});load()}});
if(pw)load();
</script></body></html>`;
