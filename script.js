/* ================== CONFIGURAÇÃO ================== */
// Array de slides com imagem e legenda (substitua os caminhos das imagens pelas suas).
const slides = [
  {img:'images/1.jpg', caption:'Feliz aniversário, meu amor — que seu dia seja tão lindo quanto você ❤️'},
  {img:'images/2.jpg', caption:'O sorriso mais puro que sempre encantou o mundo desde pequenininha 😍'},
  {img:'images/3.jpg', caption:'A beleza nos detalhes, no olhar e no jeito único de ser  💘'},
  {img:'images/4.jpg', caption:'Obrigado por ser minha parceira, minha amiga e meu tudo 💏🏻'},
  {img:'images/5.jpg', caption:'Um raio de sol em forma de mulher, iluminando todos os dias da minha vida ✨'},
  {img:'images/6.jpg', caption:'Até nas expressões mais sérias, sempre carregou uma doçura que não se explica 💕'},
  {img:'images/7.jpg', caption:'Simplesmente você, e isso já é o suficiente para deixar tudo mais bonito 👸🏻'},
  {img:'images/8.jpg', caption:'A heroína mais linda, que desde pequena já mostrava que nasceu para brilhar 🦸🏽‍♀️ - Última página... tem uma surpresinha à vista...'},
  // ✅ Capa final fixa
  {final:true, caption:'Esse é só mais um capítulo da sua história. Que venham muitos outros momentos lindos! Logo mais estarei aí ao seu lado para compartilharmos tudo, juntinhos, pra sempre. ✨'}
];

/* ================== ELEMENTOS ================== */
// Elementos principais onde os slides e progresso serão inseridos dinamicamente
const pagesEl = document.getElementById('pages');
const progressEl = document.getElementById('progress');
const fhc = document.getElementById('floatingHeartContainer');

/* Renderizar páginas dinamicamente com base no array slides */
slides.forEach((s, i) => {
  const page = document.createElement('section');
  page.className = 'page';

  if (s.final) {
    // Se for a capa final
    page.classList.add("final-cover");
    page.innerHTML = `
      <h1>Fim do seu Álbum 💖</h1>
      <p>${s.caption}</p>
    `;
  } else {
    // Se for foto normal
    const photo = document.createElement('div');
    photo.className = 'photo';
    photo.style.backgroundImage = `url(${s.img})`;

    // Parallax
    photo.addEventListener('mousemove', e => {
      const r = photo.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2)/r.width*8;
      const dy = (e.clientY - r.top - r.height/2)/r.height*6;
      photo.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.01)`;
    });
    photo.addEventListener('mouseleave', ()=>photo.style.transform='translate3d(0,0,0) scale(1)');

    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.textContent = s.caption;

    page.appendChild(photo);
    page.appendChild(caption);
  }

  pagesEl.appendChild(page);

  const dot = document.createElement('div');
  dot.className='dot';
  progressEl.appendChild(dot);
});

/* Pegando elementos de navegação (uma vez que já foram criados) */
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const dots = Array.from(document.querySelectorAll('.dot'));

/* helpers para mostrar / esconder botões sem bagunçar layout */
function hideBtn(btn){
  if(!btn) return;
  btn.style.transition='opacity 220ms ease';
  btn.style.opacity='0';
  btn.style.pointerEvents='none';
}
function showBtn(btn){
  if(!btn) return;
  btn.style.transition='opacity 220ms ease';
  btn.style.opacity='1';
  btn.style.pointerEvents='auto';
}

/* ================== ESTADO E NAVEGAÇÃO ================== */
let idx = 0; 
let albumAtivo = false; // controle para não avançar antes da hora

/* Inicial: nav escondida (antes de abrir o álbum) */
if(prevBtn) { prevBtn.style.opacity='0'; prevBtn.style.pointerEvents='none'; }
if(nextBtn) { nextBtn.style.opacity='0'; nextBtn.style.pointerEvents='none'; }
progressEl.style.opacity = 0; // esconder os pontinhos antes de ativar o álbum

const update = (animate=true) => {
  // Se o álbum não estiver ativo, garantir que a capa (HTML) esteja visível e tudo escondido
  if(!albumAtivo){
    pagesEl.style.transition = animate ? 'transform 450ms cubic-bezier(.2,.9,.25,1)' : 'none';
    pagesEl.style.transform = `translateX(0%)`; // mostra a capa que está como primeiro filho no DOM
    // esconder nav/progress/heart
    hideBtn(prevBtn);
    hideBtn(nextBtn);
    progressEl.style.opacity = 0;
    fhc.innerHTML = '';
    return;
  }

  // Quando álbum ativo: idx percorre o array `slides` (os elementos `.page` que criamos via JS)
  const translate = -idx*100;
  pagesEl.style.transition = animate ? 'transform 650ms cubic-bezier(.2,.9,.25,1)' : 'none';
  pagesEl.style.transform = `translateX(${translate}%)`;

  // Dots
  dots.forEach((d,i)=> d.classList.toggle('active', i===idx));
  progressEl.style.opacity = 1;

  // floating heart (aparece só na última página do slides)
  fhc.innerHTML = '';
  if(idx === slides.length -1){
    const float = document.createElement('div');
    float.className='floating-heart';
    float.innerHTML = `<div class="heart">♡</div>`;
    float.title = 'Clique no coração';
    float.addEventListener('click', openModal);
    fhc.appendChild(float);
  }

  // Botões
  if(idx === 0) hideBtn(prevBtn); else showBtn(prevBtn);
  if(idx === slides.length - 1) hideBtn(nextBtn); else showBtn(nextBtn);
};
update(false);

/* Botões de navegação */
prevBtn.addEventListener('click', ()=>{
  if(!albumAtivo) return;
  if(idx>0){ idx--; update(); }
});
nextBtn.addEventListener('click', ()=>{
  if(!albumAtivo) return;
  if(idx<slides.length-1){ idx++; update(); }
});

/* Teclado */
window.addEventListener('keydown', e=>{
  if(!albumAtivo) return;
  if(e.key==='ArrowRight') { if(idx<slides.length-1) idx++; update(); }
  if(e.key==='ArrowLeft') { if(idx>0) idx--; update(); }
});

/* Swipe */
(function addSwipe(){
  let startX=null, startTime=0;
  const vp = document.getElementById('viewport');

  vp.addEventListener('touchstart', e=>{
    startX=e.touches[0].clientX;
    startTime=Date.now();
  });

  vp.addEventListener('touchend', e=>{
    if(!albumAtivo) return;
    if(startX===null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dt = Date.now()-startTime;
    if(Math.abs(dx)>40 && dt<800){
      if(dx<0 && idx<slides.length-1) idx++;
      else if(dx>0 && idx>0) idx--;
      update();
    }
    startX=null;
  });
})();

/* Clique em qualquer página avança para a próxima */
pagesEl.addEventListener('click', ()=>{
  if (!albumAtivo) return; 
  if(idx < slides.length-1) { idx++; update(); }
});

/* ================== MODAL ================== */
const modal = document.getElementById('modal');
const yesBtn = document.getElementById('yes');
const obvioBtn = document.getElementById('obvio');

function openModal(){
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}
function closeModal(){
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
}

/* Celebração final */
function celebrate(responseText){
  closeModal();

  const overlay = document.createElement('div');
  overlay.style.position='fixed';
  overlay.style.inset=0;
  overlay.style.zIndex=140;
  overlay.style.display='flex';
  overlay.style.alignItems='center';
  overlay.style.justifyContent='center';
  overlay.style.background='radial-gradient(circle at 20% 20%, rgba(255,200,230,0.18), transparent), rgba(0,0,0,0.28)';

  const card = document.createElement('div');
  card.className='modal';
  card.style.maxWidth='780px';
  card.style.textAlign='center';
  card.innerHTML = `<div class='final-msg'>
    <div class='big'>${responseText}</div>
    <div style='font-weight:600;font-family:"Dancing Script",cursive;'>Parabéns amor! Feliz aniversário — eu te amo demais ❤️</div>
  </div>`;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  const confetti = document.createElement('canvas');
  confetti.width=window.innerWidth;
  confetti.height=window.innerHeight;
  confetti.style.position='fixed';
  confetti.style.left=0;
  confetti.style.top=0;
  confetti.style.zIndex=150;
  document.body.appendChild(confetti);

  const ctx = confetti.getContext('2d');
  const pieces=[];
  for(let i=0;i<120;i++){
    pieces.push({
      x:Math.random()*confetti.width,
      y:Math.random()*-confetti.height*0.2,
      vy:1+Math.random()*4,
      rot:Math.random()*Math.PI*2,
      size:6+Math.random()*10,
      spd:Math.random()*2
    });
  }

  let raf=true;
  function loop(){
    ctx.clearRect(0,0,confetti.width,confetti.height);
    for(const p of pieces){
      p.y+=p.vy*p.spd;
      p.x+=Math.sin(p.rot)*2;
      p.rot+=0.03;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle=['#ff6b9a','#ffd1e1','#fff1f5','#ff9cc2'][Math.floor(Math.random()*4)];
      ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
      ctx.restore();
      if(p.y>confetti.height+20) p.y=-10;
    }
  }
  const af = ()=>{if(!raf) return;loop();requestAnimationFrame(af)};
  af();

  setTimeout(()=>{raf=false;confetti.remove();},7000);

  overlay.addEventListener('click', ()=>overlay.remove());
}

yesBtn.addEventListener('click', ()=>celebrate('Eba! Agora somos oficilamente namorados❤️'));
obvioBtn.addEventListener('click', ()=>celebrate('Óbvio que você iria aceitar, né... Agora é oficial😍'));

/* ================== CAIXINHA DE SENHA (UNIFICADA E CORRIGIDA) ================== */
const passwordModal = document.getElementById("passwordModal");
const passwordInput = document.getElementById("passwordInput");
const passwordSubmit = document.getElementById("passwordSubmit");
const passwordError = document.getElementById("passwordError");
const startBtn = document.getElementById("startAlbum");

startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  passwordModal.classList.add("show");
  passwordModal.setAttribute("aria-hidden", "false");
  passwordInput.value = "";
  passwordError.style.display = "none";
  passwordInput.focus();
});

/* Listener único: valida senha e inicia o álbum corretamente */
passwordSubmit.addEventListener("click", () => {
  const senha = passwordInput.value.trim();
  const senhaCorreta = "0410"; // coloque aqui a senha correta

  if (senha === senhaCorreta) {
    // fechar modal
    passwordModal.classList.remove("show");
    passwordModal.setAttribute("aria-hidden", "true");

    // remover a capa estática do DOM (assim os slides começam do índice 0 corretamente)
    const coverEl = document.querySelector('.page.cover');
    if (coverEl) coverEl.remove();

    // mostrar navegação e ativar álbum
    const nav = document.querySelector('.nav');
    if (nav) nav.style.display = 'flex';
    albumAtivo = true;
    idx = 0;
    update(false);     
  } else {
    // senha incorreta
    passwordError.style.display = "block";
    passwordError.classList.remove("shake"); // reinicia animação
    void passwordError.offsetWidth;          // força reflow
    passwordError.classList.add("shake");
    passwordInput.value = "";
    passwordInput.focus();
  }
});

/* Botão reiniciar (se existir) */
document.addEventListener("DOMContentLoaded", () => {
  const restartBtn = document.getElementById("restartAlbum");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      const pages = document.querySelector(".pages");
      if (pages) {
        pages.scrollTo({ left: 0, behavior: "smooth" });
      }
    });
  }
});
/* ================== ÁUDIO DE FUNDO ================== */
const bgMusic = new Audio("music/fundo.mp3"); // caminho da música
bgMusic.loop = false; // não vamos usar o loop automático
bgMusic.volume = 0.6;

// Quando a música terminar, reinicia
bgMusic.addEventListener("ended", () => {
  bgMusic.currentTime = 0; // volta pro início
  bgMusic.play(); // toca novamente
});

// Criar botão de controle de música
const musicBtn = document.createElement("button");
musicBtn.innerHTML = "🎵"; // ícone de nota musical
musicBtn.title = "Play/Pause música";
musicBtn.style.position = "fixed";
musicBtn.style.bottom = "20px";
musicBtn.style.right = "20px";
musicBtn.style.zIndex = "200";
musicBtn.style.padding = "10px 14px";
musicBtn.style.fontSize = "22px";
musicBtn.style.border = "none";
musicBtn.style.borderRadius = "50%";
musicBtn.style.cursor = "pointer";
musicBtn.style.background = "#ff6b9a";
musicBtn.style.color = "#fff";
musicBtn.style.boxShadow = "0 3px 6px rgba(0,0,0,0.3)";
musicBtn.style.display = "none"; // escondido até senha correta
document.body.appendChild(musicBtn);

// Alternar play/pause ao clicar no botão
musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicBtn.innerHTML = "⏸️"; // muda ícone
  } else {
    bgMusic.pause();
    musicBtn.innerHTML = "🎵";
  }
});

/* Listener único: valida senha e inicia o álbum corretamente */
passwordSubmit.addEventListener("click", () => {
  const senha = passwordInput.value.trim();
  const senhaCorreta = "0410"; // coloque aqui a senha correta

  if (senha === senhaCorreta) {
    // fechar modal
    passwordModal.classList.remove("show");
    passwordModal.setAttribute("aria-hidden", "true");

    // remover a capa estática do DOM
    const coverEl = document.querySelector('.page.cover');
    if (coverEl) coverEl.remove();

    // mostrar navegação e ativar álbum
    const nav = document.querySelector('.nav');
    if (nav) nav.style.display = 'flex';
    albumAtivo = true;
    idx = 0;
    update(false);

    // iniciar música automaticamente
    bgMusic.play().then(() => {
      musicBtn.innerHTML = "⏸️";
    }).catch(err => {
      console.log("Autoplay bloqueado, use o botão para iniciar:", err);
      musicBtn.innerHTML = "🎵";
    });

    // mostrar botão de controle
    musicBtn.style.display = "block";

  } else {
    // senha incorreta
    passwordError.style.display = "block";
    passwordError.classList.remove("shake");
    void passwordError.offsetWidth;
    passwordError.classList.add("shake");
    passwordInput.value = "";
    passwordInput.focus();
  }
});


