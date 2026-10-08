/* ==========================================================
   68 ROYAL NAILS — script.js
   Ubah data kontak & jam buka cukup di bagian CONFIG.
   ========================================================== */

const CONFIG = {
  whatsapp: "6288262667415",      // format internasional tanpa + / 0 di depan
  openHour: 10,                   // jam buka (WIB)
  closeHour: 22,                  // jam tutup (WIB)
  timezone: "Asia/Jakarta",
  greeting: "Halo 68 Royal Nails, saya ingin booking appointment."
};

document.documentElement.classList.remove("no-js");

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

/* ---------- 1. Preloader ---------- */
function finishLoading() {
  $("#preloader").classList.add("is-done");
  document.body.classList.add("is-loaded");
  initCounters();
}
window.addEventListener("load", () => setTimeout(finishLoading, reduceMotion ? 0 : 900));
setTimeout(() => { if (!document.body.classList.contains("is-loaded")) finishLoading(); }, 3500); // jaga-jaga

/* ---------- 2. Link WhatsApp otomatis ---------- */
$$("[data-wa]").forEach(a => (a.href = waLink(CONFIG.greeting)));
$$("[data-wa-plain]").forEach(a => (a.href = `https://wa.me/${CONFIG.whatsapp}`));
// CTA hero: scroll ke form (bukan langsung WA)
$$(".hero [data-wa], .process [data-wa]").forEach(a => (a.href = "#booking"));

/* ---------- 3. Header: efek scroll, sembunyi saat scroll turun, progress ---------- */
const header = $("#header");
const progress = $("#scrollProgress");
const toTop = $("#toTop");
let lastY = 0, ticking = false;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  header.classList.toggle("is-scrolled", y > 40);
  const menuOpen = $("#nav").classList.contains("is-open");
  header.classList.toggle("is-hidden", y > lastY && y > 400 && !menuOpen);
  toTop.classList.toggle("is-visible", y > 700);
  lastY = y;
  updateTimeline();
  ticking = false;
}
window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

/* ---------- 4. Menu mobile ---------- */
const burger = $("#burger"), nav = $("#nav");
function setMenu(open) {
  nav.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  document.body.classList.toggle("is-locked", open);
  if (open) header.classList.remove("is-hidden");
}
burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
$$(".nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* ---------- 5. Scroll-spy (link menu aktif) ---------- */
const links = $$(".nav__link");
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      links.forEach(l => l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

/* ---------- 6. Reveal saat scroll (dengan stagger) ---------- */
$$(".features, .gallery__grid, .faq__list, .timeline").forEach(group => {
  $$(".reveal", group).forEach((el, i) => el.style.setProperty("--d", `${(i % 4) * 0.09}s`));
});
const revealer = new IntersectionObserver((entries, obs) => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
$$(".reveal").forEach(el => revealer.observe(el));

/* ---------- 7. Counter angka (hero) ---------- */
function initCounters() {
  $$("[data-count]").forEach(el => {
    const target = +el.dataset.count;
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now(), dur = 1400;
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  });
}

/* ---------- 8. Status buka / tutup (WIB) ---------- */
function updateStatus() {
  const pill = $("#statusPill"), text = $("#statusText");
  const hour = +new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: CONFIG.timezone }).format(new Date()) % 24;
  const open = hour >= CONFIG.openHour && hour < CONFIG.closeHour;
  pill.classList.toggle("is-open", open);
  pill.classList.toggle("is-closed", !open);
  text.textContent = open
    ? `Buka sekarang · sampai ${CONFIG.closeHour}.00 WIB`
    : `Tutup · buka ${CONFIG.openHour}.00 WIB`;
}
updateStatus();
setInterval(updateStatus, 60000);

/* ---------- 9. Parallax mouse di hero ---------- */
const heroVisual = $("#heroVisual");
if (heroVisual && !reduceMotion && matchMedia("(hover: hover)").matches) {
  const layers = $$("[data-depth]", heroVisual);
  $(".hero").addEventListener("mousemove", e => {
    const x = e.clientX - innerWidth / 2, y = e.clientY - innerHeight / 2;
    layers.forEach(l => {
      const d = +l.dataset.depth;
      l.style.transform = `translate(${-x * d}px, ${-y * d}px)`;
    });
  });
  $(".hero").addEventListener("mouseleave", () => layers.forEach(l => (l.style.transform = "")));
}

/* ---------- 10. Spotlight kartu keunggulan ---------- */
$$(".feature").forEach(card => {
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

/* ---------- 11. Layanan: accordion + preview gambar ---------- */
const services = $$(".service");
const preview = $("#servicePreview");
function openService(item) {
  services.forEach(s => {
    const on = s === item;
    s.classList.toggle("is-active", on);
    $(".service__row", s).setAttribute("aria-expanded", on);
  });
  const src = item.dataset.img;
  if (src && !preview.src.endsWith(src)) {
    preview.classList.add("is-swapping");
    setTimeout(() => { preview.src = src; preview.classList.remove("is-swapping"); }, 280);
  }
}
services.forEach(item => {
  $(".service__row", item).addEventListener("click", () => openService(item));
  if (matchMedia("(hover: hover)").matches) {
    $(".service__row", item).addEventListener("mouseenter", () => openService(item));
  }
});
// Tombol "Pilih layanan ini" -> isi otomatis form
$$(".service__link").forEach(a => a.addEventListener("click", () => {
  const sel = $("#fService");
  sel.value = a.dataset.service;
  sel.dispatchEvent(new Event("change"));
}));

/* ---------- 12. Galeri: filter ---------- */
const shots = $$(".shot");
$$(".filter").forEach(btn => btn.addEventListener("click", () => {
  $$(".filter").forEach(b => b.classList.toggle("is-active", b === btn));
  const f = btn.dataset.filter;
  shots.forEach(s => {
    const show = f === "all" || s.dataset.cat === f;
    s.classList.toggle("is-hidden", !show);
    s.classList.remove("is-entering");
    if (show) { void s.offsetWidth; s.classList.add("is-entering"); }
  });
}));

/* ---------- 13. Lightbox ---------- */
const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCaption");
let lbIndex = 0, lbList = [];
function showLb(i) {
  lbIndex = (i + lbList.length) % lbList.length;
  const s = lbList[lbIndex];
  lbImg.src = $("img", s).src;
  lbImg.alt = $("img", s).alt;
  lbCap.textContent = s.dataset.caption || "";
}
function openLb(shot) {
  lbList = shots.filter(s => !s.classList.contains("is-hidden"));
  showLb(lbList.indexOf(shot));
  lb.classList.add("is-open");
  lb.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");
}
function closeLb() {
  lb.classList.remove("is-open");
  lb.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-locked");
}
shots.forEach(s => {
  s.addEventListener("click", () => openLb(s));
  s.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(s); } });
});
$("#lbClose").addEventListener("click", closeLb);
$("#lbPrev").addEventListener("click", () => showLb(lbIndex - 1));
$("#lbNext").addEventListener("click", () => showLb(lbIndex + 1));
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
addEventListener("keydown", e => {
  if (!lb.classList.contains("is-open")) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") showLb(lbIndex - 1);
  if (e.key === "ArrowRight") showLb(lbIndex + 1);
});
let touchX = null; // swipe di HP
lb.addEventListener("touchstart", e => (touchX = e.touches[0].clientX), { passive: true });
lb.addEventListener("touchend", e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

/* ---------- 14. Timeline: garis terisi saat scroll ---------- */
const timeline = $("#timeline"), fill = $("#timelineFill");
function updateTimeline() {
  if (!timeline) return;
  const r = timeline.getBoundingClientRect();
  const p = Math.min(Math.max((innerHeight * 0.65 - r.top) / r.height, 0), 1);
  fill.style.transform = `scaleY(${p})`;
}
updateTimeline();

/* ---------- 15. FAQ accordion ---------- */
$$(".faq-item").forEach(item => {
  const q = $(".faq-item__q", item);
  q.addEventListener("click", () => {
    const open = !item.classList.contains("is-open");
    $$(".faq-item").forEach(i => {
      i.classList.remove("is-open");
      $(".faq-item__q", i).setAttribute("aria-expanded", "false");
    });
    item.classList.toggle("is-open", open);
    q.setAttribute("aria-expanded", open);
  });
});

/* ---------- 16. Form booking -> WhatsApp ---------- */
const form = $("#bookingForm");
const today = new Date().toISOString().split("T")[0];
$("#fDate").min = today;

function fmtDate(v) {
  if (!v) return "";
  return new Date(v + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
form.addEventListener("submit", e => {
  e.preventDefault();
  let ok = true;
  [["#fName"], ["#fService"]].forEach(([sel]) => {
    const el = $(sel), bad = !el.value.trim();
    el.closest(".field").classList.toggle("has-error", bad);
    if (bad) ok = false;
  });
  if (!ok) { $(".has-error input, .has-error select", form)?.focus(); return; }

  const time = $("#fTime").value;
  if (time && (time < "10:00" || time > "22:00")) {
    alert("Jam operasional kami 10.00 – 22.00 WIB. Silakan pilih jam di rentang tersebut.");
    return;
  }

  const lines = [
    "Halo 68 Royal Nails, saya ingin booking appointment 💅",
    "",
    `Nama: ${$("#fName").value.trim()}`,
    `Layanan: ${$("#fService").value}`,
    $("#fDate").value ? `Tanggal: ${fmtDate($("#fDate").value)}` : null,
    time ? `Jam: ${time} WIB` : null,
    $("#fNote").value.trim() ? `Catatan/ide desain: ${$("#fNote").value.trim()}` : null,
    "",
    "Terima kasih!"
  ].filter(l => l !== null);
  window.open(waLink(lines.join("\n")), "_blank", "noopener");
});
$$("#bookingForm input, #bookingForm select").forEach(el =>
  ["input", "change"].forEach(ev => el.addEventListener(ev, () => el.closest(".field").classList.remove("has-error"))));

/* ---------- 17. Footer ---------- */
$("#year").textContent = new Date().getFullYear();

onScroll();
