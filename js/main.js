(() => {
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Responsive navigation
  const menu=$('#menu'),nav=$('#nav');
  function closeMenu(){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false')}
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
  $$('#nav a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  addEventListener('resize',()=>{if(innerWidth>760)closeMenu()});
  const header=$('#header'),headerScroll=()=>header?.classList.toggle('scrolled',scrollY>12);
  headerScroll();addEventListener('scroll',headerScroll,{passive:true});

  // Cinematic section reveals
  const revealSelectors='.section-head,.service-card,.service-photo,.why-photo,.why-copy,.manifesto .reveal,.statement .reveal,.team-intro,.doctor-card,.tour-image,.tour-caption,.review-title,.review-card,.appointment-copy,.appointment-doctor,.booking-form,.faq-intro,.faq-item,.contact-strip>div,.contact-strip>a';
  $$(revealSelectors).forEach(el=>el.classList.add('reveal'));
  if('IntersectionObserver'in window&&!reduced){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -30px 0px'});
    $$('.reveal').forEach((el,i)=>{el.style.transitionDelay=`${(i%4)*65}ms`;io.observe(el)});
  }else $$('.reveal').forEach(el=>el.classList.add('visible'));

  // FAQ accordion
  $$('.faq-question').forEach(btn=>btn.addEventListener('click',()=>{
    const item=btn.closest('.faq-item'),open=!item.classList.contains('open');
    $$('.faq-item').forEach(other=>{other.classList.remove('open');other.querySelector('.faq-question').setAttribute('aria-expanded','false');other.querySelector('.faq-question span').textContent='+'});
    if(open){item.classList.add('open');btn.setAttribute('aria-expanded','true');btn.querySelector('span').textContent='−'}
  }));

  // Doctor carousel: clickable controls, keyboard and swipe/drag.
  const viewport=$('#teamViewport'),track=$('#teamTrack'),cards=track?[...track.children]:[];
  let index=0,startX=0,dragging=false;
  const step=()=>cards[1]?cards[1].offsetLeft-cards[0].offsetLeft:(cards[0]?.offsetWidth||0);
  const maxOffset=()=>Math.max(0,track.scrollWidth-viewport.clientWidth);
  function renderTeam(){if(!track||!cards.length)return;const offset=Math.min(index*step(),maxOffset());track.style.transition=reduced?'none':'transform .55s cubic-bezier(.22,.75,.2,1)';track.style.transform=`translate3d(${-offset}px,0,0)`;cards.forEach((card,i)=>card.classList.toggle('active',i===index))}
  function moveTeam(d){index=(index+d+cards.length)%cards.length;renderTeam()}
  $('#teamPrev')?.addEventListener('click',()=>moveTeam(-1));$('#teamNext')?.addEventListener('click',()=>moveTeam(1));
  viewport?.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();moveTeam(1)}if(e.key==='ArrowLeft'){e.preventDefault();moveTeam(-1)}});
  viewport?.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;track.style.transition='none';viewport.setPointerCapture?.(e.pointerId)});
  viewport?.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const delta=e.clientX-startX;if(Math.abs(delta)>40)moveTeam(delta<0?1:-1);else renderTeam()});
  viewport?.addEventListener('pointercancel',()=>{dragging=false;renderTeam()});
  addEventListener('resize',renderTeam);renderTeam();

  // Review carousel controls
  const reviews=[
    {name:'A patient',quote:'“The team explained every step clearly. I felt listened to and more confident about my treatment choices.”'},
    {name:'A patient',quote:'“The appointment felt calm and considered. I had time to ask questions and understand the options available to me.”'},
    {name:'A patient',quote:'“I appreciated the clear communication and the kind way the team helped me feel at ease.”'}
  ];let reviewIndex=0;
  function moveReview(d){reviewIndex=(reviewIndex+d+reviews.length)%reviews.length;const r=reviews[reviewIndex];$('#reviewName').textContent=r.name;$('#reviewQuote').textContent=r.quote;$('#reviewCount').textContent=`${String(reviewIndex+1).padStart(2,'0')} / ${String(reviews.length).padStart(2,'0')}`;const card=$('.review-card');card.style.transform='translateY(8px)';card.style.opacity='.4';requestAnimationFrame(()=>{card.style.transform='translateY(0)';card.style.opacity='1'})}
  $('#reviewPrev')?.addEventListener('click',()=>moveReview(-1));$('#reviewNext')?.addEventListener('click',()=>moveReview(1));

  // Virtual tour preview interaction
  $('#tourButton')?.addEventListener('click',()=>{const b=$('#tourButton'),p=$('.tour-overlay p');if(b.dataset.open==='true'){b.dataset.open='false';b.textContent='▶';p.textContent='Explore the space where care feels different.'}else{b.dataset.open='true';b.textContent='×';p.textContent='Tour preview: replace this with your clinic video or 360° walkthrough.'}});

  // Appointment enquiry: prepares an email, does not save or transmit the form.
  $('#bookingForm')?.addEventListener('submit',e=>{
    e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const d=new FormData(form);
    const subject=encodeURIComponent('Appointment request — Salva Dental Studio');
    const body=encodeURIComponent(`Name: ${d.get('name')}\\nPhone: ${d.get('phone')}\\nPreferred date: ${d.get('date')||'Flexible'}\\nService: ${d.get('service')}\\nMessage: ${d.get('message')||'None'}\\n\\nPlease contact me to arrange an appointment.`);
    $('#formStatus').textContent='Opening your email app. Send the prepared email to complete your request.';
    location.href=`mailto:hello@example.com?subject=${subject}&body=${body}`;
  });
  $('#year').textContent=new Date().getFullYear();

  // Decorative Three.js hero object; content remains usable without WebGL/CDN.
  function initHero3D(){
    if(!window.THREE||reduced)return;const host=$('#home'),canvas=$('#heroCanvas');if(!host||!canvas)return;
    try{
      const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(host.clientWidth,host.clientHeight);
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,host.clientWidth/host.clientHeight,.1,100);camera.position.z=8;
      const group=new THREE.Group();scene.add(group);
      group.add(new THREE.Mesh(new THREE.TorusKnotGeometry(1.05,.012,110,7,2,3),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.15})));
      const ring=new THREE.Mesh(new THREE.TorusGeometry(1.7,.008,5,110),new THREE.MeshBasicMaterial({color:0xbfd3ff,transparent:true,opacity:.32}));ring.rotation.x=1.1;ring.rotation.y=.4;group.add(ring);group.position.set(2.2,1.1,-1.3);
      let px=0,py=0,tx=0,ty=0,raf=0,running=true;
      host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*.25;ty=((e.clientY-r.top)/r.height-.5)*.18},{passive:true});
      function draw(){if(!running)return;raf=requestAnimationFrame(draw);px+=(tx-px)*.025;py+=(ty-py)*.025;group.rotation.y+=.0015;group.rotation.x=py;group.rotation.z=px;renderer.render(scene,camera)}draw();
      addEventListener('resize',()=>{renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix()});
      document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;cancelAnimationFrame(raf)}else if(!running){running=true;draw()}});
    }catch(err){console.warn('Decorative Three.js animation skipped; website layout remains available.',err)}
  }
  if(window.THREE)initHero3D();else addEventListener('load',initHero3D,{once:true});
})();