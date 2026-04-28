const nav = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const counters = document.querySelectorAll("[data-count]");
const animateCounter = (element) => {
  const target = Number(element.dataset.count || 0);
  if (prefersReducedMotion) {
    element.textContent = String(target);
    return;
  }

  const duration = 900;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const decodeWords = document.querySelectorAll("[data-decode]");
const decodeCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const animateDecode = (element) => {
  const target = element.dataset.decode || element.textContent.trim();
  if (!target) return;

  if (prefersReducedMotion) {
    element.textContent = target;
    return;
  }

  const iterations = 16;
  let frame = 0;

  const tick = () => {
    const progress = frame / iterations;
    const lockedCharacters = Math.floor(progress * target.length);

    element.textContent = target
      .split("")
      .map((character, index) => {
        if (character === " " || index < lockedCharacters) return character;
        return decodeCharacters[Math.floor(Math.random() * decodeCharacters.length)];
      })
      .join("");

    frame += 1;

    if (frame <= iterations) {
      window.setTimeout(tick, 48);
    } else {
      element.textContent = target;
    }
  };

  tick();
};

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.7 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach(animateCounter);
}

if ("IntersectionObserver" in window) {
  const decodeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateDecode(entry.target);
          decodeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.7 }
  );

  decodeWords.forEach((word) => decodeObserver.observe(word));
} else {
  decodeWords.forEach(animateDecode);
}

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  const status = contactForm.querySelector(".form-status");
  const recipient = "ajeti@trockenbau-bes.de";

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const requiredFields = contactForm.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      const fieldValid = field.type === "checkbox" ? field.checked : field.checkValidity();
      field.classList.toggle("is-invalid", !fieldValid);

      if (!fieldValid) {
        isValid = false;
      }
    });

    const emailField = contactForm.querySelector("#email");
    if (emailField && !emailField.checkValidity()) {
      emailField.classList.add("is-invalid");
      isValid = false;
    }

    if (!isValid) {
      status.textContent = "Bitte füllen Sie alle Pflichtfelder korrekt aus.";
      status.className = "form-status is-error";
      return;
    }

    const formData = new FormData(contactForm);
    const subject = `Projektanfrage von ${formData.get("name")}`;
    const body = [
      `Name: ${formData.get("name")}`,
      `E-Mail: ${formData.get("email")}`,
      `Telefon: ${formData.get("phone") || "Nicht angegeben"}`,
      `Projektart: ${formData.get("project")}`,
      `Gewünschter Zeitraum: ${formData.get("timeline")}`,
      "",
      "Nachricht:",
      formData.get("message")
    ].join("\n");

    status.textContent = "Ihr E-Mail-Programm wird geöffnet.";
    status.className = "form-status is-success";

    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  contactForm.addEventListener("input", (event) => {
    if (event.target.matches("input, textarea, select")) {
      event.target.classList.remove("is-invalid");
      status.textContent = "";
      status.className = "form-status";
    }
  });
}
