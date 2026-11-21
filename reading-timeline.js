/* A reading timeline in the page gutter; it never changes the text layout. */
(()=>{
  const nav=document.createElement('nav');nav.className='reading-timeline';nav.setAttribute('aria-label',window.i18n.t('ציר הזמן של הסיפור'));nav.hidden=true;
  const title=document.createElement('span');title.className='timeline-title';title.textContent=window.i18n.t('לאורך השנים');
  const year=document.createElement('strong');year.className='timeline-year';
  const progress=document.createElement('div');progress.className='timeline-progress';progress.setAttribute('role','progressbar');progress.setAttribute('aria-label',window.i18n.t('התקדמות בסיפור'));progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax','100');
  const fill=document.createElement('span');progress.append(fill);
  const list=document.createElement('div');list.className='timeline-stops';nav.append(title,year,progress,list);document.body.append(nav);
  const definitions=[
    ['sherel-1',window.i18n.t('שורשים'),window.i18n.t('הדורות הראשונים')],['sherel-2',window.i18n.t('לפני 1941'),window.i18n.t('אורינין')],['sherel-3','1941–1942',window.i18n.t('המלחמה והחורבן')],['sherel-4',window.i18n.t('מ־1944'),window.i18n.t('החזרה לאורינין')],
    ['berman-1','1895–1928',window.i18n.t('משפחת ברמן ופורמן')],['berman-2',window.i18n.t('לפני 1941'),window.i18n.t('השנים שלפני המלחמה')],['berman-3','1941',window.i18n.t('המשפחה מתפצלת')],['berman-4','1941',window.i18n.t('הבריחה מלבוב')],['berman-5',window.i18n.t('ימי המלחמה'),window.i18n.t('האסון על הדוברה')],['berman-6',window.i18n.t('שנות הפינוי'),window.i18n.t('ימנקה')],['berman-7','1943',window.i18n.t('האיחוד עם רוזה')],['berman-8',window.i18n.t('ימי הכיבוש'),window.i18n.t('אלה שלא שרדו')],['berman-9','1944–1946',window.i18n.t('החזרה לחיים')],
    ['together-1','1949',window.i18n.t('גרישה ודשה')],['together-2',window.i18n.t('הדור הבא'),window.i18n.t('איגור ונליה')],['event-nelia','1957',window.i18n.t('לידתה של נליה')],['event-igor','1990',window.i18n.t('פטירת איגור')],['event-israel','1991',window.i18n.t('העלייה לישראל')]
  ];
  let scheduled=false,lastKey='';
  function update(){scheduled=false;const story=document.getElementById('story');if(!story||!document.getElementById('sherel'))return;const box=story.getBoundingClientRect();nav.hidden=box.top>innerHeight*.7||box.bottom<120||document.getElementById('tree').getBoundingClientRect().top<innerHeight;if(nav.hidden)return;
    const visible=definitions.map(d=>({id:d[0],date:d[1],label:d[2],target:document.getElementById(d[0])})).filter(d=>d.target&&!d.target.closest('[hidden]'));
    let index=0;for(let i=0;i<visible.length;i++){if(visible[i].target.getBoundingClientRect().top<=innerHeight*.35)index=i;}
    const item=visible[index];if(!item)return;year.textContent=item.date;const percent=Math.round(index/Math.max(1,visible.length-1)*100);fill.style.height=percent+'%';progress.setAttribute('aria-valuenow',percent);progress.setAttribute('aria-valuetext',item.date+' — '+item.label);
    const key=item.id+'|'+visible.length;if(key===lastKey)return;lastKey=key;list.replaceChildren();const start=Math.max(0,Math.min(index-2,visible.length-5));visible.slice(start,start+5).forEach(d=>{const a=document.createElement('a');a.href='#'+d.id;a.title=d.date+' — '+d.label;a.setAttribute('aria-label',a.title);if(d===item)a.setAttribute('aria-current','step');const label=document.createElement('span');label.textContent=d.label;a.append(label);list.append(a);});
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
  function setup(){
    const milestones=[['event-nelia',window.i18n.t('לזוג נולדו שני ילדים:')],['event-igor',window.i18n.t('בשנת 1990 נפטר')],['event-israel',window.i18n.t('שנה לאחר מכן, בשנת 1991')]];
    document.querySelectorAll('#together p').forEach(p=>{for(const [id,start] of milestones)if(p.textContent.startsWith(start))p.id=id;});
    new MutationObserver(schedule).observe(document.getElementById('story'),{subtree:true,attributes:true,attributeFilter:['hidden']});window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);if(location.hash.startsWith('#event-'))requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'}));schedule();
  }
  if(document.getElementById('sherel'))setup();else document.addEventListener('story-ready',setup,{once:true});
})();
