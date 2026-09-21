/* ============================================================
   Wedding invitation — interactions
   · scroll-driven envelope opening
   · live countdown
   · scroll-reveal animations
   · confetti
   · maps / calendar links
   · RSVP form (local only — no server)
   ============================================================ */
(function () {
  "use strict";

  /* ── helpers ────────────────────────────────────────── */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function phase(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  document.addEventListener("DOMContentLoaded", function () {

    var weddingDate = new Date(document.body.dataset.weddingDate || "2026-12-12T16:30:00");
    var venueQuery = document.body.dataset.venueQuery || "";
    var nameEl = document.querySelector("[data-couple-names]") || document.getElementById("rn");
    var coupleNames = ((nameEl && nameEl.textContent) || "Wedding").replace(/\s+/g, " ").trim();

    /* ── confetti ─────────────────────────────────────── */
    var canvas = document.getElementById("confetti-canvas");
    var confettiFired = false;

    function fireConfetti(originX, originY) {
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.opacity = "1";

      var colors = ["#bf8f38", "#d4a85c", "#ecd398", "#a47a2a", "#182849", "#f9f4ed"];
      var startX = originX == null ? canvas.width / 2 : originX;
      var startY = originY == null ? canvas.height * 0.6 : originY;
      var particles = [];

      for (var i = 0; i < 150; i++) {
        particles.push({
          x: startX + (Math.random() - 0.5) * 220,
          y: startY + (Math.random() - 0.5) * 60,
          vx: (Math.random() - 0.5) * 12,
          vy: -Math.random() * 14 - 4,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          spin: (Math.random() - 0.5) * 12
        });
      }

      var frame = 0;
      var maxFrames = 120;

      (function draw() {
        if (frame >= maxFrames) { canvas.style.opacity = "0"; return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function (p) {
          p.x += p.vx; p.vy += 0.25; p.y += p.vy; p.rotation += p.spin;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        });
        frame++;
        requestAnimationFrame(draw);
      })();
    }

    /* ── scroll-driven envelope ───────────────────────── */
    var driver = document.getElementById("sd");
    var flapTop = document.querySelector(".flap--top");
    var flapBottom = document.querySelector(".flap--bottom");
    var flapLeft = document.querySelector(".flap--left");
    var flapRight = document.querySelector(".flap--right");
    var flapShades = $$(".flap-shade");
    var artLeft = document.querySelector(".door-layer--left");
    var artRight = document.querySelector(".door-layer--right");
    var crest = document.querySelector(".reveal-crest");
    var rp = document.getElementById("rp");
    var rn = document.getElementById("rn");
    var rd = document.getElementById("rd");
    var bg = document.getElementById("bg");
    var bgParallax = document.getElementById("bg-parallax-layer");
    var cake = document.getElementById("cakeIllustration");

    /* ── the couple's names, traced on as if written ─────────────────── */
    var pens = $$(".cover-names .pen");
    var namesWritten = false;
    pens.forEach(function (pen) {
      var len = pen.getTotalLength();
      pen.style.strokeDasharray = len;
      pen.style.strokeDashoffset = len;
      pen.dataset.len = len;
    });
    function writeNames() {
      if (namesWritten) return;
      namesWritten = true;
      pens.forEach(function (pen, i) {
        pen.style.transitionDelay = (i * 1.15) + "s";
        pen.style.strokeDashoffset = "0";
      });
    }
    // the names must never be left hidden: if the scroll cue has not fired by
    // the time the cover has been on screen a while, write them anyway
    if (pens.length) {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        pens.forEach(function (pen) { pen.style.transition = "none"; });
        writeNames();
      } else {
        setTimeout(writeNames, 6000);
      }
    }

    function render() {
      if (!driver) return;
      var rect = driver.getBoundingClientRect();
      var total = driver.offsetHeight - window.innerHeight;
      var p = clamp(-rect.top / Math.max(total, 1), 0, 1);

      // all four flaps peel back from the middle, like an envelope opening
      var flapT = easeInOutCubic(phase(p, 0.01, 0.58));
      var leftTurn = "rotateY(" + flapT * -104 + "deg) translateZ(" + flapT * 10 + "px)";
      var rightTurn = "rotateY(" + flapT * 104 + "deg) translateZ(" + flapT * 10 + "px)";
      if (flapTop) flapTop.style.transform = "rotateX(" + flapT * 104 + "deg) translateZ(" + flapT * 10 + "px)";
      if (flapBottom) flapBottom.style.transform = "rotateX(" + flapT * -104 + "deg) translateZ(" + flapT * 10 + "px)";
      if (flapLeft) flapLeft.style.transform = leftTurn;
      if (flapRight) flapRight.style.transform = rightTurn;
      // the crest stays with the flaps instead of fading: each half slides out
      // past the edge of the screen, riding 30px forward so the flaps' own
      // translateZ can never paint over it
      var partT = easeInOutCubic(phase(p, 0.02, 0.62));
      if (artLeft) {
        artLeft.style.transform = "translateZ(30px) translateX(" + partT * -68 + "%) scale(" + (1 - partT * 0.06) + ")";
        artLeft.style.opacity = "1";
      }
      if (artRight) {
        artRight.style.transform = "translateZ(30px) translateX(" + partT * 68 + "%) scale(" + (1 - partT * 0.06) + ")";
        artRight.style.opacity = "1";
      }
      flapShades.forEach(function (el) { el.style.opacity = String(Math.min(1, flapT * 1.35)); });

      // the laurel grows once the envelope is far enough open to see it
      if (crest) crest.classList.toggle("is-grown", flapT > 0.45);

      if (flapT > 0.96 && !confettiFired) {
        confettiFired = true;
        fireConfetti(window.innerWidth / 2, window.innerHeight * 0.74);
      }
      if (flapT < 0.12) confettiFired = false;

      var preT = easeOut(phase(p, 0.32, 0.58));
      var nameT = easeOut(phase(p, 0.40, 0.68));
      var dateT = easeOut(phase(p, 0.48, 0.76));

      if (rp) { rp.style.opacity = String(preT); rp.style.transform = "translateY(" + (1 - preT) * 22 + "px)"; }
      if (rn) { rn.style.opacity = String(nameT); rn.style.transform = "translateY(" + (1 - nameT) * 36 + "px) scale(" + (0.94 + nameT * 0.06) + ")"; }
      // the names write themselves on as they fade in, not before
      if (nameT > 0.06) writeNames();
      if (rd) { rd.style.opacity = String(dateT); rd.style.transform = "translateY(" + (1 - dateT) * 20 + "px)"; }

      if (cake) {
        var cakeT = easeOut(phase(p, 0.38, 0.72));
        cake.style.opacity = String(Math.max(0.15, cakeT));
        cake.style.transform = "translateY(" + (1 - cakeT) * 28 + "px) scale(" + (0.82 + cakeT * 0.22) + ")";
      }

      var bgShift = p * -42;
      if (bg) bg.style.transform = "translateY(" + bgShift + "px)";
      if (bgParallax) bgParallax.style.transform = "translateY(" + bgShift * 0.55 + "px) scale(" + (1 + p * 0.04) + ")";
    }

    window.addEventListener("scroll", render, { passive: true });
    window.addEventListener("resize", render);
    render();

    /* ── love story: revealed on request, then plays itself ───────────── */
    var storyToggle = document.getElementById("storyToggle");
    var loveStory = document.getElementById("loveStory");
    if (storyToggle && loveStory) {
      storyToggle.addEventListener("click", function () {
        loveStory.classList.add("is-open");
        storyToggle.classList.add("is-done");
        storyToggle.setAttribute("aria-expanded", "true");

        var steps = $$("#loveStory .story-item");
        var program = document.getElementById("dayProgram");
        var timers = [];
        var STEP = 2600;

        // any deliberate scroll hands control back to the reader
        function stop() {
          timers.forEach(clearTimeout);
          window.removeEventListener("wheel", stop);
          window.removeEventListener("touchstart", stop);
          window.removeEventListener("keydown", stop);
        }
        window.addEventListener("wheel", stop, { passive: true });
        window.addEventListener("touchstart", stop, { passive: true });
        window.addEventListener("keydown", stop);

        steps.forEach(function (step, i) {
          timers.push(setTimeout(function () {
            step.classList.add("visible");
            step.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 420 + i * STEP));
        });

        // ends on the programme and leaves the reader there
        timers.push(setTimeout(function () {
          if (program) program.scrollIntoView({ behavior: "smooth", block: "start" });
          stop();
        }, 420 + steps.length * STEP));
      });
    }

    /* ── countdown ────────────────────────────────────── */
    var cdEls = {
      days: $('[data-cd="days"]'),
      hours: $('[data-cd="hours"]'),
      minutes: $('[data-cd="minutes"]'),
      seconds: $('[data-cd="seconds"]')
    };

    function tick() {
      var diff = Math.max(weddingDate.getTime() - Date.now(), 0);
      if (cdEls.days) cdEls.days.textContent = pad(Math.floor(diff / 864e5));
      if (cdEls.hours) cdEls.hours.textContent = pad(Math.floor(diff / 36e5) % 24);
      if (cdEls.minutes) cdEls.minutes.textContent = pad(Math.floor(diff / 6e4) % 60);
      if (cdEls.seconds) cdEls.seconds.textContent = pad(Math.floor(diff / 1e3) % 60);
    }
    tick();
    setInterval(tick, 1000);

    /* ── formatted dates ──────────────────────────────── */
    // Always shown in the venue's own time zone, whatever the guest's device is set to.
    var VENUE_TZ = "Africa/Addis_Ababa";
    var longDate = weddingDate.toLocaleDateString("en-US", { timeZone: VENUE_TZ, weekday: "long", month: "long", day: "numeric", year: "numeric" });
    var deadline = new Date(weddingDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toLocaleDateString("en-US", { timeZone: VENUE_TZ, month: "long", day: "numeric", year: "numeric" });

    $$("[data-date-long]").forEach(function (el) { el.textContent = longDate; });
    $$("[data-rsvp-deadline]").forEach(function (el) { el.textContent = deadline; });
    var dotted = weddingDate.toLocaleDateString("en-GB", { timeZone: VENUE_TZ, day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".");
    $$("[data-date-dotted]").forEach(function (el) { el.textContent = dotted; });
    var dotSep = longDate.replace(/,\s*/g, " · ");
    $$("[data-date-dotsep]").forEach(function (el) { el.textContent = dotSep; });


    /* ── wedding-month calendar ───────────────────────── */
    var calGrid = $("[data-cal-grid]");
    if (calGrid) {
      // read the date in the venue's own time zone so the highlighted day is
      // the wedding day there, whatever the guest's device is set to
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: VENUE_TZ, year: "numeric", month: "numeric", day: "numeric"
      }).formatToParts(weddingDate).reduce(function (acc, part) {
        acc[part.type] = part.value; return acc;
      }, {});
      var calYear = Number(parts.year), calMonth = Number(parts.month) - 1, calDay = Number(parts.day);

      var first = new Date(Date.UTC(calYear, calMonth, 1));
      var startDow = first.getUTCDay();
      var daysInMonth = new Date(Date.UTC(calYear, calMonth + 1, 0)).getUTCDate();

      var monthName = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long" }).format(first);
      var dayPadded = String(calDay).padStart(2, "0");
      $$("[data-cal-month]").forEach(function (el) {
        el.textContent = monthName + " " + dayPadded + " " + calYear;
      });

      var cells = "";
      for (var b = 0; b < startDow; b++) cells += '<span class="cal-day is-blank"></span>';
      for (var d = 1; d <= daysInMonth; d++) {
        if (d === calDay) {
          cells += '<span class="cal-day is-wedding" aria-current="date">' +
            '<svg class="cal-flourish" viewBox="0 0 130 40" aria-hidden="true">' +
            '<path class="curl-line" d="M128 24 C 110 34, 86 35, 68 28 C 58 24, 52 19, 46 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
            '<path class="curl-heart" d="M44 14 C 40 8, 32 8, 30 13 C 28 8, 20 8, 18 14 C 16 21, 26 27, 31 31 C 36 27, 46 21, 44 14 Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
            '<path class="curl-tail" d="M17 17 C 12 20, 6 22, 2 21" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
            '</svg>' +
            '<svg class="cal-heart" viewBox="0 0 32 30" aria-hidden="true"><path d="M16 28.5S2.5 19.6 2.5 11.2C2.5 6.3 6.2 3 10.2 3c2.6 0 4.9 1.5 5.8 3.8C16.9 4.5 19.2 3 21.8 3c4 0 7.7 3.3 7.7 8.2 0 8.4-13.5 17.3-13.5 17.3z"/></svg>' +
            '<b>' + d + '</b></span>';
        } else {
          cells += '<span class="cal-day">' + d + '</span>';
        }
      }
      calGrid.innerHTML = cells;

      // on phones a curl hangs from the heart cell down to the counter, so the
      // connector is placed against the cell's measured position
      var cal = document.getElementById("weddingCalendar");
      var connector = cal && cal.querySelector(".cal-connector");
      function placeConnector() {
        var cell = cal.querySelector(".cal-day.is-wedding");
        if (!cell || !connector) return;
        var c = cell.getBoundingClientRect(), box = cal.getBoundingClientRect();
        // SVG elements have no offsetWidth, so measure the box instead, and keep
        // the curl from hanging off the left edge of the calendar
        // the curl starts at 10/80 across its own viewBox, so line that point up
        // with the middle of the heart cell and let it begin right at its edge
        var w = connector.getBoundingClientRect().width || 0;
        var left = Math.max(0, Math.round(c.left - box.left + c.width * 0.5 - w * 0.125));
        connector.style.setProperty("--conn-left", left + "px");
        connector.style.setProperty("--conn-top", Math.round(c.bottom - box.top - 8) + "px");
      }
      if (connector) {
        placeConnector();
        window.addEventListener("resize", placeConnector);
      }
    }

    /* ── scroll reveal ────────────────────────────────── */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else if (entry.target.classList.contains("gift-ring-stage")) {
          entry.target.classList.remove("visible");
        }
      });
    }, { threshold: 0.15 });
    $$("[data-animate]").forEach(function (el) { observer.observe(el); });

    /* ── story photos: show a placeholder until a file is dropped in ──── */
    $$("[data-story-photo]").forEach(function (img) {
      function markEmpty() { img.closest(".story-photo").classList.add("is-empty"); }
      if (img.complete && img.naturalWidth === 0) { markEmpty(); }
      img.addEventListener("error", markEmpty);
    });

    /* ── maps & calendar links ────────────────────────── */
    var mapsUrl = document.body.dataset.venueMapUrl ||
      ("https://maps.google.com/?q=" + encodeURIComponent(venueQuery));
    $$("[data-maps-link]").forEach(function (link) {
      link.href = mapsUrl;
      link.addEventListener("click", function () { fireConfetti(); });
    });

    // the embedded map follows the venue in <body data-venue-query>
    var venueMap = document.getElementById("venueMap");
    if (venueMap && venueQuery) {
      venueMap.src = "https://www.google.com/maps?q=" + encodeURIComponent(venueQuery) + "&output=embed";
    }

    var calendarLink = document.getElementById("calendarLink");
    if (calendarLink) {
      function stamp(d) { return d.toISOString().replace(/[-:]|\.\d{3}/g, ""); }
      var end = new Date(weddingDate.getTime() + 5 * 60 * 60 * 1000);
      calendarLink.href =
        "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent(coupleNames + " Wedding") +
        "&dates=" + stamp(weddingDate) + "/" + stamp(end) +
        "&location=" + encodeURIComponent(venueQuery);
      calendarLink.addEventListener("click", function () { fireConfetti(); });
    }

    var ibanToggle = document.getElementById("ibanToggle");
    var ibanArea = document.getElementById("ibanArea");
    if (ibanToggle && ibanArea) {
      var ibanLabel = ibanToggle.lastChild;
      ibanToggle.addEventListener("click", function () {
        var shown = ibanArea.classList.toggle("show");
        ibanToggle.setAttribute("aria-expanded", String(shown));
        ibanLabel.textContent = shown ? " Hide account details" : " Show account details";
        if (shown) fireConfetti();
      });
    }

    /* ── guest count reads as a placeholder until one is chosen ──── */
    var guests = document.getElementById("guests");
    if (guests) {
      function syncGuests() { guests.classList.toggle("is-empty", guests.value === ""); }
      guests.addEventListener("change", syncGuests);
      syncGuests();
    }

    /* ── RSVP form (local only) ───────────────────────── */
    var form = document.getElementById("rsvpForm");
    var feedback = document.getElementById("formFeedback");
    if (form && feedback) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = form.fullName.value.trim();
        if (!name) {
          feedback.textContent = "Please enter your name.";
          feedback.style.color = "#a8503f";
          feedback.classList.add("show");
          form.fullName.focus();
          return;
        }
        // No backend in this standalone version — the response is kept in the
        // browser only. Wire this up to a form service or API if you need it.
        var entry = {
          name: name,
          phone: form.phone.value.trim(),
          attendance: form.querySelector('input[name="attendance"]:checked').value,
          guests: form.guests.value,
          message: form.message.value.trim(),
          at: new Date().toISOString()
        };
        try {
          var saved = JSON.parse(localStorage.getItem("rsvps") || "[]");
          saved.push(entry);
          localStorage.setItem("rsvps", JSON.stringify(saved));
        } catch (err) { /* storage unavailable — ignore */ }

        feedback.textContent = "Thank you! Your response has been received.";
        feedback.style.color = "#5a8a5a";
        feedback.classList.add("show");
        form.reset();
        fireConfetti();
      });
    }
  });
})();
