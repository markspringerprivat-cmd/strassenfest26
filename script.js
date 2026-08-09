(() => {
  "use strict";

  const SUBMIT_ENDPOINT = "";
  const STORAGE_KEY = "strassenfest-hilchenbach-registrations";

  const state = {
    step: 1,
    people: [],
    bringing: null,
    category: "",
    subtype: "",
    contribution: "",
    summaryBackStep: 2
  };

  const subtypeOptions = {
    Essen: ["Deftig", "Süß", "Beilage"],
    Getränke: ["Alkoholisch", "Nicht alkoholisch", "Zuckerhaltig", "Nicht zuckerhaltig", "Gemischt"]
  };

  const needsDefinitions = [
    { category: "Spielzeug", subtype: "", label: "Spielzeug" },
    { category: "Essen", subtype: "Deftig", label: "Essen · Deftig" },
    { category: "Essen", subtype: "Süß", label: "Essen · Süß" },
    { category: "Essen", subtype: "Beilage", label: "Essen · Beilage" },
    { category: "Getränke", subtype: "Alkoholisch", label: "Getränke · Alkoholisch" },
    { category: "Getränke", subtype: "Nicht alkoholisch", label: "Getränke · Nicht alkoholisch" },
    { category: "Getränke", subtype: "Zuckerhaltig", label: "Getränke · Zuckerhaltig" },
    { category: "Getränke", subtype: "Nicht zuckerhaltig", label: "Getränke · Nicht zuckerhaltig" },
    { category: "Getränke", subtype: "Gemischt", label: "Getränke · Gemischt" }
  ];

  const peopleRows = document.getElementById("peopleRows");
  const personError = document.getElementById("personError");
  const addPersonButton = document.getElementById("addPersonButton");
  const bringYes = document.getElementById("bringYes");
  const bringNo = document.getElementById("bringNo");
  const showNeeds = document.getElementById("showNeeds");
  const needsPanel = document.getElementById("needsPanel");
  const needsTableBody = document.getElementById("needsTableBody");
  const needsNote = document.getElementById("needsNote");
  const category = document.getElementById("category");
  const subtypeField = document.getElementById("subtypeField");
  const subtypeLabel = document.getElementById("subtypeLabel");
  const subtype = document.getElementById("subtype");
  const contribution = document.getElementById("contribution");
  const contributionError = document.getElementById("contributionError");
  const summaryPeople = document.getElementById("summaryPeople");
  const summaryContribution = document.getElementById("summaryContribution");
  const summaryBack = document.getElementById("summaryBack");
  const form = document.getElementById("registrationForm");
  const submitStatus = document.getElementById("submitStatus");
  const restartButton = document.getElementById("restartButton");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");

  let rowId = 0;

  function freezeDocumentPosition() {
    if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0);
  }

  window.addEventListener("scroll", freezeDocumentPosition, { passive: true });
  document.addEventListener("focusin", () => setTimeout(freezeDocumentPosition, 0));
  window.visualViewport?.addEventListener("scroll", freezeDocumentPosition, { passive: true });

  function addPersonRow(values = {}) {
    rowId += 1;
    const row = document.createElement("div");
    row.className = "person-row";
    row.dataset.rowId = String(rowId);
    row.innerHTML = `
      <input type="text" autocomplete="given-name" maxlength="50" placeholder="Vorname" aria-label="Vorname" value="${escapeAttr(values.firstName || "")}">
      <input type="text" autocomplete="family-name" maxlength="60" placeholder="Nachname" aria-label="Nachname" value="${escapeAttr(values.lastName || "")}">
      <input class="age-input" type="number" inputmode="numeric" min="0" max="120" placeholder="Alter" aria-label="Alter" value="${escapeAttr(values.age ?? "")}">
      <button class="remove-row" type="button" aria-label="Person entfernen">×</button>
    `;
    peopleRows.appendChild(row);
    updateRemoveButtons();
    return row;
  }

  function updateRemoveButtons() {
    const rows = [...peopleRows.querySelectorAll(".person-row")];
    rows.forEach((row) => {
      const button = row.querySelector(".remove-row");
      button.disabled = rows.length === 1;
    });
  }

  addPersonRow();

  addPersonButton.addEventListener("click", () => {
    personError.textContent = "";
    const row = addPersonRow();
    row.querySelector("input").focus({ preventScroll: true });
  });

  peopleRows.addEventListener("click", (event) => {
    const button = event.target.closest(".remove-row");
    if (!button || button.disabled) return;
    button.closest(".person-row")?.remove();
    updateRemoveButtons();
  });

  function readPeopleRows() {
    const rows = [...peopleRows.querySelectorAll(".person-row")];
    const people = [];

    for (const [index, row] of rows.entries()) {
      const inputs = row.querySelectorAll("input");
      const firstName = inputs[0].value.replace(/\s+/g, " ").trim();
      const lastName = inputs[1].value.replace(/\s+/g, " ").trim();
      const rawAge = inputs[2].value.trim();
      const allBlank = !firstName && !lastName && !rawAge;

      if (allBlank && rows.length > 1) continue;

      if (!firstName) return { ok: false, message: `Bitte in Zeile ${index + 1} den Vornamen eintragen.`, focus: inputs[0] };
      if (!lastName) return { ok: false, message: `Bitte in Zeile ${index + 1} den Nachnamen eintragen.`, focus: inputs[1] };

      const age = Number(rawAge);
      if (!rawAge || !Number.isFinite(age) || age < 0 || age > 120) {
        return { ok: false, message: `Bitte in Zeile ${index + 1} ein gültiges Alter zwischen 0 und 120 eintragen.`, focus: inputs[2] };
      }

      people.push({ firstName, lastName, age });
    }

    if (!people.length) return { ok: false, message: "Bitte mindestens eine Person eintragen.", focus: rows[0]?.querySelector("input") };
    return { ok: true, people };
  }

  function validatePeopleAndContinue() {
    const result = readPeopleRows();
    if (!result.ok) {
      personError.textContent = result.message;
      result.focus?.focus({ preventScroll: true });
      return false;
    }

    state.people = result.people;
    personError.textContent = "";
    return true;
  }

  function setStep(step) {
    state.step = step;
    document.querySelectorAll(".step").forEach((panel) => {
      panel.classList.toggle("active", Number(panel.dataset.step) === step);
    });
    document.querySelectorAll(".progress-dot").forEach((dot) => {
      const dotStep = Number(dot.dataset.progress);
      dot.classList.toggle("active", step <= 4 && dotStep === step);
    });
    document.querySelector(".step-progress").classList.toggle("hidden", step === 5);
    freezeDocumentPosition();
  }

  document.querySelector('[data-next="2"]').addEventListener("click", () => {
    if (!validatePeopleAndContinue()) return;
    renderNeedsTable();
    setStep(2);
  });

  bringYes.addEventListener("click", () => {
    state.bringing = true;
    state.summaryBackStep = 3;
    setStep(3);
  });

  bringNo.addEventListener("click", () => {
    state.bringing = false;
    state.category = "";
    state.subtype = "";
    state.contribution = "";
    state.summaryBackStep = 2;
    renderSummary();
    setStep(4);
  });

  showNeeds.addEventListener("click", () => {
    renderNeedsTable();
    needsPanel.classList.toggle("hidden");
  });

  function configureContributionFields(selectedCategory = "", selectedSubtype = "") {
    category.value = selectedCategory;
    state.category = selectedCategory;
    state.subtype = "";
    subtype.innerHTML = '<option value="">Bitte auswählen</option>';

    if (subtypeOptions[selectedCategory]) {
      subtypeField.classList.remove("hidden");
      subtypeLabel.textContent = selectedCategory === "Essen" ? "Art des Essens" : "Art des Getränks";
      subtypeOptions[selectedCategory].forEach((item) => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        subtype.appendChild(option);
      });
      subtype.value = selectedSubtype || "";
      state.subtype = subtype.value;
      contribution.disabled = !state.subtype;
      contribution.placeholder = state.subtype ? "z. B. Nudelsalat, Kuchen, Cola, Wasser …" : "Bitte zuerst beide Auswahlfelder treffen";
    } else if (selectedCategory === "Spielzeug") {
      subtypeField.classList.add("hidden");
      contribution.disabled = false;
      contribution.placeholder = "z. B. Wikingerschach, Federball, Straßenkreide …";
    } else {
      subtypeField.classList.add("hidden");
      contribution.disabled = true;
      contribution.placeholder = "Bitte zuerst die Auswahl oben treffen";
    }
  }

  needsTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-need-index]");
    if (!button) return;
    const def = needsDefinitions[Number(button.dataset.needIndex)];
    if (!def) return;
    state.bringing = true;
    state.summaryBackStep = 3;
    state.contribution = "";
    contribution.value = "";
    configureContributionFields(def.category, def.subtype);
    setStep(3);
  });

  category.addEventListener("change", () => {
    state.contribution = "";
    contribution.value = "";
    contributionError.textContent = "";
    configureContributionFields(category.value, "");
  });

  subtype.addEventListener("change", () => {
    state.subtype = subtype.value;
    state.contribution = "";
    contribution.value = "";
    contribution.disabled = !state.subtype;
    contribution.placeholder = state.subtype ? "z. B. Nudelsalat, Kuchen, Cola, Wasser …" : "Bitte zuerst beide Auswahlfelder treffen";
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
      category.focus({ preventScroll: true });
      return false;
    }
    if (subtypeOptions[state.category] && !state.subtype) {
      contributionError.textContent = "Bitte auch die Unterkategorie auswählen.";
      subtype.focus({ preventScroll: true });
      return false;
    }
    if (!state.contribution) {
      contributionError.textContent = "Bitte kurz eintragen, was du mitbringen möchtest.";
      contribution.focus({ preventScroll: true });
      return false;
    }
    contributionError.textContent = "";
    return true;
  }

  document.querySelector('[data-next="4"]').addEventListener("click", () => {
    if (!validateContribution()) return;
    state.bringing = true;
    state.summaryBackStep = 3;
    renderSummary();
    setStep(4);
  });

  document.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => setStep(Number(button.dataset.back)));
  });

  summaryBack.addEventListener("click", () => setStep(state.summaryBackStep));

  function renderSummary() {
    summaryPeople.innerHTML = state.people.map((person) => `
      <div class="summary-person">
        <span>${escapeHtml(person.firstName)}</span>
        <span>${escapeHtml(person.lastName)}</span>
        <span>${person.age}</span>
      </div>
    `).join("");

    if (!state.bringing) {
      summaryContribution.innerHTML = "<strong>Nein</strong> – es wird nichts mitgebracht.";
      return;
    }

    const type = state.subtype ? `${state.category} · ${state.subtype}` : state.category;
    summaryContribution.innerHTML = `<div><strong>${escapeHtml(type)}</strong></div><div>${escapeHtml(state.contribution)}</div>`;
  }

  function getLocalRegistrations() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function normalizeStoredContribution(entry) {
    const c = entry?.contribution;
    if (!c || entry?.bringing === false) return null;
    if (typeof c !== "object") return null;
    if (!c.category) return null;
    return {
      category: String(c.category),
      subtype: c.subtype ? String(c.subtype) : "",
      note: c.note ? String(c.note) : ""
    };
  }

  function renderNeedsTable() {
    const registrations = getLocalRegistrations();
    const counts = new Map(needsDefinitions.map((d) => [`${d.category}|${d.subtype}`, 0]));
    const examples = new Map(needsDefinitions.map((d) => [`${d.category}|${d.subtype}`, []]));

    registrations.forEach((entry) => {
      const c = normalizeStoredContribution(entry);
      if (!c) return;
      const key = `${c.category}|${c.subtype}`;
      if (!counts.has(key)) return;
      counts.set(key, counts.get(key) + 1);
      if (c.note && examples.get(key).length < 2) examples.get(key).push(c.note);
    });

    needsTableBody.innerHTML = needsDefinitions.map((def, index) => {
      const key = `${def.category}|${def.subtype}`;
      const count = counts.get(key) || 0;
      const sample = examples.get(key) || [];
      const title = sample.length ? `${def.label} – z. B. ${sample.map(escapeHtml).join(", ")}` : def.label;
      return `
        <tr title="${escapeAttr(title)}">
          <td>${escapeHtml(def.label)}</td>
          <td>${count}</td>
          <td><button type="button" class="need-add" data-need-index="${index}" aria-label="${escapeAttr(def.label)} hinzufügen">+</button></td>
        </tr>
      `;
    }).join("");

    needsNote.textContent = registrations.length
      ? "Die Zahlen basieren auf den auf diesem Gerät gespeicherten Anmeldungen."
      : "Noch keine gespeicherten Beiträge vorhanden. Du kannst trotzdem über + einen Bereich auswählen.";
  }

  function buildPayload() {
    return {
      id: crypto.randomUUID?.() || `registration-${Date.now()}`,
      createdAt: new Date().toISOString(),
      people: state.people.map((person) => ({ ...person })),
      bringing: Boolean(state.bringing),
      contribution: state.bringing ? {
        category: state.category,
        subtype: state.subtype || null,
        note: state.contribution
      } : null
    };
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
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.step !== 4) return;
    submitStatus.textContent = "Wird gesendet …";
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      await submitRegistration(buildPayload());
      submitStatus.textContent = "";
      setStep(5);
    } catch (error) {
      console.error(error);
      submitStatus.textContent = "Die Anmeldung konnte gerade nicht gesendet werden. Bitte später erneut versuchen.";
    } finally {
      submitButton.disabled = false;
    }
  });

  restartButton.addEventListener("click", () => {
    state.step = 1;
    state.people = [];
    state.bringing = null;
    state.category = "";
    state.subtype = "";
    state.contribution = "";
    state.summaryBackStep = 2;
    form.reset();
    peopleRows.innerHTML = "";
    addPersonRow();
    needsPanel.classList.add("hidden");
    configureContributionFields("", "");
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

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  function openModal(type) {
    if (type === "impressum") {
      modalTitle.textContent = "Impressum";
      modalContent.innerHTML = `<p><strong>Platzhalter für das Impressum</strong></p><p>Hier bitte später Veranstalter, Anschrift, vertretungsberechtigte Person und die gesetzlich erforderlichen Angaben eintragen.</p>`;
    }
    if (type === "kontakt") {
      modalTitle.textContent = "Kontakt";
      modalContent.innerHTML = `<p><strong>Kontakt zum Straßenfest</strong></p><p>E-Mail und weitere Kontaktdaten können hier später hinterlegt werden.</p>`;
    }
    if (type === "admin") renderAdminModal();
    modalBackdrop.hidden = false;
    modalClose.focus({ preventScroll: true });
  }

  function renderAdminModal() {
    const registrations = getLocalRegistrations();
    modalTitle.textContent = "Admin · Demo";
    if (!registrations.length) {
      modalContent.innerHTML = `<p>In diesem Browser wurden noch keine Demo-Anmeldungen gespeichert.</p><p>Für eine gemeinsame Teilnehmerliste auf mehreren Geräten braucht die GitHub-Pages-Version später einen externen Backend-/Datenbank-Endpunkt.</p>`;
      return;
    }

    const entries = registrations.slice().reverse().map((entry) => {
      const people = (entry.people || []).map((person) => {
        if (person.firstName || person.lastName) return `${escapeHtml(person.firstName || "")} ${escapeHtml(person.lastName || "")} (${person.age})`;
        return `${escapeHtml(person.name || "Unbekannt")} (${person.age})`;
      }).join(", ");
      const c = normalizeStoredContribution(entry);
      const contributionText = c ? `${escapeHtml(c.category)}${c.subtype ? ` · ${escapeHtml(c.subtype)}` : ""}: ${escapeHtml(c.note)}` : "Bringt nichts mit";
      return `<div class="admin-entry"><strong>${people}</strong><br>${contributionText}</div>`;
    }).join("");

    modalContent.innerHTML = `
      <p>${registrations.length} lokal gespeicherte ${registrations.length === 1 ? "Anmeldung" : "Anmeldungen"} auf diesem Gerät.</p>
      <div class="admin-list">${entries}</div>
      <div class="admin-actions">
        <button type="button" id="exportAdmin">JSON exportieren</button>
        <button type="button" id="clearAdmin">Lokal löschen</button>
      </div>`;

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

  document.querySelectorAll("[data-modal]").forEach((button) => button.addEventListener("click", () => openModal(button.dataset.modal)));
  modalClose.addEventListener("click", () => { modalBackdrop.hidden = true; });
  modalBackdrop.addEventListener("click", (event) => { if (event.target === modalBackdrop) modalBackdrop.hidden = true; });
  window.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modalBackdrop.hidden) modalBackdrop.hidden = true; });

  // Ruhiges, aber sichtbarer ausgeprägtes Feuerwerk an zufälligen Positionen.
  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && ctx) {
    const rockets = [];
    const particles = [];
    const palette = [
      "255, 222, 118",
      "255, 170, 195",
      "255, 246, 222",
      "209, 190, 255",
      "118, 225, 255"
    ];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nextLaunch = performance.now() + 500;

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

    function launchRocket(delayOffset = 0) {
      setTimeout(() => {
        const targetX = width * (0.08 + Math.random() * 0.84);
        const targetY = height * (0.10 + Math.random() * 0.38);
        const startX = targetX + (Math.random() - 0.5) * 80;
        rockets.push({
          x: startX,
          y: height + 15,
          vx: (targetX - startX) / 62,
          vy: -(1.85 + Math.random() * 0.48),
          targetY,
          alpha: 0.46,
          color: palette[Math.floor(Math.random() * palette.length)]
        });
      }, delayOffset);
    }

    function explode(rocket) {
      const count = 30 + Math.floor(Math.random() * 18);
      const speed = 0.82 + Math.random() * 0.52;
      const rings = Math.random() > .58 ? 2 : 1;
      for (let ring = 0; ring < rings; ring += 1) {
        for (let i = 0; i < count; i += 1) {
          const angle = (Math.PI * 2 * i) / count + Math.random() * .08;
          const variation = (0.58 + Math.random() * 0.62) * (ring === 0 ? 1 : .58);
          particles.push({
            x: rocket.x,
            y: rocket.y,
            vx: Math.cos(angle) * speed * variation,
            vy: Math.sin(angle) * speed * variation,
            gravity: .0105,
            alpha: .38 + Math.random() * .17,
            fade: .0021 + Math.random() * .00145,
            size: 1.35 + Math.random() * 2.3,
            color: rocket.color
          });
        }
      }
    }

    function animate(now) {
      ctx.clearRect(0, 0, width, height);

      if (document.visibilityState === "visible" && now >= nextLaunch) {
        const total = Math.random() > .62 ? 2 : 1;
        for (let i = 0; i < total; i += 1) launchRocket(i * 450);
        nextLaunch = now + 2200 + Math.random() * 2200;
      }

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i];
        const oldX = r.x;
        const oldY = r.y;
        r.x += r.vx;
        r.y += r.vy;
        ctx.beginPath();
        ctx.moveTo(oldX, oldY + 8);
        ctx.lineTo(r.x, r.y);
        ctx.strokeStyle = `rgba(${r.color}, ${r.alpha * .78})`;
        ctx.lineWidth = 1.45;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(r.x, r.y, 1.9, 0, Math.PI * 2);
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
        p.vx *= .996;
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
