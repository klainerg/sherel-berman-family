/* תוכן מוצג כטקסט בלבד; אין הרצת HTML מקובצי הפרקים. */
'use strict';
const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
const safeName=name=>/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)&&!name.includes('..');
const fetchFile=async(path,json=false)=>{const r=await fetch(path);if(!r.ok)throw new Error(path);return json?r.json():r.text();};
let sourceMap=new Map();
let references=new Map();
let zoom=1;
const viewer=document.querySelector('#viewer');
function setZoom(){document.querySelector('#large-image').style.width=`${zoom*100}%`;}
function showImage(src,caption){const image=document.querySelector('#large-image');image.src=src;image.alt=caption;document.querySelector('#large-caption').textContent=caption;zoom=1;setZoom();viewer.showModal();}
document.querySelector('#close-viewer').onclick=()=>viewer.close();
document.querySelector('#zoom-in').onclick=()=>{zoom=Math.min(4,zoom+.5);setZoom();};
document.querySelector('#zoom-out').onclick=()=>{zoom=Math.max(.5,zoom-.5);setZoom();};
viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});
document.querySelector('#print').onclick=()=>window.print();
function inline(node,text){
  const re=/\[\[מקור:\s*([\w-]+)\s*\]\]/g;let start=0;let match;
  while((match=re.exec(text))){node.append(document.createTextNode(text.slice(start,match.index)));const entry=sourceMap.get(match[1]);if(entry){const sup=el('sup');const link=el('a',`[${entry.number}]`);link.href=`#source-${entry.id}`;link.setAttribute('aria-label',`מקור ${entry.number}: ${entry.title}`);const refs=references.get(entry.id)||[];link.id=`ref-${entry.id}-${refs.length+1}`;refs.push(link.id);references.set(entry.id,refs);sup.append(link);node.append(sup);}else{node.append(document.createTextNode('[הפניה למקור חסר]'));}start=re.lastIndex;}
  node.append(document.createTextNode(text.slice(start)));
}
function figure(filename,caption){
  const fig=el('figure');const placeholder=el('div',undefined,'placeholder');placeholder.append(el('span','▧'),el('small','מקום לתמונה מהאלבום המשפחתי'));fig.append(placeholder,el('figcaption',caption));
  if(safeName(filename)){const image=new Image();image.alt=caption;image.loading='lazy';image.onload=()=>{const button=el('button');button.type='button';button.setAttribute('aria-label',`הגדלת תמונה: ${caption}`);button.append(image);button.onclick=()=>showImage(image.src,caption);placeholder.replaceWith(button);};image.src=`assets/images/${encodeURIComponent(filename)}`;}
  return fig;
}
function renderChapter(chapter,text){
  const article=el('article');article.id=chapter.id;article.append(el('p',chapter.label,'part-number'),el('h2',chapter.title));
  let headingIndex=0;
  for(const block of text.trim().split(/\r?\n\s*\r?\n/)){
    const image=block.trim().match(/^\[\[תמונה:\s*([^|\]]+)\s*\|\s*([^\]]+)\]\]$/);
    if(image){article.append(figure(image[1].trim(),image[2].trim()));continue;}
    if(block.startsWith('## ')){const h=el('h3',block.slice(3).trim());h.id=`${chapter.id}-${++headingIndex}`;article.append(h);continue;}
    const p=el('p');inline(p,block);article.append(p);
  }return article;
}
async function init(){
  const story=document.querySelector('#story');
  try{
    const [chapters,sources]=await Promise.all([fetchFile('content/chapters.json',true),fetchFile('content/sources.json',true)]);
    sources.forEach((s,i)=>sourceMap.set(s.id,{...s,number:i+1}));
    const results=await Promise.all(chapters.map(async c=>{if(!safeName(c.file)||! /^[a-z][a-z0-9-]*$/.test(c.id))throw new Error('chapter');return renderChapter(c,await fetchFile(`content/${c.file}`));}));
    story.replaceChildren(...results);
    const related=el('div',undefined,'related-story');related.append(el('span','המשך הסיפור המשפחתי: '));const familyLink=el('a','שורשי משפחת קליינר');familyLink.href='https://klainerg.github.io/kleiner-family/';familyLink.target='_blank';familyLink.rel='noopener noreferrer';related.append(familyLink);document.querySelector('#together').append(related);
    const nav=document.querySelector('#chapter-nav');chapters.forEach(c=>{const a=el('a',c.title);a.href=`#${c.id}`;nav.append(a);});
    const list=document.querySelector('#source-list');sources.forEach(s=>{const li=el('li');li.id=`source-${s.id}`;li.append(el('strong',s.title),el('div',s.note));if(s.url){try{const url=new URL(s.url);if(['http:','https:'].includes(url.protocol)){const a=el('a','פתיחת המקור');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';li.append(a);}}catch{}}else li.append(el('span','פרטי ההפניה טרם צורפו','source-status'));(references.get(s.id)||[]).forEach((id,i)=>{const a=el('a',` חזרה לסיפור${i?' '+(i+1):''} ↩`);a.href=`#${id}`;li.append(a);});list.append(li);});
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){nav.querySelectorAll('a').forEach(a=>{const active=a.hash===`#${entry.target.id}`;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}},{rootMargin:'-10% 0px -65% 0px'});results.forEach(a=>observer.observe(a));
    document.dispatchEvent(new Event('story-ready'));
  }catch(error){story.replaceChildren(el('p','לא ניתן לטעון את הסיפור כעת. יש לרענן את הדף. לתצוגה מקומית יש לפתוח דרך שרת תצוגה ולא בלחיצה כפולה על הקובץ.'));console.error('טעינת תוכן נכשלה',error);}
}
init();
