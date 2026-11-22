const $=(s,e=document)=>e.querySelector(s);
const IC={grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
box:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',doc:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',flag:'<path d="M5 21V4M5 5h12l-2 4 2 4H5"/>',cal:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',check:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',users:'<circle cx="9" cy="9" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.200 6 5.500"/><path d="M16 6.500a3 3 0 010 5.600M18 14.800c2 .7 3 2.400 3 5.200"/>',user:'<circle cx="12" cy="8.500" r="3.500"/><path d="M5 20c0-3.800 3.100-6 7-6s7 2.200 7 6"/>',bell:'<path d="M6 16V11a6 6 0 0112 0v5l1.500 2h-15z"/><path d="M10 21h4"/>',file:'<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/>',bolt:'<path d="M13 3L5 13.500h6L10 21l8-10.500h-6z"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M5.600 18.400l2.100-2.100M16.300 7.700l2.100-2.100"/>',link:'<path d="M10 14a4 4 0 005.600 0l3-3a4 4 0 00-5.600-5.600l-1 1M14 10a4 4 0 00-5.600 0l-3 3A4 4 0 0011 18.600l1-1"/>',search:'<circle cx="11" cy="11" r="6.500"/><path d="M16 16l4 4"/>',lock:'<rect x="5" y="10" width="14" height="10" rx="3"/><path d="M8 10V7a4 4 0 018 0v3"/>',clip:'<rect x="5" y="4" width="14" height="17" rx="3"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',eyeOff:'<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24">${IC[n]}</svg>`;
const T=['Brand Strategy & Growth','Creative & Motion Studio','Performance Ops','Social & Community','Editorial & Brand Voice'];
const ROLES={admin:'Admin',am:'Account Manager',cc:'Content Creator',emp:'Creative',client:'Client'};
const ME={admin:['Elena Vance','Workspace owner'],am:['Omar Haddad','Account Manager'],cc:['Lina Aziz','Content Creator'],emp:['Karim Fouad','Creative · Video Editor'],client:['Sara Nabil','Client · Lumen Skincare']};
const S={authed:false,role:'admin',p:{CREATE_CONTENT:true,MANAGE_CONTENT:true,REVIEW_CONTENT:false,PUBLISH_CONTENT:false},page:'dashboard',auth:'login',q:'',nf:'all',open:false,err:{},brand:null,sub:null};
const PERM=Object.keys(S.p);
const N={dashboard:['Dashboard','grid'],brands:['Brands','box'],briefs:['Brand Briefs','doc'],campaigns:['Campaigns','flag'],plans:['Content Plans','cal'],items:['Content Items','layers'],tasks:['Tasks','check'],platform:['Platform Accounts','link'],teams:['Teams','users'],users:['Users','user'],files:['Files','file'],strategies:['Strategies','bolt'],notifications:['Notifications','bell'],meta:['Meta Settings','gear'],onboarding:['Onboarding','clip'],brief:['Brand Brief','doc'],strategy:['Strategy','bolt'],account:['Profile & Password','lock']};
const NAV={admin:['dashboard','brands','tasks','teams','users','meta','account'],am:['dashboard','brands','tasks','teams','account'],cc:['brands','tasks','account'],emp:['tasks','account'],client:['onboarding','brief','strategy','notifications','brands','account']};
const has=c=>S.role!=='client';
const locked=k=>(S.role==='admin'&&k==='briefs')||(S.role==='cc'&&['briefs','platform'].includes(k))||(S.role==='am'&&k==='platform')||S.role==='client';
const can=k=>{if(D[k].ro||S.role==='client'||S.role==='emp'||locked(k))return false;if(S.role==='admin')return true;return S.role==='am'?['briefs','files','brands'].includes(k):['files'].includes(k)};
const TEAMS=T,BR=['Lumen Skincare','Nord Coffee','Atlas Fitness','Kiwa Kids','Bloom Florals','Sahara Travel','Pixel Pulse'];
const ST=['DRAFT','REVIEW','APPROVED','PUBLISHED'],PR=['LOW','MEDIUM','HIGH'],TS=['TODO','IN_PROGRESS','DONE'];
const D={
users:{t:'Users',n:'user',d:'Add people to the workspace and manage their role, job title and team.',api:['GET /users','POST /users','PATCH /users/:id','DELETE /users/:id'],
 cols:[['fullName','Name'],['email','Email'],['roleId','System role'],['jobTitleId','Job title'],['teamId','Team'],['isActive','Status']],
 f:[['fullName','text'],['email','email'],['roleId','role'],['jobTitleId','job'],['teamId','fk',T],['isActive','switch']],req:['fullName','email','roleId','jobTitleId'],
 rows:[{fullName:'Elena Vance',email:'elena@agency-clean.co',roleId:'Admin',jobTitleId:'Workspace Owner',teamId:'Brand Strategy & Growth',isActive:true},{fullName:'Omar Haddad',email:'omar@agency-clean.co',roleId:'Account Manager',jobTitleId:'Account Manager',teamId:'Performance Ops',isActive:true},{fullName:'Lina Aziz',email:'lina@agency-clean.co',roleId:'Content Creator',jobTitleId:'Content Creator',teamId:'Creative & Motion Studio',isActive:true},{fullName:'Karim Fouad',email:'karim@agency-clean.co',roleId:'Creative',jobTitleId:'Video Editor',teamId:'Social & Community',isActive:true},{fullName:'Mona Saeed',email:'mona@agency-clean.co',roleId:'Creative',jobTitleId:'Graphic Designer',teamId:'Editorial & Brand Voice',isActive:false},{fullName:'Sara Nabil',email:'sara@lumen.com',roleId:'Client',jobTitleId:'Client',teamId:'—',isActive:true}],
 acts:r=>[[r.isActive?'Deactivate':'Reactivate','tog']],run(a,r){r.isActive=!r.isActive;toast(r.isActive?'Reactivated':'Deactivated')}},
brands:{t:'Brands',n:'brand',d:'Brands, their owners and everything linked to them.',api:['GET /brands','GET /brands/:id','POST /brands'],
 cols:[['name','Brand'],['industry','Industry'],['teamId','Team'],['accountManagerId','Account manager'],['status','Status']],
 f:[['name','text'],['industry','text'],['websiteUrl','text'],['description','textarea'],['status','select',['ACTIVE','PAUSED','ONBOARDING']],['clientId','fk',['Sara Nabil']],['accountManagerId','fk',['Omar Haddad']],['teamId','fk',T]],req:['name','status'],
 rows:BR.map((b,i)=>({name:b,industry:['Beauty','Food & Beverage','Fitness','Retail','Lifestyle','Travel','Tech'][i],teamId:T[[0,0,1,1,2,3,4][i]],accountManagerId:'Omar Haddad',status:i==5?'ONBOARDING':i==6?'PAUSED':'ACTIVE'}))},
briefs:{t:'Brand Briefs',n:'brief',d:'AI-generated briefs per brand, with version and approval status.',api:['GET /brand-briefs','PATCH /brand-briefs/:id','POST /brand-briefs/:id/approve','POST /brand-briefs/:brandId/generate'],noCreate:true,gen:true,
 cols:[['brandId','Brand'],['version','Version'],['status','Status'],['updatedAt','Updated']],f:[['status','select',['DRAFT','GENERATING','READY','APPROVED','FAILED']],['errorMessage','text']],req:['status'],
 rows:[{brandId:'Lumen Skincare',version:'v3',status:'READY',updatedAt:'2026-11-15',content:{audience:'Women 25–40',pillars:['Clean ingredients','Skin education'],tone:'Warm, expert'}},{brandId:'Nord Coffee',version:'v2',status:'APPROVED',updatedAt:'2026-11-10',content:{audience:'Urban professionals',pillars:['Craft','Ritual'],tone:'Calm, confident'}},{brandId:'Atlas Fitness',version:'v1',status:'FAILED',updatedAt:'2026-11-14',errorMessage:'Generation timed out',content:{}},{brandId:'Kiwa Kids',version:'v1',status:'GENERATING',updatedAt:'2026-11-16',content:{}}],
 acts:r=>r.status==='READY'&&can('briefs')?[['Approve','ap']]:[],run(a,r){r.status='APPROVED';toast('Brief approved')}},
campaigns:{t:'Campaigns',n:'campaign',d:'Campaigns linked to monthly content plans.',api:['GET /campaigns','POST /campaigns','PATCH /campaigns/:id'],
 cols:[['name','Campaign'],['objective','Objective'],['startDate','Start'],['endDate','End'],['contentPlanId','Plan']],f:[['name','text'],['objective','textarea'],['startDate','date'],['endDate','date'],['contentPlanId','fk',['Nov · Lumen Skincare','Nov · Nord Coffee']]],req:['name','startDate','endDate'],
 rows:[{name:'Winter Glow',objective:'Drive holiday gift-set sales',startDate:'2026-11-20',endDate:'2026-12-24',contentPlanId:'Nov · Lumen Skincare'},{name:'Cold Brew Club',objective:'Grow subscription sign-ups',startDate:'2026-11-01',endDate:'2026-11-30',contentPlanId:'Nov · Nord Coffee'}]},
plans:{t:'Content Plans',n:'plan',d:'Monthly plans and their review workflow.',api:['GET /content-plans','POST /content-plans','PATCH /content-plans/:id/status'],
 cols:[['title','Plan'],['brandId','Brand'],['month','Period'],['status','Status'],['assignedToId','Assigned to']],f:[['brandId','fk',BR],['platformAccountId','fk',['@lumen.skin','@nordcoffee']],['title','text'],['year','number'],['month','number'],['monthlyGoals','textarea'],['notes','textarea'],['status','select',ST],['assignedToId','fk',['Lina Aziz','Karim Fouad']]],req:['title','brandId'],
 rows:[{title:'Nov · Lumen Skincare',brandId:'Lumen Skincare',month:'Nov 2026',status:'REVIEW',assignedToId:'Lina Aziz'},{title:'Nov · Nord Coffee',brandId:'Nord Coffee',month:'Nov 2026',status:'APPROVED',assignedToId:'Karim Fouad'},{title:'Dec · Lumen Skincare',brandId:'Lumen Skincare',month:'Dec 2026',status:'DRAFT',assignedToId:'Lina Aziz'}],
 acts:r=>[...(r.status==='DRAFT'&&(has('REVIEW_CONTENT')||has('MANAGE_CONTENT'))?[['Send to review','rv']]:[]),...(r.status==='APPROVED'&&has('PUBLISH_CONTENT')?[['Publish','pb']]:[])],run(a,r){r.status=a==='rv'?'REVIEW':'PUBLISHED';toast('Status updated')}},
items:{t:'Content Items',n:'content item',d:'Posts, reels and stories scheduled inside a plan or campaign.',api:['GET /content-items','POST /content-items','PATCH /content-items/:id'],
 cols:[['title','Title'],['type','Type'],['scheduledDate','Scheduled'],['toneOfVoice','Tone'],['contentPlanId','Plan']],f:[['contentPlanId','fk',['Nov · Lumen Skincare','Nov · Nord Coffee']],['campaignId','fk',['Winter Glow','Cold Brew Club']],['title','text'],['type','select',['POST','REEL','STORY','CAROUSEL']],['scheduledDate','date'],['reference','text'],['toneOfVoice','text'],['caption','textarea'],['notes','textarea']],req:['title','type'],
 rows:[{title:'Serum routine reel',type:'REEL',scheduledDate:'2026-11-21',toneOfVoice:'Warm, expert',contentPlanId:'Nov · Lumen Skincare'},{title:'Gift-set carousel',type:'CAROUSEL',scheduledDate:'2026-11-24',toneOfVoice:'Playful',contentPlanId:'Nov · Lumen Skincare'},{title:'Morning ritual story',type:'STORY',scheduledDate:'2026-11-18',toneOfVoice:'Calm',contentPlanId:'Nov · Nord Coffee'}]},
tasks:{t:'Tasks',n:'task',d:'Track work on content items, deadlines and progress.',api:['GET /tasks','POST /tasks','PATCH /tasks/:id/status'],
 cols:[['title','Task'],['priority','Priority'],['assignedToId','Assignee'],['plannedDeadline','Deadline'],['status','Status']],f:[['title','text'],['description','textarea'],['type','select',['DESIGN','COPY','REVIEW','PUBLISH']],['status','select',TS],['priority','select',PR],['assignedToId','fk',['Lina Aziz','Karim Fouad']],['plannedDeadline','date'],['effectiveDeadline','date'],['dependsOnTaskId','fk',['Write captions']],['contentItemId','fk',['Serum routine reel','Gift-set carousel']]],req:['title','priority'],
 rows:[{title:'Design serum reel cover',priority:'HIGH',assignedToId:'Lina Aziz',plannedDeadline:'2026-11-15',status:'IN_PROGRESS'},{title:'Write captions',priority:'MEDIUM',assignedToId:'Karim Fouad',plannedDeadline:'2026-11-19',status:'TODO'},{title:'Approve gift-set carousel',priority:'LOW',assignedToId:'Lina Aziz',plannedDeadline:'2026-11-12',status:'DONE'}],
 acts:r=>!can('tasks')?[]:r.status==='TODO'&&has('MANAGE_CONTENT')?[['Start','TODO']]:r.status==='IN_PROGRESS'&&has('MANAGE_CONTENT')?[['Complete','DONE']]:r.status==='DONE'&&has('REVIEW_CONTENT')?[['Reopen','RE']]:[],run(a,r){r.status=a==='TODO'?'IN_PROGRESS':a==='DONE'?'DONE':'TODO';toast('Task updated')}},
platform:{t:'Platform Accounts',n:'account',d:'Social accounts connected to each brand.',api:['GET /platform-accounts','POST /platform-accounts'],
 cols:[['brandId','Brand'],['platform','Platform'],['accountName','Account'],['accountUrl','URL'],['isActive','Status']],f:[['brandId','fk',BR],['platform','select',['INSTAGRAM','TIKTOK','FACEBOOK','LINKEDIN','YOUTUBE']],['accountName','text'],['accountUrl','text'],['isActive','switch']],req:['brandId','platform','accountName'],
 rows:[{brandId:'Lumen Skincare',platform:'INSTAGRAM',accountName:'@lumen.skin',accountUrl:'instagram.com/lumen.skin',isActive:true},{brandId:'Nord Coffee',platform:'TIKTOK',accountName:'@nordcoffee',accountUrl:'tiktok.com/@nordcoffee',isActive:true}]},
teams:{t:'Teams',n:'team',d:'Operational units and the brands they own.',api:['GET /teams','POST /teams','PATCH /teams/:id'],note:'Team fields are not detailed in the API reference, so only the name is editable for now.',
 cols:[['name','Team'],['brands','Brands']],f:[['name','text']],req:['name'],rows:T.map((t,i)=>({name:t,brands:[2,2,1,1,1][i]}))},
notifications:{t:'Notifications',n:'notification',d:'Updates for your account.',api:['GET /notifications'],ro:true,note:'Mark-as-read and delete are not defined in the backend yet, so notifications are view-only.',
 cols:[['title','Notification'],['createdAt','When'],['isRead','State']],f:[],rows:[{title:'Content plan “Nov · Lumen Skincare” moved to review',createdAt:'12 min ago',isRead:false},{title:'Task “Design serum reel cover” is due today',createdAt:'2 h ago',isRead:false},{title:'Brief for Nord Coffee was approved',createdAt:'Yesterday',isRead:true}]},
files:{t:'Files',n:'file record',d:'File metadata records.',api:['GET /files','POST /files','PATCH /files/:id'],note:'Only metadata is managed here. Binary upload and download are not defined in the backend.',
 cols:[['fileName','File'],['mimeType','Type'],['fileSize','Size']],f:[['fileName','text'],['mimeType','text'],['fileSize','number']],req:['fileName'],rows:[{brandId:'Lumen Skincare',fileName:'lumen-brand-guide.pdf',mimeType:'application/pdf',fileSize:'2.4 MB'},{brandId:'Lumen Skincare',fileName:'winter-glow-moodboard.png',mimeType:'image/png',fileSize:'860 KB'}]},
strategies:{t:'Strategies',n:'strategy',d:'Strategy records and their metadata.',api:['GET /strategies'],ro:true,upload:true,note:'Upload, download and version history are not defined in the backend yet.',
 cols:[['brandId','Brand'],['title','Strategy'],['updatedAt','Updated']],f:[],rows:[{brandId:'Lumen Skincare',title:'Q4 growth strategy',updatedAt:'2026-11-02'},{brandId:'Nord Coffee',title:'Subscription launch',updatedAt:'2026-10-21'}]},
meta:{t:'Meta Settings',n:'setting',d:'Application-wide key/value settings.',api:['GET /meta','POST /meta','PATCH /meta/:key'],note:'Request fields are not specified in the API reference; key and value are assumed.',
 cols:[['key','Key'],['value','Value']],f:[['key','text'],['value','text']],req:['key'],rows:[{key:'workspace.name',value:'ORVIA'},{key:'content.defaultTone',value:'Warm, expert'}]}};
/* helpers */
const hum=s=>s.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()).replace(/ Id$/,'');
const PL={ok:['ACTIVE','READY','APPROVED','DONE','PUBLISHED'],wn:['REVIEW','IN_PROGRESS','GENERATING','MEDIUM','PAUSED','ONBOARDING'],er:['FAILED','HIGH'],lc:['DRAFT'],in:['TODO','SUBMITTED']};
const pill=v=>{if(typeof v==='boolean')return v?'<span class="pill ok">Active</span>':'<span class="pill er">Inactive</span>';const c=Object.keys(PL).find(k=>PL[k].includes(v))||'';return `<span class="pill ${c}">${String(v).replace('_',' ').toLowerCase().replace(/^./,x=>x.toUpperCase())}</span>`};
const PK=['status','priority','isActive'];
function cell(k,v,E,first,row){let h;if(k==='isRead')h=v?'<span class="pill">Read</span>':'<span class="pill in">Unread</span>';else if(PK.includes(k))h=pill(v);else if(/date|deadline|updatedAt/i.test(k))h=`<span class="mono">${v||'—'}</span>`;else h=v??'—';
 return first&&!['isRead'].includes(k)?`<b>${h}</b>`:h}
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;t.setAttribute('role','status');document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
function modal(h){const o=document.createElement('div');o.className='ov';o.innerHTML=h;o.onclick=e=>{if(e.target===o)o.remove()};document.body.appendChild(o);return o}
const close=()=>document.querySelectorAll('.ov').forEach(o=>o.remove());
/* pages */
function head(E,w,k){const a=[];if(w&&!E.noCreate)a.push(`<button class="btn p" onclick="act('${k}',null,'new')">+ ${k==='users'?'Add user':'New '+E.n}</button>`);
 if(E.gen&&can(k))a.push(`<button class="btn p" onclick="gen()">Generate brief</button>`);
 if(E.upload)a.push(`<button class="btn" disabled title="Not available in the backend yet">Upload strategy</button>`);
 const lk=locked(k)&&!E.ro;
 return `<div class="ph"><div><span class="eb">${ROLES[S.role]}</span>${E.api.map(x=>`<span class="eb" style="background:var(--lilac);color:#17171C">${x}</span>`).join('')}<h1>${E.t}</h1><p>${E.d}</p></div><div style="display:flex;gap:8px">${a.join('')}</div></div>${lk?`<div class="note wn"><b>🔒</b><span>View-only for your role. You can open and read these records, but not create, edit, delete or change them.</span></div>`:''}${E.note?`<div class="note"><b>ⓘ</b><span>${E.note}</span></div>`:''}`}
function listPage(k){const E=D[k],w=can(k);let rows=E.rows.map((r,i)=>({r,i})).filter(({r})=>!S.brand||!r.brandId||r.brandId===S.brand).filter(({r})=>k!=='brands'||S.role!=='client'||r.name===CLIENT_BRAND).filter(({r})=>k!=='notifications'||S.role!=='client'||r.title.includes(CLIENT_BRAND)).filter(({r})=>JSON.stringify(Object.values(r)).toLowerCase().includes(S.q.toLowerCase()));
 if(k==='notifications'&&S.nf==='unread')rows=rows.filter(({r})=>!r.isRead);
 let h=head(E,w,k);
 if(k==='notifications')h+=`<div class="seg" style="width:max-content;margin:0 0 16px">${['all','unread'].map(x=>`<button class="${S.nf===x?'on':''}" onclick="S.nf='${x}';view()">${x==='all'?'All':'Unread'}</button>`).join('')}</div>`;
 if(!rows.length)return h+`<div class="card empty"><span class="chip">${ic(N[k][1])}</span><h2>Nothing here yet</h2><p class="mute">${S.q?'No results match your search. Try a different keyword.':(w?'Create your first '+E.n+' to get started.':'There are no records to show yet.')}</p></div>`;
 const del=w&&!E.noDelete&&(k!=='users'||S.role==='admin');
 h+=`<div class="card" style="padding:20px 12px"><div class="tw"><table><thead><tr>${E.cols.map(c=>`<th>${c[1]}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map(({r,i})=>`<tr>${E.cols.map((c,j)=>`<td>${j===0?`<span class="chip" style="background:${['var(--lilac)','var(--peach)','var(--sky)','var(--mint)'][i%4]}">${ic(N[k][1])}</span>`:''}${cell(c[0],r[c[0]],E,j===0,r)}</td>`).join('')}<td><div class="ra"><button class="btn sm t" onclick="act('${k}',${i},'view')">View</button>${(E.acts?E.acts(r):[]).map(a=>`<button class="btn sm" onclick="act('${k}',${i},'${a[1]}')">${a[0]}</button>`).join('')}${w&&E.f.length?`<button class="btn sm" onclick="act('${k}',${i},'edit')">Edit</button>`:''}${del?`<button class="btn sm dg" onclick="act('${k}',${i},'del')">Delete</button>`:''}</div></td></tr>`).join('')}</tbody></table></div></div>`;
 return h}
function dashboard(){const U=D.users.rows,B=D.brands.rows,act=U.filter(u=>u.isActive).length;
 const per=T.map(t=>B.filter(b=>b.teamId===t).length),cov=per.filter(x=>x).length,un=B.filter(b=>!T.includes(b.teamId)).length;
 const TC=['#17171C','#6B5FC7','#E8806A','#1F6B4A','#2F7FB5'],TD=['#17171C','#DCD6FF','#FFD9CD','#D8F2E4','#D8EEF8'];
 const al=[];const f=D.briefs.rows.filter(b=>b.status==='FAILED').length,rv=D.plans.rows.filter(p=>p.status==='REVIEW').length,od=D.tasks.rows.filter(t=>t.status!=='DONE'&&t.plannedDeadline<'2026-11-16').length;
 if(f)al.push(['er',`${f} brief failed to generate`,'Open Brand Briefs and retry.']);if(rv)al.push(['wn',`${rv} content plan waiting for review`,'Review it to unblock the team.']);if(od)al.push(['wn',`${od} overdue task`,'Check Tasks for the deadline.']);
 return `<div class="ph"><div><span class="eb">${ROLES[S.role]}</span><span class="eb" style="background:var(--lilac);color:#17171C">Computed from list endpoints</span><h1>Dashboard</h1><p>Overview of brands, teams and workload. No dashboard endpoint exists yet, so figures are calculated from the lists.</p></div><span class="pill ${al.length?'wn':'ok'}">${al.length?al.length+' items need attention':'All systems operational'}</span></div>
<div class="g3"><div class="card"><div class="orbit"></div><span class="eb" style="background:none;padding:0">Cutout / Editorial</span><div style="font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:12px;margin-top:12px">Total brands</div><div class="big">${B.length}<small>Brands</small></div><div class="sep"><span class="tag pe">${B.length-un} assigned</span><span class="mute">${un} brands without a team</span></div></div>
<div class="card"><div class="arch"><i></i></div><span class="eb" style="background:none;padding:0">Arch / Campaign</span><div style="font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:12px;margin-top:12px">Total users</div><div class="big">${U.length}<small>Studio seats</small></div><div class="sep"><span class="tag lc">${act} active</span><span class="mute">${U.length-act} deactivated account</span></div></div>
<div class="card tk" style="overflow:visible"><div class="burst">0${T.length}</div><span class="eb" style="background:none;padding:0">Ticket / Modular</span><div style="font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:12px;margin-top:12px">Active teams</div><div class="big">${T.length}<small>Operational units</small></div><div class="dash"></div><span class="tag" style="background:var(--mint)">${cov===T.length?'All covered':'Gaps found'}</span><span class="mute">${cov} of ${T.length} teams have assigned brands</span></div></div>
<div class="g2"><div><div class="card" style="min-height:420px"><div style="display:flex;justify-content:space-between;align-items:center"><div><h2 style="display:inline">Brands per team</h2> <span class="pill lc" style="margin-left:8px">${T.length} teams</span></div><span class="mono mute">Radius 24px</span></div><p class="mute">Brands currently assigned to each team in the workspace.</p>
${T.map((t,i)=>`<div class="tb"><span style="display:flex;gap:10px;align-items:center;font-weight:600"><i style="width:10px;height:10px;border-radius:50%;background:${TD[i]};border:1px solid ${TC[i]}"></i>${t}</span><div class="bar"><i style="width:${Math.min(100,per[i]/2*100)}%;background:${TC[i]}"></i></div><span>${per[i]} brands</span><span class="mono mute">${Math.min(100,per[i]/2*100)}%</span></div>`).join('')}
<div class="sep" style="justify-content:space-between;margin-top:32px"><span class="mute">Total assigned brands: <b style="color:var(--ink)">${B.length-un}</b></span><span class="mute">Updated today</span></div></div></div>
<div><div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h2>Attention required</h2><span class="pill ${al.length?'wn':'ok'}">${al.length} alerts</span></div>
${al.length?al.map(a=>`<div class="note ${a[0]==='er'?'':'wn'}" style="${a[0]==='er'?'background:var(--eb);color:var(--et)':''};flex-direction:column;gap:2px"><b>${a[1]}</b><span style="font-weight:500">${a[2]}</span></div>`).join(''):'<div class="note ok"><b>✓</b><span>Every brand has a team assigned.</span></div>'}</div>
<div class="card dark"><div class="ring"></div><span class="tag">Agency shape DNA</span><span class="mono" style="display:block;color:#BDBCC4;margin-top:16px">A quick tip</span><h2>Make the silhouette do the branding.</h2><p>Balance workloads, not just seats. Spreading brand ownership evenly across teams keeps creative momentum high and avoids bottlenecks.</p></div></div></div>`}
function onboarding(){return `<div class="ph"><div><span class="eb">Client</span><span class="eb" style="background:var(--lilac);color:#17171C">GET /client-onboarding/:brandId</span><h1>Client onboarding</h1><p>The onboarding details we have for your brand.</p></div></div>
<div class="note"><b>ⓘ</b><span>Submitting answers is not available yet. This page is view-only.</span></div>
<div class="g2" style="grid-template-columns:1.4fr 1fr"><div class="card tk" style="overflow:visible"><span class="eb" style="background:var(--lilac);color:#17171C">Lumen Skincare</span><h2 style="font-size:28px;margin:8px 0 4px">Onboarding summary</h2><div class="dash"></div>
<dl class="kv" style="margin:0"><dt>Main category</dt><dd>Beauty & Personal Care</dd><dt>Activity type</dt><dd>E-commerce</dd><dt>Template version</dt><dd class="mono" style="font-size:13px">v2.1</dd><dt>Status</dt><dd>${pill('SUBMITTED')}</dd><dt>Submitted at</dt><dd class="mono" style="font-size:13px">2026-10-28 14:20</dd></dl></div>
<div class="card" style="background:var(--lilac);border-color:var(--lilac);color:#17171C"><div class="arch" style="background:#F2EFFF"><i style="background:var(--lilac)"></i></div><h2 style="margin-top:100px">What happens next</h2><p style="max-width:260px">Your account manager reviews your answers and prepares your brand brief.</p><button class="btn" disabled style="margin-top:16px;background:#fff">Submit answers</button></div></div>`}
function account(){const m=ME[S.role];return `<div class="ph"><div><span class="eb">${ROLES[S.role]}</span><span class="eb" style="background:var(--lilac);color:#17171C">GET /auth/me</span><span class="eb" style="background:var(--lilac);color:#17171C">POST /auth/change-password</span><h1>Profile & password</h1><p>Your account details and sign-in security.</p></div><button class="btn" onclick="logout()">Log out</button></div>
<div class="g2" style="grid-template-columns:1fr 1fr"><div class="card"><div style="display:flex;gap:16px;align-items:center"><div class="av" style="width:56px;height:56px;font-size:18px">${m[0].split(' ').map(x=>x[0]).join('')}</div><div><h2>${m[0]}</h2><span class="mute">${m[1]}</span></div></div>
<dl class="kv"><dt>Email</dt><dd>${m[0].split(' ')[0].toLowerCase()}@agency-clean.co</dd><dt>Role</dt><dd>${ROLES[S.role]}</dd><dt>Access</dt><dd>${S.role==='admin'?'Full access (bypasses permission checks)':'Granted by role permissions'}</dd><dt>Session</dt><dd><span class="pill ok">Signed in</span></dd></dl></div>
<div class="card"><h2>Change password</h2><p class="mute" style="margin:4px 0 20px">Use at least 8 characters.</p>${F('currentPassword','Current password','password')}${F('newPassword','New password','password','At least 8 characters')}<button class="btn p" onclick="chg()">Update password</button></div></div>`}
const F=(n,l,t='text',h='',v='')=>`<div class="fl ${S.err[n]?'bad':''}"><label>${l}<span>${n}</span></label>${t==='password'?`<div class="pw-wrap"><input data-f="${n}" type="password" value="${v}" autocomplete="current-password"><button type="button" class="pw-btn" onclick="togPw(this)" aria-label="Show password" title="Show password">${ic('eye')}</button></div>`:`<input data-f="${n}" type="${t}" value="${v}" autocomplete="off">`}${S.err[n]?`<small>${S.err[n]}</small>`:h?`<small>${h}</small>`:''}</div>`;
function togPw(b){const i=b.previousElementSibling,sh=i.type==='password';i.type=sh?'text':'password';b.innerHTML=ic(sh?'eyeOff':'eye');b.setAttribute('aria-label',sh?'Hide password':'Show password');b.title=sh?'Hide password':'Show password'}
function chg(){const v=Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i=>[i.dataset.f,i.value]));S.err={};if(!v.currentPassword)S.err.currentPassword='Enter your current password.';if((v.newPassword||'').length<8)S.err.newPassword='Use at least 8 characters.';if(Object.keys(S.err).length)return view(false);toast('Password updated')}
const PAGES={dashboard,onboarding,account};
/* forms */
function field(n,t,o,v){const r=S.err[n];const c=`<div class="fl ${r?'bad':''}"><label>${hum(n)}<span>${n}</span></label>`;const e=r?`<small>${r}</small>`:'</div>'.slice(0,0);
 let i;if(t==='textarea')i=`<textarea data-f="${n}">${v??''}</textarea>`;else if(t==='select')i=`<select data-f="${n}"><option value="">Select…</option>${o.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('')}</select>`;
 else if(t==='fk')i=`<input data-f="${n}" list="dl-${n}" placeholder="Search…" value="${v??''}"><datalist id="dl-${n}">${o.map(x=>`<option value="${x}">`).join('')}</datalist>`;
 else if(t==='switch')return `<div class="fl"><label>${hum(n)}<span>${n}</span></label><div class="sw"><input type="checkbox" data-f="${n}" data-b ${v!==false?'checked':''} id="sw"><label for="sw" style="font-weight:600">Active account</label></div></div>`;
 else if(t==='perms')return `<div class="fl" style="grid-column:1/-1"><label>Permissions<span>permissions[]</span></label><div style="display:flex;gap:8px;flex-wrap:wrap">${PERM.map(p=>`<label class="sw" style="font-weight:600"><input type="checkbox" data-pm="${p}" ${(v||[]).includes(p)?'checked':''}>${p}</label>`).join('')}</div><small>Only used for Employee accounts. Job title is never a permission.</small></div>`;
 else i=`<input data-f="${n}" type="${t}" value="${v??''}">`;return c+i+e+(r?'':'')+'</div>'}
function form(k,i){if(k==='users')return userForm(i);const E=D[k],r=i==null?{}:E.rows[i];return `<h2>${i==null?'New '+E.n:'Edit '+E.n}</h2><p class="mute" style="margin:0 0 20px">Fields use the exact API names.</p><div class="pg">${E.f.filter(f=>!(f[0]==='password'&&i!=null)).map(f=>field(f[0],f[1],f[2],r[f[0]])).join('')}</div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="save('${k}',${i})">Save ${E.n}</button></div>`}
function save(k,i){const E=D[k],o=Object.fromEntries([...document.querySelectorAll('.dlg [data-f]')].map(x=>[x.dataset.f,x.dataset.b!==undefined?x.checked:x.value]));
 const pm=[...document.querySelectorAll('[data-pm]:checked')].map(x=>x.dataset.pm);if(E.f.some(f=>f[0]==='permissions'))o.permissions=pm;
 S.err={};(E.req||[]).forEach(n=>{if(o[n]===''||o[n]==null)S.err[n]='This field is required.'});
 if(k==='users'&&o.email&&!S.err.email&&!/^\S+@\S+\.\S+$/.test(o.email))S.err.email='Enter a valid work email.';if(Object.keys(S.err).length){const ov=$('.ov');ov.innerHTML=`<div class="dlg">${form(k,i).replace(/value="[^"]*"/g,m=>m)}</div>`;{const rs=ov.querySelector('[data-f=roleId]');if(rs&&k==='users'){rs.value=o.roleId;roleCh(rs)}}ov.querySelectorAll('[data-f]').forEach(x=>{if(x.dataset.b!==undefined)x.checked=o[x.dataset.f];else x.value=o[x.dataset.f]??''});return}
 const inv=o.sendInvite;delete o.sendInvite;if(k==='users'&&i==null){o.isActive=true;o.teamId=o.teamId||'—'}
 if(i==null){if(S.brand&&!o.brandId&&['files','platform','briefs'].includes(k))o.brandId=S.brand;E.rows.unshift(o)}else Object.assign(E.rows[i],o);close();toast(k==='users'&&i==null?(inv?'User added · invitation sent':'User added'):i==null?'Saved':'Changes saved');view(false)}
function detail(k,r){const E=D[k];return `<h2>${E.t.replace(/s$/,'')} details</h2><dl class="kv">${Object.entries(r).filter(([a])=>a!=='content').map(([a,v])=>`<dt>${hum(a)}</dt><dd>${a==='status'||a==='isActive'?pill(v):Array.isArray(v)?v.join(', '):v}</dd>`).join('')}</dl>${r.content?`<div class="mono mute" style="margin-bottom:8px">content (JSON)</div><pre>${JSON.stringify(r.content,null,2)}</pre>`:''}<div class="ft"><button class="btn p" onclick="closeM()">Close</button></div>`}
function act(k,i,a){S.err={};const E=D[k];if(k==='brands'&&a==='view'){S.brand=E.rows[i].name;S.sub=null;S.q='';return render(false)}if(a==='new')return modal(`<div class="dlg">${form(k,null)}</div>`);const r=E.rows[i];
 if(a==='view')return modal(`<div class="dlg">${detail(k,r)}</div>`);if(a==='edit')return modal(`<div class="dlg">${form(k,i)}</div>`);
 if(a==='del')return modal(`<div class="dlg"><h2>Delete this ${E.n}?</h2><p class="mute">This can’t be undone.</p><div class="ft"><button class="btn" onclick="closeM()">Keep it</button><button class="btn p" style="background:var(--et);border-color:var(--et)" onclick="E_del('${k}',${i})">Delete ${E.n}</button></div></div>`);
 E.run(a,r);view(false)}
function E_del(k,i){D[k].rows.splice(i,1);close();toast('Deleted');view(false)}
function gen(){D.briefs.rows.unshift({brandId:BR[Math.floor(Math.random()*4)],version:'v'+(D.briefs.rows.length+1),status:'GENERATING',updatedAt:'2026-11-16',content:{}});toast('Generating a new brief…');view(false)}
/* shell */
function go(p){S.page=p;S.q='';S.open=false;S.err={};render()}
function setRole(r){S.role=r;S.page=NAV[r][0];S.q='';render()}
function logout(){S.authed=false;S.auth='login';render()}
function view(sk=true){const v=$('#view');if(!v)return;if(S.role==='client')S.brand=CLIENT_BRAND;const k=S.page,f=()=>{v.innerHTML=PAGES[k]?PAGES[k]():listPage(k)};if(sk){v.innerHTML='<div class="sk" style="width:40%;height:34px"></div><div class="sk" style="width:60%"></div><div class="card"><div class="sk"></div><div class="sk"></div><div class="sk"></div></div>';setTimeout(f,260)}else f()}
function render(){const a=$('#app');if(!S.authed){a.innerHTML=authView();return}
 const m=ME[S.role],nav=NAV[S.role];
 a.innerHTML=`<aside class="side ${S.open?'open':''}"><div class="logo"><i></i><div><b>ORVIA</b><small>${ROLES[S.role]}</small></div></div><div class="nl">Workspace</div><nav class="nav">${nav.map(p=>`<button class="${S.page===p?'on':''}" onclick="go('${p}')">${ic(N[p][1])}${N[p][0]}${p==='notifications'?'<span class="dot"></span>':''}</button>`).join('')}</nav>
 <div class="sf">${S.role==='emp'?`<div class="mini"><div class="mono mute" style="margin-bottom:8px">UserPermission</div>${PERM.map(p=>`<label style="display:flex;gap:8px;align-items:center;font-size:12px;font-weight:600;padding:3px 0"><input type="checkbox" ${S.p[p]?'checked':''} onchange="S.p['${p}']=this.checked;render()" style="accent-color:#17171C">${p}</label>`).join('')}</div>`:S.role==='admin'?`<div class="mini"><div class="mono mute">SETUP PROGRESS</div><div style="display:flex;justify-content:space-between;margin:4px 0 8px"><b>43%</b><span class="mute">complete</span></div><div class="bar"><i style="width:43%"></i></div></div>`:''}
 <div class="me"><div class="av">${m[0].split(' ').map(x=>x[0]).join('')}</div><div style="min-width:0"><b>${m[0]}</b><div class="mute" style="font-size:12px">${m[1]}</div></div></div></div></aside>
 <main><header class="top"><button class="btn sm t menu" onclick="S.open=!S.open;render()" aria-label="Menu">☰</button><div class="crumb">Agency workspace / <b>${N[S.page][0]}</b></div><label class="search">${ic('search')}<input placeholder="Search this page…" value="${S.q}" oninput="S.q=this.value;view(false)"></label><div class="seg" role="group" aria-label="Preview role">${Object.entries(ROLES).map(([k,v])=>`<button class="${S.role===k?'on':''}" onclick="setRole('${k}')">${v}</button>`).join('')}</div></header><section id="view"></section></main>`;
 view();const si=$('.search input');}
/* auth */
function authView(){const a=S.auth,E=S.err;const login=`<h1>Welcome back</h1><p class="mute" style="margin:8px 0 20px">Sign in to your ORVIA workspace.</p><div class="mono mute" style="margin-bottom:6px">PREVIEW AS</div><div class="rolechips">${Object.entries(ROLES).map(([k,v])=>`<button class="${S.role===k?'on':''}" onclick="S.role='${k}';render()">${v}</button>`).join('')}</div>${F('email','Email','email','','')}${F('password','Password','password')}<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px"><a class="lk" onclick="S.auth='forgot';S.err={};render()">Forgot password?</a><button class="btn p" onclick="doLogin()">Sign in</button></div>`;
 const forgot=`<h1>Reset your password</h1><p class="mute" style="margin:8px 0 20px">Enter your email and we’ll send a reset link.</p>${S.sent?'<div class="note ok"><b>✓</b><span>Check your inbox. If the email exists, a reset link is on its way.</span></div>':''}${F('email','Email','email')}<div style="display:flex;gap:8px;align-items:center"><button class="btn p" onclick="S.sent=1;S.err={};render()">Send reset link</button><a class="lk" onclick="S.auth='reset';S.sent=0;render()">I have a token</a></div><p><a class="lk" onclick="S.auth='login';S.sent=0;render()">Back to sign in</a></p>`;
 const reset=`<h1>Choose a new password</h1><p class="mute" style="margin:8px 0 20px">Paste the token from your email.</p>${F('token','Reset token','text')}${F('newPassword','New password','password','At least 8 characters')}<button class="btn p" onclick="S.auth='login';render();toast('Password reset. Sign in again.')">Reset password</button><p><a class="lk" onclick="S.auth='login';render()">Back to sign in</a></p>`;
 return `<div class="auth"><div class="al"><div class="logo"><i></i><div><b>ORVIA</b><small>Studio workspace</small></div></div>${{login,forgot,reset}[a]}</div><div class="ar"><div class="ring" style="position:absolute;right:-60px;top:-60px;width:260px;height:260px;border-radius:50%;border:1px solid #3A3A44"></div><span class="tag" style="background:transparent;color:#F4F3EF;border-color:#55555E;width:max-content">Agency shape DNA</span><div><h2>Make the silhouette do the branding.</h2><div class="shapes"><div style="width:64px;height:84px;background:var(--lilac);border-radius:32px 32px 0 0"></div><div style="width:84px;height:84px;border-radius:50%;border:1px solid #6E6D72;display:grid;place-items:center"><i style="width:22px;height:22px;border-radius:50%;background:var(--peach)"></i></div><div style="width:76px;height:84px;background:var(--mint);border-radius:0 38px 38px 0"></div><div class="burst" style="position:static;width:76px;height:76px;background:var(--peach)">12</div></div></div></div></div>`}
function doLogin(){const v=Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i=>[i.dataset.f,i.value]));S.err={};if(!v.email)S.err.email='Enter your email.';if(!v.password)S.err.password='Enter your password.';
 if(Object.keys(S.err).length)return render();S.authed=true;S.page=NAV[S.role][0];render()}
/* ===== v2: brand workspace, strategy flow, content plans, role-based tasks ===== */
const closeM=()=>document.querySelectorAll('.ov').forEach(o=>o.remove());
const CLIENT_BRAND='Lumen Skincare',EMP=['Lina Aziz','Karim Fouad','Mona Saeed'],TS2=['TODO','IN_PROGRESS','REVIEW','DONE'];
const MEN={admin:'Elena Vance',am:'Omar Haddad',cc:'Lina Aziz',emp:'Karim Fouad',client:'Sara Nabil'};
let IDN=10;
const STR={'Lumen Skincare':{st:'client',v:1,file:'q4-growth-strategy-v1.pdf',reason:'',log:['v1 uploaded · Content Creator','Sent to the Account Manager · Content Creator','Sent to the client · Account Manager']},
'Nord Coffee':{st:'am',v:1,file:'subscription-launch-v1.pdf',reason:'',log:['v1 uploaded · Content Creator','Sent to the Account Manager · Content Creator']}};
const sg=b=>STR[b]||(STR[b]={st:'none',v:0,reason:'',log:[]});
const PLANS=[{id:1,brand:'Lumen Skincare',title:'Nov · Lumen Skincare',month:'Nov 2026',campaigns:[{name:'Winter Glow',objective:'Drive holiday gift-set sales'}],items:[
{id:2,title:'Serum routine reel',type:'REEL',campaign:'Winter Glow',date:'2026-11-21',assignee:'Lina Aziz',priority:'HIGH',status:'IN_PROGRESS'},
{id:3,title:'Gift-set carousel',type:'CAROUSEL',campaign:'Winter Glow',date:'2026-11-24',assignee:'Karim Fouad',priority:'MEDIUM',status:'TODO'},
{id:4,title:'Founder story',type:'STORY',campaign:'—',date:'2026-11-27',assignee:'',priority:'MEDIUM',status:'TODO'}]}];
const TASKS=[{title:'Design serum reel cover',brand:'Lumen Skincare',priority:'HIGH',assignee:'Lina Aziz',deadline:'2026-11-15',status:'IN_PROGRESS',by:'Omar Haddad'},
{title:'Write captions',brand:'Lumen Skincare',priority:'MEDIUM',assignee:'Karim Fouad',deadline:'2026-11-19',status:'TODO',by:'Omar Haddad'},
{title:'Media buying brief',brand:'Nord Coffee',priority:'LOW',assignee:'Omar Haddad',deadline:'2026-11-22',status:'TODO',by:'Elena Vance'}];
const lab=x=>x.replace('_',' ').toLowerCase().replace(/^./,c=>c.toUpperCase());
/* generic small form */
function ask(t,fs,cb){window._cb=cb;modal(`<div class="dlg"><h2>${t}</h2><div class="pg" style="margin-top:16px">${fs.map(([n,l,ty,o])=>ty==='select'?`<div class="fl"><label>${l}</label><select data-f="${n}">${o.map(x=>`<option>${x}</option>`).join('')}</select></div>`:ty==='textarea'?`<div class="fl" style="grid-column:1/-1"><label>${l}</label><textarea data-f="${n}"></textarea></div>`:`<div class="fl"><label>${l}</label><input data-f="${n}" type="${ty||'text'}"></div>`).join('')}</div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="askOk()">Save</button></div></div>`)}
function askOk(){const v=Object.fromEntries([...document.querySelectorAll('.dlg [data-f]')].map(x=>[x.dataset.f,x.value]));if(!(v.title||'').trim())return toast('Title is required');closeM();_cb(v);toast('Saved');render(false)}
/* shell */
function go(p){S.page=p;S.q='';S.open=false;S.err={};S.brand=null;S.sub=null;render()}
function setRole(r){S.role=r;S.page=NAV[r][0];S.q='';S.brand=null;S.sub=null;render()}
function view(sk=true){const v=$('#view');if(!v)return;if(S.role==='client')S.brand=CLIENT_BRAND;const f=()=>{v.innerHTML=S.page==='brands'&&S.brand?brandPage():PAGES[S.page]?PAGES[S.page]():listPage(S.page)};if(sk){v.innerHTML='<div class="sk" style="width:40%;height:34px"></div><div class="card"><div class="sk"></div><div class="sk"></div></div>';setTimeout(f,200)}else f()}
function render(sk=true){const a=$('#app');if(!S.authed){a.innerHTML=authView();return}
const m=ME[S.role],nav=NAV[S.role],un=D.notifications.rows.filter(n=>!n.isRead).length,ini=m[0].split(' ').map(x=>x[0]).join('');
a.innerHTML=`<aside class="side ${S.open?'open':''}"><div class="logo"><i></i><div><b>ORVIA</b><small>${ROLES[S.role]}</small></div></div><nav class="nav">${nav.map(p=>(p==='tasks'?'<div class="nl" style="margin:18px 0 6px">Execution &amp; Review</div>':'')+`<button class="${S.page===p?'on':''}" onclick="go('${p}')">${ic(N[p][1])}${N[p][0]}</button>`).join('')}</nav>
<div class="sf"><div class="me"><div class="av">${ini}</div><div style="min-width:0"><b>${m[0]}</b><div class="mute" style="font-size:12px">${m[1]}</div></div></div></div></aside>
<main><header class="top"><button class="btn sm t menu" onclick="S.open=!S.open;render(false)" aria-label="Menu">☰</button><label class="search">${ic('search')}<input placeholder="Search this page…" value="${S.q}" oninput="S.q=this.value;view(false)"></label>
<div class="seg" role="group" aria-label="Preview role">${Object.entries(ROLES).map(([k,v])=>`<button class="${S.role===k?'on':''}" onclick="setRole('${k}')">${v}</button>`).join('')}</div>
<button class="btn sm t" onclick="go('notifications')" aria-label="Notifications" style="position:relative;width:38px;height:38px;padding:0;justify-content:center;border-radius:50%">${ic('bell')}${un?`<span style="position:absolute;top:-5px;right:-5px;background:#6B5FC7;color:#fff;border-radius:99px;font-size:10px;min-width:18px;height:18px;display:grid;place-items:center">${un}</span>`:''}</button>
<div style="display:flex;gap:10px;align-items:center"><div style="text-align:right;line-height:1.25"><b>${m[0]}</b><div class="mute" style="font-size:12px">${ROLES[S.role]}</div></div><div class="av" style="background:var(--lilac)">${ini}</div></div></header><section id="view"></section></main>`;view(sk)}
/* brand workspace */
function brandPage(){if(S.role==='client')return clientBrand();const i=D.brands.rows.findIndex(x=>x.name===S.brand);if(i<0){S.brand=null;return listPage('brands')}
const b=D.brands.rows[i],R=S.role,s=sg(b.name),n=k=>D[k].rows.filter(r=>r.brandId===b.name).length,ps=PLANS.filter(p=>p.brand===b.name),it=ps.reduce((a,p)=>a+p.items.length,0);
if(S.sub)return subPage(b);
const np=n('platform'),T4=[['brief','Brand Brief','doc','Client data, the collected Q&A and every brief version.',n('briefs')+' versions','var(--peach)'],
['strategy','Content Strategy','bolt','The approved strategy file, review and approval workflow.',s.v+' version'+(s.v===1?'':'s'),'var(--lilac)'],
['content','Content Management','cal','Content plans, campaigns and content items.',ps.length+' plan'+(ps.length===1?'':'s')+' · '+it+' items','var(--sky)'],
['files','Files & Assets','file','Logo, visual identity, videos, designs and the rest of the library.',n('files')+' files','var(--peach)'],
['platforms','Social Media Platforms','link','Each channel with its content plans, campaigns and content items.',np+' platforms','var(--lilac)']].filter(t=>!['content','files'].includes(t[0])&&(R!=='client'||t[0]==='strategy'));
const own=R==='admin'||R==='am';
return `<button class="btn sm" onclick="S.brand=null;view(false)" style="margin-bottom:16px">← All brands</button>
<div class="bh"><div class="lg">${b.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div style="flex:1;min-width:220px"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h1 style="font-size:26px">${b.name}</h1>${pill(b.status)}</div><div class="mute" style="font-size:13px">${b.industry} · ${b.teamId} · Account manager: ${b.accountManagerId}<br>${np?np+' social platform'+(np===1?'':'s')+' connected.':'No social platforms yet.'}</div></div>
${own?`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" style="border-radius:99px;border-color:var(--ink)" onclick="act('brands',${i},'edit')">Edit Brand</button><button class="btn sm" style="border-radius:99px;border-color:var(--ink)" onclick="arch(${i})">Archive Brand</button><button class="btn sm" style="border-radius:99px;color:#B5391B;border-color:#E9A494" onclick="delB(${i})">Delete Brand</button></div>`:''}</div>
<div class="mono mute" style="text-transform:uppercase;margin-bottom:8px">Brand workspace</div><p style="margin:0 0 16px">Everything about ${b.name} in one place.</p>
<div class="tiles">${T4.map(t=>`<button class="tile" style="background:${t[5]}" onclick="S.sub='${t[0]}';S.q='';view(false)"><span class="ti">${ic(t[2])}</span><b>${t[1]}</b><span style="color:#45454d">${t[3]}</span><span class="cnt">${t[4]}</span></button>`).join('')}</div>`}
function arch(i){D.brands.rows[i].status='ARCHIVED';toast('Brand archived');view(false)}
function delB(i){modal(`<div class="dlg"><h2>Delete this brand?</h2><p class="mute">This can’t be undone.</p><div class="ft"><button class="btn" onclick="closeM()">Keep it</button><button class="btn p" style="background:var(--et);border-color:var(--et)" onclick="D.brands.rows.splice(${i},1);S.brand=null;closeM();toast('Brand deleted');view(false)">Delete brand</button></div></div>`)}
function subPage(b){const k=S.sub,map={brief:'briefs',files:'files',platforms:'platform'},nm={brief:'Brand Brief',strategy:'Content Strategy',content:'Platforms',files:'Files & Assets',platforms:'Social Media Platforms'};
return `<div style="display:flex;gap:12px;align-items:center;margin-bottom:20px;flex-wrap:wrap"><button class="btn sm" onclick="S.sub=null;S.q='';view(false)">← ${b.name}</button><span class="mute">${nm[k]}</span></div>`+(k==='strategy'?stratPage():k==='content'?contentPage():listPage(map[k]))}
/* strategy flow: CC upload → AM → client → AM → CC */
function stratPage(){const b=S.brand,s=sg(b),R=S.role,ap=s.out==='approved',cur={none:0,uploaded:0,am:1,client:2,answered:3,forwarded:ap?5:3}[s.st];
if(R==='client'&&['none','uploaded','am'].includes(s.st))return `<div class="card empty"><span class="chip">${ic('bolt')}</span><h2>Nothing to review yet</h2><p class="mute">Your account manager will share the strategy with you when it is ready.</p></div>`;
const L={none:['No strategy uploaded yet','er'],uploaded:['Uploaded · not sent yet','lc'],am:['With the Account Manager','wn'],client:['Waiting for the client’s decision','in'],answered:[(ap?'Client approved':'Client rejected')+' · waiting for the Account Manager','wn'],forwarded:[ap?'Approved · content plan unlocked':'Rejected · a new version is needed',ap?'ok':'er']}[s.st];
const nx={none:'The Content Creator uploads the strategy file.',uploaded:'The Content Creator sends it to the Account Manager.',am:'The Account Manager downloads it and sends it to the client.',client:'The client downloads it, then approves or rejects with a reason.',answered:'The Account Manager forwards the client’s answer to the Content Creator.',forwarded:ap?'The Content Creator can now build the content plan.':'The Content Creator uploads a revised version.'}[s.st];
const B=(l,f,c='')=>`<button class="btn ${c}" onclick="${f}">${l}</button>`,up=l=>`<label class="btn ${l[0]==='U'?'p':''}" style="cursor:pointer">${l}<input type="file" hidden onchange="upS(this)"></label>`;
const a=[];if(R==='cc'){if(s.st==='none'||(s.st==='forwarded'&&!ap))a.push(up('Upload strategy'));if(s.st==='uploaded')a.push(B('Send to Account Manager',"sgo('send')",'p'),up('Replace file'));if(s.st==='forwarded'&&ap)a.push(B('Open content plan',"S.sub='platforms';view(false)",'p'))}
if(R==='am'){if(s.st==='am')a.push(B('Send to client',"sgo('client')",'p'));if(s.st==='answered')a.push(B('Send response to Content Creator',"sgo('fwd')",'p'))}
if(R==='client'&&s.st==='client')a.push(B('Approve',"sgo('approve')",'p'));
const dl=s.file&&((R==='cc')||(R==='am'&&s.st!=='uploaded')||(R==='client'));if(dl)a.unshift(B('Download',"dlS()",'t'));
return `<div class="ph"><div><span class="eb">${ROLES[R]}</span><h1>Content Strategy</h1><p>${b} · ${nx}</p></div></div>
${R==='admin'?'<div class="note wn"><b>🔒</b><span>View-only for your role.</span></div>':''}
<div class="card" style="margin-bottom:16px"><div style="display:flex;gap:8px;flex-wrap:wrap">${['Upload','Account Manager','Client review','Decision','Content plan'].map((x,i)=>`<span class="pill" style="background:${i<cur?'var(--ink)':i===cur?'var(--lilac)':'var(--mist)'};color:${i<cur?'#fff':'var(--ink)'}">${x}</span>`).join('')}</div>
<div class="dash"></div><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><div><b>${s.file||'No file yet'}</b><div class="mute">${s.v?'Version '+s.v:''}</div></div><span class="pill ${L[1]}">${L[0]}</span></div>
${s.reason&&s.out==='rejected'?`<div class="note wn" style="margin:16px 0 0;flex-direction:column;gap:2px"><b>Client’s reason for rejecting</b><span style="font-weight:500">${s.reason}</span></div>`:''}
${R==='client'&&s.st==='client'?`<div class="fl" style="margin:16px 0 0"><label>If you reject, tell us why</label><textarea id="rs" placeholder="What didn’t work for you?"></textarea><div>${B('Reject with reason',"sgo('reject')",'dg')}</div></div>`:''}
${a.length?`<div class="sep">${a.join('')}</div>`:''}</div>
<div class="card"><h2 style="margin-bottom:8px">History</h2>${s.log.length?s.log.map(x=>`<div style="padding:8px 0;border-top:1px solid var(--line)">${x}</div>`).join(''):'<p class="mute">No activity yet.</p>'}</div>`}
function upS(inp){const f=inp.files[0];if(!f)return;const s=sg(S.brand);s.v++;s.file=f.name;s.url=URL.createObjectURL(f);s.st='uploaded';s.out=null;s.reason='';s.log.push('v'+s.v+' uploaded · '+ROLES[S.role]);toast('Strategy uploaded');render(false)}
function dlS(){const s=sg(S.brand),a=document.createElement('a');a.href=s.url||URL.createObjectURL(new Blob(['Demo placeholder for '+s.file+' ('+S.brand+')'],{type:'text/plain'}));a.download=s.url?s.file:s.file+'.txt';a.click();toast('Downloading '+s.file)}
function sgo(a){const s=sg(S.brand);let m;
if(a==='send'){s.st='am';m='Sent to the Account Manager'}else if(a==='client'){s.st='client';m='Sent to the client'}
else if(a==='approve'){s.st='answered';s.out='approved';s.reason='';m='Client approved · Account Manager notified'}
else if(a==='reject'){const r=($('#rs')||{}).value||'';if(!r.trim())return toast('Please write why you rejected it');s.st='answered';s.out='rejected';s.reason=r.trim();m='Client rejected · Account Manager notified'}
else{s.st='forwarded';m='Response sent to the Content Creator'}
s.log.push(m+' · '+ROLES[S.role]);D.notifications.rows.unshift({title:S.brand+': '+m,createdAt:'just now',isRead:false});toast(m);render(false)}
/* content management: plans → campaigns → items */
function contentPage(){const b=S.brand,s=sg(b);
if(!(s.st==='forwarded'&&s.out==='approved'))return `<div class="card empty"><span class="chip">${ic('lock')}</span><h2>Content plans are locked</h2><p class="mute">They open once the client approves the strategy and the Account Manager shares the decision with the Content Creator.</p></div>`;
const R=S.role,cc=R==='cc',am=R==='am',ps=PLANS.filter(p=>p.brand===b);
const sel=(id,k,o,v)=>`<select style="border:1px solid var(--line);border-radius:10px;padding:5px 8px;background:#fff" onchange="setIt(${id},'${k}',this.value)">${o.map(x=>`<option value="${x}" ${x===v?'selected':''}>${k==='status'?lab(x):x}</option>`).join('')}</select>`;
return `<div class="ph"><div><span class="eb">${ROLES[R]}</span><h1>Content Management</h1><p>${cc?'Build the plan: campaigns and content items.':am?'Assign each content item to someone, set its priority and status.':'View-only for your role.'}</p></div>${cc?`<button class="btn p" onclick="newPlan()">+ New plan</button>`:''}</div>`+
(ps.length?ps.map(p=>`<div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><div><h2>${p.title}</h2><span class="mute">${p.month}</span></div>${cc?`<div style="display:flex;gap:8px"><button class="btn sm" onclick="newCamp(${p.id})">+ Campaign</button><button class="btn sm p" onclick="newItem(${p.id})">+ Content item</button></div>`:''}</div>
<div style="margin:14px 0">${p.campaigns.length?p.campaigns.map((c,ci)=>`<span class="tag lc" style="cursor:pointer" onclick="openD({t:'camp',p:${p.id},n:${ci}})" title="${c.objective||''}">${c.name}</span>`).join(''):'<span class="mute">No campaigns yet.</span>'}</div>
${p.items.length?`<div class="tw"><table><thead><tr><th>Item</th><th>Type</th><th>Platform</th><th>Campaign</th><th>Date</th><th>Assigned to</th><th>Priority</th><th>Status</th></tr></thead><tbody>${p.items.map(i=>`<tr><td><b><a class="lk" onclick="openD({t:'item',id:${i.id}})">${esc(i.title)}</a></b></td><td><span class="tag">${i.type}</span></td><td>${i.platform?esc(i.platform):'—'}</td><td>${i.campaign||'—'}</td><td><span class="mono">${i.date||'—'}</span></td><td>${am?sel(i.id,'assignee',['Unassigned',...EMP],i.assignee||'Unassigned'):i.assignee||'—'}</td><td>${am?sel(i.id,'priority',PR,i.priority):pill(i.priority)}</td><td>${am?sel(i.id,'status',TS2,i.status):pill(i.status)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mute">No content items yet.</p>'}</div>`).join(''):`<div class="card empty"><span class="chip">${ic('cal')}</span><h2>No plan yet</h2><p class="mute">${cc?'Create the first content plan for this brand.':'The Content Creator has not started the plan.'}</p></div>`)}
const pl=id=>PLANS.find(p=>p.id===id);
function newPlan(){ask('New content plan',[['title','Plan title'],['month','Month']],v=>PLANS.push({id:++IDN,brand:S.brand,title:v.title,month:v.month||'',campaigns:[],items:[]}))}
function newCamp(id){ask('New campaign',[['title','Campaign name'],['objective','Objective','textarea']],v=>pl(id).campaigns.push({name:v.title,objective:v.objective}))}
function newItem(id){const p=pl(id);ask('New content item',[['title','Title'],['type','Type','select',['POST','REEL','STORY','CAROUSEL']],['campaign','Campaign','select',['—',...p.campaigns.map(c=>c.name)]],['platform','Platform','select',['Unassigned',...D.platform.rows.filter(r=>r.brandId===p.brand).map(r=>r.accountName)]],['date','Scheduled date','date']],v=>p.items.push({id:++IDN,title:v.title,type:v.type,campaign:v.campaign,platform:v.platform==='Unassigned'?'':v.platform,date:v.date,assignee:'',priority:'MEDIUM',status:'TODO'}))}
function setIt(id,k,v){PLANS.forEach(p=>p.items.forEach(i=>{if(i.id===id)i[k]=v==='Unassigned'?'':v}));toast('Updated');view(false)}
/* tasks: everyone sees the page, each role sees/does different things */
let _tv=[];
const allT=()=>[...TASKS,...PLANS.flatMap(p=>p.items.filter(i=>i.assignee).map(i=>({title:i.title,brand:p.brand,priority:i.priority,assignee:i.assignee,deadline:i.date,status:i.status,by:MEN.am,ref:i})))];
function tasksPage(){const R=S.role,me=MEN[R],a=allT();_tv=R==='admin'?a:R==='am'?a.filter(t=>t.assignee===me||t.by===me):a.filter(t=>t.assignee===me);
const q=S.q.toLowerCase(),ed=R!=='admin',rows=_tv.map((t,i)=>({t,i})).filter(({t})=>[t.title,t.brand,t.assignee].join(' ').toLowerCase().includes(q));
const sub=R==='admin'?'Every task and its details. You can read them and create new ones, nothing else.':R==='am'?'Your tasks, plus the ones you assigned. You can create new tasks.':'Only the tasks assigned to you. You can update their status.';
return `<div class="ph"><div><span class="eb">${ROLES[R]}</span><h1>Tasks</h1><p>${sub}</p></div>${R==='admin'||R==='am'?`<button class="btn p" onclick="newTask()">+ New task</button>`:''}</div>`+
(rows.length?`<div class="card" style="padding:20px 12px"><div class="tw"><table><thead><tr><th>Task</th><th>Brand</th><th>Assigned to</th><th>Priority</th><th>Deadline</th><th>Status</th></tr></thead><tbody>${rows.map(({t,i})=>`<tr><td><b>${t.title}</b></td><td>${t.brand}</td><td>${t.assignee}</td><td>${pill(t.priority)}</td><td><span class="mono">${t.deadline||'—'}</span></td><td>${ed?`<select style="border:1px solid var(--line);border-radius:10px;padding:5px 8px;background:#fff" onchange="setTS(${i},this.value)">${TS2.map(x=>`<option value="${x}" ${x===t.status?'selected':''}>${lab(x)}</option>`).join('')}</select>`:pill(t.status)}</td></tr>`).join('')}</tbody></table></div></div>`:`<div class="card empty"><span class="chip">${ic('check')}</span><h2>No tasks</h2><p class="mute">Nothing is assigned to you right now.</p></div>`)}
function setTS(i,v){const t=_tv[i];t.status=v;if(t.ref)t.ref.status=v;toast('Status updated');view(false)}
function newTask(){ask('New task',[['title','Title'],['brand','Brand','select',BR],['assignee','Assign to','select',[...EMP,'Omar Haddad']],['priority','Priority','select',PR],['deadline','Deadline','date']],v=>TASKS.unshift({...v,status:'TODO',by:MEN[S.role]}))}
PAGES.tasks=tasksPage;

/* ===== v3: add-user, client onboarding, client views ===== */
const ROLE_OPTS=['Account Manager','Content Creator','Creative','Team Leader','Client'];
const JOBS={'Account Manager':['Account Manager'],'Content Creator':['Content Creator'],'Creative':['Graphic Designer','Video Editor','Motion Designer'],'Team Leader':['Creative Team Leader','Content Team Leader','Accounts Team Leader'],'Client':['Client'],'Admin':['Workspace Owner']};
const RDESC={'Account Manager':'Own the client relationship, send strategies to the client and assign content work.','Content Creator':'Upload strategies, build content plans and create content items.','Creative':'Work on assigned tasks such as design, video and motion, and update their status.','Team Leader':'Supervise assigned team members, track deadlines, review work and manage team content.','Client':'View their own brand, complete onboarding and approve or reject the strategy.','Admin':'Full access to the workspace.'};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rdHtml=r=>r?`<b>${r}</b><span style="font-weight:500">${RDESC[r]||''}</span>`:'';
function roleCh(el){const r=el.value,j=document.querySelector('.dlg [data-f=jobTitleId]'),o=JOBS[r]||[];j.innerHTML='<option value="">'+(r?'Select a Job Title':'Select a role first')+'</option>'+o.map(x=>`<option>${x}</option>`).join('');if(o.length===1)j.value=o[0];const d=document.getElementById('rd');if(d)d.innerHTML=rdHtml(r)}
function userForm(i){const E=D.users,r=i==null?{}:E.rows[i],rl=r.roleId||'',opts=!rl||ROLE_OPTS.includes(rl)?ROLE_OPTS:[...ROLE_OPTS,rl];
const bad=n=>S.err[n]?'bad':'',msg=n=>S.err[n]?`<small>${S.err[n]}</small>`:'',lb=t=>`<label><b style="font-weight:600">${t} <em style="color:var(--et);font-style:normal">*</em></b></label>`;
return `<h2>${i==null?'Add user':'Edit user'}</h2><p class="mute" style="margin:0 0 20px">${i==null?'Create the account and assign a role. The user sets their own password.':'Update this account.'}</p>
<div class="pg"><div class="fl ${bad('fullName')}">${lb('Full Name')}<input data-f="fullName" value="${esc(r.fullName)}" placeholder="e.g. Maya Lin">${msg('fullName')}</div><div class="fl ${bad('email')}">${lb('Work Email')}<input data-f="email" type="email" value="${esc(r.email)}" placeholder="name@agency-clean.co">${msg('email')}</div></div>
<div style="border-top:1px solid var(--line);margin:4px 0 16px;padding-top:20px"><h2 style="font-size:17px">Access &amp; role assignment</h2><p class="mute" style="margin:2px 0 16px">Set the user’s role, job title and team.</p>
<div class="pg"><div class="fl ${bad('roleId')}">${lb('Workspace Role')}<select data-f="roleId" onchange="roleCh(this)"><option value="">Select a role</option>${opts.map(x=>`<option ${x===rl?'selected':''}>${x}</option>`).join('')}</select>${msg('roleId')}</div>
<div class="fl ${bad('jobTitleId')}">${lb('Job Title')}<select data-f="jobTitleId"><option value="">${rl?'Select a Job Title':'Select a role first'}</option>${(JOBS[rl]||[]).map(x=>`<option ${x===r.jobTitleId?'selected':''}>${x}</option>`).join('')}</select>${msg('jobTitleId')}</div>
<div class="fl"><label>Team</label><select data-f="teamId"><option>—</option>${T.map(x=>`<option ${x===r.teamId?'selected':''}>${x}</option>`).join('')}</select></div></div>
<div class="rd" id="rd">${rdHtml(rl)}</div>
${i==null?`<label class="sw" style="align-items:flex-start;background:#FFEFE8;border-color:var(--peach)"><input type="checkbox" data-f="sendInvite" data-b checked style="margin-top:3px"><span><b>Send onboarding invitation email immediately</b><br><span class="mute" style="font-size:12px">The user receives a secure link, valid for 48 hours, to set up their account.</span></span></label>`:`<div class="sw"><input type="checkbox" data-f="isActive" data-b ${r.isActive!==false?'checked':''} id="sw"><label for="sw" style="font-weight:600">Active account</label></div>`}</div>
<div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="save('users',${i})">${i==null?'Add user':'Save changes'}</button></div>`}

/* client onboarding */
const CATS={'Food':['Cafe','Restaurant','Bakery'],'Beauty & Personal Care':['E-commerce','Salon','Clinic'],'Fitness':['Gym','Studio','Online coaching'],'Retail':['Fashion','Home goods','Grocery'],'Travel':['Agency','Hotel','Tour operator'],'Tech':['SaaS','Hardware','App']};
const OBS=[['Brand Information',[['q0','What is your brand name?',1],['q1','When was the brand founded?',1],['q2','Brand description',0,1]]],
['Products & Services',[['q3','What are your main products?',1],['q4','Which is your best seller?',1],['q5','Do you offer any services?',0,1]]],
['Target Audience',[['q6','Who is your target audience?',1],['q7','What age range do they fall in?',1],['q8','Where are your customers located?',0,1]]],
['Brand Goals',[['q9','What are your top 3 brand goals?',1],['q10','What does success look like in 12 months?',1],['q11','Any launch dates to plan for?',0,1]]],
['Competitors',[['q12','Who are your top competitors?',1],['q13','What do they do better than you?',1],['q14','What makes you different?',0,1]]],
['Brand Personality',[['q15','Describe your brand personality',1],['q16','Which 3 words describe your tone?',1],['q17','Any colors or styles you prefer?',0,1]]],
['Marketing Objectives',[['q18','What is your main marketing objective?',1],['q19','Which platforms matter most?',1],['q20','Monthly content volume you expect?',0,1]]]];
const OB={step:'category',cat:'Beauty & Personal Care',act:'E-commerce',sec:0,a:{},done:[],err:{},submitted:false};
const secSt=i=>OB.done.includes(i)?'done':OBS[i][1].some(q=>(OB.a[q[0]]||'').trim())?'inc':'none';
const obTop=(t,sub)=>`<div class="ph"><div><span class="eb">Client</span><h1>${t}</h1><p>${sub}</p></div></div>`,CRUMB=CLIENT_BRAND+' / Onboarding';
function obCat(){return obTop('Select category',CRUMB)+`<div class="card"><div class="pg"><div class="fl"><label>Main category</label><select onchange="OB.cat=this.value;OB.act=CATS[OB.cat][0];view(false)">${Object.keys(CATS).map(c=>`<option ${c===OB.cat?'selected':''}>${c}</option>`).join('')}</select></div><div class="fl"><label>Activity type</label><select onchange="OB.act=this.value">${CATS[OB.cat].map(a=>`<option ${a===OB.act?'selected':''}>${a}</option>`).join('')}</select></div></div><div class="ft"><button class="btn p" onclick="OB.step='form';view(false)">Continue</button></div></div>`}
function obForm(){const i=OB.sec,[t,qs]=OBS[i],pct=Math.round((i+1)/7*100);
return obTop('Onboarding form',CRUMB)+`<div class="obh"><div class="ban"><b>${t}</b><div class="mono mute">Section ${i+1} of 7</div></div><div style="text-align:right"><div class="mono mute" style="margin-bottom:6px">Progress: ${pct}%</div><div class="pbar"><i style="width:${pct}%"></i></div></div></div>
<div class="card">${qs.map(q=>{const e=OB.err[q[0]],v=esc(OB.a[q[0]]);return `<div class="fl ${e?'bad':''}"><label><b style="font-weight:600">${q[1]}</b></label>${q[2]?'<span class="mono" style="color:var(--et)">Required</span>':''}${q[3]?`<textarea placeholder="Your answer" oninput="OB.a['${q[0]}']=this.value">${v}</textarea>`:`<input placeholder="Your answer" value="${v}" oninput="OB.a['${q[0]}']=this.value">`}${e?'<small>This field is required.</small>':''}</div>`}).join('')}
<div class="ft"><button class="btn" onclick="OB.err={};OB.step='sections';view(false)">Form sections</button><button class="btn" onclick="toast('Draft saved')">Save draft</button><button class="btn p" onclick="obSubmit()">${i<6?'Save and continue':'Save section'}</button></div></div>`}
function obSubmit(){const i=OB.sec;OB.err={};OBS[i][1].forEach(q=>{if(q[2]&&!(OB.a[q[0]]||'').trim())OB.err[q[0]]=1});
if(Object.keys(OB.err).length){toast('Answer the required questions');return view(false)}
if(!OB.done.includes(i))OB.done.push(i);if(i<6){OB.sec=i+1;toast('Section saved')}else{OB.step='sections';toast('Last section saved')}view(false);window.scrollTo(0,0)}
function obSecs(){const d=OB.done.length,pct=Math.round(d/7*100),B={done:['ok','Done'],inc:['wn','Incomplete'],none:['','Not started']};
return obTop('Form sections',CRUMB)+`<div class="obh"><span class="mute">Progress: ${d} of 7 sections complete · ${pct}%</span><div class="pbar" style="width:240px"><i style="width:${pct}%"></i></div></div>
<div class="secg">${OBS.map((x,i)=>{const b=B[secSt(i)];return `<button class="secbtn" onclick="OB.sec=${i};OB.step='form';view(false)"><span>${x[0]}</span><span class="pill ${b[0]}">${b[1]}</span></button>`}).join('')}</div>
<div class="ft" style="margin-top:20px"><button class="btn" onclick="toast('Draft saved')">Save draft</button><button class="btn p" ${d<7?'disabled title="Complete all 7 sections first"':''} onclick="obFinish()">Submit onboarding</button></div>${d<7?'<p class="mute" style="text-align:right;margin:8px 0 0">Complete every section to submit.</p>':''}`}
function obFinish(){OB.submitted=true;D.notifications.rows.unshift({title:CLIENT_BRAND+': Client onboarding submitted',createdAt:'just now',isRead:false});toast('Submitted · Account Manager notified');render(false)}
function obDone(){return obTop('Onboarding',CRUMB)+`<div class="note ok"><b>✓</b><span>Submitted. Your account manager has been notified and will prepare your brand brief.</span></div><div class="card"><div style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><h2>Your answers</h2><span class="pill ok">Submitted</span></div><dl class="kv" style="margin:0 0 8px"><dt>Main category</dt><dd>${OB.cat}</dd><dt>Activity type</dt><dd>${OB.act}</dd></dl>${OBS.map(x=>`<div class="dash"></div><h2 style="font-size:16px">${x[0]}</h2><dl class="kv" style="margin:12px 0 0">${x[1].map(q=>`<dt>${q[1]}</dt><dd>${esc(OB.a[q[0]])||'—'}</dd>`).join('')}</dl>`).join('')}</div>`}
function obPage(){return OB.submitted?obDone():OB.step==='category'?obCat():OB.step==='sections'?obSecs():obForm()}
function clientBrand(){const b=D.brands.rows.find(x=>x.name===CLIENT_BRAND),s=sg(b.name),SL={none:'Not started',uploaded:'Being prepared',am:'Being prepared',client:'Waiting for your decision',answered:'Your answer was sent',forwarded:s.out==='approved'?'Approved':'Revision in progress'}[s.st];
return `<div class="ph"><div><span class="eb">Client</span><h1>Brands</h1><p>Your brand at a glance. This page is view-only.</p></div></div><div class="bh"><div class="lg">${b.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div style="flex:1"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h1 style="font-size:26px">${b.name}</h1>${pill(b.status)}</div><div class="mute">${b.industry}</div></div></div>
<div class="card"><dl class="kv" style="margin:0"><dt>Industry</dt><dd>${b.industry}</dd><dt>Account manager</dt><dd>${b.accountManagerId}</dd><dt>Onboarding</dt><dd>${OB.submitted?pill('SUBMITTED'):OB.done.length+' of 7 sections done'}</dd><dt>Strategy</dt><dd>${SL}</dd></dl></div>`}
PAGES.onboarding=obPage;PAGES.brief=()=>listPage('briefs');PAGES.strategy=()=>stratPage();PAGES.plans=()=>contentPage();

/* ===== v4: Tasks / My Work, Teams, Notifications, role dashboards ===== */
const TODAY='2026-11-18',TY={CREATION:'Content Creation',REVIEW:'Review',PUBLISH:'Publish',DIRECT:'Direct'},DONE4=['COMPLETED','CANCELLED'],ini2=n=>n.split(' ').map(x=>x[0]).join('');
NAV.cc=['dashboard','brands','tasks','account'];NAV.emp=['dashboard','tasks','account'];NAV.client.unshift('dashboard');
Object.defineProperty(N,'tasks',{get:()=>[S.role==='cc'||S.role==='emp'?'My Work':'Tasks','check']});
PL.ok.push('COMPLETED');PL.er.push('NEEDS_CHANGES','URGENT');PL.wn.push('IN_REVIEW');PL.lc.push('CANCELLED');
S.tw='mine';S.tv='rows';S.ts='all';
const C1=['Instagram','Nov plan','Winter Glow','Serum routine reel'],C2=['Instagram','Nov plan','Winter Glow','Gift-set carousel'];
const mk=(id,title,kind,status,priority,assignee,by,brand,ctx,planned,eff,desc,after)=>({id,title,kind,status,priority,assignee,by,brand,ctx,planned,eff,desc,after});
const TK=[mk(1,'Design serum reel cover','CREATION','IN_PROGRESS','HIGH','Lina Aziz','Omar Haddad','Lumen Skincare',C1,'2026-11-17','2026-11-17','Cover and first frame for the serum reel.'),
mk(2,'Review: Serum routine reel','REVIEW','TODO','HIGH','Omar Haddad','Omar Haddad','Lumen Skincare',C1,'2026-11-18','2026-11-19','Starts when the creator submits.',1),
mk(3,'Write captions','CREATION','NEEDS_CHANGES','MEDIUM','Karim Fouad','Omar Haddad','Lumen Skincare',C2,'2026-11-19','2026-11-19','Reviewer asked for a warmer tone.'),
mk(4,'Competitor research · Nord Coffee','DIRECT','TODO','URGENT','Karim Fouad','Omar Haddad','Nord Coffee',[],'2026-11-20','2026-11-20','Top 5 competitors and their posting cadence.'),
mk(5,'Media buying brief','DIRECT','IN_PROGRESS','LOW','Omar Haddad','Elena Vance','Nord Coffee',[],'2026-11-22','2026-11-22','Draft the budget split per platform.'),
mk(6,'Gift-set carousel','CREATION','SUBMITTED','MEDIUM','Lina Aziz','Omar Haddad','Lumen Skincare',C2,'2026-11-17','2026-11-17','Submitted for review.'),
mk(7,'Review: Gift-set carousel','REVIEW','IN_REVIEW','MEDIUM','Omar Haddad','Omar Haddad','Lumen Skincare',C2,'2026-11-18','2026-11-18','Approve or ask for changes.',6),
mk(8,'Update brand guide','DIRECT','COMPLETED','LOW','Lina Aziz','Omar Haddad','Lumen Skincare',[],'2026-11-12','2026-11-12','Done.')];
const isOd=t=>!DONE4.includes(t.status)&&t.eff<TODAY;
const dl=t=>`<span class="mono" style="${isOd(t)?'color:var(--et);font-weight:700':''}">${t.eff}</span>${t.eff!==t.planned?`<div class="mute" style="font-size:11px">planned ${t.planned}</div>`:''}`;
function tact(t){const R=S.role,mine=t.assignee===MEN[R],a=[];
 if(mine){if(t.status==='TODO'&&t.kind!=='REVIEW')a.push(['Start','IN_PROGRESS']);if(t.status==='NEEDS_CHANGES')a.push(['Resume','IN_PROGRESS']);
  if(t.status==='IN_PROGRESS')a.push(t.kind==='CREATION'?['Submit','SUBMITTED']:['Complete','COMPLETED']);if(t.status==='IN_REVIEW')a.push(['Approve','COMPLETED'],['Request changes','NEEDS_CHANGES'])}
 if((R==='admin'||R==='am')&&!DONE4.includes(t.status))a.push(['Cancel','CANCELLED']);return a}
function tset(id,s){const t=TK.find(x=>x.id===id),rv=TK.find(x=>x.after===id),c=t.after&&TK.find(x=>x.id===t.after);
 if(s==='SUBMITTED'&&rv){rv.status='IN_REVIEW';rv.eff=TODAY}
 if(c&&s==='COMPLETED')c.status='COMPLETED';if(c&&s==='NEEDS_CHANGES'){c.status='NEEDS_CHANGES';s='TODO'}
 t.status=s;toast('Task updated');closeM();view(false)}
const tbtn=t=>tact(t).map(a=>`<button class="btn sm ${a[1]==='CANCELLED'?'dg':''}" onclick="tset(${t.id},'${a[1]}')">${a[0]}</button>`).join('');
const ctxL=t=>[t.brand,...t.ctx].join(' → ');
function tdet(id){const t=TK.find(x=>x.id===id),w=t.after&&TK.find(x=>x.id===t.after);
 modal(`<div class="dlg"><h2>${esc(t.title)}</h2><div style="margin:8px 0">${pill(t.status)} ${pill(t.priority)} <span class="tag">${TY[t.kind]}</span></div><dl class="kv"><dt>Context</dt><dd>${esc(ctxL(t))}</dd><dt>Description</dt><dd>${esc(t.desc)||'—'}</dd><dt>Assigned to</dt><dd>${t.assignee}</dd><dt>Created by</dt><dd>${t.by}</dd><dt>Planned deadline</dt><dd>${t.planned}</dd><dt>Effective deadline</dt><dd>${dl(t)}</dd><dt>Waiting on</dt><dd>${w?esc(w.title)+' · '+lab(w.status):'Nothing'}</dd></dl><div class="ft"><button class="btn" onclick="closeM()">Close</button>${tbtn(t)}</div></div>`)}
function tasksPage(){const R=S.role,me=MEN[R],mgr=R==='admin'||R==='am',team=mgr&&S.tw==='team',q=S.q.toLowerCase(),
 base=TK.filter(t=>team?(R==='admin'||t.by===me||t.assignee===me):t.assignee===me),n=f=>base.filter(f).length,
 L=base.filter(t=>(S.ts==='all'||t.status===S.ts)&&[t.title,t.brand,t.assignee].join(' ').toLowerCase().includes(q)),
 st=[['Total',base.length],['Overdue',n(isOd),1],['In progress',n(t=>t.status==='IN_PROGRESS')],['Needs your action',n(t=>t.assignee===me&&['TODO','NEEDS_CHANGES','IN_REVIEW'].includes(t.status)),0],['Completed',n(t=>t.status==='COMPLETED')]],
 sg2=(k,v,l)=>`<div class="seg" style="margin:0">${l.map(x=>`<button class="${S[k]===x[0]?'on':''}" onclick="S.${k}='${x[0]}';view(false)">${x[1]}</button>`).join('')}</div>`;
 const row=t=>`<tr><td><b>${esc(t.title)}</b><div class="mute" style="font-size:12px">${esc(ctxL(t))}</div></td><td><span class="tag">${TY[t.kind]}</span></td><td>${t.assignee}</td><td>${pill(t.priority)}</td><td>${dl(t)}</td><td>${pill(t.status)}</td><td><div class="ra"><button class="btn sm t" onclick="tdet(${t.id})">Details</button>${tbtn(t)}</div></td></tr>`,
 card=t=>`<div class="card tc"><div style="display:flex;justify-content:space-between;gap:8px"><span class="tag lc">${TY[t.kind]}</span>${pill(t.status)}</div><b style="font-size:16px">${esc(t.title)}</b><span class="mute" style="font-size:12px">${esc(ctxL(t))}</span><div style="display:flex;justify-content:space-between;align-items:end;gap:8px"><div>${dl(t)}<div class="mute" style="font-size:12px">${t.assignee}</div></div>${pill(t.priority)}</div><div class="dash" style="margin:2px 0"></div><div class="ra" style="justify-content:flex-start;flex-wrap:wrap"><button class="btn sm t" onclick="tdet(${t.id})">Details</button>${tbtn(t)}</div></div>`;
 return `<div class="ph"><div><span class="eb">${ROLES[R]}</span><h1>${team?'Tasks':'My Work'}</h1><p>${team?'Who does what: assign, follow and re-assign your team’s work.':'What is required from me: only the tasks assigned to you.'}</p></div>${mgr?`<button class="btn p" onclick="newTask()">+ Direct task</button>`:''}</div>
<div class="tb2">${mgr?sg2('tw',0,[['mine','My Work'],['team','Team Tasks']]):''}${sg2('tv',0,[['rows','☰ Rows'],['cards','▦ Cards']])}<select aria-label="Status" onchange="S.ts=this.value;view(false)"><option value="all">All statuses</option>${['TODO','IN_PROGRESS','SUBMITTED','IN_REVIEW','NEEDS_CHANGES','COMPLETED','CANCELLED'].map(x=>`<option value="${x}" ${S.ts===x?'selected':''}>${lab(x)}</option>`).join('')}</select></div>
<div class="stats">${st.map(s=>`<div class="stat ${s[2]&&s[1]?'al':''}"><span class="mono mute">${s[0]}</span><b>${s[1]}</b></div>`).join('')}</div>`+
 (!L.length?`<div class="card empty"><span class="chip">${ic('check')}</span><h2>No tasks</h2><p class="mute">${team?'No tasks match.':'Nothing is assigned to you right now.'}</p></div>`:S.tv==='cards'?`<div class="cards">${L.map(card).join('')}</div>`:`<div class="card" style="padding:20px 12px"><div class="tw"><table><thead><tr><th>Task</th><th>Type</th><th>Assignee</th><th>Priority</th><th>Effective deadline</th><th>Status</th><th></th></tr></thead><tbody>${L.map(row).join('')}</tbody></table></div></div>`)}
function newTask(){const o=x=>x.map(v=>`<option>${v}</option>`).join('');modal(`<div class="dlg"><h2>New direct task</h2><p class="mute" style="margin:0 0 16px">Not linked to a content item. It starts as TODO and appears in the assignee’s My Work.</p><div class="pg"><div class="fl" style="grid-column:1/-1"><label>Title *</label><input id="dt1"></div><div class="fl" style="grid-column:1/-1"><label>Description</label><textarea id="dt2"></textarea></div><div class="fl"><label>Assigned to *</label><select id="dt3">${o(EMP)}</select></div><div class="fl"><label>Priority</label><select id="dt4">${o(['LOW','MEDIUM','HIGH','URGENT'])}</select></div><div class="fl"><label>Planned deadline *</label><input id="dt5" type="date"></div></div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="saveTask()">Create task</button></div></div>`)}
function saveTask(){const g=i=>document.getElementById('dt'+i).value.trim();if(!g(1)||!g(5))return toast('Title and planned deadline are required');
 TK.unshift(mk(++IDN,g(1),'DIRECT','TODO',g(4),g(3),MEN[S.role],'—',[],g(5),g(5),g(2)));closeM();toast('Task created · TODO');S.tw='team';view(false)}
PAGES.tasks=tasksPage;
/* teams */
const TX={};T.forEach((t,i)=>TX[t]={lead:['Elena Vance','Lina Aziz','Omar Haddad','Karim Fouad','Mona Saeed'][i],desc:['Plans brand strategy and long-term growth.','Produces video, motion and visual content.','Runs paid media and performance reporting.','Manages social channels and community.','Owns copy, tone of voice and editorial quality.'][i]});
const tinfo=n=>{const m=D.users.rows.filter(u=>u.teamId===n),b=D.brands.rows.filter(x=>x.teamId===n);return{m,b,o:TK.filter(t=>m.some(u=>u.fullName===t.assignee)&&!DONE4.includes(t.status)).length}};
function teamsPage(){const q=S.q.toLowerCase(),L=T.filter(t=>(t+TX[t].desc+TX[t].lead).toLowerCase().includes(q));
 return `<div class="ph"><div><span class="eb">${ROLES[S.role]}</span><h1>Teams</h1><p>Operational units: who leads them, who is in them, which brands they own and how loaded they are.</p></div>${S.role==='admin'?`<button class="btn p" onclick="teamNew()">+ New team</button>`:''}</div>
<div class="cards">${L.map(n=>{const i=tinfo(n),x=TX[n];return `<div class="card tc"><div style="display:flex;justify-content:space-between;gap:8px;align-items:start"><h2>${esc(n)}</h2><span class="pill ${i.o>2?'wn':'ok'}">${i.o} open tasks</span></div><span class="mute">${esc(x.desc)}</span><div class="mute" style="font-size:12px">Lead: <b style="color:var(--ink)">${x.lead}</b></div><div class="avs">${i.m.slice(0,5).map(u=>`<div class="av" title="${u.fullName}">${ini2(u.fullName)}</div>`).join('')||'<span class="mute">No members</span>'}</div><div>${i.b.map(b=>`<span class="tag">${b.name}</span>`).join('')||'<span class="mute">No brands</span>'}</div><div class="dash" style="margin:2px 0"></div><div style="display:flex;justify-content:space-between;align-items:center"><span class="mute">${i.m.length} members · ${i.b.length} brands</span><span style="display:flex;gap:6px"><button class="btn sm t" onclick="teamView('${esc(n).replace(/'/g,"\\'")}')">View</button>${S.role==='admin'?`<button class="btn sm" onclick="teamEdit(${T.indexOf(n)})">Edit</button><button class="btn sm dg" onclick="teamDel(${T.indexOf(n)})">Delete</button>`:''}</span></div></div>`}).join('')}</div>`}
function teamView(n){const i=tinfo(n),x=TX[n];modal(`<div class="dlg"><h2>${esc(n)}</h2><p class="mute" style="margin:4px 0 12px">${esc(x.desc)}</p><dl class="kv"><dt>Team lead</dt><dd>${x.lead}</dd><dt>Members (${i.m.length})</dt><dd>${i.m.map(u=>`${u.fullName} <span class="mute">· ${u.jobTitleId}</span>`).join('<br>')||'—'}</dd><dt>Brands (${i.b.length})</dt><dd>${i.b.map(b=>b.name+' '+pill(b.status)).join('<br>')||'—'}</dd><dt>Open tasks</dt><dd>${TK.filter(t=>i.m.some(u=>u.fullName===t.assignee)&&!DONE4.includes(t.status)).map(t=>esc(t.title)+' '+pill(t.status)).join('<br>')||'None'}</dd></dl><div class="ft"><button class="btn p" onclick="closeM()">Close</button></div></div>`)}
function teamNew(){const U=D.users.rows.filter(u=>u.roleId!=='Client'),ck=(c,a)=>`<div class="ck">${a.map(v=>`<label><input type="checkbox" data-${c}="${esc(v)}">${esc(v)}</label>`).join('')}</div>`;
 modal(`<div class="dlg"><h2>New team</h2><p class="mute" style="margin:0 0 16px">Name it, pick a lead, then add members and brands.</p><div class="fl"><label>Team name *</label><input id="tn1"></div><div class="fl"><label>Description</label><textarea id="tn2"></textarea></div><div class="fl"><label>Team lead</label><select id="tn3">${U.map(u=>`<option>${u.fullName}</option>`).join('')}</select></div><div class="fl"><label>Members</label>${ck('tm',U.map(u=>u.fullName))}</div><div class="fl"><label>Brands</label>${ck('tb',D.brands.rows.map(b=>b.name))}</div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="teamSave()">Create team</button></div></div>`)}
function teamSave(){const n=document.getElementById('tn1').value.trim();if(!n)return toast('Team name is required');if(T.includes(n))return toast('That team already exists');
 T.push(n);TX[n]={lead:document.getElementById('tn3').value,desc:document.getElementById('tn2').value.trim()||'—'};
 document.querySelectorAll('[data-tm]:checked').forEach(c=>{const u=D.users.rows.find(x=>x.fullName===c.dataset.tm);if(u)u.teamId=n});document.querySelectorAll('[data-tb]:checked').forEach(c=>{const b=D.brands.rows.find(x=>x.name===c.dataset.tb);if(b)b.teamId=n});
 closeM();toast('Team created');view(false)}
PAGES.teams=teamsPage;
/* notifications → go to where the work is */
const NL=[{k:'content',brand:'Lumen Skincare'},{k:'tasks'},{k:'brief',brand:'Nord Coffee'}];D.notifications.rows.forEach((r,i)=>r.link=NL[i]);
D.notifications.rows.push({title:'Lumen Skincare: strategy is waiting for the client’s decision',createdAt:'3 h ago',isRead:false,link:{k:'strategy',brand:'Lumen Skincare'}},{title:'Nord Coffee: strategy sent to the Account Manager',createdAt:'Yesterday',isRead:false,link:{k:'strategy',brand:'Nord Coffee'}});
const DEST={strategy:'Content Strategy',content:'Platforms',brief:'Brand Brief',tasks:'Tasks',onboarding:'Brand Brief'};
function goTo(l){const R=S.role,cl=R==='client',m={strategy:['strategy','strategy'],content:['strategy','platforms'],brief:['brief','brief'],onboarding:['onboarding','brief']}[l.k];let p='tasks',b=null,s=null;
 if(l.k!=='tasks'){if(cl)p=m[0];else if(NAV[R].includes('brands')){p='brands';b=l.brand;s=m[1]}}
 S.page=p;S.brand=b;S.sub=s;S.q='';S.open=false;S.err={};render()}
function nview(i){const r=D.notifications.rows[i];r.isRead=true;goTo(r.link||{k:'tasks'})}
function notifPage(){const R=S.role,q=S.q.toLowerCase();let L=D.notifications.rows.map((r,i)=>({r,i})).filter(({r})=>R!=='client'||r.title.includes(CLIENT_BRAND)).filter(({r})=>r.title.toLowerCase().includes(q)&&(S.nf!=='unread'||!r.isRead));
 return `<div class="ph"><div><span class="eb">${ROLES[R]}</span><h1>Notifications</h1><p>Press View to jump to the screen where you handle it.</p></div><button class="btn" onclick="D.notifications.rows.forEach(r=>r.isRead=true);render(false)">Mark all as read</button></div><div class="seg" style="width:max-content;margin:0 0 16px">${['all','unread'].map(x=>`<button class="${S.nf===x?'on':''}" onclick="S.nf='${x}';view(false)">${x==='all'?'All':'Unread'}</button>`).join('')}</div>`+
 (L.length?`<div class="card" style="padding:8px 20px">${L.map(({r,i})=>`<div style="display:flex;gap:14px;align-items:center;justify-content:space-between;padding:14px 0;border-top:1px solid var(--line);flex-wrap:wrap"><div style="min-width:220px;flex:1"><div style="font-weight:${r.isRead?500:700}">${esc(r.title)}</div><div class="mute" style="font-size:12px">${r.createdAt} · opens ${DEST[(r.link||{k:'tasks'}).k]}</div></div>${r.isRead?'<span class="pill">Read</span>':'<span class="pill in">Unread</span>'}<button class="btn sm p" onclick="nview(${i})">View →</button></div>`).join('')}</div>`:`<div class="card empty"><span class="chip">${ic('bell')}</span><h2>All caught up</h2></div>`)}
PAGES.notifications=notifPage;
const _sgo=sgo;sgo=function(a){const n=D.notifications.rows.length;_sgo(a);const r=D.notifications.rows[0];if(D.notifications.rows.length>n)r.link={k:'strategy',brand:S.brand}};
const _obf=obFinish;obFinish=function(){_obf();D.notifications.rows[0].link={k:'onboarding',brand:CLIENT_BRAND}};
/* dashboards for Content Creator, Creative and Client */
function roleDash(){const R=S.role,me=MEN[R],mine=TK.filter(t=>t.assignee===me),open=mine.filter(t=>!DONE4.includes(t.status)).sort((a,b)=>a.eff<b.eff?-1:1),od=open.filter(isOd).length,
 S4=(a)=>`<div class="stats">${a.map(s=>`<div class="stat ${s[2]?'al':''}"><span class="mono mute">${s[0]}</span><b>${s[1]}</b></div>`).join('')}</div>`,
 hd=(t,p)=>`<div class="ph"><div><span class="eb">${ROLES[R]}</span><h1>Dashboard</h1><p>${p}</p></div></div>`;
 if(R==='client'){const s=sg(CLIENT_BRAND),un=D.notifications.rows.filter(r=>!r.isRead&&r.title.includes(CLIENT_BRAND)),SL={none:'Not started',uploaded:'Being prepared',am:'Being prepared',client:'Waiting for your decision',answered:'Your answer was sent',forwarded:s.out==='approved'?'Approved':'Revision in progress'}[s.st],p=Math.round(OB.done.length/7*100);
  return hd(0,CLIENT_BRAND+' at a glance.')+S4([['Onboarding',p+'%'],['Strategy',SL.split(' ')[0]],['Unread updates',un.length]])+`<div class="g2" style="grid-template-columns:1fr 1fr"><div class="card"><h2>Onboarding</h2><p class="mute">${OB.submitted?'Submitted. Your account manager is preparing the brief.':OB.done.length+' of 7 sections done.'}</p><div class="pbar" style="width:100%;margin:12px 0"><i style="width:${p}%"></i></div><button class="btn p" onclick="goTo({k:'onboarding'})">${OB.submitted?'View answers':'Continue onboarding'}</button></div><div class="card"><h2>Strategy</h2><p class="mute">${SL}</p><div class="dash"></div><button class="btn ${s.st==='client'?'p':''}" onclick="goTo({k:'strategy'})">${s.st==='client'?'Review & decide':'Open strategy'}</button></div></div>`}
 const extra=R==='cc'?`<div class="card"><h2>Strategy per brand</h2>${D.brands.rows.slice(0,3).map(b=>{const s=sg(b.name);return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--line)"><b>${b.name}</b><span class="pill ${s.st==='forwarded'&&s.out==='approved'?'ok':'wn'}">${s.st==='none'?'No strategy':s.st==='forwarded'&&s.out==='approved'?'Approved':'In flow'}</span><button class="btn sm t" onclick="goTo({k:'strategy',brand:'${b.name}'})">Open</button></div>`}).join('')}</div>`:`<div class="card"><h2>By status</h2>${['TODO','IN_PROGRESS','SUBMITTED','NEEDS_CHANGES','COMPLETED'].map(x=>{const c=mine.filter(t=>t.status===x).length;return `<div class="tb" style="grid-template-columns:130px 1fr 30px"><span>${lab(x)}</span><div class="bar"><i style="width:${mine.length?c/mine.length*100:0}%"></i></div><b>${c}</b></div>`}).join('')}</div>`;
 return hd(0,R==='cc'?'Your work, strategies and deadlines.':'Your tasks and deadlines.')+S4([['Open tasks',open.length],['Overdue',od,1],['Needs changes',mine.filter(t=>t.status==='NEEDS_CHANGES').length],['Completed',mine.filter(t=>t.status==='COMPLETED').length]])+`<div class="g2" style="grid-template-columns:1.3fr 1fr"><div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h2>Up next</h2><button class="btn sm t" onclick="go('tasks')">Open My Work</button></div>${open.slice(0,4).map(t=>`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:12px 0;border-top:1px solid var(--line)"><div><b>${esc(t.title)}</b><div class="mute" style="font-size:12px">${dl(t)}</div></div>${pill(t.status)}<button class="btn sm" onclick="tdet(${t.id})">Details</button></div>`).join('')||'<p class="mute">Nothing pending.</p>'}</div>${extra}</div>`}
const _d=dashboard;PAGES.dashboard=()=>S.role==='admin'||S.role==='am'?_d():roleDash();

/* ===== v5: content items under their platform + detail pages ===== */
D.platform.rows.push({brandId:'Lumen Skincare',platform:'TIKTOK',accountName:'@lumen.skin.tt',accountUrl:'tiktok.com/@lumen.skin.tt',isActive:true});
PLANS[0].platform='@lumen.skin';PLANS[0].items.forEach(i=>i.platform='@lumen.skin');
{const f=PLANS[0].items.pop();f.type='REEL';f.platform='@lumen.skin.tt';f.hook='Founder looks to camera: "Why I started Lumen"';f.duration='30s';PLANS.push({id:++IDN,brand:'Lumen Skincare',platform:'@lumen.skin.tt',title:'Nov · Lumen TikTok',month:'Nov 2026',campaigns:[],items:[f]})}
Object.assign(PLANS[0].items[0],{duration:'30s',hook:'Skin before/after in 3 seconds',script:'1. Bare-face close-up\n2. 3-step serum routine\n3. Glow result + product shot',audio:'Trending soft-pop track',cta:'Shop the Winter Glow set',hashtags:'#skincare #winterglow'});
S.det=null;
const kvh=o=>o.map(([a,b])=>`<dt>${a}</dt><dd>${b??'—'}</dd>`).join('');
const fItem=id=>{for(const p of PLANS){const x=p.items.find(i=>i.id===id);if(x)return[x,p]}};
const brItems=b=>PLANS.filter(p=>p.brand===b).flatMap(p=>p.items.map(i=>[i,p]));
function openD(o){S.det=o;S.err={};window.scrollTo(0,0);view(false)}
const itTable=l=>l.length?`<div class="tw"><table><thead><tr><th>Item</th><th>Type</th><th>Plan</th><th>Date</th><th>Status</th></tr></thead><tbody>${l.map(([i,p])=>`<tr><td><a class="lk" onclick="openD({t:'item',id:${i.id}})">${esc(i.title)}</a></td><td><span class="tag">${i.type}</span></td><td>${esc(p.title)}</td><td><span class="mono">${i.date||'—'}</span></td><td>${pill(i.status)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mute" style="margin:8px 0 0">No content items yet.</p>';
const dp=(t,pl,kv,ex='',bt='')=>`<button class="btn sm" onclick="S.det=null;view(false)" style="margin-bottom:16px">← Back</button><div class="ph"><div><span class="eb">${ROLES[S.role]}</span><h1>${t}</h1><div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${pl}</div></div>${bt}</div><div class="card"><dl class="kv" style="margin:0">${kv}</dl></div>${ex}`;
/* detail pages */
function rowDet(k,i){const E=D[k],r=E.rows[i];if(!r)return null;const w=can(k),del=w&&!E.noDelete&&(k!=='users'||S.role==='admin'),ac=E.acts?E.acts(r):[];
 const ent=Object.entries(r).filter(([a])=>a!=='content').map(([a,v])=>[hum(a),a==='status'||a==='isActive'?pill(v):Array.isArray(v)?v.join(', '):esc(v)]);
 const ex=(r.content?`<div class="card" style="margin-top:16px"><div class="mono mute" style="margin-bottom:8px">content (JSON)</div><pre>${esc(JSON.stringify(r.content,null,2))}</pre></div>`:'')+(k==='platform'?`<div class="card" style="margin-top:16px"><h2 style="margin-bottom:8px">Content items on this platform</h2>${itTable(brItems(r.brandId).filter(([x])=>x.platform===r.accountName))}</div>`:'');
 const bt=`<div style="display:flex;gap:8px;flex-wrap:wrap">${ac.map(a=>`<button class="btn" onclick="act('${k}',${i},'${a[1]}')">${a[0]}</button>`).join('')}${w?`<button class="btn" onclick="act('${k}',${i},'edit')">Edit</button>`:''}${del?`<button class="btn dg" onclick="act('${k}',${i},'del')">Delete</button>`:''}</div>`;
 return dp(esc(r.name||r.title||r.fullName||r.accountName||r.fileName||r.key||r[E.cols[0][0]]),`<span class="tag lc">${E.n}</span>`+(r.status!==undefined?pill(r.status):''),kvh(ent),ex,bt)}
function campDet(pid,n){const p=PLANS.find(x=>x.id===pid),c=p&&p.campaigns[n];if(!c)return null;const l=p.items.filter(i=>i.campaign===c.name).map(i=>[i,p]);
 return dp(esc(c.name),'<span class="tag lc">Campaign</span>',kvh([['Objective',esc(c.objective)||'—'],['Brand',esc(p.brand)],['Content plan',esc(p.title)],['Content items',l.length]]),`<div class="card" style="margin-top:16px"><h2 style="margin-bottom:8px">Content items</h2>${itTable(l)}</div>`)}
function taskDet(id){const t=TK.find(x=>x.id===id);if(!t)return null;const w=t.after&&TK.find(x=>x.id===t.after);
 return dp(esc(t.title),pill(t.status)+pill(t.priority)+`<span class="tag">${TY[t.kind]}</span>`,kvh([['Context',esc(ctxL(t))],['Description',esc(t.desc)||'—'],['Assigned to',t.assignee],['Created by',t.by],['Planned deadline',t.planned],['Effective deadline',dl(t)],['Waiting on',w?esc(w.title)+' · '+lab(w.status):'Nothing']]),'',`<div style="display:flex;gap:8px;flex-wrap:wrap">${tbtn(t)}</div>`)}
function teamDet(n){const x=TX[n];if(!x)return null;const i=tinfo(n);
 return dp(esc(n),`<span class="pill ${i.o>2?'wn':'ok'}">${i.o} open tasks</span>`,kvh([['Description',esc(x.desc)],['Team lead',x.lead],['Members ('+i.m.length+')',i.m.map(u=>esc(u.fullName)+' <span class="mute">· '+esc(u.jobTitleId)+'</span>').join('<br>')||'—'],['Brands ('+i.b.length+')',i.b.map(b=>esc(b.name)+' '+pill(b.status)).join('<br>')||'—'],['Open tasks',TK.filter(t=>i.m.some(u=>u.fullName===t.assignee)&&!DONE4.includes(t.status)).map(t=>`<a class="lk" onclick="openD({t:'task',id:${t.id}})">${esc(t.title)}</a> ${pill(t.status)}`).join('<br>')||'None']]),'',S.role==='admin'?`<div style="display:flex;gap:8px"><button class="btn" onclick="teamEdit(${T.indexOf(n)})">Edit</button><button class="btn dg" onclick="teamDel(${T.indexOf(n)})">Delete</button></div>`:'')}
const detPage=()=>{const d=S.det;return d.t==='row'?rowDet(d.k,d.i):d.t==='item'?itemDet(d.id):d.t==='camp'?campDet(d.p,d.n):d.t==='task'?taskDet(d.id):teamDet(d.n)};
const _v=view,_go=go,_sr=setRole,_gt=goTo,_act=act,_ed=E_del,_sp=subPage;
view=function(sk=true){const v=$('#view');if(S.det&&v){let h=null;try{h=detPage()}catch(e){}if(h){v.innerHTML=h;return}S.det=null}_v(sk)};
go=p=>{S.det=null;_go(p)};setRole=r=>{S.det=null;_sr(r)};goTo=l=>{S.det=null;_gt(l)};
act=(k,i,a)=>{if(a==='view'&&k!=='brands'&&D[k].rows[i])return openD({t:'row',k,i});return _act(k,i,a)};
E_del=(k,i)=>{S.det=null;_ed(k,i)};
tdet=id=>openD({t:'task',id});teamView=n=>openD({t:'team',n});
subPage=b=>S.sub==='platforms'?`<div style="display:flex;gap:12px;align-items:center;margin-bottom:20px;flex-wrap:wrap"><button class="btn sm" onclick="S.sub=null;S.q='';view(false)">← ${b.name}</button><span class="mute">Social Media Platforms</span></div>`+platformsPage(b):_sp(b);

/* ===== v6: plans live under each platform; type-aware content item form ===== */
const FS={POST:[['format','Post format','select',['Photo','Graphic','Quote card','Product shot']],['visual','Visual direction','textarea'],['caption','Caption','textarea'],['hashtags','Hashtags'],['cta','Call to action'],['alt','Alt text']],
REEL:[['duration','Duration','select',['15s','30s','60s','90s']],['hook','Hook (first 3 seconds)'],['script','Script / storyboard','textarea'],['audio','Audio / music'],['onscreen','On-screen text'],['cover','Cover frame idea'],['caption','Caption','textarea'],['hashtags','Hashtags'],['cta','Call to action']],
STORY:[['frames','Number of frames','number'],['storyplan','Frame-by-frame plan','textarea'],['sticker','Interactive sticker','select',['None','Poll','Quiz','Question','Link','Countdown']],['link','Link (if any)'],['cta','Call to action']],
CAROUSEL:[['slides','Number of slides','number'],['cover','Cover slide headline'],['outline','Slide-by-slide outline','textarea'],['caption','Caption','textarea'],['hashtags','Hashtags'],['cta','Call to action']]};
const ALLOWED={INSTAGRAM:['POST','REEL','STORY','CAROUSEL'],FACEBOOK:['POST','REEL','STORY','CAROUSEL'],TIKTOK:['REEL','CAROUSEL','POST'],LINKEDIN:['POST','CAROUSEL'],YOUTUBE:['REEL']};
const fld=([n,l,ty,o],v)=>ty==='textarea'?`<div class="fl" style="grid-column:1/-1"><label>${l}</label><textarea data-f="${n}">${esc(v[n])}</textarea></div>`:ty==='select'?`<div class="fl"><label>${l}</label><select data-f="${n}">${o.map(x=>`<option ${x===v[n]?'selected':''}>${esc(x)}</option>`).join('')}</select></div>`:`<div class="fl"><label>${l}</label><input data-f="${n}" type="${ty||'text'}" value="${esc(v[n])}"></div>`;
function itModal(pid,v,eid){const p=pl(pid),pr=D.platform.rows.find(r=>r.brandId===p.brand&&r.accountName===p.platform),ty=ALLOWED[pr&&pr.platform]||ALLOWED.INSTAGRAM,t=ty.includes(v.type)?v.type:ty[0];v.type=t;
 return `<div class="dlg"><h2>${eid?'Edit':'New'} content item</h2><p class="mute" style="margin:0 0 16px">${esc(p.platform)} · ${esc(p.title)}. The fields below change with the type.</p><div class="pg">${fld(['title','Title *'],v)}<div class="fl"><label>Type</label><select data-f="type" onchange="itType(${pid},this.value${eid?','+eid:''})">${ty.map(x=>`<option ${x===t?'selected':''}>${x}</option>`).join('')}</select></div>${fld(['campaign','Campaign','select',['—',...p.campaigns.map(c=>c.name)]],v)}${fld(['date','Scheduled date','date'],v)}${FS[t].map(f=>fld(f,v)).join('')}${fld(['notes','Notes','textarea'],v)}</div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="itSave(${pid}${eid?','+eid:''})">${eid?'Save':'Create'} ${lab(t)}</button></div></div>`}
const itVals=()=>Object.fromEntries([...document.querySelectorAll('.dlg [data-f]')].map(x=>[x.dataset.f,x.value]));
function itType(pid,t,eid){const v=itVals();v.type=t;$('.ov').innerHTML=itModal(pid,v,eid)}
function itSave(pid,eid){const v=itVals();if(!(v.title||'').trim())return toast('Title is required');const p=pl(pid);
 if(eid)Object.assign(fItem(eid)[0],v);else p.items.push({...v,id:++IDN,platform:p.platform,assignee:'',priority:'MEDIUM',status:'TODO'});closeM();toast(eid?'Changes saved':'Content item created');view(false)}
function editItem(id){const[i,p]=fItem(id);modal(itModal(p.id,{...i},id))}
const cfm=(t,js)=>modal(`<div class="dlg"><h2>${t}</h2><p class="mute">This can’t be undone.</p><div class="ft"><button class="btn" onclick="closeM()">Keep it</button><button class="btn p" style="background:var(--et);border-color:var(--et)" onclick="${js}">Delete</button></div></div>`);
const delItem=id=>cfm('Delete this content item?',`PLANS.forEach(p=>p.items=p.items.filter(i=>i.id!==${id}));closeM();toast('Deleted');S.det=null;view(false)`);
const delPlan=id=>cfm('Delete this plan and its items?',`PLANS.splice(PLANS.findIndex(p=>p.id===${id}),1);closeM();toast('Plan deleted');view(false)`);
newItem=id=>modal(itModal(id,{}));
function newPlanP(i){const a=D.platform.rows[i].accountName;ask('New content plan for '+a,[['title','Plan title'],['month','Month']],v=>PLANS.push({id:++IDN,brand:S.brand,platform:a,title:v.title,month:v.month||'',campaigns:[],items:[]}))}
function platformsPage(b){const E=D.platform,w=can('platform'),q=S.q.toLowerCase(),R=S.role,cc=R==='cc',am=R==='am',s=sg(b.name),ok=s.st==='forwarded'&&s.out==='approved',
 rows=E.rows.map((r,i)=>({r,i})).filter(({r})=>r.brandId===b.name),
 sel=(id,k,o,v)=>`<select style="border:1px solid var(--line);border-radius:10px;padding:5px 8px;background:#fff" onchange="setIt(${id},'${k}',this.value)">${o.map(x=>`<option value="${x}" ${x===v?'selected':''}>${k==='status'?lab(x):x}</option>`).join('')}</select>`,
 planH=p=>{const its=p.items.filter(i=>i.title.toLowerCase().includes(q));return `<div style="border:1px solid var(--line);border-radius:18px;padding:16px;margin-top:12px;background:var(--canvas)"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><div><b style="font-size:16px">${esc(p.title)}</b> <span class="mute">${esc(p.month)}</span></div>${cc&&ok?`<div style="display:flex;gap:8px"><button class="btn sm" onclick="newCamp(${p.id})">+ Campaign</button><button class="btn sm p" onclick="newItem(${p.id})">+ Content item</button><button class="btn sm dg" onclick="delPlan(${p.id})">Delete plan</button></div>`:''}</div>
 <div style="margin:10px 0">${p.campaigns.length?p.campaigns.map((c,ci)=>`<span class="tag lc" style="cursor:pointer" onclick="openD({t:'camp',p:${p.id},n:${ci}})">${esc(c.name)}</span>`).join(''):'<span class="mute">No campaigns yet.</span>'}</div>
 ${its.length?`<div class="tw"><table><thead><tr><th>Item</th><th>Type</th><th>Campaign</th><th>Date</th><th>Assigned to</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody>${its.map(i=>`<tr><td><a class="lk" onclick="openD({t:'item',id:${i.id}})">${esc(i.title)}</a></td><td><span class="tag">${i.type}</span></td><td>${esc(i.campaign||'—')}</td><td><span class="mono">${i.date||'—'}</span></td><td>${am?sel(i.id,'assignee',['Unassigned',...EMP],i.assignee||'Unassigned'):esc(i.assignee)||'—'}</td><td>${am?sel(i.id,'priority',PR,i.priority):pill(i.priority)}</td><td>${am?sel(i.id,'status',TS2,i.status):pill(i.status)}</td><td>${cc&&ok?`<div class="ra"><button class="btn sm" onclick="editItem(${i.id})">Edit</button><button class="btn sm dg" onclick="delItem(${i.id})">Delete</button></div>`:''}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mute" style="margin:0">No content items in this plan yet.</p>'}</div>`};
 return (cc||am?head(E,w,'platform').replace(/<div class="note wn"><b>🔒<\/b>[\s\S]*?<\/div>/,''):head(E,w,'platform'))+(!ok&&(cc||am)?'<div class="note wn" style="align-items:center"><b>🔒</b><span style="flex:1">New plans and content items open once the client approves the strategy.</span><button class="btn sm" onclick="S.sub=\'strategy\';view(false)">Open strategy</button></div>':'')+
 (rows.length?rows.map(({r,i})=>{const ps=PLANS.filter(p=>p.brand===b.name&&p.platform===r.accountName),n=ps.reduce((a,p)=>a+p.items.length,0);
 return `<div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><div style="display:flex;align-items:center"><span class="chip" style="background:var(--lilac)">${ic('link')}</span><div><h2><a class="lk" style="text-decoration:none" onclick="act('platform',${i},'view')">${esc(r.accountName)}</a></h2><div style="margin-top:4px"><span class="tag">${r.platform}</span>${pill(r.isActive)} <span class="mute">${ps.length} plan${ps.length===1?'':'s'} · ${n} item${n===1?'':'s'}</span></div></div></div><div class="ra">${cc&&ok?`<button class="btn sm p" onclick="newPlanP(${i})">+ New plan</button>`:''}<button class="btn sm t" onclick="act('platform',${i},'view')">View</button>${w?`<button class="btn sm" onclick="act('platform',${i},'edit')">Edit</button><button class="btn sm dg" onclick="act('platform',${i},'del')">Delete</button>`:''}</div></div>${ps.length?ps.map(planH).join(''):'<p class="mute" style="margin:14px 0 0">No content plans for this platform yet.</p>'}</div>`}).join(''):'<div class="card empty"><span class="chip">'+ic('link')+'</span><h2>No platforms yet</h2><p class="mute">Add a social account, then build its content plans.</p></div>')}
const FL=Object.fromEntries(Object.values(FS).flat().concat([['notes','Notes']]).map(f=>[f[0],f[1]]));
function itemDet(id){const f=fItem(id);if(!f)return null;const[i,p]=f,
 pi=D.platform.rows.findIndex(r=>r.brandId===p.brand&&r.accountName===i.platform),c=p.campaigns.findIndex(x=>x.name===i.campaign),
 det=[...FS[i.type].map(x=>x[0]),'notes'].filter(k=>i[k]).map(k=>[FL[k],esc(i[k]).replace(/\n/g,'<br>')]);
 return dp(esc(i.title),`<span class="tag">${i.type}</span>`+pill(i.status)+pill(i.priority),kvh([['Brand',esc(p.brand)],['Platform',pi>=0?`<a class="lk" onclick="openD({t:'row',k:'platform',i:${pi}})">${esc(i.platform)}</a>`:'—'],['Content plan',esc(p.title)],['Campaign',c>=0?`<a class="lk" onclick="openD({t:'camp',p:${p.id},n:${c}})">${esc(i.campaign)}</a>`:'—'],['Scheduled',`<span class="mono">${i.date||'—'}</span>`],['Assigned to',esc(i.assignee)||'Unassigned'],['Priority',pill(i.priority)],['Status',pill(i.status)]]),
 `<div class="card" style="margin-top:16px"><h2 style="margin-bottom:8px">${lab(i.type)} details</h2>${det.length?`<dl class="kv" style="margin:12px 0 0">${kvh(det)}</dl>`:'<p class="mute" style="margin:0">No details filled in yet.</p>'}</div>`)}

/* ===== v7: brands as cards, richer Creative dashboard ===== */
S.bv='rows';
const _lp=listPage;
listPage=function(k){if(k!=='brands'||S.role==='client')return _lp(k);
 const tg=`<div class="seg" style="width:max-content;margin:0 0 16px">${[['rows','☰ Rows'],['cards','▦ Cards']].map(x=>`<button class="${S.bv===x[0]?'on':''}" onclick="S.bv='${x[0]}';view(false)">${x[1]}</button>`).join('')}</div>`,h=_lp(k);
 if(S.bv==='rows'){const n=h.indexOf('<div class="card"');return n<0?h+tg:h.slice(0,n)+tg+h.slice(n)}
 const E=D.brands,q=S.q.toLowerCase(),bg=['var(--lilac)','var(--peach)','var(--sky)','var(--mint)'],
 L=E.rows.map((r,i)=>({r,i})).filter(({r})=>JSON.stringify(Object.values(r)).toLowerCase().includes(q));
 return head(E,can(k),k)+tg+(L.length?`<div class="cards">${L.map(({r,i})=>{const np=D.platform.rows.filter(x=>x.brandId===r.name).length,pc=PLANS.filter(p=>p.brand===r.name).length;
 return `<div class="card tc" style="cursor:pointer" onclick="act('brands',${i},'view')"><div style="display:flex;gap:12px;align-items:center"><div class="av" style="width:48px;height:48px;border-radius:14px;background:${bg[i%4]};font-size:15px">${esc(r.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div style="min-width:0;flex:1"><b style="font-size:16px">${esc(r.name)}</b><div class="mute" style="font-size:12px">${esc(r.industry)}</div></div>${pill(r.status)}</div><div class="mute" style="font-size:12px">Team: <b style="color:var(--ink)">${esc(r.teamId)}</b><br>Account manager: <b style="color:var(--ink)">${esc(r.accountManagerId)}</b></div><div class="dash" style="margin:2px 0"></div><div><span class="tag">${np} platform${np===1?'':'s'}</span><span class="tag">${pc} plan${pc===1?'':'s'}</span></div></div>`}).join('')}</div>`:'<div class="card empty"><h2>No brands match</h2></div>')};
function empExtra(){const me=MEN[S.role],cc=S.role==='cc',u=D.users.rows.find(x=>x.fullName===me)||{},ts=[...new Set([u.teamId,...T.filter(t=>TX[t]&&TX[t].lead===me)])].filter(t=>t&&TX[t]),
 mine=TK.filter(t=>t.assignee===me&&!DONE4.includes(t.status)),
 bl=D.brands.rows.map(b=>({b,tb:ts.includes(b.teamId),n:mine.filter(t=>t.brand===b.name).length})).filter(x=>x.tb||x.n);
 return `<div class="g2" style="grid-template-columns:1fr 1.4fr;margin-top:20px"><div class="card"><h2 style="margin-bottom:8px">My teams</h2>${ts.map(n=>{const i=tinfo(n),x=TX[n];return `<div style="padding:14px 0;border-top:1px solid var(--line)"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>${esc(n)}</b><span class="pill ${i.o>2?'wn':'ok'}">${i.o} open tasks</span></div><div class="mute" style="font-size:12px;margin:4px 0 8px">${esc(x.desc)} · Lead: ${x.lead}</div><div class="avs">${i.m.slice(0,6).map(m=>`<div class="av" title="${esc(m.fullName)}">${ini2(m.fullName)}</div>`).join('')}</div><button class="btn sm t" style="margin-top:10px" onclick="openD({t:'team',n:decodeURIComponent('${encodeURIComponent(n)}')})">View team</button></div>`}).join('')||'<p class="mute">You are not in a team yet.</p>'}</div>
 <div class="card"><h2 style="margin-bottom:12px">My brands</h2>${bl.length?`<div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${bl.map(({b,tb,n})=>`<div style="border:1px solid var(--line);border-radius:16px;padding:14px;${cc?'cursor:pointer':''}" ${cc?`onclick="S.det=null;S.page='brands';S.brand=decodeURIComponent('${encodeURIComponent(b.name)}');S.sub=null;S.q='';render(false)"`:''}><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>${esc(b.name)}</b>${pill(b.status)}</div><div class="mute" style="font-size:12px">${esc(b.industry)}</div><div style="margin-top:10px"><span class="tag ${tb?'lc':'pe'}">${tb?'Team brand':'Assigned to you'}</span></div><div class="mute" style="font-size:12px;margin-top:6px">${n} open task${n===1?'':'s'} for you</div></div>`).join('')}</div>`:'<p class="mute">No brands yet.</p>'}</div></div>`}
const _pd=PAGES.dashboard;PAGES.dashboard=()=>{const h=_pd();if(S.role!=='emp'&&S.role!=='cc')return h;const m='</p></div></div>',n=h.indexOf(m)+m.length;return n<m.length?h:h.slice(0,n)+empExtra().replace('margin-top:20px','margin:0 0 20px')+h.slice(n)};

/* ===== v8: admin can edit / delete teams ===== */
function teamEdit(i){const n=T[i],x=TX[n],inf=tinfo(n),U=D.users.rows.filter(u=>u.roleId!=='Client').map(u=>u.fullName),
 ck=(c,l,on)=>`<div class="ck">${l.map(v=>`<label><input type="checkbox" data-${c}="${esc(v)}" ${on.includes(v)?'checked':''}>${esc(v)}</label>`).join('')}</div>`;
 modal(`<div class="dlg"><h2>Edit team</h2><p class="mute" style="margin:0 0 16px">Update the name, lead, members and brands.</p><div class="fl"><label>Team name *</label><input id="te1" value="${esc(n)}"></div><div class="fl"><label>Description</label><textarea id="te2">${esc(x.desc==='—'?'':x.desc)}</textarea></div><div class="fl"><label>Team lead</label><select id="te3">${[...new Set([x.lead,...U])].map(u=>`<option ${u===x.lead?'selected':''}>${esc(u)}</option>`).join('')}</select></div><div class="fl"><label>Members</label>${ck('em',U,inf.m.map(u=>u.fullName))}</div><div class="fl"><label>Brands</label>${ck('eb',D.brands.rows.map(b=>b.name),inf.b.map(b=>b.name))}</div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="teamUpd(${i})">Save changes</button></div></div>`)}
function teamUpd(i){const o=T[i],n=$('#te1').value.trim();if(!n)return toast('Team name is required');if(n!==o&&T.includes(n))return toast('That team already exists');
 const x=TX[o],ms=[...document.querySelectorAll('[data-em]:checked')].map(c=>c.dataset.em),bs=[...document.querySelectorAll('[data-eb]:checked')].map(c=>c.dataset.eb);
 x.lead=$('#te3').value;x.desc=$('#te2').value.trim()||'—';
 D.users.rows.forEach(u=>{if(ms.includes(u.fullName))u.teamId=n;else if(u.teamId===o)u.teamId='—'});
 D.brands.rows.forEach(b=>{if(bs.includes(b.name))b.teamId=n;else if(b.teamId===o)b.teamId='—'});
 if(n!==o){T[i]=n;TX[n]=x;delete TX[o]}
 if(S.det&&S.det.t==='team')S.det.n=n;closeM();toast('Team updated');view(false)}
const teamDel=i=>cfm('Delete the team “'+esc(T[i])+'”?',`teamRm(${i})`);
function teamRm(i){const n=T[i];D.users.rows.forEach(u=>{if(u.teamId===n)u.teamId='—'});D.brands.rows.forEach(b=>{if(b.teamId===n)b.teamId='—'});T.splice(i,1);delete TX[n];S.det=null;closeM();toast('Team deleted');view(false)}

/* ===== v9: Express / Prisma Backend API Integration Bridge ===== */
const API_BASE=(window.__ORVIA_API_BASE__||'/api').replace(/\/+$/,'');
const API_CACHE={roles:{},jobTitles:{},usersByName:{},usersById:{},teamsByName:{},brandsByName:{},platformsByAccount:{},plansByTitle:{},campaignsByName:{},strategiesByBrand:{}};
const ROLE_API_TO_UI={ADMIN:'admin',ACCOUNT_MANAGER:'am',CONTENT_CREATOR:'cc',CREATIVE:'emp',EMPLOYEE:'emp',CLIENT:'client'};
const ROLE_UI_TO_API={Admin:'ADMIN','Account Manager':'ACCOUNT_MANAGER','Content Creator':'CONTENT_CREATOR',Creative:'CREATIVE','Team Leader':'CONTENT_CREATOR',Client:'CLIENT'};
const ROLE_API_TO_LABEL={ADMIN:'Admin',ACCOUNT_MANAGER:'Account Manager',CONTENT_CREATOR:'Content Creator',CREATIVE:'Creative',EMPLOYEE:'Creative',CLIENT:'Client'};

function getApiToken(){try{return sessionStorage.getItem('orvia_access_token')||localStorage.getItem('orvia_access_token')||''}catch(e){return ''}}
function setApiTokens(at,rt,u){
 try{
  if(at){sessionStorage.setItem('orvia_access_token',at);localStorage.setItem('orvia_access_token',at)}
  if(rt){sessionStorage.setItem('orvia_refresh_token',rt);localStorage.setItem('orvia_refresh_token',rt)}
  if(u){sessionStorage.setItem('orvia_user',JSON.stringify(u));localStorage.setItem('orvia_user',JSON.stringify(u))}
 }catch(e){}
}
function clearApiTokens(){
 try{
  ['orvia_access_token','orvia_refresh_token','orvia_user'].forEach(k=>{sessionStorage.removeItem(k);localStorage.removeItem(k)});
 }catch(e){}
}

async function apiCall(path,{method='GET',body,auth=true,isForm=false}={}){
 const headers={};
 if(!isForm&&body!==undefined)headers['Content-Type']='application/json';
 const tok=getApiToken();
 if(auth&&tok)headers['Authorization']='Bearer '+tok;
 const res=await fetch(API_BASE+path,{method,headers,body:isForm?body:(body!==undefined?JSON.stringify(body):undefined)});
 if(res.status===401&&auth){
  const rt=sessionStorage.getItem('orvia_refresh_token')||localStorage.getItem('orvia_refresh_token');
  if(rt){
   const rRes=await fetch(API_BASE+'/auth/refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:rt})}).catch(()=>null);
   if(rRes&&rRes.ok){
    const rJson=await rRes.json().catch(()=>null);
    const newAt=rJson?.data?.accessToken;
    if(newAt){
     setApiTokens(newAt,rJson?.data?.refreshToken||rt);
     headers['Authorization']='Bearer '+newAt;
     const retry=await fetch(API_BASE+path,{method,headers,body:isForm?body:(body!==undefined?JSON.stringify(body):undefined)});
     const retryJson=await retry.json().catch(()=>null);
     if(!retry.ok)throw new Error(retryJson?.message||'API request failed');
     return retryJson?.data??retryJson;
    }
   }
  }
 }
 const json=await res.json().catch(()=>null);
 if(!res.ok||json?.success===false){
  const err=new Error(json?.message||`${method} ${path} failed (${res.status})`);
  err.status=res.status;
  throw err;
 }
 return json?.data??json;
}

async function hydrateFromBackend(){
 if(!getApiToken())return;
 try{
  const [rolesData,jobsData,teamsData,usersData,brandsData,platformsData,plansData,campaignsData,itemsData,briefsData,stratsData,tasksData,notifsData]=await Promise.all([
   apiCall('/meta/roles').catch(()=>null),
   apiCall('/meta/job-titles').catch(()=>null),
   apiCall('/teams').catch(()=>null),
   apiCall('/users').catch(()=>null),
   apiCall('/brands').catch(()=>null),
   apiCall('/platform-accounts').catch(()=>null),
   apiCall('/content-plans').catch(()=>null),
   apiCall('/campaigns').catch(()=>null),
   apiCall('/content-items').catch(()=>null),
   apiCall('/brand-briefs').catch(()=>null),
   apiCall('/strategies').catch(()=>null),
   apiCall('/tasks').catch(()=>null),
   apiCall('/notifications').catch(()=>null)
  ]);

  if(rolesData){
   const rList=Array.isArray(rolesData)?rolesData:(rolesData.roles||[]);
   rList.forEach(r=>{API_CACHE.roles[r.name]=r.id});
  }
  if(jobsData){
   const jList=Array.isArray(jobsData)?jobsData:(jobsData.jobTitles||[]);
   jList.forEach(j=>{API_CACHE.jobTitles[j.name]=j.id});
  }
  if(teamsData){
   const tList=Array.isArray(teamsData)?teamsData:(teamsData.teams||[]);
   if(tList.length){
    T.length=0;
    Object.keys(TX).forEach(k=>delete TX[k]);
    D.teams.rows=[];
    tList.forEach(tm=>{
     API_CACHE.teamsByName[tm.name]=tm.id;
     T.push(tm.name);
     TX[tm.name]={_id:tm.id,lead:tm.teamLead?.fullName||ME.admin[0],desc:tm.description||'—'};
     D.teams.rows.push({_id:tm.id,name:tm.name,brands:(tm.brands||[]).length});
    });
   }
  }
  if(usersData){
   const uList=Array.isArray(usersData)?usersData:(usersData.users||[]);
   if(uList.length){
    D.users.rows=[];
    EMP.length=0;
    uList.forEach(u=>{
     const rName=u.role?.name||u.role||'CREATIVE';
     const rLabel=ROLE_API_TO_LABEL[rName]||rName;
     const jLabel=u.jobTitle?.name||(rLabel==='Admin'?'Workspace Owner':rLabel);
     const tName=u.teamMemberships?.[0]?.team?.name||u.team?.name||'—';
     API_CACHE.usersByName[u.fullName]=u.id;
     API_CACHE.usersById[u.id]=u.fullName;
     D.users.rows.push({_id:u.id,fullName:u.fullName,email:u.email,roleId:rLabel,jobTitleId:jLabel,teamId:tName,isActive:u.isActive!==false});
     if(rName!=='CLIENT'&&rName!=='ADMIN')EMP.push(u.fullName);
    });
   }
  }
  if(brandsData){
   const bList=Array.isArray(brandsData)?brandsData:(brandsData.brands||[]);
   if(bList.length){
    BR.length=0;
    D.brands.rows=[];
    bList.forEach(b=>{
     API_CACHE.brandsByName[b.name]=b.id;
     BR.push(b.name);
     D.brands.rows.push({_id:b.id,name:b.name,industry:b.industry||'General',teamId:b.team?.name||T[0]||'—',accountManagerId:b.accountManager?.fullName||MEN.am,status:(b.status||'ACTIVE').toUpperCase()});
    });
   }
  }
  if(platformsData){
   const pList=Array.isArray(platformsData)?platformsData:(platformsData.platformAccounts||platformsData.accounts||[]);
   if(pList.length){
    D.platform.rows=pList.map(p=>{
     const bName=p.brand?.name||D.brands.rows.find(b=>b._id===p.brandId)?.name||BR[0]||'—';
     API_CACHE.platformsByAccount[p.accountName]=p.id;
     return {_id:p.id,brandId:bName,platform:(p.platform||'INSTAGRAM').toUpperCase(),accountName:p.accountName,accountUrl:p.accountUrl||'',isActive:p.isActive!==false};
    });
   }
  }
  if(plansData){
   const plList=Array.isArray(plansData)?plansData:(plansData.plans||plansData.contentPlans||[]);
   if(plList.length){
    D.plans.rows=[];
    PLANS.length=0;
    const cList=Array.isArray(campaignsData)?campaignsData:(campaignsData?.campaigns||[]);
    const iList=Array.isArray(itemsData)?itemsData:(itemsData?.contentItems||itemsData?.items||[]);
    plList.forEach(p=>{
     const bName=p.brand?.name||D.brands.rows.find(b=>b._id===p.brandId)?.name||BR[0]||'—';
     const platAcc=p.platformAccount?.accountName||D.platform.rows.find(x=>x._id===p.platformAccountId)?.accountName||'@lumen.skin';
     const mLabel=`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(Number(p.month)||11)-1]} ${p.year||2026}`;
     API_CACHE.plansByTitle[p.title]=p.id;
     D.plans.rows.push({_id:p.id,title:p.title,brandId:bName,month:mLabel,status:(p.status||'DRAFT').toUpperCase(),assignedToId:p.assignedTo?.fullName||MEN.cc});
     const pCamps=cList.filter(c=>c.contentPlanId===p.id).map(c=>{API_CACHE.campaignsByName[c.name]=c.id;return {_id:c.id,name:c.name,objective:c.objective||''}});
     const pItems=iList.filter(it=>it.contentPlanId===p.id).map(it=>({
      id:it.id,_id:it.id,title:it.title,type:(it.type||'POST').toUpperCase(),platform:platAcc,
      campaign:pCamps.find(c=>c._id===it.campaignId)?.name||'—',
      date:it.scheduledDate?String(it.scheduledDate).slice(0,10):'',
      caption:it.caption||'',notes:it.notes||'',assignee:it.creator?.fullName||MEN.cc,priority:'MEDIUM',status:'TODO'
     }));
     PLANS.push({id:p.id,_id:p.id,brand:bName,platform:platAcc,title:p.title,month:mLabel,campaigns:pCamps,items:pItems});
    });
   }
  }
  if(briefsData){
   const brfList=Array.isArray(briefsData)?briefsData:(briefsData.briefs||[]);
   if(brfList.length){
    D.briefs.rows=brfList.map(bf=>({
     _id:bf.id,brandId:bf.brandName||bf.onboarding?.brand?.name||BR[0]||'—',
     version:'v'+(bf.version||1),status:(bf.backendStatus||bf.status||'READY').toUpperCase(),
     updatedAt:bf.generatedAt?String(bf.generatedAt).slice(0,10):TODAY,content:bf.sections||bf.content||{}
    }));
   }
  }
  if(stratsData){
   const sList=Array.isArray(stratsData)?stratsData:(stratsData.strategies||[]);
   if(sList.length){
    D.strategies.rows=[];
    sList.forEach(st=>{
     const bName=st.brand?.name||D.brands.rows.find(b=>b._id===st.brandId)?.name||BR[0]||'—';
     const latest=(st.versions||[])[0];
     API_CACHE.strategiesByBrand[bName]={id:st.id,versionId:latest?.id};
     D.strategies.rows.push({_id:st.id,brandId:bName,title:st.title,updatedAt:st.updatedAt?String(st.updatedAt).slice(0,10):TODAY});
     const stMap={DRAFT:'uploaded',PENDING_ACCOUNT_MANAGER:'am',PENDING_CLIENT:'client',CHANGES_REQUESTED:'forwarded',APPROVED:'forwarded'};
     STR[bName]={
      _id:st.id,_versionId:latest?.id,
      st:stMap[st.status]||'uploaded',
      out:st.status==='APPROVED'?'approved':st.status==='CHANGES_REQUESTED'?'rejected':null,
      v:latest?.version||1,file:latest?.fileName||st.title+'.pdf',
      reason:latest?.feedback?.[0]?.message||'',
      log:(st.versions||[]).map(v=>`v${v.version} uploaded · ${v.uploadedBy?.fullName||'Content Creator'}`)
     };
    });
   }
  }
  if(tasksData){
   const tkList=Array.isArray(tasksData)?tasksData:(tasksData.tasks||[]);
   if(tkList.length){
    TK.length=0;
    D.tasks.rows=[];
    tkList.forEach(t=>{
     const bName=t.contentItem?.contentPlan?.brand?.name||'—';
     const aName=t.assignee?.fullName||MEN.cc;
     const byName=t.creator?.fullName||MEN.am;
     const pDate=t.plannedDeadline?String(t.plannedDeadline).slice(0,10):TODAY;
     const eDate=t.effectiveDeadline?String(t.effectiveDeadline).slice(0,10):pDate;
     const kindMap={CONTENT_CREATION:'CREATION',REVIEW:'REVIEW',PUBLISH:'PUBLISH',DIRECT:'DIRECT'};
     const item=mk(t.id,t.title,kindMap[t.type]||'DIRECT',(t.status||'TODO').toUpperCase(),(t.priority||'MEDIUM').toUpperCase(),aName,byName,bName,[],pDate,eDate,t.description||'',t.dependsOnTaskId);
     item._id=t.id;
     TK.push(item);
     D.tasks.rows.push({_id:t.id,title:t.title,priority:(t.priority||'MEDIUM').toUpperCase(),assignedToId:aName,plannedDeadline:pDate,status:(t.status||'TODO').toUpperCase()});
    });
   }
  }
  if(notifsData){
   const nList=Array.isArray(notifsData)?notifsData:(notifsData.notifications||[]);
   if(nList.length){
    D.notifications.rows=nList.map(n=>({
     _id:n.id,title:n.title||n.message||'Notification',
     createdAt:n.createdAt?String(n.createdAt).slice(0,16).replace('T',' '):'just now',
     isRead:Boolean(n.isRead),link:{k:'tasks'}
    }));
   }
  }
  if(S.role==='client'){
   const obData=await apiCall('/client-onboarding/me').catch(()=>null);
   if(obData){
    if(obData.mainCategory)OB.cat=obData.mainCategory;
    if(obData.activityType)OB.act=obData.activityType;
    if(obData.status==='SUBMITTED')OB.submitted=true;
    if(Array.isArray(obData.answers)){
     obData.answers.forEach(ans=>{OB.a[ans.questionCode]=typeof ans.answer==='string'?ans.answer:JSON.stringify(ans.answer)});
    }
   }
  }
  view(false);
 }catch(e){}
}

/* Override doLogin to authenticate against POST /api/auth/login with instant fallback */
const _origDoLogin=doLogin;
doLogin=async function(){
 const v=Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i=>[i.dataset.f,i.value]));
 S.err={};
 if(!v.email)S.err.email='Enter your email.';
 if(!v.password)S.err.password='Enter your password.';
 if(Object.keys(S.err).length)return render();
 try{
  const data=await apiCall('/auth/login',{method:'POST',body:{email:v.email.trim(),password:v.password},auth:false});
  if(data?.accessToken){
   setApiTokens(data.accessToken,data.refreshToken,data.user);
   const apiRole=data.user?.role?.name||data.user?.role;
   if(apiRole&&ROLE_API_TO_UI[apiRole])S.role=ROLE_API_TO_UI[apiRole];
   if(data.user?.fullName){
    ME[S.role]=[data.user.fullName,ROLES[S.role]];
    MEN[S.role]=data.user.fullName;
   }
   S.authed=true;
   S.page=NAV[S.role][0];
   render();
   hydrateFromBackend();
   return;
  }
 }catch(err){
  if(err?.status===401||err?.status===423){
   toast(err.message||'Invalid credentials');
  }
 }
 _origDoLogin();
};

const _origLogout=logout;
logout=function(){
 apiCall('/auth/logout',{method:'POST'}).catch(()=>{});
 clearApiTokens();
 _origLogout();
};

const _origChg=chg;
chg=function(){
 const v=Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i=>[i.dataset.f,i.value]));
 _origChg();
 if(!Object.keys(S.err).length&&getApiToken()){
  apiCall('/auth/change-password',{method:'POST',body:{currentPassword:v.currentPassword,newPassword:v.newPassword}}).catch(()=>{});
 }
};

/* Wire CRUD save / delete / status transitions to Express API */
const _origSave=save;
save=function(k,i){
 const E=D[k],prevRow=i!=null?{...E.rows[i]}:null;
 const beforeLen=E.rows.length;
 _origSave(k,i);
 if(Object.keys(S.err).length||!getApiToken())return;
 const row=i==null?E.rows[0]:E.rows[i];
 if(!row)return;
 (async()=>{
  try{
   if(k==='users'){
    const roleApi=ROLE_UI_TO_API[row.roleId]||'CREATIVE';
    const roleId=API_CACHE.roles[roleApi];
    const jobTitleId=API_CACHE.jobTitles[row.jobTitleId];
    const teamId=API_CACHE.teamsByName[row.teamId];
    if(i==null&&beforeLen<E.rows.length){
     const created=await apiCall('/users',{method:'POST',body:{fullName:row.fullName,email:row.email,roleId,jobTitleId,teamId}});
     if(created?.id){row._id=created.id;API_CACHE.usersByName[row.fullName]=created.id}
    }else if(prevRow?._id){
     await apiCall('/users/'+prevRow._id,{method:'PATCH',body:{fullName:row.fullName,email:row.email,roleId,jobTitleId,isActive:row.isActive}});
    }
   }else if(k==='brands'){
    const teamId=API_CACHE.teamsByName[row.teamId];
    const accountManagerId=API_CACHE.usersByName[row.accountManagerId];
    if(i==null&&beforeLen<E.rows.length){
     const created=await apiCall('/brands',{method:'POST',body:{name:row.name,industry:row.industry,websiteUrl:row.websiteUrl||null,description:row.description||null,status:row.status||'ACTIVE',teamId,accountManagerId}});
     if(created?.id){row._id=created.id;API_CACHE.brandsByName[row.name]=created.id}
    }else if(prevRow?._id){
     await apiCall('/brands/'+prevRow._id,{method:'PATCH',body:{name:row.name,industry:row.industry,status:row.status,teamId,accountManagerId}});
    }
   }else if(k==='platform'){
    const brandId=API_CACHE.brandsByName[row.brandId];
    if(i==null&&beforeLen<E.rows.length&&brandId){
     const created=await apiCall('/platform-accounts',{method:'POST',body:{brandId,platform:row.platform,accountName:row.accountName,accountUrl:row.accountUrl||null,isActive:row.isActive!==false}});
     if(created?.id){row._id=created.id;API_CACHE.platformsByAccount[row.accountName]=created.id}
    }else if(prevRow?._id){
     await apiCall('/platform-accounts/'+prevRow._id,{method:'PATCH',body:{platform:row.platform,accountName:row.accountName,accountUrl:row.accountUrl||null,isActive:row.isActive!==false}});
    }
   }
  }catch(e){}
 })();
};

const _origEDel=E_del;
E_del=function(k,i){
 const row=D[k]?.rows?.[i];
 _origEDel(k,i);
 if(!row?._id||!getApiToken())return;
 const ep={users:'/users/',brands:'/brands/',platform:'/platform-accounts/',plans:'/content-plans/',campaigns:'/campaigns/',items:'/content-items/',tasks:'/tasks/',teams:'/teams/',strategies:'/strategies/'}[k];
 if(ep)apiCall(ep+row._id,{method:'DELETE'}).catch(()=>{});
};

const _origNewPlanP=newPlanP;
newPlanP=function(i){
 _origNewPlanP(i);
 const origCb=window._cb;
 if(origCb){
  window._cb=function(v){
   origCb(v);
   const createdPlan=PLANS[PLANS.length-1];
   if(!getApiToken()||!createdPlan)return;
   const brandId=API_CACHE.brandsByName[createdPlan.brand];
   const platformAccountId=API_CACHE.platformsByAccount[createdPlan.platform];
   if(brandId&&platformAccountId){
    const now=new Date();
    apiCall('/content-plans',{method:'POST',body:{brandId,platformAccountId,title:createdPlan.title,year:now.getFullYear(),month:now.getMonth()+1}}).then(res=>{if(res?.id)createdPlan._id=res.id}).catch(()=>{});
   }
  };
 }
};

const _origNewCamp=newCamp;
newCamp=function(id){
 _origNewCamp(id);
 const origCb=window._cb;
 if(origCb){
  window._cb=function(v){
   origCb(v);
   const p=pl(id);
   const createdCamp=p?.campaigns?.[p.campaigns.length-1];
   if(!getApiToken()||!p?._id||!createdCamp)return;
   apiCall('/campaigns',{method:'POST',body:{contentPlanId:p._id,name:createdCamp.name,objective:createdCamp.objective||null,startDate:TODAY,endDate:'2026-12-31'}}).then(res=>{if(res?.id)createdCamp._id=res.id}).catch(()=>{});
  };
 }
};

const _origItSave=itSave;
itSave=function(pid,eid){
 _origItSave(pid,eid);
 if(!getApiToken())return;
 const p=pl(pid);
 if(!p)return;
 const item=eid?fItem(eid)?.[0]:p.items[p.items.length-1];
 if(!item)return;
 if(eid&&item._id){
  apiCall('/content-items/'+item._id,{method:'PATCH',body:{title:item.title,type:item.type,scheduledDate:item.date||TODAY,caption:item.caption||null,notes:item.notes||null}}).catch(()=>{});
 }else if(!eid&&p._id){
  apiCall('/content-items',{method:'POST',body:{contentPlanId:p._id,title:item.title,type:item.type,scheduledDate:item.date||TODAY,caption:item.caption||null,notes:item.notes||null}}).then(res=>{if(res?.id)item._id=res.id}).catch(()=>{});
 }
};

const _origSaveTask=saveTask;
saveTask=function(){
 const beforeLen=TK.length;
 _origSaveTask();
 if(TK.length>beforeLen&&getApiToken()){
  const t=TK[0];
  const assignedTo=API_CACHE.usersByName[t.assignee];
  if(assignedTo){
   apiCall('/tasks/direct',{method:'POST',body:{title:t.title,description:t.desc||null,assignedTo,priority:t.priority,plannedDeadline:t.planned}}).then(res=>{if(res?.id)t._id=res.id}).catch(()=>{});
  }
 }
};

const _origTset=tset;
tset=function(id,s){
 const t=TK.find(x=>x.id===id);
 _origTset(id,s);
 if(t?._id&&getApiToken()){
  apiCall('/tasks/'+t._id+'/status',{method:'PATCH',body:{status:t.status}}).catch(()=>{});
 }
};

const _origUpS=upS;
upS=function(inp){
 const f=inp.files?.[0];
 _origUpS(inp);
 if(!f||!getApiToken())return;
 const bName=S.brand;
 const brandId=API_CACHE.brandsByName[bName];
 if(!brandId)return;
 (async()=>{
  try{
   let stratInfo=API_CACHE.strategiesByBrand[bName];
   if(!stratInfo?.id){
    const created=await apiCall('/strategies',{method:'POST',body:{brandId,title:bName+' Strategy'}});
    if(created?.id)stratInfo={id:created.id};
   }
   if(stratInfo?.id){
    const fd=new FormData();
    fd.append('file',f);
    const ver=await apiCall('/strategies/'+stratInfo.id+'/versions',{method:'POST',body:fd,isForm:true});
    API_CACHE.strategiesByBrand[bName]={id:stratInfo.id,versionId:ver?.id};
   }
  }catch(e){}
 })();
};

const _origSgo=sgo;
sgo=function(a){
 const bName=S.brand;
 const reason=($('#rs')||{}).value||'';
 _origSgo(a);
 if(!getApiToken())return;
 const stratInfo=API_CACHE.strategiesByBrand[bName];
 if(!stratInfo?.id||!stratInfo?.versionId)return;
 if(a==='client'||a==='approve'){
  apiCall(`/strategies/${stratInfo.id}/versions/${stratInfo.versionId}/approve`,{method:'POST',body:{comment:null}}).catch(()=>{});
 }else if(a==='reject'){
  apiCall(`/strategies/${stratInfo.id}/versions/${stratInfo.versionId}/feedback`,{method:'POST',body:{message:reason}}).catch(()=>{});
 }
};

const _origObSubmit=obSubmit;
obSubmit=function(){
 const secIdx=OB.sec;
 _origObSubmit();
 if(!getApiToken())return;
 const answers=OBS[secIdx][1].filter(q=>(OB.a[q[0]]||'').trim()).map(q=>({questionCode:q[0],answer:OB.a[q[0]]}));
 if(answers.length){
  apiCall('/client-onboarding/selection',{method:'PUT',body:{mainCategory:OB.cat,activityType:OB.act}}).catch(()=>{});
  apiCall('/client-onboarding/answers',{method:'PUT',body:{answers}}).catch(()=>{});
 }
};

const _origObFinish=obFinish;
obFinish=function(){
 _origObFinish();
 if(getApiToken()){
  apiCall('/client-onboarding/submit',{method:'POST'}).catch(()=>{});
 }
};

const _origNview=nview;
nview=function(i){
 const r=D.notifications.rows[i];
 if(r?._id&&getApiToken()){
  apiCall('/notifications/'+r._id+'/read',{method:'PATCH'}).catch(()=>{});
 }
 _origNview(i);
};

const _origTeamSave=teamSave;
teamSave=function(){
 const beforeLen=T.length;
 _origTeamSave();
 if(T.length>beforeLen&&getApiToken()){
  const newName=T[T.length-1];
  const info=TX[newName];
  const teamLeadId=API_CACHE.usersByName[info?.lead];
  apiCall('/teams',{method:'POST',body:{name:newName,description:info?.desc!=='—'?info?.desc:null,teamLeadId}}).then(res=>{if(res?.id){API_CACHE.teamsByName[newName]=res.id;if(TX[newName])TX[newName]._id=res.id}}).catch(()=>{});
 }
};

const _origTeamUpd=teamUpd;
teamUpd=function(i){
 const oldName=T[i];
 const teamId=TX[oldName]?._id||API_CACHE.teamsByName[oldName];
 _origTeamUpd(i);
 const newName=T[i];
 const info=TX[newName];
 if(teamId&&getApiToken()){
  const teamLeadId=API_CACHE.usersByName[info?.lead];
  apiCall('/teams/'+teamId,{method:'PATCH',body:{name:newName,description:info?.desc!=='—'?info?.desc:null,teamLeadId}}).catch(()=>{});
 }
};

const _origTeamRm=teamRm;
teamRm=function(i){
 const oldName=T[i];
 const teamId=TX[oldName]?._id||API_CACHE.teamsByName[oldName];
 _origTeamRm(i);
 if(teamId&&getApiToken()){
  apiCall('/teams/'+teamId,{method:'DELETE'}).catch(()=>{});
 }
};

const _origArch=arch;
arch=function(i){
 const b=D.brands.rows[i];
 _origArch(i);
 if(b?._id&&getApiToken()){
  apiCall('/brands/'+b._id,{method:'PATCH',body:{status:'PAUSED'}}).catch(()=>{});
 }
};

const _origGen=gen;
gen=function(){
 _origGen();
 const first=D.briefs.rows[0];
 const brandId=API_CACHE.brandsByName[first?.brandId];
 if(brandId&&getApiToken()){
  apiCall('/brand-briefs/'+brandId+'/generate',{method:'POST'}).then(res=>{if(res?.id)first._id=res.id}).catch(()=>{});
 }
};

const _origUsersRun=D.users.run;
D.users.run=function(a,r){
 _origUsersRun.call(D.users,a,r);
 if(r?._id&&getApiToken()){
  apiCall('/users/'+r._id+'/'+(r.isActive?'activate':'deactivate'),{method:'PATCH'}).catch(()=>{});
 }
};

const _origBriefsRun=D.briefs.run;
D.briefs.run=function(a,r){
 _origBriefsRun.call(D.briefs,a,r);
 if(r?._id&&getApiToken()){
  apiCall('/brand-briefs/'+r._id+'/approve',{method:'POST',body:{comment:null}}).catch(()=>{});
 }
};

const _origPlansRun=D.plans.run;
D.plans.run=function(a,r){
 _origPlansRun.call(D.plans,a,r);
 if(r?._id&&getApiToken()){
  const apiStatus=r.status==='REVIEW'?'IN_REVIEW':r.status;
  apiCall('/content-plans/'+r._id+'/status',{method:'PATCH',body:{status:apiStatus}}).catch(()=>{});
 }
};

render();
if(getApiToken())hydrateFromBackend();
