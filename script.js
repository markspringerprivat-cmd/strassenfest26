(() => {
  "use strict";

  const SUBMIT_ENDPOINT = "";
  const STORAGE_KEY = "strassenfest-hilchenbach-registrations";
  const ADULT_PRICE = 20;
  const ADULT_AGE = 18;

  const state = {
    step: "1",
    people: [],
    bringing: null,
    category: "",
    subtype: "",
    contribution: "",
    contributionOrigin: "choice",
    presetContribution: false,
    paymentMethod: null,
    totalCost: 0
  };

  const appShell = document.getElementById("appShell");
  const registrationStage = document.getElementById("registrationStage");
  const wizardCard = document.getElementById("wizardCard");
  const footerBar = document.querySelector(".footer-bar");
  const form = document.getElementById("registrationForm");
  const peopleRows = document.getElementById("peopleRows");
  const personError = document.getElementById("personError");
  const addPersonButton = document.getElementById("addPersonButton");
  const peopleContinue = document.getElementById("peopleContinue");
  const bringYes = document.getElementById("bringYes");
  const bringNo = document.getElementById("bringNo");
  const showNeeds = document.getElementById("showNeeds");
  const needsTableBody = document.getElementById("needsTableBody");
  const needsNote = document.getElementById("needsNote");
  const contributionSelects = document.getElementById("contributionSelects");
  const presetSelection = document.getElementById("presetSelection");
  const presetSelectionText = document.getElementById("presetSelectionText");
  const contributionIntro = document.getElementById("contributionIntro");
  const category = document.getElementById("category");
  const subtypeField = document.getElementById("subtypeField");
  const subtypeLabel = document.getElementById("subtypeLabel");
  const subtype = document.getElementById("subtype");
  const contribution = document.getElementById("contribution");
  const contributionError = document.getElementById("contributionError");
  const contributionBack = document.getElementById("contributionBack");
  const contributionContinue = document.getElementById("contributionContinue");
  const paymentSummary = document.getElementById("paymentSummary");
  const paymentMethodArea = document.getElementById("paymentMethodArea");
  const noPaymentNote = document.getElementById("noPaymentNote");
  const paymentError = document.getElementById("paymentError");
  const paymentBack = document.getElementById("paymentBack");
  const paymentContinue = document.getElementById("paymentContinue");
  const summaryPeople = document.getElementById("summaryPeople");
  const summaryContribution = document.getElementById("summaryContribution");
  const summaryPayment = document.getElementById("summaryPayment");
  const submitStatus = document.getElementById("submitStatus");
  const restartButton = document.getElementById("restartButton");
  const stepProgress = document.getElementById("stepProgress");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");

  const subtypeOptions = {
    Essen: ["Deftig", "Süß", "Beilage"],
    Getränke: ["Alkoholisch", "Nicht alkoholisch", "Zuckerhaltig", "Nicht zuckerhaltig", "Gemischt"]
  };

  const needsBuckets = [
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

  const BACKGROUND_GEOMETRY = {
    width: 941,
    height: 1672,
    subtitleBottomY: 442,
    lift: 32
  };

  const viewport = {
    baseHeight: 0,
    baseWidth: 0,
    stageTop: 0,
    keyboardOpen: false,
    shift: 0,
    focusGroup: null,
    cardScrollBeforeKeyboard: 0,
    focusTimer: null
  };

  function currentVisibleHeight() {
    return Math.round(window.visualViewport?.height || window.innerHeight);
  }

  function currentPageWidth() {
    return Math.round(document.documentElement.clientWidth || window.innerWidth);
  }

  function activeEditable() {
    const active = document.activeElement;
    return active && wizardCard.contains(active) && active.matches("input, textarea, select")
      ? active
      : null;
  }

  function calculateStageTop(baseHeight, pageWidth) {
    const { width, height, subtitleBottomY, lift } = BACKGROUND_GEOMETRY;
    const backgroundBoxHeight = baseHeight + lift;
    const scale = Math.max(pageWidth / width, backgroundBoxHeight / height);
    const renderedHeight = height * scale;
    const centeredImageOffset = (backgroundBoxHeight - renderedHeight) / 2;
    const subtitleBottom = -lift + centeredImageOffset + subtitleBottomY * scale;

    // Maximal ungefähr 0,5 cm Abstand unter "in Hilchenbach".
    const gap = Math.max(8, Math.min(14, pageWidth * 0.027));
    return Math.max(112, Math.round(subtitleBottom + gap));
  }

  function updateCardAvailableHeight() {
    const footerHeight = Math.round(footerBar?.getBoundingClientRect().height || 50);
    const available = Math.max(240, viewport.baseHeight - viewport.stageTop - footerHeight - 8);
    document.documentElement.style.setProperty("--card-max-height", `${available}px`);
  }

  function setupStaticViewport(force = false) {
    const visibleHeight = currentVisibleHeight();
    const editable = activeEditable();
    const keyboardLikelyOpen = Boolean(
      editable && viewport.baseHeight && viewport.baseHeight - visibleHeight > 120
    );

    // Während die Tastatur offen ist wird die Grundgeometrie nicht neu berechnet.
    if (!force && keyboardLikelyOpen) return;

    viewport.baseHeight = visibleHeight;
    viewport.baseWidth = currentPageWidth();
    viewport.stageTop = calculateStageTop(viewport.baseHeight, viewport.baseWidth);

    document.documentElement.style.setProperty("--base-height", `${viewport.baseHeight}px`);
    document.documentElement.style.setProperty("--stage-top", `${viewport.stageTop}px`);
    updateCardAvailableHeight();
  }

  function keepFocusedRowVisible(active) {
    const row = active?.closest?.(".person-row");
    if (!row) return;

    const rowTop = row.offsetTop;
    const rowBottom = rowTop + row.offsetHeight;
    const viewTop = peopleRows.scrollTop;
    const viewBottom = viewTop + peopleRows.clientHeight;

    if (rowTop < viewTop + 4) {
      peopleRows.scrollTop = Math.max(0, rowTop - 4);
    } else if (rowBottom > viewBottom - 4) {
      peopleRows.scrollTop += rowBottom - viewBottom + 4;
    }
  }

  function focusGroupFor(active) {
    return active?.closest?.(".person-row") || active?.closest?.(".field") || active || null;
  }

  function setStageShift(px) {
    viewport.shift = Math.round(px || 0);
    document.documentElement.style.setProperty("--stage-shift", `${viewport.shift}px`);
  }

  function syncViewportPan(useVisualOffset = viewport.keyboardOpen) {
    const vv = window.visualViewport;
    const y = useVisualOffset && vv ? Math.round(vv.offsetTop || 0) : 0;

    // Nie horizontal verschieben.
    document.documentElement.style.setProperty("--viewport-pan-x", "0px");
    document.documentElement.style.setProperty("--viewport-pan-y", `${y}px`);
  }

  function clearFocusTimer() {
    if (viewport.focusTimer) {
      window.clearTimeout(viewport.focusTimer);
      viewport.focusTimer = null;
    }
  }

  function restoreClosedLayout() {
    clearFocusTimer();
    viewport.keyboardOpen = false;
    viewport.focusGroup = null;

    document.body.classList.remove("keyboard-open");
    setStageShift(0);
    syncViewportPan(false);

    wizardCard.scrollTop = viewport.cardScrollBeforeKeyboard || 0;

    window.setTimeout(() => setupStaticViewport(true), 80);
  }

  function positionFocusedGroup(active, group) {
    const vv = window.visualViewport;
    if (!vv || !group || !viewport.keyboardOpen) return;
    if (focusGroupFor(document.activeElement) !== group) return;

    syncViewportPan(true);
    keepFocusedRowVisible(active);

    requestAnimationFrame(() => {
      if (!viewport.keyboardOpen || focusGroupFor(document.activeElement) !== group) return;

      const currentGroup = focusGroupFor(document.activeElement);
      if (!currentGroup) return;

      const rect = currentGroup.getBoundingClientRect();
      const visualTop = rect.top - (vv.offsetTop || 0);
      const visualCenter = visualTop + rect.height / 2;

      // Einmalige Zielposition der aktiven Zeile oberhalb der Tastatur.
      const targetCenter = Math.max(118, Math.min(vv.height - 96, vv.height * 0.42));
      const delta = targetCenter - visualCenter;

      let nextShift = viewport.shift + delta;

      const stageRect = registrationStage.getBoundingClientRect();
      const stageVisualTop = stageRect.top - (vv.offsetTop || 0);
      const nextStageVisualTop = stageVisualTop + delta;

      if (nextStageVisualTop < 8) {
        nextShift += 8 - nextStageVisualTop;
      }

      setStageShift(nextShift);
    });
  }

  function scheduleFocusedGroupPosition(active, group, delay = 90) {
    clearFocusTimer();
    viewport.focusTimer = window.setTimeout(() => {
      viewport.focusTimer = null;
      positionFocusedGroup(active, group);
    }, delay);
  }

  function updateKeyboardPosition({ fromFocus = false } = {}) {
    const vv = window.visualViewport;
    if (!vv) {
      setupStaticViewport(true);
      return;
    }

    const visibleHeight = Math.round(vv.height);
    if (!viewport.baseHeight) setupStaticViewport(true);

    const active = activeEditable();
    const keyboardOpen = Boolean(active && viewport.baseHeight - visibleHeight > 120);

    if (!keyboardOpen) {
      if (viewport.keyboardOpen) {
        restoreClosedLayout();
      } else {
        setupStaticViewport(false);
        syncViewportPan(false);
      }
      return;
    }

    if (!viewport.keyboardOpen) {
      viewport.keyboardOpen = true;
      viewport.cardScrollBeforeKeyboard = wizardCard.scrollTop;
      viewport.focusGroup = null;
      document.body.classList.add("keyboard-open");
    }

    // Nur Browser-Panning kompensieren. Kein Nachregeln der Kartenposition.
    syncViewportPan(true);
    keepFocusedRowVisible(active);

    const group = focusGroupFor(active);

    // Die Position wird nur bei einem echten Wechsel der Zeile / des Eingabebereichs
    // neu gesetzt. Vorname -> Nachname -> Alter in derselben Zeile bleibt absolut ruhig.
    if (group && group !== viewport.focusGroup) {
      viewport.focusGroup = group;
      scheduleFocusedGroupPosition(active, group, fromFocus ? 45 : 100);
    }
  }

  setupStaticViewport(true);
  updateKeyboardPosition();

  window.addEventListener("resize", () => {
    window.setTimeout(() => updateKeyboardPosition(), 80);
  }, { passive: true });

  window.visualViewport?.addEventListener("resize", () => {
    // Während iOS die Tastatur animiert, nur den sichtbaren Viewport-Versatz kompensieren.
    if (viewport.keyboardOpen) syncViewportPan(true);

    const wasOpen = viewport.keyboardOpen;
    updateKeyboardPosition();

    // Beim erstmaligen Öffnen wartet die Fokusposition kurz, bis die Tastaturhöhe stabil ist.
    if (!wasOpen && viewport.keyboardOpen && viewport.focusGroup) {
      scheduleFocusedGroupPosition(activeEditable(), viewport.focusGroup, 130);
    }
  }, { passive: true });

  window.visualViewport?.addEventListener("scroll", () => {
    // iOS verschiebt beim Feldwechsel gelegentlich den VisualViewport.
    // Das wird direkt neutralisiert, ohne die Fokusposition neu zu berechnen.
    if (viewport.keyboardOpen) syncViewportPan(true);
  }, { passive: true });

  document.addEventListener("focusin", (event) => {
    if (!wizardCard.contains(event.target)) return;
    window.setTimeout(() => updateKeyboardPosition({ fromFocus: true }), 25);
  });

  document.addEventListener("focusout", () => {
    // Nicht zwischen Vorname/Nachname/Alter zurücksetzen.
    window.setTimeout(() => updateKeyboardPosition(), 180);
  });

  // Nur explizit dafür vorgesehene interne Bereiche dürfen scrollen.
  document.addEventListener("touchmove", (event) => {
    if (event.target.closest(".wizard-card, .people-rows, .needs-table-wrap, .summary-content, .modal")) return;
    event.preventDefault();
  }, { passive: false });

  function setStep(step) {
    state.step = String(step);
    document.querySelectorAll(".step").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.step === state.step);
    });

    const progressStep = state.step === "needs" ? 2 : Number(state.step);
    document.querySelectorAll(".progress-dot").forEach((dot) => {
      dot.classList.toggle("active", Number(dot.dataset.progress) === progressStep);
    });
    stepProgress.classList.toggle("hidden", state.step === "done");

    clearKeyboardAnchor();
    setStageShift(0);
    syncViewportPan(false);
    wizardCard.scrollTop = 0;
    window.setTimeout(updateKeyboardPosition, 20);
  }

  function createPersonRow(data = {}) {
    const row = document.createElement("div");
    row.className = "person-row";
    row.innerHTML = `
      <input type="text" class="person-first" autocomplete="given-name" maxlength="50" placeholder="z. B. Mark" aria-label="Vorname" value="${escapeAttr(data.firstName || "")}">
      <input type="text" class="person-last" autocomplete="family-name" maxlength="60" placeholder="z. B. Springer" aria-label="Nachname" value="${escapeAttr(data.lastName || "")}">
      <input type="number" class="person-age" inputmode="numeric" min="0" max="120" placeholder="33" aria-label="Alter" value="${data.age ?? ""}">
      <button type="button" class="remove-person" aria-label="Person entfernen">×</button>
    `;
    return row;
  }

  function refreshRemoveButtons() {
    const rows = [...peopleRows.querySelectorAll(".person-row")];
    rows.forEach((row) => {
      row.querySelector(".remove-person").disabled = rows.length === 1;
    });
  }

  function addPersonRow(data = {}, focus = false) {
    const row = createPersonRow(data);
    peopleRows.appendChild(row);
    refreshRemoveButtons();

    if (focus) {
      peopleRows.scrollTop = peopleRows.scrollHeight;
      window.setTimeout(() => row.querySelector(".person-first").focus({ preventScroll: true }), 30);
    }
  }

  addPersonButton.addEventListener("click", () => addPersonRow({}, true));

  peopleRows.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".remove-person");
    if (!removeButton || removeButton.disabled) return;
    removeButton.closest(".person-row")?.remove();
    refreshRemoveButtons();
  });

  function readPeople() {
    const rows = [...peopleRows.querySelectorAll(".person-row")];
    const people = [];

    for (const [index, row] of rows.entries()) {
      const firstName = row.querySelector(".person-first").value.replace(/\s+/g, " ").trim();
      const lastName = row.querySelector(".person-last").value.replace(/\s+/g, " ").trim();
      const rawAge = row.querySelector(".person-age").value;
      const age = rawAge === "" ? NaN : Number(rawAge);

      if (!firstName || !lastName || !Number.isFinite(age) || age < 0 || age > 120) {
        personError.textContent = `Bitte in Zeile ${index + 1} Vorname, Nachname und ein gültiges Alter eintragen.`;
        const target = !firstName ? row.querySelector(".person-first") : !lastName ? row.querySelector(".person-last") : row.querySelector(".person-age");
        target.focus({ preventScroll: true });
        updateKeyboardPosition();
        return null;
      }

      people.push({ firstName, lastName, age });
    }

    personError.textContent = "";
    return people;
  }

  peopleContinue.addEventListener("click", () => {
    const people = readPeople();
    if (!people) return;
    state.people = people;
    setStep(2);
  });

  function resetContribution() {
    state.category = "";
    state.subtype = "";
    state.contribution = "";
    state.presetContribution = false;
    category.value = "";
    subtype.innerHTML = '<option value="">Bitte auswählen</option>';
    subtypeField.classList.add("hidden");
    contribution.value = "";
    contribution.disabled = true;
    contribution.placeholder = "Bitte zuerst die Auswahl oben treffen";
    contributionSelects.classList.remove("hidden");
    presetSelection.classList.add("hidden");
    contributionIntro.textContent = "Wähle die Kategorie und beschreibe kurz deinen Beitrag.";
    contributionError.textContent = "";
  }

  function populateSubtype(categoryValue, selected = "") {
    subtype.innerHTML = '<option value="">Bitte auswählen</option>';
    if (!subtypeOptions[categoryValue]) {
      subtypeField.classList.add("hidden");
      return;
    }

    subtypeField.classList.remove("hidden");
    subtypeLabel.textContent = categoryValue === "Essen" ? "Art des Essens" : "Art des Getränks";
    subtypeOptions[categoryValue].forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      subtype.appendChild(option);
    });
    subtype.value = selected;
  }

  function openNormalContribution() {
    state.bringing = true;
    state.contributionOrigin = "choice";
    resetContribution();
    setStep(3);
  }

  function openPresetContribution(categoryValue, subtypeValue) {
    state.bringing = true;
    state.contributionOrigin = "needs";
    state.category = categoryValue;
    state.subtype = subtypeValue || "";
    state.contribution = "";
    state.presetContribution = true;

    category.value = categoryValue;
    populateSubtype(categoryValue, subtypeValue || "");
    contribution.value = "";
    contribution.disabled = false;
    contribution.placeholder = "Was genau möchtest du mitbringen?";

    contributionSelects.classList.add("hidden");
    presetSelection.classList.remove("hidden");
    presetSelectionText.textContent = subtypeValue ? `${categoryValue} · ${subtypeValue}` : categoryValue;
    contributionIntro.textContent = "Der Bereich ist bereits ausgewählt. Trage nur noch ein, was du mitbringst.";
    contributionError.textContent = "";
    setStep(3);
  }

  bringYes.addEventListener("click", openNormalContribution);

  bringNo.addEventListener("click", () => {
    state.bringing = false;
    state.category = "";
    state.subtype = "";
    state.contribution = "";
    state.paymentMethod = null;
    preparePayment();
    setStep(4);
  });

  showNeeds.addEventListener("click", () => {
    renderNeeds();
    setStep("needs");
  });

  category.addEventListener("change", () => {
    state.category = category.value;
    state.subtype = "";
    state.contribution = "";
    contribution.value = "";
    contributionError.textContent = "";
    populateSubtype(state.category, "");

    if (!state.category) {
      contribution.disabled = true;
      contribution.placeholder = "Bitte zuerst die Auswahl oben treffen";
    } else if (state.category === "Spielzeug") {
      contribution.disabled = false;
      contribution.placeholder = "z. B. Wikingerschach, Federball, Straßenkreide …";
    } else {
      contribution.disabled = true;
      contribution.placeholder = "Bitte zuerst beide Auswahlfelder treffen";
    }
  });

  subtype.addEventListener("change", () => {
    state.subtype = subtype.value;
    state.contribution = "";
    contribution.value = "";
    contribution.disabled = !state.subtype;
    contribution.placeholder = state.subtype ? "Was genau möchtest du mitbringen?" : "Bitte zuerst beide Auswahlfelder treffen";
  });

  contribution.addEventListener("input", () => {
    state.contribution = contribution.value.trim();
    contributionError.textContent = "";
  });

  function validateContribution() {
    state.category = category.value || state.category;
    state.subtype = subtype.value || state.subtype;
    state.contribution = contribution.value.trim();

    if (!state.presetContribution) {
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
    }

    if (!state.contribution) {
      contributionError.textContent = "Bitte kurz eintragen, was du mitbringen möchtest.";
      contribution.focus({ preventScroll: true });
      updateKeyboardPosition();
      return false;
    }

    contributionError.textContent = "";
    return true;
  }

  contributionBack.addEventListener("click", () => {
    setStep(state.contributionOrigin === "needs" ? "needs" : 2);
  });

  contributionContinue.addEventListener("click", () => {
    if (!validateContribution()) return;
    state.paymentMethod = null;
    preparePayment();
    setStep(4);
  });

  function getLocalRegistrations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function normalizeStoredContribution(entry) {
    if (!entry || entry.bringing === false || !entry.contribution) return null;
    return {
      category: entry.contribution.category || "",
      subtype: entry.contribution.subtype || "",
      note: entry.contribution.note || ""
    };
  }

  function renderNeeds() {
    const registrations = getLocalRegistrations();
    const contributions = registrations.map(normalizeStoredContribution).filter(Boolean);

    needsTableBody.innerHTML = needsBuckets.map((bucket) => {
      const matches = contributions.filter((item) => item.category === bucket.category && (item.subtype || "") === bucket.subtype);
      const notes = matches.map((item) => item.note).filter(Boolean).slice(0, 2);
      return `
        <tr>
          <td>
            <span class="needs-label">${escapeHtml(bucket.label)}</span>
            <span class="needs-items">${notes.length ? escapeHtml(notes.join(" · ")) : "Noch nichts eingetragen"}</span>
          </td>
          <td>${matches.length}</td>
          <td><button type="button" class="need-add" data-need-category="${escapeAttr(bucket.category)}" data-need-subtype="${escapeAttr(bucket.subtype)}" aria-label="${escapeAttr(bucket.label)} auswählen">+</button></td>
        </tr>`;
    }).join("");

    needsNote.textContent = registrations.length
      ? "Die Anzeige basiert derzeit auf den auf diesem Gerät gespeicherten Anmeldungen. Mit der späteren Datenbank werden hier alle Anmeldungen zusammengeführt."
      : "Noch keine gespeicherten Beiträge vorhanden. Du kannst trotzdem einen Bereich über + auswählen.";
  }

  needsTableBody.addEventListener("click", (event) => {
    const button = event.target.closest(".need-add");
    if (!button) return;
    openPresetContribution(button.dataset.needCategory, button.dataset.needSubtype || "");
  });

  function calculateCost() {
    const rows = state.people.map((person) => ({
      ...person,
      price: person.age >= ADULT_AGE ? ADULT_PRICE : 0
    }));
    return {
      rows,
      total: rows.reduce((sum, person) => sum + person.price, 0)
    };
  }

  function preparePayment() {
    const cost = calculateCost();
    state.totalCost = cost.total;

    paymentSummary.innerHTML = `
      ${cost.rows.map((person) => `
        <div class="payment-person">
          <span>${escapeHtml(person.firstName)} ${escapeHtml(person.lastName)} · ${person.age} Jahre</span>
          <span>${person.price.toFixed(2).replace(".", ",")} €</span>
        </div>`).join("")}
      <div class="payment-total"><span>Gesamt</span><strong>${cost.total.toFixed(2).replace(".", ",")} €</strong></div>`;

    document.querySelectorAll(".payment-choice").forEach((button) => button.classList.remove("selected"));
    paymentError.textContent = "";

    if (cost.total === 0) {
      state.paymentMethod = "none";
      paymentMethodArea.classList.add("hidden");
      noPaymentNote.classList.remove("hidden");
    } else {
      state.paymentMethod = null;
      paymentMethodArea.classList.remove("hidden");
      noPaymentNote.classList.add("hidden");
    }
  }

  document.querySelectorAll(".payment-choice").forEach((button) => {
    button.addEventListener("click", () => {
      state.paymentMethod = button.dataset.payment;
      document.querySelectorAll(".payment-choice").forEach((item) => item.classList.toggle("selected", item === button));
      paymentError.textContent = "";
    });
  });

  paymentBack.addEventListener("click", () => {
    setStep(state.bringing ? 3 : 2);
  });

  paymentContinue.addEventListener("click", () => {
    if (state.totalCost > 0 && !state.paymentMethod) {
      paymentError.textContent = "Bitte einen Zahlungsweg auswählen.";
      return;
    }
    renderSummary();
    setStep(5);
  });

  function paymentMethodLabel() {
    if (state.paymentMethod === "briefkasten") return "Barzahlung in den Briefkasten – Nassauer Straße 1, Springer, im Umschlag mit Namen.";
    if (state.paymentMethod === "abholung") return "Persönliche Abholung am 30. August ab 18 Uhr.";
    return "Keine Zahlung erforderlich.";
  }

  function renderSummary() {
    summaryPeople.innerHTML = state.people
      .map((person) => `<div>${escapeHtml(person.firstName)} ${escapeHtml(person.lastName)} · ${person.age} Jahre</div>`)
      .join("");

    if (!state.bringing) {
      summaryContribution.textContent = "Es wird nichts mitgebracht.";
    } else {
      const type = state.subtype ? `${state.category} · ${state.subtype}` : state.category;
      summaryContribution.innerHTML = `<div><strong>${escapeHtml(type)}</strong></div><div>${escapeHtml(state.contribution)}</div>`;
    }

    summaryPayment.innerHTML = `<div><strong>${state.totalCost.toFixed(2).replace(".", ",")} €</strong></div><div>${escapeHtml(paymentMethodLabel())}</div>`;
  }

  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => setStep(button.dataset.go));
  });

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
      } : null,
      payment: {
        adultAgeFrom: ADULT_AGE,
        adultPrice: ADULT_PRICE,
        total: state.totalCost,
        method: state.paymentMethod
      }
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
    if (state.step !== "5") return;
    submitStatus.textContent = "Wird gesendet …";
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      await submitRegistration(buildPayload());
      submitStatus.textContent = "";
      setStep("done");
    } catch (error) {
      console.error(error);
      submitStatus.textContent = "Die Anmeldung konnte gerade nicht gesendet werden. Bitte später erneut versuchen.";
    } finally {
      submitButton.disabled = false;
    }
  });

  restartButton.addEventListener("click", () => {
    state.step = "1";
    state.people = [];
    state.bringing = null;
    state.category = "";
    state.subtype = "";
    state.contribution = "";
    state.contributionOrigin = "choice";
    state.presetContribution = false;
    state.paymentMethod = null;
    state.totalCost = 0;
    form.reset();
    peopleRows.innerHTML = "";
    addPersonRow();
    resetContribution();
    personError.textContent = "";
    paymentError.textContent = "";
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
      const people = (entry.people || []).map((person) => `${escapeHtml(person.firstName || person.name || "")} ${escapeHtml(person.lastName || "")} (${person.age})`).join(", ");
      const c = normalizeStoredContribution(entry);
      const contributionText = c ? `${escapeHtml(c.category)}${c.subtype ? ` · ${escapeHtml(c.subtype)}` : ""}: ${escapeHtml(c.note)}` : "Bringt nichts mit";
      const pay = entry.payment?.total ?? 0;
      return `<div class="admin-entry"><strong>${people}</strong><br>${contributionText}<br>Zahlung: ${Number(pay).toFixed(2).replace(".", ",")} €</div>`;
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

  addPersonRow();

  // Ruhiges Feuerwerk: etwas größer und häufiger, aber mit langen, weichen Abständen.
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
    let nextLaunch = performance.now() + 450;

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.round(canvas.clientWidth);
      height = Math.round(canvas.clientHeight);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeCanvas();
    window.addEventListener("resize", () => { if (!viewport.keyboardOpen) resizeCanvas(); }, { passive: true });

    function launchRocket(delayOffset = 0) {
      setTimeout(() => {
        const targetX = width * (0.07 + Math.random() * 0.86);
        const targetY = height * (0.10 + Math.random() * 0.36);
        const startX = targetX + (Math.random() - 0.5) * 85;
        rockets.push({
          x: startX,
          y: height + 15,
          vx: (targetX - startX) / 62,
          vy: -(1.82 + Math.random() * 0.48),
          targetY,
          alpha: 0.45,
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
