(function () {
  const header = document.getElementById("site-header");
  const logo = document.getElementById("logo");
  const menu = document.getElementById("mobile-menu");
  const toggle = document.getElementById("menu-toggle");
  const iconOpen = document.getElementById("icon-open");
  const iconClose = document.getElementById("icon-close");
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  if (header && logo && toggle && menu) {
    const menuIsOpen = () => toggle.getAttribute("aria-expanded") === "true";
    const setHeader = () => {
      const solid = window.scrollY > 12 || menuIsOpen();
      header.classList.toggle("is-solid", solid);
      const file = solid ? "logo-navy.png" : "logo-white.png";
      if (!logo.src.includes(file)) logo.src = "assets/" + file;
    };
    const setMenu = (open) => {
      menu.classList.toggle("hidden", !open);
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      iconOpen.classList.toggle("hidden", open);
      iconClose.classList.toggle("hidden", !open);
      setHeader();
    };
    setHeader();
    window.addEventListener("scroll", setHeader, { passive: true });
    toggle.addEventListener("click", () => setMenu(menu.classList.contains("hidden")));
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  }

  const banner = document.getElementById("top");
  const bannerPanels = banner ? [...banner.querySelectorAll(".banner-panel")] : [];
  const bannerPhotos = banner ? [...banner.querySelectorAll(".banner-photo")] : [];
  const bannerDots = banner ? [...banner.querySelectorAll(".banner-dot")] : [];
  const bannerPrev = document.getElementById("banner-prev");
  const bannerNext = document.getElementById("banner-next");
  const bannerPause = document.getElementById("banner-pause");
  if (banner && bannerPanels.length > 1 && bannerPrev && bannerNext && bannerPause) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pauseIcon = document.getElementById("banner-pause-icon");
    const playIcon = document.getElementById("banner-play-icon");
    let index = 0;
    let timer = 0;
    let paused = reduceMotion;
    let hovered = false;

    const paintPause = () => {
      bannerPause.setAttribute("aria-pressed", String(paused));
      bannerPause.setAttribute("aria-label", paused ? "Play slides" : "Pause slides");
      if (pauseIcon) pauseIcon.classList.toggle("hidden", paused);
      if (playIcon) playIcon.classList.toggle("hidden", !paused);
    };

    const show = (next) => {
      index = (next + bannerPanels.length) % bannerPanels.length;
      bannerPanels.forEach((panel, i) => {
        const on = i === index;
        panel.hidden = !on;
        panel.classList.toggle("is-active", on);
      });
      bannerPhotos.forEach((photo, i) => {
        const on = i === index;
        photo.classList.toggle("is-active", on);
        photo.setAttribute("aria-hidden", String(!on));
        if (on) {
          photo.style.animation = "none";
          void photo.offsetWidth;
          photo.style.animation = "";
        }
      });
      bannerDots.forEach((dot, i) => {
        if (i === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    };

    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (paused || hovered || document.hidden) return;
      timer = window.setInterval(() => show(index + 1), 6500);
    };

    bannerPrev.addEventListener("click", () => {
      show(index - 1);
      start();
    });
    bannerNext.addEventListener("click", () => {
      show(index + 1);
      start();
    });
    bannerDots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        show(i);
        start();
      });
    });
    bannerPause.addEventListener("click", () => {
      paused = !paused;
      paintPause();
      start();
    });
    banner.addEventListener("mouseenter", () => {
      hovered = true;
      stop();
    });
    banner.addEventListener("mouseleave", () => {
      hovered = false;
      start();
    });
    banner.addEventListener("focusin", () => {
      hovered = true;
      stop();
    });
    banner.addEventListener("focusout", () => {
      hovered = false;
      start();
    });
    banner.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        show(index - 1);
        start();
      } else if (event.key === "ArrowRight") {
        show(index + 1);
        start();
      }
    });
    document.addEventListener("visibilitychange", start);
    paintPause();
    start();
  }

  const form = document.getElementById("contact-form");
  if (!form) return;
  const select = form.querySelector("[name=service]");
  const wanted = new URLSearchParams(location.search).get("service");
  if (wanted && select && [...select.options].some((option) => option.value === wanted)) {
    select.value = wanted;
  }
  const note = document.getElementById("form-note");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (note) {
      note.textContent = "Thank you. This preview keeps your request in the browser only. A live mailbox is not connected yet.";
      note.classList.remove("hidden");
    }
    form.reset();
    if (wanted && select) select.value = wanted;
  });
})();
