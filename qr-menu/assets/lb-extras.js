/* La Betulla site extras: booking sheet, WhatsApp button, events feed, add-to-calendar.
   Shared by index.html, events.html, oysters.html. Data lives in /events.json. */
(function () {
  var WA = '6287783977753';
  var TZ = '+08:00'; // Bali (WITA)

  /* ---------- styles ---------- */
  var css = '\
.lbx-fab{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:60;width:54px;height:54px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 22px -8px rgba(0,0,0,.45);text-decoration:none}\
.lbx-fab svg{width:28px;height:28px}\
.lbx-ov{position:fixed;inset:0;z-index:90;background:rgba(14,26,44,.55);display:flex;align-items:flex-end;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s}\
.lbx-ov.open{opacity:1;pointer-events:auto}\
.lbx-sheet{width:100%;max-width:430px;background:#fff;color:#1E3F73;border-radius:22px 22px 0 0;padding:22px 20px calc(22px + env(safe-area-inset-bottom,0px));font-family:Manrope,system-ui,sans-serif;transform:translateY(30px);transition:transform .25s;max-height:92vh;overflow:auto}\
.lbx-ov.open .lbx-sheet{transform:none}\
.lbx-sheet h3{font-family:Caprasimo,serif;font-weight:400;font-size:32px;margin:0 0 4px;line-height:1}\
.lbx-sheet .lbx-sub{font-size:14px;opacity:.7;margin:0 0 16px}\
.lbx-x{float:right;border:0;background:#EEF4FB;color:#1E3F73;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer}\
.lbx-f{display:grid;grid-template-columns:1fr 1fr;gap:10px}\
.lbx-f label{display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#1E3F73}\
.lbx-f label.w{grid-column:1/-1}\
.lbx-f input,.lbx-f select,.lbx-f textarea{font:500 16px Manrope,system-ui,sans-serif;color:#1E3F73;background:#EEF4FB;border:1.5px solid transparent;border-radius:12px;padding:12px;min-width:0;width:100%;box-sizing:border-box;text-transform:none;letter-spacing:0}\
.lbx-f input:focus,.lbx-f select:focus,.lbx-f textarea:focus{outline:none;border-color:#2F6DB5}\
.lbx-seat{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px}\
.lbx-seat button{border:1.5px solid #A9C6EA;background:#fff;color:#1E3F73;border-radius:999px;padding:9px 14px;font:600 14px Manrope,sans-serif;cursor:pointer}\
.lbx-seat button.on{background:#1E3F73;border-color:#1E3F73;color:#fff}\
.lbx-err{grid-column:1/-1;color:#C0392B;font-size:13px;min-height:1em}\
.lbx-go{grid-column:1/-1;border:0;border-radius:999px;background:#25D366;color:#fff;font:700 16px Manrope,sans-serif;padding:16px;cursor:pointer;display:flex;gap:8px;align-items:center;justify-content:center}\
.lbx-go svg{width:20px;height:20px}\
.lbx-alt{grid-column:1/-1;text-align:center;font-size:13px;opacity:.7}\
.lbx-alt a{color:#2F6DB5}\
';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z"/></svg>';

  function track(name, params) { try { if (window.gtag) gtag('event', name, params || {}); } catch (e) {} }
  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }

  /* Bali "today" as YYYY-MM-DD */
  function baliToday() {
    var d = new Date(Date.now() + 8 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- floating WhatsApp ---------- */
  if (!document.querySelector('.lbx-fab')) {
    var fab = document.createElement('a');
    fab.className = 'lbx-fab'; fab.href = waLink("Hi La Betulla! "); fab.target = '_blank'; fab.rel = 'noreferrer';
    fab.setAttribute('aria-label', 'Message us on WhatsApp'); fab.innerHTML = WA_SVG;
    fab.addEventListener('click', function () { track('whatsapp_click', { place: 'fab' }); });
    document.body.appendChild(fab);
  }

  /* ---------- booking sheet ---------- */
  var ov = document.createElement('div');
  ov.className = 'lbx-ov'; ov.setAttribute('aria-hidden', 'true');
  var times = [];
  for (var h = 10; h <= 22; h++) { times.push(pad(h) + ':00'); if (h < 22) times.push(pad(h) + ':30'); }
  ov.innerHTML = '<div class="lbx-sheet" role="dialog" aria-modal="true" aria-labelledby="lbxT">' +
    '<button class="lbx-x" type="button" aria-label="Close">✕</button>' +
    '<h3 id="lbxT">Book a table</h3><p class="lbx-sub">Tue – Sun · 10:00 – 23:00 · we confirm on WhatsApp</p>' +
    '<form class="lbx-f" novalidate>' +
    '<label>Date<input type="date" name="date" required></label>' +
    '<label>Time<select name="time">' + times.map(function (t) { return '<option' + (t === '18:00' ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label>' +
    '<label>Guests<select name="guests">' + [1,2,3,4,5,6,7,8,9,10,11,12].map(function (n) { return '<option' + (n === 2 ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '<option>13+</option></select></label>' +
    '<label>Name<input type="text" name="name" autocomplete="given-name" placeholder="Your name"></label>' +
    '<div class="lbx-seat" role="group" aria-label="Seating">' +
      ['Sunset rice-field view', 'Garden', 'Indoor', 'Any table'].map(function (s, i) { return '<button type="button" class="' + (i === 0 ? 'on' : '') + '">' + s + '</button>'; }).join('') +
    '</div>' +
    '<label class="w">Occasion or note<textarea name="note" rows="2" placeholder="Birthday, high chair, Oyster Hour…"></textarea></label>' +
    '<div class="lbx-err" aria-live="polite"></div>' +
    '<button class="lbx-go" type="submit">' + WA_SVG + 'Send request on WhatsApp</button>' +
    '<div class="lbx-alt">Prefer to call? <a href="tel:+6287783977753">+62 877-8397-7753</a></div>' +
    '</form></div>';
  document.body.appendChild(ov);

  var form = ov.querySelector('form');
  var dateIn = form.elements.date;
  var seat = 'Sunset rice-field view';
  dateIn.min = baliToday();
  ov.querySelectorAll('.lbx-seat button').forEach(function (b) {
    b.addEventListener('click', function () {
      ov.querySelectorAll('.lbx-seat button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on'); seat = b.textContent;
    });
  });
  function openBook(prefill) {
    if (!dateIn.value) dateIn.value = baliToday();
    if (prefill && prefill.note) form.elements.note.value = prefill.note;
    if (prefill && prefill.date) dateIn.value = prefill.date;
    if (prefill && prefill.time) form.elements.time.value = prefill.time;
    ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false');
    track('booking_open', { source: (prefill && prefill.source) || 'button' });
  }
  function closeBook() { ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); }
  ov.addEventListener('click', function (e) { if (e.target === ov) closeBook(); });
  ov.querySelector('.lbx-x').addEventListener('click', closeBook);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeBook(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = ov.querySelector('.lbx-err'); err.textContent = '';
    var d = dateIn.value;
    if (!d) { err.textContent = 'Please choose a date.'; return; }
    if (d < baliToday()) { err.textContent = 'That date has passed.'; return; }
    var day = new Date(d + 'T12:00:00' + TZ).getUTCDay();
    if (day === 1) { err.textContent = 'We are closed on Mondays. Please pick another day.'; return; }
    var nice = new Date(d + 'T12:00:00' + TZ).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Makassar' });
    var f = form.elements;
    var msg = 'Hi La Betulla! I\'d like to book a table.\n' +
      '📅 ' + nice + ' at ' + f.time.value + '\n' +
      '👥 ' + f.guests.value + ' guest' + (f.guests.value === '1' ? '' : 's') + '\n' +
      '🌿 ' + seat +
      (f.name.value.trim() ? '\n🙋 ' + f.name.value.trim() : '') +
      (f.note.value.trim() ? '\n📝 ' + f.note.value.trim() : '');
    track('booking_submit', { guests: f.guests.value, seating: seat });
    window.open(waLink(msg), '_blank', 'noreferrer');
    closeBook();
  });

  /* any element with data-book opens the sheet (keeps its href as a no-JS fallback) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-book]');
    if (!a) return;
    e.preventDefault();
    openBook({ note: a.getAttribute('data-book-note') || '', date: a.getAttribute('data-book-date') || '', time: a.getAttribute('data-book-time') || '', source: a.getAttribute('data-book') });
  });

  /* ---------- calendar helpers ---------- */
  function evStart(ev) { return new Date(ev.date + 'T' + (ev.time || '19:00') + ':00' + TZ); }
  function stamp(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function gcalLink(ev) {
    var s = evStart(ev), e = new Date(s.getTime() + (ev.duration || 180) * 60000);
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(ev.title + ' · La Betulla') +
      '&dates=' + stamp(s) + '/' + stamp(e) +
      '&details=' + encodeURIComponent((ev.desc || '') + (ev.price ? '\nEntry ' + ev.price : '') + '\nBook: https://www.balibetula.com/events') +
      '&location=' + encodeURIComponent('La Betulla, Jl. Raya Kesambi, Kerobokan, Bali');
  }
  function icsDownload(ev) {
    var s = evStart(ev), e = new Date(s.getTime() + (ev.duration || 180) * 60000);
    var esc = function (t) { return String(t || '').replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n'); };
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//La Betulla//Events//EN', 'BEGIN:VEVENT',
      'UID:' + ev.id + '@balibetula.com', 'DTSTAMP:' + stamp(new Date()), 'DTSTART:' + stamp(s), 'DTEND:' + stamp(e),
      'SUMMARY:' + esc(ev.title + ' · La Betulla'), 'DESCRIPTION:' + esc(ev.desc), 'LOCATION:' + esc('La Betulla, Jl. Raya Kesambi, Kerobokan, Bali'),
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    var a = document.createElement('a'); a.href = url; a.download = ev.id + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* ---------- events feed ---------- */
  function fmtDate(ev) {
    var d = new Date(ev.date + 'T12:00:00' + TZ);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Makassar' });
  }
  function escH(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function load() {
    if (window.__lbEvents) return window.__lbEvents;
    window.__lbEvents = fetch('/events.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (data) {
      var today = baliToday();
      var evs = (data.events || []).slice().sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
      return {
        today: today,
        promos: (data.promos || []).filter(function (p) { return (!p.start || p.start <= today) && (!p.end || p.end >= today); }),
        upcoming: evs.filter(function (e) { return e.date >= today; }),
        past: evs.filter(function (e) { return e.date < today; }).reverse()
      };
    });
    return window.__lbEvents;
  }

  window.LB = {
    load: load, openBook: openBook, gcalLink: gcalLink, icsDownload: icsDownload,
    fmtDate: fmtDate, esc: escH, waLink: waLink, track: track
  };

  /* Home page: replace the static Events cards with the live feed (if container present) */
  var home = document.querySelector('[data-lb-home-events]');
  if (home) {
    load().then(function (d) {
      var items = [];
      d.promos.slice(0, 1).forEach(function (p) {
        items.push('<a class="ev" href="' + escH(p.url || '/events') + '"><img style="object-position:center 78%" src="' + escH(p.image) + '" alt="' + escH(p.title) + '" loading="lazy"/><div class="v"></div>' +
          '<div class="cap"><div class="when">Promo · ' + escH(p.short || p.when) + '</div><b>' + escH(p.title) + '</b><em>' + escH(p.line) + ' · ' + escH(p.price) + (p.old_price ? ' <s style="opacity:.7">' + escH(p.old_price) + '</s>' : '') + '</em></div></a>');
      });
      d.upcoming.slice(0, 3).forEach(function (e) {
        items.push('<a class="ev" href="/events#' + escH(e.id) + '"><img src="' + escH(e.image) + '" alt="' + escH(e.title) + '" loading="lazy"/><div class="v"></div>' +
          '<div class="cap"><div class="when">' + (e.date === d.today ? 'Tonight' : escH(fmtDate(e))) + ' · ' + escH(e.time) + '</div><b>' + escH(e.title) + '</b><em>' + escH(e.desc) + (e.price ? ' · ' + escH(e.price) : '') + '</em></div></a>');
      });
      if (items.length) home.innerHTML = items.join('');
    }).catch(function () { /* keep static fallback cards */ });
  }
})();
