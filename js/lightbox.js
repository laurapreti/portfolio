/* ===================================================================
   Lightbox — galleria a schermo intero per gli screenshot dei progetti

   Uso nell'HTML: avvolgi ogni immagine in un link all'immagine grande,
   con lo stesso nome di gruppo in data-lightbox:

     <a href="img/progetto/screen.jpg" data-lightbox="progetto" class="lightbox-thumb">
       <img src="img/progetto/screen.jpg" alt="Didascalia mostrata nella lightbox">
     </a>

   - La didascalia è l'alt dell'immagine (oppure data-caption sul link).
   - Senza JavaScript il link apre comunque l'immagine.
   - Comandi: frecce ← → , Esc per chiudere, swipe su touch, clic fuori dall'immagine.
   Stili: .lightbox in css/input.css
   =================================================================== */
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox]'));
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;

  var ICON = {
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    prev:  '<path d="M15 5l-7 7 7 7"/>',
    next:  '<path d="M9 5l7 7-7 7"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" class="icon-line">' + ICON[name] + '</svg>';
  }

  // Finestra creata una sola volta, condivisa da tutti i gruppi della pagina
  var dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Galleria immagini');
  dlg.innerHTML =
    '<figure class="lightbox__figure">' +
      '<img class="lightbox__img" alt="">' +
      '<figcaption class="lightbox__caption"></figcaption>' +
    '</figure>' +
    '<p class="lightbox__counter" aria-live="polite"></p>' +
    '<button type="button" class="lightbox__btn lightbox__close" aria-label="Chiudi galleria">' + icon('close') + '</button>' +
    '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Immagine precedente">' + icon('prev') + '</button>' +
    '<button type="button" class="lightbox__btn lightbox__next" aria-label="Immagine successiva">' + icon('next') + '</button>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector('.lightbox__img');
  var caption = dlg.querySelector('.lightbox__caption');
  var counter = dlg.querySelector('.lightbox__counter');
  var btnPrev = dlg.querySelector('.lightbox__prev');
  var btnNext = dlg.querySelector('.lightbox__next');
  var group = [];
  var index = 0;
  var trigger = null;   // miniatura che ha aperto la lightbox: riceve di nuovo il focus alla chiusura

  function captionOf(a) {
    var thumb = a.querySelector('img');
    return a.getAttribute('data-caption') || (thumb ? thumb.alt : '');
  }

  function preload(i) {
    if (group[i]) { var p = new Image(); p.src = group[i].href; }
  }

  function show(i) {
    index = (i + group.length) % group.length;
    var a = group[index];
    img.classList.remove('is-ready');
    img.onload = function () { img.classList.add('is-ready'); };
    img.src = a.href;
    img.alt = captionOf(a);
    caption.textContent = captionOf(a);
    counter.textContent = (index + 1) + ' / ' + group.length;
    var single = group.length < 2;
    btnPrev.hidden = single;
    btnNext.hidden = single;
    counter.hidden = single;
    preload(index + 1);
    preload(index - 1);
  }

  function open(a) {
    var name = a.getAttribute('data-lightbox');
    group = links.filter(function (l) { return l.getAttribute('data-lightbox') === name; });
    trigger = a;
    show(group.indexOf(a));
    dlg.showModal();
  }

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // nuova scheda: comportamento normale
      e.preventDefault();
      open(a);
    });
  });

  btnPrev.addEventListener('click', function () { show(index - 1); });
  btnNext.addEventListener('click', function () { show(index + 1); });
  dlg.querySelector('.lightbox__close').addEventListener('click', function () { dlg.close(); });

  // Clic sullo sfondo (fuori da immagine e pulsanti) chiude
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || e.target.classList.contains('lightbox__figure')) dlg.close();
  });

  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });

  // Swipe orizzontale su touch
  var startX = null;
  dlg.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') startX = e.clientX; });
  dlg.addEventListener('pointerup', function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });

  // Alla chiusura svuota l'immagine (niente "flash" della precedente alla riapertura)
  // L'evento close arriva in modo asincrono: se nel frattempo la lightbox è stata riaperta, non toccare nulla
  dlg.addEventListener('close', function () {
    if (dlg.open) return;
    img.removeAttribute('src');
    if (trigger) trigger.focus({ preventScroll: true });
  });
})();
