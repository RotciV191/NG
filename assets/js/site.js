/* ==========================================================================
   NOVA General Contractor LLC — site.js
   Plain ES2017, no dependencies. Every block is optional: each feature bails
   out quietly when its markup is not present on the current page.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * CONFIG — the only place you need to edit to wire up the form.
   * ------------------------------------------------------------------ */
  var CONFIG = {
    // Paste a form endpoint here (e.g. "https://formspree.io/f/xxxxxxx").
    // Leave empty and the form falls back to opening the visitor's email app.
    formEndpoint: "",

    // Used by the email fallback and the "call instead" messaging.
    email: "novagenerallnv@gmail.com",
    phone: "(425) 343-5456",

    // Upload guardrails.
    maxFiles: 10,
    maxFileMB: 10,

    // Slim mobile Call / Free Estimate bar. Set to false to remove it.
    mobileActionBar: true
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* ------------------------------------------------------------------ *
   * 1 · Media placeholders
   * An <img> whose file does not exist yet leaves its figure in the
   * "is-empty" state, which paints the labelled placeholder plate.
   * Drop the real file at that path and it takes over automatically.
   * ------------------------------------------------------------------ */
  function initMedia(scope) {
    $$(".media > img", scope).forEach(function (img) {
      if (img.dataset.mediaBound) return;
      img.dataset.mediaBound = "1";

      var figure = img.parentElement;
      var ok = function () {
        figure.classList.remove("is-empty");
        img.classList.add("is-loaded");
      };
      var fail = function () { figure.classList.add("is-empty"); };

      if (img.complete) {
        (img.naturalWidth > 0 ? ok : fail)();
      } else {
        img.addEventListener("load", ok, { once: true });
        img.addEventListener("error", fail, { once: true });
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 2 · Header navigation (mobile panel)
   * ------------------------------------------------------------------ */
  function initNav() {
    var toggle = $(".menu-toggle");
    var nav = $("#site-nav");
    if (!toggle || !nav) return;

    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    window.matchMedia("(min-width: 900px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------ *
   * 3 · Services selector (tabs, one photo at a time)
   * All panels ship in the HTML so the copy is indexable; only the
   * visibility is scripted.
   * ------------------------------------------------------------------ */
  function initServices() {
    var list = $(".services__list");
    if (!list) return;

    var tabs = $$(".service-tab", list);
    if (!tabs.length) return;

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        var panel = document.getElementById(tab.getAttribute("aria-controls"));
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (!panel) return;
        panel.hidden = !active;
        if (active && !reduceMotion) {
          panel.classList.remove("is-entering");
          void panel.offsetWidth;            /* restart the entrance */
          panel.classList.add("is-entering");
        }
      });
      if (focus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        select(next, true);
      });
    });

    var initial = tabs.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; });
    select(initial < 0 ? 0 : initial, false);
  }

  /* ------------------------------------------------------------------ *
   * 4 · Entrance reveals (very small, once, opt-out on reduced motion)
   * ------------------------------------------------------------------ */
  function initReveal() {
    var pending = $$("[data-reveal]");
    if (!pending.length) return;

    if (reduceMotion) {
      pending.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }

    /* One sweep does the work: everything at or above the fold line is
       revealed. Two independent triggers schedule it — an observer and the
       scroll event — so a jump past content (deep link, End key, in-page
       anchor) can never leave a block stranded at opacity 0. */
    var ticking = false;
    var io = "IntersectionObserver" in window
      ? new IntersectionObserver(function () { schedule(); })
      : null;

    function schedule() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sweep);
    }

    function sweep() {
      ticking = false;
      var line = window.innerHeight * 0.92;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top > line) return true;
        el.classList.add("is-revealed");
        if (io) io.unobserve(el);
        return false;
      });
      if (!pending.length) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        window.removeEventListener("load", schedule);
        if (io) io.disconnect();
        if (ro) ro.disconnect();
      }
    }

    /* Photos finishing late change the page height under a fragment jump
       (index.html#projects), which moves blocks across the fold without any
       scroll of their own — so watch for that too. */
    var ro = "ResizeObserver" in window ? new ResizeObserver(schedule) : null;

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    if (io) pending.forEach(function (el) { io.observe(el); });
    if (ro) ro.observe(document.body);
    sweep();
  }

  /* ------------------------------------------------------------------ *
   * 5 · Mobile action bar — appears past the hero, steps aside once the
   * estimate form is on screen so it never covers the thing it points at.
   * ------------------------------------------------------------------ */
  function initActionBar() {
    var bar = $(".action-bar");
    if (!bar) return;
    if (!CONFIG.mobileActionBar) { bar.remove(); return; }

    var trigger = $(".hero") || $(".page-head");
    var estimate = $("#estimate");
    if (!("IntersectionObserver" in window)) return;

    var pastHero = false;
    var atForm = false;

    var apply = function () {
      var show = pastHero && !atForm;
      bar.classList.toggle("is-visible", show);
      document.body.classList.toggle("has-action-bar", show);
    };

    if (trigger) {
      new IntersectionObserver(function (entries) {
        pastHero = !entries[0].isIntersecting;
        apply();
      }, { threshold: 0 }).observe(trigger);
    } else {
      pastHero = true;
    }

    if (estimate) {
      new IntersectionObserver(function (entries) {
        atForm = entries[0].isIntersecting;
        apply();
      }, { threshold: 0 }).observe(estimate);
    }

    apply();
  }

  /* ------------------------------------------------------------------ *
   * 6 · Project filters
   * ------------------------------------------------------------------ */
  function initFilters() {
    var bar = $(".filters");
    if (!bar) return;

    /* Scope to the filter bar's own section so a second projects grid
       elsewhere on the page is left alone. */
    var scope = bar.closest("section") || document;
    var buttons = $$(".filter", bar);
    var projects = $$(".projects-grid .project", scope);
    var empty = $(".projects-empty", scope);

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.dataset.filter;
        buttons.forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });

        var shown = 0;
        projects.forEach(function (p) {
          var match = value === "all" || p.dataset.category === value;
          p.classList.toggle("is-filtered", !match);
          if (match) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 7 · Project detail dialog (photos, description, category, before/after)
   * ------------------------------------------------------------------ */
  function initProjectDialog() {
    var dialog = $("#project-dialog");
    if (!dialog || typeof dialog.showModal !== "function") return;

    var elTitle   = $(".dialog__title", dialog);
    var elCat     = $(".dialog__cat", dialog);
    var elSummary = $(".dialog__summary", dialog);
    var elCompare = $(".dialog__compare", dialog);
    var elGallery = $(".dialog__gallery", dialog);
    var elEmpty   = $(".dialog__empty", dialog);

    function fill(article) {
      var title = article.dataset.title ||
                  (($(".project__title", article) || {}).textContent || "").trim();
      var category = article.dataset.categoryLabel || article.dataset.category || "";
      var summary = (article.dataset.summary || "").trim();

      elTitle.textContent = title;
      elCat.textContent = category;
      elCat.hidden = !category;
      elSummary.textContent = summary;
      elSummary.hidden = !summary;

      /* Before / after — only when both real photos are supplied. */
      var before = (article.dataset.before || "").trim();
      var after = (article.dataset.after || "").trim();
      elCompare.innerHTML = "";
      elCompare.hidden = !(before && after);
      if (before && after) {
        elCompare.appendChild(buildCompare(before, after, title));
      }

      /* Gallery — pipe separated paths in data-gallery. */
      var shots = (article.dataset.gallery || "").split("|")
        .map(function (s) { return s.trim(); })
        .filter(Boolean);

      elGallery.innerHTML = "";
      elGallery.hidden = !shots.length;
      shots.forEach(function (src, i) {
        var fig = document.createElement("figure");
        fig.className = "media media--3x2";
        fig.setAttribute("data-placeholder", "Project photo · " + src);
        var img = document.createElement("img");
        img.src = src;
        img.alt = title + " — photo " + (i + 1);
        img.loading = "lazy";
        fig.appendChild(img);
        elGallery.appendChild(fig);
      });

      if (elEmpty) elEmpty.hidden = Boolean(summary || shots.length || (before && after));

      initMedia(dialog);
    }

    function buildCompare(before, after, title) {
      var wrap = document.createElement("div");
      wrap.className = "compare";
      wrap.innerHTML =
        '<img class="compare__before" alt="' + esc(title) + ' — before" src="' + esc(before) + '">' +
        '<img class="compare__after" alt="' + esc(title) + ' — after" src="' + esc(after) + '">' +
        '<span class="compare__label compare__label--before">Before</span>' +
        '<span class="compare__label compare__label--after">After</span>' +
        '<span class="compare__handle" aria-hidden="true"></span>' +
        '<input class="compare__range" type="range" min="0" max="100" value="50" step="1" ' +
        'aria-label="Reveal the after photo">';

      var range = $(".compare__range", wrap);
      range.addEventListener("input", function () {
        wrap.style.setProperty("--split", range.value + "%");
      });
      return wrap;
    }

    function esc(str) {
      return String(str).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }

    function open(article) {
      fill(article);
      dialog.showModal();
      if (article.id) history.replaceState(null, "", "#" + article.id);
    }

    $$(".projects-grid .project").forEach(function (article) {
      var link = $(".project__link", article);
      if (!link) return;
      link.addEventListener("click", function (e) {
        if (link.getAttribute("href").charAt(0) !== "#") return; /* home page links out */
        e.preventDefault();
        open(article);
      });
    });

    $(".dialog__close", dialog).addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();   /* click on the backdrop */
    });
    dialog.addEventListener("close", function () {
      history.replaceState(null, "", window.location.pathname);
    });

    /* Deep link: projects.html#p-01 opens that project. */
    if (window.location.hash) {
      var target = document.querySelector(window.location.hash + ".project");
      if (target) open(target);
    }
  }

  /* ------------------------------------------------------------------ *
   * 8 · Estimate form
   * ------------------------------------------------------------------ */
  function initForm() {
    var form = $("#estimate-form");
    if (!form) return;

    var status = $("#form-status");
    var fileInput = $("#photos");
    var fileStatus = $(".upload__status");
    var fileList = $(".upload__list");
    var submit = $(".form-submit", form);

    /* Selected photo list -------------------------------------------- */
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var files = Array.prototype.slice.call(fileInput.files || []);
        fileList.innerHTML = "";

        var oversized = files.filter(function (f) {
          return f.size > CONFIG.maxFileMB * 1024 * 1024;
        });

        if (files.length > CONFIG.maxFiles) {
          fileStatus.textContent = "Please select up to " + CONFIG.maxFiles + " photos.";
          fileInput.value = "";
          return;
        }
        if (oversized.length) {
          fileStatus.textContent = "Each photo must be under " + CONFIG.maxFileMB + " MB.";
          fileInput.value = "";
          return;
        }

        fileStatus.textContent = files.length
          ? files.length + (files.length === 1 ? " photo selected" : " photos selected")
          : "No photos selected";

        files.forEach(function (f) {
          var li = document.createElement("li");
          li.textContent = f.name + "  ·  " + (f.size / 1048576).toFixed(1) + " MB";
          fileList.appendChild(li);
        });
      });
    }

    /* Validation ------------------------------------------------------ */
    function fieldOf(input) { return input.closest(".field, .fieldset"); }

    function setError(input, message) {
      var wrap = fieldOf(input);
      if (!wrap) return;
      wrap.classList.toggle("has-error", Boolean(message));
      var msg = $(".field-error", wrap);
      if (msg && message) msg.textContent = message;
      input.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function validate() {
      var problems = [];

      var checks = [
        { el: $("#name", form), msg: "Please enter your name." },
        { el: $("#phone", form), msg: "Please enter a phone number we can reach you at." },
        { el: $("#description", form), msg: "Please tell us briefly about the project." }
      ];

      checks.forEach(function (c) {
        if (!c.el) return;
        var empty = !c.el.value.trim();
        setError(c.el, empty ? c.msg : "");
        if (empty) problems.push(c.el);
      });

      /* Email is required only when the visitor asked to be emailed. */
      var email = $("#email", form);
      var prefersEmail = (form.querySelector('input[name="contact_method"]:checked') || {}).value === "Email";
      if (email) {
        var value = email.value.trim();
        var invalid = value ? !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) : prefersEmail;
        setError(email, invalid
          ? (value ? "Please check this email address." : "Add an email address, or pick phone or text above.")
          : "");
        if (invalid) problems.push(email);
      }

      if (problems.length) problems[0].focus();
      return problems.length === 0;
    }

    /* Submission ------------------------------------------------------ */
    function say(html) {
      status.innerHTML = html;
      status.hidden = false;
    }

    function mailtoFallback() {
      var get = function (id) { var el = $("#" + id, form); return el ? el.value.trim() : ""; };
      var method = (form.querySelector('input[name="contact_method"]:checked') || {}).value || "";
      var body = [
        "Name: " + get("name"),
        "Phone: " + get("phone"),
        "Email: " + get("email"),
        "Project type: " + get("project_type"),
        "City / address: " + get("location"),
        "Preferred contact: " + method,
        "",
        "Project description:",
        get("description"),
        "",
        "(Please attach your project photos to this email.)"
      ].join("\n");

      return "mailto:" + CONFIG.email +
             "?subject=" + encodeURIComponent("Free estimate request — " + get("name")) +
             "&body=" + encodeURIComponent(body);
    }

    form.addEventListener("submit", function (e) {
      if (form.querySelector('input[name="company"]').value) { /* honeypot */
        e.preventDefault();
        return;
      }

      if (!validate()) {
        e.preventDefault();
        say("Please check the highlighted fields and send again.");
        return;
      }

      /* No endpoint configured, but a form action was added (Netlify etc.)
         — let the browser post it natively. */
      if (!CONFIG.formEndpoint && form.getAttribute("action")) return;

      e.preventDefault();

      if (!CONFIG.formEndpoint) {
        say("This form is not connected to an inbox yet. " +
            '<a class="text-link" href="' + mailtoFallback() + '">Send these details by email</a> ' +
            "or call <a class=\"text-link\" href=\"tel:+14253435456\">" + CONFIG.phone + "</a>.");
        return;
      }

      submit.disabled = true;
      var original = submit.textContent;
      submit.textContent = "Sending…";

      fetch(CONFIG.formEndpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          form.reset();
          if (fileList) fileList.innerHTML = "";
          if (fileStatus) fileStatus.textContent = "No photos selected";
          say("Thank you — your request came through. We'll follow up using the contact method you chose.");
        })
        .catch(function () {
          say("Something went wrong sending the form. Please call " +
              "<a class=\"text-link\" href=\"tel:+14253435456\">" + CONFIG.phone + "</a> " +
              "or email <a class=\"text-link\" href=\"mailto:" + CONFIG.email + "\">" + CONFIG.email + "</a>.");
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = original;
        });
    });

    /* Clear an error as soon as the visitor fixes it. */
    form.addEventListener("input", function (e) {
      var wrap = e.target.closest(".field.has-error");
      if (wrap && e.target.value.trim()) wrap.classList.remove("has-error");
    });
  }

  /* ------------------------------------------------------------------ *
   * 9 · Small utilities
   * ------------------------------------------------------------------ */
  function initYear() {
    var el = $("#year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------ */
  function init() {
    initMedia(document);
    initNav();
    initServices();
    initReveal();
    initActionBar();
    initFilters();
    initProjectDialog();
    initForm();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
