const $=(s,e=document)=>e.querySelector(s);
const IC={grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
box:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',doc:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',flag:'<path d="M5 21V4M5 5h12l-2 4 2 4H5"/>',cal:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',check:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',users:'<circle cx="9" cy="9" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.200 6 5.500"/><path d="M16 6.500a3 3 0 010 5.600M18 14.800c2 .7 3 2.400 3 5.200"/>',user:'<circle cx="12" cy="8.500" r="3.500"/><path d="M5 20c0-3.800 3.100-6 7-6s7 2.200 7 6"/>',bell:'<path d="M6 16V11a6 6 0 0112 0v5l1.500 2h-15z"/><path d="M10 21h4"/>',file:'<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/>',bolt:'<path d="M13 3L5 13.500h6L10 21l8-10.500h-6z"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M5.600 18.400l2.100-2.100M16.300 7.700l2.100-2.100"/>',link:'<path d="M10 14a4 4 0 005.600 0l3-3a4 4 0 00-5.600-5.600l-1 1M14 10a4 4 0 00-5.600 0l-3 3A4 4 0 0011 18.600l1-1"/>',search:'<circle cx="11" cy="11" r="6.500"/><path d="M16 16l4 4"/>',lock:'<rect x="5" y="10" width="14" height="10" rx="3"/><path d="M8 10V7a4 4 0 018 0v3"/>',clip:'<rect x="5" y="4" width="14" height="17" rx="3"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',eyeOff:'<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',logout:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${IC[n]}</svg>`;
const T=['Brand Strategy & Growth','Creative & Motion Studio','Performance Ops','Social & Community','Editorial & Brand Voice'];
const ROLES={admin:'Admin',am:'Account Manager',cc:'Content Creator',emp:'Creative',client:'Client'};
const ME={admin:['Elena Vance','Workspace owner'],am:['Omar Haddad','Account Manager'],cc:['Lina Aziz','Content Creator'],emp:['Karim Fouad','Creative · Video Editor'],client:['Sara Nabil','Client · Lumen Skincare']};
const S={authed:false,role:'admin',p:{CREATE_CONTENT:true,MANAGE_CONTENT:true,REVIEW_CONTENT:false,PUBLISH_CONTENT:false},page:'dashboard',auth:'login',q:'',nf:'all',open:false,err:{},brand:null,clientBrand:null,sub:null,
 forgotEmail:'',otp:'',otpEmail:'',otpExpiresAt:0,otpLeft:0,resendAt:0,resendLeft:0,sent:0,busy:false,resetToken:'',resetEmail:'',newPassword:'',confirmPassword:'',loginNotice:'',
 mailCfg:{loaded:false,configured:false,provider:null,smtpUser:'',from:'',showSetup:false,tab:'resend'},
 theme:(()=>{try{return localStorage.getItem('orvia_theme')||'light'}catch{return 'light'}})()};
const STRENGTH_LABELS=['Very Weak','Weak','Fair','Good','Strong'];
function passwordChecks(value){
 const pw=String(value||'');
 return [
  {label:'At least 12 characters long',ok:pw.length>=12},
  {label:'Contains an uppercase letter (A-Z)',ok:/[A-Z]/.test(pw)},
  {label:'Contains a number (0-9)',ok:/\d/.test(pw)},
  {label:'Contains a special symbol (!@#$%^&*)',ok:/[^A-Za-z0-9]/.test(pw)}
 ];
}
function formatCountdown(total){
 const s=Math.max(0,Number(total)||0);
 return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}
const PERM=Object.keys(S.p);
const N={dashboard:['Dashboard','grid'],brands:['Brands','box'],briefs:['Brand Briefs','doc'],campaigns:['Campaigns','flag'],plans:['Content Plans','cal'],items:['Content Items','layers'],tasks:['Tasks','check'],platform:['Platform Accounts','link'],teams:['Teams','users'],users:['Users','user'],files:['Files','file'],strategies:['Strategies','bolt'],notifications:['Notifications','bell'],meta:['Meta Settings','gear'],onboarding:['Onboarding','clip'],brief:['Brand Brief','doc'],strategy:['Strategy','bolt'],account:['Profile & Password','lock']};
const NAV={admin:['dashboard','brands','tasks','teams','users','account'],am:['dashboard','brands','tasks','teams','account'],cc:['brands','tasks','account'],emp:['tasks','account'],client:['onboarding','brief','strategy','notifications','brands','account']};
const has=_c=>S.role!=='client';
const locked=k=>(S.role==='admin'&&k==='briefs')||(S.role==='cc'&&['briefs','platform'].includes(k))||(S.role==='am'&&k==='platform')||S.role==='client';
const can=k=>{if(D[k].ro||S.role==='client'||S.role==='emp'||locked(k))return false;if(S.role==='admin')return true;return S.role==='am'?['briefs','files','brands'].includes(k):['files'].includes(k)};
const BR=['Lumen Skincare','Nord Coffee','Atlas Fitness','Kiwa Kids','Bloom Florals','Sahara Travel','Pixel Pulse'];
const ST=['DRAFT','REVIEW','APPROVED','PUBLISHED'],PR=['LOW','MEDIUM','HIGH'],TS=['TODO','IN_PROGRESS','DONE'];
const D={
users:{t:'Users',n:'user',d:'Add people to the workspace and manage their role, job title and team.',api:['GET /users','POST /users','PATCH /users/:id','DELETE /users/:id'],
 cols:[['fullName','Name'],['email','Email'],['roleId','System role'],['jobTitleId','Job title'],['teamId','Team'],['isActive','Status']],
 f:[['fullName','text'],['email','email'],['roleId','role'],['jobTitleId','job'],['teamId','fk',T],['isActive','switch']],req:['fullName','email','roleId','jobTitleId'],
 rows:[{fullName:'Elena Vance',email:'elena@agency-clean.co',roleId:'Admin',jobTitleId:'Workspace Owner',teamId:'Brand Strategy & Growth',isActive:true},{fullName:'Omar Haddad',email:'omar@agency-clean.co',roleId:'Account Manager',jobTitleId:'Account Manager',teamId:'Performance Ops',isActive:true},{fullName:'Lina Aziz',email:'lina@agency-clean.co',roleId:'Content Creator',jobTitleId:'Content Creator',teamId:'Creative & Motion Studio',isActive:true},{fullName:'Karim Fouad',email:'karim@agency-clean.co',roleId:'Creative',jobTitleId:'Video Editor',teamId:'Social & Community',isActive:true},{fullName:'Mona Saeed',email:'mona@agency-clean.co',roleId:'Creative',jobTitleId:'Graphic Designer',teamId:'Editorial & Brand Voice',isActive:false},{fullName:'Sara Nabil',email:'sara@lumen.com',roleId:'Client',jobTitleId:'Client',teamId:'—',isActive:true}],
 acts:r=>[[r.isActive?'Deactivate':'Reactivate','tog']],run(a,r){r.isActive=!r.isActive;toast(r.isActive?'Reactivated':'Deactivated')}},
brands:{t:'Brands',n:'brand',d:'Brands, their owners and everything linked to them.',api:['GET /brands','GET /brands/:id','POST /brands'],
 cols:[['name','Brand'],['industry','Industry'],['teamId','Team'],['accountManagerId','Account manager'],['status','Status']],
 f:[['name','text'],['industry','text'],['websiteUrl','text'],['description','textarea'],['status','select',['ACTIVE','PAUSED','ONBOARDING']],['email','email'],['password','password'],['accountManagerId','fk',['Omar Haddad']],['teamId','fk',T]],req:['name','status'],
 rows:BR.map((b,i)=>({name:b,industry:['Beauty','Food & Beverage','Fitness','Retail','Lifestyle','Travel','Tech'][i],teamId:T[[0,0,1,1,2,3,4][i]],accountManagerId:'Omar Haddad',status:i==5?'ONBOARDING':i==6?'PAUSED':'ACTIVE',email:i===0?'sara@lumen.com':'',clientId:i===0?'Sara Nabil':''}))},
briefs:{t:'Brand Briefs',n:'brief',d:'AI-generated briefs per brand, with version and approval status.',api:['GET /brand-briefs','GET /brand-briefs/:id','PATCH /brand-briefs/:id','POST /brand-briefs/:id/approve','POST /brand-briefs/:brandId/generate'],noCreate:true,noDelete:true,gen:true,
 cols:[['brandId','Brand'],['version','Version'],['status','Status'],['updatedAt','Updated']],f:[['status','select',['GENERATED','APPROVED','NEEDS_CHANGES','REJECTED']],['notes','textarea']],req:['status'],
 rows:[{brandId:'Lumen Skincare',version:'v3',status:'GENERATED',updatedAt:'2026-11-15',content:{targetAudience:'Women 25–40',toneOfVoice:'Warm, expert',objectives:['Clean ingredients','Skin education']}},{brandId:'Nord Coffee',version:'v2',status:'APPROVED',updatedAt:'2026-11-10',content:{targetAudience:'Urban professionals',toneOfVoice:'Calm, confident',objectives:['Craft','Ritual']}},{brandId:'Atlas Fitness',version:'v1',status:'FAILED',updatedAt:'2026-11-14',errorMessage:'Generation timed out',content:{}}],
 acts:r=>['GENERATED','READY','NEEDS_CHANGES'].includes(r.status)&&(S.role==='am'||S.role==='admin')?[['Approve','ap'],...(r.status!=='NEEDS_CHANGES'?[['Request changes','nc']]:[])]:[],
 run(a,r){if(a==='nc'){r.status='NEEDS_CHANGES';toast('Brief marked as needs changes')}else{r.status='APPROVED';toast('Brief approved')}}},
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
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeUrl(u){
 const s=String(u??'').trim();
 if(!s||!/^https?:\/\//i.test(s))return '';
 try{const p=new URL(s);return p.protocol==='http:'||p.protocol==='https:'?s:''}catch{return ''}
}
function isAllowedPage(role,page){
 const allowed=NAV[role]||NAV.admin;
 return Boolean(page&&(allowed.includes(page)||page==='notifications'));
}
function enforceRoleRoute(){
 const allowed=NAV[S.role]||NAV.admin;
 if(!isAllowedPage(S.role,S.page)){
  S.page=allowed[0];S.brand=null;S.sub=null;S.det=null;return true;
 }
 return false;
}
let _searchTimer=null;
let _searchResults=[];
function hlMatch(text,q){
 const raw=String(text??'');
 if(!q)return esc(raw);
 const idx=raw.toLowerCase().indexOf(q);
 if(idx<0)return esc(raw);
 return esc(raw.slice(0,idx))+'<mark class="search-hl">'+esc(raw.slice(idx,idx+q.length))+'</mark>'+esc(raw.slice(idx+q.length));
}
function collectSearchResults(q){
 const out=[];
 if(!q)return out;
 const allowed=NAV[S.role]||NAV.admin;
 if(isAllowedPage(S.role,'users')){
  D.users.rows.forEach((u,i)=>{
   if([u.fullName,u.email,u.roleId,u.jobTitleId,u.teamId,u.isActive?'active':'inactive'].join(' ').toLowerCase().includes(q)){
    out.push({group:'Users',title:u.fullName||'User',sub:[u.email,u.roleId,u.jobTitleId].filter(Boolean).join(' · '),tag:u.isActive?'Active':'Inactive',run:()=>{S.page='users';S.q='';render(false);act('users',i,'view')}});
   }
  });
 }
 if(isAllowedPage(S.role,'brands')){
  D.brands.rows.forEach((b,i)=>{
   if(S.role==='client'&&b.name!==curClientBrand())return;
   if([b.name,b.industry,b.teamId,b.accountManagerId,b.status,b.email].join(' ').toLowerCase().includes(q)){
    out.push({group:'Brands',title:b.name,sub:[b.industry,b.teamId].filter(Boolean).join(' · '),tag:b.status||'',run:()=>{S.page='brands';S.q='';act('brands',i,'view')}});
   }
  });
 }
 if(isAllowedPage(S.role,'teams')){
  T.forEach(t=>{
   const info=typeof TX!=='undefined'&&TX[t]?TX[t]:{};
   if([t,info.desc,info.lead].join(' ').toLowerCase().includes(q)){
    out.push({group:'Teams',title:t,sub:info.lead?'Lead: '+info.lead:(info.desc||'Team'),tag:'Team',run:()=>{S.page='teams';S.q='';render(false);if(typeof teamView==='function')teamView(t)}});
   }
  });
 }
 if(isAllowedPage(S.role,'tasks')&&typeof TK!=='undefined'){
  const me=typeof MEN!=='undefined'?MEN[S.role]:'';
  TK.forEach(t=>{
   if((S.role==='emp'||S.role==='cc')&&t.assignee!==me)return;
   if([t.title,t.brand,t.assignee,t.status,t.priority].join(' ').toLowerCase().includes(q)){
    out.push({group:'Tasks',title:t.title,sub:[t.brand,t.assignee].filter(Boolean).join(' · '),tag:t.status||'',run:()=>{S.page='tasks';S.q='';render(false);if(typeof tdet==='function')tdet(t.id)}});
   }
  });
 }
 if(typeof PLANS!=='undefined'){
  PLANS.forEach(p=>{
   if(S.role==='client'&&p.brand!==curClientBrand())return;
   (p.items||[]).forEach(it=>{
    if([it.title,it.type,it.platform,it.assignee,it.stage,p.brand,p.title].join(' ').toLowerCase().includes(q)){
     out.push({group:'Content items',title:it.title,sub:[p.brand,it.platform,it.type].filter(Boolean).join(' · '),tag:it.stage||'DRAFT',run:()=>{S.q='';if(typeof openD==='function')openD({t:'item',id:it.id})}});
    }
   });
  });
 }
 if(isAllowedPage(S.role,'requests')&&typeof REQ!=='undefined'){
  REQ.forEach(r=>{
   if(S.role==='client'&&r.brand!==curClientBrand())return;
   if([r.text,r.brand,r.kind,r.st,r.team].join(' ').toLowerCase().includes(q)){
    out.push({group:'Requests',title:r.text,sub:[r.brand,r.kind].filter(Boolean).join(' · '),tag:r.st||'',run:()=>{S.page='requests';S.q='';render(false)}});
   }
  });
 }
 allowed.forEach(p=>{
  const label=N[p]?.[0]||p;
  if(label.toLowerCase().includes(q)||p.toLowerCase().includes(q)){
   out.push({group:'Pages',title:label,sub:'Go to '+label,tag:'Page',run:()=>go(p)});
  }
 });
 return out;
}
function renderSearchDropdown(){
 const dd=$('#search-dd');
 if(!dd)return;
 const q=(S.q||'').trim().toLowerCase();
 if(!q){dd.classList.remove('open');dd.innerHTML='';_searchResults=[];return}
 _searchResults=collectSearchResults(q);
 if(!_searchResults.length){
  dd.innerHTML=`<div class="search-dd-empty">No matches for “${esc(S.q.trim())}”</div>`;
  dd.classList.add('open');
  return;
 }
 const groups={};
 _searchResults.forEach((item,idx)=>{(groups[item.group]=groups[item.group]||[]).push({...item,idx})});
 dd.innerHTML=Object.entries(groups).map(([grp,items])=>`<div class="search-dd-grp">${esc(grp)} (${items.length})</div>`+items.slice(0,5).map(it=>`<button type="button" class="search-dd-item" onmousedown="event.preventDefault();pickSearchResult(${it.idx})"><div style="min-width:0;overflow:hidden"><b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${hlMatch(it.title,q)}</b>${it.sub?`<small style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${hlMatch(it.sub,q)}</small>`:''}</div>${it.tag?`<span class="tag" style="margin:0;flex:none">${esc(it.tag)}</span>`:''}</button>`).join('')).join('');
 dd.classList.add('open');
}
function openSearchDD(){if((S.q||'').trim())renderSearchDropdown()}
function closeSearchDD(){const dd=$('#search-dd');if(dd)dd.classList.remove('open')}
function pickSearchResult(idx){
 const item=_searchResults[idx];
 closeSearchDD();
 if(item&&typeof item.run==='function')item.run();
}
function onSearch(val,el){
 S.q=String(val??'');
 if(S.q.trim()&&S.det)S.det=null;
 const clr=$('.search-clr');
 if(clr)clr.style.display=S.q?'inline-flex':'none';
 renderSearchDropdown();
 if(_searchTimer)clearTimeout(_searchTimer);
 const ss=el&&typeof el.selectionStart==='number'?el.selectionStart:null;
 const se=el&&typeof el.selectionEnd==='number'?el.selectionEnd:null;
 _searchTimer=setTimeout(()=>{
  _searchTimer=null;
  view(false);
  const inp=$('.search input');
  if(inp&&el&&document.activeElement!==inp){
   try{inp.focus({preventScroll:true});if(ss!==null)inp.setSelectionRange(ss,se)}catch{/* ignore */}
  }
 },60);
}
function clearSearch(){
 S.q='';
 if(_searchTimer){clearTimeout(_searchTimer);_searchTimer=null}
 const inp=$('.search input');
 if(inp){inp.value='';try{inp.focus({preventScroll:true})}catch{/* ignore */}}
 const clr=$('.search-clr');
 if(clr)clr.style.display='none';
 closeSearchDD();
 view(false);
}
const hum=s=>s.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()).replace(/ Id$/,'');
const PL={ok:['ACTIVE','READY','APPROVED','DONE','PUBLISHED'],wn:['REVIEW','IN_PROGRESS','GENERATING','MEDIUM','PAUSED','ONBOARDING','NEEDS_CHANGES'],er:['FAILED','HIGH','REJECTED'],lc:['DRAFT'],in:['TODO','SUBMITTED','GENERATED']};
const pill=v=>{if(typeof v==='boolean')return v?'<span class="pill ok">Active</span>':'<span class="pill er">Inactive</span>';const c=Object.keys(PL).find(k=>PL[k].includes(v))||'';return `<span class="pill ${c}">${esc(String(v??'').replace('_',' ').toLowerCase().replace(/^./,x=>x.toUpperCase()))}</span>`};
const PK=['status','priority','isActive'];
function cell(k,v,_E,first,_row){let h;if(k==='isRead')h=v?'<span class="pill">Read</span>':'<span class="pill in">Unread</span>';else if(PK.includes(k))h=pill(v);else if(/date|deadline|updatedAt/i.test(k))h=`<span class="mono">${esc(v||'—')}</span>`;else if((k==='accountUrl'||k==='websiteUrl')&&v){const su=safeUrl(v);h=su?`<a class="lk" href="${esc(su)}" target="_blank" rel="noopener noreferrer">${esc(v)}</a>`:esc(v)}else h=v==null||v===''?'—':esc(v);
 return first&&!['isRead'].includes(k)?`<b>${h}</b>`:h}
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;t.setAttribute('role','status');document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
let _lastModalTrigger=null;
function closeModalEl(o){
 if(o)o.remove();
 if(!document.querySelector('.ov')&&_lastModalTrigger&&document.contains(_lastModalTrigger)){
  try{_lastModalTrigger.focus({preventScroll:true})}catch{/* ignore */}
  _lastModalTrigger=null;
 }
}
function modal(h){
 _lastModalTrigger=document.activeElement instanceof HTMLElement?document.activeElement:null;
 const o=document.createElement('div');o.className='ov';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.tabIndex=-1;o.innerHTML=h;
 const h2=o.querySelector('h2');if(h2){if(!h2.id)h2.id='dlg-h-'+Math.random().toString(36).slice(2,8);o.setAttribute('aria-labelledby',h2.id)}
 o.onclick=e=>{if(e.target===o)closeModalEl(o)};document.body.appendChild(o);
 const f=o.querySelector('input:not([type="hidden"]):not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex="-1"])')||o.querySelector('.dlg')||o;
 if(f&&typeof f.focus==='function'){if(!f.matches('input,select,textarea,button,[tabindex]'))f.tabIndex=-1;try{f.focus({preventScroll:true})}catch{f.focus()}}
 return o;
}
const close=()=>{document.querySelectorAll('.ov').forEach(o=>o.remove());if(_lastModalTrigger&&document.contains(_lastModalTrigger)){try{_lastModalTrigger.focus({preventScroll:true})}catch{/* ignore */}}_lastModalTrigger=null};
/* pages */
function getBrandBriefState(brandName){
 const target=brandName||S.brand||BR[0]||'';
 const list=D.briefs.rows.filter(r=>!target||r.brandId===target);
 const generating=Boolean(S.briefGenBusy)||list.some(r=>r.status==='GENERATING');
 const hasActiveBrief=list.some(r=>['GENERATING','GENERATED','READY','APPROVED','NEEDS_CHANGES','DRAFT'].includes(r.status));
 const hasFailedOnly=!hasActiveBrief&&list.some(r=>r.status==='FAILED'||r.status==='REJECTED');
 const obRec=typeof getBrandOnboarding==='function'?getBrandOnboarding(target):null;
 const onboardingSubmitted=Boolean(obRec?.submitted)||hasActiveBrief;
 return {target,list,generating,hasActiveBrief,hasFailedOnly,onboardingSubmitted};
}
const BRIEF_SECTION_LABELS={
 brandOverview:'Brand Overview',
 targetAudience:'Target Audience',
 brandGoals:'Brand Goals',
 competitiveAdvantage:'Competitive Advantage',
 brandCommunication:'Brand Communication',
 marketingStrategy:'Marketing Strategy',
 contentDirection:'Content Direction',
};
function normalizeBriefRow(bf,fallbackBrand=''){
 if(!bf)return null;
 const rawId=bf.serverId??bf.id;
 const numId=typeof rawId==='number'?rawId:Number(String(rawId||'').replace(/^brief-/,''));
 const serverId=Number.isSafeInteger(numId)&&numId>0?numId:undefined;
 const bName=bf.brandName||bf.onboarding?.brand?.name||fallbackBrand||D.brands.rows.find(b=>String(b._id)===String(bf.brandId))?.name||S.brand||BR[0]||'—';
 const statusRaw=bf.backendStatus||bf.status||'GENERATED';
 const status=String(statusRaw).toUpperCase();
 let content=bf.content&&typeof bf.content==='object'?{...bf.content}:{};
 if(bf.sections&&typeof bf.sections==='object'){
  content={...content,...bf.sections};
 }
 if(Array.isArray(bf.objectives)&&bf.objectives.length&&!content.objectives)content.objectives=bf.objectives;
 if(bf.targetAudience&&!content.targetAudience)content.targetAudience=bf.targetAudience;
 if(bf.competitors&&!content.competitors)content.competitors=bf.competitors;
 if(bf.toneOfVoice&&!content.toneOfVoice)content.toneOfVoice=bf.toneOfVoice;
 if(Array.isArray(bf.suggestedQuestions)&&bf.suggestedQuestions.length&&!content.suggestedQuestions)content.suggestedQuestions=bf.suggestedQuestions;
 if(bf.notes&&!content.notes)content.notes=bf.notes;
 if(bf.approvedBy&&!content.approvedBy)content.approvedBy=bf.approvedBy;
 if(bf.approvedAt&&!content.approvedAt)content.approvedAt=bf.approvedAt;
 return {
  ...(serverId?{_id:serverId}:{}),
  brandId:bName,
  version:typeof bf.version==='string'&&bf.version.startsWith('v')?bf.version:'v'+(bf.version||1),
  status,
  updatedAt:bf.generatedAt?String(bf.generatedAt).slice(0,10):(bf.updatedAt?String(bf.updatedAt).slice(0,10):(typeof TODAY!=='undefined'?TODAY:'2026-11-18')),
  ...(bf.errorMessage?{errorMessage:bf.errorMessage}:{}),
  ...(bf.modelName?{modelName:bf.modelName}:{}),
  ...(bf.generatedBy?{generatedBy:typeof bf.generatedBy==='object'?bf.generatedBy.fullName:bf.generatedBy}:{}),
  ...(bf.sourceSnapshot?{sourceSnapshot:bf.sourceSnapshot}:{}),
  content,
 };
}
function buildDemoBriefContent(brandName){
 const b=D.brands.rows.find(x=>x.name===brandName)||{name:brandName,industry:'General',description:''};
 const obSnap=typeof getBrandOnboarding==='function'?getBrandOnboarding(brandName):null;
 const a=obSnap?.a||{};
 const ind=b.industry||obSnap?.cat||'General';
 const catAct=[obSnap?.cat,obSnap?.act].filter(Boolean).join(' · ');
 const pick=(...keys)=>keys.map(k=>a[k]).filter(v=>v&&String(v).trim()).map(v=>String(v).trim());
 const overviewInfo=[
  `${a.q0||b.name} operates in ${catAct||ind}.`,
  ...(a.q1?[`Founded: ${a.q1}`]:[]),
  ...(pick('q2')),
  ...(b.description&&b.description!==a.q2?[b.description]:[]),
  ...(a.q3?[`Main products: ${a.q3}`]:[]),
  ...(a.q4?[`Best seller: ${a.q4}`]:[]),
  ...(a.q5?[`Services: ${a.q5}`]:[]),
 ];
 const audienceInfo=[
  ...(a.q6?[`Target audience: ${a.q6}`]:[`Core customers interested in ${ind} solutions.`]),
  ...(a.q7?[`Age range: ${a.q7}`]:[]),
  ...(a.q8?[`Location: ${a.q8}`]:[]),
 ];
 const goalsInfo=[
  ...(a.q9?[`Top goals: ${a.q9}`]:['Increase brand awareness, engagement, and qualified conversions.']),
  ...(a.q10?[`12-month success: ${a.q10}`]:[]),
  ...(a.q11?[`Upcoming launches: ${a.q11}`]:[]),
 ];
 const compInfo=[
  ...(a.q14?[`Differentiator: ${a.q14}`]:[`${b.name} differentiates through quality, clarity, and customer experience.`]),
  ...(a.q12?[`Key competitors: ${a.q12}`]:[]),
  ...(a.q13?[`Competitor strengths to watch: ${a.q13}`]:[]),
 ];
 const commInfo=[
  ...(a.q15?[`Brand personality: ${a.q15}`]:['Clear, confident, and audience-first communication.']),
  ...(a.q16?[`Tone words: ${a.q16}`]:[]),
  ...(a.q17?[`Visual preferences: ${a.q17}`]:[]),
 ];
 const stratInfo=[
  ...(a.q18?[`Main marketing objective: ${a.q18}`]:['Full-funnel social growth and community engagement.']),
  ...(a.q19?[`Priority platforms: ${a.q19}`]:[]),
 ];
 const dirInfo=[
  ...(a.q20?[`Expected monthly content volume: ${a.q20}`]:['Consistent weekly mix of Reels, Carousels, and Stories.']),
  ...(catAct?[`Category focus: ${catAct}`]:[]),
 ];
 return {
  brandOverview:{
   clientInformation:overviewInfo,
   aiAnalysis:[
    `${a.q0||b.name} is positioned to build strong audience recognition in ${catAct||ind} by highlighting ${a.q4||a.q3||'its core offering'}.`,
   ],
   recommendations:[
    `Anchor monthly content pillars around ${a.q4||a.q3||'core product value'} and clear brand proof points.`,
    'Maintain a unified brand identity across every active social channel.',
   ],
  },
  targetAudience:{
   clientInformation:audienceInfo,
   aiAnalysis:[`Messaging tailored to ${a.q6||'the core audience'}${a.q8?' in '+a.q8:''} will maximize relevance and engagement.`],
   recommendations:['Segment content between first-time discovery reels and retention-focused carousels.'],
  },
  brandGoals:{
   clientInformation:goalsInfo,
   aiAnalysis:[`Aligning campaigns directly with "${a.q9||'awareness and conversion growth'}" keeps monthly output measurable.`],
   recommendations:['Track reach, saves, and conversion clicks per monthly content plan against the 12-month target.'],
  },
  competitiveAdvantage:{
   clientInformation:compInfo,
   aiAnalysis:[`Leading with "${a.q14||'core differentiators'}" positions ${a.q0||b.name} distinctly against ${a.q12||'market competitors'}.`],
   recommendations:['Feature proof points, comparisons, and behind-the-scenes craft regularly.'],
  },
  brandCommunication:{
   clientInformation:commInfo,
   aiAnalysis:[`A "${a.q16||'clear, confident'}" voice builds immediate brand recall across short-form video and captions.`],
   recommendations:['Use concise hooks in the first 3 seconds and consistent visual cues matching client style preferences.'],
  },
  marketingStrategy:{
   clientInformation:stratInfo,
   aiAnalysis:[`Prioritizing ${a.q19||'core social channels'} for "${a.q18||'growth'}" focuses budget and creative effort where ROI is highest.`],
   recommendations:['Run one hero campaign per month supported by weekly educational and community posts.'],
  },
  contentDirection:{
   clientInformation:dirInfo,
   aiAnalysis:['Short-form video drives discovery while carousels and stories deepen consideration and conversion.'],
   recommendations:['Plan 40% educational, 35% product/offer, and 25% community/behind-the-scenes content.'],
  },
  targetAudienceSummary:a.q6||`Core ${ind} audience`,
  toneOfVoice:a.q16||'Clear, warm, confident',
 };
}
function renderBriefContent(r){
 const c=r?.content&&typeof r.content==='object'?r.content:{};
 const secKeys=Object.keys(BRIEF_SECTION_LABELS).filter(k=>c[k]&&typeof c[k]==='object');
 const listHtml=arr=>Array.isArray(arr)&&arr.length?`<ul style="margin:6px 0 0 18px;padding:0;display:grid;gap:4px">${arr.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="mute" style="margin:4px 0 0">—</p>';
 let html='';
 if(r?.errorMessage){
  html+=`<div class="note wn" style="margin-top:16px;background:var(--eb);color:var(--et)"><b>!</b><span>${esc(r.errorMessage)}</span></div>`;
 }
 if(secKeys.length){
  html+=`<div style="display:grid;gap:14px;margin-top:16px">${secKeys.map(k=>{
   const sec=c[k]||{};
   return `<div class="card"><h2 style="margin-bottom:10px">${esc(BRIEF_SECTION_LABELS[k])}</h2>
    <div style="display:grid;gap:12px">
     <div><div class="mono mute">Client information</div>${listHtml(sec.clientInformation)}</div>
     <div><div class="mono mute">AI analysis</div>${listHtml(sec.aiAnalysis)}</div>
     <div><div class="mono mute">Recommendations</div>${listHtml(sec.recommendations)}</div>
    </div></div>`;
  }).join('')}</div>`;
 }
 const metaRows=[];
 if(typeof c.targetAudience==='string'&&c.targetAudience)metaRows.push(['Target audience',esc(c.targetAudience)]);
 if(typeof c.audience==='string'&&c.audience)metaRows.push(['Target audience',esc(c.audience)]);
 if(typeof c.toneOfVoice==='string'&&c.toneOfVoice)metaRows.push(['Tone of voice',esc(c.toneOfVoice)]);
 if(typeof c.tone==='string'&&c.tone)metaRows.push(['Tone of voice',esc(c.tone)]);
 if(typeof c.competitors==='string'&&c.competitors)metaRows.push(['Competitors',esc(c.competitors)]);
 if(Array.isArray(c.objectives)&&c.objectives.length)metaRows.push(['Objectives',esc(c.objectives.join(' · '))]);
 if(Array.isArray(c.pillars)&&c.pillars.length)metaRows.push(['Content pillars',esc(c.pillars.join(' · '))]);
 if(Array.isArray(c.suggestedQuestions)&&c.suggestedQuestions.length)metaRows.push(['Suggested questions',listHtml(c.suggestedQuestions)]);
 if(c.notes)metaRows.push(['Notes',esc(c.notes)]);
 if(c.approvedBy)metaRows.push(['Approved by',esc(c.approvedBy)+(c.approvedAt?' · '+esc(String(c.approvedAt).slice(0,10)):'')]);
 if(metaRows.length){
  html+=`<div class="card" style="margin-top:16px"><h2 style="margin-bottom:10px">Brief summary &amp; notes</h2><dl class="kv" style="margin:0">${metaRows.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>`;
 }
 if(!html){
  html=`<div class="card" style="margin-top:16px"><p class="mute" style="margin:0">${r?.status==='GENERATING'?'Brief content is being generated…':'No content generated for this brief yet.'}</p></div>`;
 }
 const qaList=Array.isArray(r?.sourceSnapshot?.questionsAndAnswers)&&r.sourceSnapshot.questionsAndAnswers.length
  ?r.sourceSnapshot.questionsAndAnswers
  :(()=>{
   const obSnap=typeof getBrandOnboarding==='function'?getBrandOnboarding(r?.brandId):null;
   const ansMap=obSnap?.a||{};
   const out=[];
   if(typeof OBS!=='undefined'){
    OBS.forEach(([secTitle,qs])=>{
     qs.forEach(([code,label])=>{
      const val=ansMap[code];
      if(val&&String(val).trim())out.push({section:secTitle,question:label,answer:val});
     });
    });
   }
   if(!out.length){
    const b=D.brands.rows.find(x=>x.name===r?.brandId);
    if(b){
     out.push({section:'Brand Information',question:'Brand name',answer:b.name});
     if(b.industry)out.push({section:'Brand Information',question:'Industry',answer:b.industry});
     if(b.description)out.push({section:'Brand Information',question:'Description',answer:b.description});
    }
   }
   return out;
  })();
 const answersCard=`<div class="card" style="margin-top:16px"><h2 style="margin-bottom:4px">Client’s original answers</h2><p class="mute" style="margin:0 0 12px;font-size:13px">Intake responses submitted for ${esc(r?.brandId||'this brand')}.</p>${qaList.length?`<dl class="kv" style="margin:0">${qaList.map(q=>`<dt>${esc(q.question)}${q.section?`<div class="mute" style="font-size:11px;font-weight:400">${esc(q.section)}</div>`:''}</dt><dd>${esc(Array.isArray(q.answer)?q.answer.join(', '):q.answer)}</dd>`).join('')}</dl>`:'<p class="mute" style="margin:0">No client onboarding answers recorded yet.</p>'}</div>`;
 return `<div class="g2" style="grid-template-columns:1.35fr 1fr;align-items:start"><div>${html}</div><div>${answersCard}</div></div>`;
}
function head(E,w,k){const a=[];if(w&&!E.noCreate)a.push(`<button class="btn p" onclick="act('${k}',null,'new')">+ ${k==='users'?'Add user':'New '+esc(E.n)}</button>`);
 let briefWaitNote='';
 if(E.gen&&can(k)){
  const bs=getBrandBriefState(S.brand);
  if(bs.generating)a.push(`<button class="btn p" disabled>Generating brief…</button>`);
  else if(bs.hasActiveBrief)a.push(`<button class="btn" disabled title="A brief already exists for this brand">Brief generated</button>`);
  else if(!bs.onboardingSubmitted){
   a.push(`<button class="btn" disabled title="Waiting for the client to submit onboarding answers first">Waiting for client onboarding</button>`);
   briefWaitNote=`<div class="note wn"><b>ⓘ</b><span>The client must complete and submit their onboarding questions first. You’ll receive a notification as soon as they finish so you can generate the Brand Brief once from their answers.</span></div>`;
  }
  else if(bs.hasFailedOnly)a.push(`<button class="btn p" onclick="gen()">Retry generate brief</button>`);
  else a.push(`<button class="btn p" onclick="gen()">Generate brief</button>`);
 }
 if(E.upload)a.push(`<button class="btn" disabled title="Not available in the backend yet">Upload strategy</button>`);
 const lk=locked(k)&&!E.ro;
 return `<div class="ph"><div><span class="eb">${esc(ROLES[S.role])}</span><h1>${esc(E.t)}</h1><p>${esc(E.d)}</p></div><div style="display:flex;gap:8px">${a.join('')}</div></div>${briefWaitNote}${lk?`<div class="note wn"><b>🔒</b><span>View-only for your role. You can open and read these records, but not create, edit, delete or change them.</span></div>`:''}${E.note?`<div class="note"><b>ⓘ</b><span>${esc(E.note)}</span></div>`:''}`}
let listPage=function(k){const E=D[k],w=can(k),q=(S.q||'').trim().toLowerCase();let rows=E.rows.map((r,i)=>({r,i})).filter(({r})=>!S.brand||!r.brandId||r.brandId===S.brand).filter(({r})=>k!=='brands'||S.role!=='client'||r.name===curClientBrand()).filter(({r})=>k!=='notifications'||S.role!=='client'||r.title.includes(curClientBrand())).filter(({r})=>{if(!q)return true;const txt=Object.entries(r).filter(([a])=>a!=='_id'&&a!=='password').map(([a,v])=>a==='isActive'?(v?'active':'inactive'):typeof v==='object'&&v!==null?JSON.stringify(v):String(v??'')).join(' ').toLowerCase();return txt.includes(q)});
 if(k==='notifications'&&S.nf==='unread')rows=rows.filter(({r})=>!r.isRead);
 let h=head(E,w,k);
 if(k==='notifications')h+=`<div class="seg" role="group" aria-label="Filter notifications" style="width:max-content;margin:0 0 16px">${['all','unread'].map(x=>`<button class="${S.nf===x?'on':''}" aria-pressed="${S.nf===x}" onclick="S.nf='${x}';view()">${x==='all'?'All':'Unread'}</button>`).join('')}</div>`;
 if(!rows.length)return h+`<div class="card empty"><span class="chip">${ic(N[k][1])}</span><h2>Nothing here yet</h2><p class="mute">${S.q?'No results match your search. Try a different keyword.':(w?'Create your first '+esc(E.n)+' to get started.':'There are no records to show yet.')}</p></div>`;
 const del=w&&!E.noDelete&&(k!=='users'||S.role==='admin');
 h+=`<div class="card" style="padding:20px 12px"><div class="tw"><table><thead><tr>${E.cols.map(c=>`<th scope="col">${esc(c[1])}</th>`).join('')}<th scope="col"></th></tr></thead><tbody>${rows.map(({r,i})=>`<tr>${E.cols.map((c,j)=>`<td>${j===0?`<span class="chip" style="background:${['var(--lilac)','var(--peach)','var(--sky)','var(--mint)'][i%4]}">${ic(N[k][1])}</span>`:''}${cell(c[0],r[c[0]],E,j===0,r)}</td>`).join('')}<td><div class="ra"><button class="btn sm t" onclick="act('${k}',${i},'view')">View</button>${(E.acts?E.acts(r):[]).map(a=>`<button class="btn sm" onclick="act('${k}',${i},'${a[1]}')">${esc(a[0])}</button>`).join('')}${w&&E.f.length?`<button class="btn sm" onclick="act('${k}',${i},'edit')">Edit</button>`:''}${del?`<button class="btn sm dg" onclick="act('${k}',${i},'del')">Delete</button>`:''}</div></td></tr>`).join('')}</tbody></table></div></div>`;
 return h};
function dashboard(){const U=D.users.rows,B=D.brands.rows,act=U.filter(u=>u.isActive).length,q=(S.q||'').trim().toLowerCase();
 const per=T.map(t=>B.filter(b=>b.teamId===t).length),cov=per.filter(x=>x).length,un=B.filter(b=>!T.includes(b.teamId)).length;
 const TC=['#17171C','#6B5FC7','#E8806A','#1F6B4A','#2F7FB5'],TD=['#17171C','#DCD6FF','#FFD9CD','#D8F2E4','#D8EEF8'];
 const al=[];const f=D.briefs.rows.filter(b=>b.status==='FAILED').length,rv=D.plans.rows.filter(p=>p.status==='REVIEW').length,od=D.tasks.rows.filter(t=>t.status!=='DONE'&&t.plannedDeadline<'2026-11-16').length;
 if(f)al.push(['er',`${f} brief failed to generate`,'Open Brand Briefs and retry.']);if(rv)al.push(['wn',`${rv} content plan waiting for review`,'Review it to unblock the team.']);if(od)al.push(['wn',`${od} overdue task`,'Check Tasks for the deadline.']);
 const teamRows=T.map((t,i)=>({t,i})).filter(({t})=>!q||t.toLowerCase().includes(q)||B.some(b=>b.teamId===t&&b.name.toLowerCase().includes(q)));
 const alRows=al.filter(a=>!q||(a[1]+' '+a[2]).toLowerCase().includes(q));
 let searchBanner='';
 if(q){
  const mb=B.map((b,i)=>({b,i})).filter(({b})=>[b.name,b.industry,b.teamId,b.accountManagerId,b.status].join(' ').toLowerCase().includes(q));
  const mu=U.map((u,i)=>({u,i})).filter(({u})=>[u.fullName,u.email,u.roleId,u.jobTitleId,u.teamId].join(' ').toLowerCase().includes(q));
  const mt=T.filter(t=>t.toLowerCase().includes(q));
  const mtk=(typeof TK!=='undefined'?TK:[]).filter(t=>[t.title,t.brand,t.assignee,t.status].join(' ').toLowerCase().includes(q));
  const tot=mb.length+mu.length+mt.length+mtk.length;
  searchBanner=`<div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><h2>Search results for “${esc(S.q.trim())}”</h2><span class="pill lc">${tot} match${tot===1?'':'es'}</span></div>${tot?`
   ${mb.length?`<div style="margin-bottom:8px"><span class="mono mute">BRANDS (${mb.length})</span><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">${mb.map(({b,i})=>`<button class="btn sm" onclick="S.q='';S.page='brands';act('brands',${i},'view')">${esc(b.name)}</button>`).join('')}</div></div>`:''}
   ${mu.length?`<div style="margin-bottom:8px"><span class="mono mute">USERS (${mu.length})</span><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">${mu.map(({u,i})=>`<button class="btn sm" onclick="act('users',${i},'view')">${esc(u.fullName)} · ${esc(u.roleId)}</button>`).join('')}</div></div>`:''}
   ${mt.length?`<div style="margin-bottom:8px"><span class="mono mute">TEAMS (${mt.length})</span><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">${mt.map(t=>`<button class="btn sm" onclick="teamView(decodeURIComponent('${encodeURIComponent(t)}'))">${esc(t)}</button>`).join('')}</div></div>`:''}
   ${mtk.length?`<div><span class="mono mute">TASKS (${mtk.length})</span><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">${mtk.slice(0,8).map(t=>`<button class="btn sm" onclick="tdet(${t.id})">${esc(t.title)}</button>`).join('')}</div></div>`:''}`:'<p class="mute" style="margin:0">No matching brands, users, teams, or tasks found.</p>'}</div>`;
 }
 return `<div class="ph"><div><span class="eb">${esc(ROLES[S.role])}</span><h1>Dashboard</h1><p>Overview of brands, teams and workload.</p></div><span class="pill ${al.length?'wn':'ok'}">${al.length?al.length+' items need attention':'All systems operational'}</span></div>
${searchBanner}
<div class="g3"><div class="card"><span class="eb" style="background:none;padding:0">Cutout / Editorial</span><div style="font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:12px;margin-top:12px">Total brands</div><div class="big">${B.length}<small>Brands</small></div><div class="sep"><span class="tag pe">${B.length-un} assigned</span><span class="mute">${un} brands without a team</span></div></div>
<div class="card"><span class="eb" style="background:none;padding:0">Arch / Campaign</span><div style="font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:12px;margin-top:12px">Total users</div><div class="big">${U.length}<small>Studio seats</small></div><div class="sep"><span class="tag lc">${act} active</span><span class="mute">${U.length-act} deactivated account</span></div></div>
<div class="card tk" style="overflow:visible"><span class="eb" style="background:none;padding:0">Ticket / Modular</span><div style="font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:12px;margin-top:12px">Active teams</div><div class="big">${T.length}<small>Operational units</small></div><div class="dash"></div><span class="tag" style="background:var(--mint)">${cov===T.length?'All covered':'Gaps found'}</span><span class="mute">${cov} of ${T.length} teams have assigned brands</span></div></div>
<div class="g2"><div><div class="card" style="min-height:420px"><div style="display:flex;justify-content:space-between;align-items:center"><div><h2 style="display:inline">Brands per team</h2> <span class="pill lc" style="margin-left:8px">${teamRows.length} teams</span></div><span class="mono mute">Radius 24px</span></div><p class="mute">Brands currently assigned to each team in the workspace.</p>
${teamRows.length?teamRows.map(({t,i})=>`<div class="tb"><span style="display:flex;gap:10px;align-items:center;font-weight:600"><i style="width:10px;height:10px;border-radius:50%;background:${TD[i%TD.length]};border:1px solid ${TC[i%TC.length]}"></i>${esc(t)}</span><div class="bar"><i style="width:${Math.min(100,per[i]/2*100)}%;background:${TC[i%TC.length]}"></i></div><span>${per[i]} brands</span><span class="mono mute">${Math.min(100,per[i]/2*100)}%</span></div>`).join(''):'<p class="mute">No teams match your search.</p>'}
<div class="sep" style="justify-content:space-between;margin-top:32px"><span class="mute">Total assigned brands: <b style="color:var(--ink)">${B.length-un}</b></span><span class="mute">Updated today</span></div></div></div>
<div><div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h2>Attention required</h2><span class="pill ${alRows.length?'wn':'ok'}">${alRows.length} alerts</span></div>
${alRows.length?alRows.map(a=>`<div class="note ${a[0]==='er'?'':'wn'}" style="${a[0]==='er'?'background:var(--eb);color:var(--et)':''};flex-direction:column;gap:2px"><b>${esc(a[1])}</b><span style="font-weight:500">${esc(a[2])}</span></div>`).join(''):'<div class="note ok"><b>✓</b><span>'+(q?'No alerts match your search.':'Every brand has a team assigned.')+'</span></div>'}</div>
<div class="card dark"><div class="ring"></div><span class="tag">Agency shape DNA</span><span class="mono" style="display:block;color:#BDBCC4;margin-top:16px">A quick tip</span><h2>Make the silhouette do the branding.</h2><p>Balance workloads, not just seats. Spreading brand ownership evenly across teams keeps creative momentum high and avoids bottlenecks.</p></div></div></div>`}
function onboarding(){return `<div class="ph"><div><span class="eb">Client</span><h1>Client onboarding</h1><p>The onboarding details we have for your brand.</p></div></div>
<div class="note"><b>ⓘ</b><span>Submitting answers is not available yet. This page is view-only.</span></div>
<div class="g2" style="grid-template-columns:1.4fr 1fr"><div class="card tk" style="overflow:visible"><span class="eb" style="background:var(--lilac);color:#17171C">Lumen Skincare</span><h2 style="font-size:28px;margin:8px 0 4px">Onboarding summary</h2><div class="dash"></div>
<dl class="kv" style="margin:0"><dt>Main category</dt><dd>Beauty & Personal Care</dd><dt>Activity type</dt><dd>E-commerce</dd><dt>Template version</dt><dd class="mono" style="font-size:13px">v2.1</dd><dt>Status</dt><dd>${pill('SUBMITTED')}</dd><dt>Submitted at</dt><dd class="mono" style="font-size:13px">2026-10-28 14:20</dd></dl></div>
<div class="card" style="background:var(--lilac);border-color:var(--lilac);color:#17171C"><div class="arch" style="background:#F2EFFF"><i style="background:var(--lilac)"></i></div><h2 style="margin-top:100px">What happens next</h2><p style="max-width:260px">Your account manager reviews your answers and prepares your brand brief.</p><button class="btn" disabled style="margin-top:16px;background:#fff">Submit answers</button></div></div>`}
const PROFILE_STORE_KEY='orvia_profiles_v1';
function loadProfilesMap(){try{return JSON.parse(localStorage.getItem(PROFILE_STORE_KEY)||'{}')||{}}catch{return{}}}
function saveProfileStore(email,patch){
 const em=String(email||'').trim().toLowerCase();
 if(!em)return;
 const map=loadProfilesMap();
 map[em]={...(map[em]||{}),...patch};
 try{localStorage.setItem(PROFILE_STORE_KEY,JSON.stringify(map))}catch{/* ignore */}
}
function getCurrentEmail(){
 const m=ME[S.role]||['User',''];
 return String(S.currentEmail||(m[0].split(' ')[0].toLowerCase()+'@agency-clean.co')).trim().toLowerCase();
}
function getCurrentProfile(){
 const m=ME[S.role]||['User',''];
 const em=getCurrentEmail();
 const stored=loadProfilesMap()[em]||{};
 const userRow=D.users.rows.find(u=>String(u.email||'').trim().toLowerCase()===em)||{};
 return {
  fullName:stored.fullName||m[0],
  title:stored.title!==undefined?stored.title:m[1],
  email:em,
  phone:stored.phone!==undefined?stored.phone:(userRow.phone||''),
  photo:stored.photo||'',
 };
}
function applyStoredProfile(email){
 const em=String(email||'').trim().toLowerCase();
 if(!em)return;
 const stored=loadProfilesMap()[em];
 if(!stored)return;
 if(stored.fullName){
  ME[S.role]=[stored.fullName,stored.title!==undefined?stored.title:(ME[S.role]?.[1]||ROLES[S.role])];
  if(typeof MEN!=='undefined')MEN[S.role]=stored.fullName;
 }else if(stored.title!==undefined&&ME[S.role]){
  ME[S.role]=[ME[S.role][0],stored.title];
 }
}
function avatarHtml(name,photo,extraStyle=''){
 const ini=String(name||'U').split(' ').filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase();
 if(photo&&/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(photo)){
  return `<div class="av" style="overflow:hidden;padding:0;${extraStyle}"><img src="${photo}" alt="${esc(name)}" style="width:100%;height:100%;object-fit:cover;display:block"></div>`;
 }
 return `<div class="av"${extraStyle?` style="${extraStyle}"`:''}>${esc(ini)}</div>`;
}
let _pendingPhoto=null;
function onProfilePhoto(inp){
 const f=inp?.files?.[0];
 if(!f)return;
 if(!f.type.startsWith('image/'))return toast('Please choose an image file.');
 if(f.size>4*1024*1024)return toast('Image must be smaller than 4 MB.');
 const reader=new FileReader();
 reader.onload=()=>{
  const img=new Image();
  img.onload=()=>{
   try{
    const max=240;
    const scale=Math.min(1,max/Math.max(img.width,img.height));
    const c=document.createElement('canvas');
    c.width=Math.max(1,Math.round(img.width*scale));
    c.height=Math.max(1,Math.round(img.height*scale));
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    _pendingPhoto=c.toDataURL('image/jpeg',0.85);
   }catch{
    _pendingPhoto=String(reader.result||'');
   }
   const prev=document.getElementById('ep-avatar-preview');
   if(prev)prev.outerHTML=`<div id="ep-avatar-preview" class="av" style="width:68px;height:68px;font-size:22px;overflow:hidden;padding:0;flex-shrink:0"><img src="${_pendingPhoto}" alt="Preview" style="width:100%;height:100%;object-fit:cover;display:block"></div>`;
   const rmBtn=document.getElementById('ep-remove-photo');
   if(rmBtn)rmBtn.style.display='inline-flex';
  };
  img.src=String(reader.result||'');
 };
 reader.readAsDataURL(f);
}
function removeProfilePhoto(){
 _pendingPhoto='';
 const p=getCurrentProfile();
 const ini=String(p.fullName||'U').split(' ').filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase();
 const prev=document.getElementById('ep-avatar-preview');
 if(prev)prev.outerHTML=`<div id="ep-avatar-preview" class="av" style="width:68px;height:68px;font-size:22px;flex-shrink:0">${esc(ini)}</div>`;
 const rmBtn=document.getElementById('ep-remove-photo');
 if(rmBtn)rmBtn.style.display='none';
 const fileInput=document.getElementById('ep-photo-file');
 if(fileInput)fileInput.value='';
}
function editProfile(){
 const p=getCurrentProfile();
 _pendingPhoto=null;
 const ini=String(p.fullName||'U').split(' ').filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase();
 const avPrev=p.photo&&/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(p.photo)
  ?`<div id="ep-avatar-preview" class="av" style="width:68px;height:68px;font-size:22px;overflow:hidden;padding:0;flex-shrink:0"><img src="${p.photo}" alt="${esc(p.fullName)}" style="width:100%;height:100%;object-fit:cover;display:block"></div>`
  :`<div id="ep-avatar-preview" class="av" style="width:68px;height:68px;font-size:22px;flex-shrink:0">${esc(ini)}</div>`;
 modal(`<div class="dlg"><h2>Edit profile</h2><p class="mute" style="margin:0 0 20px">Update your photo, name, title, and phone number.</p>
  <div style="display:flex;gap:16px;align-items:center;margin-bottom:20px;flex-wrap:wrap">
   ${avPrev}
   <div style="display:flex;flex-direction:column;gap:8px">
    <div style="display:flex;gap:8px;flex-wrap:wrap">
     <label class="btn sm" style="cursor:pointer">Upload photo<input id="ep-photo-file" type="file" accept="image/*" style="display:none" onchange="onProfilePhoto(this)"></label>
     <button id="ep-remove-photo" type="button" class="btn sm dg" style="display:${p.photo?'inline-flex':'none'}" onclick="removeProfilePhoto()">Remove photo</button>
    </div>
    <span class="mute" style="font-size:12px">PNG, JPG or WEBP · up to 4 MB</span>
   </div>
  </div>
  <div class="pg">
   <div class="fl"><label><b style="font-weight:600">Full Name <em style="color:var(--et);font-style:normal">*</em></b></label><input id="ep-name" type="text" value="${esc(p.fullName)}" placeholder="Your full name"></div>
   <div class="fl"><label>Phone Number</label><input id="ep-phone" type="tel" value="${esc(p.phone)}" placeholder="e.g. +20 100 000 0000"></div>
   <div class="fl"><label>Title / Subtitle</label><input id="ep-title" type="text" value="${esc(p.title)}" placeholder="e.g. Workspace owner"></div>
   <div class="fl"><label>Email</label><input type="email" value="${esc(p.email)}" readonly style="opacity:.75"></div>
  </div>
  <div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="saveProfile()">Save changes</button></div>
 </div>`);
}
function saveProfile(){
 const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;
 const fullName=($('#ep-name')?.value||'').trim();
 const phone=($('#ep-phone')?.value||'').trim();
 const title=($('#ep-title')?.value||'').trim();
 if(fullName.length<2)return toast('Full name must be at least 2 characters.');
 if(phone.length>30)return toast('Phone number must not exceed 30 characters.');
 dlg._submitted=true;
 const p=getCurrentProfile();
 const nextPhoto=_pendingPhoto!==null?_pendingPhoto:p.photo;
 const nextTitle=title||p.title||ROLES[S.role];
 saveProfileStore(p.email,{fullName,phone,title:nextTitle,photo:nextPhoto});
 ME[S.role]=[fullName,nextTitle];
 if(typeof MEN!=='undefined')MEN[S.role]=fullName;
 const uRow=D.users.rows.find(u=>String(u.email||'').trim().toLowerCase()===p.email);
 if(uRow){uRow.fullName=fullName;uRow.phone=phone}
 _pendingPhoto=null;
 closeM();
 toast('Profile updated');
 render(false);
 if(getApiToken()&&!S.offlineMode){
  apiCall('/auth/me',{method:'PATCH',body:{fullName,phone:phone||null}}).catch(()=>{});
 }
}
function account(){const p=getCurrentProfile();return `<div class="ph"><div><span class="eb">${esc(ROLES[S.role])}</span><h1>Profile & password</h1><p>Your account details and sign-in security.</p></div><button class="btn" onclick="logout()">Log out</button></div>
<div class="g2" style="grid-template-columns:1fr 1fr"><div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div style="display:flex;gap:16px;align-items:center">${avatarHtml(p.fullName,p.photo,'width:56px;height:56px;font-size:18px;flex-shrink:0')}<div><h2>${esc(p.fullName)}</h2><span class="mute">${esc(p.title)}</span></div></div><button type="button" class="btn sm" onclick="editProfile()">Edit profile</button></div>
<dl class="kv"><dt>Email</dt><dd>${esc(p.email)}</dd><dt>Phone</dt><dd>${esc(p.phone||'—')}</dd><dt>Role</dt><dd>${esc(ROLES[S.role])}</dd><dt>Access</dt><dd>${S.role==='admin'?'Full access (bypasses permission checks)':'Granted by role permissions'}</dd><dt>Session</dt><dd><span class="pill ok">Signed in</span></dd></dl></div>
<div class="card"><h2>Change password</h2><p class="mute" style="margin:4px 0 20px">Use at least 8 characters.</p>${F('currentPassword','Current password','password')}${F('newPassword','New password','password','At least 8 characters')}<button class="btn p" onclick="chg()">Update password</button></div></div>`}
const F=(n,l,t='text',h='',v='')=>`<div class="fl ${S.err[n]?'bad':''}"><label>${esc(l)}<span>${esc(n)}</span></label>${t==='password'?`<div class="pw-wrap"><input data-f="${esc(n)}" type="password" value="${esc(v)}" autocomplete="current-password"><button type="button" class="pw-btn" onclick="togPw(this)" aria-label="Show password" title="Show password">${ic('eye')}</button></div>`:`<input data-f="${esc(n)}" type="${esc(t)}" value="${esc(v)}" autocomplete="off">`}${S.err[n]?`<small>${esc(S.err[n])}</small>`:h?`<small>${esc(h)}</small>`:''}</div>`;
function togPw(b){const i=b.previousElementSibling,sh=i.type==='password';i.type=sh?'text':'password';b.innerHTML=ic(sh?'eyeOff':'eye');b.setAttribute('aria-label',sh?'Hide password':'Show password');b.title=sh?'Hide password':'Show password'}
const DEMO_PW_KEY='orvia_demo_pw_hashes_v1';
function hashDemoPw(email,pw){
 const s=String(email||'').trim().toLowerCase()+'::'+String(pw||'');
 let h1=0xdeadbeef^s.length,h2=0x41c6ce57^s.length;
 for(let i=0;i<s.length;i++){
  const ch=s.charCodeAt(i);
  h1=Math.imul(h1^ch,2654435761);
  h2=Math.imul(h2^ch,1597334677);
 }
 h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);
 h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
 return (h2>>>0).toString(16).padStart(8,'0')+(h1>>>0).toString(16).padStart(8,'0');
}
function loadDemoPwMap(){try{return JSON.parse(localStorage.getItem(DEMO_PW_KEY)||'{}')||{}}catch{return{}}}
function saveDemoPw(email,pw){
 const em=String(email||'').trim().toLowerCase();
 if(!em||!pw)return;
 const map=loadDemoPwMap();
 map[em]=hashDemoPw(em,pw);
 try{localStorage.setItem(DEMO_PW_KEY,JSON.stringify(map))}catch{/* ignore */}
}
function checkDemoPw(email,pw){
 const em=String(email||'').trim().toLowerCase();
 const map=loadDemoPwMap();
 return Boolean(map[em]&&map[em]===hashDemoPw(em,pw));
}
const DEMO_BRANDS_KEY='orvia_demo_brands_v1';
function loadDemoBrands(){try{const a=JSON.parse(localStorage.getItem(DEMO_BRANDS_KEY)||'[]');return Array.isArray(a)?a:[]}catch{return[]}}
function saveDemoBrand(brand){
 if(!brand||!brand.name)return;
 const list=loadDemoBrands().filter(x=>String(x.name||'').toLowerCase()!==String(brand.name||'').toLowerCase());
 list.unshift({name:brand.name,industry:brand.industry||'',websiteUrl:brand.websiteUrl||'',description:brand.description||'',status:brand.status||'ACTIVE',email:String(brand.email||'').trim().toLowerCase(),clientId:brand.clientId||brand.name,accountManagerId:brand.accountManagerId||'',teamId:brand.teamId||'—'});
 try{localStorage.setItem(DEMO_BRANDS_KEY,JSON.stringify(list))}catch{/* ignore */}
}
(function hydrateDemoBrands(){
 const saved=loadDemoBrands();
 saved.slice().reverse().forEach(b=>{
  if(!b?.name)return;
  if(!D.brands.rows.some(x=>String(x.name||'').toLowerCase()===String(b.name||'').toLowerCase())){
   D.brands.rows.unshift({...b});
   if(!BR.includes(b.name))BR.push(b.name);
  }
  if(b.email&&!D.users.rows.some(u=>String(u.email||'').trim().toLowerCase()===b.email)){
   D.users.rows.push({fullName:b.name,email:b.email,roleId:'Client',jobTitleId:'Client',teamId:'—',isActive:true,brandName:b.name});
  }
 });
})();
let chg=function(){
 const v=Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i=>[i.dataset.f,i.value]));
 S.err={};
 const cur=String(v.currentPassword||'');
 const next=String(v.newPassword||'');
 if(!cur)S.err.currentPassword='Enter your current password.';
 if(next.length<8)S.err.newPassword='Use at least 8 characters.';
 else if(cur&&next===cur)S.err.newPassword='New password must differ from current password.';
 if(Object.keys(S.err).length)return view(false);
 const em=getCurrentEmail();
 const pwMap=loadDemoPwMap();
 const demo=DEMO_ACCOUNTS[em];
 const currentOk=pwMap[em]?checkDemoPw(em,cur):Boolean(demo&&cur===demo.password);
 if(!currentOk){
  S.err.currentPassword='Current password is incorrect.';
  toast('Current password is incorrect.');
  return view(false);
 }
 if(em)saveDemoPw(em,next);
 toast('Password updated');
 view(false);
};
const PAGES={dashboard,onboarding,account};
/* forms */
function field(n,t,o,v){const r=S.err[n];const c=`<div class="fl ${r?'bad':''}"><label>${esc(hum(n))}<span>${esc(n)}</span></label>`;const e=r?`<small>${esc(r)}</small>`:'';
 let i;if(t==='textarea')i=`<textarea data-f="${esc(n)}">${esc(v??'')}</textarea>`;else if(t==='select')i=`<select data-f="${esc(n)}"><option value="">Select…</option>${o.map(x=>`<option value="${esc(x)}" ${x===v?'selected':''}>${esc(x)}</option>`).join('')}</select>`;
 else if(t==='fk')i=`<input data-f="${esc(n)}" list="dl-${esc(n)}" placeholder="Search…" value="${esc(v??'')}"><datalist id="dl-${esc(n)}">${o.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`;
 else if(t==='switch')return `<div class="fl"><label>${esc(hum(n))}<span>${esc(n)}</span></label><div class="sw"><input type="checkbox" data-f="${esc(n)}" data-b ${v!==false?'checked':''} id="sw"><label for="sw" style="font-weight:600">Active account</label></div></div>`;
 else if(t==='perms')return `<div class="fl" style="grid-column:1/-1"><label>Permissions<span>permissions[]</span></label><div style="display:flex;gap:8px;flex-wrap:wrap">${PERM.map(p=>`<label class="sw" style="font-weight:600"><input type="checkbox" data-pm="${esc(p)}" ${(v||[]).includes(p)?'checked':''}>${esc(p)}</label>`).join('')}</div><small>Only used for Employee accounts. Job title is never a permission.</small></div>`;
 else i=`<input data-f="${esc(n)}" type="${esc(t)}" value="${esc(v??'')}">`;return c+i+e+'</div>'}
function brandForm(i){
 const E=D.brands,r=i==null?{status:'ACTIVE'}:E.rows[i];
 const bad=n=>S.err[n]?'bad':'',msg=n=>S.err[n]?`<small>${esc(S.err[n])}</small>`:'',lb=t=>`<label><b style="font-weight:600">${t} <em style="color:var(--et);font-style:normal">*</em></b></label>`;
 const ams=[...new Set(['Omar Haddad',...D.users.rows.filter(u=>u.roleId==='Account Manager').map(u=>u.fullName)])];
 const statuses=['ACTIVE','PAUSED','ONBOARDING'];
 return `<h2>${i==null?'New brand':'Edit brand'}</h2><p class="mute" style="margin:0 0 20px">${i==null?'Create the brand workspace and set its dedicated login credentials.':'Update brand details.'}</p>
<div class="pg">
 <div class="fl ${bad('name')}">${lb('Brand Name')}<input data-f="name" value="${esc(r.name??'')}" placeholder="e.g. Nova Studio">${msg('name')}</div>
 <div class="fl ${bad('industry')}"><label>Industry</label><input data-f="industry" value="${esc(r.industry??'')}" placeholder="e.g. Beauty, Tech, Food">${msg('industry')}</div>
 <div class="fl ${bad('websiteUrl')}"><label>Website URL</label><input data-f="websiteUrl" type="url" value="${esc(r.websiteUrl??'')}" placeholder="https://example.com">${msg('websiteUrl')}</div>
 <div class="fl ${bad('status')}">${lb('Status')}<select data-f="status">${statuses.map(x=>`<option value="${esc(x)}" ${(r.status||'ACTIVE')===x?'selected':''}>${esc(x)}</option>`).join('')}</select>${msg('status')}</div>
 <div class="fl"><label>Account Manager</label><select data-f="accountManagerId"><option value="">Select…</option>${ams.map(x=>`<option value="${esc(x)}" ${x===r.accountManagerId?'selected':''}>${esc(x)}</option>`).join('')}</select></div>
 <div class="fl"><label>Team</label><select data-f="teamId"><option value="—">—</option>${T.map(x=>`<option value="${esc(x)}" ${x===r.teamId?'selected':''}>${esc(x)}</option>`).join('')}</select></div>
 <div class="fl" style="grid-column:1/-1"><label>Description</label><textarea data-f="description" placeholder="Short overview of the brand…">${esc(r.description??'')}</textarea></div>
</div>
<div style="border-top:1px solid var(--line);margin:4px 0 16px;padding-top:20px">
 <h2 style="font-size:17px">Brand account credentials</h2>
 <p class="mute" style="margin:2px 0 16px">${i==null?'This brand will sign in with its own email and password to open its dedicated brand pages.':'Dedicated login email linked to this brand.'}</p>
 <div class="pg">
  <div class="fl ${bad('email')}"${i!=null?' style="grid-column:1/-1"':''}>${i==null?lb('Brand Email'):'<label>Brand Email</label>'}<input data-f="email" type="email" value="${esc(r.email??'')}" placeholder="brand@company.com"${i!=null?' readonly style="opacity:.75"':''}>${msg('email')}</div>
  ${i==null?`<div class="fl ${bad('password')}">${lb('Password')}<div class="pw-wrap"><input data-f="password" type="password" value="" autocomplete="new-password" placeholder="Min. 12 chars (A-Z, a-z, 0-9, symbol)"><button type="button" class="pw-btn" onclick="togPw(this)" aria-label="Show password" title="Show password">${ic('eye')}</button></div>${msg('password')||'<small>At least 12 characters with uppercase, lowercase, number, and symbol.</small>'}</div>`:''}
 </div>
</div>
<div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="save('brands',${i})">${i==null?'Save brand':'Save changes'}</button></div>`;
}
function briefForm(i){
 const r=i==null?{}:D.briefs.rows[i];
 const c=r.content&&typeof r.content==='object'?r.content:{};
 const statuses=['GENERATED','APPROVED','NEEDS_CHANGES','REJECTED'];
 const curStatus=statuses.includes(r.status)?r.status:'GENERATED';
 return `<h2>Edit brief</h2><p class="mute" style="margin:0 0 20px">Update the brief status and notes for ${esc(r.brandId||'this brand')}.</p>
<div class="pg">
 <div class="fl"><label><b style="font-weight:600">Status <em style="color:var(--et);font-style:normal">*</em></b></label><select data-f="status">${statuses.map(x=>`<option value="${esc(x)}" ${x===curStatus?'selected':''}>${esc(x)}</option>`).join('')}</select></div>
 <div class="fl"><label>Tone of Voice</label><input data-f="toneOfVoice" type="text" value="${esc(c.toneOfVoice||c.tone||'')}" placeholder="e.g. Warm, expert"></div>
 <div class="fl" style="grid-column:1/-1"><label>Target Audience</label><input data-f="targetAudience" type="text" value="${esc(typeof c.targetAudience==='string'?c.targetAudience:(c.audience||''))}" placeholder="e.g. Women 25–40"></div>
 <div class="fl" style="grid-column:1/-1"><label>Notes</label><textarea data-f="notes" placeholder="Review notes or revision guidance…">${esc(c.notes||'')}</textarea></div>
</div>
<div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="save('briefs',${i})">Save brief</button></div>`;
}
function form(k,i){if(k==='users')return userForm(i);if(k==='brands')return brandForm(i);if(k==='briefs')return briefForm(i);const E=D[k],r=i==null?{}:E.rows[i];return `<h2>${i==null?'New '+esc(E.n):'Edit '+esc(E.n)}</h2><p class="mute" style="margin:0 0 20px">Fields use the exact API names.</p><div class="pg">${E.f.filter(f=>!(f[0]==='password'&&i!=null)).map(f=>field(f[0],f[1],f[2],r[f[0]])).join('')}</div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="save('${k}',${i})">Save ${esc(E.n)}</button></div>`}
let save=function(k,i){const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;const E=D[k],o=Object.fromEntries([...dlg.querySelectorAll('[data-f]')].map(x=>[x.dataset.f,x.dataset.b!==undefined?x.checked:x.value]));
 const pm=[...dlg.querySelectorAll('[data-pm]:checked')].map(x=>x.dataset.pm);if(E.f.some(f=>f[0]==='permissions'))o.permissions=pm;
 S.err={};(E.req||[]).forEach(n=>{if(o[n]===''||o[n]==null)S.err[n]='This field is required.'});
 if(k==='users'){
  o.email=(o.email||'').trim().toLowerCase();
  if(o.email&&!S.err.email&&!/^\S+@\S+\.\S+$/.test(o.email))S.err.email='Enter a valid work email.';
  if(o.email&&!S.err.email&&D.users.rows.some((u,idx)=>idx!==i&&String(u.email||'').trim().toLowerCase()===o.email)){
   S.err.email='This email is already assigned to another user. Each email can only have one role.';
  }
  if(i==null){
   const pw=String(o.password||'');
   if(!pw)S.err.password='Password is required.';
   else if(pw.length<12)S.err.password='Password must be at least 12 characters.';
   else if(!/[a-z]/.test(pw)||!/[A-Z]/.test(pw)||!/\d/.test(pw)||!/[^A-Za-z0-9]/.test(pw))S.err.password='Include uppercase, lowercase, a number, and a special character.';
  }
 }
 if(k==='brands'){
  o.name=(o.name||'').trim();
  o.email=(o.email||'').trim().toLowerCase();
  if(o.name&&D.brands.rows.some((b,idx)=>idx!==i&&String(b.name||'').trim().toLowerCase()===o.name.toLowerCase())){
   S.err.name='A brand with this name already exists.';
  }
  if(i==null){
   if(!o.email)S.err.email='Brand email is required.';
   else if(!/^\S+@\S+\.\S+$/.test(o.email))S.err.email='Enter a valid brand email.';
   else if(
    D.users.rows.some(u=>String(u.email||'').trim().toLowerCase()===o.email)||
    D.brands.rows.some(b=>String(b.email||'').trim().toLowerCase()===o.email)
   ){
    S.err.email='This email is already in use by another account.';
   }
   const pw=String(o.password||'');
   if(!pw)S.err.password='Password is required.';
   else if(pw.length<12)S.err.password='Password must be at least 12 characters.';
   else if(!/[a-z]/.test(pw)||!/[A-Z]/.test(pw)||!/\d/.test(pw)||!/[^A-Za-z0-9]/.test(pw))S.err.password='Include uppercase, lowercase, a number, and a special character.';
  }
 }
 if(Object.keys(S.err).length){const ov=$('.ov');ov.innerHTML=`<div class="dlg">${form(k,i).replace(/value="[^"]*"/g,m=>m)}</div>`;{const rs=ov.querySelector('[data-f=roleId]');if(rs&&k==='users'){rs.value=o.roleId;roleCh(rs)}}ov.querySelectorAll('[data-f]').forEach(x=>{if(x.dataset.b!==undefined)x.checked=o[x.dataset.f];else x.value=o[x.dataset.f]??''});return}
 dlg._submitted=true;
 const rawPassword=o.password;
 delete o.password;
 const inv=Boolean(o.sendInvite);delete o.sendInvite;
 if(k==='users'&&i==null){S._pendingUserPassword=rawPassword||'';S._pendingUserInvite=inv;if(rawPassword)saveDemoPw(o.email,rawPassword);o.isActive=true;o.teamId=o.teamId||'—'}
 if(k==='brands'&&i==null){
  S._pendingBrandPassword=rawPassword||'';
  if(rawPassword)saveDemoPw(o.email,rawPassword);
  o.clientId=o.name;
  o.teamId=o.teamId||'—';
  if(!BR.includes(o.name))BR.push(o.name);
  if(!D.users.rows.some(u=>String(u.email||'').trim().toLowerCase()===o.email)){
   D.users.rows.push({fullName:o.name,email:o.email,roleId:'Client',jobTitleId:'Client',teamId:'—',isActive:true,brandName:o.name});
  }
  saveDemoBrand(o);
 }
 if(k==='briefs'&&i!=null){
  const curContent=E.rows[i]?.content&&typeof E.rows[i].content==='object'?{...E.rows[i].content}:{};
  if(o.notes!==undefined)curContent.notes=o.notes;
  if(o.toneOfVoice!==undefined&&o.toneOfVoice.trim())curContent.toneOfVoice=o.toneOfVoice.trim();
  if(o.targetAudience!==undefined&&o.targetAudience.trim())curContent.targetAudience=o.targetAudience.trim();
  delete o.notes;delete o.toneOfVoice;delete o.targetAudience;
  o.content=curContent;
 }
 if(i==null){if(S.brand&&!o.brandId&&['files','platform','briefs'].includes(k))o.brandId=S.brand;E.rows.unshift(o)}else Object.assign(E.rows[i],o);close();
 if(k==='users'&&i==null){
  if(!getApiToken())toast(inv?'User added (demo mode — connect backend to send invitation email)':'User added');
 }else if(k==='brands'&&i==null){
  toast('Brand created with its own login account');
 }else{
  toast(i==null?'Saved':'Changes saved');
 }
 view(false)};
function detail(k,r){const E=D[k];return `<h2>${esc(E.t.replace(/s$/,''))} details</h2><dl class="kv">${Object.entries(r).filter(([a])=>a!=='content'&&a!=='_id'&&a!=='errorMessage').map(([a,v])=>`<dt>${esc(hum(a))}</dt><dd>${a==='status'||a==='isActive'?pill(v):(a==='accountUrl'||a==='websiteUrl')&&safeUrl(v)?`<a class="lk" href="${esc(safeUrl(v))}" target="_blank" rel="noopener noreferrer">${esc(v)}</a>`:Array.isArray(v)?esc(v.join(', ')):esc(v)}</dd>`).join('')}</dl>${k==='briefs'?renderBriefContent(r):(r.content?`<div class="mono mute" style="margin-bottom:8px">content (JSON)</div><pre>${esc(JSON.stringify(r.content,null,2))}</pre>`:'')}<div class="ft"><button class="btn p" onclick="closeM()">Close</button></div>`}
let act=function(k,i,a){S.err={};const E=D[k];if(k==='brands'&&a==='view'){S.brand=E.rows[i].name;S.sub=null;S.q='';return render(false)}if(a==='new')return modal(`<div class="dlg">${form(k,null)}</div>`);const r=E.rows[i];
 if(a==='view')return modal(`<div class="dlg">${detail(k,r)}</div>`);if(a==='edit')return modal(`<div class="dlg">${form(k,i)}</div>`);
 if(a==='del')return modal(`<div class="dlg"><h2>Delete this ${esc(E.n)}?</h2><p class="mute">This can’t be undone.</p><div class="ft"><button class="btn" onclick="closeM()">Keep it</button><button class="btn p" style="background:var(--et);border-color:var(--et)" onclick="E_del('${k}',${i})">Delete ${esc(E.n)}</button></div></div>`);
 E.run(a,r);view(false)};
function cleanupDeletedBrand(brand){
 if(!brand)return;
 const bName=String(brand.name||'').trim().toLowerCase();
 const bEmail=String(brand.email||'').trim().toLowerCase();
 if(bName){
  const brIdx=BR.findIndex(x=>String(x||'').trim().toLowerCase()===bName);
  if(brIdx>=0)BR.splice(brIdx,1);
 }
 if(bEmail){
  for(let idx=D.users.rows.length-1;idx>=0;idx--){
   const u=D.users.rows[idx];
   if(String(u.email||'').trim().toLowerCase()===bEmail&&u.roleId==='Client'){
    D.users.rows.splice(idx,1);
   }
  }
  const pwMap=loadDemoPwMap();
  if(pwMap[bEmail]){
   delete pwMap[bEmail];
   try{localStorage.setItem(DEMO_PW_KEY,JSON.stringify(pwMap))}catch{/* ignore */}
  }
 }
 const savedBrands=loadDemoBrands().filter(x=>{
  const sameName=bName&&String(x.name||'').trim().toLowerCase()===bName;
  const sameEmail=bEmail&&String(x.email||'').trim().toLowerCase()===bEmail;
  return !sameName&&!sameEmail;
 });
 try{localStorage.setItem(DEMO_BRANDS_KEY,JSON.stringify(savedBrands))}catch{/* ignore */}
}
function cleanupDeletedUser(user){
 if(!user)return;
 const uEmail=String(user.email||'').trim().toLowerCase();
 if(!uEmail)return;
 const pwMap=loadDemoPwMap();
 if(pwMap[uEmail]){
  delete pwMap[uEmail];
  try{localStorage.setItem(DEMO_PW_KEY,JSON.stringify(pwMap))}catch{/* ignore */}
 }
}
let E_del=function(k,i){const row=D[k]?.rows?.[i];D[k].rows.splice(i,1);if(k==='brands')cleanupDeletedBrand(row);if(k==='users')cleanupDeletedUser(row);close();toast('Deleted');view(false)};
let gen=function(){
 const bs=getBrandBriefState(S.brand);
 if(!bs.target)return toast('Open a brand first to generate its brief.');
 if(bs.generating)return toast('A brief is already being generated for this brand.');
 if(bs.hasActiveBrief)return toast('A brief already exists for '+bs.target+'.');
 if(!bs.onboardingSubmitted)return toast('The client must submit onboarding before generating a Brand Brief.');
 S.briefGenBusy=true;
 const nextVer=bs.list.reduce((mx,r)=>Math.max(mx,parseInt(String(r.version||'0').replace(/\D/g,''),10)||0),0)+1;
 const todayStr=typeof TODAY!=='undefined'?TODAY:new Date().toISOString().slice(0,10);
 const obSnap=typeof getBrandOnboarding==='function'?getBrandOnboarding(bs.target):null;
 const qaSnap=[];
 if(obSnap?.a&&typeof OBS!=='undefined'){
  OBS.forEach(([secTitle,qs])=>{
   qs.forEach(([code,label])=>{
    const val=obSnap.a[code];
    if(val&&String(val).trim())qaSnap.push({section:secTitle,question:label,answer:val});
   });
  });
 }
 const row={
  brandId:bs.target,
  version:'v'+nextVer,
  status:'GENERATED',
  updatedAt:todayStr,
  generatedBy:typeof MEN!=='undefined'?MEN[S.role]:'',
  ...(qaSnap.length?{sourceSnapshot:{mainCategory:obSnap?.cat||'',activityType:obSnap?.act||'',questionsAndAnswers:qaSnap}}:{}),
  content:buildDemoBriefContent(bs.target),
 };
 D.briefs.rows.unshift(row);
 S.briefGenBusy=false;
 toast('Brand Brief generated from client answers.');
 view(false);
};
/* shell */
let go=function(p){const allowed=NAV[S.role]||NAV.admin;S.page=isAllowedPage(S.role,p)?p:allowed[0];S.q='';if(_searchTimer){clearTimeout(_searchTimer);_searchTimer=null}S.open=false;S.err={};render()};
let setRole=function(r){S.role=r;S.page=NAV[r][0];S.q='';if(_searchTimer){clearTimeout(_searchTimer);_searchTimer=null}render()};
let logout=function(){S.authed=false;S.auth='login';S.clientBrand=null;S.brand=null;render()};
let view=function(sk=true){enforceRoleRoute();const v=$('#view');if(!v)return;if(S.role==='client')S.brand=curClientBrand();const k=S.page,f=()=>{v.innerHTML=PAGES[k]?PAGES[k]():listPage(k)};if(sk){v.innerHTML='<div class="sk" style="width:40%;height:34px"></div><div class="sk" style="width:60%"></div><div class="card"><div class="sk"></div><div class="sk"></div><div class="sk"></div></div>';setTimeout(f,260)}else f()};
let render=function(){const a=$('#app');if(!a)return;if(!S.authed){a.innerHTML=authView();return}enforceRoleRoute();
 const m=ME[S.role],nav=NAV[S.role];
 a.innerHTML=`<aside class="side ${S.open?'open':''}"><div class="logo"><i></i><div><b>ORVIA</b><small>${esc(ROLES[S.role])}</small></div></div><div class="nl">Workspace</div><nav class="nav">${nav.map(p=>`<button class="${S.page===p?'on':''}"${S.page===p?' aria-current="page"':''} onclick="go('${p}')">${ic(N[p][1])}${N[p][0]}${p==='notifications'?'<span class="dot"></span>':''}</button>`).join('')}</nav>
 <div class="sf">${S.role==='emp'?`<div class="mini"><div class="mono mute" style="margin-bottom:8px">UserPermission</div>${PERM.map(p=>`<label style="display:flex;gap:8px;align-items:center;font-size:12px;font-weight:600;padding:3px 0"><input type="checkbox" ${S.p[p]?'checked':''} onchange="S.p['${p}']=this.checked;render()" style="accent-color:#17171C">${p}</label>`).join('')}</div>`:S.role==='admin'?`<div class="mini"><div class="mono mute">SETUP PROGRESS</div><div style="display:flex;justify-content:space-between;margin:4px 0 8px"><b>43%</b><span class="mute">complete</span></div><div class="bar"><i style="width:43%"></i></div></div>`:''}
 <div class="me"><div class="av">${esc(m[0].split(' ').map(x=>x[0]).join(''))}</div><div style="min-width:0;flex:1"><b>${esc(m[0])}</b><div class="mute" style="font-size:12px">${esc(m[1])}</div></div><button type="button" class="btn sm t" onclick="logout()" title="Log out" aria-label="Log out" style="width:34px;height:34px;padding:0;justify-content:center;flex-shrink:0;border-radius:10px">${ic('logout')}</button></div></div></aside>
 <main><header class="top"><div class="crumb">Agency workspace / <b>${N[S.page][0]}</b></div><div class="search-wrap"><label class="search">${ic('search')}<input aria-label="Search this page" placeholder="Search this page…" value="${esc(S.q)}" oninput="onSearch(this.value,this)" onfocus="openSearchDD()" onblur="setTimeout(closeSearchDD,140)" onkeydown="if(event.key==='Escape'){if(S.q){event.preventDefault();clearSearch()}else closeSearchDD()}"><button type="button" class="search-clr" onclick="clearSearch()" aria-label="Clear search" title="Clear search" style="display:${S.q?'inline-flex':'none'};border:0;background:transparent;color:var(--mute);cursor:pointer;font-size:16px;line-height:1;padding:0 4px">×</button></label><div id="search-dd" class="search-dd" role="listbox" aria-label="Search results"></div></div></header><section id="view" aria-live="polite"></section></main>`;
 view()};
/* auth */
function authView(){
 const a=S.auth;
 const formError=S.err.form?`<div class="note wn" role="alert"><b>!</b><span>${esc(S.err.form)}</span></div>`:'';
 const loginNotice=S.loginNotice?`<div class="note ok" role="status"><b>✓</b><span>${esc(S.loginNotice)}</span></div>`:'';
 const themeBtn=`<div class="auth-top"><span class="mono mute">Secure account recovery</span><button type="button" class="btn sm t" onclick="toggleTheme()">${S.theme==='dark'?'☀ Light':'☾ Dark'}</button></div>`;
 const login=`<h1>Welcome back</h1><p class="mute" style="margin:8px 0 20px">Sign in to your ORVIA workspace.</p>${loginNotice}${F('email','Email','email','',S.loginEmail||S.forgotEmail||'')}${F('password','Password','password')}<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px"><a class="lk" onclick="S.auth='forgot';S.loginNotice='';S.err={};render()">Forgot password?</a><button class="btn p" ${S.busy?'disabled':''} onclick="doLogin()">Sign in</button></div>`;
 const forgot=`<h1>Reset your password</h1><p class="mute" style="margin:8px 0 20px">Enter the work email registered to your account and we’ll send a 6-digit verification code.</p>${formError}${F('email','Email','email','',S.forgotEmail||'')}<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button class="btn p" ${S.busy?'disabled':''} onclick="doForgot()">${S.busy?'Sending…':'Send verification code'}</button><a class="lk" onclick="S.auth='verify';S.sent=0;S.err={};render()">I have a code</a></div><div class="note" style="margin-top:14px"><b>i</b><span>For security, we never confirm whether an account exists with this email.</span></div><p><a class="lk" onclick="S.auth='login';S.sent=0;S.otp='';S.resetToken='';S.err={};render()">Back to sign in</a></p>`;
 const checks=passwordChecks(S.newPassword||'');
 const passed=checks.filter(c=>c.ok).length;
 const canReset=Boolean(S.resetToken)&&passed===checks.length&&S.confirmPassword===S.newPassword&&!S.busy;
 const otpDigits=Array.from({length:6},(_,idx)=>esc((S.otp||'')[idx]||''));
 const verify=`<h1>Enter verification code</h1><p class="mute" style="margin:8px 0 20px">We sent a 6-digit code to <b>${esc(S.otpEmail||S.forgotEmail||'your email')}</b>. Enter it below to continue.</p>${S.sent?`<div class="note ok" role="status"><b>✓</b><span>${S._demoOtp?`Demo mode (static preview): your verification code is <b class="mono" style="letter-spacing:2px">${esc(S._demoOtp)}</b>`:S.previewUrl&&safeUrl(S.previewUrl)?`Dev test inbox (SMTP not configured on this machine): <a class="lk" href="${esc(safeUrl(S.previewUrl))}" target="_blank" rel="noopener noreferrer">Open verification email →</a>`:'Verification code sent. Check your inbox and spam folder.'}</span></div>`:''}${S.mailError?`<div class="note wn" role="alert"><b>!</b><span>Email delivery warning: ${esc(S.mailError)}</span></div>`:''}${formError}<div class="fl ${S.err.otp?'bad':''}"><label>Verification code<span>6 digits</span></label><input type="hidden" data-f="otp" value="${esc(S.otp||'')}"><div class="otp-boxes" role="group" aria-label="6-digit verification code">${otpDigits.map((d,idx)=>`<input class="otp-box" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" data-otp-idx="${idx}" value="${d}" aria-label="Digit ${idx+1}" oninput="onOtpBoxInput(this,${idx})" onkeydown="onOtpBoxKey(event,${idx})" onpaste="onOtpBoxPaste(event)">`).join('')}</div>${S.err.otp?`<small>${esc(S.err.otp)}</small>`:'<small>Enter the 6-digit code from your email.</small>'}</div><div class="otp-meta"><span>Expires in <b id="otp-countdown">${formatCountdown(S.otpLeft)}</b></span><span>Max 5 attempts</span></div><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button id="otp-verify-btn" class="btn p" ${S.busy||S.otpLeft<=0?'disabled':''} onclick="doVerifyOtp()">${S.busy?'Verifying…':'Verify code'}</button><a id="otp-resend-link" class="lk" style="opacity:${S.resendLeft>0?'.5':'1'}" onclick="doResendOtp()">${S.resendLeft>0?`Resend in ${S.resendLeft}s`:'Resend code'}</a></div><p><a class="lk" onclick="S.auth='forgot';S.sent=0;S.err={};render()">Use a different email</a> · <a class="lk" onclick="S.auth='login';S.sent=0;S.otp='';S.resetToken='';S.err={};render()">Back to sign in</a></p>`;
 const resetPassword=`<h1>Choose a new password</h1><p class="mute" style="margin:8px 0 20px">Your code is verified. Set a new password for <b>${esc(S.resetEmail||S.otpEmail||'your account')}</b>.</p>${formError}<div class="fl ${S.err.newPassword?'bad':''}"><label>New password<span>min. 12 characters</span></label><div class="pw-wrap"><input id="new-password" data-f="newPassword" type="password" value="${esc(S.newPassword||'')}" autocomplete="new-password" oninput="S.newPassword=this.value;updatePwMeter()"><button type="button" class="pw-btn" onclick="togPw(this)" aria-label="Show password" title="Show password">${ic('eye')}</button></div>${S.err.newPassword?`<small>${esc(S.err.newPassword)}</small>`:''}</div><div class="pw-meter"><div class="pw-meter__head"><span>Password strength</span><b id="pw-strength-label">${S.newPassword?STRENGTH_LABELS[passed]:'—'} (${passed}/4)</b></div><div class="pw-meter__bar">${checks.map((c,i)=>`<i data-pw-seg class="${i<passed?'is-on':''}"></i>`).join('')}</div></div><ul class="pw-req">${checks.map((c,i)=>`<li id="pw-req-${i}" class="${c.ok?'is-ok':''}"><span>✓</span>${c.label}</li>`).join('')}</ul><div class="fl"><label>Confirm new password</label><div class="pw-wrap"><input id="confirm-password" data-f="confirmPassword" type="password" value="${esc(S.confirmPassword||'')}" autocomplete="new-password" oninput="S.confirmPassword=this.value;updatePwMeter()"><button type="button" class="pw-btn" onclick="togPw(this)" aria-label="Show password" title="Show password">${ic('eye')}</button></div><small id="pw-match" class="pw-match" style="display:${S.confirmPassword&&S.confirmPassword===S.newPassword?'inline-flex':'none'}">✓ Passwords match</small><small id="pw-mismatch" class="pw-mismatch" style="display:${S.confirmPassword&&S.confirmPassword!==S.newPassword?'block':'none'}">${esc(S.err.confirmPassword||'Passwords do not match.')}</small></div><button id="pw-submit" class="btn p" ${canReset?'':'disabled'} onclick="doResetPassword()">${S.busy?'Updating…':'Update password'}</button><p><a class="lk" onclick="S.auth='login';S.resetToken='';S.newPassword='';S.confirmPassword='';S.err={};render()">Back to sign in</a></p>`;
 return `<div class="auth"><div class="al">${themeBtn}<div class="logo"><i></i><div><b>ORVIA</b><small>Studio workspace</small></div></div>${{login,forgot,verify,resetPassword}[a]||login}</div><div class="ar"><div class="ring" style="position:absolute;right:-60px;top:-60px;width:260px;height:260px;border-radius:50%;border:1px solid #3A3A44"></div><span class="tag" style="background:transparent;color:#F4F3EF;border-color:#55555E;width:max-content">Agency shape DNA</span><div><h2>Make the silhouette do the branding.</h2><div class="shapes"><div style="width:64px;height:84px;background:var(--lilac);border-radius:32px 32px 0 0"></div><div style="width:84px;height:84px;border-radius:50%;border:1px solid #6E6D72;display:grid;place-items:center"><i style="width:22px;height:22px;border-radius:50%;background:var(--peach)"></i></div><div style="width:76px;height:84px;background:var(--mint);border-radius:0 38px 38px 0"></div><div class="burst" style="position:static;width:76px;height:76px;background:var(--peach)">12</div></div></div></div></div>`}
const DEMO_ACCOUNTS={
 'elena@agency-clean.co':{password:'Admin123456!',role:'admin',fullName:'Elena Vance',subtitle:'Workspace owner'},
 'elena@agency-clean.com':{password:'Admin123456!',role:'admin',fullName:'Elena Vance',subtitle:'Workspace owner'},
 'admin@orvia.com':{password:'Admin123456!',role:'admin',fullName:'Elena Vance',subtitle:'Workspace owner'},
 'omar@agency-clean.co':{password:'Manager123456!',role:'am',fullName:'Omar Haddad',subtitle:'Account Manager'},
 'omar@agency-clean.com':{password:'Manager123456!',role:'am',fullName:'Omar Haddad',subtitle:'Account Manager'},
 'am@orvia.com':{password:'Manager123456!',role:'am',fullName:'Omar Haddad',subtitle:'Account Manager'},
 'lina@agency-clean.co':{password:'Creator123456!',role:'cc',fullName:'Lina Aziz',subtitle:'Content Creator'},
 'lina@agency-clean.com':{password:'Creator123456!',role:'cc',fullName:'Lina Aziz',subtitle:'Content Creator'},
 'cc@orvia.com':{password:'Creator123456!',role:'cc',fullName:'Lina Aziz',subtitle:'Content Creator'},
 'karim@agency-clean.co':{password:'Creative123456!',role:'emp',fullName:'Karim Fouad',subtitle:'Creative · Video Editor'},
 'karim@agency-clean.com':{password:'Creative123456!',role:'emp',fullName:'Karim Fouad',subtitle:'Creative · Video Editor'},
 'creative@orvia.com':{password:'Creative123456!',role:'emp',fullName:'Karim Fouad',subtitle:'Creative · Video Editor'},
 'sara@lumen.com':{password:'Client123456!',role:'client',fullName:'Sara Nabil',subtitle:'Client · Lumen Skincare'},
 'client@orvia.com':{password:'Client123456!',role:'client',fullName:'Sara Nabil',subtitle:'Client · Lumen Skincare'}
};
const UI_ROLE_KEY={Admin:'admin','Account Manager':'am','Content Creator':'cc','Team Leader':'cc',Creative:'emp',Client:'client'};
let doLogin=function(){
 if(S.busy)return;
 const v=Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i=>[i.dataset.f,i.value]));
 S.err={};
 const email=(v.email||'').trim().toLowerCase();
 const pw=String(v.password||'');
 S.loginEmail=(v.email||'').trim();
 if(!email)S.err.email='Enter your email.';
 else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))S.err.email='Please enter a valid email address.';
 if(!pw)S.err.password='Enter your password.';
 if(Object.keys(S.err).length)return render();
 const demo=DEMO_ACCOUNTS[email];
 if(demo){
  const pwMap=loadDemoPwMap();
  const pwOk=pwMap[email]?checkDemoPw(email,pw):(pw===demo.password);
  if(!pwOk){S.err.password='Invalid email or password.';return render()}
  const matchingUser=D.users.rows.find(u=>String(u.email||'').trim().toLowerCase()===email||u.fullName===demo.fullName);
  if(matchingUser&&matchingUser.isActive===false){
   S.err.password='This account is inactive.';
   toast('This account is inactive.');
   return render();
  }
  S.role=demo.role;
  S.currentEmail=email;
  S.clientBrand=demo.role==='client'?CLIENT_BRAND:null;
  if(demo.role==='client'&&typeof switchClientOnboarding==='function')switchClientOnboarding(S.clientBrand);
  ME[S.role]=[demo.fullName,demo.subtitle];
  if(typeof MEN!=='undefined')MEN[S.role]=demo.fullName;
  applyStoredProfile(email);
  S.authed=true;S.page=NAV[S.role][0];S.brand=demo.role==='client'?S.clientBrand:null;S.sub=null;S.det=null;
  return render();
 }
 const brandRow=D.brands.rows.find(b=>String(b.email||'').trim().toLowerCase()===email);
 if(brandRow&&checkDemoPw(email,pw)){
  const brandUser=D.users.rows.find(u=>String(u.email||'').trim().toLowerCase()===email);
  if(brandUser&&brandUser.isActive===false){
   S.err.password='This account is inactive.';
   toast('This account is inactive.');
   return render();
  }
  S.role='client';
  S.currentEmail=email;
  S.clientBrand=brandRow.name;
  if(typeof switchClientOnboarding==='function')switchClientOnboarding(brandRow.name);
  ME.client=[brandRow.name,'Client · '+brandRow.name];
  if(typeof MEN!=='undefined')MEN.client=brandRow.name;
  applyStoredProfile(email);
  S.authed=true;S.page=NAV.client[0];S.brand=brandRow.name;S.sub=null;S.det=null;
  return render();
 }
 const createdRow=D.users.rows.find(u=>String(u.email||'').trim().toLowerCase()===email);
 if(createdRow&&checkDemoPw(email,pw)){
  if(createdRow.isActive===false){S.err.password='This account is inactive.';return render()}
  const rk=UI_ROLE_KEY[createdRow.roleId]||'emp';
  S.role=rk;
  S.currentEmail=email;
  if(rk==='client'){
   const linkedBrand=createdRow.brandName||D.brands.rows.find(b=>String(b.email||'').trim().toLowerCase()===email)?.name||CLIENT_BRAND;
   S.clientBrand=linkedBrand;
   if(typeof switchClientOnboarding==='function')switchClientOnboarding(linkedBrand);
   ME.client=[createdRow.fullName,'Client · '+linkedBrand];
   if(typeof MEN!=='undefined')MEN.client=createdRow.fullName;
   applyStoredProfile(email);
   S.authed=true;S.page=NAV.client[0];S.brand=linkedBrand;S.sub=null;S.det=null;
   return render();
  }
  S.clientBrand=null;
  ME[rk]=[createdRow.fullName,createdRow.jobTitleId||ROLES[rk]];
  if(typeof MEN!=='undefined')MEN[rk]=createdRow.fullName;
  applyStoredProfile(email);
  S.authed=true;S.page=NAV[S.role][0];S.brand=null;S.sub=null;S.det=null;
  return render();
 }
 S.err.password='Invalid email or password.';
 render();
};
/* ===== v2: brand workspace, strategy flow, content plans, role-based tasks ===== */
const closeM=close;
const CLIENT_BRAND='Lumen Skincare',EMP=['Lina Aziz','Karim Fouad','Mona Saeed'],TS2=['TODO','IN_PROGRESS','REVIEW','DONE'];
function curClientBrand(){return S.clientBrand||CLIENT_BRAND}
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
function ask(t,fs,cb){window._cb=cb;modal(`<div class="dlg"><h2>${esc(t)}</h2><div class="pg" style="margin-top:16px">${fs.map(([n,l,ty,o])=>ty==='select'?`<div class="fl"><label>${esc(l)}</label><select data-f="${esc(n)}">${o.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select></div>`:ty==='textarea'?`<div class="fl" style="grid-column:1/-1"><label>${esc(l)}</label><textarea data-f="${esc(n)}"></textarea></div>`:`<div class="fl"><label>${esc(l)}</label><input data-f="${esc(n)}" type="${esc(ty||'text')}"></div>`).join('')}</div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="askOk()">Save</button></div></div>`)}
function askOk(){const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;const v=Object.fromEntries([...dlg.querySelectorAll('[data-f]')].map(x=>[x.dataset.f,x.value]));if('title' in v&&!(v.title||'').trim())return toast('Title is required');dlg._submitted=true;closeM();if(typeof window._cb==='function')window._cb(v);toast('Saved');render(false)}
/* shell */
go=function(p){const allowed=NAV[S.role]||NAV.admin;S.page=isAllowedPage(S.role,p)?p:allowed[0];S.q='';if(_searchTimer){clearTimeout(_searchTimer);_searchTimer=null}S.open=false;S.err={};S.brand=null;S.sub=null;render()};
setRole=function(r){S.role=r;S.page=NAV[r][0];S.q='';if(_searchTimer){clearTimeout(_searchTimer);_searchTimer=null}S.brand=null;S.sub=null;render()};
view=function(sk=true){const redirected=enforceRoleRoute();const v=$('#view');if(!v)return;if(redirected){document.querySelectorAll('.nav button').forEach(b=>{const on=b.getAttribute('onclick')===`go('${S.page}')`;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}if(S.role==='client')S.brand=curClientBrand();const f=()=>{v.innerHTML=S.page==='brands'&&S.brand?brandPage():PAGES[S.page]?PAGES[S.page]():listPage(S.page)};if(sk){v.innerHTML='<div class="sk" style="width:40%;height:34px"></div><div class="card"><div class="sk"></div><div class="sk"></div></div>';setTimeout(f,200)}else f()};
render=function(sk=true){const a=$('#app');if(!a)return;if(!S.authed){applyTheme();a.innerHTML=authView();return}try{delete document.documentElement.dataset.theme}catch{/* ignore */}enforceRoleRoute();
 const p=getCurrentProfile(),nav=NAV[S.role],cb=curClientBrand(),un=D.notifications.rows.filter(n=>!n.isRead&&(!n.to||n.to.includes(S.role))&&(S.role!=='client'||(n.title.includes(cb)&&!n.internal))).length;
a.innerHTML=`<aside class="side ${S.open?'open':''}"><div class="logo"><i></i><div><b>ORVIA</b><small>${esc(ROLES[S.role])}</small></div></div><nav class="nav">${nav.map(pg=>(pg==='tasks'?'<div class="nl" style="margin:18px 0 6px">Execution &amp; Review</div>':'')+`<button class="${S.page===pg?'on':''}"${S.page===pg?' aria-current="page"':''} onclick="go('${pg}')">${ic(N[pg][1])}${N[pg][0]}</button>`).join('')}</nav>
<div class="sf"><div class="me">${avatarHtml(p.fullName,p.photo)}<div style="min-width:0;flex:1"><b>${esc(p.fullName)}</b><div class="mute" style="font-size:12px">${esc(p.title)}</div></div><button type="button" class="btn sm t" onclick="logout()" title="Log out" aria-label="Log out" style="width:34px;height:34px;padding:0;justify-content:center;flex-shrink:0;border-radius:10px">${ic('logout')}</button></div></div></aside>
<main><header class="top"><div class="search-wrap"><label class="search">${ic('search')}<input aria-label="Search this page" placeholder="Search this page…" value="${esc(S.q)}" oninput="onSearch(this.value,this)" onfocus="openSearchDD()" onblur="setTimeout(closeSearchDD,140)" onkeydown="if(event.key==='Escape'){if(S.q){event.preventDefault();clearSearch()}else closeSearchDD()}"><button type="button" class="search-clr" onclick="clearSearch()" aria-label="Clear search" title="Clear search" style="display:${S.q?'inline-flex':'none'};border:0;background:transparent;color:var(--mute);cursor:pointer;font-size:16px;line-height:1;padding:0 4px">×</button></label><div id="search-dd" class="search-dd" role="listbox" aria-label="Search results"></div></div>
<button class="btn sm t" onclick="go('notifications')" aria-label="Notifications" style="margin-left:auto;position:relative;width:38px;height:38px;padding:0;justify-content:center;border-radius:50%">${ic('bell')}${un?`<span style="position:absolute;top:-5px;right:-5px;background:#6B5FC7;color:#fff;border-radius:99px;font-size:10px;min-width:18px;height:18px;display:grid;place-items:center">${un}</span>`:''}</button>
<div style="display:flex;gap:10px;align-items:center;cursor:pointer" onclick="go('account')" title="Profile &amp; password"><div style="text-align:right;line-height:1.25"><b>${esc(p.fullName)}</b><div class="mute" style="font-size:12px">${esc(ROLES[S.role])}</div></div>${avatarHtml(p.fullName,p.photo,'background:var(--lilac)')}</div></header><section id="view" aria-live="polite"></section></main>`;view(sk)};
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
const obRec=typeof getBrandOnboarding==='function'?getBrandOnboarding(b.name):null;
const obDoneCount=obRec?.done?.length||0;
const obSubmitted=Boolean(obRec?.submitted)||D.briefs.rows.some(br=>br.brandId===b.name&&['GENERATED','READY','APPROVED'].includes(br.status));
const obBadge=obSubmitted?`<span class="pill ok">Onboarding: Submitted</span>`:`<span class="pill wn">Onboarding: ${obDoneCount} of 7 sections</span>`;
return `<button class="btn sm" onclick="S.brand=null;view(false)" style="margin-bottom:16px">← All brands</button>
<div class="bh"><div class="lg">${esc(b.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div style="flex:1;min-width:220px"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h1 style="font-size:26px">${esc(b.name)}</h1>${pill(b.status)}${own?obBadge:''}</div><div class="mute" style="font-size:13px">${esc(b.industry)} · ${esc(b.teamId)} · Account manager: ${esc(b.accountManagerId)}<br>${np?np+' social platform'+(np===1?'':'s')+' connected.':'No social platforms yet.'}${own&&obRec?.cat?` · Intake: ${esc(obRec.cat)}${obRec.act?' / '+esc(obRec.act):''}`:''}</div></div>
${own?`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" style="border-radius:99px;border-color:var(--ink)" onclick="act('brands',${i},'edit')">Edit Brand</button><button class="btn sm" style="border-radius:99px;border-color:var(--ink)" onclick="arch(${i})">Archive Brand</button><button class="btn sm" style="border-radius:99px;color:#B5391B;border-color:#E9A494" onclick="delB(${i})">Delete Brand</button></div>`:''}</div>
<div class="mono mute" style="text-transform:uppercase;margin-bottom:8px">Brand workspace</div><p style="margin:0 0 16px">Everything about ${esc(b.name)} in one place.</p>
<div class="tiles">${T4.map(t=>`<button class="tile" style="background:${t[5]}" onclick="S.sub='${t[0]}';S.q='';view(false)"><span class="ti">${ic(t[2])}</span><b>${t[1]}</b><span style="color:#45454d">${t[3]}</span><span class="cnt">${t[4]}</span></button>`).join('')}</div>`}
let arch=function(i){D.brands.rows[i].status='ARCHIVED';toast('Brand archived');view(false)};
function delB(i){modal(`<div class="dlg"><h2>Delete this brand?</h2><p class="mute">This can’t be undone.</p><div class="ft"><button class="btn" onclick="closeM()">Keep it</button><button class="btn p" style="background:var(--et);border-color:var(--et)" onclick="S.brand=null;E_del('brands',${i})">Delete brand</button></div></div>`)}
let subPage=function(b){const k=S.sub,map={brief:'briefs',files:'files',platforms:'platform'},nm={brief:'Brand Brief',strategy:'Content Strategy',content:'Platforms',files:'Files & Assets',platforms:'Social Media Platforms'};
return `<div style="display:flex;gap:12px;align-items:center;margin-bottom:20px;flex-wrap:wrap"><button class="btn sm" onclick="S.sub=null;S.q='';view(false)">← ${esc(b.name)}</button><span class="mute">${esc(nm[k])}</span></div>`+(k==='strategy'?stratPage():k==='content'?contentPage():listPage(map[k]))};
/* strategy flow: CC upload → AM → client → AM → CC */
function stratPage(){const b=S.brand,s=sg(b),R=S.role,ap=s.out==='approved',cur={none:0,uploaded:0,am:1,client:2,answered:3,forwarded:ap?5:3}[s.st];
if(R==='client'&&['none','uploaded','am'].includes(s.st))return `<div class="card empty"><span class="chip">${ic('bolt')}</span><h2>Nothing to review yet</h2><p class="mute">Your account manager will share the strategy with you when it is ready.</p></div>`;
const L={none:['No strategy uploaded yet','er'],uploaded:['Uploaded · not sent yet','lc'],am:['With the Account Manager','wn'],client:['Waiting for the client’s decision','in'],answered:[(ap?'Client approved':'Client rejected')+' · waiting for the Account Manager','wn'],forwarded:[ap?'Approved · content plan unlocked':'Rejected · a new version is needed',ap?'ok':'er']}[s.st];
const nx={none:'The Content Creator uploads the strategy file.',uploaded:'The Content Creator sends it to the Account Manager.',am:'The Account Manager downloads it and sends it to the client.',client:'The client downloads it, then approves or rejects with a reason.',answered:'The Account Manager forwards the client’s answer to the Content Creator.',forwarded:ap?'The Content Creator can now build the content plan.':'The Content Creator uploads a revised version.'}[s.st];
const B=(l,f,c='')=>`<button class="btn ${c}" onclick="${f}">${l}</button>`,up=l=>`<label class="btn ${l[0]==='U'?'p':''}" style="cursor:pointer">${l}<input type="file" hidden onchange="upS(this)"></label>`;
const linkedBrief=D.briefs.rows.find(x=>x.brandId===b);
const a=[];if(R==='cc'){if(s.st==='none'||(s.st==='forwarded'&&!ap))a.push(up('Upload strategy'));if(s.st==='uploaded')a.push(B('Send to Account Manager',"sgo('send')",'p'),up('Replace file'));if(s.st==='forwarded'&&ap)a.push(B('Open content plan',"S.sub='platforms';view(false)",'p'))}
if(R==='am'){if(s.st==='am')a.push(B('Approve & send to client',"sgo('client')",'p'));if(s.st==='answered')a.push(B('Send response to Content Creator',"sgo('fwd')",'p'))}
if(R==='client'&&s.st==='client')a.push(B('Approve',"sgo('approve')",'p'));
const dl=s.file&&((R==='cc')||(R==='am'&&s.st!=='uploaded')||(R==='client'));if(dl)a.unshift(B('Download',"dlS()",'t'));
return `<div class="ph"><div><span class="eb">${esc(ROLES[R])}</span><h1>Content Strategy</h1><p>${esc(b)} · ${esc(nx)}</p></div>${linkedBrief&&R!=='client'?`<button class="btn sm" onclick="S.sub='brief';view(false)">Linked brief: ${esc(linkedBrief.version)} · ${esc(linkedBrief.status)}</button>`:''}</div>
${R==='admin'?'<div class="note wn"><b>🔒</b><span>View-only for your role.</span></div>':''}
<div class="card" style="margin-bottom:16px"><div style="display:flex;gap:8px;flex-wrap:wrap">${['Upload','Account Manager','Client review','Decision','Content plan'].map((x,i)=>`<span class="pill" style="background:${i<cur?'var(--ink)':i===cur?'var(--lilac)':'var(--mist)'};color:${i<cur?'#fff':'var(--ink)'}">${x}</span>`).join('')}</div>
<div class="dash"></div><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><div><b>${esc(s.file||'No file yet')}</b><div class="mute">${s.v?'Version '+esc(s.v):''}${linkedBrief?` · Linked to Brand Brief ${esc(linkedBrief.version)}`:''}</div></div><span class="pill ${L[1]}">${esc(L[0])}</span></div>
${s.reason&&s.out==='rejected'?`<div class="note wn" style="margin:16px 0 0;flex-direction:column;gap:2px"><b>Revision feedback</b><span style="font-weight:500">${esc(s.reason)}</span></div>`:''}
${(R==='client'&&s.st==='client')||(R==='am'&&s.st==='am')?`<div class="fl" style="margin:16px 0 0"><label>${R==='am'?'Internal review — request changes before sending to client':'If you request changes, tell us why'}</label><textarea id="rs" placeholder="${R==='am'?'Write feedback for the Content Creator…':'What needs to change in this strategy?'}"></textarea><div>${B(R==='am'?'Request changes':'Reject with reason',R==='am'?"sgo('am_reject')":"sgo('reject')",'dg')}</div></div>`:''}
${a.length?`<div class="sep">${a.join('')}</div>`:''}</div>
<div class="card"><h2 style="margin-bottom:8px">History</h2>${s.log.length?s.log.map(x=>`<div style="padding:8px 0;border-top:1px solid var(--line)">${esc(x)}</div>`).join(''):'<p class="mute">No activity yet.</p>'}</div>`}
let upS=function(inp){const f=inp.files[0];if(!f)return;const s=sg(S.brand);s.v++;s.file=f.name;s.url=URL.createObjectURL(f);s.st='uploaded';s.out=null;s.reason='';s.log.push('v'+s.v+' uploaded · '+ROLES[S.role]);toast('Strategy uploaded');render(false)};
function dlS(){
 const s=sg(S.brand);
 const stratInfo=typeof API_CACHE!=='undefined'?API_CACHE.strategiesByBrand[S.brand]:null;
 if(stratInfo?.id&&stratInfo?.versionId&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  fetch(`${API_BASE}/strategies/${stratInfo.id}/versions/${stratInfo.versionId}/file`,{headers:{Authorization:'Bearer '+getApiToken()}})
   .then(res=>{if(!res.ok)throw new Error('Could not download strategy file');return res.blob()})
   .then(blob=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=s.file||'strategy.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),4000);toast('Downloading '+s.file)})
   .catch(err=>toast(err?.message||'Download failed'));
  return;
 }
 const a=document.createElement('a'),u=s.url&&(/^blob:/i.test(s.url)||safeUrl(s.url))?s.url:'';a.href=u||URL.createObjectURL(new Blob(['Demo placeholder for '+s.file+' ('+S.brand+')'],{type:'text/plain'}));a.download=u?s.file:s.file+'.txt';a.click();toast('Downloading '+s.file);
}
let sgo=function(a){const s=sg(S.brand);let m;
if(a==='send'){s.st='am';m='Sent to the Account Manager'}else if(a==='client'){s.st='client';m='Approved internally · sent to the client'}
else if(a==='am_reject'){const r=($('#rs')||{}).value||'';if(!r.trim())return toast('Please write revision feedback for the Content Creator');s.st='forwarded';s.out='rejected';s.reason=r.trim();m='Account Manager requested changes · returned to Content Creator'}
else if(a==='approve'){s.st='answered';s.out='approved';s.reason='';m='Client approved · Account Manager notified'}
else if(a==='reject'){const r=($('#rs')||{}).value||'';if(!r.trim())return toast('Please write why you requested changes');s.st='answered';s.out='rejected';s.reason=r.trim();m='Client requested changes · Account Manager notified'}
else{s.st='forwarded';m='Response sent to the Content Creator'}
s.log.push(m+' · '+ROLES[S.role]);D.notifications.rows.unshift({title:S.brand+': '+m,createdAt:'just now',isRead:false,internal:['send','am_reject','approve','reject'].includes(a),to:({send:['am','admin'],am_reject:['cc','admin'],client:['client','cc','admin'],approve:['am','admin'],reject:['am','admin']}[a]||['cc','admin'])});toast(m);render(false)};
/* content management: plans → campaigns → items */
function contentPage(){const b=S.brand,s=sg(b);
if(!(s.st==='forwarded'&&s.out==='approved'))return `<div class="card empty"><span class="chip">${ic('lock')}</span><h2>Content plans are locked</h2><p class="mute">They open once the client approves the strategy and the Account Manager shares the decision with the Content Creator.</p></div>`;
const R=S.role,cc=R==='cc',am=R==='am',ps=PLANS.filter(p=>p.brand===b);
const sel=(id,k,o,v)=>`<select style="border:1px solid var(--line);border-radius:10px;padding:5px 8px;background:#fff" onchange="setIt(${id},'${k}',this.value)">${o.map(x=>`<option value="${esc(x)}" ${x===v?'selected':''}>${esc(k==='status'?lab(x):x)}</option>`).join('')}</select>`;
return `<div class="ph"><div><span class="eb">${esc(ROLES[R])}</span><h1>Content Management</h1><p>${cc?'Build the plan: campaigns and content items.':am?'Assign each content item to someone, set its priority and status.':'View-only for your role.'}</p></div>${cc?`<button class="btn p" onclick="newPlan()">+ New plan</button>`:''}</div>`+
(ps.length?ps.map(p=>`<div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><div><h2>${esc(p.title)}</h2><span class="mute">${esc(p.month)}</span></div>${cc?`<div style="display:flex;gap:8px"><button class="btn sm" onclick="newCamp(${p.id})">+ Campaign</button><button class="btn sm p" onclick="newItem(${p.id})">+ Content item</button></div>`:''}</div>
<div style="margin:14px 0">${p.campaigns.length?p.campaigns.map((c,ci)=>`<span class="tag lc" style="cursor:pointer" onclick="openD({t:'camp',p:${p.id},n:${ci}})" title="${esc(c.objective||'')}">${esc(c.name)}</span>`).join(''):'<span class="mute">No campaigns yet.</span>'}</div>
${p.items.length?`<div class="tw"><table><thead><tr><th scope="col">Item</th><th scope="col">Type</th><th scope="col">Platform</th><th scope="col">Campaign</th><th scope="col">Date</th><th scope="col">Assigned to</th><th scope="col">Priority</th><th scope="col">Status</th></tr></thead><tbody>${p.items.map(i=>`<tr><td><b><a class="lk" onclick="openD({t:'item',id:${i.id}})">${esc(i.title)}</a></b></td><td><span class="tag">${esc(i.type)}</span></td><td>${i.platform?esc(i.platform):'—'}</td><td>${esc(i.campaign||'—')}</td><td><span class="mono">${esc(i.date||'—')}</span></td><td>${am?sel(i.id,'assignee',['Unassigned',...EMP],i.assignee||'Unassigned'):esc(i.assignee||'—')}</td><td>${am?sel(i.id,'priority',PR,i.priority):pill(i.priority)}</td><td>${am?sel(i.id,'status',TS2,i.status):pill(i.status)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mute">No content items yet.</p>'}</div>`).join(''):`<div class="card empty"><span class="chip">${ic('cal')}</span><h2>No plan yet</h2><p class="mute">${cc?'Create the first content plan for this brand.':'The Content Creator has not started the plan.'}</p></div>`)}
const pl=id=>PLANS.find(p=>p.id===id);
function newPlan(){ask('New content plan',[['title','Plan title'],['month','Month']],v=>PLANS.push({id:++IDN,brand:S.brand,title:v.title,month:v.month||'',campaigns:[],items:[]}))}
let newCamp=function(id){ask('New campaign',[['title','Campaign name'],['objective','Objective','textarea']],v=>pl(id).campaigns.push({name:v.title,objective:v.objective}))};
let newItem=function(id){const p=pl(id);ask('New content item',[['title','Title'],['type','Type','select',['POST','REEL','STORY','CAROUSEL']],['campaign','Campaign','select',['—',...p.campaigns.map(c=>c.name)]],['platform','Platform','select',['Unassigned',...D.platform.rows.filter(r=>r.brandId===p.brand).map(r=>r.accountName)]],['date','Scheduled date','date']],v=>p.items.push({id:++IDN,title:v.title,type:v.type,campaign:v.campaign,platform:v.platform==='Unassigned'?'':v.platform,date:v.date,assignee:'',priority:'MEDIUM',status:'TODO'}))};
function setIt(id,k,v){PLANS.forEach(p=>p.items.forEach(i=>{if(i.id===id)i[k]=v==='Unassigned'?'':v}));toast('Updated');view(false)}
/* tasks: everyone sees the page, each role sees/does different things */
let _tv=[];
const allT=()=>[...TASKS,...PLANS.flatMap(p=>p.items.filter(i=>i.assignee).map(i=>({title:i.title,brand:p.brand,priority:i.priority,assignee:i.assignee,deadline:i.date,status:i.status,by:MEN.am,ref:i})))];
let tasksPage=function(){const R=S.role,me=MEN[R],a=allT();_tv=R==='admin'?a:R==='am'?a.filter(t=>t.assignee===me||t.by===me):a.filter(t=>t.assignee===me);
const q=S.q.toLowerCase(),ed=R!=='admin',rows=_tv.map((t,i)=>({t,i})).filter(({t})=>[t.title,t.brand,t.assignee].join(' ').toLowerCase().includes(q));
const sub=R==='admin'?'Every task and its details. You can read them and create new ones, nothing else.':R==='am'?'Your tasks, plus the ones you assigned. You can create new tasks.':'Only the tasks assigned to you. You can update their status.';
return `<div class="ph"><div><span class="eb">${esc(ROLES[R])}</span><h1>Tasks</h1><p>${sub}</p></div>${R==='admin'||R==='am'?`<button class="btn p" onclick="newTask()">+ New task</button>`:''}</div>`+
(rows.length?`<div class="card" style="padding:20px 12px"><div class="tw"><table><thead><tr><th scope="col">Task</th><th scope="col">Brand</th><th scope="col">Assigned to</th><th scope="col">Priority</th><th scope="col">Deadline</th><th scope="col">Status</th></tr></thead><tbody>${rows.map(({t,i})=>`<tr><td><b>${esc(t.title)}</b></td><td>${esc(t.brand)}</td><td>${esc(t.assignee)}</td><td>${pill(t.priority)}</td><td><span class="mono">${esc(t.deadline||'—')}</span></td><td>${ed?`<select style="border:1px solid var(--line);border-radius:10px;padding:5px 8px;background:#fff" onchange="setTS(${i},this.value)">${TS2.map(x=>`<option value="${esc(x)}" ${x===t.status?'selected':''}>${esc(lab(x))}</option>`).join('')}</select>`:pill(t.status)}</td></tr>`).join('')}</tbody></table></div></div>`:`<div class="card empty"><span class="chip">${ic('check')}</span><h2>No tasks</h2><p class="mute">Nothing is assigned to you right now.</p></div>`)};
function setTS(i,v){const t=_tv[i];t.status=v;if(t.ref)t.ref.status=v;toast('Status updated');view(false)}
let newTask=function(){ask('New task',[['title','Title'],['brand','Brand','select',BR],['assignee','Assign to','select',[...EMP,'Omar Haddad']],['priority','Priority','select',PR],['deadline','Deadline','date']],v=>TASKS.unshift({...v,status:'TODO',by:MEN[S.role]}))};
PAGES.tasks=tasksPage;

/* ===== v3: add-user, client onboarding, client views ===== */
const ROLE_OPTS=['Account Manager','Content Creator','Creative','Team Leader','Client'];
const JOBS={'Account Manager':['Account Manager'],'Content Creator':['Content Creator'],'Creative':['Graphic Designer','Video Editor','Motion Designer'],'Team Leader':['Creative Team Leader','Content Team Leader','Accounts Team Leader'],'Client':['Client'],'Admin':['Workspace Owner']};
const RDESC={'Account Manager':'Own the client relationship, send strategies to the client and assign content work.','Content Creator':'Upload strategies, build content plans and create content items.','Creative':'Work on assigned tasks such as design, video and motion, and update their status.','Team Leader':'Supervise assigned team members, track deadlines, review work and manage team content.','Client':'View their own brand, complete onboarding and approve or reject the strategy.','Admin':'Full access to the workspace.'};
const rdHtml=r=>r?`<b>${esc(r)}</b><span style="font-weight:500">${esc(RDESC[r]||'')}</span>`:'';
function roleCh(el){const r=el.value,j=document.querySelector('.dlg [data-f=jobTitleId]'),o=JOBS[r]||[];j.innerHTML='<option value="">'+(r?'Select a Job Title':'Select a role first')+'</option>'+o.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');if(o.length===1)j.value=o[0];const d=document.getElementById('rd');if(d)d.innerHTML=rdHtml(r)}
function userForm(i){const E=D.users,r=i==null?{}:E.rows[i],rl=r.roleId||'',opts=!rl||ROLE_OPTS.includes(rl)?ROLE_OPTS:[...ROLE_OPTS,rl];
const bad=n=>S.err[n]?'bad':'',msg=n=>S.err[n]?`<small>${esc(S.err[n])}</small>`:'',lb=t=>`<label><b style="font-weight:600">${t} <em style="color:var(--et);font-style:normal">*</em></b></label>`;
return `<h2>${i==null?'Add user':'Edit user'}</h2><p class="mute" style="margin:0 0 20px">${i==null?'Create the account, set an initial password, and assign a role.':'Update this account.'}</p>
<div class="pg"><div class="fl ${bad('fullName')}">${lb('Full Name')}<input data-f="fullName" value="${esc(r.fullName)}" placeholder="e.g. Maya Lin">${msg('fullName')}</div><div class="fl ${bad('email')}">${lb('Work Email')}<input data-f="email" type="email" value="${esc(r.email)}" placeholder="name@agency-clean.co">${msg('email')}</div>${i==null?`<div class="fl ${bad('password')}" style="grid-column:1/-1">${lb('Password')}<div class="pw-wrap"><input data-f="password" type="password" value="" autocomplete="new-password" placeholder="Min. 12 chars (A-Z, a-z, 0-9, symbol)"><button type="button" class="pw-btn" onclick="togPw(this)" aria-label="Show password" title="Show password">${ic('eye')}</button></div>${msg('password')||'<small>At least 12 characters with uppercase, lowercase, number, and symbol.</small>'}</div>`:''}</div>
<div style="border-top:1px solid var(--line);margin:4px 0 16px;padding-top:20px"><h2 style="font-size:17px">Access &amp; role assignment</h2><p class="mute" style="margin:2px 0 16px">Set the user’s role, job title and team.</p>
<div class="pg"><div class="fl ${bad('roleId')}">${lb('Workspace Role')}<select data-f="roleId" onchange="roleCh(this)"><option value="">Select a role</option>${opts.map(x=>`<option value="${esc(x)}" ${x===rl?'selected':''}>${esc(x)}</option>`).join('')}</select>${msg('roleId')}</div>
<div class="fl ${bad('jobTitleId')}">${lb('Job Title')}<select data-f="jobTitleId"><option value="">${rl?'Select a Job Title':'Select a role first'}</option>${(JOBS[rl]||[]).map(x=>`<option value="${esc(x)}" ${x===r.jobTitleId?'selected':''}>${esc(x)}</option>`).join('')}</select>${msg('jobTitleId')}</div>
<div class="fl"><label>Team</label><select data-f="teamId"><option value="—">—</option>${T.map(x=>`<option value="${esc(x)}" ${x===r.teamId?'selected':''}>${esc(x)}</option>`).join('')}</select></div></div>
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
const OB_STORE_KEY='orvia_onboarding_v1';
const OB_BY_BRAND=(()=>{try{const m=JSON.parse(localStorage.getItem(OB_STORE_KEY)||'{}');return m&&typeof m==='object'?m:{}}catch{return{}}})();
let _obBrand=CLIENT_BRAND;
function persistOnboarding(brandName){
 const key=brandName||_obBrand||CLIENT_BRAND;
 if(key===_obBrand){
  OB_BY_BRAND[key]={step:OB.step,cat:OB.cat,act:OB.act,sec:OB.sec,a:{...OB.a},done:[...OB.done],err:{},submitted:Boolean(OB.submitted)};
 }
 try{localStorage.setItem(OB_STORE_KEY,JSON.stringify(OB_BY_BRAND))}catch{/* ignore */}
}
function getBrandOnboarding(brandName){
 const key=brandName||_obBrand||CLIENT_BRAND;
 if(key===_obBrand){
  return {step:OB.step,cat:OB.cat,act:OB.act,sec:OB.sec,a:{...OB.a},done:[...OB.done],submitted:Boolean(OB.submitted)};
 }
 return OB_BY_BRAND[key]||null;
}
function switchClientOnboarding(brandName){
 const next=brandName||CLIENT_BRAND;
 persistOnboarding(_obBrand);
 if(_obBrand===next)return;
 const saved=OB_BY_BRAND[next]||{step:'category',cat:'Beauty & Personal Care',act:'E-commerce',sec:0,a:{},done:[],err:{},submitted:false};
 OB.step=saved.step;OB.cat=saved.cat;OB.act=saved.act;OB.sec=saved.sec;OB.a={...saved.a};OB.done=[...saved.done];OB.err={};OB.submitted=Boolean(saved.submitted);
 _obBrand=next;
}
const secSt=i=>OB.done.includes(i)?'done':OBS[i][1].some(q=>(OB.a[q[0]]||'').trim())?'inc':'none';
const obTop=(t,sub)=>`<div class="ph"><div><span class="eb">Client</span><h1>${esc(t)}</h1><p>${esc(sub)}</p></div></div>`,obCrumb=()=>curClientBrand()+' / Onboarding';
let OB_API_CATS=null;
function obCat(){
 if(Array.isArray(OB_API_CATS)&&OB_API_CATS.length){
  const curCat=OB_API_CATS.find(c=>c.code===OB.cat)||OB_API_CATS[0];
  OB.cat=curCat.code;
  const subs=curCat.requiresSubtype&&Array.isArray(curCat.subtypes)?curCat.subtypes:[];
  if(subs.length&&!subs.some(s=>s.code===OB.act))OB.act=subs[0].code;
  if(!subs.length)OB.act='';
  return obTop('Select category',obCrumb())+`<div class="card"><div class="pg"><div class="fl"><label>Main category</label><select onchange="OB.cat=this.value;const c=OB_API_CATS.find(x=>x.code===this.value);OB.act=c&&c.requiresSubtype&&c.subtypes&&c.subtypes[0]?c.subtypes[0].code:'';view(false)">${OB_API_CATS.map(c=>`<option value="${esc(c.code)}" ${c.code===OB.cat?'selected':''}>${esc(c.label||c.name||c.code)}</option>`).join('')}</select></div>${subs.length?`<div class="fl"><label>Activity type</label><select onchange="OB.act=this.value">${subs.map(a=>`<option value="${esc(a.code)}" ${a.code===OB.act?'selected':''}>${esc(a.label||a.name||a.code)}</option>`).join('')}</select></div>`:''}</div><div class="ft"><button class="btn p" onclick="obSelectCategory()">Continue</button></div></div>`;
 }
 const acts=CATS[OB.cat]||Object.values(CATS)[0];
 return obTop('Select category',obCrumb())+`<div class="card"><div class="pg"><div class="fl"><label>Main category</label><select onchange="OB.cat=this.value;OB.act=(CATS[OB.cat]||[])[0]||'';view(false)">${Object.keys(CATS).map(c=>`<option value="${esc(c)}" ${c===OB.cat?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="fl"><label>Activity type</label><select onchange="OB.act=this.value">${acts.map(a=>`<option value="${esc(a)}" ${a===OB.act?'selected':''}>${esc(a)}</option>`).join('')}</select></div></div><div class="ft"><button class="btn p" onclick="obSelectCategory()">Continue</button></div></div>`;
}
async function obSelectCategory(){
 if(typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  try{
   const body={mainCategory:OB.cat,...(OB.act?{activityType:OB.act}:{})};
   await apiCall('/client-onboarding/selection',{method:'PUT',body});
   const qs=new URLSearchParams({mainCategory:OB.cat,...(OB.act?{activityType:OB.act}:{})});
   const tpl=await apiCall('/client-onboarding/template?'+qs.toString()).catch(()=>null);
   if(tpl&&Array.isArray(tpl.sections)&&tpl.sections.length){
    OBS.length=0;
    tpl.sections.forEach(sec=>{
     OBS.push([sec.title,(sec.questions||[]).map(q=>[q.code,q.label,q.required?1:0,q.type==='textarea'?1:0])]);
    });
    OB.sec=0;OB.done=[];
   }
  }catch(err){
   if(err?.message)toast(err.message);
  }
 }
 OB.step='form';
 view(false);
}
function obForm(){const i=OB.sec,[t,qs]=OBS[i],pct=Math.round((i+1)/7*100);
return obTop('Onboarding form',obCrumb())+`<div class="obh"><div class="ban"><b>${esc(t)}</b><div class="mono mute">Section ${i+1} of 7</div></div><div style="text-align:right"><div class="mono mute" style="margin-bottom:6px">Progress: ${pct}%</div><div class="pbar"><i style="width:${pct}%"></i></div></div></div>
<div class="card">${qs.map(q=>{const e=OB.err[q[0]],v=esc(OB.a[q[0]]);return `<div class="fl ${e?'bad':''}"><label><b style="font-weight:600">${esc(q[1])}</b></label>${q[2]?'<span class="mono" style="color:var(--et)">Required</span>':''}${q[3]?`<textarea placeholder="Your answer" oninput="OB.a['${q[0]}']=this.value">${v}</textarea>`:`<input placeholder="Your answer" value="${v}" oninput="OB.a['${q[0]}']=this.value">`}${e?'<small>This field is required.</small>':''}</div>`}).join('')}
<div class="ft"><button class="btn" onclick="OB.err={};OB.step='sections';view(false)">Form sections</button><button class="btn" onclick="toast('Draft saved')">Save draft</button><button class="btn p" onclick="obSubmit()">${i<6?'Save and continue':'Save section'}</button></div></div>`}
let obSubmit=function(){const i=OB.sec;OB.err={};OBS[i][1].forEach(q=>{if(q[2]&&!(OB.a[q[0]]||'').trim())OB.err[q[0]]=1});
if(Object.keys(OB.err).length){toast('Answer the required questions');return view(false)}
if(!OB.done.includes(i))OB.done.push(i);if(i<6){OB.sec=i+1;toast('Section saved')}else{OB.step='sections';toast('Last section saved')}persistOnboarding(curClientBrand());view(false);window.scrollTo(0,0)};
function obSecs(){const d=OB.done.length,pct=Math.round(d/7*100),B={done:['ok','Done'],inc:['wn','Incomplete'],none:['','Not started']};
return obTop('Form sections',obCrumb())+`<div class="obh"><span class="mute">Progress: ${d} of 7 sections complete · ${pct}%</span><div class="pbar" style="width:240px"><i style="width:${pct}%"></i></div></div>
<div class="secg">${OBS.map((x,i)=>{const b=B[secSt(i)];return `<button class="secbtn" onclick="OB.sec=${i};OB.step='form';view(false)"><span>${esc(x[0])}</span><span class="pill ${b[0]}">${b[1]}</span></button>`}).join('')}</div>
<div class="ft" style="margin-top:20px"><button class="btn" onclick="persistOnboarding(curClientBrand());toast('Draft saved')">Save draft</button><button class="btn p" ${d<7?'disabled title="Complete all 7 sections first"':''} onclick="obFinish()">Submit onboarding</button></div>${d<7?'<p class="mute" style="text-align:right;margin:8px 0 0">Complete every section to submit.</p>':''}`}
const NOTIF_STORE_KEY='orvia_custom_notifs_v1';
function loadStoredNotifs(){try{const a=JSON.parse(localStorage.getItem(NOTIF_STORE_KEY)||'[]');return Array.isArray(a)?a:[]}catch{return[]}}
function saveStoredNotif(item){
 if(!item||!item.title)return;
 const list=loadStoredNotifs().filter(x=>x.title!==item.title);
 list.unshift(item);
 try{localStorage.setItem(NOTIF_STORE_KEY,JSON.stringify(list.slice(0,30)))}catch{/* ignore */}
}
function syncStoredNotifRead(title,all=false){
 const list=loadStoredNotifs();
 if(!list.length)return;
 list.forEach(x=>{if(all||x.title===title)x.isRead=true});
 try{localStorage.setItem(NOTIF_STORE_KEY,JSON.stringify(list))}catch{/* ignore */}
}
let obFinish=function(){
 const cb=curClientBrand();
 OB.submitted=true;
 persistOnboarding(cb);
 const notif={
  title:cb+': Client completed onboarding — please generate the Brand Brief',
  createdAt:'just now',
  isRead:false,
  internal:true,
  to:['am','admin'],
  link:{k:'onboarding',brand:cb},
 };
 D.notifications.rows.unshift(notif);
 saveStoredNotif(notif);
 toast('Onboarding submitted · Account Manager notified');
 render(false);
};
function obDone(){return obTop('Onboarding',obCrumb())+`<div class="note ok"><b>✓</b><span>Submitted. Your account manager has been notified and will prepare your brand brief.</span></div><div class="card"><div style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><h2>Your answers</h2><span class="pill ok">Submitted</span></div><dl class="kv" style="margin:0 0 8px"><dt>Main category</dt><dd>${esc(OB.cat)}</dd><dt>Activity type</dt><dd>${esc(OB.act)}</dd></dl>${OBS.map(x=>`<div class="dash"></div><h2 style="font-size:16px">${esc(x[0])}</h2><dl class="kv" style="margin:12px 0 0">${x[1].map(q=>`<dt>${esc(q[1])}</dt><dd>${esc(OB.a[q[0]])||'—'}</dd>`).join('')}</dl>`).join('')}</div>`}
function obPage(){return OB.submitted?obDone():OB.step==='category'?obCat():OB.step==='sections'?obSecs():obForm()}
function clientBrand(){const cb=curClientBrand(),b=D.brands.rows.find(x=>x.name===cb)||D.brands.rows[0]||{name:cb,status:'ACTIVE',industry:'—',accountManagerId:'—'},s=sg(b.name),SL={none:'Not started',uploaded:'Being prepared',am:'Being prepared',client:'Waiting for your decision',answered:'Your answer was sent',forwarded:s.out==='approved'?'Approved':'Revision in progress'}[s.st];
return `<div class="ph"><div><span class="eb">Client</span><h1>Brands</h1><p>Your brand at a glance. This page is view-only.</p></div></div><div class="bh"><div class="lg">${esc(b.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div style="flex:1"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h1 style="font-size:26px">${esc(b.name)}</h1>${pill(b.status)}</div><div class="mute">${esc(b.industry||'—')}</div></div></div>
<div class="card"><dl class="kv" style="margin:0"><dt>Industry</dt><dd>${esc(b.industry||'—')}</dd><dt>Account manager</dt><dd>${esc(b.accountManagerId||'—')}</dd>${b.email?`<dt>Brand email</dt><dd>${esc(b.email)}</dd>`:''}<dt>Onboarding</dt><dd>${OB.submitted?pill('SUBMITTED'):OB.done.length+' of 7 sections done'}</dd><dt>Strategy</dt><dd>${esc(SL)}</dd></dl></div>`}
PAGES.onboarding=obPage;PAGES.brief=()=>listPage('briefs');PAGES.strategy=()=>stratPage();PAGES.plans=()=>contentPage();

/* ===== v4: Tasks / My Work, Teams, Notifications, role dashboards ===== */
const TODAY='2026-11-18',TY={CREATION:'Content Creation',REVIEW:'Review',PUBLISH:'Publish',DIRECT:'Direct'},DONE4=['COMPLETED','CANCELLED'],ini2=n=>String(n||'').split(' ').map(x=>x[0]).join('');
NAV.cc=['dashboard','brands','tasks','account'];NAV.emp=['dashboard','tasks','account'];NAV.client.unshift('dashboard');
Object.defineProperty(N,'tasks',{get:()=>[S.role==='cc'||S.role==='emp'?'My Work':'Tasks','check']});
PL.ok.push('COMPLETED');PL.er.push('NEEDS_CHANGES','URGENT');PL.wn.push('IN_REVIEW');PL.lc.push('CANCELLED');
S.tw='team';S.tv='rows';S.ts='all';
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
const dl=t=>`<span class="mono" style="${isOd(t)?'color:var(--et);font-weight:700':''}">${esc(t.eff)}</span>${t.eff!==t.planned?`<div class="mute" style="font-size:11px">planned ${esc(t.planned)}</div>`:''}`;
function tact(t){const R=S.role,mine=t.assignee===MEN[R],a=[];
 if(mine){if(t.status==='TODO'&&t.kind!=='REVIEW')a.push(['Start','IN_PROGRESS']);if(t.status==='NEEDS_CHANGES')a.push(['Resume','IN_PROGRESS']);
  if(t.status==='IN_PROGRESS')a.push(t.kind==='CREATION'?['Submit','SUBMITTED']:['Complete','COMPLETED']);if(t.status==='IN_REVIEW')a.push(['Approve','COMPLETED'],['Request changes','NEEDS_CHANGES'])}
 if(R==='am'&&!DONE4.includes(t.status))a.push(['Cancel','CANCELLED']);return a}
let tset=function(id,s){
 const t=TK.find(x=>x.id===id);if(!t)return;
 const rv=TK.find(x=>x.after===id),c=t.after&&TK.find(x=>x.id===t.after);
 if(s==='SUBMITTED'&&rv){rv.status='IN_REVIEW';rv.eff=TODAY}
 if(c&&s==='COMPLETED')c.status='COMPLETED';
 if(t.kind==='REVIEW'&&s==='COMPLETED'){
  const alreadyPub=TK.some(x=>x.kind==='PUBLISH'&&x.after===t.id);
  if(!alreadyPub){
   const baseTitle=String(t.title||'').replace(/^Review:\s*/i,'');
   TK.unshift(mk(++IDN,'Publish: '+baseTitle,'PUBLISH','TODO',t.priority||'MEDIUM',MEN.am,MEN[S.role],t.brand,[...(t.ctx||[])],t.planned,t.eff,'Publish approved content: '+baseTitle,t.id));
  }
 }
 if(c&&s==='NEEDS_CHANGES'){c.status='NEEDS_CHANGES';s='TODO'}
 t.status=s;
 toast(t.kind==='REVIEW'&&s==='COMPLETED'?'Approved · Publish task created':'Task updated');
 closeM();
 view(false);
};
function submitTaskModal(id){
 const t=TK.find(x=>x.id===id);if(!t)return;
 modal(`<div class="dlg"><h2>Submit creation task</h2><p class="mute" style="margin:0 0 16px">Attach the deliverable link so the reviewer can inspect “${esc(t.title)}”.</p>
  <div class="pg">
   <div class="fl" style="grid-column:1/-1"><label>Submission URL <em style="color:var(--et);font-style:normal">*</em></label><input id="st-url" type="url" value="${esc(t.submissionUrl||'')}" placeholder="https://drive.google.com/…"></div>
   <div class="fl" style="grid-column:1/-1"><label>Submission Notes</label><textarea id="st-notes" placeholder="Notes for the reviewer…">${esc(t.submissionNotes||'')}</textarea></div>
  </div>
  <div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="confirmSubmitTask(${t.id})">Submit for review</button></div>
 </div>`);
}
async function confirmSubmitTask(id){
 const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;
 const t=TK.find(x=>x.id===id);if(!t)return;
 const url=($('#st-url')?.value||'').trim();
 const notes=($('#st-notes')?.value||'').trim();
 if(!url||!safeUrl(url))return toast('Enter a valid http:// or https:// submission URL.');
 dlg._submitted=true;
 const prevStatus=t.status;
 t.submissionUrl=url;
 t.submissionNotes=notes;
 if(t._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  try{
   await apiCall('/tasks/'+t._id+'/submit',{method:'POST',body:{submissionUrl:url,submissionNotes:notes||null}});
  }catch(err){
   dlg._submitted=false;
   toast(err?.message||'Could not submit task');
   return;
  }
 }
 const rv=TK.find(x=>x.after===id);
 if(rv){rv.status='IN_REVIEW';rv.eff=TODAY}
 t.status='SUBMITTED';
 closeM();
 toast('Task submitted for review');
 view(false);
}
const tbtn=t=>tact(t).map(a=>`<button class="btn sm ${a[1]==='CANCELLED'?'dg':''}" onclick="${a[1]==='SUBMITTED'&&t.kind==='CREATION'?`submitTaskModal(${t.id})`:`tset(${t.id},'${a[1]}')`}">${a[0]}</button>`).join('');
const abtn=t=>`<button class="btn sm" onclick="attachTaskModal(${t.id})" title="Attach a link to a file stored outside the system">📎 Attach link</button>`;
function attachTaskModal(id){
 const t=TK.find(x=>x.id===id);if(!t)return;
 modal(`<div class="dlg"><h2>Attach work files link</h2><p class="mute" style="margin:0 0 16px">Paste a link to a file hosted outside the system (Google Drive, Figma, Dropbox…) for “${esc(t.title)}”. Nothing gets uploaded — only the link is saved.</p>
  <div class="pg">
   <div class="fl" style="grid-column:1/-1"><label>File link <em style="color:var(--et);font-style:normal">*</em></label><input id="at-url" type="url" value="${esc(t.submissionUrl||'')}" placeholder="https://drive.google.com/…"></div>
   <div class="fl" style="grid-column:1/-1"><label>Text &amp; Notes</label><textarea id="at-notes" placeholder="What is this file? Anything the reviewer should know…">${esc(t.submissionNotes||'')}</textarea></div>
  </div>
  <div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="confirmAttachTask(${t.id})">Save link</button></div>
 </div>`);
}
async function confirmAttachTask(id){
 const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;
 const t=TK.find(x=>x.id===id);if(!t)return;
 const url=($('#at-url')?.value||'').trim();
 const notes=($('#at-notes')?.value||'').trim();
 if(!url||!safeUrl(url))return toast('Enter a valid http:// or https:// link.');
 dlg._submitted=true;
 if(t._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  try{
   await apiCall('/tasks/'+t._id+'/attach',{method:'PATCH',body:{submissionUrl:url,submissionNotes:notes||null}});
  }catch(err){
   dlg._submitted=false;
   return toast(err?.message||'Could not save the link');
  }
 }
 t.submissionUrl=url;
 t.submissionNotes=notes;
 closeM();
 toast('Link saved to the task');
 view(false);
}
const ctxL=t=>[t.brand,...t.ctx].join(' → ');
let tdet=function(id){const t=TK.find(x=>x.id===id),w=t.after&&TK.find(x=>x.id===t.after);
 modal(`<div class="dlg"><h2>${esc(t.title)}</h2><div style="margin:8px 0">${pill(t.status)} ${pill(t.priority)} <span class="tag">${esc(TY[t.kind]||t.kind)}</span></div><dl class="kv"><dt>Context</dt><dd>${esc(ctxL(t))}</dd><dt>Description</dt><dd>${esc(t.desc)||'—'}</dd><dt>Assigned to</dt><dd>${esc(t.assignee)}</dd><dt>Created by</dt><dd>${esc(t.by)}</dd><dt>Planned deadline</dt><dd>${esc(t.planned)}</dd><dt>Effective deadline</dt><dd>${dl(t)}</dd><dt>Waiting on</dt><dd>${w?esc(w.title)+' · '+esc(lab(w.status)):'Nothing'}</dd>${t.submissionUrl&&safeUrl(t.submissionUrl)?`<dt>Work files link</dt><dd><a class="lk" href="${esc(safeUrl(t.submissionUrl))}" target="_blank" rel="noopener noreferrer">📎 ${esc(t.submissionUrl)}</a>${t.submissionNotes?`<div class="mute" style="font-size:12px;margin-top:4px">${esc(t.submissionNotes)}</div>`:''}</dd>`:''}</dl><div class="ft"><button class="btn" onclick="closeM()">Close</button>${abtn(t)}${tbtn(t)}</div></div>`)};
function editTask(id){
 const t=TK.find(x=>x.id===id);if(!t)return;
 const staff=[...new Set([...EMP,MEN.am,...D.users.rows.filter(u=>u.roleId!=='Client'&&u.isActive!==false).map(u=>u.fullName)])];
 modal(`<div class="dlg"><h2>Edit / Re-assign task</h2><p class="mute" style="margin:0 0 16px">Update owner, priority, or deadline for this task.</p>
  <div class="pg">
   <div class="fl" style="grid-column:1/-1"><label>Title *</label><input id="et-title" value="${esc(t.title)}"></div>
   <div class="fl"><label>Assigned to *</label><select id="et-assignee">${staff.map(u=>`<option value="${esc(u)}" ${u===t.assignee?'selected':''}>${esc(u)}</option>`).join('')}</select></div>
   <div class="fl"><label>Priority</label><select id="et-priority">${['LOW','MEDIUM','HIGH','URGENT'].map(p=>`<option value="${p}" ${p===t.priority?'selected':''}>${p}</option>`).join('')}</select></div>
   <div class="fl"><label>Planned deadline *</label><input id="et-deadline" type="date" value="${esc(t.planned||'')}"></div>
   <div class="fl" style="grid-column:1/-1"><label>Description</label><textarea id="et-desc">${esc(t.desc||'')}</textarea></div>
  </div>
  <div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="saveEditTask(${t.id})">Save changes</button></div>
 </div>`);
}
async function saveEditTask(id){
 const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;
 const t=TK.find(x=>x.id===id);if(!t)return;
 const title=($('#et-title')?.value||'').trim();
 const assignee=$('#et-assignee')?.value||t.assignee;
 const priority=$('#et-priority')?.value||t.priority;
 const planned=($('#et-deadline')?.value||'').trim()||t.planned;
 const desc=($('#et-desc')?.value||'').trim();
 if(!title||!planned)return toast('Title and deadline are required');
 dlg._submitted=true;
 const prev={title:t.title,assignee:t.assignee,priority:t.priority,planned:t.planned,eff:t.eff,desc:t.desc};
 t.title=title;t.assignee=assignee;t.priority=priority;t.planned=planned;t.eff=planned;t.desc=desc;
 closeM();
 if(t._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  const body={title,priority,plannedDeadline:planned,description:desc||null};
  const assigneeId=API_CACHE.usersByName[assignee];
  if(assigneeId)body.assignedTo=assigneeId;
  try{
   await apiCall('/tasks/'+t._id,{method:'PATCH',body});
  }catch(err){
   Object.assign(t,prev);
   toast(err?.message||'Could not update task');
   return view(false);
  }
 }
 toast('Task updated');
 view(false);
}
tasksPage=function(){const R=S.role,me=MEN[R],mgr=R==='admin'||R==='am',team=mgr&&S.tw==='team',q=S.q.toLowerCase(),
 base=TK.filter(t=>team?(R==='admin'||t.by===me||t.assignee===me):t.assignee===me),n=f=>base.filter(f).length,
 L=base.filter(t=>(S.ts==='all'||t.status===S.ts)&&[t.title,t.brand,t.assignee,...(t.ctx||[])].join(' ').toLowerCase().includes(q)),
 st=[['Total',base.length],['Overdue',n(isOd),1],['In progress',n(t=>t.status==='IN_PROGRESS')],['Needs your action',n(t=>t.assignee===me&&['TODO','NEEDS_CHANGES','IN_REVIEW'].includes(t.status)),0],['Completed',n(t=>t.status==='COMPLETED')]],
 sg2=(k,_v,l)=>`<div class="seg" role="group" style="margin:0">${l.map(x=>`<button class="${S[k]===x[0]?'on':''}" aria-pressed="${S[k]===x[0]}" onclick="S.${k}='${x[0]}';view(false)">${x[1]}</button>`).join('')}</div>`;
 const row=t=>`<tr><td><b>${esc(t.title)}</b><div class="mute" style="font-size:12px">${esc(ctxL(t))}</div>${t.submissionUrl&&safeUrl(t.submissionUrl)?`<div style="font-size:12px;margin-top:4px">📎 <a class="lk" href="${esc(safeUrl(t.submissionUrl))}" target="_blank" rel="noopener noreferrer">${esc(t.submissionUrl)}</a></div>`:''}</td><td><span class="tag">${esc(TY[t.kind]||t.kind)}</span></td><td>${esc(t.assignee)}</td><td>${pill(t.priority)}</td><td>${dl(t)}</td><td>${pill(t.status)}</td><td><div class="ra">${abtn(t)}<button class="btn sm t" onclick="tdet(${t.id})">Details</button>${mgr&&!DONE4.includes(t.status)?`<button class="btn sm" onclick="editTask(${t.id})">Edit</button>`:''}${tbtn(t)}</div></td></tr>`,
 card=t=>`<div class="card tc"><div style="display:flex;justify-content:space-between;gap:8px"><span class="tag lc">${esc(TY[t.kind]||t.kind)}</span>${pill(t.status)}</div><b style="font-size:16px">${esc(t.title)}</b><span class="mute" style="font-size:12px">${esc(ctxL(t))}</span>${t.submissionUrl&&safeUrl(t.submissionUrl)?`<div style="font-size:12px">📎 <a class="lk" href="${esc(safeUrl(t.submissionUrl))}" target="_blank" rel="noopener noreferrer">${esc(t.submissionUrl)}</a></div>`:''}<div style="display:flex;justify-content:space-between;align-items:end;gap:8px"><div>${dl(t)}<div class="mute" style="font-size:12px">${esc(t.assignee)}</div></div>${pill(t.priority)}</div><div class="dash" style="margin:2px 0"></div><div class="ra" style="justify-content:flex-start;flex-wrap:wrap">${abtn(t)}<button class="btn sm t" onclick="tdet(${t.id})">Details</button>${mgr&&!DONE4.includes(t.status)?`<button class="btn sm" onclick="editTask(${t.id})">Edit</button>`:''}${tbtn(t)}</div></div>`;
 return `<div class="ph"><div><span class="eb">${esc(ROLES[R])}</span><h1>${team?'Tasks':'My Work'}</h1><p>${team?'Who does what: assign, follow and re-assign your team’s work.':'What is required from me: only the tasks assigned to you.'}</p></div>${mgr&&team?`<button class="btn p" onclick="newTask()">+ Direct task</button>`:''}</div>
<div class="tb2">${mgr?sg2('tw',0,[['mine','My Work'],['team','Tasks']]):''}${sg2('tv',0,[['rows','☰ Rows'],['cards','▦ Cards']])}<select aria-label="Status" onchange="S.ts=this.value;view(false)"><option value="all">All statuses</option>${['TODO','IN_PROGRESS','SUBMITTED','IN_REVIEW','NEEDS_CHANGES','COMPLETED','CANCELLED'].map(x=>`<option value="${x}" ${S.ts===x?'selected':''}>${lab(x)}</option>`).join('')}</select></div>
<div class="stats">${st.map(s=>`<div class="stat ${s[2]&&s[1]?'al':''}"><span class="mono mute">${s[0]}</span><b>${s[1]}</b></div>`).join('')}</div>`+
 (!L.length?`<div class="card empty"><span class="chip">${ic('check')}</span><h2>No tasks</h2><p class="mute">${team?'No tasks match.':'Nothing is assigned to you right now.'}</p></div>`:S.tv==='cards'?`<div class="cards">${L.map(card).join('')}</div>`:`<div class="card" style="padding:20px 12px"><div class="tw"><table><thead><tr><th scope="col">Task</th><th scope="col">Type</th><th scope="col">Assignee</th><th scope="col">Priority</th><th scope="col">Effective deadline</th><th scope="col">Status</th><th scope="col"></th></tr></thead><tbody>${L.map(row).join('')}</tbody></table></div></div>`)};
newTask=function(){const o=x=>x.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');modal(`<div class="dlg"><h2>New direct task</h2><p class="mute" style="margin:0 0 16px">Not linked to a content item. It starts as TODO and appears in the assignee’s My Work.</p><div class="pg"><div class="fl" style="grid-column:1/-1"><label>Title *</label><input id="dt1"></div><div class="fl" style="grid-column:1/-1"><label>Description</label><textarea id="dt2"></textarea></div><div class="fl"><label>Assigned to *</label><select id="dt3">${o(EMP)}</select></div><div class="fl"><label>Priority</label><select id="dt4">${o(['LOW','MEDIUM','HIGH','URGENT'])}</select></div><div class="fl"><label>Planned deadline *</label><input id="dt5" type="date"></div></div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="saveTask()">Create task</button></div></div>`)};
let saveTask=function(){const dlg=$('.ov .dlg');if(!dlg||dlg._submitted||!document.getElementById('dt1'))return;const g=i=>(document.getElementById('dt'+i)?.value||'').trim();if(!g(1)||!g(5))return toast('Title and planned deadline are required');
 dlg._submitted=true;TK.unshift(mk(++IDN,g(1),'DIRECT','TODO',g(4),g(3),MEN[S.role],'—',[],g(5),g(5),g(2)));closeM();toast('Task created · TODO');S.tw='team';view(false)};
PAGES.tasks=tasksPage;
/* teams */
const TX={};T.forEach((t,i)=>TX[t]={lead:['Elena Vance','Lina Aziz','Omar Haddad','Karim Fouad','Mona Saeed'][i],desc:['Plans brand strategy and long-term growth.','Produces video, motion and visual content.','Runs paid media and performance reporting.','Manages social channels and community.','Owns copy, tone of voice and editorial quality.'][i]});
const tinfo=n=>{const m=D.users.rows.filter(u=>u.teamId===n),b=D.brands.rows.filter(x=>x.teamId===n);return{m,b,o:TK.filter(t=>m.some(u=>u.fullName===t.assignee)&&!DONE4.includes(t.status)).length}};
function teamsPage(){const q=S.q.toLowerCase(),L=T.filter(t=>(t+TX[t].desc+TX[t].lead).toLowerCase().includes(q));
 return `<div class="ph"><div><span class="eb">${esc(ROLES[S.role])}</span><h1>Teams</h1><p>Operational units: who leads them, who is in them, which brands they own and how loaded they are.</p></div>${S.role==='admin'?`<button class="btn p" onclick="teamNew()">+ New team</button>`:''}</div>
<div class="cards">${L.map(n=>{const i=tinfo(n),x=TX[n];return `<div class="card tc"><div style="display:flex;justify-content:space-between;gap:8px;align-items:start"><h2>${esc(n)}</h2><span class="pill ${i.o>2?'wn':'ok'}">${i.o} open tasks</span></div><span class="mute">${esc(x.desc)}</span><div class="mute" style="font-size:12px">Lead: <b style="color:var(--ink)">${esc(x.lead)}</b></div><div class="avs">${i.m.slice(0,5).map(u=>`<div class="av" title="${esc(u.fullName)}">${esc(ini2(u.fullName))}</div>`).join('')||'<span class="mute">No members</span>'}</div><div>${i.b.map(b=>`<span class="tag">${esc(b.name)}</span>`).join('')||'<span class="mute">No brands</span>'}</div><div class="dash" style="margin:2px 0"></div><div style="display:flex;justify-content:space-between;align-items:center"><span class="mute">${i.m.length} members · ${i.b.length} brands</span><button class="btn sm t" onclick="teamView(decodeURIComponent('${encodeURIComponent(n)}'))">Details</button></div></div>`}).join('')}</div>`}
let teamView=function(n){const i=tinfo(n),x=TX[n];modal(`<div class="dlg"><h2>${esc(n)}</h2><p class="mute" style="margin:4px 0 12px">${esc(x.desc)}</p><dl class="kv"><dt>Team lead</dt><dd>${esc(x.lead)}</dd><dt>Members (${i.m.length})</dt><dd>${i.m.map(u=>`${esc(u.fullName)} <span class="mute">· ${esc(u.jobTitleId)}</span>`).join('<br>')||'—'}</dd><dt>Brands (${i.b.length})</dt><dd>${i.b.map(b=>esc(b.name)+' '+pill(b.status)).join('<br>')||'—'}</dd><dt>Open tasks</dt><dd>${TK.filter(t=>i.m.some(u=>u.fullName===t.assignee)&&!DONE4.includes(t.status)).map(t=>esc(t.title)+' '+pill(t.status)).join('<br>')||'None'}</dd></dl><div class="ft"><button class="btn p" onclick="closeM()">Close</button></div></div>`)};
function teamNew(){const U=D.users.rows.filter(u=>u.roleId!=='Client'),ck=(c,a)=>`<div class="ck">${a.map(v=>`<label><input type="checkbox" data-${c}="${esc(v)}">${esc(v)}</label>`).join('')}</div>`;
 modal(`<div class="dlg"><h2>New team</h2><p class="mute" style="margin:0 0 16px">Name it, pick a lead, then add members and brands.</p><div class="fl"><label>Team name *</label><input id="tn1"></div><div class="fl"><label>Description</label><textarea id="tn2"></textarea></div><div class="fl"><label>Team lead</label><select id="tn3">${U.map(u=>`<option value="${esc(u.fullName)}">${esc(u.fullName)}</option>`).join('')}</select></div><div class="fl"><label>Members</label>${ck('tm',U.map(u=>u.fullName))}</div><div class="fl"><label>Brands</label>${ck('tb',D.brands.rows.map(b=>b.name))}</div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="teamSave()">Create team</button></div></div>`)}
let teamSave=function(){const dlg=$('.ov .dlg'),el1=document.getElementById('tn1');if(!dlg||!el1||dlg._submitted)return;const n=el1.value.trim();if(!n)return toast('Team name is required');if(T.includes(n))return toast('That team already exists');
 dlg._submitted=true;T.push(n);TX[n]={lead:document.getElementById('tn3').value,desc:document.getElementById('tn2').value.trim()||'—'};
 document.querySelectorAll('[data-tm]:checked').forEach(c=>{const u=D.users.rows.find(x=>x.fullName===c.dataset.tm);if(u)u.teamId=n});document.querySelectorAll('[data-tb]:checked').forEach(c=>{const b=D.brands.rows.find(x=>x.name===c.dataset.tb);if(b)b.teamId=n});
 closeM();toast('Team created');view(false)};
PAGES.teams=teamsPage;
/* notifications → go to where the work is */
const NL=[{k:'content',brand:'Lumen Skincare'},{k:'tasks'},{k:'brief',brand:'Nord Coffee'}];D.notifications.rows.forEach((r,i)=>r.link=NL[i]);
D.notifications.rows.push({title:'Lumen Skincare: strategy is waiting for the client’s decision',createdAt:'3 h ago',isRead:false,link:{k:'strategy',brand:'Lumen Skincare'}},{title:'Nord Coffee: strategy sent to the Account Manager',createdAt:'Yesterday',isRead:false,link:{k:'strategy',brand:'Nord Coffee'}});
const DEST={strategy:'Content Strategy',content:'Platforms',brief:'Brand Brief',tasks:'Tasks',onboarding:'Brand Brief'};
let goTo=function(l){const R=S.role,cl=R==='client',m={strategy:['strategy','strategy'],content:['strategy','platforms'],brief:['brief','brief'],onboarding:['onboarding','brief']}[l.k];let p='tasks',b=null,s=null;
 if(l.k!=='tasks'&&m){if(cl)p=m[0];else if(NAV[R].includes('brands')){p='brands';b=l.brand;s=m[1]}}
 const allowed=NAV[R]||NAV.admin;S.page=isAllowedPage(R,p)?p:allowed[0];S.brand=b;S.sub=s;S.q='';if(_searchTimer){clearTimeout(_searchTimer);_searchTimer=null}S.open=false;S.err={};render()};
(function hydrateStoredNotifs(){
 const saved=loadStoredNotifs();
 saved.slice().reverse().forEach(n=>{
  if(n?.title&&!D.notifications.rows.some(x=>x.title===n.title)){
   D.notifications.rows.unshift(n);
  }
 });
})();
let nview=function(i){const r=D.notifications.rows[i];r.isRead=true;syncStoredNotifRead(r.title,false);goTo(r.link||{k:'tasks'})};
function markRead(i){
 const r=D.notifications.rows[i];
 if(!r||r.isRead)return;
 r.isRead=true;
 syncStoredNotifRead(r.title,false);
 if(r._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  apiCall('/notifications/'+r._id+'/read',{method:'PATCH'}).catch(()=>{});
 }
 render(false);
}
function markAllRead(){
 D.notifications.rows.forEach(r=>{r.isRead=true});
 syncStoredNotifRead('',true);
 if(typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  apiCall('/notifications/read-all',{method:'PATCH'}).catch(()=>{});
 }
 toast('All notifications marked as read');
 render(false);
}
function notifPage(){const R=S.role,q=S.q.toLowerCase(),cb=curClientBrand();let L=D.notifications.rows.map((r,i)=>({r,i})).filter(({r})=>(!r.to||r.to.includes(R))&&(R!=='client'||(r.title.includes(cb)&&!r.internal))).filter(({r})=>r.title.toLowerCase().includes(q)&&(S.nf!=='unread'||!r.isRead));
 return `<div class="ph"><div><span class="eb">${esc(ROLES[R])}</span><h1>Notifications</h1><p>Press View to jump to the screen where you handle it.</p></div><button class="btn" onclick="markAllRead()">Mark all as read</button></div><div class="seg" role="group" aria-label="Filter notifications" style="width:max-content;margin:0 0 16px">${['all','unread'].map(x=>`<button class="${S.nf===x?'on':''}" aria-pressed="${S.nf===x}" onclick="S.nf='${x}';view(false)">${x==='all'?'All':'Unread'}</button>`).join('')}</div>`+
 (L.length?`<div class="card" style="padding:8px 20px">${L.map(({r,i})=>`<div style="display:flex;gap:14px;align-items:center;justify-content:space-between;padding:14px 0;border-top:1px solid var(--line);flex-wrap:wrap"><div style="min-width:220px;flex:1"><div style="font-weight:${r.isRead?500:700}">${esc(r.title)}</div><div class="mute" style="font-size:12px">${esc(r.createdAt)} · opens ${esc(DEST[(r.link||{k:'tasks'}).k]||'Tasks')}</div></div>${r.isRead?'<span class="pill">Read</span>':'<span class="pill in">Unread</span>'}${!r.isRead?`<button class="btn sm" onclick="markRead(${i})">Mark read</button>`:''}<button class="btn sm p" onclick="nview(${i})">View →</button></div>`).join('')}</div>`:`<div class="card empty"><span class="chip">${ic('bell')}</span><h2>All caught up</h2></div>`)}
PAGES.notifications=notifPage;
const _sgo=sgo;sgo=function(a){const n=D.notifications.rows.length;_sgo(a);const r=D.notifications.rows[0];if(D.notifications.rows.length>n)r.link={k:'strategy',brand:S.brand}};
const _obf=obFinish;obFinish=function(){_obf();D.notifications.rows[0].link={k:'onboarding',brand:curClientBrand()}};
/* dashboards for Content Creator, Creative and Client */
function roleDash(){const R=S.role,me=MEN[R],mine=TK.filter(t=>t.assignee===me),open=mine.filter(t=>!DONE4.includes(t.status)).sort((a,b)=>a.eff<b.eff?-1:1),od=open.filter(isOd).length,
 S4=(a)=>`<div class="stats">${a.map(s=>`<div class="stat ${s[2]?'al':''}"><span class="mono mute">${s[0]}</span><b>${s[1]}</b></div>`).join('')}</div>`,
 hd=(_t,p)=>`<div class="ph"><div><span class="eb">${esc(ROLES[R])}</span><h1>Dashboard</h1><p>${esc(p)}</p></div></div>`;
 if(R==='client'){const cb=curClientBrand(),s=sg(cb),un=D.notifications.rows.filter(r=>!r.isRead&&r.title.includes(cb)),SL={none:'Not started',uploaded:'Being prepared',am:'Being prepared',client:'Waiting for your decision',answered:'Your answer was sent',forwarded:s.out==='approved'?'Approved':'Revision in progress'}[s.st],p=Math.round(OB.done.length/7*100);
  return hd(0,cb+' at a glance.')+S4([['Onboarding',p+'%'],['Strategy',SL.split(' ')[0]],['Unread updates',un.length]])+`<div class="g2" style="grid-template-columns:1fr 1fr"><div class="card"><h2>Onboarding</h2><p class="mute">${OB.submitted?'Submitted. Your account manager is preparing the brief.':OB.done.length+' of 7 sections done.'}</p><div class="pbar" style="width:100%;margin:12px 0"><i style="width:${p}%"></i></div><button class="btn p" onclick="goTo({k:'onboarding'})">${OB.submitted?'View answers':'Continue onboarding'}</button></div><div class="card"><h2>Strategy</h2><p class="mute">${esc(SL)}</p><div class="dash"></div><button class="btn ${s.st==='client'?'p':''}" onclick="goTo({k:'strategy'})">${s.st==='client'?'Review & decide':'Open strategy'}</button></div></div>`}
 const extra=R==='cc'?`<div class="card"><h2>Strategy per brand</h2>${D.brands.rows.slice(0,3).map(b=>{const s=sg(b.name);return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--line)"><b>${esc(b.name)}</b><span class="pill ${s.st==='forwarded'&&s.out==='approved'?'ok':'wn'}">${s.st==='none'?'No strategy':s.st==='forwarded'&&s.out==='approved'?'Approved':'In flow'}</span><button class="btn sm t" onclick="goTo({k:'strategy',brand:decodeURIComponent('${encodeURIComponent(b.name)}')})">Open</button></div>`}).join('')}</div>`:`<div class="card"><h2>By status</h2>${['TODO','IN_PROGRESS','SUBMITTED','NEEDS_CHANGES','COMPLETED'].map(x=>{const c=mine.filter(t=>t.status===x).length;return `<div class="tb" style="grid-template-columns:130px 1fr 30px"><span>${lab(x)}</span><div class="bar"><i style="width:${mine.length?c/mine.length*100:0}%"></i></div><b>${c}</b></div>`}).join('')}</div>`;
 return hd(0,R==='cc'?'Your work, strategies and deadlines.':'Your tasks and deadlines.')+S4([['Open tasks',open.length],['Overdue',od,1],['Needs changes',mine.filter(t=>t.status==='NEEDS_CHANGES').length],['Completed',mine.filter(t=>t.status==='COMPLETED').length]])+`<div class="g2" style="grid-template-columns:1.3fr 1fr"><div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h2>Up next</h2><button class="btn sm t" onclick="go('tasks')">Open My Work</button></div>${open.slice(0,4).map(t=>`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:12px 0;border-top:1px solid var(--line)"><div><b>${esc(t.title)}</b><div class="mute" style="font-size:12px">${dl(t)}</div></div>${pill(t.status)}<button class="btn sm" onclick="tdet(${t.id})">Details</button></div>`).join('')||'<p class="mute">Nothing pending.</p>'}</div>${extra}</div>`}
const _d=dashboard;PAGES.dashboard=()=>S.role==='admin'||S.role==='am'?_d():roleDash();

/* ===== v5: content items under their platform + detail pages ===== */
/* breadcrumb + compact back arrow (crumbs are clickable; Esc and the browser Back button also go back) */
function whr(){const p=N[S.page]?N[S.page][0]:'Back',x="S.det=null;view(false)";if(S.page==='brands'&&S.brand){const sb=S.sub?lab(S.sub):'';return{back:S.brand+(sb?' · '+sb:''),trail:[['Brands',"S.det=null;S.brand=null;S.sub=null;view(false)"],[S.brand,"S.det=null;S.sub=null;view(false)"]].concat(sb?[[sb,x]]:[])}}return{back:p,trail:[[p,x]]}}
const bk=(js,cur,back,trail)=>{const w=whr(),tr=trail||w.trail,bl=back||w.back,sep=' <span style="opacity:.4">/</span> ';return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:22px;flex-wrap:wrap"><button onclick="${js}" title="Back to ${esc(bl)}" aria-label="Back to ${esc(bl)}" style="width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:#fff;cursor:pointer;font-size:18px;line-height:1;display:inline-flex;align-items:center;justify-content:center">←</button><nav aria-label="Breadcrumb" style="font-size:14px;display:flex;flex-wrap:wrap;align-items:center;gap:2px">${tr.map(x=>Array.isArray(x)?`<a class="lk" style="text-decoration:none;color:var(--mute,#6b6b76)" onclick="${x[1]}">${esc(x[0])}</a>`:`<span class="mute">${esc(x)}</span>`).join(sep)}${sep}<b>${esc(String(cur||'').replace(/<[^>]*>/g,''))}</b></nav></div>`};
D.platform.rows.push({brandId:'Lumen Skincare',platform:'TIKTOK',accountName:'@lumen.skin.tt',accountUrl:'tiktok.com/@lumen.skin.tt',isActive:true});
PLANS[0].platform='@lumen.skin';PLANS[0].items.forEach(i=>i.platform='@lumen.skin');
{const f=PLANS[0].items.pop();f.type='REEL';f.platform='@lumen.skin.tt';f.hook='Founder looks to camera: "Why I started Lumen"';f.duration='30s';PLANS.push({id:++IDN,brand:'Lumen Skincare',platform:'@lumen.skin.tt',title:'Nov · Lumen TikTok',month:'Nov 2026',campaigns:[],items:[f]})}
Object.assign(PLANS[0].items[0],{duration:'30s',hook:'Skin before/after in 3 seconds',script:'1. Bare-face close-up\n2. 3-step serum routine\n3. Glow result + product shot',audio:'Trending soft-pop track',cta:'Shop the Winter Glow set',hashtags:'#skincare #winterglow'});
S.det=null;
const kvh=o=>o.map(([a,b])=>`<dt>${a}</dt><dd>${b??'—'}</dd>`).join('');
const fItem=id=>{for(const p of PLANS){const x=p.items.find(i=>i.id===id);if(x)return[x,p]}};
const brItems=b=>PLANS.filter(p=>p.brand===b).flatMap(p=>p.items.map(i=>[i,p]));
let openD=function(o){S.det=o;S.err={};window.scrollTo(0,0);view(false)};
const itTable=l=>l.length?`<div class="tw"><table><thead><tr><th scope="col">Item</th><th scope="col">Type</th><th scope="col">Plan</th><th scope="col">Date</th><th scope="col">Stage</th></tr></thead><tbody>${l.map(([i,p])=>`<tr><td><a class="lk" onclick="openD({t:'item',id:${i.id}})">${esc(i.title)}</a></td><td><span class="tag">${esc(i.type)}</span></td><td>${esc(p.title)}</td><td><span class="mono">${esc(i.date||'—')}</span></td><td>${SP(i.stage||'DRAFT')}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mute" style="margin:8px 0 0">No content items yet.</p>';
const dp=(t,pl,kv,ex='',bt='')=>`${bk('S.det=null;view(false)',t)}<div class="ph"><div><span class="eb">${esc(ROLES[S.role])}</span><h1>${t}</h1><div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${pl}</div></div>${bt}</div>${kv===null?'':`<div class="card"><dl class="kv" style="margin:0">${kv}</dl></div>`}${ex}`;
/* detail pages */
function rowDet(k,i){const E=D[k],r=E.rows[i];if(!r)return null;const w=can(k),del=w&&!E.noDelete&&(k!=='users'||S.role==='admin'),ac=E.acts?E.acts(r):[];
 const ent=Object.entries(r).filter(([a])=>a!=='content'&&a!=='_id').map(([a,v])=>[esc(hum(a)),a==='status'||a==='isActive'?pill(v):(a==='accountUrl'||a==='websiteUrl')&&safeUrl(v)?`<a class="lk" href="${esc(safeUrl(v))}" target="_blank" rel="noopener noreferrer">${esc(v)}</a>`:Array.isArray(v)?esc(v.join(', ')):esc(v)]);
 const ex=(k==='briefs'?renderBriefContent(r):(r.content?`<div class="card" style="margin-top:16px"><div class="mono mute" style="margin-bottom:8px">content (JSON)</div><pre>${esc(JSON.stringify(r.content,null,2))}</pre></div>`:''))+(k==='platform'?`<div class="card" style="margin-top:16px"><h2 style="margin-bottom:8px">Content items on this platform</h2>${itTable(brItems(r.brandId).filter(([x])=>x.platform===r.accountName))}</div>`:'');
 const bt=`<div style="display:flex;gap:8px;flex-wrap:wrap">${ac.map(a=>`<button class="btn" onclick="act('${k}',${i},'${a[1]}')">${esc(a[0])}</button>`).join('')}${w?`<button class="btn" onclick="act('${k}',${i},'edit')">Edit</button>`:''}${del?`<button class="btn dg" onclick="act('${k}',${i},'del')">Delete</button>`:''}</div>`;
 return dp(esc(r.name||r.title||r.fullName||r.accountName||r.fileName||r.key||r[E.cols[0][0]]),`<span class="tag lc">${esc(E.n)}</span>`+(r.status!==undefined?pill(r.status):''),kvh(ent),ex,bt)}
function campDet(pid,n){const p=PLANS.find(x=>x.id===pid),c=p&&p.campaigns[n];if(!c)return null;const l=p.items.filter(i=>i.campaign===c.name).map(i=>[i,p]);
 return dp(esc(c.name),'<span class="tag lc">Campaign</span>',kvh([['Objective',esc(c.objective)||'—'],['Brand',esc(p.brand)],['Content plan',esc(p.title)],['Content items',l.length]]),`<div class="card" style="margin-top:16px"><h2 style="margin-bottom:8px">Content items</h2>${itTable(l)}</div>`)}
let taskDet=function(id){const t=TK.find(x=>x.id===id);if(!t)return null;const w=t.after&&TK.find(x=>x.id===t.after);
 const subLink=t.submissionUrl&&safeUrl(t.submissionUrl)?`<a class="lk" href="${esc(safeUrl(t.submissionUrl))}" target="_blank" rel="noopener noreferrer">${esc(t.submissionUrl)}</a>`:'—';
 const rows=[['Context',esc(ctxL(t))],['Description',esc(t.desc)||'—'],['Assigned to',esc(t.assignee)],['Created by',esc(t.by)],['Planned deadline',esc(t.planned)],['Effective deadline',dl(t)],['Waiting on',w?esc(w.title)+' · '+esc(lab(w.status)):'Nothing']];
 if(t.submissionUrl)rows.push(['Submission URL',subLink]);
 if(t.submissionNotes)rows.push(['Submission notes',esc(t.submissionNotes)]);
 return dp(esc(t.title),pill(t.status)+pill(t.priority)+`<span class="tag">${esc(TY[t.kind]||t.kind)}</span>`,kvh(rows),'',`<div style="display:flex;gap:8px;flex-wrap:wrap">${tbtn(t)}</div>`)};
function planDet(pid){
 const p=pl(pid);if(!p)return null;
 const R=S.role,cc=R==='cc',s=sg(p.brand),ok=s.st==='forwarded'&&s.out==='approved';
 const campCards=p.campaigns.map((c,ci)=>{
  const items=p.items.filter(i=>i.campaign===c.name).map(i=>[i,p]);
  return `<div class="card" style="margin-top:16px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px"><div><h2 style="margin:0"><a class="lk" onclick="openD({t:'camp',p:${p.id},n:${ci}})">${esc(c.name)}</a></h2>${c.objective?`<p class="mute" style="margin:4px 0 0">${esc(c.objective)}</p>`:''}</div><span class="tag lc">${items.length} item${items.length===1?'':'s'}</span></div>${itTable(items)}</div>`;
 }).join('');
 const unassigned=p.items.filter(i=>!i.campaign||i.campaign==='—'||!p.campaigns.some(c=>c.name===i.campaign)).map(i=>[i,p]);
 const unassignedCard=`<div class="card" style="margin-top:16px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px"><h2 style="margin:0">Unassigned to a campaign</h2><span class="tag">${unassigned.length} item${unassigned.length===1?'':'s'}</span></div>${itTable(unassigned)}</div>`;
 const acts=cc&&ok?`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" onclick="newCamp(${p.id})">+ Campaign</button><button class="btn p" onclick="newItem(${p.id})">+ Content item</button></div>`:'';
 return dp(esc(p.title),`<span class="tag lc">${esc(p.month||'Monthly plan')}</span>`+pill(p.status||'DRAFT'),kvh([['Brand',esc(p.brand)],['Platform',esc(p.platform||'—')],['Monthly goals',esc(p.monthlyGoals||'—')],['Campaigns',p.campaigns.length],['Total items',p.items.length]]),campCards+unassignedCard,acts);
}
function teamDet(n){const x=TX[n];if(!x)return null;const i=tinfo(n),ad=S.role==='admin',ix=T.indexOf(n),openT=TK.filter(t=>i.m.some(u=>u.fullName===t.assignee)&&!DONE4.includes(t.status)),
 L=(h,b,js)=>`<div class="card" style="margin-top:16px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px"><h2>${h}</h2>${ad&&js?`<button class="btn sm" onclick="${js}">Edit</button>`:''}</div>${b}</div>`,e0='<p class="mute" style="margin:0">Nothing here yet.</p>',
 row=(m,s,js)=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line)"><div>${m}<div class="mute" style="font-size:12px">${s}</div></div><button class="btn sm t" onclick="${js}">View</button></div>`,
 ui=nm=>D.users.rows.findIndex(u=>u.fullName===nm),bi=nm=>D.brands.rows.findIndex(b=>b.name===nm);
 return dp(esc(n),`<span class="pill ${i.o>2?'wn':'ok'}">${i.o} open tasks</span>`,null,
  L('About',`<dl class="kv" style="margin:0">${kvh([['Description',esc(x.desc)],['Team lead',esc(x.lead)],['Members',i.m.length],['Brands',i.b.length]])}</dl>`,`teamEditAbout(${ix})`)
  +L('Members ('+i.m.length+')',i.m.map(u=>row(esc(u.fullName)+(u.fullName===x.lead?' <span class="pill ok">Lead</span>':''),esc(u.jobTitleId||''),`act('users',${ui(u.fullName)},'view')`)).join('')||e0,`teamEditMem(${ix})`)
  +L('Brands ('+i.b.length+')',i.b.map(b=>row(esc(b.name)+' '+pill(b.status),esc(b.industry||''),`S.det=null;S.page='brands';act('brands',${bi(b.name)},'view')`)).join('')||e0,`teamEditBr(${ix})`)
  +L('Open tasks ('+openT.length+')',openT.map(t=>row(esc(t.title)+' '+pill(t.status),esc(t.assignee)+' · '+(dl(t)||'—'),`openD({t:'task',id:${t.id}})`)).join('')||e0),
  ad?`<div style="display:flex;gap:8px"><button class="btn" onclick="teamEdit(${ix})">Rename / edit all</button><button class="btn dg" onclick="teamDel(${ix})">Delete team</button></div>`:'')}
const detPage=()=>{const d=S.det;return d.t==='row'?rowDet(d.k,d.i):d.t==='item'?itemDet(d.id):d.t==='plan'?planDet(d.id):d.t==='camp'?campDet(d.p,d.n):d.t==='sub'?subHtml(d):d.t==='task'?taskDet(d.id):teamDet(d.n)};
const _v=view,_go=go,_sr=setRole,_gt=goTo,_act=act,_ed=E_del,_sp=subPage;
view=function(sk=true){enforceRoleRoute();const v=$('#view');if(S.det&&v){let h=null;try{h=detPage()}catch{/* ignore */}if(h){v.innerHTML=h;return}S.det=null}_v(sk)};
go=p=>{S.det=null;_go(p)};setRole=r=>{S.det=null;_sr(r)};goTo=l=>{S.det=null;_gt(l)};
act=(k,i,a)=>{if(a==='view'&&k!=='brands'&&D[k].rows[i]){const r=D[k].rows[i];openD({t:'row',k,i});if(k==='briefs'&&r?._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){apiCall('/brand-briefs/'+r._id).then(fresh=>{const mapped=normalizeBriefRow(fresh,r.brandId);if(mapped){Object.assign(r,mapped);if(S.det?.t==='row'&&S.det?.k==='briefs'&&S.det?.i===i)view(false)}}).catch(()=>{})}return}return _act(k,i,a)};
E_del=(k,i)=>{S.det=null;_ed(k,i)};
tdet=id=>openD({t:'task',id});teamView=n=>openD({t:'team',n});
subPage=b=>S.sub==='platforms'?bk("S.sub=null;S.q='';view(false)",'Social media platforms',b.name,[['Brands',"S.sub=null;S.q='';S.brand=null;view(false)"],[b.name,"S.sub=null;S.q='';view(false)"]])+platformsPage(b):_sp(b);

/* ===== v6: plans live under each platform; type-aware content item form ===== */
const FS={POST:[['format','Post format','select',['Photo','Graphic','Quote card','Product shot']],['visual','Visual direction','textarea'],['caption','Caption','textarea'],['hashtags','Hashtags'],['cta','Call to action'],['alt','Alt text']],
REEL:[['duration','Duration','select',['15s','30s','60s','90s']],['hook','Hook (first 3 seconds)'],['script','Script / storyboard','textarea'],['audio','Audio / music'],['onscreen','On-screen text'],['cover','Cover frame idea'],['caption','Caption','textarea'],['hashtags','Hashtags'],['cta','Call to action']],
STORY:[['frames','Number of frames','number'],['storyplan','Frame-by-frame plan','textarea'],['sticker','Interactive sticker','select',['None','Poll','Quiz','Question','Link','Countdown']],['link','Link (if any)'],['cta','Call to action']],
CAROUSEL:[['slides','Number of slides','number'],['cover','Cover slide headline'],['outline','Slide-by-slide outline','textarea'],['caption','Caption','textarea'],['hashtags','Hashtags'],['cta','Call to action']]};
const ALLOWED={INSTAGRAM:['POST','REEL','STORY','CAROUSEL'],FACEBOOK:['POST','REEL','STORY','CAROUSEL'],TIKTOK:['REEL','CAROUSEL','POST'],LINKEDIN:['POST','CAROUSEL'],YOUTUBE:['REEL']};
const fld=([n,l,ty,o],v)=>ty==='textarea'?`<div class="fl" style="grid-column:1/-1"><label>${esc(l)}</label><textarea data-f="${esc(n)}">${esc(v[n])}</textarea></div>`:ty==='select'?`<div class="fl"><label>${esc(l)}</label><select data-f="${esc(n)}">${o.map(x=>`<option value="${esc(x)}" ${x===v[n]?'selected':''}>${esc(x)}</option>`).join('')}</select></div>`:`<div class="fl"><label>${esc(l)}</label><input data-f="${esc(n)}" type="${esc(ty||'text')}" value="${esc(v[n])}"></div>`;
function itModal(pid,v,eid){const p=pl(pid),pr=D.platform.rows.find(r=>r.brandId===p.brand&&r.accountName===p.platform),ty=ALLOWED[pr&&pr.platform]||ALLOWED.INSTAGRAM,t=ty.includes(v.type)?v.type:ty[0];v.type=t;
 return `<div class="dlg"><h2>${eid?'Edit':'New'} content item</h2><p class="mute" style="margin:0 0 16px">${esc(p.platform)} · ${esc(p.title)}. The fields below change with the type.</p><div class="pg">${fld(['title','Title *'],v)}<div class="fl"><label>Type</label><select data-f="type" onchange="itType(${pid},this.value${eid?','+eid:''})">${ty.map(x=>`<option value="${esc(x)}" ${x===t?'selected':''}>${esc(x)}</option>`).join('')}</select></div>${fld(['campaign','Campaign','select',['—',...p.campaigns.map(c=>c.name)]],v)}${fld(['date','Scheduled date','date'],v)}${FS[t].map(f=>fld(f,v)).join('')}${fld(['notes','Notes','textarea'],v)}</div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="itSave(${pid}${eid?','+eid:''})">${eid?'Save':'Create'} ${esc(lab(t))}</button></div></div>`}
const itVals=()=>Object.fromEntries([...document.querySelectorAll('.dlg [data-f]')].map(x=>[x.dataset.f,x.value]));
function itType(pid,t,eid){const v=itVals();v.type=t;const ov=$('.ov');if(ov)ov.innerHTML=itModal(pid,v,eid)}
let itSave=function(pid,eid){const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;const v=itVals();if(!(v.title||'').trim())return toast('Title is required');const p=pl(pid);if(!p)return;
 dlg._submitted=true;
 if(eid){const it=fItem(eid)[0];Object.assign(it,v);if(it.stage==='APPROVED'){it.stage='IN_REVIEW';snapV(it);it.v=(it.v||1)+1;logH(it,'Edited after approval','Returned to internal review')}}else p.items.push({...v,id:++IDN,platform:p.platform,assignee:'',priority:'MEDIUM',status:'TODO'});closeM();toast(eid?'Changes saved':'Content item created');if(eid)view(false);else openSub('item',p.items[p.items.length-1].id)};
function editItem(id){const[i,p]=fItem(id);modal(itModal(p.id,{...i},id))}
const cfm=(t,js)=>modal(`<div class="dlg"><h2>${t}</h2><p class="mute">This can’t be undone.</p><div class="ft"><button class="btn" onclick="closeM()">Keep it</button><button class="btn p" style="background:var(--et);border-color:var(--et)" onclick="${js}">Delete</button></div></div>`);
function doDelItem(id){
 const found=fItem(id);
 const item=found?.[0];
 PLANS.forEach(p=>{p.items=p.items.filter(i=>i.id!==id)});
 closeM();
 toast('Deleted');
 S.det=null;
 view(false);
 if(item?._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  apiCall('/content-items/'+item._id,{method:'DELETE'}).catch(err=>{if(err?.message)toast(err.message)});
 }
}
const delItem=id=>cfm('Delete this content item?',`doDelItem(${id})`);
function doDelPlan(id){
 const idx=PLANS.findIndex(p=>p.id===id);
 if(idx<0)return;
 const plan=PLANS[idx];
 PLANS.splice(idx,1);
 closeM();
 toast('Plan deleted');
 view(false);
 if(plan?._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  apiCall('/content-plans/'+plan._id,{method:'DELETE'}).catch(err=>{if(err?.message)toast(err.message)});
 }
}
const delPlan=id=>cfm('Delete this plan and its items?',`doDelPlan(${id})`);
function parsePlanYm(ym){
 const m=/^(\d{4})-(\d{2})$/.exec(String(ym||'').trim());
 if(!m){const d=new Date();return{year:d.getFullYear(),month:d.getMonth()+1,label:d.toLocaleString('en',{month:'short',year:'numeric'})}}
 const yr=Number(m[1]),mo=Number(m[2]);
 const lbl=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][mo-1]+' '+yr;
 return{year:yr,month:mo,label:lbl};
}
function editPlan(id){
 const p=pl(id);if(!p)return;
 const ymVal=p.year&&p.month?`${p.year}-${String(p.month).padStart(2,'0')}`:'2026-11';
 modal(`<div class="dlg"><h2>Edit content plan</h2><p class="mute" style="margin:0 0 16px">${esc(p.platform)} · ${esc(p.brand)}</p>
  <div class="pg">
   <div class="fl"><label>Plan title *</label><input id="ep-title" value="${esc(p.title)}"></div>
   <div class="fl"><label>Month *</label><input id="ep-month" type="month" value="${esc(ymVal)}"></div>
   <div class="fl" style="grid-column:1/-1"><label>Monthly goals</label><textarea id="ep-goals">${esc(p.monthlyGoals||'')}</textarea></div>
  </div>
  <div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="saveEditPlan(${p.id})">Save plan</button></div>
 </div>`);
}
async function saveEditPlan(id){
 const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;
 const p=pl(id);if(!p)return;
 const title=($('#ep-title')?.value||'').trim();
 const ym=parsePlanYm($('#ep-month')?.value);
 const monthlyGoals=($('#ep-goals')?.value||'').trim();
 if(!title)return toast('Plan title is required');
 dlg._submitted=true;
 const prev={title:p.title,month:p.month,year:p.year,monthNum:p.monthNum,monthlyGoals:p.monthlyGoals};
 p.title=title;p.month=ym.label;p.year=ym.year;p.monthNum=ym.month;p.monthlyGoals=monthlyGoals;
 closeM();
 if(p._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  try{
   await apiCall('/content-plans/'+p._id,{method:'PATCH',body:{title,year:ym.year,month:ym.month,monthlyGoals:monthlyGoals||null}});
  }catch(err){
   Object.assign(p,prev);
   toast(err?.message||'Could not update content plan');
   return view(false);
  }
 }
 toast('Plan updated');
 view(false);
}
async function setPlanStatus(id,status){
 const p=pl(id);if(!p)return;
 const prev=p.status||'DRAFT';
 p.status=status;
 if(p._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  try{
   await apiCall('/content-plans/'+p._id+'/status',{method:'PATCH',body:{status}});
  }catch(err){
   p.status=prev;
   toast(err?.message||'Could not update plan status');
   return view(false);
  }
 }
 toast('Plan status updated');
 view(false);
}
newItem=id=>modal(itModal(id,{}));
let newPlanP=function(i){const a=D.platform.rows[i].accountName;ask('New monthly content plan for '+a,[['title','Plan title *'],['month','Month *','month'],['monthlyGoals','Monthly goals','textarea']],v=>{const ym=parsePlanYm(v.month);PLANS.push({id:++IDN,brand:S.brand,platform:a,title:v.title,month:ym.label,year:ym.year,monthNum:ym.month,monthlyGoals:(v.monthlyGoals||'').trim(),status:'DRAFT',campaigns:[],items:[]})})};
function platformsPage(b){const E=D.platform,w=can('platform'),q=S.q.toLowerCase(),R=S.role,cc=R==='cc',am=R==='am',s=sg(b.name),ok=s.st==='forwarded'&&s.out==='approved',
 rows=E.rows.map((r,i)=>({r,i})).filter(({r})=>r.brandId===b.name),
 sel=(id,k,o,v)=>`<select style="border:1px solid var(--line);border-radius:10px;padding:5px 8px;background:#fff" onchange="setIt(${id},'${k}',this.value)">${o.map(x=>`<option value="${esc(x)}" ${x===v?'selected':''}>${esc(k==='status'?lab(x):x)}</option>`).join('')}</select>`,
 planH=p=>{const its=p.items.filter(i=>i.title.toLowerCase().includes(q)),pst=p.status||'DRAFT';return `<div style="border:1px solid var(--line);border-radius:18px;padding:16px;margin-top:12px;background:var(--canvas)"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><div><b style="font-size:16px"><a class="lk" onclick="openD({t:'plan',id:${p.id}})">${esc(p.title)}</a></b> <span class="mute">${esc(p.month)}</span> ${pill(pst)}</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm t" onclick="openD({t:'plan',id:${p.id}})">Full plan</button>${cc&&ok?`<button class="btn sm" onclick="newCamp(${p.id})">+ Campaign</button><button class="btn sm p" onclick="newItem(${p.id})">+ Content item</button><button class="btn sm" onclick="editPlan(${p.id})">Edit plan</button>${pst==='DRAFT'||pst==='NEEDS_CHANGES'?`<button class="btn sm" onclick="setPlanStatus(${p.id},'IN_REVIEW')">Submit for review</button>`:''}<button class="btn sm dg" onclick="delPlan(${p.id})">Delete plan</button>`:''}${am&&pst==='IN_REVIEW'?`<button class="btn sm p" onclick="setPlanStatus(${p.id},'APPROVED')">Approve plan</button><button class="btn sm dg" onclick="setPlanStatus(${p.id},'NEEDS_CHANGES')">Request changes</button>`:''}</div></div>
 <div style="margin:10px 0">${p.campaigns.length?p.campaigns.map((c,ci)=>`<span class="tag lc" style="cursor:pointer" onclick="openD({t:'camp',p:${p.id},n:${ci}})">${esc(c.name)}</span>`).join(''):'<span class="mute">No campaigns yet.</span>'}</div>
 ${its.length?`<div class="tw"><table><thead><tr><th scope="col">Item</th><th scope="col">Type</th><th scope="col">Campaign</th><th scope="col">Date</th><th scope="col">Assigned to</th><th scope="col">Priority</th><th scope="col">Stage</th><th scope="col"></th></tr></thead><tbody>${its.map(i=>`<tr><td><a class="lk" onclick="openD({t:'item',id:${i.id}})">${esc(i.title)}</a></td><td><span class="tag">${esc(i.type)}</span></td><td>${esc(i.campaign||'—')}</td><td><span class="mono">${esc(i.date||'—')}</span></td><td>${am?sel(i.id,'assignee',['Unassigned',...EMP],i.assignee||'Unassigned'):esc(i.assignee)||'—'}</td><td>${am?sel(i.id,'priority',PR,i.priority):pill(i.priority)}</td><td>${SP(i.stage||'DRAFT')}</td><td>${cc&&ok?`<div class="ra"><button class="btn sm" onclick="editItem(${i.id})">Edit</button><button class="btn sm dg" onclick="delItem(${i.id})">Delete</button></div>`:''}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mute" style="margin:0">No content items in this plan yet.</p>'}</div>`};
 return (cc||am?head(E,w,'platform').replace(/<div class="note wn"><b>🔒<\/b>[\s\S]*?<\/div>/,''):head(E,w,'platform'))+(!ok&&(cc||am)?'<div class="note wn" style="align-items:center"><b>🔒</b><span style="flex:1">New plans and content items open once the client approves the strategy.</span><button class="btn sm" onclick="S.sub=\'strategy\';view(false)">Open strategy</button></div>':'')+
 (rows.length?rows.map(({r,i})=>{const ps=PLANS.filter(p=>p.brand===b.name&&p.platform===r.accountName),n=ps.reduce((a,p)=>a+p.items.length,0);
 return `<div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><div style="display:flex;align-items:center"><span class="chip" style="background:var(--lilac)">${ic('link')}</span><div><h2><a class="lk" style="text-decoration:none" onclick="act('platform',${i},'view')">${esc(r.accountName)}</a></h2><div style="margin-top:4px"><span class="tag">${esc(r.platform)}</span>${pill(r.isActive)} <span class="mute">${ps.length} plan${ps.length===1?'':'s'} · ${n} item${n===1?'':'s'}</span></div></div></div><div class="ra">${cc&&ok?`<button class="btn sm p" onclick="newPlanP(${i})">+ New plan</button>`:''}<button class="btn sm t" onclick="act('platform',${i},'view')">View</button>${w?`<button class="btn sm" onclick="act('platform',${i},'edit')">Edit</button><button class="btn sm dg" onclick="act('platform',${i},'del')">Delete</button>`:''}</div></div>${ps.length?ps.map(planH).join(''):'<p class="mute" style="margin:14px 0 0">No content plans for this platform yet.</p>'}</div>`}).join(''):'<div class="card empty"><span class="chip">'+ic('link')+'</span><h2>No platforms yet</h2><p class="mute">Add a social account, then build its content plans.</p></div>')}
const FL=Object.fromEntries(Object.values(FS).flat().concat([['notes','Notes']]).map(f=>[f[0],f[1]]));
function assignItemTasks(id){
 const f=fItem(id);if(!f)return;
 const [it,p]=f;
 const staff=D.users.rows.filter(u=>u.roleId!=='Client'&&u.isActive!==false).map(u=>u.fullName);
 const creators=[...new Set([...EMP,...staff])];
 const reviewers=[...new Set([MEN.am,...staff])];
 modal(`<div class="dlg"><h2>Assign creation &amp; review tasks</h2><p class="mute" style="margin:0 0 16px">Assign an owner and a reviewer for “${esc(it.title)}” (${esc(p.brand)}).</p>
  <div class="pg">
   <div class="fl"><label>Creation Assignee</label><select id="at-creator"><option value="">Select creator…</option>${creators.map(u=>`<option value="${esc(u)}" ${u===it.assignee?'selected':''}>${esc(u)}</option>`).join('')}</select></div>
   <div class="fl"><label>Reviewer</label><select id="at-reviewer"><option value="">Select reviewer…</option>${reviewers.map(u=>`<option value="${esc(u)}" ${u===MEN.am?'selected':''}>${esc(u)}</option>`).join('')}</select></div>
  </div>
  <div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="saveItemTasks(${id})">Assign tasks</button></div>
 </div>`);
}
async function saveItemTasks(id){
 const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;
 const creator=$('#at-creator')?.value||'';
 const reviewer=$('#at-reviewer')?.value||'';
 if(!creator&&!reviewer)return toast('Select at least a creation assignee or a reviewer.');
 const f=fItem(id);if(!f)return;
 const [it,p]=f;
 dlg._submitted=true;
 if(creator)it.assignee=creator;
 const deadline=it.date||TODAY;
 const ctx=[it.platform||'—',p.title,it.campaign||'—',it.title];
 let creationId=null;
 if(creator){
  creationId=++IDN;
  TK.unshift(mk(creationId,'Create: '+it.title,'CREATION','TODO',it.priority||'MEDIUM',creator,MEN[S.role],p.brand,ctx,deadline,deadline,'Content creation task for '+it.title));
 }
 if(reviewer){
  const reviewId=++IDN;
  TK.unshift(mk(reviewId,'Review: '+it.title,'REVIEW','TODO',it.priority||'MEDIUM',reviewer,MEN[S.role],p.brand,ctx,deadline,deadline,'Review task for '+it.title,creationId));
 }
 closeM();
 if(it._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  const body={};
  const cId=API_CACHE.usersByName[creator];
  const rId=API_CACHE.usersByName[reviewer];
  if(cId)body.creationAssigneeId=cId;
  if(rId)body.reviewerId=rId;
  if(Object.keys(body).length){
   try{
    await apiCall('/tasks/content-items/'+it._id+'/assign',{method:'POST',body});
   }catch(err){
    if(err?.message)toast(err.message);
   }
  }
 }
 toast('Creation & review tasks assigned');
 view(false);
}
let itemDet=function(id){const f=fItem(id);if(!f)return null;const[i,p]=f,
 pi=D.platform.rows.findIndex(r=>r.brandId===p.brand&&r.accountName===i.platform),c=p.campaigns.findIndex(x=>x.name===i.campaign),
 det=[...(FS[i.type]||[]).map(x=>x[0]),'notes'].filter(k=>i[k]).map(k=>[esc(FL[k]||k),esc(i[k]).replace(/\n/g,'<br>')]);
 const canAssign=S.role==='am'||S.role==='admin';
 const topAct=canAssign?`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn p" onclick="assignItemTasks(${i.id})">Assign creation &amp; review tasks</button></div>`:'';
 return dp(esc(i.title),`<span class="tag">${esc(i.type)}</span>`+SP(i.stage||'DRAFT')+pill(i.priority),kvh([['Brand',esc(p.brand)],['Platform',pi>=0?`<a class="lk" onclick="openD({t:'row',k:'platform',i:${pi}})">${esc(i.platform)}</a>`:'—'],['Content plan',esc(p.title)],['Campaign',c>=0?`<a class="lk" onclick="openD({t:'camp',p:${p.id},n:${c}})">${esc(i.campaign)}</a>`:'—'],['Scheduled',`<span class="mono">${esc(i.date||'—')}</span>`],['Assigned to',esc(i.assignee)||'Unassigned'],['Priority',pill(i.priority)]]),
 `<div class="card" style="margin-top:16px"><h2 style="margin-bottom:8px">${esc(lab(i.type))} details</h2>${det.length?`<dl class="kv" style="margin:12px 0 0">${kvh(det)}</dl>`:'<p class="mute" style="margin:0">No details filled in yet.</p>'}</div>`,topAct)};

/* ===== v7: brands as cards, richer Creative dashboard ===== */
S.bv='rows';
const _lp=listPage;
listPage=function(k){if(k!=='brands'||S.role==='client')return _lp(k);
 const tg=`<div class="seg" role="group" aria-label="View layout" style="width:max-content;margin:0 0 16px">${[['rows','☰ Rows'],['cards','▦ Cards']].map(x=>`<button class="${S.bv===x[0]?'on':''}" aria-pressed="${S.bv===x[0]}" onclick="S.bv='${x[0]}';view(false)">${x[1]}</button>`).join('')}</div>`,h=_lp(k);
 if(S.bv==='rows'){const n=h.indexOf('<div class="card"');return n<0?h+tg:h.slice(0,n)+tg+h.slice(n)}
 const E=D.brands,q=S.q.toLowerCase(),bg=['var(--lilac)','var(--peach)','var(--sky)','var(--mint)'],
 L=E.rows.map((r,i)=>({r,i})).filter(({r})=>JSON.stringify(Object.values(r)).toLowerCase().includes(q));
 return head(E,can(k),k)+tg+(L.length?`<div class="cards">${L.map(({r,i})=>{const np=D.platform.rows.filter(x=>x.brandId===r.name).length,pc=PLANS.filter(p=>p.brand===r.name).length;
 return `<div class="card tc" style="cursor:pointer" onclick="act('brands',${i},'view')"><div style="display:flex;gap:12px;align-items:center"><div class="av" style="width:48px;height:48px;border-radius:14px;background:${bg[i%4]};font-size:15px">${esc(r.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div style="min-width:0;flex:1"><b style="font-size:16px">${esc(r.name)}</b><div class="mute" style="font-size:12px">${esc(r.industry)}</div></div>${pill(r.status)}</div><div class="mute" style="font-size:12px">Team: <b style="color:var(--ink)">${esc(r.teamId)}</b><br>Account manager: <b style="color:var(--ink)">${esc(r.accountManagerId)}</b></div><div class="dash" style="margin:2px 0"></div><div><span class="tag">${np} platform${np===1?'':'s'}</span><span class="tag">${pc} plan${pc===1?'':'s'}</span></div></div>`}).join('')}</div>`:'<div class="card empty"><h2>No brands match</h2></div>')};
function empExtra(){const me=MEN[S.role],cc=S.role==='cc',u=D.users.rows.find(x=>x.fullName===me)||{},ts=[...new Set([u.teamId,...T.filter(t=>TX[t]&&TX[t].lead===me)])].filter(t=>t&&TX[t]),
 mine=TK.filter(t=>t.assignee===me&&!DONE4.includes(t.status)),
 bl=D.brands.rows.map(b=>({b,tb:ts.includes(b.teamId),n:mine.filter(t=>t.brand===b.name).length})).filter(x=>x.tb||x.n);
 return `<div class="g2" style="grid-template-columns:1fr 1.4fr;margin-top:20px"><div class="card"><h2 style="margin-bottom:8px">My teams</h2>${ts.map(n=>{const i=tinfo(n),x=TX[n];return `<div style="padding:14px 0;border-top:1px solid var(--line)"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>${esc(n)}</b><span class="pill ${i.o>2?'wn':'ok'}">${i.o} open tasks</span></div><div class="mute" style="font-size:12px;margin:4px 0 8px">${esc(x.desc)} · Lead: ${esc(x.lead)}</div><div class="avs">${i.m.slice(0,6).map(m=>`<div class="av" title="${esc(m.fullName)}">${esc(ini2(m.fullName))}</div>`).join('')}</div><button class="btn sm t" style="margin-top:10px" onclick="openD({t:'team',n:decodeURIComponent('${encodeURIComponent(n)}')})">View team</button></div>`}).join('')||'<p class="mute">You are not in a team yet.</p>'}</div>
 <div class="card"><h2 style="margin-bottom:12px">My brands</h2>${bl.length?`<div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${bl.map(({b,tb,n})=>`<div style="border:1px solid var(--line);border-radius:16px;padding:14px;${cc?'cursor:pointer':''}" ${cc?`onclick="S.det=null;S.page='brands';S.brand=decodeURIComponent('${encodeURIComponent(b.name)}');S.sub=null;S.q='';render(false)"`:''}><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>${esc(b.name)}</b>${pill(b.status)}</div><div class="mute" style="font-size:12px">${esc(b.industry)}</div><div style="margin-top:10px"><span class="tag ${tb?'lc':'pe'}">${tb?'Team brand':'Assigned to you'}</span></div><div class="mute" style="font-size:12px;margin-top:6px">${n} open task${n===1?'':'s'} for you</div></div>`).join('')}</div>`:'<p class="mute">No brands yet.</p>'}</div></div>`}
const _pd=PAGES.dashboard;PAGES.dashboard=()=>{const h=_pd();if(S.role!=='emp'&&S.role!=='cc')return h;const m='</p></div></div>',n=h.indexOf(m)+m.length;return n<m.length?h:h.slice(0,n)+empExtra().replace('margin-top:20px','margin:0 0 20px')+h.slice(n)};

/* ===== v8: admin can edit / delete teams ===== */
function teamEdit(i){const n=T[i],x=TX[n],inf=tinfo(n),U=D.users.rows.filter(u=>u.roleId!=='Client').map(u=>u.fullName),
 ck=(c,l,on)=>`<div class="ck">${l.map(v=>`<label><input type="checkbox" data-${c}="${esc(v)}" ${on.includes(v)?'checked':''}>${esc(v)}</label>`).join('')}</div>`;
 modal(`<div class="dlg"><h2>Edit team</h2><p class="mute" style="margin:0 0 16px">Update the name, lead, members and brands.</p><div class="fl"><label>Team name *</label><input id="te1" value="${esc(n)}"></div><div class="fl"><label>Description</label><textarea id="te2">${esc(x.desc==='—'?'':x.desc)}</textarea></div><div class="fl"><label>Team lead</label><select id="te3">${[...new Set([x.lead,...U])].map(u=>`<option value="${esc(u)}" ${u===x.lead?'selected':''}>${esc(u)}</option>`).join('')}</select></div><div class="fl"><label>Members</label>${ck('em',U,inf.m.map(u=>u.fullName))}</div><div class="fl"><label>Brands</label>${ck('eb',D.brands.rows.map(b=>b.name),inf.b.map(b=>b.name))}</div><div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="teamUpd(${i})">Save changes</button></div></div>`)}
let teamUpd=function(i){const dlg=$('.ov .dlg'),el1=$('#te1');if(!dlg||!el1||dlg._submitted)return;const o=T[i],n=el1.value.trim();if(!n)return toast('Team name is required');if(n!==o&&T.includes(n))return toast('That team already exists');
 dlg._submitted=true;const x=TX[o],ms=[...document.querySelectorAll('[data-em]:checked')].map(c=>c.dataset.em),bs=[...document.querySelectorAll('[data-eb]:checked')].map(c=>c.dataset.eb);
 x.lead=$('#te3').value;x.desc=$('#te2').value.trim()||'—';
 D.users.rows.forEach(u=>{if(ms.includes(u.fullName))u.teamId=n;else if(u.teamId===o)u.teamId='—'});
 D.brands.rows.forEach(b=>{if(bs.includes(b.name))b.teamId=n;else if(b.teamId===o)b.teamId='—'});
 if(n!==o){T[i]=n;TX[n]=x;delete TX[o]}
 if(S.det&&S.det.t==='team')S.det.n=n;closeM();toast('Team updated');view(false)};
const teamDel=i=>cfm('Delete the team “'+esc(T[i])+'”?',`teamRm(${i})`);
let teamRm=function(i){const n=T[i];D.users.rows.forEach(u=>{if(u.teamId===n)u.teamId='—'});D.brands.rows.forEach(b=>{if(b.teamId===n)b.teamId='—'});T.splice(i,1);delete TX[n];S.det=null;closeM();toast('Team deleted');view(false)};

/* ===== v9: workflow, review, client portal, requests, calendar, reports ===== */
const CLB='Lumen Skincare';
const STG={DRAFT:'Draft',IN_REVIEW:'Internal review',CHANGES_REQUESTED:'Changes requested',CLIENT_REVIEW:'Client review',APPROVED:'Approved',PUBLISHED:'Published'};
const TRN={DRAFT:['IN_REVIEW'],IN_REVIEW:['CLIENT_REVIEW','CHANGES_REQUESTED'],CHANGES_REQUESTED:['IN_REVIEW'],CLIENT_REVIEW:['APPROVED','CHANGES_REQUESTED'],APPROVED:['PUBLISHED'],PUBLISHED:[]};
const WHO={'DRAFT>IN_REVIEW':'cc','IN_REVIEW>CLIENT_REVIEW':'am','IN_REVIEW>CHANGES_REQUESTED':'am','CHANGES_REQUESTED>IN_REVIEW':'cc','CLIENT_REVIEW>APPROVED':'client','CLIENT_REVIEW>CHANGES_REQUESTED':'client','APPROVED>PUBLISHED':'am'};
const BTN={IN_REVIEW:'Send to internal review',CLIENT_REVIEW:'Approve for client',APPROVED:'Approve',CHANGES_REQUESTED:'Request changes',PUBLISHED:'Record publishing'};
const SP=s=>`<span class="pill ${{APPROVED:'ok',PUBLISHED:'ok',IN_REVIEW:'wn',CLIENT_REVIEW:'wn',CHANGES_REQUESTED:'er',DRAFT:'lc'}[s]||''}">${esc(STG[s]||s)}</span>`;
const now=()=>new Date().toISOString().slice(0,16).replace('T',' ');
const can2=(i,t)=>(TRN[i.stage]||[]).includes(t)&&(WHO[i.stage+'>'+t]||'').split(',').includes(S.role);
let ens=function(){PLANS.forEach(p=>p.items.forEach(i=>{i.stage=i.stage||({REVIEW:'IN_REVIEW',APPROVED:'APPROVED'}[i.status])||'DRAFT';i.v=i.v||1;i.comments=i.comments||[];i.hist=i.hist||[]}))};
ens();PLANS[0].items[0].stage='IN_REVIEW';PLANS[0].items[1].stage='CLIENT_REVIEW';
function logH(i,a,r){i.hist.push({at:now(),by:ME[S.role][0],role:ROLES[S.role],a,r:r||'',v:i.v})}
const note=(t,b,int,to)=>D.notifications.rows.unshift({title:t+(b?' · '+b:''),createdAt:'Just now',isRead:false,internal:!!int,to});const rl=n=>Object.keys(MEN).find(k=>MEN[k]===n);
let CHANGE_REQS=[];
function loadItemRevisions(id){
 const f=fItem(id);if(!f)return;
 const [it]=f;
 if(!it?._id||it._revsLoading||!getApiToken()||S.offlineMode)return;
 it._revsLoading=true;
 apiCall('/content-items/'+it._id+'/revisions').then(res=>{
  const list=Array.isArray(res)?res:(res?.revisions||[]);
  if(list.length){
   const mapped=list.map(r=>({
    v:r.revisionNumber||1,
    at:r.createdAt?String(r.createdAt).slice(0,16).replace('T',' '):now(),
    by:r.creator?.fullName||'',
    reason:r.changeReason||r.source||'',
    s:{title:r.title,type:r.type,date:r.scheduledDate?String(r.scheduledDate).slice(0,10):'',caption:r.caption||'',notes:r.notes||'',reference:r.reference||'',materialUrl:r.materialUrl||'',toneOfVoice:r.toneOfVoice||''}
   }));
   it.vers=mapped;
   const maxV=Math.max(it.v||1,...mapped.map(x=>x.v||1));
   it.v=maxV;
   it._revsLoaded=true;
   if(S.det&&S.det.t==='item'&&S.det.id===id)view(false);
  }
 }).catch(()=>{}).finally(()=>{it._revsLoading=false});
}
async function mv(id,to,reason){
 const f=fItem(id);if(!f)return;
 const [i,p]=f;
 if(!can2(i,to))return toast('That transition isn’t allowed');
 const prevStage=i.stage,prevV=i.v,prevVersLen=(i.vers||[]).length,prevHistLen=(i.hist||[]).length;
 const isClientReview=S.role==='client'&&prevStage==='CLIENT_REVIEW'&&(to==='APPROVED'||to==='CHANGES_REQUESTED');
 if(isClientReview&&i._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  try{
   const res=await apiCall('/content-items/'+i._id+'/client-review',{
    method:'POST',
    body:{decision:to==='APPROVED'?'APPROVE':'REQUEST_CHANGES',notes:to==='CHANGES_REQUESTED'?(reason||''):null}
   });
   if(res?.changeRequest){
    const cr=res.changeRequest;
    CHANGE_REQS.unshift({
     _id:cr.id,id:cr.id,contentItemId:cr.contentItemId,itemTitle:cr.contentItem?.title||i.title,
     brand:cr.brand?.name||p.brand,status:cr.status||'PENDING',
     clientNotes:cr.clientNotes||reason||'',accountManagerNotes:cr.accountManagerNotes||'',
     createdAt:cr.createdAt?String(cr.createdAt).slice(0,16).replace('T',' '):now()
    });
   }
  }catch(err){
   toast(err?.message||'Could not submit review decision');
   return;
  }
 }
 if(i.stage==='CHANGES_REQUESTED'){snapV(i);i.v++}
 const from=i.stage;
 i.stage=to;
 logH(i,STG[from]+' → '+STG[to],reason);
 note('“'+i.title+'” moved to '+STG[to].toLowerCase(),p.brand,!['CLIENT_REVIEW','APPROVED','PUBLISHED'].includes(to),{IN_REVIEW:['am','admin'],CLIENT_REVIEW:['client','cc','admin'],CHANGES_REQUESTED:['cc','am','admin'],APPROVED:['am','cc','admin'],PUBLISHED:['client','cc','admin']}[to]);
 toast('Moved to '+STG[to]);
 view(false);
}
function mvAsk(id,to){if(to!=='CHANGES_REQUESTED')return mv(id,to);ask('Request changes',[['reason','What needs to change? *','textarea']],v=>(v.reason||'').trim()?mv(id,to,v.reason.trim()):toast('A reason is required'))}
function cmt(id){ask('Add a comment',[['t','Comment','textarea']],v=>{if(!(v.t||'').trim())return;const[i]=fItem(id);i.comments.push({at:now(),by:ME[S.role][0],role:ROLES[S.role],v:i.v,t:v.t.trim()});view(false)})}
function setLink(id){ask('Link to an external file',[['u','File URL (Drive, Dropbox…)']],async v=>{const u=(v.u||'').trim();if(u&&!safeUrl(u))return toast('Use an http:// or https:// URL');const [i]=fItem(id);const prev=i.link;i.link=u;i.materialUrl=u;if(i._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){try{await apiCall('/content-items/'+i._id,{method:'PATCH',body:{materialUrl:u||null}})}catch(err){i.link=prev;i.materialUrl=prev;toast(err?.message||'Could not save link');return view(false)}}toast('External link saved');view(false)})}
function pubRec(id){ask('Record publishing',[['d','Publish date','date'],['u','Post link *'],['n','Notes','textarea']],async v=>{const u=(v.u||'').trim();if(!u||!safeUrl(u))return toast('Enter a valid http:// or https:// post link');const[i,p]=fItem(id);if(i._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){try{await apiCall('/content-items/'+i._id+'/publishing',{method:'PATCH',body:{publishStatus:'PUBLISHED',publishUrl:u,publishedAt:v.d?new Date(v.d).toISOString():new Date().toISOString(),publishNotes:(v.n||'').trim()||null}})}catch(err){toast(err?.message||'Could not record publishing');return}}i.pub={d:v.d||TODAY,u,n:(v.n||'').trim()};if(v.d)i.date=v.d;await mv(id,'PUBLISHED')})}
function resolveChangeReq(crId){
 const cr=CHANGE_REQS.find(x=>x.id===crId||x._id===crId);if(!cr)return;
 ask('Resolve change request & send back to client',[['notes','Account manager notes','textarea']],async v=>{
  const notes=(v.notes||'').trim();
  if(cr._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
   try{await apiCall('/client-change-requests/'+cr._id+'/resolve',{method:'PATCH',body:{notes:notes||null}})}
   catch(err){return toast(err?.message||'Could not resolve change request')}
  }
  cr.status='RESOLVED';cr.accountManagerNotes=notes;
  const f=allI().find(([it])=>it._id===cr.contentItemId||it.id===cr.contentItemId||it.title===cr.itemTitle);
  if(f){const[it]=f;it.stage='CLIENT_REVIEW';logH(it,'Change request resolved → Client review',notes)}
  toast('Change request resolved · sent back to client');
  view(false);
 });
}
function forwardChangeReq(crId){
 const cr=CHANGE_REQS.find(x=>x.id===crId||x._id===crId);if(!cr)return;
 const staff=[...new Set([...EMP,...D.users.rows.filter(u=>u.roleId!=='Client'&&u.isActive!==false).map(u=>u.fullName)])];
 const defDate=new Date(Date.now()+3*864e5).toISOString().slice(0,10);
 modal(`<div class="dlg"><h2>Forward change request to team</h2><p class="mute" style="margin:0 0 14px">“${esc(cr.itemTitle)}” — ${esc(cr.clientNotes)}</p>
  <div class="pg">
   <div class="fl"><label>Assign to</label><select id="fcr-to">${staff.map(u=>`<option value="${esc(u)}">${esc(u)}</option>`).join('')}</select></div>
   <div class="fl"><label>Priority</label><select id="fcr-pr">${['LOW','MEDIUM','HIGH','URGENT'].map(p=>`<option value="${p}" ${p==='HIGH'?'selected':''}>${p}</option>`).join('')}</select></div>
   <div class="fl"><label>Planned deadline</label><input id="fcr-dl" type="date" value="${defDate}"></div>
   <div class="fl" style="grid-column:1/-1"><label>Instructions for team</label><textarea id="fcr-notes" placeholder="Additional guidance…"></textarea></div>
  </div>
  <div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="confirmForwardChangeReq(${cr.id})">Forward &amp; create task</button></div>
 </div>`);
}
async function confirmForwardChangeReq(crId){
 const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;
 const cr=CHANGE_REQS.find(x=>x.id===crId||x._id===crId);if(!cr)return;
 const assignee=$('#fcr-to')?.value||EMP[0]||'';
 const priority=$('#fcr-pr')?.value||'HIGH';
 const planned=$('#fcr-dl')?.value||TODAY;
 const notes=($('#fcr-notes')?.value||'').trim();
 dlg._submitted=true;
 if(cr._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  const body={notes:notes||null,priority,plannedDeadline:new Date(planned).toISOString()};
  const uid=API_CACHE.usersByName[assignee];
  if(uid)body.assignedTo=uid;
  try{await apiCall('/client-change-requests/'+cr._id+'/forward',{method:'PATCH',body})}
  catch(err){dlg._submitted=false;return toast(err?.message||'Could not forward change request')}
 }
 cr.status='ACCEPTED';cr.accountManagerNotes=notes;
 const f=allI().find(([it])=>it._id===cr.contentItemId||it.id===cr.contentItemId||it.title===cr.itemTitle);
 if(f){const[it]=f;it.stage='CHANGES_REQUESTED';logH(it,'Forwarded change request to '+assignee,notes||cr.clientNotes)}
 TK.unshift(mk(++IDN,'Modify: '+cr.itemTitle,'CREATION','TODO',priority,assignee,MEN[S.role],cr.brand,[cr.itemTitle],planned,planned,cr.clientNotes+(notes?'\n\nAM: '+notes:'')));
 closeM();
 toast('Forwarded to '+assignee+' · modification task created');
 view(false);
}
const _id=itemDet;
itemDet=function(id){const b=_id(id);if(!b)return b;const[i]=fItem(id),R=S.role,cd=(h,x)=>`<div class="card" style="margin-top:16px"><h2 style="margin-bottom:10px">${h}</h2>${x}</div>`,lk=u=>{if(!u)return '—';const su=safeUrl(u);return su?`<a class="lk" href="${esc(su)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a>`:esc(u)},
 bt=(TRN[i.stage]||[]).filter(t=>can2(i,t)).map(t=>`<button class="btn ${t==='CHANGES_REQUESTED'?'dg':'p'}" onclick="${t==='PUBLISHED'?`pubRec(${id})`:`mvAsk(${id},'${t}')`}">${BTN[t]}</button>`).join('');
 if(i._id&&!i._revsLoaded&&!i._revsLoading)loadItemRevisions(id);
 const pendingCr=(R==='am'||R==='admin')?CHANGE_REQS.filter(cr=>cr.status==='PENDING'&&(cr.contentItemId===i._id||cr.contentItemId===i.id||cr.itemTitle===i.title)):[];
 return b+cd('Workflow',`<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${SP(i.stage)}<span class="tag">Version ${esc(i.v)}</span>${bt||'<span class="mute">No action needed from your role right now.</span>'}</div>`+ow(i)+(pendingCr.length?`<div class="note wn" style="margin-top:12px;flex-direction:column;align-items:flex-start;gap:8px"><b>Client change request pending</b>${pendingCr.map(cr=>`<div>${esc(cr.clientNotes)} <span class="mute">(${esc(cr.createdAt)})</span></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm p" onclick="resolveChangeReq(${cr.id})">Resolve &amp; resend to client</button><button class="btn sm" onclick="forwardChangeReq(${cr.id})">Forward to team</button></div>`).join('')}</div>`:''))
 +cd('External file',`<dl class="kv" style="margin:0">${kvh([['Link',lk(i.link||i.materialUrl)]])}</dl>${R==='cc'?`<button class="btn sm" style="margin-top:10px" onclick="setLink(${id})">${i.link||i.materialUrl?'Change':'Attach'} link</button>`:''}`)
 +(i.pub?cd('Publishing',`<dl class="kv" style="margin:0">${kvh([['Status','Published'],['Date',esc(i.pub.d)||'—'],['Link',lk(i.pub.u)],['Notes',esc(i.pub.n)||'—']])}</dl>`):i.stage==='APPROVED'?cd('Publishing','<p class="mute" style="margin:0">Approved — waiting to be published.</p>'):'')
 +cd('Comments ('+i.comments.length+')',(i.comments.map(c=>`<div style="padding:10px 0;border-top:1px solid var(--line)"><b>${esc(c.by)}</b> <span class="mute" style="font-size:12px">${esc(c.role)} · v${esc(c.v)} · ${esc(c.at)}</span><div>${esc(c.t)}</div></div>`).join('')||'<p class="mute" style="margin:0">No comments yet.</p>')+`<button class="btn sm" style="margin-top:12px" onclick="cmt(${id})">+ Add comment</button>`)
 +cd('Previous versions ('+(i.vers||[]).length+')',(i.vers||[]).slice().reverse().map(x=>`<details style="padding:8px 0;border-top:1px solid var(--line)"><summary><b>Version ${esc(x.v)}</b> <span class="mute">${esc(x.at)}${x.by?' · '+esc(x.by):''}${x.reason?' · '+esc(x.reason):''}</span></summary><dl class="kv" style="margin:8px 0 0">${kvh(Object.entries(x.s||{}).filter(([k,v])=>v&&typeof v!=='object'&&!['id','_id','platform','assignee','priority','status'].includes(k)).map(([k,v])=>[esc(FL[k]||k),esc(v).replace(/\n/g,'<br>')]))}</dl></details>`).join('')||'<p class="mute" style="margin:0">No earlier versions yet.</p>')+cd('Decision history',i.hist.slice().reverse().map(h=>`<div style="padding:10px 0;border-top:1px solid var(--line)"><b>${esc(h.a)}</b> <span class="mute" style="font-size:12px">${esc(h.by)} · ${esc(h.role)} · v${esc(h.v)} · ${esc(h.at)}</span>${h.r?`<div>${esc(h.r)}</div>`:''}</div>`).join('')||'<p class="mute" style="margin:0">No decisions yet. Earlier versions and comments are always kept.</p>')};
/* shared helpers */
const allI=()=>PLANS.flatMap(p=>p.items.map(i=>[i,p]));
const myBrands=()=>{if(S.role==='client')return[curClientBrand()];const m=S.role==='am'?D.brands.rows.filter(b=>b.accountManagerId===MEN.am).map(b=>b.name):[];return m.length?m:D.brands.rows.map(b=>b.name)};
const vis=([,p])=>myBrands().includes(p.brand);
const hdr=(t,s)=>`<div class="ph"><div><span class="eb">${esc(ROLES[S.role])}</span><h1>${t}</h1><p class="mute">${s}</p></div></div>`;
const crd=(t,x)=>`<div class="card" style="margin-bottom:16px"><h2 style="margin-bottom:10px">${t}</h2>${x}</div>`;
const sec=(t,l)=>crd(t+' <span class="mute">('+l.length+')</span>',l.length?`<div class="tw"><table><thead><tr><th scope="col">Item</th><th scope="col">Brand</th><th scope="col">Platform</th><th scope="col">Type</th><th scope="col">Stage</th><th scope="col">Date</th><th scope="col"></th></tr></thead><tbody>${l.map(([i,p])=>`<tr><td><a class="lk" onclick="openD({t:'item',id:${i.id}})">${esc(i.title)}</a> <span class="mute">v${esc(i.v)}</span></td><td>${esc(p.brand)}</td><td>${esc(i.platform||'—')}</td><td><span class="tag">${esc(i.type)}</span></td><td>${SP(i.stage)}</td><td><span class="mono">${esc(i.date||'—')}</span></td><td>${(TRN[i.stage]||[]).filter(t=>can2(i,t)&&t!=='PUBLISHED').map(t=>`<button class="btn sm ${t==='CHANGES_REQUESTED'?'dg':'p'}" onclick="mvAsk(${i.id},'${t}')">${BTN[t]}</button>`).join(' ')}${can2(i,'PUBLISHED')?`<button class="btn sm p" onclick="pubRec(${i.id})">Record publishing</button>`:''}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mute" style="margin:0">Nothing here.</p>');
const by=s=>{const q=(S.q||'').trim().toLowerCase();return allI().filter(vis).filter(([i])=>i.stage===s).filter(([i,p])=>!q||[i.title,i.type,i.platform,i.assignee,i.stage,STG[i.stage],p.brand,p.title].join(' ').toLowerCase().includes(q))};
/* review pages */
PAGES.review=()=>{const R=S.role;
 if(R==='client'){const cb=curClientBrand(),d=allI().filter(vis).flatMap(([i])=>i.hist.filter(h=>h.role==='Client').map(h=>[i,h]));
  return hdr('Content review','Content delivered to you for approval.')+crd('Content plan shared with you',PLANS.filter(p=>p.brand===cb).map(p=>bar(p.platform+' · '+p.title,p.items.filter(i=>['APPROVED','PUBLISHED'].includes(i.stage)).length,p.items.length)).join('')||'<p class="mute" style="margin:0">No plan shared yet.</p>')+sec('Awaiting your review',by('CLIENT_REVIEW'))+sec('Approved',by('APPROVED'))+sec('Published',by('PUBLISHED'))+crd('Your review history',d.map(([i,h])=>`<div style="padding:8px 0;border-top:1px solid var(--line)"><a class="lk" onclick="openD({t:'item',id:${i.id}})">${esc(i.title)}</a> · ${esc(h.a)} <span class="mute">${esc(h.at)}</span>${h.r?`<div class="mute">${esc(h.r)}</div>`:''}</div>`).join('')||'<p class="mute" style="margin:0">No decisions yet.</p>')}
 if(R==='cc'||R==='emp')return hdr('My review queue','Drafts to send and content returned with changes.')+sec('Returned with changes',by('CHANGES_REQUESTED'))+sec('Drafts ready to send',by('DRAFT'))+sec('In internal review',by('IN_REVIEW'));
 const pCrs=CHANGE_REQS.filter(cr=>cr.status==='PENDING'&&myBrands().includes(cr.brand));
 const crCard=pCrs.length?crd('Client change requests pending ('+pCrs.length+')',`<div class="tw"><table><thead><tr><th scope="col">Item</th><th scope="col">Brand</th><th scope="col">Client notes</th><th scope="col">Date</th><th scope="col"></th></tr></thead><tbody>${pCrs.map(cr=>`<tr><td><b>${esc(cr.itemTitle)}</b></td><td>${esc(cr.brand)}</td><td>${esc(cr.clientNotes)}</td><td><span class="mono">${esc(cr.createdAt)}</span></td><td><div class="ra"><button class="btn sm p" onclick="resolveChangeReq(${cr.id})">Resolve</button><button class="btn sm" onclick="forwardChangeReq(${cr.id})">Forward to team</button></div></td></tr>`).join('')}</tbody></table></div>`):'';
 return hdr('Internal review','Review content, approve it for the client or return it with comments.')+crCard+sec('Waiting for internal review',by('IN_REVIEW'))+sec('Waiting for the client',by('CLIENT_REVIEW'))+sec('Returned with changes',by('CHANGES_REQUESTED'))+sec('Approved — ready to publish',by('APPROVED'))+sec('Published',by('PUBLISHED'))};
/* calendar */
S.cm='2026-11';
function cmv(d){const[y,m]=S.cm.split('-').map(Number),x=new Date(y,m-1+d,1);S.cm=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0');view(false)}
PAGES.calendar=()=>{const q=(S.q||'').trim().toLowerCase(),[y,m]=S.cm.split('-').map(Number),dn=new Date(y,m,0).getDate(),off=(new Date(y,m-1,1).getDay()+6)%7,L=allI().filter(vis).filter(([i,p])=>!q||[i.title,i.platform,i.assignee,i.stage,STG[i.stage],p.brand,p.title].join(' ').toLowerCase().includes(q)),on=L.filter(([i])=>i.date&&i.date.startsWith(S.cm)),un=L.filter(([i])=>!i.date).length;let c='';
 ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(d=>c+=`<div class="mono mute" style="text-align:center">${d}</div>`);for(let k=0;k<off;k++)c+='<div></div>';
 for(let d=1;d<=dn;d++){const ds=S.cm+'-'+String(d).padStart(2,'0');c+=`<div style="min-height:92px;border:1px solid var(--line);border-radius:12px;padding:6px;background:${ds===TODAY?'var(--lilac)':'#fff'}"><div class="mono mute">${d}</div>${on.filter(([i])=>i.date===ds).map(([i])=>`<div class="tag" title="${esc(i.title)} · ${esc(i.platform||'')} · ${esc(i.assignee||'Unassigned')} · ${esc(STG[i.stage]||i.stage)}" style="display:block;cursor:pointer;margin:3px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="openD({t:'item',id:${i.id}})">${esc(i.title)}<br><small>${esc(i.platform||'—')} · ${esc(i.assignee||'Unassigned')} · ${esc(STG[i.stage]||i.stage)}</small></div>`).join('')}</div>`}
 return hdr('Calendar',S.role==='am'?'Content by publish date for your brands.':'Content by publish date.')+`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><button class="btn sm" onclick="cmv(-1)">← Prev</button><h2>${new Date(y,m-1,1).toLocaleString('en',{month:'long',year:'numeric'})}</h2><button class="btn sm" onclick="cmv(1)">Next →</button></div><div style="overflow-x:auto"><div style="display:grid;grid-template-columns:repeat(7,minmax(110px,1fr));gap:6px;min-width:790px">${c}</div></div><p class="mute" style="margin:12px 0 0">${un} item${un===1?'':'s'} without a publish date are kept off the calendar.</p></div>`};
/* client requests */
const REQ_KIND_TO_API={'Extra content':'EXTRA_CONTENT','Plan change':'PLAN_CHANGE','New idea':'NEW_IDEA'};
const REQ_API_TO_KIND={EXTRA_CONTENT:'Extra content',PLAN_CHANGE:'Plan change',NEW_IDEA:'New idea'};
let REQ=[{id:1,brand:CLB,kind:'Extra content',text:'Two extra stories for the winter launch week.',st:'SUBMITTED',team:'',assignee:'',reason:'',at:'2026-11-18'}];
const RQP=s=>`<span class="pill ${{ASSIGNED:'wn',ACCEPTED:'ok',REJECTED:'er',SUBMITTED:'in'}[s]}">${esc(lab(s))}</span>`;
function reqNew(){ask('New request',[['kind','Request type','select',['Extra content','Plan change','New idea']],['text','Describe what you need','textarea']],async v=>{if(!(v.text||'').trim())return toast('Please describe the request');const cb=curClientBrand();const item={id:++IDN,brand:cb,kind:v.kind,text:v.text.trim(),st:'SUBMITTED',team:'',assignee:'',reason:'',at:TODAY};if(typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){try{const res=await apiCall('/client-requests',{method:'POST',body:{type:REQ_KIND_TO_API[v.kind]||'EXTRA_CONTENT',description:v.text.trim()}});if(res?.id){item._id=res.id;item.id=res.id}}catch(err){return toast(err?.message||'Could not submit request')}}REQ.unshift(item);note('New client request: '+v.kind,cb,true,['am','admin']);toast('Request submitted');view(false)})}
function reqOk(id){
 const r=REQ.find(x=>x.id===id||x._id===id);if(!r)return;
 const bObj=D.brands.rows.find(b=>b.name===r.brand);
 const defTeam=(bObj&&bObj.teamId&&T.includes(bObj.teamId))?bObj.teamId:(T[0]||'');
 const teamEmps=D.users.rows.filter(u=>u.roleId!=='Client'&&u.roleId!=='Admin'&&u.isActive!==false&&(u.teamId===defTeam||!defTeam)).map(u=>u.fullName);
 const allEmps=[...new Set([...teamEmps,...EMP])];
 const defDate=new Date(Date.now()+7*864e5).toISOString().slice(0,10);
 modal(`<div class="dlg"><h2>Accept &amp; assign client request</h2><p class="mute" style="margin:0 0 14px">${esc(r.brand)} · ${esc(r.kind)}</p>
  <div class="pg">
   <div class="fl"><label>Responsible team</label><select id="rq-team">${T.map(t=>`<option value="${esc(t)}" ${t===defTeam?'selected':''}>${esc(t)}</option>`).join('')}</select></div>
   <div class="fl"><label>Assign to employee *</label><select id="rq-emp">${allEmps.map(u=>`<option value="${esc(u)}">${esc(u)}</option>`).join('')}</select></div>
   <div class="fl"><label>Priority</label><select id="rq-pr">${['LOW','MEDIUM','HIGH','URGENT'].map(p=>`<option value="${p}" ${p==='MEDIUM'?'selected':''}>${p}</option>`).join('')}</select></div>
   <div class="fl"><label>Planned deadline *</label><input id="rq-dl" type="date" value="${defDate}"></div>
  </div>
  <div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="confirmReqOk(${r.id})">Accept &amp; assign</button></div>
 </div>`);
}
async function confirmReqOk(id){
 const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;
 const r=REQ.find(x=>x.id===id||x._id===id);if(!r)return;
 const team=$('#rq-team')?.value||T[0]||'';
 const emp=$('#rq-emp')?.value||EMP[0]||'';
 const priority=$('#rq-pr')?.value||'MEDIUM';
 const planned=$('#rq-dl')?.value||'';
 if(!planned)return toast('Planned deadline is required');
 dlg._submitted=true;
 if(r._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  const assignedTo=API_CACHE.usersByName[emp];
  if(!assignedTo){dlg._submitted=false;return toast('Select a valid employee to assign')}
  try{
   const res=await apiCall('/client-requests/'+r._id+'/accept',{method:'PATCH',body:{assignedTo,plannedDeadline:new Date(planned).toISOString(),priority}});
   if(res?.task){
    const tk=res.task;
    const item=mk(tk.id,tk.title,'DIRECT',(tk.status||'TODO').toUpperCase(),(tk.priority||priority).toUpperCase(),emp,MEN[S.role],r.brand,[],planned,planned,tk.description||r.text);
    item._id=tk.id;
    TK.unshift(item);
   }
  }catch(err){dlg._submitted=false;return toast(err?.message||'Could not accept request')}
 }else{
  TK.unshift(mk(++IDN,'Client Request: '+r.kind,'DIRECT','TODO',priority,emp,MEN[S.role],r.brand,[],planned,planned,r.text));
 }
 r.st='ASSIGNED';r.team=team;r.assignee=emp;
 closeM();
 note('Your request was accepted and assigned to '+team+(emp?' ('+emp+')':''),r.brand,false,['client','am','admin']);
 toast('Request accepted · assigned to '+team);
 view(false);
}
function reqNo(id){ask('Reject request',[['r','Reason *','textarea']],async v=>{if(!(v.r||'').trim())return toast('A reason is required');const r=REQ.find(x=>x.id===id||x._id===id);if(!r)return;if(r._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){try{await apiCall('/client-requests/'+r._id+'/reject',{method:'PATCH',body:{reason:v.r.trim()}})}catch(err){return toast(err?.message||'Could not reject request')}}r.st='REJECTED';r.reason=v.r.trim();note('Your request could not be executed: '+r.reason,r.brand,false,['client','am','admin']);toast('Request rejected');view(false)})}
function reqTask(id){const r=REQ.find(x=>x.id===id);TASKS.unshift({title:r.kind+': '+r.text.slice(0,50),brand:r.brand,priority:'MEDIUM',assignee:MEN[S.role],deadline:'2026-11-30',status:'TODO',by:MEN.am});r.st='ACCEPTED';toast('Task created from the request');view(false)}
PAGES.requests=()=>{const R=S.role,q=(S.q||'').trim().toLowerCase(),mq=r=>!q||[r.text,r.brand,r.kind,r.st,r.team,r.assignee,r.reason,r.at].join(' ').toLowerCase().includes(q),u=D.users.rows.find(x=>x.fullName===MEN[R])||{},mt=[u.teamId,...T.filter(t=>TX[t]&&TX[t].lead===MEN[R])],
 tb=(l,ac)=>l.length?`<div class="tw"><table><thead><tr><th scope="col">Request</th><th scope="col">Brand</th><th scope="col">Type</th><th scope="col">Status</th><th scope="col">Team / assignee / reason</th><th scope="col"></th></tr></thead><tbody>${l.map(r=>`<tr><td>${esc(r.text)}<div class="mute" style="font-size:12px">${esc(r.at)}</div></td><td>${esc(r.brand)}</td><td><span class="tag">${esc(r.kind)}</span></td><td>${RQP(r.st)}</td><td>${esc(r.reason||(r.team&&r.assignee?r.team+' · '+r.assignee:r.team||r.assignee))||'—'}</td><td>${ac(r)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mute" style="margin:0">'+(q?'No matching requests.':'Nothing here.')+'</p>';
 if(R==='client')return hdr('Requests','Ask for extra content, a plan change or a new idea, and track where it stands.')+`<button class="btn p" style="margin-bottom:16px" onclick="reqNew()">+ New request</button>`+crd('My requests',tb(REQ.filter(r=>r.brand===curClientBrand()&&mq(r)),()=>''));
 if(R==='am'||R==='admin')return hdr('Client requests','Decide whether each request is feasible and assign accepted requests to the right team.')+crd('To review',tb(REQ.filter(r=>r.st==='SUBMITTED'&&mq(r)),r=>!(R==='am'||R==='admin')?'':`<div class="ra"><button class="btn sm p" onclick="reqOk(${r.id})">Accept &amp; assign</button><button class="btn sm dg" onclick="reqNo(${r.id})">Reject</button></div>`))+crd('Decided',tb(REQ.filter(r=>r.st!=='SUBMITTED'&&mq(r)),()=>''));
 return hdr('Requests','Work requested from you, and client requests assigned to your team.')+crd('Client requests assigned to my team',tb(REQ.filter(r=>(mt.includes(r.team)||r.assignee===MEN[R])&&mq(r)),r=>r.st==='ASSIGNED'?`<div class="ra"><button class="btn sm p" onclick="reqTask(${r.id})">Turn into task</button><button class="btn sm" onclick="reqItem(${r.id})">Turn into content item</button></div>`:''))};
/* reports */
let MR=[{id:1,brand:CLB,month:'2026-09',m:{Reach:42000,Impressions:98000,Engagement:3100,Conversions:210},ai:'A steady month with no major campaigns.',ok:true,sh:true},{id:2,brand:CLB,month:'2026-10',m:{Reach:51500,Impressions:120400,Engagement:4020,Conversions:265},ai:'Reach and engagement grew after the serum reel campaign.',ok:true,sh:true}];
const MET=['Reach','Impressions','Engagement','Conversions'],pmo=s=>{const[y,m]=s.split('-').map(Number),d=new Date(y,m-2,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
const bar=(n,v,t)=>`<div style="display:flex;align-items:center;gap:10px;margin:6px 0"><span style="width:170px;font-size:13px">${esc(n)}</span><div style="flex:1;height:10px;background:var(--line);border-radius:6px;overflow:hidden"><div style="height:100%;width:${t?Math.round(v/t*100):0}%;background:#7c6cf0"></div></div><b style="width:34px;text-align:right">${v}</b></div>`;
function repUp(f){if(!f)return;const r=new FileReader();r.onload=()=>{const rw=String(r.result).split(/\r?\n/).filter(Boolean).map(l=>l.split(',').map(x=>x.trim())),m={};if(rw.length>=2&&rw[0].length>2)rw[0].forEach((h,k)=>m[h]=rw[1][k]);else rw.forEach(a=>{if(a.length>=2)m[a[0]]=a[1]});repRev(m)};r.readAsText(f)}
function repRev(m){const g=k=>{const x=Object.keys(m).find(y=>y.toLowerCase()===k.toLowerCase());return x===undefined?'':m[x]},ex=Object.keys(m).filter(x=>!MET.some(k=>k.toLowerCase()===x.toLowerCase()));
 modal(`<div class="dlg"><h2>Review the numbers we read</h2><p class="mute" style="margin:0 0 14px">Check every value before saving.</p><div class="pg"><div class="fl"><label>Brand</label><select data-r="brand">${myBrands().map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join('')}</select></div><div class="fl"><label>Month</label><input data-r="month" type="month" value="2026-11"></div>${MET.map(k=>`<div class="fl ${g(k)===''?'bad':''}"><label>${k}</label><input data-r="${k}" type="number" value="${esc(g(k))}">${g(k)===''?'<small>Missing in the file</small>':''}</div>`).join('')}</div>${ex.length?`<p class="mute">Not matched and ignored: ${ex.map(esc).join(', ')}</p>`:''}<div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="repSave()">Save report</button></div></div>`)}
function repSave(){const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;const v=Object.fromEntries([...dlg.querySelectorAll('[data-r]')].map(x=>[x.dataset.r,x.value]));if(!v.month||MET.some(k=>v[k]===''))return toast('Fill in the month and every metric first');
 dlg._submitted=true;window._rp=()=>{MR=MR.filter(r=>!(r.brand===v.brand&&r.month===v.month));MR.push({id:++IDN,brand:v.brand,month:v.month,m:Object.fromEntries(MET.map(k=>[k,+v[k]])),ai:'',ok:false,sh:false});closeM();toast('Report saved');view(false)};
 MR.some(r=>r.brand===v.brand&&r.month===v.month)?modal(`<div class="dlg"><h2>Replace the ${esc(v.month)} report?</h2><p class="mute">A report for this brand and month already exists. Replacing it overwrites its numbers and analysis.</p><div class="ft"><button class="btn" onclick="dlg_cancel_rp()">Cancel</button><button class="btn p" onclick="window._rp()">Replace</button></div></div>`):window._rp()}
window.dlg_cancel_rp=()=>{const ovs=document.querySelectorAll('.ov');if(ovs.length){const top=ovs[ovs.length-1];top.remove();const prev=$('.ov .dlg');if(prev)prev._submitted=false}};
const dlt=(r,k)=>{const p=MR.find(x=>x.brand===r.brand&&x.month===pmo(r.month));return p&&p.m[k]?Math.round((r.m[k]-p.m[k])/p.m[k]*100):null};
function repAi(id){const r=MR.find(x=>x.id===id);r.ai=MET.map(k=>{const d=dlt(r,k);return k+(d===null?': '+r.m[k]+' (no previous month to compare).':(d>=0?' rose ':' fell ')+Math.abs(d)+'% to '+r.m[k]+'.')}).join(' ');r.ok=false;view(false)}
const repTxt=(id,t)=>{const r=MR.find(x=>x.id===id);r.ai=t;r.ok=false};
const repOk=id=>{const r=MR.find(x=>x.id===id);if(!r.ai.trim())return toast('Add an analysis first');r.ok=!r.ok;if(!r.ok)r.sh=false;view(false)};
const repSh=id=>{const r=MR.find(x=>x.id===id);if(!r.ok)return toast('Approve the report before sharing');r.sh=!r.sh;view(false)};
const repCard=(r,w)=>crd(esc(r.brand)+' · '+esc(r.month)+' '+(r.ok?'<span class="pill ok">Approved</span>':'<span class="pill lc">Draft</span>')+(r.sh?' <span class="pill in">Shared</span>':''),`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px">${MET.map(k=>{const d=dlt(r,k);return `<div style="border:1px solid var(--line);border-radius:14px;padding:12px"><div class="mono mute">${k}</div><b style="font-size:20px">${Number(r.m[k]||0).toLocaleString()}</b><div class="mute" style="font-size:12px">${d===null?'No previous month':(d>=0?'▲ ':'▼ ')+Math.abs(d)+'% vs '+esc(pmo(r.month))}</div></div>`}).join('')}</div>${w?`<textarea style="width:100%;margin-top:12px;min-height:70px" oninput="repTxt(${r.id},this.value)" placeholder="AI analysis">${esc(r.ai)}</textarea><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn sm" onclick="repAi(${r.id})">Run AI analysis</button><button class="btn sm p" onclick="repOk(${r.id})">${r.ok?'Unapprove':'Approve'}</button><button class="btn sm" onclick="repSh(${r.id})">${r.sh?'Stop sharing':'Share with client'}</button></div>`:`<p style="margin:12px 0 0">${esc(r.ai)}</p>`}`);
PAGES.reports=()=>{const R=S.role,q=(S.q||'').trim().toLowerCase(),mgr=R==='am'||R==='admin',L=allI().filter(vis),tk=TK.filter(t=>mgr||t.assignee===MEN[R]),dn=t=>DONE4.includes(t.status),od=isOd;
 const apiProg=API_CACHE.progress;
 const apiTeamPerf=API_CACHE.teamPerformance;
 const perf=(n)=>{
  const srv=apiTeamPerf&&Array.isArray(apiTeamPerf.members)?apiTeamPerf.members.find(m=>m.user?.fullName===n):null;
  const x=TK.filter(t=>t.assignee===n),d=srv?srv.completedTasks:x.filter(dn).length,o=srv?srv.overdueTasks:x.filter(od).length,op=srv?(srv.totalAssignedTasks-srv.completedTasks):(x.length-d),ot=srv&&srv.completedTasks>0?(srv.onTimeRate+'%'):(d+o?Math.round(d/(d+o)*100)+'%':'—');
  const ui=D.users.rows.findIndex(u=>u.fullName===n),u=D.users.rows[ui]||{};
  return `<tr><td>${ui>=0?`<a class="lk" onclick="openD({t:'row',k:'users',i:${ui}})">${esc(n)}</a>`:esc(n)}</td><td>${esc(u.roleId||srv?.user?.role||'—')}</td><td>${esc(u.teamId||'—')}</td><td>${op}</td><td>${d}</td><td>${o}</td><td>${ot}</td></tr>`;
 };
 const teamMem=()=>{const ts=new Set(D.brands.rows.filter(b=>myBrands().includes(b.name)).map(b=>b.teamId));return D.users.rows.filter(u=>u.roleId!=='Client'&&(R==='admin'||ts.has(u.teamId)||TK.some(t=>t.assignee===u.fullName&&myBrands().includes(t.brand)))).filter(u=>!q||[u.fullName,u.email,u.roleId,u.teamId].join(' ').toLowerCase().includes(q)).map(u=>u.fullName).sort((p,q2)=>String((D.users.rows.find(u=>u.fullName===p)||{}).roleId).localeCompare(String((D.users.rows.find(u=>u.fullName===q2)||{}).roleId)))};
 const perfT=crd(mgr?'Team performance & employee workload':'My performance',`<div class="tw"><table><thead><tr><th scope="col">Member</th><th scope="col">Role</th><th scope="col">Team</th><th scope="col">Open</th><th scope="col">Done</th><th scope="col">Overdue</th><th scope="col">On-time delivery</th></tr></thead><tbody>${(mgr?teamMem():[MEN[R]]).map(perf).join('')||'<tr><td colspan="7" class="mute">No matching members.</td></tr>'}</tbody></table></div>`);
 const prog=crd('Client plan execution progress',PLANS.filter(p=>myBrands().includes(p.brand)&&(!q||(p.brand+' '+p.title).toLowerCase().includes(q))).map(p=>{const doneCount=p.items.filter(i=>['APPROVED','PUBLISHED'].includes(i.stage)).length,pct=p.items.length?Math.round(doneCount/p.items.length*100):0;return bar(`${p.brand} · ${p.title} (${pct}%)`,doneCount,p.items.length)}).join('')||'<p class="mute" style="margin:0">No matching plans.</p>');
 if(R==='emp')return hdr('My performance','Your own tasks and on-time delivery.')+perfT;
 if(R==='cc')return hdr('Reports','Your content and tasks.')+prog+perfT;
 const rep=MR.filter(r=>(mgr?myBrands().includes(r.brand):r.brand===curClientBrand()&&r.ok&&r.sh)&&(!q||(r.brand+' '+r.month+' '+(r.ai||'')).toLowerCase().includes(q))).sort((a,b)=>b.month.localeCompare(a.month));
 if(R==='client')return hdr('Reports','Plan progress, published content and monthly performance.')+prog+sec('Approved and published content',L.filter(([i])=>['APPROVED','PUBLISHED'].includes(i.stage)))+rep.map(r=>repCard(r,false)).join('');
 const totalTasks=apiProg?apiProg.totalTasks:tk.length;
 const completedCount=apiProg?apiProg.completedTasks:tk.filter(dn).length;
 const inProgCount=apiProg?(apiProg.inProgressTasks+apiProg.todoTasks+apiProg.submittedTasks+apiProg.inReviewTasks+apiProg.needsChangesTasks):tk.filter(t=>!dn(t)).length;
 const overdueCount=apiProg?apiProg.overdueTasks:tk.filter(od).length;
 const compRate=apiProg?apiProg.completionRate:(totalTasks?Math.round(completedCount/totalTasks*100):0);
 const awaitReviewCount=L.filter(([i])=>i.stage==='IN_REVIEW'||i.stage==='CLIENT_REVIEW').length;
 const summaryCards=`<div class="stats" style="margin-bottom:16px"><div class="stat"><span class="mono mute">Completed tasks</span><b>${completedCount}</b></div><div class="stat"><span class="mono mute">In progress / open</span><b>${inProgCount}</b></div><div class="stat ${overdueCount?'al':''}"><span class="mono mute">Overdue tasks</span><b>${overdueCount}</b></div><div class="stat"><span class="mono mute">Awaiting review</span><b>${awaitReviewCount}</b></div><div class="stat"><span class="mono mute">Completion rate</span><b>${compRate}%</b></div></div>`;
 const st={};if(apiProg){[['TODO',apiProg.todoTasks],['IN_PROGRESS',apiProg.inProgressTasks],['SUBMITTED',apiProg.submittedTasks],['IN_REVIEW',apiProg.inReviewTasks],['NEEDS_CHANGES',apiProg.needsChangesTasks],['COMPLETED',apiProg.completedTasks],['CANCELLED',apiProg.cancelledTasks]].forEach(([k,v])=>{if(v>0)st[k]=v})}else{tk.forEach(t=>st[t.status]=(st[t.status]||0)+1)}
 const odList=tk.filter(od);
 const odCard=crd('Overdue tasks ('+overdueCount+')',odList.length?`<div class="tw"><table><thead><tr><th scope="col">Task</th><th scope="col">Brand</th><th scope="col">Assignee</th><th scope="col">Deadline</th><th scope="col">Status</th></tr></thead><tbody>${odList.map(t=>`<tr><td><a class="lk" onclick="tdet(${t.id})">${esc(t.title)}</a></td><td>${esc(t.brand)}</td><td>${esc(t.assignee)}</td><td>${dl(t)}</td><td>${pill(t.status)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="mute" style="margin:0">No overdue tasks right now.</p>');
 const wl={};tk.filter(t=>!dn(t)).forEach(t=>wl[t.assignee]=(wl[t.assignee]||0)+1);const ac={};L.forEach(([i])=>i.hist.forEach(h=>ac[h.a]=(ac[h.a]||0)+1));
 return hdr('Reports & progress tracking','Client plan progress, completed vs. active tasks, overdue alerts, team workload and content awaiting review.')+summaryCards+prog+crd('Tasks by status · '+completedCount+' completed · '+overdueCount+' overdue',Object.entries(st).map(([k,v])=>bar(lab(k),v,totalTasks)).join('')||'<p class="mute" style="margin:0">No tasks.</p>')+odCard+crd('Content awaiting review & workflow stages',Object.keys(STG).map(s=>bar(STG[s],L.filter(([i])=>i.stage===s).length,L.length)).join(''))+crd('Workload by employee (open tasks)',Object.entries(wl).map(([k,v])=>bar(k,v,tk.length)).join('')||'<p class="mute" style="margin:0">No open tasks.</p>')+crd('Workload by team',(()=>{const w={};tk.filter(t=>!dn(t)).forEach(t=>{const u=D.users.rows.find(x=>x.fullName===t.assignee),k=(u&&u.teamId)||'No team';w[k]=(w[k]||0)+1});return Object.entries(w).map(([k,v])=>bar(k,v,tk.length)).join('')||'<p class="mute" style="margin:0">No open tasks.</p>'})())+crd('Approval activity',Object.entries(ac).map(([k,v])=>bar(k,v,L.length||1)).join('')||'<p class="mute" style="margin:0">No decisions yet.</p>')+perfT
 +`<h2 style="margin:24px 0 12px">Monthly performance reports</h2>${R==='am'?`<div class="card" style="margin-bottom:16px"><b>Upload the monthly Meta performance file</b><p class="mute" style="margin:4px 0 10px">CSV with Reach, Impressions, Engagement and Conversions. You review the numbers before anything is saved.</p><input type="file" accept=".csv,.txt" onchange="repUp(this.files[0])"></div>`:''}`+rep.map(r=>repCard(r,R==='am')).join('')};
Object.assign(N,{workflow:['Workflow','check'],review:['Review','check'],calendar:['Calendar','cal'],requests:['Requests','clip'],reports:['Reports','bolt']});
{const add=(r,l)=>{const a=NAV[r];a.splice(a.indexOf('account'),0,...l)};add('admin',['workflow','calendar','requests','reports']);add('am',['review','calendar','requests','reports']);add('cc',['review','requests','reports']);add('emp',['requests','reports']);add('client',['review','requests','reports'])}
const _v3=view;view=function(sk=true){enforceRoleRoute();ens();return _v3(sk)};

/* ===== v10: gaps found on re-check ===== */
function snapV(i){(i.vers=i.vers||[]).push({v:i.v,at:now(),s:Object.fromEntries(Object.entries(i).filter(([k])=>!['hist','comments','vers','pub','stage','v'].includes(k)))})}
function ow(i){const o={DRAFT:i.assignee||'Content Creator',CHANGES_REQUESTED:i.assignee||'Content Creator',IN_REVIEW:'Account Manager',CLIENT_REVIEW:'Client',APPROVED:'Account Manager (to publish)',PUBLISHED:'—'}[i.stage],h=i.hist[i.hist.length-1],since=h?esc(h.at):'Not started',days=h?Math.floor((Date.now()-new Date(h.at.replace(' ','T')))/864e5):0,dly=i.stage!=='PUBLISHED'&&((i.date&&i.date<TODAY)||days>=3);
 return `<dl class="kv" style="margin:14px 0 0">${kvh([['Current owner',esc(o)],['Since',since],['Delay',dly?'<span class="pill er">Delayed</span>':'<span class="pill ok">On track</span>']])}</dl>`}
function reqItem(id){const r=REQ.find(x=>x.id===id),p=PLANS.find(x=>x.brand===r.brand);if(!p)return toast('No content plan exists for this brand yet');p.items.push({id:++IDN,title:r.kind+': '+r.text.slice(0,50),type:'POST',campaign:'',platform:p.platform,notes:r.text,assignee:'',priority:'MEDIUM',status:'TODO',stage:'DRAFT',v:1,comments:[],hist:[]});r.st='ACCEPTED';toast('Content item created in “'+p.title+'”');view(false)}
/* reminders for approaching / missed due dates */
function remind(){TK.forEach(t=>{if(t._rem||DONE4.includes(t.status)||!t.eff)return;const d=String(t.eff),diff=Math.round((new Date(d)-new Date(TODAY))/864e5);if(diff<0){t._rem=1;note('Task “'+t.title+'” is overdue',t.brand,true,[rl(t.assignee),'am','admin'].filter(Boolean))}else if(diff<=2){t._rem=1;note('Task “'+t.title+'” is due soon ('+d+')',t.brand,true,[rl(t.assignee),'am','admin'].filter(Boolean))}})}
{const _e=ens;ens=function(){_e();try{remind()}catch{/* ignore */}}}
/* dashboards: final overview per role */
function kp(){const R=S.role,cb=curClientBrand(),L=allI().filter(vis).filter(([i])=>R!=='emp'||i.assignee===MEN[R]),n=s=>L.filter(([i])=>i.stage===s).length,all=R==='admin'||R==='am',tk=TK.filter(t=>all||t.assignee===MEN[R]||(R==='client'&&t.brand===cb)),dn=t=>DONE4.includes(t.status),
 od=tk.filter(isOd),up=tk.filter(t=>!dn(t)&&t.eff&&t.eff>=TODAY).sort((p,q)=>String(p.eff).localeCompare(String(q.eff))),
 apiProg=all?API_CACHE.progress:null,
 odCnt=apiProg?apiProg.overdueTasks:od.length,
 pr=PLANS.filter(p=>myBrands().includes(p.brand)),g=pr.reduce((s,p)=>s+p.items.filter(i=>['APPROVED','PUBLISHED'].includes(i.stage)).length,0),tot=pr.reduce((s,p)=>s+p.items.length,0),pc=tot?Math.round(g/tot*100)+'%':'—',rq=REQ.filter(r=>r.st==='SUBMITTED').length,cd=apiProg?apiProg.completedTasks:tk.filter(dn).length,
 t=R==='admin'?[['Content awaiting review',n('IN_REVIEW')+n('CLIENT_REVIEW')],['Approved / published',n('APPROVED')+n('PUBLISHED')],['Overdue tasks',odCnt],['Open client requests',rq],['Plan completion',pc]]
 :R==='am'?[['Waiting for my review',n('IN_REVIEW')],['Waiting for the client',n('CLIENT_REVIEW')],['Returned with changes',n('CHANGES_REQUESTED')],['Requests to review',rq],['Overdue tasks',odCnt]]
 :R==='client'?[['Plan progress',pc],['Awaiting my approval',n('CLIENT_REVIEW')],['Approved',n('APPROVED')],['Published',n('PUBLISHED')],['My open requests',REQ.filter(r=>r.brand===cb&&['SUBMITTED','ASSIGNED'].includes(r.st)).length]]
 :[['Overdue',od.length],['Upcoming',up.length],['Returned with changes',n('CHANGES_REQUESTED')],['Completed',cd],['On-time delivery',cd+od.length?Math.round(cd/(cd+od.length)*100)+'%':'—']];
 return `<div style="margin-top:24px"><h2 style="margin-bottom:12px">Content & delivery overview</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px">${t.map(x=>`<div style="border:1px solid var(--line);border-radius:16px;padding:14px;background:#fff"><div class="mono mute">${x[0]}</div><b style="font-size:26px">${x[1]}</b></div>`).join('')}</div>${R==='client'?'':crd('Upcoming deadlines',up.slice(0,5).map(x=>`<div style="padding:6px 0;border-top:1px solid var(--line)">${esc(x.title)} <span class="mute">· ${esc(x.assignee)} · ${dl(x)}</span></div>`).join('')||'<p class="mute" style="margin:0">Nothing due soon.</p>')}</div>`}
{const _pd2=PAGES.dashboard;PAGES.dashboard=()=>_pd2()+kp()}
/* error state */
{const _v4=view;view=function(sk=true){enforceRoleRoute();try{return _v4(sk)}catch{const v=$('#view');if(v)v.innerHTML='<div class="card empty"><h2>Something went wrong</h2><p class="mute">This page could not be loaded.</p><button class="btn p" onclick="view(false)">Try again</button></div>'}}}

/* ===== v10b: work requested from team members (strategy, content plan…) ===== */
let WRK=[{id:1,brand:'Nord Coffee',kind:'Strategy',note:'Draft the content strategy for the seasonal menu launch.',to:MEN.cc,by:'Omar Haddad',deadline:'2026-11-27',st:'REQUESTED'},{id:2,brand:'Lumen Skincare',kind:'Content plan',note:'Build the December content plan for TikTok.',to:MEN.cc,by:'Omar Haddad',deadline:'2026-11-30',st:'REQUESTED'}];
const WSP=s=>`<span class="pill ${{REQUESTED:'wn',STARTED:'in',DONE:'ok'}[s]}">${esc(lab(s))}</span>`;
const wst=w=>w.st==='STARTED'&&w.task&&DONE4.includes((TK.find(t=>t.id===w.task)||{}).status)?'DONE':w.st;
function startWork(id){const w=WRK.find(x=>x.id===id);if(!w||w.st!=='REQUESTED')return;const tid=Math.max(0,...TK.map(t=>t.id))+1;TK.unshift(mk(tid,w.kind+': '+w.brand,'CREATION','IN_PROGRESS','HIGH',w.to,w.by,w.brand,[],w.deadline,w.deadline,w.note));w.st='STARTED';w.task=tid;note(w.to+' started the '+w.kind.toLowerCase(),w.brand,true,['am','admin']);toast('Moved to My Work');view(false)}
function wrkOpen(id){const w=WRK.find(x=>x.id===id);S.det=null;S.page='brands';S.brand=w.brand;S.sub=w.kind==='Strategy'?'strategy':'platforms';S.q='';render(false)}
function wrkNew(){ask('Request work from a team member',[['brand','Brand','select',D.brands.rows.map(b=>b.name)],['kind','What is needed','select',['Strategy','Content plan','Other']],['to','Assign to','select',D.users.rows.filter(u=>u.roleId!=='Client').map(u=>u.fullName)],['deadline','Deadline','date'],['note','Details','textarea']],v=>{WRK.unshift({id:++IDN,brand:v.brand,kind:v.kind,note:(v.note||'').trim(),to:v.to,by:MEN[S.role],deadline:v.deadline||'',st:'REQUESTED'});note('New work request: '+v.kind+' for '+v.brand,v.brand,true,[rl(v.to),'admin'].filter(Boolean));view(false)})}
function wTable(l,mine){return l.length?`<div class="tw"><table><thead><tr><th scope="col">Brand</th><th scope="col">Request</th><th scope="col">Details</th><th scope="col">${mine?'From':'To'}</th><th scope="col">Deadline</th><th scope="col">Status</th><th scope="col"></th></tr></thead><tbody>${l.map(w=>{const s=wst(w);return `<tr><td>${esc(w.brand)}</td><td><span class="tag">${esc(w.kind)}</span></td><td>${esc(w.note)||'—'}</td><td>${esc(mine?w.by:w.to)}</td><td><span class="mono">${esc(w.deadline||'—')}</span></td><td>${WSP(s)}</td><td>${mine?`<div class="ra">${s==='REQUESTED'?`<button class="btn sm p" onclick="startWork(${w.id})">Start work</button>`:s==='STARTED'?`<button class="btn sm p" onclick="S.tw='mine';go('tasks')">Open in My Work</button>`:''}${S.role==='cc'?`<button class="btn sm" onclick="wrkOpen(${w.id})">Open ${w.kind==='Strategy'?'strategy':'platforms'}</button>`:''}</div>`:''}</td></tr>`}).join('')}</tbody></table></div>`:'<p class="mute" style="margin:0">Nothing requested yet.</p>'}
{const _rq=PAGES.requests;PAGES.requests=()=>{const h=_rq(),m='</p></div></div>',n=h.indexOf(m)+m.length,R=S.role,q=(S.q||'').trim().toLowerCase(),mw=w=>!q||[w.brand,w.kind,w.note,w.to,w.by,w.deadline,wst(w)].join(' ').toLowerCase().includes(q);if(n<m.length||R==='client')return h;
 return h.slice(0,n)+(R==='cc'||R==='emp'?crd('Requested from me',wTable(WRK.filter(w=>w.to===MEN[R]&&mw(w)),true)):crd('Work requested from the team',(R==='am'?`<button class="btn sm p" style="margin-bottom:10px" onclick="wrkNew()">+ Request work</button>`:'')+wTable(WRK.filter(mw),false)))+h.slice(n)}}
/* ===== v10c: "Add your work" page — links and files for tasks and content items ===== */
const kb=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
const attList=l=>(l||[]).map(x=>{const su=safeUrl(x.url);return `<div style="padding:8px 0;border-top:1px solid var(--line);overflow:hidden;text-overflow:ellipsis">${x.kind==='link'?`🔗 <a class="lk" href="${esc(su||'#')}" target="_blank" rel="noopener noreferrer">${esc(x.name)}</a>`:`📄 <a class="lk" href="${esc(su||'#')}" download="${esc(x.name)}" rel="noopener noreferrer">${esc(x.name)}</a> <span class="mute">${kb(x.size||0)}</span>`}${x.by?`<div class="mute" style="font-size:12px">${esc(x.by)} · ${esc(x.at)}</div>`:''}</div>`}).join('');
function openSub(kind,id){S.sd={a:[],note:''};openD({t:'sub',kind,id})}
function subBack(){const d=S.det;S.sd=null;S.det={t:d.kind,id:d.id};view(false)}
function subLink(){const el=$('#sl'),u=((el&&el.value)||'').trim(),er=$('#sle'),su=safeUrl(u);if(!su||!/^https?:\/\/\S+\.\S+/i.test(su)){if(er)er.textContent='Paste a full link starting with http:// or https://';return}S.sd.a.push({kind:'link',name:su,url:su});view(false)}
function subFiles(fs){const L=[...fs];Promise.all(L.map(f=>new Promise(r=>{if(f.size>800*1024){toast(f.name+' is over 800 KB — paste a link to it instead');return r()}const x=new FileReader();x.onload=()=>{S.sd.a.push({kind:'file',name:f.name,url:x.result,size:f.size,type:f.type});r()};x.readAsDataURL(f)}))).then(()=>view(false))}
const subRm=i=>{S.sd.a.splice(i,1);view(false)};
function subHtml(d){const k=d.kind,f=k==='item'?fItem(d.id):null,o=k==='task'?TK.find(x=>x.id===d.id):f&&f[0];if(!o)return null;const A=S.sd||(S.sd={a:[],note:''}),ctx=k==='task'?esc(ctxL(o)):esc(f[1].brand)+' · '+esc(o.platform||'—')+' · '+esc(f[1].title),
 bx=(h,x)=>`<div class="card" style="margin-top:16px"><h2 style="margin-bottom:10px">${h}</h2>${x}</div>`,inp='style="flex:1;border:1px solid var(--line);border-radius:12px;padding:12px;font:inherit"';
 return `${bk('subBack()',k==='task'?'Submit your work':'Add files & links',String(o.title||'').slice(0,40),[...whr().trail,String(o.title||'').slice(0,40)])}<div class="ph"><div><span class="eb">${esc(ROLES[S.role])}</span><h1>${k==='task'?'Submit your work':'Add files & links'}</h1><p class="mute">${esc(o.title)} · ${ctx}</p></div></div>`
 +bx('1 · Paste a link',`<div style="display:flex;gap:8px"><input id="sl" ${inp} placeholder="https://drive.google.com/…"><button class="btn p" onclick="subLink()">Add link</button></div><small id="sle" style="color:var(--et);display:block;min-height:16px"></small>`)
 +bx('2 · Upload files',`<input type="file" multiple onchange="subFiles(this.files)"><p class="mute" style="margin:8px 0 0;font-size:12px">Any file type. Up to 800 KB each in this demo — for bigger files paste a link.</p>`)
 +bx('Added ('+A.a.length+')',A.a.length?A.a.map((x,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)"><span style="overflow:hidden;text-overflow:ellipsis">${x.kind==='link'?'🔗':'📄'} ${esc(x.name)} ${x.size?`<span class="mute">${kb(x.size)}</span>`:''}</span><button class="btn sm dg" onclick="subRm(${i})">Remove</button></div>`).join(''):'<p class="mute" style="margin:0">Nothing added yet.</p>')
 +bx('Notes',`<textarea ${inp.replace('flex:1;','width:100%;box-sizing:border-box;min-height:90px;')} oninput="S.sd.note=this.value" placeholder="Anything the reviewer should know">${esc(A.note)}</textarea>`)
 +`<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">${k==='task'?`<button class="btn p" onclick="subDone(true)">Submit for review</button>`:`<button class="btn p" onclick="subDone(false)">Save</button>${can2(o,'IN_REVIEW')?`<button class="btn" onclick="subDone(true)">Save & send to internal review</button>`:''}`}<button class="btn" onclick="subBack()">${k==='task'?'Cancel':'Skip for now'}</button></div>`}
async function subDone(send){const d=S.det,A=S.sd;if(!d||!A||A._submitted)return;if(d.kind==='task'&&!A.a.length)return toast('Add at least one link or file first');if(d.kind==='item'&&!A.a.length&&!(A.note||'').trim())return toast('Add a link, a file or a note first');
 A._submitted=true;const at=now(),by=ME[S.role][0],add=A.a.map(x=>({...x,at,by}));
 if(d.kind==='task'){
  const t=TK.find(x=>x.id===d.id);
  const link=add.find(x=>x.kind==='link'&&safeUrl(x.url));
  let submissionUrl=link?safeUrl(link.url):'';
  // If only local files were attached, upload first file to backend to get a persistent URL.
  if(!submissionUrl){
   const file=add.find(x=>x.kind==='file'&&x.url&&String(x.url).startsWith('data:'));
   if(file&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
    try{
     const res=await fetch(String(file.url));
     const blob=await res.blob();
     const fd=new FormData();
     fd.append('file', new File([blob], file.name||'attachment', {type:file.type||blob.type||'application/octet-stream'}));
     const up=await apiCall('/files/upload',{method:'POST',body:fd});
     submissionUrl=up?.url||up?.data?.url||up?.fileUrl||up?.data?.fileUrl||'';
     if(submissionUrl&&!/^https?:\/\//i.test(submissionUrl))submissionUrl=new URL(submissionUrl,location.origin).href;
    }catch(err){A._submitted=false;toast(err?.message||'Could not upload file. Please add an external link instead.');return}
   }
  }
  if(!submissionUrl){A._submitted=false;return toast('Add an external http/https link (file hosted outside the system) before submitting.')}
  t.atts=(t.atts||[]).concat(add);
  if(A.note)t.sub=A.note;
  const notes=(A.note||'').trim();
  // Persist to backend when task is linked to DB
  if(t._id&&typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
   try{
    await apiCall('/tasks/'+t._id+'/submit',{method:'POST',body:{submissionUrl,submissionNotes:notes||null}});
   }catch(err){A._submitted=false;toast(err?.message||'Could not submit task to server');return}
  }
  t.submissionUrl=submissionUrl;
  t.submissionNotes=notes;
  S.sd=null;S.det=null;window._pass=1;return tset(d.id,'SUBMITTED')
 }
 const i=fItem(d.id)[0];
 const link=add.find(x=>x.kind==='link'&&safeUrl(x.url));
 const noteText=(A.note||'').trim();
 i.atts=(i.atts||[]).concat(add.map(x=>({...x,v:i.v})));
 if(noteText)i.notes=(i.notes?i.notes+'\n':'')+noteText;
 if(link&&safeUrl(link.url))i.reference=safeUrl(link.url);
 if(add.length||noteText)logH(i,'Added '+(add.length?add.length+' file'+(add.length===1?'':'s')+'/link'+(add.length===1?'':'s'):'a note'),noteText||'');
 // Persist content item text/link to backend (DB), not only localStorage
 if(typeof getApiToken==='function'&&getApiToken()&&!S.offlineMode){
  try{
   if(!i._id){
    const plan=PLANS.find(pp=>(pp.items||[]).some(x=>x.id===i.id));
    if(plan&&plan._id){
     const list=await apiCall('/content-items?contentPlanId='+plan._id).catch(()=>null);
     const arr=Array.isArray(list)?list:(list?.contentItems||list?.items||list?.data||[]);
     const match=arr.find(x=>String(x.title||'').trim()===String(i.title||'').trim()&&String(x.type||'').toUpperCase()===String(i.type||'').toUpperCase());
     if(match&&match.id)i._id=match.id;
    }
   }
   if(i._id){
    const payload={};
    if(noteText||i.notes)payload.notes=i.notes||noteText;
    if(i.reference)payload.reference=i.reference;
    if(link&&safeUrl(link.url))payload.materialUrl=safeUrl(link.url);
    if(Object.keys(payload).length)await apiCall('/content-items/'+i._id,{method:'PATCH',body:payload});
   }else{
    console.warn('Content item has no server id; attachment saved locally only');
    toast('Saved locally. Open item again after sync to persist link to DB.');
   }
  }catch(err){console.warn('Content item attachment save failed',err);toast('Saved locally, but server sync failed: '+(err?.message||'unknown error'))}
 }
 S.sd=null;S.det={t:'item',id:d.id};
 if(send&&can2(i,'IN_REVIEW'))mv(d.id,'IN_REVIEW');
 else{toast('Saved');view(false)}}
{const _ts=tset;tset=function(id,s){if(s==='SUBMITTED'&&!window._pass&&S.role==='emp'){const t=TK.find(x=>x.id===id);if(t&&t.kind==='CREATION')return submitTaskModal(id);return openSub('task',id)}window._pass=0;return _ts(id,s)}}
{const _td=taskDet;taskDet=function(id){const b=_td(id);if(!b)return b;const t=TK.find(x=>x.id===id),p=t.after&&TK.find(x=>x.id===t.after),s=t.atts&&t.atts.length?t:p&&p.atts&&p.atts.length?p:null;
 return b+(s?`<div class="card" style="margin-top:16px"><h2 style="margin-bottom:6px">Submitted work</h2>${s.sub?`<p style="margin:0 0 6px">${esc(s.sub)}</p>`:''}${attList(s.atts)}</div>`:'')}}
{const _i3=itemDet;itemDet=function(id){const b=_i3(id);if(!b)return b;const i=fItem(id)[0],ed=['cc','am','admin'].includes(S.role)&&i.stage!=='PUBLISHED';
 return b+`<div class="card" style="margin-top:16px"><h2 style="margin-bottom:6px">Files & links (${(i.atts||[]).length})</h2>${attList(i.atts)||'<p class="mute" style="margin:0">Nothing attached yet.</p>'}${ed?`<button class="btn sm p" style="margin-top:12px" onclick="openSub('item',${id})">+ Add files or links</button>`:''}</div>`}}
/* ===== v11: demo data survives a refresh ===== */
const SK='agency-clean-demo-2026-11-23';
function sv(){try{localStorage.setItem(SK,JSON.stringify({rows:Object.fromEntries(Object.keys(D).filter(k=>D[k]&&Array.isArray(D[k].rows)).map(k=>[k,D[k].rows])),PLANS,REQ,MR,WRK,TK,TASKS,T,TX,IDN}))}catch{if(!window._qw){window._qw=1;toast('Browser storage is full — remove large files to keep saving')}}}
function ld(){try{const o=JSON.parse(localStorage.getItem(SK)||'null');if(!o)return;const rp=(x,y)=>{x.length=0;x.push(...y)};Object.keys(o.rows).forEach(k=>{if(D[k])D[k].rows=o.rows[k]});rp(PLANS,o.PLANS);rp(TK,o.TK);rp(TASKS,o.TASKS);rp(T,o.T);Object.keys(TX).forEach(k=>delete TX[k]);Object.assign(TX,o.TX);REQ=o.REQ;MR=o.MR;if(o.WRK)WRK=o.WRK;IDN=o.IDN}catch{/* ignore */}}
ld();
{const _v5=view;view=function(sk=true){enforceRoleRoute();const r=_v5(sk);sv();return r}}

/* ===== v12: admin Workflow page, split by brand ===== */
S.wf='';
const wfGo=i=>{S.wf=i<0?'':D.brands.rows[i].name;view(false)};
PAGES.workflow=()=>{const q=(S.q||'').trim().toLowerCase(),B=D.brands.rows,bi=B.findIndex(b=>b.name===S.wf),dn=t=>DONE4.includes(t.status),od=isOd,
 inf=b=>({L:allI().filter(([,p])=>p.brand===b.name),tk:TK.filter(t=>t.brand===b.name),rq:REQ.filter(r=>r.brand===b.name),s:sg(b.name)});
 if(bi<0){const bf=B.map((b,i)=>({b,i})).filter(({b})=>!q||[b.name,b.industry,b.teamId,b.accountManagerId,b.status].join(' ').toLowerCase().includes(q));return hdr('Workflow','Everything happening in each brand. Pick a brand to see the detail.')+(bf.length?`<div class="cards">${bf.map(({b,i})=>{const f=inf(b);return `<div class="card tc" style="cursor:pointer" onclick="wfGo(${i})"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-size:16px">${esc(b.name)}</b>${pill(b.status)}</div><div class="mute" style="font-size:12px">${esc(b.teamId)} · ${esc(b.accountManagerId)}</div><div>${Object.keys(STG).filter(s=>f.L.some(([x])=>x.stage===s)).map(s=>`${SP(s)}<span class="mute">×${f.L.filter(([x])=>x.stage===s).length}</span> `).join('')||'<span class="mute">No content yet</span>'}</div><div class="dash" style="margin:2px 0"></div><div><span class="tag">${f.tk.filter(t=>!dn(t)).length} open tasks</span><span class="tag">${f.tk.filter(od).length} overdue</span><span class="tag">${f.rq.filter(r=>['SUBMITTED','ASSIGNED'].includes(r.st)).length} requests</span></div></div>`}).join('')}</div>`:`<div class="card empty"><h2>Nothing here yet</h2><p class="mute">No brands match your search.</p></div>`)}
 const b=B[bi],f=inf(b),ev=f.L.flatMap(([i])=>i.hist.map(h=>({...h,t:i.title}))).sort((p,q)=>q.at.localeCompare(p.at)).slice(0,10),em=t=>`<p class="mute" style="margin:0">${t}</p>`;
 return `${bk('wfGo(-1)',esc(b.name),'All brands',[['Workflow','wfGo(-1)']])}`+hdr(esc(b.name),esc(b.industry||'')+' · '+esc(b.teamId)+' · Account manager: '+esc(b.accountManagerId))
 +crd('Strategy',`<dl class="kv" style="margin:0">${kvh([['Brand status',pill(b.status)],['Strategy',esc(f.s.st)+' / '+(esc(f.s.out)||'—')]])}</dl>`)
 +(PLANS.filter(p=>p.brand===b.name).map(p=>sec(esc(p.platform||'—')+' · '+esc(p.title),p.items.map(i=>[i,p]))).join('')||crd('Content',em('No content plans yet.')))
 +crd('Tasks ('+f.tk.length+')',f.tk.length?`<div class="tw"><table><thead><tr><th scope="col">Task</th><th scope="col">Assigned to</th><th scope="col">Status</th><th scope="col">Deadline</th></tr></thead><tbody>${f.tk.map(t=>`<tr><td><a class="lk" onclick="openD({t:'task',id:${t.id}})">${esc(t.title)}</a></td><td>${esc(t.assignee)}</td><td>${pill(t.status)}</td><td><span class="mono">${dl(t)||'—'}</span></td></tr>`).join('')}</tbody></table></div>`:em('No tasks.'))
 +crd('Client requests ('+f.rq.length+')',f.rq.map(r=>`<div style="padding:8px 0;border-top:1px solid var(--line)">${RQP(r.st)} ${esc(r.text)} <span class="mute">· ${esc(r.kind)} · ${esc(r.at)}</span></div>`).join('')||em('No requests.'))
 +crd('Recent activity',ev.map(h=>`<div style="padding:8px 0;border-top:1px solid var(--line)"><b>${esc(h.t)}</b> · ${esc(h.a)} <span class="mute">${esc(h.by)} · ${esc(h.at)}</span></div>`).join('')||em('No activity yet.'))};

/* ===== v13: edit each part of a team on its own ===== */
const tck=(c,l,on,nt)=>`<div class="ck">${l.map(v=>`<label><input type="checkbox" data-${c}="${esc(v)}" ${on.includes(v)?'checked':''}>${esc(v)}${nt&&nt(v)?` <span class="mute">· ${esc(nt(v))}</span>`:''}</label>`).join('')}</div>`;
const tdlg=(h,n,body,js)=>modal(`<div class="dlg"><h2>${h}</h2><p class="mute" style="margin:0 0 16px">${esc(n)}</p>${body}<div class="ft"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="${js}">Save</button></div></div>`);
function teamEditAbout(i){const n=T[i],x=TX[n],U=[...new Set([x.lead,...D.users.rows.filter(u=>u.roleId!=='Client').map(u=>u.fullName)])];
 tdlg('Edit description & lead',n,`<div class="fl"><label>Description</label><textarea id="ta1">${esc(x.desc==='—'?'':x.desc)}</textarea></div><div class="fl"><label>Team lead</label><select id="ta2">${U.map(u=>`<option value="${esc(u)}" ${u===x.lead?'selected':''}>${esc(u)}</option>`).join('')}</select></div>`,`teamSaveAbout(${i})`)}
function teamSaveAbout(i){const dlg=$('.ov .dlg');if(!dlg||dlg._submitted||!$('#ta1'))return;dlg._submitted=true;const x=TX[T[i]];x.desc=$('#ta1').value.trim()||'—';x.lead=$('#ta2').value;closeM();toast('Team updated');view(false)}
function teamEditMem(i){const n=T[i],U=D.users.rows.filter(u=>u.roleId!=='Client');tdlg('Edit members',n,`<div class="fl"><label>Members</label>${tck('tm',U.map(u=>u.fullName),U.filter(u=>u.teamId===n).map(u=>u.fullName),v=>{const u=U.find(y=>y.fullName===v);return u.teamId&&u.teamId!==n&&u.teamId!=='—'?'now in '+u.teamId:''})}</div><p class="mute" style="font-size:12px;margin:0">Choosing someone who is in another team moves them here.</p>`,`teamSaveMem(${i})`)}
function teamSaveMem(i){const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;dlg._submitted=true;const n=T[i],on=[...document.querySelectorAll('[data-tm]:checked')].map(c=>c.dataset.tm);D.users.rows.forEach(u=>{if(on.includes(u.fullName))u.teamId=n;else if(u.teamId===n)u.teamId='—'});closeM();toast('Members updated');view(false)}
function teamEditBr(i){const n=T[i],B=D.brands.rows;tdlg('Edit brands',n,`<div class="fl"><label>Brands</label>${tck('tb',B.map(b=>b.name),B.filter(b=>b.teamId===n).map(b=>b.name),v=>{const b=B.find(y=>y.name===v);return b.teamId&&b.teamId!==n&&b.teamId!=='—'?'now with '+b.teamId:''})}</div><p class="mute" style="font-size:12px;margin:0">Choosing a brand that belongs to another team moves it here.</p>`,`teamSaveBr(${i})`)}
function teamSaveBr(i){const dlg=$('.ov .dlg');if(!dlg||dlg._submitted)return;dlg._submitted=true;const n=T[i],on=[...document.querySelectorAll('[data-tb]:checked')].map(c=>c.dataset.tb);D.brands.rows.forEach(b=>{if(on.includes(b.name))b.teamId=n;else if(b.teamId===n)b.teamId='—'});closeM();toast('Brands updated');view(false)}

/* ===== v13b: Esc closes modal or leaves detail page; browser Back leaves detail page ===== */
{const _od=openD;openD=function(o){try{history.pushState({d:1},'')}catch{/* ignore */}return _od(o)}}
const leaveDet=()=>{if(S.det){if(S.det.t==='sub')subBack();else{S.det=null;view(false)}}};
function onKeyDown(e){
 if(e.key==='Escape'){
  const ovs=document.querySelectorAll('.ov');
  if(ovs.length){e.preventDefault();closeModalEl(ovs[ovs.length-1]);return}
  if(S.det)leaveDet();
 }
}

/* ===== v9: Express / Prisma Backend API Integration Bridge ===== */
const API_BASE=(window.__ORVIA_API_BASE__||'/api').replace(/\/+$/,'');
const API_CACHE={roles:{},jobTitles:{},usersByName:{},usersById:{},teamsByName:{},brandsByName:{},platformsByAccount:{},plansByTitle:{},campaignsByName:{},strategiesByBrand:{},progress:null,teamPerformance:null};
const ROLE_API_TO_UI={ADMIN:'admin',ACCOUNT_MANAGER:'am',CONTENT_CREATOR:'cc',CREATIVE:'emp',EMPLOYEE:'emp',CLIENT:'client'};
const ROLE_UI_TO_API={Admin:'ADMIN','Account Manager':'ACCOUNT_MANAGER','Content Creator':'CONTENT_CREATOR',Creative:'CREATIVE','Team Leader':'CONTENT_CREATOR',Client:'CLIENT'};
const ROLE_API_TO_LABEL={ADMIN:'Admin',ACCOUNT_MANAGER:'Account Manager',CONTENT_CREATOR:'Content Creator',CREATIVE:'Creative',EMPLOYEE:'Creative',CLIENT:'Client'};

const LEGACY_TOKEN_KEYS=['orvia_access_token','orvia_refresh_token','orvia_user','accessToken','refreshToken'];
function purgeLegacyLocalTokens(){
 try{LEGACY_TOKEN_KEYS.forEach(k=>localStorage.removeItem(k))}catch{/* ignore */}
}
function safeUser(u){
 if(!u||typeof u!=='object')return null;
 const roleVal=typeof u.role==='object'&&u.role!==null?(u.role.name||''):u.role;
 return {id:u.id??null,fullName:String(u.fullName??''),email:String(u.email??''),role:String(roleVal??'')};
}
purgeLegacyLocalTokens();
function getApiToken(){
 purgeLegacyLocalTokens();
 try{return sessionStorage.getItem('orvia_access_token')||''}catch{return ''}
}
function setApiTokens(at,rt,u){
 purgeLegacyLocalTokens();
 try{
  if(at)sessionStorage.setItem('orvia_access_token',String(at));
  if(rt)sessionStorage.setItem('orvia_refresh_token',String(rt));
  if(u){const su=safeUser(u);if(su)sessionStorage.setItem('orvia_user',JSON.stringify(su))}
 }catch{/* ignore */}
}
function clearApiTokens(){
 purgeLegacyLocalTokens();
 try{
  ['orvia_access_token','orvia_refresh_token','orvia_user'].forEach(k=>sessionStorage.removeItem(k));
 }catch{/* ignore */}
}

let _refreshInFlight=null;
async function apiCall(path,{method='GET',body,auth=true,isForm=false}={}){
 const headers={};
 if(!isForm&&body!==undefined)headers['Content-Type']='application/json';
 const tok=getApiToken();
 if(auth&&tok)headers['Authorization']='Bearer '+tok;
 const res=await fetch(API_BASE+path,{method,headers,body:isForm?body:(body!==undefined?JSON.stringify(body):undefined)});
 if(res.status===401&&auth){
  purgeLegacyLocalTokens();
  let rt='';
  try{rt=sessionStorage.getItem('orvia_refresh_token')||''}catch{/* ignore */}
  if(rt){
   if(!_refreshInFlight){
    _refreshInFlight=(async()=>{
     const rRes=await fetch(API_BASE+'/auth/refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:rt})}).catch(()=>null);
     if(!rRes||!rRes.ok)return null;
     const rJson=await rRes.json().catch(()=>null);
     const newAt=rJson?.data?.accessToken;
     if(!newAt)return null;
     setApiTokens(newAt,rJson?.data?.refreshToken||rt);
     return newAt;
    })().finally(()=>{_refreshInFlight=null});
   }
   const refreshedAt=await _refreshInFlight;
   if(refreshedAt){
    headers['Authorization']='Bearer '+refreshedAt;
    const retry=await fetch(API_BASE+path,{method,headers,body:isForm?body:(body!==undefined?JSON.stringify(body):undefined)});
    const retryJson=await retry.json().catch(()=>null);
    if(!retry.ok)throw new Error(retryJson?.message||'API request failed');
    return retryJson?.data??retryJson;
   }
  }
  clearApiTokens();
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
 if(!S.authed||S.offlineMode||!getApiToken())return;
 try{
  const me=await apiCall('/auth/me').catch(()=>null);
  if(!me){clearApiTokens();return}
  if(me.email){
   const stored=loadProfilesMap()[String(me.email).trim().toLowerCase()]||{};
   if(me.phone&&stored.phone===undefined)saveProfileStore(me.email,{phone:me.phone});
  }
  const [rolesData,jobsData,teamsData,usersData,brandsData,platformsData,plansData,campaignsData,itemsData,briefsData,stratsData,tasksData,notifsData,clientReqsData,changeReqsData,progressData,teamPerfData]=await Promise.all([
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
   apiCall('/notifications').catch(()=>null),
   apiCall('/client-requests').catch(()=>null),
   apiCall('/client-change-requests').catch(()=>null),
   S.role!=='client'?apiCall('/dashboard/progress').catch(()=>null):Promise.resolve(null),
   S.role!=='client'?apiCall('/dashboard/team-performance').catch(()=>null):Promise.resolve(null)
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
     D.brands.rows.push({_id:b.id,name:b.name,industry:b.industry||'General',websiteUrl:b.websiteUrl||'',description:b.description||'',teamId:b.team?.name||T[0]||'—',accountManagerId:b.accountManager?.fullName||MEN.am,status:(b.status||'ACTIVE').toUpperCase(),email:b.client?.email||'',clientId:b.client?.fullName||''});
    });
    if(S.role==='client'){
     S.clientBrand=bList[0].name;
     S.brand=bList[0].name;
     switchClientOnboarding(bList[0].name);
     ME.client=[me?.fullName||bList[0].name,'Client · '+bList[0].name];
     MEN.client=me?.fullName||bList[0].name;
    }
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
     const pItems=iList.filter(it=>it.contentPlanId===p.id).map(it=>{
      const pubSt=String(it.publishStatus||'NOT_PUBLISHED').toUpperCase();
      const revSt=String(it.clientReviewStatus||'NOT_READY').toUpperCase();
      let stage='DRAFT';
      if(pubSt==='PUBLISHED')stage='PUBLISHED';
      else if(revSt==='APPROVED')stage='APPROVED';
      else if(revSt==='PENDING_CLIENT_REVIEW')stage='CLIENT_REVIEW';
      else if(revSt==='CHANGES_REQUESTED'||revSt==='IN_MODIFICATION')stage='CHANGES_REQUESTED';
      const pub=pubSt==='PUBLISHED'?{d:it.publishedAt?String(it.publishedAt).slice(0,10):'',u:it.publishUrl||'',n:it.publishNotes||''}:null;
      return {
       id:it.id,_id:it.id,title:it.title,type:(it.type||'POST').toUpperCase(),platform:platAcc,
       campaign:pCamps.find(c=>c._id===it.campaignId)?.name||'—',
       date:it.scheduledDate?String(it.scheduledDate).slice(0,10):'',
       caption:it.caption||'',notes:it.notes||'',reference:it.reference||'',
       materialUrl:it.materialUrl||it.material_url||'',link:it.materialUrl||it.material_url||it.reference||'',
       toneOfVoice:it.toneOfVoice||it.tone_of_voice||'',assignee:it.creator?.fullName||MEN.cc,priority:'MEDIUM',status:'TODO',
       stage,clientReviewStatus:revSt,publishStatus:pubSt,pub,v:1,comments:[],hist:[],vers:[]
      };
     });
     PLANS.push({id:p.id,_id:p.id,brand:bName,platform:platAcc,title:p.title,month:mLabel,campaigns:pCamps,items:pItems});
    });
   }
  }
  if(briefsData){
   const brfList=Array.isArray(briefsData)?briefsData:(briefsData.briefs||[]);
   D.briefs.rows=brfList.map(bf=>normalizeBriefRow(bf)).filter(Boolean);
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
     const kindMap={CONTENT_CREATION:'CREATION',CONTENT_MODIFICATION:'CREATION',REVIEW:'REVIEW',PUBLISH:'PUBLISH',DIRECT:'DIRECT'};
     const ctx=[
      t.contentItem?.contentPlan?.platformAccount?.accountName,
      t.contentItem?.contentPlan?.title,
      t.contentItem?.title,
     ].filter(Boolean);
     const item=mk(t.id,t.title,kindMap[t.type]||'DIRECT',(t.status||'TODO').toUpperCase(),(t.priority||'MEDIUM').toUpperCase(),aName,byName,bName,ctx,pDate,eDate,t.description||'',t.dependsOnTaskId);
     item._id=t.id;
     item.submissionUrl=t.submissionUrl||'';
     item.submissionNotes=t.submissionNotes||'';
     TK.push(item);
     D.tasks.rows.push({_id:t.id,title:t.title,priority:(t.priority||'MEDIUM').toUpperCase(),assignedToId:aName,plannedDeadline:pDate,status:(t.status||'TODO').toUpperCase()});
    });
   }
  }
  if(notifsData){
   const nList=Array.isArray(notifsData)?notifsData:(notifsData.notifications||[]);
   if(nList.length){
    D.notifications.rows=nList.map(n=>{
     const title=n.title||n.message||'Notification';
     const low=(String(n.type||'')+' '+title).toLowerCase();
     const brandFromData=n.data?.brandName||D.brands.rows.find(b=>title.includes(b.name))?.name||'';
     const link=low.includes('onboarding')||low.includes('brief')
      ?{k:'onboarding',brand:brandFromData||BR[0]||''}
      :low.includes('strategy')
       ?{k:'strategy',brand:brandFromData||BR[0]||''}
       :{k:'tasks'};
     return {
      _id:n.id,title,
      createdAt:n.createdAt?String(n.createdAt).slice(0,16).replace('T',' '):'just now',
      isRead:Boolean(n.isRead),link
     };
    });
    loadStoredNotifs().slice().reverse().forEach(sn=>{
     if(sn?.title&&!D.notifications.rows.some(x=>x.title===sn.title))D.notifications.rows.unshift(sn);
    });
   }
  }
  if(progressData&&typeof progressData==='object'){
   API_CACHE.progress=progressData;
  }
  if(teamPerfData&&typeof teamPerfData==='object'){
   API_CACHE.teamPerformance=teamPerfData;
  }
  if(clientReqsData){
   const rList=Array.isArray(clientReqsData)?clientReqsData:(clientReqsData.requests||clientReqsData.clientRequests||clientReqsData.data||[]);
   REQ=rList.map(r=>{
    const bName=D.brands.rows.find(b=>b._id===r.brandId)?.name||BR[0]||'—';
    const empName=r.employee?.fullName||API_CACHE.usersById[r.employeeId]||'';
    const bTeam=D.brands.rows.find(b=>b._id===r.brandId)?.teamId||'';
    const stMap={PENDING:'SUBMITTED',ACCEPTED:'ASSIGNED',REJECTED:'REJECTED'};
    return {
     _id:r.id,id:r.id,brand:bName,kind:REQ_API_TO_KIND[r.type]||r.type||'Extra content',
     text:r.description||'',st:stMap[r.status]||r.status||'SUBMITTED',
     team:r.status==='ACCEPTED'?bTeam:'',assignee:empName,reason:r.rejectionReason||'',
     at:r.createdAt?String(r.createdAt).slice(0,10):TODAY
    };
   });
  }
  if(changeReqsData){
   const crList=Array.isArray(changeReqsData)?changeReqsData:(changeReqsData.changeRequests||changeReqsData.data||[]);
   CHANGE_REQS=crList.map(cr=>({
    _id:cr.id,id:cr.id,contentItemId:cr.contentItemId,
    itemTitle:cr.contentItem?.title||('Content #'+cr.contentItemId),
    brand:cr.brand?.name||D.brands.rows.find(b=>b._id===cr.brandId)?.name||BR[0]||'—',
    status:cr.status||'PENDING',clientNotes:cr.clientNotes||'',accountManagerNotes:cr.accountManagerNotes||'',
    createdAt:cr.createdAt?String(cr.createdAt).slice(0,16).replace('T',' '):TODAY
   }));
  }
  if(S.role==='client'){
   const [catData,obData]=await Promise.all([
    apiCall('/client-onboarding/categories').catch(()=>null),
    apiCall('/client-onboarding/me').catch(()=>null),
   ]);
   if(catData&&Array.isArray(catData.mainCategories)&&catData.mainCategories.length){
    OB_API_CATS=catData.mainCategories;
   }
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
 }catch{/* ignore */}
}

/* Override doLogin to authenticate against POST /api/auth/login with instant fallback */
const _origDoLogin=doLogin;
doLogin=async function(){
 if(S.busy)return;
 const v=Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i=>[i.dataset.f,i.value]));
 S.err={};
 const rawEmail=(v.email||'').trim();
 S.loginEmail=rawEmail;
 if(!rawEmail)S.err.email='Enter your email.';
 else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail))S.err.email='Please enter a valid email address.';
 if(!v.password)S.err.password='Enter your password.';
 if(Object.keys(S.err).length)return render();
 S.busy=true;
 try{
  const data=await apiCall('/auth/login',{method:'POST',body:{email:rawEmail,password:v.password},auth:false});
  if(data?.accessToken){
   if(data.user?.isActive===false){
    clearApiTokens();
    S.busy=false;
    S.err.password='This account is inactive.';
    toast('This account is inactive.');
    return render();
   }
   S.offlineMode=Boolean(data.offlineMode);
   if(S.offlineMode){clearApiTokens()}
   else{setApiTokens(data.accessToken,data.refreshToken,data.user)}
   const apiRole=data.user?.role?.name||data.user?.role;
   const apiTitle=data.user?.jobTitle?.name||'';
   if(apiRole==='EMPLOYEE'&&apiTitle==='Content Creator')S.role='cc';
   else if(apiRole&&ROLE_API_TO_UI[apiRole])S.role=ROLE_API_TO_UI[apiRole];
   S.currentEmail=data.user?.email||v.email.trim().toLowerCase();
   if(S.role==='client'){
    const cBrand=data.user?.clientBrand?.name||D.brands.rows.find(b=>String(b.email||'').trim().toLowerCase()===S.currentEmail)?.name||CLIENT_BRAND;
    S.clientBrand=cBrand;
    S.brand=cBrand;
    switchClientOnboarding(cBrand);
    ME.client=[data.user?.fullName||cBrand,'Client · '+cBrand];
    MEN.client=data.user?.fullName||cBrand;
   }else{
    S.clientBrand=null;
    S.brand=null;
    if(data.user?.fullName){
     ME[S.role]=[data.user.fullName,apiTitle||ROLES[S.role]];
     MEN[S.role]=data.user.fullName;
    }
   }
   applyStoredProfile(S.currentEmail);
   S.busy=false;
   S.authed=true;
   S.page=NAV[S.role][0];
   render();
   if(!S.offlineMode)hydrateFromBackend();
   return;
  }
 }catch(err){
  if(err?.status===403){
   S.busy=false;
   S.err.password=err.message||'This account is inactive.';
   toast(err.message||'This account is inactive.');
   return render();
  }
  if(err?.status===401||err?.status===423){
   const em=v.email.trim().toLowerCase();
   const brandMatch=D.brands.rows.find(b=>String(b.email||'').trim().toLowerCase()===em);
   if(brandMatch&&checkDemoPw(em,v.password)){
    S.busy=false;
    S.offlineMode=true;
    clearApiTokens();
    return _origDoLogin();
   }
   S.busy=false;
   S.err.password=err.message||'Invalid email or password.';
   toast(err.message||'Invalid credentials');
   return render();
  }
 }finally{
  S.busy=false;
 }
 S.offlineMode=true;
 clearApiTokens();
 _origDoLogin();
};

const _origLogout=logout;
logout=function(){
 if(getApiToken()&&!S.offlineMode){
  apiCall('/auth/logout',{method:'POST'}).catch(()=>{});
 }
 S.offlineMode=false;
 clearApiTokens();
 _origLogout();
};

const _origChg=chg;
chg=async function(){
 if(!getApiToken()||S.offlineMode)return _origChg();
 const v=Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i=>[i.dataset.f,i.value]));
 S.err={};
 const cur=String(v.currentPassword||'');
 const next=String(v.newPassword||'');
 if(!cur)S.err.currentPassword='Enter your current password.';
 if(next.length<8)S.err.newPassword='Use at least 8 characters.';
 else if(cur&&next===cur)S.err.newPassword='New password must differ from current password.';
 if(Object.keys(S.err).length)return view(false);
 try{
  await apiCall('/auth/change-password',{method:'POST',body:{currentPassword:cur,newPassword:next}});
  const em=getCurrentEmail();
  if(em)saveDemoPw(em,next);
  S.err={};
  toast('Password updated');
  view(false);
 }catch(err){
  const msg=err?.message||'Current password is incorrect.';
  if(/current/i.test(msg))S.err.currentPassword=msg;
  else S.err.newPassword=msg;
  toast(msg);
  view(false);
 }
};

/* Wire CRUD save / delete / status transitions to Express API */
const _origSave=save;
save=function(k,i){
 const hadModal=Boolean($('.ov .dlg'));
 if(!hadModal)return;
 const E=D[k],prevRow=i!=null?{...E.rows[i]}:null;
 const beforeLen=E.rows.length;
 _origSave(k,i);
 if($('.ov .dlg')||Object.keys(S.err).length||!getApiToken())return;
 const row=i==null?E.rows[0]:E.rows[i];
 if(!row)return;
 (async()=>{
  try{
   if(k==='users'){
    const roleNameMap={Admin:'ADMIN','Account Manager':'ACCOUNT_MANAGER','Team Leader':'TEAM_LEADER','Content Creator':'EMPLOYEE',Creative:'EMPLOYEE',Client:'EMPLOYEE'};
    const roleName=roleNameMap[row.roleId]||'EMPLOYEE';
    const jobTitleId=API_CACHE.jobTitles[row.jobTitleId]||null;
    const teamId=API_CACHE.teamsByName[row.teamId]||null;
    if(i==null&&beforeLen<E.rows.length){
     const pwd=S._pendingUserPassword||'';
     const sendInvite=S._pendingUserInvite!==false;
     delete S._pendingUserPassword;delete S._pendingUserInvite;
     const body={fullName:row.fullName,email:row.email,password:pwd,roleName,sendInvite};
     if(jobTitleId)body.jobTitleId=jobTitleId;else if(row.jobTitleId&&roleName!=='ADMIN')body.customJobTitle=row.jobTitleId;
     if(teamId)body.teamId=teamId;
     const created=await apiCall('/users',{method:'POST',body});
     if(created?.id){row._id=created.id;API_CACHE.usersByName[row.fullName]=created.id}
     toast(sendInvite?(created?.invitationSent?'User added · invitation email sent':'User added · invitation email could not be sent'):'User added');
    }else if(prevRow?._id){
     const body={fullName:row.fullName,email:row.email,roleName};
     if(jobTitleId)body.jobTitleId=jobTitleId;else if(row.jobTitleId&&roleName!=='ADMIN')body.customJobTitle=row.jobTitleId;
     if(teamId)body.teamId=teamId;
     await apiCall('/users/'+prevRow._id,{method:'PATCH',body});
    }
   }else if(k==='brands'){
    const teamId=API_CACHE.teamsByName[row.teamId];
    const accountManagerId=API_CACHE.usersByName[row.accountManagerId];
    if(i==null&&beforeLen<E.rows.length){
     delete S._pendingBrandPassword;
     const body={
      name:row.name,
      industry:row.industry||null,
      websiteUrl:row.websiteUrl||null,
      description:row.description||null,
      status:(row.status||'ACTIVE').toLowerCase(),
      teamId:teamId||null,
      accountManagerId:accountManagerId||null,
      client:{fullName:row.name,email:row.email},
     };
     const created=await apiCall('/brands',{method:'POST',body});
     const createdBrand=created?.brand||created;
     if(createdBrand?.id){row._id=createdBrand.id;API_CACHE.brandsByName[row.name]=createdBrand.id}
    }else if(prevRow?._id){
     await apiCall('/brands/'+prevRow._id,{method:'PATCH',body:{name:row.name,industry:row.industry||null,websiteUrl:row.websiteUrl||null,description:row.description||null,status:(row.status||'ACTIVE').toLowerCase(),teamId:teamId||null,accountManagerId:accountManagerId||null}});
    }
   }else if(k==='briefs'){
    if(prevRow?._id){
     const validStatuses=['GENERATED','APPROVED','NEEDS_CHANGES','REJECTED'];
     const body={};
     if(validStatuses.includes(row.status))body.status=row.status;
     if(row.content&&typeof row.content==='object')body.content=row.content;
     if(Object.keys(body).length){
      try{
       const updated=await apiCall('/brand-briefs/'+prevRow._id,{method:'PATCH',body});
       const mapped=normalizeBriefRow(updated,row.brandId);
       if(mapped)Object.assign(row,mapped);
       view(false);
      }catch(briefErr){
       Object.assign(row,prevRow);
       view(false);
       throw briefErr;
      }
     }
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
  }catch(err){
   if((k==='users'||k==='brands')&&i==null&&E.rows[0]===row){
    E.rows.shift();
    if(k==='brands'&&row.email){
     const uIdx=D.users.rows.findIndex(u=>String(u.email||'').trim().toLowerCase()===row.email);
     if(uIdx>=0)D.users.rows.splice(uIdx,1);
    }
    view(false);
   }
   if(err?.message)toast(err.message);
  }
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
    const yr=createdPlan.year||now.getFullYear();
    const mo=createdPlan.monthNum||(now.getMonth()+1);
    apiCall('/content-plans',{method:'POST',body:{brandId,platformAccountId,title:createdPlan.title,year:yr,month:mo,monthlyGoals:createdPlan.monthlyGoals||null}}).then(res=>{if(res?.id)createdPlan._id=res.id}).catch(err=>{if(err?.message)toast(err.message)});
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
 const hadModal=Boolean($('.ov .dlg'));
 if(!hadModal)return;
 _origItSave(pid,eid);
 if($('.ov .dlg')||!getApiToken())return;
 const p=pl(pid);
 if(!p)return;
 const item=eid?fItem(eid)?.[0]:p.items[p.items.length-1];
 if(!item)return;
 const campaignId=item.campaign&&item.campaign!=='—'?API_CACHE.campaignsByName[item.campaign]||null:null;
 const payload={
  title:item.title,
  type:item.type,
  scheduledDate:item.date||TODAY,
  caption:item.caption||null,
  notes:item.notes||null,
  ...(campaignId?{campaignId}:{}),
  ...(item.reference?{reference:item.reference}:{}),
  ...(item.materialUrl?{materialUrl:item.materialUrl}:{}),
  ...(item.toneOfVoice?{toneOfVoice:item.toneOfVoice}:{}),
 };
 if(eid&&item._id){
  const lastHist=(item.hist||[])[(item.hist||[]).length-1];
  const patchBody=lastHist&&lastHist.a==='Edited after approval'?{...payload,changeReason:'Edited after approval — returned to internal review'}:payload;
  apiCall('/content-items/'+item._id,{method:'PATCH',body:patchBody}).catch(err=>{if(err?.message)toast(err.message)});
 }else if(!eid&&p._id){
  apiCall('/content-items',{method:'POST',body:{contentPlanId:p._id,...payload}}).then(res=>{if(res?.id)item._id=res.id}).catch(err=>{if(err?.message)toast(err.message)});
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
 const prevStatus=t?.status;
 _origTset(id,s);
 if(t?._id&&getApiToken()&&!S.offlineMode){
  if(t.kind==='REVIEW'&&(s==='COMPLETED'||s==='NEEDS_CHANGES')){
   apiCall('/tasks/'+t._id+'/review',{method:'PATCH',body:{decision:s,notes:null}}).catch(err=>{if(prevStatus)t.status=prevStatus;if(err?.message)toast(err.message);view(false)});
  }else{
   apiCall('/tasks/'+t._id+'/status',{method:'PATCH',body:{status:t.status}}).catch(err=>{if(prevStatus)t.status=prevStatus;if(err?.message)toast(err.message);view(false)});
  }
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
  }catch(err){
   if(err?.message)toast(err.message);
  }
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
  apiCall(`/strategies/${stratInfo.id}/versions/${stratInfo.versionId}/approve`,{method:'POST',body:{comment:null}}).catch(err=>{if(err?.message)toast(err.message)});
 }else if(a==='reject'||a==='am_reject'){
  apiCall(`/strategies/${stratInfo.id}/versions/${stratInfo.versionId}/feedback`,{method:'POST',body:{message:reason}}).catch(err=>{if(err?.message)toast(err.message)});
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
gen=async function(){
 const bs=getBrandBriefState(S.brand);
 if(!bs.target)return toast('Open a brand first to generate its brief.');
 if(bs.generating)return toast('A brief is already being generated for this brand.');
 if(bs.hasActiveBrief)return toast('A brief already exists for '+bs.target+'.');
 if(!getApiToken()||S.offlineMode){
  if(!bs.onboardingSubmitted)return toast('The client must submit onboarding before generating a Brand Brief.');
  return _origGen();
 }
 const brandId=API_CACHE.brandsByName[bs.target]||D.brands.rows.find(b=>b.name===bs.target)?._id;
 if(!brandId)return toast('Could not find this brand on the server.');
 S.briefGenBusy=true;
 toast('Generating Brand Brief…');
 view(false);
 try{
  const res=await apiCall('/brand-briefs/'+brandId+'/generate',{method:'POST'});
  const mapped=normalizeBriefRow(res,bs.target);
  if(mapped){
   const existingIdx=D.briefs.rows.findIndex(r=>r._id&&mapped._id&&r._id===mapped._id);
   if(existingIdx>=0)D.briefs.rows[existingIdx]=mapped;
   else D.briefs.rows.unshift(mapped);
  }
  S.briefGenBusy=false;
  toast('Brand Brief generated successfully.');
  view(false);
 }catch(err){
  S.briefGenBusy=false;
  toast(err?.message||'Brand Brief generation failed. Please try again.');
  view(false);
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
D.briefs.run=async function(a,r){
 if(!r)return;
 if(!getApiToken()||S.offlineMode||!r._id)return _origBriefsRun.call(D.briefs,a,r);
 const prevStatus=r.status;
 try{
  let updated;
  if(a==='nc'){
   updated=await apiCall('/brand-briefs/'+r._id,{method:'PATCH',body:{status:'NEEDS_CHANGES'}});
   toast('Brief marked as needs changes');
  }else{
   updated=await apiCall('/brand-briefs/'+r._id+'/approve',{method:'POST',body:{comment:null}});
   toast('Brand Brief approved successfully.');
  }
  const mapped=normalizeBriefRow(updated,r.brandId);
  if(mapped)Object.assign(r,mapped);
  else r.status=a==='nc'?'NEEDS_CHANGES':'APPROVED';
  view(false);
 }catch(err){
  r.status=prevStatus;
  toast(err?.message||'Could not update Brand Brief.');
  view(false);
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

let resetTimer=null;

function applyTheme(){
 try{
  if(S.authed){delete document.documentElement.dataset.theme;return}
  document.documentElement.dataset.theme=S.theme==='dark'?'dark':'light';
 }catch{/* ignore */}
}
function toggleTheme(){
 S.theme=S.theme==='dark'?'light':'dark';
 try{localStorage.setItem('orvia_theme',S.theme)}catch{/* ignore */}
 applyTheme();
 render();
}

function startResetTimers({otpExpiresAt,resendAt}={}){
 if(otpExpiresAt)S.otpExpiresAt=otpExpiresAt;
 if(!S.otpExpiresAt)S.otpExpiresAt=Date.now()+10*60*1000;
 S.resendAt=resendAt||Date.now()+60*1000;
 if(resetTimer)clearInterval(resetTimer);
 const tick=()=>{
  S.otpLeft=Math.max(0,Math.ceil((S.otpExpiresAt-Date.now())/1000));
  S.resendLeft=Math.max(0,Math.ceil((S.resendAt-Date.now())/1000));
  const c=document.getElementById('otp-countdown');
  if(c)c.textContent=formatCountdown(S.otpLeft);
  const r=document.getElementById('otp-resend-link');
  if(r){r.textContent=S.resendLeft>0?`Resend in ${S.resendLeft}s`:'Resend code';r.style.opacity=S.resendLeft>0?'.5':'1'}
  const b=document.getElementById('otp-verify-btn');
  if(b)b.disabled=Boolean(S.busy||S.otpLeft<=0);
  if(S.otpLeft<=0&&S.resendLeft<=0){clearInterval(resetTimer);resetTimer=null}
 };
 tick();
 resetTimer=setInterval(tick,1000);
}
function stopResetTimers(){
 if(resetTimer)clearInterval(resetTimer);
 resetTimer=null;
}

function updatePwMeter(){
 const checks=passwordChecks(S.newPassword||'');
 const passed=checks.filter(c=>c.ok).length;
 document.querySelectorAll('[data-pw-seg]').forEach((el,i)=>el.classList.toggle('is-on',i<passed));
 const label=document.getElementById('pw-strength-label');
 if(label)label.textContent=`${S.newPassword?STRENGTH_LABELS[passed]:'—'} (${passed}/4)`;
 checks.forEach((c,i)=>{const li=document.getElementById(`pw-req-${i}`);if(li)li.classList.toggle('is-ok',c.ok)});
 const match=document.getElementById('pw-match');
 if(match)match.style.display=S.confirmPassword&&S.confirmPassword===S.newPassword?'inline-flex':'none';
 const mismatch=document.getElementById('pw-mismatch');
 if(mismatch)mismatch.style.display=S.confirmPassword&&S.confirmPassword!==S.newPassword?'block':'none';
 const btn=document.getElementById('pw-submit');
 if(btn)btn.disabled=!(S.resetToken&&passed===checks.length&&S.confirmPassword===S.newPassword&&!S.busy);
}

function syncOtpBoxes(){
 const boxes=[...document.querySelectorAll('.otp-box')];
 S.otp=boxes.map(b=>b.value.replace(/[^0-9]/g,'')).join('').slice(0,6);
 const hid=document.querySelector('[data-f="otp"]');
 if(hid)hid.value=S.otp;
}
function onOtpBoxInput(el,idx){
 const d=el.value.replace(/[^0-9]/g,'').slice(-1);
 el.value=d;
 syncOtpBoxes();
 if(d&&idx<5){
  const next=document.querySelector(`.otp-box[data-otp-idx="${idx+1}"]`);
  if(next)next.focus();
 }
}
function onOtpBoxKey(e,idx){
 if(e.key==='Backspace'&&!e.target.value&&idx>0){
  const prev=document.querySelector(`.otp-box[data-otp-idx="${idx-1}"]`);
  if(prev){prev.value='';prev.focus();syncOtpBoxes()}
 }else if(e.key==='ArrowLeft'&&idx>0){
  document.querySelector(`.otp-box[data-otp-idx="${idx-1}"]`)?.focus();
 }else if(e.key==='ArrowRight'&&idx<5){
  document.querySelector(`.otp-box[data-otp-idx="${idx+1}"]`)?.focus();
 }else if(e.key==='Enter'){
  doVerifyOtp();
 }
}
function onOtpBoxPaste(e){
 e.preventDefault();
 const digits=(e.clipboardData?.getData('text')||'').replace(/[^0-9]/g,'').slice(0,6);
 if(!digits)return;
 S.otp=digits;
 const boxes=[...document.querySelectorAll('.otp-box')];
 boxes.forEach((b,i)=>{b.value=digits[i]||''});
 const hid=document.querySelector('[data-f="otp"]');
 if(hid)hid.value=S.otp;
 boxes[Math.min(digits.length,5)]?.focus();
}

async function loadMailStatus(){
 try{
  const res=await apiCall('/auth/mail-status',{auth:false});
  if(res){
   S.mailCfg={...S.mailCfg,loaded:true,configured:Boolean(res.configured),provider:res.provider,smtpUser:res.smtpUser||S.mailCfg.smtpUser,from:res.from||S.mailCfg.from};
   if(!S.authed&&S.auth==='forgot')render();
  }
 }catch{/* ignore */}
}

async function saveMailCfg(){
 const tab=S.mailCfg.tab==='smtp'?'smtp':'resend';
 const resendApiKey=document.getElementById('cfg-resend-key')?.value?.trim()||'';
 const mailFrom=document.getElementById('cfg-mail-from')?.value?.trim()||'';
 const email=document.getElementById('cfg-smtp-user')?.value?.trim()||'';
 const appPassword=document.getElementById('cfg-smtp-pass')?.value?.trim()||'';
 if(tab==='resend'&&!/^re_[A-Za-z0-9_-]{8,}$/.test(resendApiKey)){toast('Paste a valid Resend API key (starts with re_)');return}
 if(tab!=='resend'&&(!email||!appPassword)){toast('Enter your Gmail address and 16-character app password');return}
 S.busy=true;
 render();
 try{
  const res=await apiCall('/auth/mail-config',{method:'POST',body:{email,appPassword,resendApiKey,mailFrom},auth:false});
  S.busy=false;
  S.mailCfg={...S.mailCfg,loaded:true,configured:Boolean(res?.configured),provider:res?.provider,smtpUser:res?.smtpUser||email,from:res?.from||mailFrom,showSetup:false};
  toast(res?.message||'Email delivery settings saved.');
  render();
 }catch(err){
  S.busy=false;
  toast(err?.message||'Could not save mail settings');
  render();
 }
}

const isStaticHostErr=err=>!err?.status||err.status===404||err.status===405||err.status===502||err.status===503||(err.status===500&&/^POST \/auth\/forgot-password failed \(500\)$/.test(String(err.message||'')));

async function doForgot(){
 const v=Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i=>[i.dataset.f,i.value]));
 S.err={};
 S.loginNotice='';
 const email=(v.email||'').trim();
 if(!email){S.err.email='Enter your email.';return render()}
 if(!/^\S+@\S+\.\S+$/.test(email)){S.err.email='Enter a valid email address.';return render()}
 S.forgotEmail=email;
 S.otp='';
 S.otpEmail=email;
 S.resetToken='';
 S.previewUrl='';
 S.mailError='';
 S._demoOtp='';
 S.busy=true;
 S.sent=0;
 render();
 try{
  const res=await apiCall('/auth/forgot-password',{method:'POST',body:{email},auth:false});
  S.busy=false;
  S.sent=1;
  S.auth='verify';
  S.otpEmail=res?.email||email;
  S.previewUrl=res?.previewUrl||'';
  S.mailError=res?.mailError||'';
  S.otpExpiresAt=res?.expiresAt?Date.parse(res.expiresAt):Date.now()+10*60*1000;
  S.otpLeft=Math.max(1,Math.ceil((S.otpExpiresAt-Date.now())/1000));
  S.resendLeft=60;
  S.err={};
  render();
  startResetTimers({otpExpiresAt:S.otpExpiresAt,resendAt:Date.now()+60*1000});
  toast('6-digit verification code sent to your email');
 }catch(err){
  if(isStaticHostErr(err)){
   const demoCode=String(Math.floor(100000+Math.random()*900000));
   S._demoOtp=demoCode;
   S.busy=false;
   S.sent=1;
   S.auth='verify';
   S.otpEmail=email;
   S.otpExpiresAt=Date.now()+10*60*1000;
   S.otpLeft=600;
   S.resendLeft=60;
   S.err={};
   render();
   startResetTimers({otpExpiresAt:S.otpExpiresAt,resendAt:Date.now()+60*1000});
   toast('Demo verification code generated: '+demoCode);
   return;
  }
  S.busy=false;
  S.err.form=err?.message||'Could not send a verification code. Please try again.';
  render();
 }
}

async function doVerifyOtp(){
 const v=Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i=>[i.dataset.f,i.value]));
 S.err={};
 const code=String(v.otp??S.otp??'').replace(/[^0-9]/g,'').slice(0,6);
 S.otp=code;
 if(!/^\d{6}$/.test(code)){S.err.otp='Enter the 6-digit verification code.';return render()}
 if(S.otpLeft<=0){S.err.form='This verification code has expired. Request a new one.';return render()}
 if(S._demoOtp){
  if(code!==S._demoOtp){S.err.otp='Incorrect verification code. Please try again.';return render()}
  stopResetTimers();
  S.sent=0;
  S.resetToken='demo-reset-token-'+Date.now();
  S.resetEmail=S.otpEmail||S.forgotEmail;
  S.newPassword='';
  S.confirmPassword='';
  S.auth='resetPassword';
  S.err={};
  render();
  toast('Code verified. Choose a new password.');
  return;
 }
 S.busy=true;
 render();
 try{
  const res=await apiCall('/auth/verify-otp',{method:'POST',body:{email:S.otpEmail||S.forgotEmail,otp:code},auth:false});
  if(!res?.resetToken)throw new Error('The server did not return a reset authorization.');
  stopResetTimers();
  S.busy=false;
  S.sent=0;
  S.resetToken=res.resetToken;
  S.resetEmail=res.email||S.otpEmail;
  S.newPassword='';
  S.confirmPassword='';
  S.auth='resetPassword';
  S.err={};
  render();
  toast('Code verified. Choose a new password.');
 }catch(err){
  S.busy=false;
  if(err?.status===429)S.err.form=err.message||'Too many incorrect attempts. Request a new code.';
  else S.err.otp=err?.message||'Invalid or expired verification code.';
  render();
 }
}

async function doResendOtp(){
 if(S.resendLeft>0){toast(`Please wait ${S.resendLeft}s before resending.`);return}
 const email=S.otpEmail||S.forgotEmail;
 if(!email){S.err.form='Enter your email again to request a new code.';S.auth='forgot';return render()}
 S.err={};
 S.busy=true;
 render();
 try{
  const res=await apiCall('/auth/resend-otp',{method:'POST',body:{email},auth:false});
  S.busy=false;
  S.sent=1;
  S.otp='';
  S.previewUrl=res?.previewUrl||S.previewUrl||'';
  S.otpExpiresAt=res?.expiresAt?Date.parse(res.expiresAt):Date.now()+10*60*1000;
  S.otpLeft=Math.max(1,Math.ceil((S.otpExpiresAt-Date.now())/1000));
  S.resendLeft=60;
  render();
  startResetTimers({otpExpiresAt:S.otpExpiresAt,resendAt:Date.now()+60*1000});
  toast('A new 6-digit verification code is on its way.');
 }catch(err){
  if(isStaticHostErr(err)){
   const demoCode=String(Math.floor(100000+Math.random()*900000));
   S._demoOtp=demoCode;
   S.busy=false;
   S.sent=1;
   S.otp='';
   S.otpExpiresAt=Date.now()+10*60*1000;
   S.otpLeft=600;
   S.resendLeft=60;
   render();
   startResetTimers({otpExpiresAt:S.otpExpiresAt,resendAt:Date.now()+60*1000});
   toast('New demo verification code: '+demoCode);
   return;
  }
  S.busy=false;
  if(err?.status===429)S.err.form=err.message;
  else S.err.form=err?.message||'Could not resend the verification code.';
  render();
 }
}

async function doResetPassword(){
 const v=Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i=>[i.dataset.f,i.value]));
 if(v.newPassword!==undefined)S.newPassword=v.newPassword;
 if(v.confirmPassword!==undefined)S.confirmPassword=v.confirmPassword;
 S.err={};
 const checks=passwordChecks(S.newPassword);
 if(checks.some(c=>!c.ok))S.err.newPassword='Use a password that meets all four requirements.';
 if(S.newPassword!==S.confirmPassword)S.err.confirmPassword='Passwords do not match.';
 if(!S.resetToken)S.err.form='Your reset authorization is missing or expired. Verify your email code again.';
 if(Object.keys(S.err).length)return render();
 if(S._demoOtp||String(S.resetToken).startsWith('demo-reset-token-')){
  saveDemoPw(S.resetEmail||S.otpEmail||S.forgotEmail,S.newPassword);
  S._demoOtp='';
  S.loginNotice='Your password has been reset successfully. Please log in with your new password.';
  S.authed=false;
  S.auth='login';
  S.forgotEmail=S.resetEmail||S.forgotEmail;
  S.otp='';
  S.sent=0;
  S.resetToken='';
  S.resetEmail='';
  S.newPassword='';
  S.confirmPassword='';
  S.err={};
  render();
  toast('Password updated! Sign in with your new password.');
  return;
 }
 S.busy=true;
 render();
 try{
  await apiCall('/auth/reset-password',{method:'POST',body:{resetToken:S.resetToken,newPassword:S.newPassword},auth:false});
  saveDemoPw(S.resetEmail||S.otpEmail||S.forgotEmail,S.newPassword);
  document.querySelectorAll('.orvia-mail-pop').forEach(e=>e.remove());
  S.busy=false;
  S.loginNotice='Your password has been reset successfully. Please log in with your new password.';
  S.authed=false;
  S.auth='login';
  S.forgotEmail=S.resetEmail||S.forgotEmail;
  S.otp='';
  S.sent=0;
  S.resetToken='';
  S.resetEmail='';
  S.newPassword='';
  S.confirmPassword='';
  S.err={};
  if(window.location.hash.startsWith('#reset'))history.replaceState(null,'',window.location.pathname);
  render();
  toast('Password updated! Sign in with your new password.');
 }catch(err){
  S.busy=false;
  S.err.form=err?.message||'Could not update your password. Verify your code again.';
  render();
 }
}

function applyResetHash(){
 if(!window.location.hash.startsWith('#reset'))return;
 const q=new URLSearchParams(window.location.hash.split('?')[1]||'');
 const tk=q.get('token');
 if(!tk)return;
 S.authed=false;
 S.err={};
 if(/^\d{6}$/.test(tk)){
  S.otp=tk;
  S.otpEmail=q.get('email')||S.forgotEmail||'';
  S.otpExpiresAt=Date.now()+10*60*1000;
  S.auth='verify';
  render();
  startResetTimers({otpExpiresAt:S.otpExpiresAt,resendAt:Date.now()+60*1000});
 }else{
  S.resetToken=tk;
  S.resetEmail=q.get('email')||'';
  S.auth='resetPassword';
  render();
 }
}

function cleanupOrviaListeners(){
 window.__orviaListenersBound=false;
 if(window.removeEventListener){
  window.removeEventListener('popstate',leaveDet);
  window.removeEventListener('hashchange',applyResetHash);
 }
 document.removeEventListener('keydown',onKeyDown);
 stopResetTimers();
 if(_searchTimer){clearTimeout(_searchTimer);_searchTimer=null}
}
function bindOrviaListeners(){
 if(window.__orviaListenersBound)return;
 window.__orviaListenersBound=true;
 if(window.addEventListener){
  window.addEventListener('popstate',leaveDet);
  window.addEventListener('hashchange',applyResetHash);
 }
 document.addEventListener('keydown',onKeyDown);
}
if(typeof window.__orviaCleanup==='function')window.__orviaCleanup();
window.__orviaCleanup=cleanupOrviaListeners;
window.__orviaBindListeners=bindOrviaListeners;
bindOrviaListeners();
if(window.location.hash.startsWith('#reset'))applyResetHash();

applyTheme();
render();
Object.assign(window,{S,D,OB,PLANS,TASKS,TK,T,TX,CATS,OBS,ROLES,ME,MEN,N,NAV,PAGES,CLIENT_BRAND,EMP,BR,PR,ST,TS,TS2,DONE4,STR,REQ,CHANGE_REQS,MR,WRK,STG,SP,esc,safeUrl,isAllowedPage,onSearch,clearSearch,pickSearchResult,openSearchDD,closeSearchDD,getApiToken,setApiTokens,clearApiTokens,toast,go,setRole,logout,view,render,act,E_del,gen,chg,editProfile,saveProfile,onProfilePhoto,removeProfilePhoto,togPw,doLogin,doForgot,doVerifyOtp,doResendOtp,doResetPassword,updatePwMeter,syncOtpBoxes,onOtpBoxInput,onOtpBoxKey,onOtpBoxPaste,loadMailStatus,saveMailCfg,toggleTheme,closeM,ask,askOk,arch,delB,upS,dlS,sgo,newPlan,newCamp,newItem,setIt,setTS,newTask,saveTask,editTask,saveEditTask,submitTaskModal,confirmSubmitTask,attachTaskModal,confirmAttachTask,roleCh,save,obSelectCategory,obSubmit,obFinish,tset,tdet,teamView,teamNew,teamSave,teamEdit,teamUpd,teamDel,teamRm,teamEditAbout,teamSaveAbout,teamEditMem,teamSaveMem,teamEditBr,teamSaveBr,nview,markRead,markAllRead,goTo,openD,itType,itSave,editItem,delItem,doDelItem,delPlan,doDelPlan,editPlan,saveEditPlan,setPlanStatus,newPlanP,assignItemTasks,saveItemTasks,mv,mvAsk,cmt,setLink,pubRec,loadItemRevisions,resolveChangeReq,forwardChangeReq,confirmForwardChangeReq,cmv,reqNew,reqOk,confirmReqOk,reqNo,reqTask,reqItem,repUp,repRev,repSave,repAi,repTxt,repOk,repSh,startWork,wrkOpen,wrkNew,openSub,subBack,subLink,subFiles,subRm,subDone,wfGo,leaveDet,applyResetHash});
