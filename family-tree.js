/* An HTML family tree with SVG relationship lines, pointer pan and pinch zoom. */
(()=>{
  const root=document.getElementById('tree');if(!root)return;
  const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
  const heading=make('h2','עץ המשפחה');root.append(heading,make('p','שני ענפים נפגשים בגרישה ודשה, וממשיכים אל הדורות הבאים. גררו לכל כיוון; בטלפון אפשר לצבוט בשתי אצבעות להגדלה. לחצו על שם לפרטים ולמעבר לסיפור.'));
  const controls=make('div',null,'tree-controls');controls.setAttribute('role','group');controls.setAttribute('aria-label','ניווט בעץ המשפחה');
  const viewport=make('div',null,'tree-viewport');viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','עץ משפחה שניתן להזיז ולהגדיל');viewport.setAttribute('aria-describedby','tree-help');
  const canvas=make('div',null,'tree-canvas');viewport.append(canvas);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('tree-lines');svg.setAttribute('aria-hidden','true');canvas.append(svg);
  let scale=1,tx=0,ty=0,data,selectedFocus='together',dragged=false,resizeFrame;
  const label=make('output','100%','tree-zoom-label');label.setAttribute('aria-label','רמת הגדלה');
  const buttons={};
  function draw(){canvas.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;label.textContent=Math.round(scale*100)+'%';}
  function zoomAt(factor,x=viewport.clientWidth/2,y=viewport.clientHeight/2){const next=Math.max(.16,Math.min(2.4,scale*factor));tx=x-(x-tx)*next/scale;ty=y-(y-ty)*next/scale;scale=next;draw();}
  function focus(kind){selectedFocus=kind;Object.entries(buttons).forEach(([key,b])=>b.setAttribute('aria-pressed',String(key===kind)));
    if(kind==='together'){scale=Math.max(.6,Math.min(1.1,viewport.clientWidth/480,viewport.clientHeight/520));tx=viewport.clientWidth/2-960*scale;ty=viewport.clientHeight/2-650*scale;}
    else{const people=kind==='all'?data.people:data.people.filter(p=>p.family===kind);const left=Math.min(...people.map(p=>p.x))-55,top=Math.min(...people.map(p=>p.y))-55,right=Math.max(...people.map(p=>p.x))+255,bottom=Math.max(...people.map(p=>p.y))+155;scale=Math.min(1.15,viewport.clientWidth/(right-left),viewport.clientHeight/(bottom-top));tx=(viewport.clientWidth-(right-left)*scale)/2-left*scale;ty=(viewport.clientHeight-(bottom-top)*scale)/2-top*scale;}
    draw();
  }
  for(const [id,text] of [['sherel','משפחת שרל'],['berman','ברמן ופורמן'],['together','גרישה ודשה'],['all','הצג הכול']]){const b=make('button',text);b.type='button';b.onclick=()=>data&&focus(id);b.disabled=true;buttons[id]=b;controls.append(b);}
  for(const [text,aria,factor] of [['+','הגדלת העץ',1.25],['−','הקטנת העץ',.8]]){const b=make('button',text);b.type='button';b.setAttribute('aria-label',aria);b.onclick=()=>zoomAt(factor);controls.append(b);}
  controls.append(label);root.append(controls,viewport);
  const legend=make('div',null,'tree-legend');legend.append(make('span','הורים וילדים'),make('span','בני זוג','marriage'),make('span','קשר לדורות קודמים','ancestry'));root.append(legend);
  const help=make('p','אפשר להזיז גם באמצעות מקשי החצים, להגדיל ב־+ ולהקטין ב־−. רשימת השמות בהמשך מאפשרת להגיע לכל אדם גם ללא גרירה.');help.id='tree-help';root.append(help);
  const list=make('details',null,'tree-list');list.append(make('summary','רשימת בני המשפחה'));const ul=make('ul');list.append(ul);root.append(list);
  const dialog=make('dialog',null,'tree-details');dialog.setAttribute('aria-label','פרטי בן משפחה');document.body.append(dialog);let lastPerson;
  function details(person){lastPerson=document.activeElement;dialog.replaceChildren();const close=make('button','סגירה');close.type='button';close.onclick=()=>dialog.close();const name=make('h3',person.name);dialog.append(close,name,make('p',person.subtitle),make('p',person.notes));const story=make('a','לקריאה בסיפור');story.href='#'+person.chapter;story.onclick=()=>dialog.close();dialog.append(story);dialog.showModal();}
  dialog.addEventListener('close',()=>lastPerson?.focus({preventScroll:true}));
  const pointers=new Map();let gesture=null,start=null;
  viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;dragged=false;viewport.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});start={x:e.clientX,y:e.clientY};gesture=null;});
  viewport.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId))return;const previous=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)dragged=true;
    if(pointers.size===1){tx+=e.clientX-previous.x;ty+=e.clientY-previous.y;draw();}
    else{dragged=true;const [a,b]=[...pointers.values()];const distance=Math.hypot(a.x-b.x,a.y-b.y),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;const rect=viewport.getBoundingClientRect();if(gesture){zoomAt(distance/gesture.distance,cx-rect.left,cy-rect.top);tx+=cx-gesture.cx;ty+=cy-gesture.cy;draw();}gesture={distance,cx,cy};}
  });
  const end=e=>{const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-person]');if(!dragged&&pointers.size===1&&target&&e.type==='pointerup'){const person=data.people.find(p=>p.id===target.dataset.person);if(person)details(person);}pointers.delete(e.pointerId);gesture=null;};
  viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('lostpointercapture',e=>{pointers.delete(e.pointerId);gesture=null;});
  viewport.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const rect=viewport.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*.005),e.clientX-rect.left,e.clientY-rect.top);},{passive:false});
  viewport.addEventListener('keydown',e=>{const moves={ArrowLeft:[50,0],ArrowRight:[-50,0],ArrowUp:[0,50],ArrowDown:[0,-50]};if(moves[e.key]){e.preventDefault();tx+=moves[e.key][0];ty+=moves[e.key][1];draw();}if(['+','=','-','−'].includes(e.key)){e.preventDefault();zoomAt(['+','='].includes(e.key)?1.25:.8);}});
  function path(d,cls=''){const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',d);if(cls)p.setAttribute('class',cls);svg.append(p);}
  function text(x,y,value){const t=document.createElementNS(svg.namespaceURI,'text');t.setAttribute('x',x);t.setAttribute('y',y);t.textContent=value;svg.append(t);}
  fetch('family-tree.json').then(r=>{if(!r.ok)throw Error('tree');return r.json();}).then(value=>{
    data=value;const byId=new Map(data.people.map(p=>[p.id,p]));
    function children(x,y,ids){if(!ids.length)return;const people=ids.map(id=>byId.get(id)),barY=Math.min(...people.map(p=>p.y))-45;path(`M${x} ${y} V${barY} H${people[0].x+100}`);for(const p of people)path(`M${x} ${barY} H${p.x+100} V${p.y}`);}
    for(const couple of data.couples){const [a,b]=couple.partners.map(id=>byId.get(id));const left=a.x<b.x?a:b,right=a.x<b.x?b:a,y=left.y+60,x=(left.x+200+right.x)/2;path(`M${left.x+200} ${y} H${right.x}`,'spouse');if(couple.label)text(x,y-85,couple.label);children(x,y,couple.children);}
    for(const relation of data.parents){const p=byId.get(relation.parent);children(p.x+100,p.y+120,relation.children);}
    for(const relation of data.ancestry){const a=byId.get(relation.from),b=byId.get(relation.to);path(`M${a.x+100} ${a.y+120} V${b.y-35} H${b.x+100} V${b.y}`,'ancestry');text(a.x+240,a.y+135,relation.label);}
    for(const p of data.people){const button=make('button',null,'person-node');button.type='button';button.style.left=p.x+'px';button.style.top=p.y+'px';button.dataset.person=p.id;button.dataset.family=p.family;button.append(make('span',p.name),make('small',p.subtitle));button.setAttribute('aria-label',p.name+' — '+p.subtitle);button.addEventListener('click',e=>{if(e.detail===0)details(p);});canvas.append(button);const li=make('li');const b=make('button',p.name+' — '+p.subtitle);b.type='button';b.onclick=()=>details(p);li.append(b);ul.append(li);}
    Object.values(buttons).forEach(b=>b.disabled=false);focus('together');new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>focus(selectedFocus));}).observe(viewport);
  }).catch(()=>{viewport.replaceChildren(make('p','לא ניתן לטעון את העץ כרגע. אפשר לרענן את הדף ולנסות שוב.'));});
})();
