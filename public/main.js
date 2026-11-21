const $=id=>document.getElementById(id);const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
function protectMedia(frame,media){
  frame.classList.add('media-frame');
  media.classList.add('media');
  media.setAttribute('draggable','false');
  media.addEventListener('contextmenu',e=>e.preventDefault());
  media.addEventListener('dragstart',e=>e.preventDefault());
  if(media.tagName==='VIDEO'){
    media.controls=true;media.preload='metadata';media.playsInline=true;
    media.setAttribute('controlsList','nodownload noremoteplayback');
    media.setAttribute('disablePictureInPicture','');
    media.disablePictureInPicture=true;
  }
  const mark=node('span','watermark','RamanainHYD');
  mark.setAttribute('aria-label','RamanainHYD watermark');
  frame.append(media,mark);
  frame.addEventListener('contextmenu',e=>e.preventDefault());
}
async function init(){try{const p=await(await fetch('/api/portfolio')).json();document.title=p.name+' | Portfolio';$('role').textContent=p.role;$('tagline').textContent=p.tagline;$('name').textContent=p.name;$('foot-name').textContent=p.name;$('about-text').textContent=p.about;$('year').textContent=new Date().getFullYear();$('email').href='mailto:'+p.email;$('count').textContent=p.projects.length+' PROJECT'+(p.projects.length===1?'':'S');const grid=$('projects');if(!p.projects.length)grid.append(node('div','empty','Your next favorite project is coming soon.'));p.projects.forEach(x=>{const card=node('article','project');const frame=node('div','');let media;if(x.type==='video'){media=node('video','');}else{media=node('img','');media.loading='lazy';media.alt=x.title}media.src=x.url;protectMedia(frame,media);const info=node('div','project-info');info.append(node('h3','',x.title),node('p','',x.description));card.append(frame,info);grid.append(card)});p.skills.forEach(s=>$('skills').append(node('span','chip',s)));[['Instagram',p.instagram],['YouTube',p.youtube]].forEach(([label,url])=>{if(/^https:\/\//.test(url)){const a=node('a','btn',label+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';$('social').append(a)}})}catch(e){$('projects').append(node('div','empty','Unable to load portfolio. Please try again.'))}}init();
