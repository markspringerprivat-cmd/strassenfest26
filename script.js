(() => {
  "use strict";

  // Optional: Hier später einen eigenen HTTPS-Endpunkt eintragen.
  // Solange die URL leer bleibt, werden Demo-Anmeldungen nur lokal im Browser gespeichert.
  const SUBMIT_ENDPOINT = "";
  const STORAGE_KEY = "strassenfest-hilchenbach-registrations";

  const state = {
    step: 1,
    people: [],
    category: "",
    subtype: "",
    contribution: ""
  };

  const form = document.getElementById("registrationForm");
  const personName = document.getElementById("personName");
  const personAge = document.getElementById("personAge");
  const personError = document.getElementById("personError");
  const peoplePreview = document.getElementById("peoplePreview");
  const addPersonButton = document.getElementById("addPersonButton");

  const category = document.getElementById("category");
  const subtypeField = document.getElementById("subtypeField");
  const subtypeLabel = document.getElementById("subtypeLabel");
  const subtype = document.getElementById("subtype");
  const contribution = document.getElementById("contribution");
  const contributionError = document.getElementById("contributionError");

  const summaryPeople = document.getElementById("summaryPeople");
  const summaryContribution = document.getElementById("summaryContribution");
  const submitStatus = document.getElementById("submitStatus");
  const restartButton = document.getElementById("restartButton");

  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");

  const subtypeOptions = {
    Essen: ["Deftig", "Süß", "Beilage"],
    Getränke: ["Alkoholisch", "Nicht alkoholisch", "Zuckerhaltig", "Nicht zuckerhaltig", "Gemischt"]
  };

  function syncViewportHeight() {
    const height = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty("--app-height", `${Math.round(height)}px`);
  }

  syncViewportHeight();
  window.addEventListener("resize", syncViewportHeight, { passive: true });
  window.visualViewport?.addEventListener("resize", syncViewportHeight, { passive: true });
  window.visualViewport?.addEventListener("scroll", syncViewportHeight, { passive: true });

  function setStep(step) {
    state.step = step;

    document.querySelectorAll(".step").forEach((panel) => {
      panel.classList.toggle("active", Number(panel.dataset.step) === step);
    });

    document.querySelectorAll(".progress-dot").forEach((dot) => {
      const dotStep = Number(dot.dataset.progress);
      dot.classList.toggle("active", step <= 3 && dotStep === step);
    });

    document.querySelector(".step-progress").classList.toggle("hidden", step === 4);
  }

  function normalizeName(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function readCurrentPerson() {
    return {
      name: normalizeName(personName.value),
      age: personAge.value === "" ? "" : Number(personAge.value)
    };
  }

  function validateCurrentPerson({ allowEmpty = false } = {}) {
    const current = readCurrentPerson();
    const bothEmpty = !current.name && current.age === "";

    if (allowEmpty && bothEmpty) {
      personError.textContent = "";
      return { ok: true, empty: true, person: current };
    }

    if (!current.name) {
      personError.textContent = "Bitte einen Namen eintragen.";
      personName.focus();
      return { ok: false };
    }

    if (current.age === "" || !Number.isFinite(current.age) || current.age < 0 || current.age > 120) {
      personError.textContent = "Bitte ein gültiges Alter zwischen 0 und 120 eintragen.";
      personAge.focus();
      return { ok: false };
    }

    personError.textContent = "";
    return { ok: true, empty: false, person: current };
  }

  function addCurrentPerson({ clear = true } = {}) {
    const result = validateCurrentPerson();
    if (!result.ok) return false;

    state.people.push(result.person);

    if (clear) {
      personName.value = "";
      personAge.value = "";
      personName.focus();
    }

    updatePeoplePreview();
    return true;
  }

  function updatePeoplePreview() {
    if (!state.people.length) {
      peoplePreview.innerHTML = `
        <span class="people-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 19a5 5 0 0 1 10 0m1.5 0a4.2 4.2 0 0 1 5.5-4"/></svg>
        </span>
        <span class="people-empty">Bisher keine Personen hinzugefügt.</span>
      `;
      return;
    }

    peoplePreview.innerHTML = `
      <span class="people-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 19a5 5 0 0 1 10 0m1.5 0a4.2 4.2 0 0 1 5.5-4"/></svg>
      </span>
      <span class="people-list">
        ${state.people.map((person, index) => `
          <span class="person-chip">
            ${escapeHtml(person.name)} · ${person.age}
            <button type="button" data-remove-person="${index}" aria-label="${escapeHtml(person.name)} entfernen">×</button>
          </span>
        `).join("")}
      </span>
    `;
  }

  addPersonButton.addEventListener("click", () => {
    addCurrentPerson({ clear: true });
  });

  peoplePreview.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-person]");
    if (!button) return;

    const index = Number(button.dataset.removePerson);
    if (!Number.isInteger(index) || index < 0 || index >= state.people.length) return;

    state.people.splice(index, 1);
    updatePeoplePreview();
  });

  category.addEventListener("change", () => {
    state.category = category.value;
    state.subtype = "";
    subtype.innerHTML = '<option value="">Bitte auswählen</option>';
    contribution.value = "";
    state.contribution = "";
    contributionError.textContent = "";

    if (subtypeOptions[state.category]) {
      subtypeField.classList.remove("hidden");
      subtypeLabel.textContent = state.category === "Essen" ? "Art des Essens" : "Art des Getränks";

      subtypeOptions[state.category].forEach((item) => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        subtype.appendChild(option);
      });

      contribution.disabled = true;
      contribution.placeholder = "Bitte zuerst beide Auswahlfelder treffen";
    } else if (state.category === "Spielzeug") {
      subtypeField.classList.add("hidden");
      contribution.disabled = false;
      contribution.placeholder = "z. B. Wikingerschach, Federball, Straßenkreide …";
    } else {
      subtypeField.classList.add("hidden");
      contribution.disabled = true;
      contribution.placeholder = "Bitte zuerst die Auswahl oben treffen";
    }
  });

  subtype.addEventListener("change", () => {
    state.subtype = subtype.value;
    contribution.value = "";
    state.contribution = "";
    contribution.disabled = !state.subtype;
    contribution.placeholder = state.subtype
      ? "z. B. Nudelsalat, Kuchen, Cola, Wasser …"
      : "Bitte zuerst beide Auswahlfelder treffen";
  });

  contribution.addEventListener("input", () => {
    state.contribution = contribution.value.trim();
    contributionError.textContent = "";
  });

  function validateContribution() {
    state.category = category.value;
    state.subtype = subtype.value;
    state.contribution = contribution.value.trim();

    if (!state.category) {
      contributionError.textContent = "Bitte zuerst eine Kategorie auswählen.";
      category.focus();
      return false;
    }

    if (subtypeOptions[state.category] && !state.subtype) {
      contributionError.textContent = "Bitte auch die Unterkategorie auswählen.";
      subtype.focus();
      return false;
    }

    if (!state.contribution) {
      contributionError.textContent = "Bitte kurz eintragen, was du mitbringen möchtest.";
      contribution.focus();
      return false;
    }

    contributionError.textContent = "";
    return true;
  }

  function ensurePeopleBeforeNext() {
    const current = validateCurrentPerson({ allowEmpty: true });
    if (!current.ok) return false;

    if (!current.empty) {
      state.people.push(current.person);
      personName.value = "";
      personAge.value = "";
      updatePeoplePreview();
    }

    if (!state.people.length) {
      personError.textContent = "Bitte mindestens eine Person eintragen.";
      personName.focus();
      return false;
    }

    personError.textContent = "";
    return true;
  }

  function renderSummary() {
    summaryPeople.innerHTML = state.people
      .map((person) => `<div>${escapeHtml(person.name)} · ${person.age} Jahre</div>`)
      .join("");

    const type = state.subtype ? `${state.category} · ${state.subtype}` : state.category;
    summaryContribution.innerHTML =
      `<div><strong>${escapeHtml(type)}</strong></div>` +
      `<div>${escapeHtml(state.contribution)}</div>`;
  }

  document.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = Number(button.dataset.next);

      if (state.step === 1 && target === 2) {
        if (!ensurePeopleBeforeNext()) return;
      }

      if (state.step === 2 && target === 3) {
        if (!validateContribution()) return;
        renderSummary();
      }

      setStep(target);
    });
  });

  document.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => setStep(Number(button.dataset.back)));
  });

  function buildPayload() {
    return {
      id: crypto.randomUUID?.() || `registration-${Date.now()}`,
      createdAt: new Date().toISOString(),
      people: state.people.map((person) => ({ ...person })),
      contribution: {
        category: state.category,
        subtype: state.subtype || null,
        note: state.contribution
      }
    };
  }

  function getLocalRegistrations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveLocalRegistration(payload) {
    const registrations = getLocalRegistrations();
    registrations.push(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  }

  async function submitRegistration(payload) {
    if (!SUBMIT_ENDPOINT) {
      saveLocalRegistration(payload);
      return;
    }

    const response = await fetch(SUBMIT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.step !== 3) return;

    submitStatus.textContent = "Wird gesendet …";
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      await submitRegistration(buildPayload());
      submitStatus.textContent = "";
      setStep(4);
    } catch (error) {
      console.error(error);
      submitStatus.textContent =
        "Die Anmeldung konnte gerade nicht gesendet werden. Bitte später erneut versuchen.";
    } finally {
      submitButton.disabled = false;
    }
  });

  restartButton.addEventListener("click", () => {
    state.people = [];
    state.category = "";
    state.subtype = "";
    state.contribution = "";
    form.reset();
    subtypeField.classList.add("hidden");
    contribution.disabled = true;
    contribution.placeholder = "Bitte zuerst die Auswahl oben treffen";
    updatePeoplePreview();
    personError.textContent = "";
    contributionError.textContent = "";
    submitStatus.textContent = "";
    setStep(1);
  });

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function openModal(type) {
    if (type === "impressum") {
      modalTitle.textContent = "Impressum";
      modalContent.innerHTML = `
        <p><strong>Platzhalter für das Impressum</strong></p>
        <p>Hier bitte später Veranstalter, Anschrift, vertretungsberechtigte Person und
        die gesetzlich erforderlichen Angaben eintragen.</p>
      `;
    }

    if (type === "kontakt") {
      modalTitle.textContent = "Kontakt";
      modalContent.innerHTML = `
        <p><strong>Kontakt zum Straßenfest</strong></p>
        <p>E-Mail und weitere Kontaktdaten können hier später hinterlegt werden.</p>
      `;
    }

    if (type === "admin") {
      renderAdminModal();
    }

    modalBackdrop.hidden = false;
    modalClose.focus();
  }

  function renderAdminModal() {
    const registrations = getLocalRegistrations();
    modalTitle.textContent = "Admin · Demo";

    if (!registrations.length) {
      modalContent.innerHTML = `
        <p>In diesem Browser wurden noch keine Demo-Anmeldungen gespeichert.</p>
        <p>Für eine echte gemeinsame Teilnehmerliste braucht die GitHub-Pages-Version
        später einen externen Backend-/Datenbank-Endpunkt.</p>
      `;
      return;
    }

    const entries = registrations.slice().reverse().map((entry) => {
      const people = entry.people
        .map((person) => `${escapeHtml(person.name)} (${person.age})`)
        .join(", ");

      const contributionType = entry.contribution.subtype
        ? `${escapeHtml(entry.contribution.category)} · ${escapeHtml(entry.contribution.subtype)}`
        : escapeHtml(entry.contribution.category);

      return `
        <div class="admin-entry">
          <strong>${people}</strong><br>
          ${contributionType}: ${escapeHtml(entry.contribution.note)}
        </div>
      `;
    }).join("");

    modalContent.innerHTML = `
      <p>${registrations.length} lokal gespeicherte
      ${registrations.length === 1 ? "Anmeldung" : "Anmeldungen"} auf diesem Gerät.</p>
      <div class="admin-list">${entries}</div>
      <div class="admin-actions">
        <button type="button" id="exportAdmin">JSON exportieren</button>
        <button type="button" id="clearAdmin">Lokal löschen</button>
      </div>
    `;

    document.getElementById("exportAdmin")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(registrations, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `strassenfest-anmeldungen-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById("clearAdmin")?.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      renderAdminModal();
    });
  }

  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.modal));
  });

  function closeModal() {
    modalBackdrop.hidden = true;
  }

  modalClose.addEventListener("click", closeModal);

  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) closeModal();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalBackdrop.hidden) closeModal();
  });

  // Ruhiges, dezentes Feuerwerk im Hintergrund.
  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && ctx) {
    const rockets = [];
    const particles = [];
    const palette = [
      "255, 220, 116",
      "255, 171, 185",
      "255, 244, 218",
      "209, 190, 255"
    ];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nextLaunch = performance.now() + 1200;

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.round(canvas.clientWidth);
      height = Math.round(canvas.clientHeight);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.visualViewport?.addEventListener("resize", resizeCanvas, { passive: true });

    function launchRocket() {
      const x = width * (0.18 + Math.random() * 0.64);
      const targetY = height * (0.14 + Math.random() * 0.23);

      rockets.push({
        x,
        y: height + 10,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(1.15 + Math.random() * 0.3),
        targetY,
        alpha: 0.34,
        color: palette[Math.floor(Math.random() * palette.length)]
      });
    }

    function explode(rocket) {
      const count = 17 + Math.floor(Math.random() * 7);
      const speed = 0.45 + Math.random() * 0.25;

      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.12;
        const variation = 0.65 + Math.random() * 0.65;

        particles.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * speed * variation,
          vy: Math.sin(angle) * speed * variation,
          gravity: 0.008,
          alpha: 0.24 + Math.random() * 0.12,
          fade: 0.0024 + Math.random() * 0.0018,
          size: 1 + Math.random() * 1.1,
          color: rocket.color
        });
      }
    }

    function animate(now) {
      ctx.clearRect(0, 0, width, height);

      if (now >= nextLaunch && document.visibilityState === "visible") {
        launchRocket();
        nextLaunch = now + 4700 + Math.random() * 3200;
      }

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i];
        const oldY = r.y;

        r.x += r.vx;
        r.y += r.vy;

        ctx.beginPath();
        ctx.moveTo(r.x, oldY + 7);
        ctx.lineTo(r.x, r.y);
        ctx.strokeStyle = `rgba(${r.color}, ${r.alpha * 0.62})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r.x, r.y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r.color}, ${r.alpha})`;
        ctx.fill();

        if (r.y <= r.targetY) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.997;
        p.alpha -= p.fade;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha)})`;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }
})();
