(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    root.classList.remove("js");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var mobileQuery = window.matchMedia("(max-width: 767px)");
  var distance = mobileQuery.matches ? 12 : 24;
  var cardStagger = mobileQuery.matches ? 0 : 0.08;

  function show(el) {
    gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
  }

  function inView(el) {
    var rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
  }

  function play(targets, options) {
    var list = gsap.utils.toArray(targets).filter(Boolean);
    if (!list.length) return;
    var y = options && options.y != null ? options.y : distance;
    var stagger = options && options.stagger != null ? options.stagger : 0.08;
    var delay = options && options.delay != null ? options.delay : 0;
    gsap.set(list, { opacity: 0, y: y });
    var tween = {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      stagger: stagger,
      delay: delay,
      overwrite: true,
    };
    var waiting = list.filter(function (el) {
      return !inView(el);
    });
    var ready = list.filter(inView);
    if (ready.length) gsap.to(ready, tween);
    if (!waiting.length) return;
    ScrollTrigger.batch(waiting, {
      start: "top 85%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, tween);
      },
    });
  }

  function maskLines(heading) {
    var existing = heading.querySelectorAll(".hero-line > span");
    if (existing.length) return existing;
    var text = heading.textContent.replace(/\s+/g, " ").trim();
    if (!text) return [];
    heading.textContent = "";
    var line = document.createElement("span");
    var inner = document.createElement("span");
    line.className = "hero-line";
    inner.textContent = text;
    line.appendChild(inner);
    heading.appendChild(line);
    return [inner];
  }

  function revealMask(lines, delay) {
    if (!lines.length) return;
    gsap.from(lines, {
      yPercent: 110,
      duration: 0.85,
      ease: "power3.out",
      stagger: 0.08,
      delay: delay || 0,
    });
  }

  function homeHero() {
    var hero = document.getElementById("top");
    if (!hero) return;
    var eyebrow = hero.querySelector("[data-hero='eyebrow']");
    var lines = hero.querySelectorAll("[data-hero='title'] .hero-line > span");
    var copy = hero.querySelector("[data-hero='copy']");
    var cta = hero.querySelector("[data-hero='cta']");
    var photo = hero.querySelector("[data-parallax]");
    var tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    if (eyebrow) {
      gsap.set(eyebrow, { y: 12 });
      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.6 }, 0.1);
    }
    if (lines.length) {
      gsap.set(lines, { yPercent: 110 });
      tl.to(lines, { yPercent: 0, duration: 0.85, stagger: 0.08, ease: "power3.out" }, 0.2);
      tl.set(hero.querySelector("[data-hero='title']"), { opacity: 1 }, 0.2);
    }
    if (copy) {
      gsap.set(copy, { y: 16 });
      tl.to(copy, { opacity: 1, y: 0, duration: 0.7 }, 0.45);
    }
    if (cta) {
      gsap.set(cta, { y: 12 });
      tl.to(cta, { opacity: 1, y: 0, duration: 0.6 }, 0.6);
    }
    if (photo) gsap.set(photo, { clearProps: "transform" });
  }

  function innerBanner(section) {
    var crumb = section.querySelector(".relative > p");
    var heading = section.querySelector("h1");
    var copy = heading ? heading.nextElementSibling : null;
    var photo = section.querySelector(":scope > img");
    if (crumb) gsap.fromTo(crumb, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    if (heading) revealMask(maskLines(heading), 0.08);
    if (copy && copy.tagName === "P") {
      gsap.fromTo(copy, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: "power2.out" });
    }
    if (photo && !mobileQuery.matches) {
      gsap.fromTo(photo, { scale: 1.025 }, { scale: 1, duration: 1, ease: "power2.out" });
    }
  }

  function counters() {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var end = Number(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (!isFinite(end)) return;
      el.textContent = "0" + suffix;
      var state = { value: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: function () {
          gsap.to(state, {
            value: end,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: function () {
              el.textContent = Math.round(state.value) + suffix;
            },
          });
        },
      });
    });
  }

  function imageReveals() {
    document.querySelectorAll("[data-reveal='image']").forEach(function (img) {
      gsap.fromTo(
        img,
        { scale: 1.04 },
        {
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: img, start: "top 80%", once: true },
        }
      );
    });
  }

  function labeledBlocks() {
    document.querySelectorAll("p[class*='uppercase']").forEach(function (label) {
      if (label.closest("#top") || label.closest("header") || label.closest("footer")) return;
      var heading = label.nextElementSibling;
      var copy = heading && heading.nextElementSibling;
      var group = [label];
      if (heading && /^H[1-3]$/.test(heading.tagName)) group.push(heading);
      if (copy && copy.tagName === "P") group.push(copy);
      play(group, { stagger: 0.1, y: distance });
    });
  }

  try {
  run();
  } catch (error) {
    root.classList.remove("js");
    if (typeof gsap !== "undefined") gsap.set("[data-hero]", { clearProps: "opacity,transform" });
    console.error(error);
  }

  function run() {
  homeHero();

  document.querySelectorAll("main > section.relative").forEach(function (section) {
    if (section.id === "top") return;
    if (!section.querySelector("h1")) return;
    innerBanner(section);
  });

  play(".service-card", { stagger: cardStagger, y: mobileQuery.matches ? 12 : 20 });
  play("section.bg-mist .grid > a", { stagger: cardStagger, y: 16 });
  play("#values article", { stagger: cardStagger, y: 16 });
  play("section.bg-navy-deep .grid > div", { stagger: mobileQuery.matches ? 0 : 0.1, y: 16 });
  play("footer .grid > div", { stagger: 0.08, y: 12 });
  play("#contact-form", { y: 16, stagger: 0 });
  play("section.bg-navy h2, section.bg-navy h2 + p", { stagger: 0.08, y: 16 });

  labeledBlocks();
  imageReveals();
  counters();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      ScrollTrigger.refresh();
    });
  }
  }
})();
