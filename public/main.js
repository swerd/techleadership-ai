(function () {
  "use strict";

  // Sticky header background on scroll
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    function setMenu(open) {
      links.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    }
    toggle.addEventListener("click", function () {
      setMenu(!links.classList.contains("is-open"));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("is-open")) setMenu(false);
    });
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Footer year
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  // Forms: submit asynchronously to a Cloudflare Pages Function. If the backend
  // isn't configured yet (no email key) or the request fails, gracefully fall back
  // to opening the visitor's email client with a prefilled message — so the contact
  // path always works.
  document.querySelectorAll("form[data-endpoint]").forEach(function (form) {
    var isNewsletter = form.classList.contains("newsletter-form");
    var note = form.querySelector("[data-form-note]");
    var btn = form.querySelector("button[type=submit], button:not([type])");
    var btnText = btn ? btn.textContent : "";

    function setNote(msg, isError) {
      if (!note) return;
      note.textContent = msg;
      note.hidden = !msg;
      note.classList.toggle("is-error", !!isError);
    }

    function mailtoFallback() {
      var to = form.getAttribute("data-email");
      var subject = isNewsletter ? "Newsletter signup via techleadership.ai" : "Inquiry via techleadership.ai";
      var lines = [];
      new FormData(form).forEach(function (val, key) {
        if (key === "company_website" || String(val).trim() === "") return;
        var label = key.charAt(0).toUpperCase() + key.slice(1);
        if (key === "topic") subject = "techleadership.ai — " + val;
        lines.push(label + ": " + val);
      });
      if (isNewsletter) lines.unshift("Please add me to your mailing list.");
      var href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      setNote("Opening your email app… if nothing happens, write to " + to + ".");
      window.location.href = href;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.reportValidity && !form.reportValidity()) return;

      var endpoint = form.getAttribute("data-endpoint");
      var payload = {};
      new FormData(form).forEach(function (val, key) { payload[key] = val; });
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      setNote("");

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) { return { ok: res.ok, body: body }; });
        })
        .then(function (r) {
          if (r.ok && r.body && r.body.ok) {
            form.reset();
            setNote(isNewsletter ? "You're in — thanks for subscribing." : "Thank you — your note is on its way. I'll be in touch.");
          } else {
            mailtoFallback();
          }
        })
        .catch(function () { mailtoFallback(); })
        .finally(function () { if (btn) { btn.disabled = false; btn.textContent = btnText; } });
    });
  });
})();
