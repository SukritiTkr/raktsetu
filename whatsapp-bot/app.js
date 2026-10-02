const $=s=>document.querySelector(s),chat=$('#chat'),inp=$('#inp'),logEl=$('#log');
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),T=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const G=['O+','O-','A+','A-','B+','B-','AB+','AB-'];
const COMPAT={'O+':['O+','O-'],'O-':['O-'],'A+':['A+','A-','O+','O-'],'A-':['A-','O-'],'B+':['B+','B-','O+','O-'],'B-':['B-','O-'],'AB+':G,'AB-':['AB-','A-','B-','O-']};
const HOSP=['AIIMS Delhi','Safdarjung Hospital','Max Saket','City Hospital'];
const PARTNER=/aiims|safdarjung|max|city hospital|rml|fortis|apollo|lnjp/i;
const DB=[['Rahul Sharma','O+',2,140,.9],['Amit Verma','O+',1.2,200,.8],['Neha Singh','O+',3.4,120,.7],['Rohit Kumar','O+',5.1,95,.6],['Priya Nair','O-',4.2,60,.9],['Sana Khan','O-',2.8,170,.7],['Karan Mehta','A+',2.6,180,.8],['Anita Das','A-',3.9,130,.6],['Vikram Rao','B+',3.1,150,.7],['Meera Joshi','B-',4.4,110,.8],['Imran Ali','AB+',6,110,.5],['Pooja Gupta','A+',1.9,100,.9],['Deepak Yadav','B+',5.6,210,.6],['Arjun Malik','O+',7.2,160,.7]].map((a,i)=>({n:a[0],g:a[1],km:a[2],last:a[3],r:a[4],p:`+91 9${8-i%5}••• ••${41+i}`}));
const S={p:null,flow:0,last:null};
const score=(d,g)=>{const c=d.g===g?1:.7,di=Math.max(0,1-d.km/10),f=Math.min(d.last/180,1);return{s:.4*c+.3*di+.2*f+.1*d.r,c,di,f}};
function log(k,v=''){logEl.insertAdjacentHTML('beforeend',`<div><span class=t>${T()}</span> <b>${k}</b> ${v}</div>`);logEl.scrollTop=1e9}
const scroll=()=>chat.scrollTop=chat.scrollHeight;
function user(t){const e=document.createElement('div');e.className='b me';e.innerHTML=t.replace(/</g,'&lt;')+`<time>${T()} ✓✓</time>`;chat.appendChild(e);scroll()}
async function say(h,d){const t=document.createElement('div');t.className='b typ';t.innerHTML='<i></i><i></i><i></i>';chat.appendChild(t);scroll();await sleep(d??Math.min(900,300+h.length*4));t.className='b';t.innerHTML=h+`<time>${T()}</time>`;scroll();return t}
function btns(el,opts,fn){const row=document.createElement('div');row.className='qr';opts.forEach(o=>{const [l,v]=Array.isArray(o)?o:[o,o],b=document.createElement('button');b.textContent=l;b.onclick=()=>fn(v,l,row);row.appendChild(b)});el.insertBefore(row,el.querySelector('time'));scroll()}
function ask(h,opts=[],parse){return new Promise(async res=>{const el=await say(h);
 const done=(v,l,typed,row)=>{row&&row.remove();if(!typed)user(l);S.p=null;res(v)};
 if(opts.length)btns(el,opts,(v,l,row)=>done(v,l,0,row));
 S.p=t=>{const v=parse?parse(t):t;if(v==null||v===''){say("Sorry, I didn't get that. "+(opts.length?'Please tap an option or type it.':'Please try again.'));return}document.querySelectorAll('.qr').forEach(r=>r.remove());done(v,t,1)}})}
const pg=t=>{const m=t.match(/\b(ab|a|b|o)\s*(\+|-|pos(?:itive)?|neg(?:ative)?)/i);return m?m[1].toUpperCase()+(/^n|-/i.test(m[2])?'-':'+'):null};
function nlu(t){const x=t.toLowerCase(),o={intent:'unknown'};
 if(/\b(hi|hello|hey|namaste|menu|start)\b/.test(x))o.intent='menu';
 if(/donat|register|volunteer|pledge/.test(x))o.intent='donor';
 if(/eligib|can i donate/.test(x))o.intent='eligibility';
 if(/track|status/.test(x))o.intent='track';
 if(/need|require|urgent|blood for|looking for|emergency|arrange/.test(x)||pg(t)&&o.intent=='unknown')o.intent='request';
 const g=pg(t);if(g)o.group=g;const u=x.match(/(\d+)\s*(unit|bag)/);if(u)o.units=+u[1];
 const h=HOSP.find(h=>x.includes(h.split(' ')[0].toLowerCase()));if(h)o.hospital=h;
 if(/urgent|emergency|critical|asap|immediate/.test(x))o.urgency='Critical';
 $('#nlu').textContent=JSON.stringify(o,null,1);log('NLU',`intent=<b>${o.intent}</b>`);return o}
async function menu(h='What would you like to do?'){const el=await say(h);btns(el,[['🩸 I need blood','r'],['🙋 Become a donor','d'],['📍 Track request','t'],['✅ Check eligibility','e']],(v,l,row)=>{if(S.flow)return;row.remove();user(l);run(v)})}
async function run(v,pre){S.flow=1;try{await({r:()=>request(pre),d:donor,t:track,e:elig}[v])()}catch(e){log('error',e.message)}S.flow=0;await sleep(400);await menu('Anything else I can help with?')}
async function route(t){const o=nlu(t);if(S.flow){say('One moment, I am still working on your last request 🙏');return}
 if(o.intent=='menu'||o.intent=='unknown')return menu(o.intent=='menu'?'Namaste 🙏 I am <b>RaktSetu</b>, your blood-access assistant.<br>You can type naturally, e.g. <i>“Need 2 units of O+ at AIIMS urgently”</i>.':"I'm not sure I understood. Pick an option or describe what you need:");
 run({request:'r',donor:'d',track:'t',eligibility:'e'}[o.intent],o)}
async function request(pre={}){
 const r={group:pre.group,units:pre.units,hosp:pre.hospital,urg:pre.urgency};
 if(pre.group)await say(`Got it – I understood <b>${pre.group}</b>${pre.units?`, ${pre.units} unit(s)`:''}${pre.hospital?`, ${pre.hospital}`:''}. Let me fill in the rest.`);
 r.group=r.group||await ask('Which <b>blood group</b> is needed?',G,pg);
 r.units=r.units||await ask('How many <b>units</b>?',['1','2','3','4+'],t=>parseInt(t)||null);
 r.hosp=r.hosp||await ask('Which <b>hospital</b> is the patient in? (tap or type)',[...HOSP]);
 r.urg=r.urg||await ask('How urgent is it?',[['🔴 Critical (<6 hrs)','Critical'],['🟠 Today','Today'],['🟢 Planned','Planned']]);
 const ok=await ask(`Please confirm:<div class="card">🩸 <b>${r.group}</b> · ${r.units} unit(s)<br>🏥 ${r.hosp}<br>⏱ ${r.urg}</div>`,[['✅ Confirm','y'],['✏️ Start over','n']]);
 if(ok=='n')return request();
 const id='RS-'+Math.floor(1000+Math.random()*9000),partner=PARTNER.test(r.hosp);
 await say('🔎 Verifying your request…');log('verify',`${id} hospital_partner=${partner}`);await sleep(700);
 await say(partner?`✅ <b>${id}</b> verified with <b>${r.hosp}</b> blood desk.`:`⚠️ <b>${r.hosp}</b> is not a partner hospital yet. Request <b>${id}</b> sent to an Upay NGO coordinator for manual check. Matching has started in parallel.`);
 const L=DB.filter(d=>COMPAT[r.group].includes(d.g)&&d.last>=90).map(d=>({...d,sc:score(d,r.group)})).sort((a,b)=>b.sc.s-a.sc.s);
 log('match',`${L.length} eligible of ${DB.length} donors · filters: compatibility, ≥90 days since last donation`);
 L.slice(0,6).forEach(d=>log('score',`${d.n} ${d.g} ${d.km}km → <b>${Math.round(d.sc.s*100)}%</b> (compat ${d.sc.c} · dist ${d.sc.di.toFixed(2)} · fresh ${d.sc.f.toFixed(2)})`));
 await say(`🤖 <b>${L.length} compatible, fresh donors</b> found. Privacy on: nobody sees your number until you agree.<br>Starting <b>wave matching</b>.`);
 const w1=L.filter(d=>d.km<=4).slice(0,3),w2=L.filter(d=>!w1.includes(d)).slice(0,4);
 let acc=await wave('Wave 1 · within 4 km',w1,1,r);
 if(!acc)acc=await wave('Wave 2 · expanded radius',w2,2,r);
 if(!acc){await say('📣 <b>Wave 3</b>: broadcasting to partner NGO volunteers…');await sleep(900);acc={n:'Meera Joshi (NGO volunteer)',g:r.group,km:4.4,last:120,p:'+91 98••• ••412'};log('wave3','NGO broadcast accepted')}
 const first=acc.n.split(' ')[0];
 const sh=await ask(`🎉 <b>${acc.n}</b> (${acc.g}, ${acc.km} km away) has <b>accepted</b>. Share your number with ${first} so you can coordinate?`,[['Share my number','y'],['Keep private','n']]);
 await say(`<div class="card"><b>${acc.n}</b> ✔ Verified<br>📞 ${acc.p} ${sh=='y'?'(you were shared)':'(via RaktSetu relay)'}<br>🩸 Last donated ${acc.last} days ago · eligible<br>⏱ ETA 18 min</div>🏥 ${r.hosp} desk has been alerted with ID <b>${id}</b>.`);
 const tl=document.createElement('div');tl.className='b';tl.innerHTML=`<b>Live tracking · ${id}</b><ul class="tl"><li class="d">Request verified</li><li class="d">Donor accepted</li><li>Donor on the way</li><li>Reached hospital</li><li>Donation completed</li></ul><time>${T()}</time>`;chat.appendChild(tl);scroll();
 const li=tl.querySelectorAll('li');S.last={id,stage:2};
 for(let i=2;i<5;i++){await sleep(1500);li[i].className='d';S.last.stage=i+1;log('track',['','','left home','arrived at hospital','donation complete'][i]);scroll()}
 const rt=await ask(`✅ Donation completed. Thank you! How was your RaktSetu experience?`,['⭐⭐⭐⭐⭐','⭐⭐⭐⭐','⭐⭐⭐']);
 await say(`Thanks for the feedback. ${first} has earned a <b>Life Saver</b> badge 🏅`);S.last.stage=5}
async function wave(name,list,n,r){
 if(!list.length)return null;await say(`📡 <b>${name}</b>: alerting ${list.length} donors (timeout 2 min).`);
 const el=document.createElement('div');el.className='b';el.innerHTML=`<div class="wave">${list.map((d,i)=>`<div><span>${d.n} · ${d.g} · ${d.km} km · ${Math.round(d.sc.s*100)}%</span><span class="chip" id="c${n}${i}">Sent</span></div>`).join('')}</div>`;chat.appendChild(el);scroll();
 const force=$('#force').checked&&n==1;let winner=null;
 for(let i=0;i<list.length;i++){await sleep(900);const c=$(`#c${n}${i}`);c.className='chip sn';c.textContent='Seen';await sleep(900);
  const ok=!force&&!winner&&(Math.random()<list[i].r||(n==2&&i==list.length-1));
  if(ok){c.className='chip ok';c.textContent='Accepted';winner=list[i];log('wave'+n,list[i].n+' accepted');break}
  c.className='chip no';c.textContent=i==0?'Declined':'No reply';log('wave'+n,list[i].n+(i==0?' declined':' timed out'))}
 if(!winner){await say(n==1?'⏳ No donor confirmed in Wave 1. Escalating automatically…':'⏳ Still searching. Escalating to NGO network…',500)}
 return winner}
async function donor(){
 await say('Thank you for stepping up 🙏 Let’s register you in about a minute.');
 const name=await ask('What is your <b>name</b>?');
 const g=await ask('Your <b>blood group</b>?',G,pg);
 const area=await ask('Which <b>area</b> are you in?',['Saket','Dwarka','Rohini','Lajpat Nagar']);
 const ld=await ask('When did you last donate?',[['Never',999],['< 3 months',40],['3–6 months',130],['> 6 months',220]],t=>/never/i.test(t)?999:parseInt(t)||null);
 const sc=await ask('Quick screening: in the last 6 months, any <b>fever, surgery, tattoo, or antibiotics</b>? And is your weight above 45 kg?',[['None · 45 kg+','ok'],['Yes, one applies','no']]);
 const cs=await ask('Do you agree to get alert messages for matching requests? Your number is never shown to requesters before you accept.',[['I agree','y'],['No','n']]);
 const next=new Date(Date.now()+Math.max(0,90-ld)*864e5).toLocaleDateString([],{day:'numeric',month:'short'});
 if(sc=='no'||ld<90){await say(`Thank you, ${name}. You are not eligible right now${ld<90?` (earliest next donation: <b>${next}</b>)`:''}. I will remind you once you are.`);log('donor',name+' deferred');return}
 if(cs=='n'){await say('No problem. You are not registered for alerts.');return}
 DB.push({n:name,g,km:1.5,last:ld,r:.8,p:'+91 98••• ••000'});const id='RS-D-'+Math.floor(1000+Math.random()*9000);log('donor',`${name} ${g} ${area} registered, fresh=${ld}d`);
 await say(`🟢 Welcome, <b>${name}</b>!<div class="card">Donor ID <b>${id}</b><br>🩸 ${g} · ${area}<br>Status: <b>Fresh donor</b> (eligible now)</div>You will be alerted only for verified requests near you. Try “I need ${g} blood” to see yourself in the match list.`)}
async function elig(){const ld=await ask('When did you last donate blood?',[['Never',999],['< 3 months',40],['3–6 months',130],['> 6 months',220]],t=>/never/i.test(t)?999:parseInt(t)||null);
 const d=Math.max(0,90-ld);await say(d?`⏳ Not yet. You can donate again in about <b>${d} days</b>. Whole blood needs a 90-day gap.`:`✅ You are <b>eligible</b> to donate. Weight ≥ 45 kg, age 18–65, no fever or infection. Want to register?`)}
async function track(){if(!S.last)return say('You have no active requests yet. Say “I need blood” to start one.');
 const n=['Verified','Donor accepted','Donor on the way','Reached hospital','Donation completed'];await say(`<b>${S.last.id}</b> · status: <b>${n[Math.min(4,S.last.stage-1)]}</b>`)}
function send(){const t=inp.value.trim();if(!t)return;inp.value='';user(t);if(S.p)S.p(t);else route(t)}
$('#snd').onclick=send;inp.onkeydown=e=>{if(e.key=='Enter')send()};$('#cb').onclick=()=>$('#con').classList.toggle('open');
log('boot','engine ready · donors in DB: '+DB.length);
(async()=>{await menu('Namaste 🙏 I am <b>RaktSetu</b>, your blood-access assistant.<br>Type naturally, e.g. <i>“Need 2 units of O+ at AIIMS urgently”</i>, or pick an option.')})();
