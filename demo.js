(() => {
  'use strict';
  const cases = window.SCENARIO_DEMO.cases;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const container = document.querySelector('#event-examples');
  container.innerHTML = cases.map(c => `<article class="event-example" data-example="${c.id}">
    <div class="event-copy"><div class="event-number">${c.number}<span>${esc(c.domain.toUpperCase())}</span></div>
    <h3>${esc(c.shortTitle)}</h3>
    <p class="event-location">${esc(c.brand)}</p></div>
    <div class="event-visual"><figure class="denoising-figure">
      <video class="denoising-loop" muted loop playsinline preload="metadata" poster="assets/${c.id}-denoising.jpg" aria-label="${esc(c.domain)}: denoising, anchor guidance with a persistent ground-truth reference"><source src="assets/${c.id}-denoising.mp4" type="video/mp4"></video>
      <figcaption>${esc(c.cutoff)}</figcaption>
    </figure>
    <a class="event-source" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.source)} / ${esc(c.published.split(' / ')[0])} &#8599;</a>
    <div class="event-actions"><button type="button" class="text-button toggle-loop" aria-pressed="false">Play animation</button><button type="button" class="text-button" data-clip="${c.id}">Watch walkthrough &#8599;</button></div>
    </div>
  </article>`).join('');
  const loops = [...document.querySelectorAll('.denoising-loop')];
  const sync = video => {
    const button = video.closest('article').querySelector('.toggle-loop');
    button.textContent = video.paused ? 'Play animation' : 'Pause animation';
    button.setAttribute('aria-pressed', String(!video.paused));
  };
  const play = video => video.play().catch(() => { if (video.matches('.denoising-loop')) sync(video); });
  loops.forEach(video => {
    video.muted = true;
    video.addEventListener('play', () => sync(video));
    video.addEventListener('pause', () => sync(video));
    video.closest('article').querySelector('.toggle-loop').addEventListener('click', () => {
      video.dataset.manual = 'true';
      if (video.paused) play(video); else video.pause();
    });

  });
  const observer = new IntersectionObserver(entries => entries.forEach(({target:video,isIntersecting}) => {
    if (!isIntersecting) video.pause();
    else if (!reduced.matches && !video.dataset.manual) play(video);
  }), {threshold:.35});
  loops.forEach(video => observer.observe(video));
  reduced.addEventListener('change', () => { if (reduced.matches) loops.forEach(video => video.pause()); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) loops.forEach(video => video.pause()); });
  const film = document.querySelector('#presentation-video');
  document.querySelectorAll('[data-seek]').forEach(button => button.addEventListener('click', () => {
    const seek = () => { film.currentTime = Number(button.dataset.seek); play(film); };
    if (film.readyState >= 1) seek(); else { film.addEventListener('loadedmetadata', seek, {once:true}); film.load(); }
  }));
  film.addEventListener('timeupdate', () => {
    const buttons = [...document.querySelectorAll('[data-seek]')];
    buttons.forEach((b,i) => b.classList.toggle('active', film.currentTime >= Number(b.dataset.seek) && (!buttons[i+1] || film.currentTime < Number(buttons[i+1].dataset.seek))));
  });
  const dialog = document.querySelector('#clip-dialog'), clip = document.querySelector('#clip-video');
  let opener;
  document.querySelectorAll('[data-clip]').forEach(button => button.addEventListener('click', () => {
    opener = button; const c = cases.find(c => c.id === button.dataset.clip);
    film.pause(); loops.forEach(video => video.pause());
    document.querySelector('#clip-title').textContent = c.domain + ' / ' + c.shortTitle;
    clip.src = 'assets/' + c.id + '-loop.mp4'; clip.poster = 'assets/' + c.id + '-poster.jpg';
    clip.load(); dialog.showModal(); clip.play().catch(() => {});
  }));
  document.querySelector('#close-clip').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { clip.pause(); opener?.focus(); });
})();
