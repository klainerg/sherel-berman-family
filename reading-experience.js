/* Parallel family stories and a return path for every in-page jump. */
(()=>{
  let active='sherel';
  const offsets={sherel:0,berman:0};
  const returns=[];
  let panels,tabs,group;
  const back=document.createElement('button');
  back.type='button';back.id='reading-back';back.textContent=window.i18n.t('חזרה לתוכן העניינים');
  const tools=document.createElement('div');tools.className='reading-tools';tools.setAttribute('aria-label',window.i18n.t('כלי קריאה'));
  tools.append(back);document.body.append(tools);
  function snapshot(){return {y:window.scrollY,branch:active,hash:location.hash};}
  function remember(){returns.push(snapshot());if(returns.length>100)returns.shift();back.textContent=window.i18n.t('חזרה למקום הקודם');}
  function activate(id){
    if(!panels)return;
    active=id;
    Object.entries(panels).forEach(([key,panel])=>{panel.hidden=key!==id;tabs[key].setAttribute('aria-selected',String(key===id));tabs[key].tabIndex=key===id?0:-1;});
  }
  function reveal(target){const panel=target.closest('#sherel,#berman');if(panel)activate(panel.id);}
  function navigate(hash,record=true){
    let id;try{id=decodeURIComponent(hash.slice(1));}catch{return;}
    const target=id?document.getElementById(id):document.body;if(!target)return;
    if(record)remember();reveal(target);
    history.pushState({familyReading:true,branch:active},'',hash||'#');
    target.scrollIntoView({behavior:'instant',block:'start'});
    if(target!==document.body){if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
  }
  document.addEventListener('click',e=>{
    const link=e.target.closest('a[href^="#"]');if(!link||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const hash=link.getAttribute('href');if(hash==='#tree'&&!document.getElementById('tree'))return;
    e.preventDefault();navigate(hash);
  });
  back.onclick=()=>{
    const previous=returns.pop();
    if(previous){activate(previous.branch);history.replaceState(null,'',previous.hash||location.pathname+location.search);window.scrollTo({top:previous.y,behavior:'instant'});}
    else{navigate('#contents',false);}
    back.textContent=returns.length?window.i18n.t('חזרה למקום הקודם'):window.i18n.t('חזרה לתוכן העניינים');
  };
  window.addEventListener('popstate',()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){reveal(target);target.scrollIntoView({behavior:'instant'});}});
  function setupStories(){
    panels={sherel:document.getElementById('sherel'),berman:document.getElementById('berman')};
    group=document.createElement('section');group.id='family-stories';group.setAttribute('aria-label',window.i18n.t('שני סיפורי המשפחה'));
    const intro=document.createElement('p');intro.className='parallel-intro';intro.textContent=window.i18n.t('שני ענפים, שני סיפורים. בחרו משפחה לקריאה; שניהם נפגשים בהמשך, בנישואי גרישה ודשה.');
    const strip=document.createElement('div');strip.className='family-tabs';strip.setAttribute('role','tablist');strip.setAttribute('aria-label',window.i18n.t('בחירת סיפור משפחתי'));
    tabs={};
    for(const [id,title] of [['sherel',window.i18n.t('משפחת שרל')],['berman',window.i18n.t('משפחות ברמן ופורמן')]]){
      const tab=document.createElement('button');tab.type='button';tab.id='tab-'+id;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',id);tab.textContent=title;tabs[id]=tab;strip.append(tab);
      panels[id].setAttribute('role','tabpanel');panels[id].setAttribute('aria-labelledby',tab.id);
      tab.onclick=()=>{if(active===id)return;remember();offsets[active]=Math.max(0,window.scrollY-(panels[active].getBoundingClientRect().top+window.scrollY)+90);activate(id);history.pushState({familyReading:true,branch:id},'','#'+id);const top=panels[id].getBoundingClientRect().top+window.scrollY;requestAnimationFrame(()=>{tabs[id].focus({preventScroll:true});window.scrollTo({top:Math.max(0,top+offsets[id]-90),behavior:'instant'});});};
      tab.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'sherel':e.key==='End'?'berman':id==='sherel'?'berman':'sherel';tabs[next].click();tabs[next].focus({preventScroll:true});}};
    }
    panels.sherel.before(group);group.append(intro,strip,panels.sherel,panels.berman);activate('sherel');
    const together=document.createElement('a');together.href='#together';together.className='continue-together';together.textContent=window.i18n.t('אל הסיפור המשותף של גרישה ודשה');group.append(together);
    if(location.hash){let target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){reveal(target);requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant'}));}}
  }
  if(document.getElementById('sherel'))setupStories();
  else document.addEventListener('story-ready',setupStories,{once:true});
})();
