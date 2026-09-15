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
    var coupleNames = (document.getElementById("rn").textContent || "Wedding").replace(/\s+/g, " ").trim();

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
    var flapGroup = document.getElementById("flap-group");
    var badge = document.getElementById("badge");
    var rp = document.getElementById("rp");
    var rn = document.getElementById("rn");
    var rd = document.getElementById("rd");
    var bg = document.getElementById("bg");
    var bgParallax = document.getElementById("bg-parallax-layer");
    var stage = document.getElementById("stage");
    var cake = document.getElementById("cakeIllustration");

    function render() {
      if (!driver) return;
      var rect = driver.getBoundingClientRect();
      var total = driver.offsetHeight - window.innerHeight;
      var p = clamp(-rect.top / Math.max(total, 1), 0, 1);

      var flapT = easeInOutCubic(phase(p, 0.01, 0.58));
      if (flapGroup) flapGroup.style.transform = "translateY(" + flapT * 6 + "px) rotateX(" + flapT * -176 + "deg)";

      if (flapT > 0.96 && !confettiFired) {
        confettiFired = true;
        fireConfetti(window.innerWidth / 2, window.innerHeight * 0.74);
      }
      if (flapT < 0.12) confettiFired = false;

      if (badge) {
        var peel = phase(p, 0.18, 0.44);
        var peelEased = 1 - Math.pow(1 - peel, 2);
        var opacity = 1 - peelEased;
        badge.style.opacity = String(Math.max(0, opacity));
        badge.style.transform =
          "translateX(-50%) translateY(" + peelEased * -30 + "px) rotateX(" + peelEased * -45 +
          "deg) rotateZ(" + peelEased * 8 + "deg) scale(" + (1 + peelEased * 0.08) + ")";
        badge.style.pointerEvents = opacity > 0.15 ? "auto" : "none";
      }

      var preT = easeOut(phase(p, 0.32, 0.58));
      var nameT = easeOut(phase(p, 0.40, 0.68));
      var dateT = easeOut(phase(p, 0.48, 0.76));

      if (rp) { rp.style.opacity = String(preT); rp.style.transform = "translateY(" + (1 - preT) * 22 + "px)"; }
      if (rn) { rn.style.opacity = String(nameT); rn.style.transform = "translateY(" + (1 - nameT) * 36 + "px) scale(" + (0.94 + nameT * 0.06) + ")"; }
      if (rd) { rd.style.opacity = String(dateT); rd.style.transform = "translateY(" + (1 - dateT) * 20 + "px)"; }

      if (cake) {
        var cakeT = easeOut(phase(p, 0.38, 0.72));
        cake.style.opacity = String(Math.max(0.15, cakeT));
        cake.style.transform = "translateY(" + (1 - cakeT) * 28 + "px) scale(" + (0.82 + cakeT * 0.22) + ")";
      }

      var bgShift = p * -42;
      if (bg) bg.style.transform = "translateY(" + bgShift + "px)";
      if (bgParallax) bgParallax.style.transform = "translateY(" + bgShift * 0.55 + "px) scale(" + (1 + p * 0.04) + ")";
      if (stage) stage.style.opacity = String(1 - phase(p, 0.74, 0.94));
    }

    window.addEventListener("scroll", render, { passive: true });
    window.addEventListener("resize", render);
    render();

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

    /* ── maps & calendar links ────────────────────────── */
    var mapsUrl = document.body.dataset.venueMapUrl ||
      ("https://maps.google.com/?q=" + encodeURIComponent(venueQuery));
    var mapsLink = document.getElementById("mapsLink");
    if (mapsLink) {
      mapsLink.href = mapsUrl;
      mapsLink.addEventListener("click", function () { fireConfetti(); });
    }

    var mapArea = document.getElementById("mapArea");
    if (mapArea) {
      mapArea.addEventListener("click", function () { window.open(mapsUrl, "_blank"); fireConfetti(); });
      mapArea.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mapArea.click(); }
      });
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

    /* ── gift registry accordion ──────────────────────── */
    var accordion = document.getElementById("giftAccordion");
    var accordionHeader = document.getElementById("accordionHeader");
    if (accordion && accordionHeader) {
      function toggleAccordion() {
        var willOpen = !accordion.classList.contains("open");
        accordion.classList.toggle("open", willOpen);
        accordionHeader.setAttribute("aria-expanded", String(willOpen));
        if (willOpen) fireConfetti();
      }
      accordionHeader.addEventListener("click", toggleAccordion);
      accordionHeader.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleAccordion(); }
      });
    }

    var ibanToggle = document.getElementById("ibanToggle");
    var ibanArea = document.getElementById("ibanArea");
    if (ibanToggle && ibanArea) {
      ibanToggle.addEventListener("click", function () {
        var shown = ibanArea.classList.toggle("show");
        ibanToggle.textContent = shown ? "Hide IBAN" : "Show IBAN";
      });
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
