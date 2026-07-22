const body = document.body;
const introGate = document.getElementById("introGate");
const enterSite = document.getElementById("enterSite");
const siteHeader = document.getElementById("siteHeader");
const siteAudio = document.getElementById("siteAudio");
const audioControl = document.getElementById("audioControl");
const inquiryForm = document.getElementById("inquiryForm");
const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

const AUDIO_FADE_TARGET = 0.62;
const AUDIO_FADE_MS = 2600;
const CONTACT_EMAIL = "kfishamusic@gmail.com";

let audioFadeTimer = null;
let audioStarted = false;

function fadeAudioTo(target, duration, pauseAfter = false) {
  window.clearInterval(audioFadeTimer);

  const start = siteAudio.volume;
  const difference = target - start;
  const steps = Math.max(1, Math.floor(duration / 50));
  let currentStep = 0;

  audioFadeTimer = window.setInterval(() => {
    currentStep += 1;
    const progress = currentStep / steps;
    siteAudio.volume = Math.min(1, Math.max(0, start + difference * progress));

    if (currentStep >= steps) {
      window.clearInterval(audioFadeTimer);
      siteAudio.volume = target;

      if (pauseAfter && target === 0) {
        siteAudio.pause();
        audioControl.classList.add("paused");
      }
    }
  }, 50);
}

async function beginExperience() {
  enterSite.disabled = true;
  enterSite.querySelector("span").textContent = "Loading the archive...";

  try {
    siteAudio.volume = 0;
    await siteAudio.play();
    audioStarted = true;
    fadeAudioTo(AUDIO_FADE_TARGET, AUDIO_FADE_MS);

  } catch (error) {
    console.info("Audio could not begin automatically:", error);
  }

  introGate.classList.add("is-leaving");
  body.classList.remove("intro-open");

  window.setTimeout(() => {
    introGate.setAttribute("aria-hidden", "true");
    siteHeader.classList.add("visible");

    if (audioStarted) {
      audioControl.classList.add("visible");
    }

    document.querySelectorAll(".hero .reveal").forEach((element, index) => {
      window.setTimeout(() => element.classList.add("in-view"), 250 + index * 250);
    });
  }, 850);
}

enterSite.addEventListener("click", beginExperience);

audioControl.addEventListener("click", async () => {
  if (siteAudio.paused) {
    try {
      siteAudio.volume = 0;
      await siteAudio.play();
      fadeAudioTo(AUDIO_FADE_TARGET, 1200);
      audioControl.classList.remove("paused");
    } catch (error) {
      console.info("Audio playback failed:", error);
    }
  } else {
    fadeAudioTo(0, 900, true);
  }
});

siteAudio.addEventListener("ended", () => {
  audioControl.classList.add("paused");
});

window.addEventListener("scroll", () => {
  siteHeader.classList.toggle("scrolled", window.scrollY > 45);
});

menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -60px 0px",
  }
);

document.querySelectorAll(".reveal:not(.hero .reveal)").forEach((element) => {
  revealObserver.observe(element);
});

inquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(inquiryForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const artist = String(formData.get("artist") || "").trim();
  const interest = String(formData.get("interest") || "").trim();
  const budget = String(formData.get("budget") || "").trim();
  const message = String(formData.get("message") || "").trim();

  const subject = `Baitwell Inquiry — ${interest || "General"} — ${name || "New Contact"}`;
  const bodyCopy = [
    "New Baitwell Inquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Artist / Company: ${artist || "Not provided"}`,
    `Interested In: ${interest}`,
    `Budget: ${budget || "Not specified"}`,
    "",
    "Project Details:",
    message,
  ].join("\n");

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyCopy)}`;
  window.location.href = mailto;
});

document.getElementById("year").textContent = new Date().getFullYear();
