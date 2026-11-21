/* Shared language selection. Each language uses separate, matching TXT chapters. */
(()=>{
  const url=new URL(location.href);let saved='he';try{saved=localStorage.getItem('sherel-berman-language')||'he';}catch{}
  const requested=url.searchParams.get('lang');const lang=['he','ru','en'].includes(requested)?requested:['he','ru','en'].includes(saved)?saved:'he';
  const dictionary=lang==='en'?window.EN_UI:window.RU_UI;const t=text=>lang!=='he'?(dictionary[text]??text):text;
  window.i18n={lang,t};document.documentElement.lang=lang;document.documentElement.dir=lang!=='he'?'ltr':'rtl';try{localStorage.setItem('sherel-berman-language',lang);}catch{}
  document.title=t('שורשי משפחות שרל וברמן');document.querySelector('meta[name=description]').content=t('שורשי משפחות שרל וברמן');
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  if(lang!=='he')nodes.forEach(node=>{if(node.parentElement.closest('script,style,.language-switch'))return;const text=node.textContent.trim();if(text&&dictionary[text])node.textContent=node.textContent.replace(text,t(text));});
  document.querySelectorAll('[aria-label]').forEach(node=>node.setAttribute('aria-label',t(node.getAttribute('aria-label'))));
  document.querySelectorAll('[data-language]').forEach(button=>{
    button.setAttribute('aria-pressed',String(button.dataset.language===lang));
    button.onclick=()=>{const next=button.dataset.language;if(next===lang)return;const target=new URL(location.href);target.searchParams.set('lang',next);
      if(scrollY>200){let nearest;document.querySelectorAll('#home,#story article,#story h3[id],#story p[id],#tree,#sources').forEach(node=>{if(!node.closest('[hidden]')&&node.getBoundingClientRect().top<=innerHeight*.35)nearest=node;});if(nearest)target.hash=nearest.id;}
      try{localStorage.setItem('sherel-berman-language',next);}catch{}location.assign(target.href);
    };
  });
})();
