/* Constructora RM · efectos. Lee las clases de los bloques: podés editar, duplicar o borrar secciones sin romper nada. */
(function () {
  var d = document, root = d.documentElement, $$ = function (s, c) { return [].slice.call((c || d).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('rm-js');
  requestAnimationFrame(function () { setTimeout(function () { root.classList.add('is-ready'); }, 60); });

  /* encabezado y avance de obra */
  var top = d.querySelector('.rm-top'), bar = d.querySelector('.rm-progress'), fill = bar && bar.querySelector('i'), lbl = bar && bar.querySelector('b');
  var tl = $$('.timeline');
  function onScroll() {
    var y = scrollY, h = root.scrollHeight - innerHeight, p = h > 0 ? Math.min(100, Math.round(y / h * 100)) : 0;
    if (top) top.classList.toggle('is-scrolled', y > 40 || !d.querySelector('.hero'));
    if (fill) { fill.style.width = p + '%'; lbl.textContent = (p >= 100 ? 'Obra terminada ' : 'Avance de obra ') + p + ' %'; bar.classList.toggle('is-on', y > 200); }
    tl.forEach(function (t) {
      var r = t.getBoundingClientRect(), k = Math.max(0, Math.min(1, (innerHeight * .75 - r.top) / (r.height + innerHeight * .25)));
      t.style.setProperty('--fill', (k * 100) + '%');
      $$('.etapa', t).forEach(function (e, i, a) { e.classList.toggle('is-on', k >= i / a.length + .01 || k >= .99); });
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

  /* marquesina: repite el texto para que no tenga cortes */
  $$('.rm-marquee').forEach(function (m) {
    var p = m.querySelector('p'); if (!p || p.querySelector('.track')) return;
    var parts = p.textContent.split('·').map(function (s) { return s.trim(); }).filter(Boolean), html = '';
    for (var r = 0; r < 4; r++) parts.forEach(function (s) { html += '<span>' + s.replace(/</g, '&lt;') + ' ·</span>'; });
    p.innerHTML = '<span class="track">' + html + '</span>'; p.setAttribute('aria-label', parts.join(', '));
  });

  /* cotas: líneas de medida sobre las fotos */
  function cota(box, txt, css) {
    if (box.querySelector('.rm-cota')) return;
    var c = d.createElement('span'); c.className = 'rm-cota'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<i></i><b>' + (txt || '8,60 m') + '</b>';
    c.style.cssText = css || 'left:8%;right:8%;top:30px;height:0';
    box.appendChild(c);
    if (!reduce && c.animate) c.animate([{ clipPath: 'inset(-30px 50% -30px 50%)' }, { clipPath: 'inset(-30px 0 -30px 0)' }], { duration: 1200, easing: 'cubic-bezier(.22,1,.36,1)' });
  }
  var hero = d.querySelector('.hero');
  if (hero && innerWidth > 900) setTimeout(function () { cota(hero, 'Fachada 14,20 m', 'right:6%;width:34%;top:calc(var(--top-h) + 70px);height:0'); }, 900);

  /* títulos que aparecen palabra por palabra (solo en pantalla: el texto guardado no cambia) */
  if (!reduce) $$('.sec-title,.hero-title').forEach(function (h) {
    var n = 0, isHero = h.classList.contains('hero-title');
    (function walk(el) {
      [].slice.call(el.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = d.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { f.appendChild(d.createTextNode(t)); return; }
            var w = d.createElement('span'), i = d.createElement('i'); w.className = 'w'; i.textContent = t;
            i.style.transitionDelay = ((isHero ? 250 : 0) + (n++) * 55) + 'ms'; w.appendChild(i); f.appendChild(w);
          });
          c.parentNode.replaceChild(f, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(h);
  });

  /* plano de la casa que se dibuja sobre la portada */
  var heroBox = d.querySelector('.hero');
  if (heroBox && innerWidth > 900) {
    heroBox.insertAdjacentHTML('beforeend', '<svg class="rm-plano" viewBox="0 0 640 360" aria-hidden="true">' +
      '<line pathLength="1" x1="0" y1="340" x2="640" y2="340"/>' +
      '<path pathLength="1" d="M80 340V170h480v170"/><path pathLength="1" d="M60 170L180 90h280l120 80"/>' +
      '<path pathLength="1" d="M140 90V40h50v50"/><rect pathLength="1" x="130" y="210" width="70" height="90"/><rect pathLength="1" x="285" y="230" width="70" height="110"/>' +
      '<rect pathLength="1" x="440" y="210" width="70" height="90"/><path pathLength="1" d="M80 120V60M560 120V60M80 70h480"/></svg>');
    $$('.rm-plano [pathLength]', heroBox).forEach(function (e, i) { e.style.animationDelay = (0.6 + i * 0.25) + 's'; });
  }

  /* parallax suave en las fotos */
  var par = $$('.obra-img img,.about-img img,.bs-img img');
  if (!reduce && par.length) {
    var tick = false;
    var pr = function () {
      tick = false;
      par.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        im.style.setProperty('--py', (((r.top + r.height / 2 - innerHeight / 2) / innerHeight) * -6).toFixed(2) + '%');
      });
    };
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(pr); } }, { passive: true }); pr();
  }

  /* aparición al hacer scroll + contadores */
  var rise = $$('.sec-title,.sec-head,.testi,.faq-list details,.svc,.obra,.stat,.etapa,.val,.rm-form,.about-media,.bs-img,.ba,.quote-line');
  function count(el) {
    var m = el.textContent.match(/^(\D*)(\d+)(.*)$/); if (!m || reduce) return;
    var to = +m[2], t0 = null;
    (function f(t) { t0 = t0 || t; var k = Math.min(1, (t - t0) / 1400); el.textContent = m[1] + Math.round(to * (1 - Math.pow(1 - k, 3))) + m[3]; if (k < 1) requestAnimationFrame(f); })(performance.now());
  }
  if ('IntersectionObserver' in window && !reduce) {
    rise.forEach(function (el, i) { el.classList.add('rise'); el.style.transitionDelay = ((i % 4) * 80) + 'ms'; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; e.target.classList.add('is-in'); io.unobserve(e.target);
        var n = e.target.querySelector('.stat-n'); if (n) count(n);
        if (e.target.matches('.about-media')) cota(e.target);
      });
    }, { threshold: .18, rootMargin: '0px 0px -40px 0px' });
    rise.forEach(function (el) { io.observe(el); });
  } else {
    $$('.about-media').forEach(function (b) { cota(b); });
  }

  /* antes y después */
  $$('.ba').forEach(function (ba) {
    if (!ba.querySelector('.ba-before')) return;
    var h = d.createElement('span'); h.className = 'ba-handle'; h.setAttribute('role', 'slider'); h.tabIndex = 0;
    h.setAttribute('aria-label', 'Comparar obra en curso y casa terminada'); h.setAttribute('aria-valuemin', '0'); h.setAttribute('aria-valuemax', '100');
    h.innerHTML = '<span>◀ ▶</span>'; ba.appendChild(h);
    var pos = 55, drag = false;
    function set(v) { pos = Math.max(0, Math.min(100, v)); ba.style.setProperty('--pos', pos + '%'); h.setAttribute('aria-valuenow', Math.round(pos)); }
    function at(e) { var r = ba.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    ba.addEventListener('pointerdown', function (e) { drag = true; at(e); if (ba.setPointerCapture) ba.setPointerCapture(e.pointerId); });
    ba.addEventListener('pointermove', function (e) { if (drag) at(e); });
    addEventListener('pointerup', function () { drag = false; });
    h.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { set(pos - 5); e.preventDefault(); } if (e.key === 'ArrowRight') { set(pos + 5); e.preventDefault(); } });
    set(55);
    $$('img', ba).forEach(function (i) { i.draggable = false; });
  });

  /* formulario a WhatsApp */
  $$('form.rm-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (n) { var x = f.elements[n]; return x ? x.value.trim() : ''; }, err = f.querySelector('.rm-form__err');
      if (!g('nombre')) { if (err) err.hidden = false; if (f.elements.nombre) f.elements.nombre.focus(); return; }
      if (err) err.hidden = true;
      var msg = (f.dataset.intro || 'Hola, quiero consultar por un proyecto.') + '\n\nNombre: ' + g('nombre') + '\nTipo de obra: ' + g('tipo') + (g('zona') ? '\nZona: ' + g('zona') : '') + (g('mensaje') ? '\nProyecto: ' + g('mensaje') : '');
      window.open('https://wa.me/' + (f.dataset.whatsapp || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  });

  /* anclas suaves (compensa el encabezado fijo) */
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]'); if (!a) return;
    var u = new URL(a.href, location.href); if (u.pathname !== location.pathname || !u.hash || u.hash === '#') return;
    var t = d.getElementById(decodeURIComponent(u.hash.slice(1))); if (!t) return;
    var x = a.closest('.is-menu-open') && d.querySelector('.is-menu-open .wp-block-navigation__responsive-container-close'); if (x) x.click();
    e.preventDefault(); scrollTo({ top: t.getBoundingClientRect().top + scrollY - (top ? top.offsetHeight : 0) + 2, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', u.hash);
  });
})();
