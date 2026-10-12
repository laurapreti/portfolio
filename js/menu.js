/* ===================================================================
   Menu mobile (sotto i 720px)

   Nell'header serve solo il pulsante:
     <button type="button" class="menu-toggle nav:hidden" aria-expanded="false" aria-controls="menu-mobile" aria-label="Apri il menu">
       <span class="menu-toggle__bar"></span><span class="menu-toggle__bar"></span><span class="menu-toggle__bar"></span>
     </button>
   Il pannello lo crea lo script copiando i link del menu desktop ([data-menu-links]):
   così le voci si modificano in un solo punto per pagina.

   Si chiude con: Esc, clic su una voce, clic fuori dal pannello, allargando la finestra oltre i 720px.
   Stili: "Menu mobile" in css/input.css
   =================================================================== */
(function () {
  var btn = document.querySelector('.menu-toggle');
  var source = document.querySelector('[data-menu-links]');
  var header = btn && btn.closest('header');
  if (!btn || !source || !header) return;

  // Pannello con le stesse voci del menu desktop
  var panel = document.createElement('nav');
  panel.id = 'menu-mobile';
  panel.className = 'mobile-menu';
  panel.setAttribute('aria-label', 'Menu principale');
  panel.hidden = true;
  var list = document.createElement('ul');
  list.className = 'mobile-menu__list';
  Array.prototype.forEach.call(source.querySelectorAll('a'), function (a) {
    var li = document.createElement('li');
    var link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    if (a.getAttribute('aria-current')) link.setAttribute('aria-current', a.getAttribute('aria-current'));
    li.appendChild(link);
    list.appendChild(li);
  });
  panel.appendChild(list);
  header.appendChild(panel);

  var mq = window.matchMedia('(min-width: 45rem)');

  function open() {
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Chiudi il menu');
    var first = panel.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }
  function close(returnFocus) {
    if (panel.hidden) return;
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Apri il menu');
    if (returnFocus) btn.focus({ preventScroll: true });
  }

  btn.addEventListener('click', function () { panel.hidden ? open() : close(false); });

  // Una voce scelta: chiude (anche per i link alle sezioni della stessa pagina)
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) close(true);
  });

  // Clic fuori da header e pannello
  document.addEventListener('click', function (e) {
    if (!panel.hidden && !header.contains(e.target)) close(false);
  });

  // Oltre i 720px il menu mobile sparisce: lo riporto allo stato chiuso
  var onChange = function () { if (mq.matches) close(false); };
  if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
})();
