
const header=document.querySelector('.site-header');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>40));
const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav-links');
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const filters=document.querySelectorAll('.filters button'),cards=[...document.querySelectorAll('.gallery-card')];
filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;cards.forEach(c=>c.classList.toggle('hidden',f!=='all'&&c.dataset.category!==f));}));
const lightbox=document.querySelector('.lightbox'),lightImg=lightbox.querySelector('img');let activeIndex=0;
function visibleCards(){return cards.filter(c=>!c.classList.contains('hidden'))}
function showAt(i){const list=visibleCards();activeIndex=(i+list.length)%list.length;lightImg.src=list[activeIndex].querySelector('img').src;lightImg.alt=list[activeIndex].querySelector('img').alt}
cards.forEach(c=>c.addEventListener('click',()=>{activeIndex=visibleCards().indexOf(c);showAt(activeIndex);lightbox.showModal()}));
lightbox.querySelector('.lightbox-close').onclick=()=>lightbox.close();lightbox.querySelector('.lightbox-prev').onclick=()=>showAt(activeIndex-1);lightbox.querySelector('.lightbox-next').onclick=()=>showAt(activeIndex+1);lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});document.addEventListener('keydown',e=>{if(!lightbox.open)return;if(e.key==='ArrowLeft')showAt(activeIndex-1);if(e.key==='ArrowRight')showAt(activeIndex+1)});
const glow=document.querySelector('.cursor-glow');window.addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});
document.querySelector('#inquiryForm').addEventListener('submit', function () {const note = document.querySelector('#formNote');note.textContent = "Sending your inquiry...";note.style.color = "#c9a85d";});
// Fix in-page navigation when gallery images are still loading.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const targetId = link.getAttribute('href');

    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    // Close the mobile menu if it is open.
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');

    const scrollToTarget = () => {
      const headerHeight = header ? header.offsetHeight : 0;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        12;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    };

    // Scroll immediately.
    scrollToTarget();

    // Correct the position after lazy-loaded images finish adjusting the page.
    setTimeout(scrollToTarget, 250);
    setTimeout(scrollToTarget, 700);

    history.replaceState(null, '', targetId);
  });
});
