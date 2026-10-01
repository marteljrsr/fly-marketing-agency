(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.getElementById("nav");
  const bar = document.querySelector(".progress");
  const toTop = document.querySelector(".to-top");
  document.getElementById("yr").textContent = new Date().getFullYear();

  // scroll progress, nav state, back-to-top
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("scrolled", y > 20);
    toTop.classList.toggle("show", y > 900);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  // mobile menu
  const menuBtn = document.querySelector(".menu-btn");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  document.querySelectorAll(".links a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false);
  }));

  // active nav link (current page)
  const here = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".links a").forEach(l => {
    const h = l.getAttribute("href");
    if (h !== "/" && here.startsWith(h)) l.classList.add("active");
  });

  // staggered reveals
  const groups = new Map();
  document.querySelectorAll(".reveal").forEach(el => {
    const p = el.parentElement, i = groups.get(p) || 0;
    el.style.setProperty("--d", `${Math.min(i, 6) * 90}ms`);
    groups.set(p, i + 1);
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: .15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  // count-up numbers
  function countUp(el) {
    const end = +el.dataset.count;
    if (reduce) return;
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = 0;
    requestAnimationFrame(tick);
  }

  // card spotlight
  document.querySelectorAll(".card").forEach(c => c.addEventListener("pointermove", e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${e.clientX - r.left}px`);
    c.style.setProperty("--my", `${e.clientY - r.top}px`);
  }));

  // founder photo tilt
  const photo = document.querySelector(".photo"), frame = photo && photo.querySelector(".frame");
  if (photo && !reduce && matchMedia("(pointer: fine)").matches) {
    photo.addEventListener("pointermove", e => {
      const r = photo.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      frame.style.setProperty("--ry", `${x * 10}deg`);
      frame.style.setProperty("--rx", `${-y * 10}deg`);
    });
    photo.addEventListener("pointerleave", () => { frame.style.setProperty("--ry", "0deg"); frame.style.setProperty("--rx", "0deg"); });
  }

  // smooth FAQ open/close
  document.querySelectorAll(".faq details").forEach(d => {
    d.querySelector("summary").addEventListener("click", ev => {
      ev.preventDefault();
      if (d.open) {
        d.classList.remove("on");
        setTimeout(() => { if (!d.classList.contains("on")) d.open = false; }, reduce ? 0 : 450);
      } else {
        d.open = true;
        requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("on")));
      }
    });
  });
})();
