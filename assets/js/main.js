/* Howzit? Co-working space & Social House: small vanilla JS, no dependencies */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  /* Header shadow once scrolled */
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 10); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  function setMenu(open) {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
  }
  toggle.addEventListener("click", function () { setMenu(!header.classList.contains("nav-open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", function (e) { if (!header.contains(e.target)) setMenu(false); });

  if ("IntersectionObserver" in window) {
    /* Highlight the nav link for the section in view */
    var links = Array.prototype.slice.call(nav.querySelectorAll("ul a"));
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) spy.observe(s); });

    /* Gentle staggered reveal on scroll */
    var groups = [".section-head", ".tile", ".essentials li", ".peek-head", ".peek-strip li", ".plan", ".storage-intro > *", ".steps li", ".storage-details > div", ".s-tile", ".calendar", ".location-copy", ".map-card", ".faq-list details", ".contact-info", ".form-card"];
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); rev.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    groups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        el.style.setProperty("--d", (Math.min(i % 6, 5) * 0.07) + "s");
        el.classList.add("reveal");
        rev.observe(el);
      });
    });

    /* Hide the sticky mobile bar while the hero buttons, the contact form or the footer are on screen */
    var bar = document.querySelector(".mobile-bar");
    var visible = new Set();
    var barObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
      bar.classList.toggle("is-hidden", visible.size > 0);
    });
    [document.querySelector(".hero-actions"), document.getElementById("contact"), document.querySelector(".site-footer")].forEach(function (el) { if (el) barObs.observe(el); });
  }

  /* Seasonal desk prices: Summer = Nov-Apr, Winter = May-Oct. Defaults to the current season. */
  var work = document.getElementById("work");
  var setSeason = function (season) {
    if (!work) return;
    work.setAttribute("data-season", season);
    work.querySelectorAll("[data-set-season]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-season") === season));
    });
    work.querySelectorAll("[data-plan-" + season + "]").forEach(function (el) {
      el.setAttribute("data-plan", el.getAttribute("data-plan-" + season));
    });
  };
  if (work) {
    var m = new Date().getMonth(); // 0 = Jan
    setSeason(m >= 4 && m <= 9 ? "winter" : "summer");
    work.querySelectorAll("[data-set-season]").forEach(function (b) {
      b.addEventListener("click", function () { setSeason(b.getAttribute("data-set-season")); });
    });
  }

  /* Any [data-plan] link pre-selects the matching interest chip in the enquiry form
     and remembers the exact plan (sent as the hidden "plan" field). */
  var form = document.getElementById("booking-form");
  var PLAN_TO_INTEREST = {
    "Day pass": "Hot desk", "Hot desk, weekly": "Hot desk", "Hot desk, 10-day pack": "Hot desk",
    "Hot desk, monthly": "Hot desk", "Summer season pass": "Hot desk",
    "Private office": "Private office", "Co-living, en-suite room": "Co-living", "Co-living, shared-bathroom room": "Co-living", "Nomad storage": "Storage",
    "Meeting / workshop space": "Events", "Social events": "Events"
  };
  document.querySelectorAll("[data-plan]").forEach(function (el) {
    el.addEventListener("click", function () {
      var plan = el.getAttribute("data-plan");
      var interest = PLAN_TO_INTEREST[plan] || "Other";
      var radio = form.querySelector('input[name="interest"][value="' + interest + '"]');
      if (radio) radio.checked = true;
      if (form.elements.plan) form.elements.plan.value = plan;
    });
  });

  /* Enquiry form: submit to Formspree with fetch() and show an inline message (no redirect).
     The endpoint is the form's action attribute in index.html (see README.md). */
  var status = document.getElementById("form-status");
  var btn = form.querySelector('button[type="submit"]');
  var btnHTML = btn.innerHTML;
  var setStatus = function (msg, kind) {
    status.textContent = msg;
    status.classList.remove("is-error", "is-success", "is-boxed");
    if (kind === "error") status.classList.add("is-error", "is-boxed");
    if (kind === "invalid") status.classList.add("is-error");
    if (kind === "success") status.classList.add("is-success");
  };
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.name, email = form.elements.email, msg = form.elements.message;
    var firstBad = null;
    [name, email, msg].forEach(function (f) {
      var bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value.trim()));
      f.classList.toggle("is-invalid", bad);
      f.setAttribute("aria-invalid", String(bad));
      if (bad && !firstBad) firstBad = f;
    });
    if (firstBad) { setStatus("Please add your name, a valid email address and a short message.", "invalid"); firstBad.focus(); return; }
    if (form.elements._gotcha && form.elements._gotcha.value) return; // honeypot filled: bot

    if (form.elements.prices_viewed) {
      form.elements.prices_viewed.value = work && work.getAttribute("data-season") === "winter" ? "Winter (May-Oct)" : "Summer (Nov-Apr)";
    }
    var data = new FormData(form);
    var firstName = (name.value.trim().split(" ")[0] || "");

    btn.disabled = true; btn.setAttribute("aria-busy", "true"); btn.textContent = "Sending...";
    setStatus("Sending your message...", "");
    fetch(form.action, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: data
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          if (form.elements.plan) form.elements.plan.value = "";
          setStatus("Howzit! Thanks " + firstName + ", your message is on its way. We aim to reply within 24 hours.", "success");
        } else {
          throw new Error("Submission failed (" + res.status + ")");
        }
      })
      .catch(function () {
        setStatus("Eish, something went wrong and your message wasn't sent. Please check your connection and try again in a moment.", "error");
      })
      .then(function () { btn.disabled = false; btn.removeAttribute("aria-busy"); btn.innerHTML = btnHTML; });
  });

  /* Lightbox for the real "peek inside" photos (links still work without JS) */
  var lb = document.getElementById("lightbox");
  var items = Array.prototype.slice.call(document.querySelectorAll("a.peek-item"));
  if (lb && typeof lb.showModal === "function" && items.length) {
    var lbCap = lb.querySelector("figcaption"), lbImg = document.createElement("img"), idx = 0, opener = null;
    lbCap.parentNode.insertBefore(lbImg, lbCap);
    var show = function (i) {
      idx = (i + items.length) % items.length;
      var a = items[idx], thumb = a.querySelector("img");
      lbImg.src = a.getAttribute("href");
      lbImg.alt = thumb ? thumb.alt : "";
      lbCap.textContent = (a.getAttribute("data-caption") || "") + "  (" + (idx + 1) + " / " + items.length + ")";
    };
    items.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault(); opener = a; show(i); lb.showModal();
      });
    });
    lb.querySelector(".lb-close").addEventListener("click", function () { lb.close(); });
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
    lb.addEventListener("close", function () { if (opener) opener.focus(); });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
