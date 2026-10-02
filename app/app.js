const $=s=>document.querySelector(s);
const G=['O+','O-','A+','A-','B+','B-','AB+','AB-'];
const COMPAT={'O+':['O+','O-'],'O-':['O-'],'A+':['A+','A-','O+','O-'],'A-':['A-','O-'],'B+':['B+','B-','O+','O-'],'B-':['B-','O-'],'AB+':G,'AB-':['AB-','A-','B-','O-']};
const HOSP=['AIIMS Delhi','Safdarjung Hospital','Max Saket','City Hospital','Local Nursing Home'];
const PARTNER=h=>h!=='Local Nursing Home';
const DB=[['Amit Verma','O+',1.2,200,.8],['Neha Singh','O+',3.4,120,.7],['Rohit Kumar','O+',5.1,95,.6],['Priya Nair','O-',4.2,60,.9],['Sana Khan','O-',2.8,170,.7],['Karan Mehta','A+',2.6,180,.8],['Anita Das','A-',3.9,130,.6],['Vikram Rao','B+',3.1,150,.7],['Meera Joshi','B-',4.4,110,.8],['Imran Ali','AB+',6,110,.5],['Pooja Gupta','A+',1.9,100,.9],['Deepak Yadav','B+',5.6,210,.6]].map((a,i)=>({n:a[0],g:a[1],km:a[2],last:a[3],r:a[4],ang:i*2.4,p:`+91 9${8-i%5}••• ••${41+i}`}));
const S={role:'req',reqs:[],feed:[],cur:null,f:{g:'O+',u:'2',h:'AIIMS Delhi',urg:'Critical'},
 me:{n:'Rahul Sharma',g:'O+',last:140,av:true,done:0,km:2},inv:{'O+':9,'O-':3,'A+':7,'A-':2,'B+':8,'B-':2,'AB+':4,'AB-':1}};
const T=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const feed=t=>{S.feed.unshift(`<time>${T()}</time>${t}`)};
const sc=(d,g)=>.4*(d.g===g?1:.7)+.3*Math.max(0,1-d.km/10)+.2*Math.min(d.last/180,1)+.1*d.r;
const cands=g=>DB.filter(d=>COMPAT[g].includes(d.g)&&d.last>=90).map(d=>({...d,s:sc(d,g)})).sort((a,b)=>b.s-a.s);
const ST=['Submitted','Verified','Matching','Donor accepted','Donated'];
function submit(){const f=S.f,r={id:'RS-'+(4800+S.reqs.length*7+Math.floor(Math.random()*6)),g:f.g,u:+f.u,h:f.h,urg:f.urg,st:0,donor:null,wave:0,al:[],t:Date.now()};
 S.reqs.unshift(r);S.cur=r;feed(`${r.id} created: ${r.g} ×${r.u} at ${r.h} (${r.urg})`);
 if(PARTNER(r.h))setTimeout(()=>verify(r),1300);else feed(`${r.id} waits for NGO manual verification`);render()}
function verify(r){if(r.st>0)return;r.st=1;feed(`${r.id} verified`);render();
 setTimeout(()=>{r.st=2;r.wave=1;const c=cands(r.g);r.al=c.filter(d=>d.km<=4).slice(0,3).map(d=>d.n);feed(`${r.id} wave 1: ${r.al.length} donors alerted`);render()},1200);
 setTimeout(()=>{if(r.st==2){r.wave=2;cands(r.g).forEach(d=>{if(r.al.length<7&&!r.al.includes(d.n))r.al.push(d.n)});feed(`${r.id} wave 2: radius expanded`);render()}},7000);
 setTimeout(()=>{if(r.st==2){const d=cands(r.g)[0];accept(r,d.n,d.km,d.p)}},14000)}
function accept(r,n,km,p){if(r.st!=2)return;r.st=3;r.donor={n,km,p};feed(`${r.id} accepted by ${n}`);render()}
function donated(r){r.st=4;S.inv[r.g]+=1;S.me.last=0;S.me.done++;feed(`${r.id} donation completed`);render()}
const mineAlert=()=>S.reqs.find(r=>r.st==2&&!r.skip&&S.me.av&&S.me.last>=90&&COMPAT[r.g].includes(S.me.g));
const mineJob=()=>S.reqs.find(r=>r.st==3&&r.donor&&r.donor.n==S.me.n);
function radar(r){const c=cands(r.g);let s='<svg class="radar" viewBox="0 0 300 300" role="img" aria-label="Donor radar"><circle cx="150" cy="150" r="140" fill="var(--soft)"/>';
 [45,90,135].forEach((x,i)=>s+=`<circle cx="150" cy="150" r="${x}" fill="none" stroke="var(--line)"/><text x="${150+x-4}" y="146" font-size="8" fill="var(--mute)" text-anchor="end">${(i+1)*2} km</text>`);
 if(r.st==2)s+='<path class="sweep" d="M150 150 L150 12 A138 138 0 0 1 250 55 Z" fill="rgba(91,63,217,.18)"/>';
 c.forEach(d=>{const x=150+d.km*22.5*Math.cos(d.ang),y=150+d.km*22.5*Math.sin(d.ang),al=r.al.includes(d.n),w=r.donor&&r.donor.n==d.n;
  s+=`<circle class="${al&&r.st==2?'pulse':''}" cx="${x}" cy="${y}" r="${w?8:5.5}" fill="${w?'#1fa45a':al?'#f59e0b':'#9aa5cc'}"/>`});
 return s+'<circle cx="150" cy="150" r="9" fill="#e6194b"/><text x="150" y="153" font-size="8" fill="#fff" text-anchor="middle">H</text></svg>'}
function steps(st){return`<div class="steps">${ST.map((s,i)=>`<div class="${i<st+ (st==4?1:0)&&i<=st?'d':i==st+1?'n':''}"><i>${i<=st?'✓':i+1}</i>${s}</div>`).join('')}</div>`}
function reqView(){const r=S.cur,f=S.f;
 if(!r)return`<div class="col"><div class="card"><h1>Right donor.<br>Right request.<br><span style="color:var(--red)">Right time.</span></h1><p class="mute">Verified donors, verified requests, one request away.</p></div>
 <div class="card"><h2>Request blood</h2><div class="row"><div><label for="fg">Blood group</label><select id="fg" data-f="g">${G.map(x=>`<option ${x==f.g?'selected':''}>${x}</option>`).join('')}</select></div><div><label for="fu">Units</label><select id="fu" data-f="u">${[1,2,3,4].map(x=>`<option ${x==f.u?'selected':''}>${x}</option>`).join('')}</select></div></div>
 <label for="fh">Hospital</label><select id="fh" data-f="h">${HOSP.map(x=>`<option ${x==f.h?'selected':''}>${x}</option>`).join('')}</select>
 <label for="fx">Urgency</label><select id="fx" data-f="urg">${['Critical','Today','Planned'].map(x=>`<option ${x==f.urg?'selected':''}>${x}</option>`).join('')}</select>
 <button class="btn" data-a="submit">Request blood</button><p class="mute">Choose “Local Nursing Home” to see the manual NGO verification path (approve it in the Hospital / NGO view).</p></div></div>`;
 const c=cands(r.g).slice(0,5);
 return`<div class="col"><div class="card"><div class="tg"><h2>${r.id} · ${r.g} ×${r.u}</h2><span class="chip ${r.st==4?'ok':r.st==0?'am':'bl'}">${r.st==0?'Awaiting verification':ST[r.st]}</span></div><div class="mute">${r.h} · ${r.urg}</div>${steps(r.st)}</div>
 <div class="card"><h2>Live donor radar</h2>${radar(r)}<p class="mute">Grey: eligible · Amber: alerted · Green: accepted. ${r.st==2?`Wave ${r.wave} in progress.`:''}</p></div>
 ${r.donor?`<div class="card"><h2>Your donor</h2><div class="dn"><div class="av">${r.donor.n[0]}</div><div class="m"><b>${r.donor.n}</b> <span class="chip ok">✔ Verified</span><small>${r.donor.km} km away · ETA ${Math.round(r.donor.km*7+4)} min · ${r.donor.p}</small></div></div></div>`:''}
 <div class="card"><h2>Top matches (AI score)</h2>${c.map(d=>`<div class="dn"><div class="av">${d.n[0]}</div><div class="m"><b>${d.n}</b><small>${d.g} · ${d.km} km · last donated ${d.last} d ago</small></div><span class="chip ${r.donor&&r.donor.n==d.n?'ok':r.al.includes(d.n)?'am':''}">${Math.round(d.s*100)}%</span></div>`).join('')}</div>
 <button class="btn o" data-a="new">${r.st==4?'Start a new request':'Cancel / new request'}</button></div>`}
function donView(){const m=S.me,a=mineAlert(),j=mineJob(),pct=Math.min(1,m.last/90),C=2*Math.PI*38;
 return`<div class="col"><div class="card"><div class="tg"><h2>${m.n}</h2><span class="chip ${m.last>=90?'ok':'am'}">${m.last>=90?'Fresh donor':'Resting'}</span></div>
 <div class="row" style="align-items:center"><svg width="100" height="100" viewBox="0 0 100 100" role="img" aria-label="Days since last donation"><circle cx="50" cy="50" r="38" fill="none" stroke="var(--line)" stroke-width="9"/><circle cx="50" cy="50" r="38" fill="none" stroke="${m.last>=90?'#1fa45a':'#f59e0b'}" stroke-width="9" stroke-dasharray="${C*pct} ${C}" transform="rotate(-90 50 50)" stroke-linecap="round"/><text x="50" y="54" text-anchor="middle" font-size="16" font-weight="700" fill="var(--ink)">${m.last}d</text></svg>
 <div><div class="mute">Blood group</div><select id="mg" data-me="g" aria-label="Your blood group">${G.map(x=>`<option ${x==m.g?'selected':''}>${x}</option>`).join('')}</select><div class="mute" style="margin-top:6px">${m.last>=90?'Eligible now':`Eligible in ${90-m.last} days`} · ${m.done} donations</div></div></div>
 <div class="tg" style="margin-top:10px"><span>Available for alerts</span><button class="btn s ${m.av?'g':'o'}" data-a="av">${m.av?'On':'Off'}</button></div></div>
 ${a?`<div class="card alert"><div class="tg"><h2>🚨 Match request</h2><span class="chip rd">${a.urg}</span></div><p><b>${a.g}</b> needed, ${a.u} unit(s) at <b>${a.h}</b>. You are ${m.km} km away and eligible.</p><p class="mute">Your number stays hidden until you accept.</p><div class="row"><button class="btn g" data-a="acc" data-id="${a.id}">Accept</button><button class="btn o" data-a="skip" data-id="${a.id}">Can't today</button></div></div>`:''}
 ${j?`<div class="card"><h2>Your active donation</h2><p><b>${j.id}</b> · ${j.h}<br>Patient request ${j.g} ×${j.u}</p><button class="btn b" data-a="done" data-id="${j.id}">I donated · mark complete</button></div>`:''}
 ${!a&&!j?`<div class="card"><h2>No requests for you right now</h2><p class="mute">Create a request in the Requester view with a compatible group to see an alert here.</p></div>`:''}
 <div class="card"><h2>Badges</h2><span class="chip ok">Verified donor</span> <span class="chip bl">${m.done?'Life Saver ×'+m.done:'First donation pending'}</span></div></div>`}
function hosView(){const R=S.reqs,act=R.filter(r=>r.st<4).length,mx=Math.max(...Object.values(S.inv));
 return`<div class="kpis"><div class="card"><b>${act}</b><span class="mute">Active requests</span></div><div class="card"><b>${R.filter(r=>r.st>=1).length}</b><span class="mute">Verified</span></div><div class="card"><b>${DB.length+1}</b><span class="mute">Donors online</span></div><div class="card"><b>${R.filter(r=>r.st==4).length}</b><span class="mute">Fulfilled</span></div></div>
 <div class="dash"><div class="card"><h2>Request queue</h2>${R.length?`<table><tr><th>ID</th><th>Need</th><th>Hospital</th><th>Status</th><th></th></tr>${R.map(r=>`<tr><td>${r.id}</td><td>${r.g} ×${r.u}</td><td>${r.h}</td><td><span class="chip ${r.st==4?'ok':r.st==0?'am':'bl'}">${ST[r.st]}</span></td><td>${r.st==0?`<button class="btn s b" data-a="ver" data-id="${r.id}">Verify</button>`:''}</td></tr>`).join('')}</table>`:'<p class="mute">No requests yet. Create one in the Requester view.</p>'}</div>
 <div class="card"><h2>Blood inventory (units)</h2>${G.map(g=>`<div class="bar"><span>${g}</span><div><i class="${S.inv[g]<4?'lo':''}" style="width:${S.inv[g]/mx*100}%"></i></div><em>${S.inv[g]}</em></div>`).join('')}<p class="mute">Red = critically low. Completed donations add stock.</p></div>
 <div class="card"><h2>Live activity</h2><div class="feed">${S.feed.map(x=>`<div>${x}</div>`).join('')||'<span class="mute">Waiting for activity…</span>'}</div></div></div>`}
function render(){const v={req:reqView,don:donView,hos:hosView}[S.role]();$('#app').innerHTML=v;
 const n=S.reqs.filter(r=>r.st==0).length;
 $('#seg').innerHTML=[['req','Requester'],['don','Donor'],['hos','Hospital / NGO']].map(([k,l])=>`<button class="${S.role==k?'on':''}" data-role="${k}">${l}${k=='don'&&mineAlert()?' •':''}${k=='hos'&&n?' •':''}</button>`).join('')}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.role){S.role=d.role;render();return}
 const r=S.reqs.find(x=>x.id==d.id);
 ({submit,new:()=>{S.cur=null},av:()=>{S.me.av=!S.me.av},acc:()=>accept(r,S.me.n,S.me.km,'+91 98••• ••412'),skip:()=>{r.skip=1;feed(`${S.me.n} declined ${r.id}`)},done:()=>donated(r),ver:()=>verify(r)})[d.a]?.();render()});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.f)S.f[t.dataset.f]=t.value;if(t.dataset.me){S.me[t.dataset.me]=t.value;render()}});
render();
