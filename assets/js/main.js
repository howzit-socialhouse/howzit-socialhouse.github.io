/* Howzit? Co-working space & Social House: small vanilla JS, no dependencies */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* GA4 events (G-4FQ6NP60Y5). Safe no-op if gtag is missing or blocked. */
  var track = function (name, params) {
    if (typeof window.gtag !== "function") return;
    try { window.gtag("event", name, params); } catch (err) { /* ignore */ }
  };
  /* WhatsApp clicks: one delegated listener covers the floating button and inline links on every page */
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/"], a[href*="api.whatsapp.com/"]') : null;
    if (!a) return;
    track("whatsapp_click", {
      link_location: a.closest(".wa-float") ? "floating" : "inline",
      page_path: location.pathname,
      transport_type: "beacon"
    });
  }, true);

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
    links.forEach(function (a) { var h = a.getAttribute("href"); if (h.charAt(0) !== "#") return; var s = document.querySelector(h); if (s) spy.observe(s); });

    /* Gentle staggered reveal on scroll */
    var groups = [".section-head", ".tile", ".essentials li", ".peek-head", ".peek-strip li", ".plan", ".storage-intro > *", ".steps li", ".storage-details > div", ".s-tile", ".calendar", ".location-copy", ".map-card", ".faq-list details", ".contact-info", ".form-card", ".price-match", ".tabs", ".coliving-incl"];
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
  if (form) {
  var PLAN_TO_INTEREST = {
    "Day pass": "Hot desk", "Hot desk, weekly": "Hot desk", "Hot desk, 10-day pack": "Hot desk",
    "Hot desk, monthly": "Hot desk", "Hot desk, yearly": "Hot desk", "Private office, yearly": "Private office", "Summer season pass": "Hot desk",
    "Private office": "Private office", "Co-living, en-suite room": "Co-living", "Co-living, shared-bathroom room": "Co-living", "Nomad storage": "Storage", "Luggage drop": "Luggage drop", "Pet sitting": "Pet sitting",
    "Meeting / workshop space": "Events", "Social events": "Events",
    "Price match": "Price match", "Private office, viewing": "Private office", "Hot desk": "Hot desk", "Day office": "Private office"
  };
  document.querySelectorAll("[data-plan]").forEach(function (el) {
    el.addEventListener("click", function () {
      var plan = el.getAttribute("data-plan");
      var interest = PLAN_TO_INTEREST[plan] || "Other";
      var radio = form.querySelector('input[name="interest"][value="' + interest + '"]');
      if (radio) radio.checked = true;
      if (form.elements.plan) form.elements.plan.value = plan;
      var msg = el.getAttribute("data-msg");
      if (msg && form.elements.message && !form.elements.message.value.trim()) form.elements.message.value = msg;
    });
  });

  /* Enquiry form: submit to Web3Forms with fetch() and show an inline message (no redirect).
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
    /* Tag every enquiry with the offer it's about, so demand can be compared:
       Hot desk, Private office, Day office, Co-living, Price match or General (+ topic). */
    var interest = (form.querySelector('input[name="interest"]:checked') || {}).value || "Other";
    var plan = form.elements.plan ? form.elements.plan.value : "";
    var offer = { "Hot desk": "Hot desk", "Private office": "Private office", "Co-living": "Co-living", "Price match": "Price match" }[interest] || "General";
    if (offer === "Private office" && plan === "Day office") offer = "Day office";
    if (form.elements.offer) form.elements.offer.value = offer;
    form.elements.subject.value = "New Howzit? enquiry [" + offer + "]" + (offer === "General" ? ": " + interest : "") + (plan && plan !== offer ? " (" + plan + ")" : "");
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
          track("generate_lead", { form_offer: offer, form_plan: plan, form_interest: interest, page_path: location.pathname });
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

  }

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

  /* Tabs (WAI-ARIA tabs pattern): click, arrow keys, and #links to a panel open that tab */
  var activateTab = function (tab, focus) {
    var list = tab.closest('[role="tablist"]');
    list.querySelectorAll('[role="tab"]').forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !on;
    });
    if (focus) tab.focus();
  };
  document.querySelectorAll("[data-tabs]").forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { activateTab(t); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") n = tabs[0];
        if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); activateTab(n, true); }
      });
    });
  });
  /* Reveal the target of an in-page link if it sits in a closed tab or a closed <details> */
  var revealTarget = function (id) {
    var el = id && document.getElementById(id);
    if (!el) return;
    var panel = el.closest('[role="tabpanel"]');
    if (panel && panel.hidden) {
      var tab = document.querySelector('[role="tab"][aria-controls="' + panel.id + '"]');
      if (tab) activateTab(tab);
    }
    var d = el.closest("details");
    if (d && !d.open) d.open = true;
    var inner = el.querySelector && el.querySelector(":scope > details.extra-more");
    if (inner && !inner.open) inner.open = true;
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href").length > 1) revealTarget(a.getAttribute("href").slice(1));
  });
  if (location.hash) revealTarget(location.hash.slice(1));

  /* ---------- Co-living availability calendar ----------
     Bookable window: check-in 1 Dec 2026 to 31 May 2027, check-out up to 1 Jun 2027.
     The request is sent with Web3Forms (same access key as the enquiry form). */
  var dlg = document.getElementById("avail");
  var aForm = document.getElementById("avail-form");
  if (dlg && aForm) {
    var MIN = new Date(2026, 11, 1), MAX = new Date(2027, 5, 1);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (today > MIN) MIN = today;
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    var start = null, end = null, picking = "in";
    var view = new Date(MIN.getFullYear(), MIN.getMonth(), 1);
    var monthsEl = dlg.querySelector(".cal-months"), prev = dlg.querySelector(".cal-prev"), next = dlg.querySelector(".cal-next");
    var inLbl = document.getElementById("a-in-label"), outLbl = document.getElementById("a-out-label");
    var sum = document.getElementById("a-sum"), room = document.getElementById("a-room"), aStatus = document.getElementById("a-status");
    var boxes = dlg.querySelectorAll(".date-box");
    var DAY = 864e5;
    var iso = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    var nice = function (d) { return d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); };
    var rand = function (n) { return "R" + n.toLocaleString("en-ZA").replace(/\s|\u00a0/g, ","); };
    var perView = function () { return window.matchMedia("(max-width: 760px)").matches ? 1 : 2; };
    var lastMonth = new Date(MAX.getFullYear(), MAX.getMonth(), 1);

    var render = function () {
      var n = perView();
      var maxView = new Date(lastMonth.getFullYear(), lastMonth.getMonth() - (n - 1), 1);
      if (view > maxView) view = maxView;
      var minView = new Date(MIN.getFullYear(), MIN.getMonth(), 1);
      if (view < minView) view = minView;
      prev.disabled = view <= minView; next.disabled = view >= maxView;
      monthsEl.innerHTML = "";
      for (var k = 0; k < n; k++) {
        var m = new Date(view.getFullYear(), view.getMonth() + k, 1);
        var wrap = document.createElement("div"); wrap.className = "cal-month";
        var h = document.createElement("h3"); h.textContent = MONTHS[m.getMonth()] + " " + m.getFullYear(); wrap.appendChild(h);
        var g = document.createElement("div"); g.className = "cal-grid"; g.setAttribute("role", "grid");
        DOW.forEach(function (d) { var s = document.createElement("span"); s.className = "cal-dow"; s.textContent = d; g.appendChild(s); });
        var offset = (m.getDay() + 6) % 7;
        for (var b = 0; b < offset; b++) g.appendChild(document.createElement("span"));
        var days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
        for (var d = 1; d <= days; d++) {
          var dt = new Date(m.getFullYear(), m.getMonth(), d);
          var btn = document.createElement("button");
          btn.type = "button"; btn.className = "cal-day-btn"; btn.textContent = d; btn.dataset.date = iso(dt);
          btn.setAttribute("aria-label", nice(dt));
          var ok;
          if (picking === "out" && start) ok = dt > start && dt <= MAX;
          else ok = dt >= MIN && dt < MAX;
          if (picking === "in" && start && !end && dt > start && dt <= MAX) ok = true;
          btn.disabled = !ok;
          if (start && +dt === +start) { btn.classList.add("is-start"); if (end) btn.classList.add("has-range"); btn.setAttribute("aria-pressed", "true"); }
          if (end && +dt === +end) { btn.classList.add("is-end"); btn.setAttribute("aria-pressed", "true"); }
          if (start && end && dt > start && dt < end) btn.classList.add("in-range");
          g.appendChild(btn);
        }
        wrap.appendChild(g); monthsEl.appendChild(wrap);
      }
      inLbl.textContent = start ? nice(start) : "Add date";
      outLbl.textContent = end ? nice(end) : "Add date";
      boxes[0].classList.toggle("is-active", picking === "in");
      boxes[1].classList.toggle("is-active", picking === "out");
      updateSummary();
    };
    var updateSummary = function () {
      var opt = room.options[room.selectedIndex];
      var dayRate = +opt.getAttribute("data-day"), monthRate = +opt.getAttribute("data-month");
      if (!start) { sum.textContent = "Pick your check-in and check-out dates."; return; }
      if (!end) { sum.textContent = "Check-in " + nice(start) + ". Now pick your check-out date."; return; }
      var nights = Math.round((end - start) / DAY);
      var est;
      if (nights >= 30) est = nights + " nights: monthly rate " + rand(monthRate) + " / month applies (we confirm the exact total).";
      else est = nights + (nights === 1 ? " night" : " nights") + " \u00d7 " + rand(dayRate) + " = about " + rand(nights * dayRate) + ".";
      sum.innerHTML = "<strong>" + opt.value + "</strong>: " + nice(start) + " to " + nice(end) + ". " + est;
      aForm.elements.nights.value = nights;
      aForm.elements.estimate.value = est;
    };
    monthsEl.addEventListener("click", function (e) {
      var b = e.target.closest(".cal-day-btn"); if (!b || b.disabled) return;
      var p = b.dataset.date.split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2]);
      if (picking === "in" || !start || dt <= start) {
        if (start && !end && dt > start && picking === "in") { end = dt; picking = "in"; }
        else { start = dt; end = null; picking = "out"; }
      } else { end = dt; picking = "in"; }
      render();
      var t = monthsEl.querySelector('[data-date="' + b.dataset.date + '"]'); if (t) t.focus();
    });
    boxes[0].addEventListener("click", function () { picking = "in"; render(); });
    boxes[1].addEventListener("click", function () { if (start) { picking = "out"; render(); } });
    prev.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
    next.addEventListener("click", function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });
    dlg.querySelector(".cal-clear").addEventListener("click", function () { start = end = null; picking = "in"; render(); });
    room.addEventListener("change", updateSummary);
    window.addEventListener("resize", function () { if (dlg.open) render(); });

    var opener2 = null;
    document.querySelectorAll("[data-avail]").forEach(function (b) {
      b.addEventListener("click", function () {
        room.selectedIndex = b.getAttribute("data-avail") === "ensuite" ? 0 : 1;
        opener2 = b;
        render();
        if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      });
    });
    dlg.querySelector(".avail-close").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { if (opener2) opener2.focus(); });

    var aBtn = aForm.querySelector('button[type="submit"]'), aBtnHTML = aBtn.innerHTML;
    var aSet = function (msg, kind) {
      aStatus.innerHTML = msg;
      aStatus.className = "form-note" + (kind === "error" ? " is-error is-boxed" : kind === "invalid" ? " is-error" : kind === "success" ? " is-success" : "");
    };
    aForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nm = aForm.elements.name, em = aForm.elements.email, bad = null;
      [nm, em].forEach(function (f) {
        var x = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value.trim()));
        f.classList.toggle("is-invalid", x); f.setAttribute("aria-invalid", String(x)); if (x && !bad) bad = f;
      });
      if (!start || !end) { aSet("Please pick a check-in and a check-out date.", "invalid"); return; }
      if (bad) { aSet("Please add your name and a valid email address.", "invalid"); bad.focus(); return; }
      if (aForm.elements._gotcha.value) return;
      aForm.elements.check_in.value = iso(start);
      aForm.elements.check_out.value = iso(end);
      aForm.elements.subject.value = "New Howzit? enquiry [Co-living]: availability request, " + room.value + ", " + iso(start) + " to " + iso(end);
      var summary = room.value + ", " + iso(start) + " to " + iso(end);
      aBtn.disabled = true; aBtn.setAttribute("aria-busy", "true"); aBtn.textContent = "Sending...";
      fetch(aForm.action, { method: "POST", headers: { "Accept": "application/json" }, body: new FormData(aForm) })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          track("generate_lead", { form_offer: "Co-living", form_plan: room.value, form_interest: "Co-living", page_path: location.pathname });
          aSet("Howzit! Thanks " + (nm.value.trim().split(" ")[0] || "") + ", your request for " + summary + " is on its way. We aim to reply within 24 hours.", "success");
        })
        .catch(function () {
          var wa = "https://wa.me/34689263293?text=" + encodeURIComponent("Hi Howzit! I'd like to check co-living availability: " + summary + ". " + nm.value.trim());
          aSet('Eish, something went wrong and your request wasn\'t sent. Please try again, or <a href="' + wa + '" target="_blank" rel="noopener">send it on WhatsApp</a>.', "error");
        })
        .then(function () { aBtn.disabled = false; aBtn.removeAttribute("aria-busy"); aBtn.innerHTML = aBtnHTML; });
    });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
