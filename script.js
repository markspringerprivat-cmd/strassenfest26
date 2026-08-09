(() => {
  "use strict";

  const SUBMIT_ENDPOINT = "https://script.google.com/macros/s/AKfycbyR2jC7NmY5h2q__ZLJo-SeuNpGoXoJO-JNyNahOlkVybBKZoRlS1Mb859Gov8Hb3pkEw/exec";
  const STORAGE_KEY = "strassenfest-hilchenbach-registrations";
  const MY_REGISTRATION_KEY = "strassenfest-hilchenbach-my-registration";
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
    totalCost: 0,
    savedRegistration: null,
    submissionId: null,
    submitting: false
  };

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
  const validationToast = document.getElementById("validationToast");
  const validationToastText = document.getElementById("validationToastText");
  const myRegistrationButton = document.getElementById("myRegistrationButton");
  const myRegistrationHint = document.getElementById("myRegistrationHint");
  const accessCode = document.getElementById("accessCode");
  const downloadPdfButton = document.getElementById("downloadPdfButton");
  const codeContinueButton = document.getElementById("codeContinueButton");
  const codeCountdownHint = document.getElementById("codeCountdownHint");
  const openSavedRegistrationButton = document.getElementById("openSavedRegistrationButton");
  const apiTransportHost = document.getElementById("apiTransportHost");
  const existingContributions = document.getElementById("existingContributions");
  const existingContributionsList = document.getElementById("existingContributionsList");


  function secureRequestId(prefix = "sf") {
    const bytes = new Uint8Array(18);
    crypto.getRandomValues(bytes);
    const random = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${prefix}-${Date.now()}-${random}`;
  }

  function pollApiResult(requestId, deadline) {
    return new Promise((resolve, reject) => {
      if (Date.now() >= deadline) {
        reject(new Error(
          "Die Verbindung zur Datenbank hat zu lange gebraucht. Bitte versuche es erneut."
        ));
        return;
      }

      const callbackName = `__sfApi_${requestId.replace(/[^a-z0-9_]/gi, "_")}_${Date.now()}`;
      const script = document.createElement("script");
      let settled = false;
      let attemptTimer = null;

      const cleanup = () => {
        if (attemptTimer) {
          window.clearTimeout(attemptTimer);
          attemptTimer = null;
        }

        script.remove();

        try {
          delete window[callbackName];
        } catch {
          window[callbackName] = undefined;
        }
      };

      const retry = (delay = 380) => {
        if (settled) return;
        settled = true;
        cleanup();

        if (Date.now() >= deadline) {
          reject(new Error(
            "Die Verbindung zur Datenbank hat zu lange gebraucht. Bitte versuche es erneut."
          ));
          return;
        }

        window.setTimeout(() => {
          pollApiResult(requestId, deadline).then(resolve, reject);
        }, delay);
      };

      window[callbackName] = (message) => {
        if (settled) return;
        settled = true;
        cleanup();

        if (!message || message.pending) {
          window.setTimeout(() => {
            pollApiResult(requestId, deadline).then(resolve, reject);
          }, 320);
          return;
        }

        const result = message.result;

        if (result && result.ok) {
          resolve(result);
          return;
        }

        const error = new Error(
          result?.message || "Die Anfrage an die Datenbank ist fehlgeschlagen."
        );
        error.code = result?.error || "";
        reject(error);
      };

      const url = new URL(SUBMIT_ENDPOINT);
      url.searchParams.set("action", "poll");
      url.searchParams.set("requestId", requestId);
      url.searchParams.set("prefix", callbackName);
      url.searchParams.set("_", String(Date.now()));

      script.src = url.toString();
      script.async = true;

      script.onerror = () => retry(520);

      script.onload = () => {
        // Ein gültiger JSONP-Aufruf ruft den Callback während des Ladens auf.
        // Falls er aus irgendeinem Grund nicht aufgerufen wurde, wird neu versucht.
        if (!settled) retry(360);
      };

      // Wichtig: Auch wenn ein Browser den Script-Request weder mit onload noch
      // onerror beendet, geht es nach spätestens 4 Sekunden weiter.
      attemptTimer = window.setTimeout(() => retry(300), 4000);

      document.head.appendChild(script);
    });
  }

  async function apiRequest(action, data = {}) {
    if (!SUBMIT_ENDPOINT) {
      throw new Error("Die Datenbank ist noch nicht verbunden.");
    }

    const requestId = secureRequestId("sf");
    const deadline = Date.now() + 22000;

    const payload = {
      requestId,
      action,
      ...data
    };

    try {
      // Die POST-Antwort selbst wird bewusst nicht gelesen. Google Apps Script
      // leitet ContentService-Antworten auf googleusercontent.com um. Mit
      // no-cors darf der Browser den Schreibauftrag trotzdem absenden.
      await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        credentials: "omit",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8"
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("POST an Apps Script fehlgeschlagen:", error);
      throw new Error(
        "Die Datenbank konnte nicht erreicht werden. Bitte prüfe deine Internetverbindung."
      );
    }

    return pollApiResult(requestId, deadline);
  }

  function getSavedRegistrationIdentity() {
    try {
      const saved = JSON.parse(localStorage.getItem(MY_REGISTRATION_KEY) || "null");
      if (!saved?.code || !saved?.lastName) return null;
      return {
        code: String(saved.code),
        lastName: String(saved.lastName)
      };
    } catch {
      return null;
    }
  }

  function saveRegistrationIdentity(registration) {
    const firstLastName = registration?.people?.[0]?.lastName || "";
    if (!registration?.accessCode || !firstLastName) return;

    localStorage.setItem(MY_REGISTRATION_KEY, JSON.stringify({
      code: registration.accessCode,
      lastName: firstLastName
    }));

    refreshMyRegistrationHint();
  }

  function refreshMyRegistrationHint() {
    const saved = getSavedRegistrationIdentity();
    myRegistrationHint.textContent = saved
      ? `Gespeichert: ${saved.code}`
      : "Mit Anmeldecode wieder aufrufen";
  }

  function formatMoney(value) {
    return `${Number(value || 0).toFixed(2).replace(".", ",")} €`;
  }

  function registrationDetailsHtml(registration) {
    const people = (registration.people || [])
      .map((person) => `
        <div class="saved-person-line">
          <span>${escapeHtml(person.firstName)} ${escapeHtml(person.lastName)} · ${person.age} Jahre</span>
          <strong>${formatMoney(person.price)}</strong>
        </div>`)
      .join("");

    const contributionText = registration.bringing && registration.contribution
      ? `<strong>${escapeHtml(
          registration.contribution.subtype
            ? `${registration.contribution.category} · ${registration.contribution.subtype}`
            : registration.contribution.category
        )}</strong><br>${escapeHtml(registration.contribution.note || "")}`
      : "Es wird nichts mitgebracht.";

    return `
      <div class="saved-detail-group">
        <span class="saved-detail-label">Personen</span>
        ${people || "Keine Personen vorhanden."}
      </div>
      <div class="saved-detail-group">
        <span class="saved-detail-label">Mitbringsel</span>
        <div>${contributionText}</div>
      </div>
      <div class="saved-detail-group">
        <span class="saved-detail-label">Zahlung</span>
        <div><strong>${formatMoney(registration.payment?.total)}</strong></div>
        <div>${escapeHtml(paymentMethodLabelFor(registration.payment?.method))}</div>
      </div>`;
  }

  function paymentMethodLabelFor(method) {
    if (method === "briefkasten") {
      return "Barzahlung in den Briefkasten – Nassauer Straße 1, Springer, im Umschlag mit Namen.";
    }
    if (method === "abholung") {
      return "Persönliche Abholung am 30. August ab 18 Uhr.";
    }
    return "Keine Zahlung erforderlich.";
  }

  async function loadRegistration(code, lastName) {
    const result = await apiRequest("get", {
      code: String(code || "").trim(),
      lastName: String(lastName || "").trim()
    });

    if (!result.registration) {
      throw new Error("Die Anmeldung konnte nicht geladen werden.");
    }

    state.savedRegistration = result.registration;
    return result.registration;
  }

  function renderRegistrationModal(registration) {
    modalTitle.textContent = "Meine Anmeldung";
    modalContent.innerHTML = `
      <div class="modal-access-code">
        <span>Anmeldecode</span>
        <strong>${escapeHtml(registration.accessCode || "")}</strong>
      </div>
      <div class="modal-registration-details">
        ${registrationDetailsHtml(registration)}
      </div>
      <div class="modal-action-stack">
        <button type="button" class="primary-button" id="modalDownloadPdf">
          Alle Daten als PDF herunterladen
        </button>
      </div>`;

    document.getElementById("modalDownloadPdf")?.addEventListener("click", () => {
      downloadRegistrationPdf(registration);
    });
  }

  function openRegistrationLookup() {
    const saved = getSavedRegistrationIdentity();

    if (saved) {
      modalTitle.textContent = "Meine Anmeldung";
      modalContent.innerHTML = `<p class="modal-loading">Anmeldung wird geladen …</p>`;
      modalBackdrop.hidden = false;

      loadRegistration(saved.code, saved.lastName)
        .then(renderRegistrationModal)
        .catch((error) => {
          renderRegistrationLookupForm(error.message, saved);
        });

      return;
    }

    renderRegistrationLookupForm();
    modalBackdrop.hidden = false;
  }

  function renderRegistrationLookupForm(message = "", values = {}) {
    modalTitle.textContent = "Meine Anmeldung";
    modalContent.innerHTML = `
      <p>Gib deinen persönlichen Anmeldecode und einen Nachnamen aus der Anmeldung ein.</p>
      <form id="registrationLookupForm" class="lookup-form">
        <label class="field">
          <span>Anmeldecode</span>
          <input id="lookupCode" type="text" autocomplete="off"
                 placeholder="z. B. HIL26-ABCD-EFGH"
                 value="${escapeAttr(values.code || "")}">
        </label>
        <label class="field">
          <span>Nachname</span>
          <input id="lookupLastName" type="text" autocomplete="family-name"
                 placeholder="Nachname"
                 value="${escapeAttr(values.lastName || "")}">
        </label>
        <p class="field-error" id="lookupError">${escapeHtml(message)}</p>
        <button class="primary-button" type="submit">Anmeldung anzeigen</button>
      </form>`;

    const lookupForm = document.getElementById("registrationLookupForm");
    const codeInput = document.getElementById("lookupCode");
    const lastNameInput = document.getElementById("lookupLastName");
    const error = document.getElementById("lookupError");

    lookupForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const code = codeInput.value.trim();
      const lastName = lastNameInput.value.trim();

      if (!code || !lastName) {
        error.textContent = "Bitte Code und Nachname eingeben.";
        return;
      }

      error.textContent = "Wird geladen …";

      try {
        const registration = await loadRegistration(code, lastName);
        saveRegistrationIdentity(registration);
        renderRegistrationModal(registration);
      } catch (requestError) {
        error.textContent = requestError.message;
      }
    });
  }

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
    { category: "Getränke", subtype: "Gemischt", label: "Getränke · Gemischt" },
    { category: "Sonstiges", subtype: "", label: "Sonstiges" }
  ];

  let contributionStatsCache = [];

  const BACKGROUND_GEOMETRY = {
    width: 941,
    height: 1672,
    subtitleBottomY: 442,
    lift: 32
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function canAnimate() {
    return !reducedMotion.matches;
  }

  function animateElement(element, keyframes, options = {}) {
    if (!element || !canAnimate() || typeof element.animate !== "function") return null;
    return element.animate(keyframes, {
      duration: 220,
      easing: "cubic-bezier(.22, 1, .36, 1)",
      fill: "none",
      ...options
    });
  }

  function animateButtonPress(button) {
    animateElement(button, [
      { transform: "scale(1)" },
      { transform: "scale(.985)", offset: .42 },
      { transform: "scale(1)" }
    ], { duration: 180, easing: "cubic-bezier(.2,.8,.2,1)" });
  }

  function animateCreated(element) {
    animateElement(element, [
      { opacity: 0, transform: "translateY(-5px) scale(.992)" },
      { opacity: 1, transform: "translateY(0) scale(1)" }
    ], { duration: 240 });
  }


  const KEYBOARD_THRESHOLD = 120;
  const KEYBOARD_EDGE_GAP = 8;
  const RETURN_DURATION = 430;

  const viewport = {
    baseHeight: 0,
    baseWidth: 0,
    keyboardOpen: false,
    closeTimer: null,
    returning: false
  };

  const staticBackground = document.querySelector(".static-background");

  function visualViewportHeight() {
    return Math.round(window.visualViewport?.height || window.innerHeight);
  }

  function pageWidth() {
    return Math.round(document.documentElement.clientWidth || window.innerWidth);
  }

  function activeEditable() {
    const active = document.activeElement;
    return active && wizardCard.contains(active) && active.matches("input, textarea, select")
      ? active
      : null;
  }

  function calculateStageTop(baseHeight, width) {
    const { width: imageWidth, height: imageHeight, subtitleBottomY, lift } = BACKGROUND_GEOMETRY;
    const backgroundHeight = baseHeight + lift;
    const scale = Math.max(width / imageWidth, backgroundHeight / imageHeight);
    const renderedHeight = imageHeight * scale;
    const centeredOffset = (backgroundHeight - renderedHeight) / 2;
    const subtitleBottom = -lift + centeredOffset + subtitleBottomY * scale;
    const gap = Math.max(8, Math.min(14, width * 0.027));
    return Math.max(112, Math.round(subtitleBottom + gap));
  }

  function updateNormalGeometry() {
    if (viewport.keyboardOpen || viewport.returning) return;

    viewport.baseHeight = visualViewportHeight();
    viewport.baseWidth = pageWidth();

    const stageTop = calculateStageTop(viewport.baseHeight, viewport.baseWidth);
    const footerHeight = Math.round(footerBar?.getBoundingClientRect().height || 50);
    const cardHeight = Math.max(240, viewport.baseHeight - stageTop - footerHeight - 8);

    document.documentElement.style.setProperty("--base-height", `${viewport.baseHeight}px`);
    document.documentElement.style.setProperty("--stage-top", `${stageTop}px`);
    document.documentElement.style.setProperty("--card-max-height", `${cardHeight}px`);
  }

  function keyboardViewportReduced() {
    const vv = window.visualViewport;
    return Boolean(
      vv &&
      viewport.baseHeight &&
      viewport.baseHeight - Math.round(vv.height) > KEYBOARD_THRESHOLD
    );
  }

  function keyboardShouldStayOpen() {
    // Wenn der Fokus beim Tippen kurz zwischen zwei Feldern wechselt,
    // bleibt der Modus aktiv, solange der VisualViewport noch verkleinert ist.
    return keyboardViewportReduced() && Boolean(activeEditable() || viewport.keyboardOpen);
  }

  function applyKeyboardGeometry() {
    const vv = window.visualViewport;
    if (!vv) return;

    const visibleTop = Math.round(vv.offsetTop || 0);
    const visibleHeight = Math.round(vv.height);
    const cardHeight = Math.max(180, visibleHeight - KEYBOARD_EDGE_GAP * 2);

    document.documentElement.style.setProperty("--keyboard-top", `${visibleTop + KEYBOARD_EDGE_GAP}px`);
    document.documentElement.style.setProperty("--keyboard-card-height", `${cardHeight}px`);
    document.documentElement.style.setProperty("--viewport-offset-y", `${visibleTop}px`);
  }

  function scrollPersonRowIntoView(control) {
    const row = control?.closest?.(".person-row");
    if (!row) return;

    const top = row.offsetTop;
    const bottom = top + row.offsetHeight;
    const visibleTop = peopleRows.scrollTop;
    const visibleBottom = visibleTop + peopleRows.clientHeight;
    const margin = 8;

    if (top < visibleTop + margin) {
      peopleRows.scrollTop = Math.max(0, top - margin);
    } else if (bottom > visibleBottom - margin) {
      peopleRows.scrollTop += bottom - visibleBottom + margin;
    }
  }

  function scrollControlIntoCard(control, margin = 18) {
    if (!control) return;

    scrollPersonRowIntoView(control);

    const target = control.closest?.(".person-row") ||
      control.closest?.(".field") ||
      control;

    requestAnimationFrame(() => {
      const cardRect = wizardCard.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      if (targetRect.top < cardRect.top + margin) {
        wizardCard.scrollTop += targetRect.top - cardRect.top - margin;
      } else if (targetRect.bottom > cardRect.bottom - margin) {
        wizardCard.scrollTop += targetRect.bottom - cardRect.bottom + margin;
      }
    });
  }

  function openKeyboardMode() {
    if (viewport.keyboardOpen || viewport.returning) return;

    viewport.keyboardOpen = true;
    document.body.classList.add("keyboard-open");
    applyKeyboardGeometry();
    wizardCard.scrollTop = 0;

    window.setTimeout(() => scrollControlIntoCard(activeEditable(), 20), 80);
  }

  async function closeKeyboardMode({ animate = true } = {}) {
    if (!viewport.keyboardOpen && !viewport.returning) return;

    window.clearTimeout(viewport.closeTimer);

    const firstStage = registrationStage.getBoundingClientRect();
    const currentBackgroundOffset = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--viewport-offset-y")
    ) || 0;

    viewport.keyboardOpen = false;
    viewport.returning = true;

    // Normalen Zielzustand vorbereiten. Der Footer bleibt bis zum Start
    // seiner eigenen Einblendanimation unsichtbar, damit kein einzelner
    // heller Zwischenframe aufblitzt.
    footerBar.style.opacity = "0";
    document.body.classList.remove("keyboard-open");
    document.body.classList.add("keyboard-returning");
    document.documentElement.style.setProperty("--viewport-offset-y", "0px");
    document.documentElement.style.removeProperty("--keyboard-top");
    document.documentElement.style.removeProperty("--keyboard-card-height");

    // Jetzt darf die normale Geometrie neu bestimmt werden.
    viewport.returning = false;
    updateNormalGeometry();
    viewport.returning = true;

    const lastStage = registrationStage.getBoundingClientRect();
    const deltaY = firstStage.top - lastStage.top;

    const shouldAnimate = animate && canAnimate() && Math.abs(deltaY) > 1;

    if (shouldAnimate) {
      const stageAnimation = animateElement(registrationStage, [
        { transform: `translateX(-50%) translateY(${deltaY}px)` },
        { transform: "translateX(-50%) translateY(0)" }
      ], {
        duration: RETURN_DURATION,
        easing: "cubic-bezier(.22, 1, .36, 1)",
        fill: "both"
      });

      const backgroundAnimation = currentBackgroundOffset
        ? animateElement(staticBackground, [
            { transform: `translateY(${currentBackgroundOffset}px)` },
            { transform: "translateY(0)" }
          ], {
            duration: RETURN_DURATION,
            easing: "cubic-bezier(.22, 1, .36, 1)",
            fill: "both"
          })
        : null;

      const footerAnimation = animateElement(footerBar, [
        { opacity: 0, transform: "translateY(4px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], {
        duration: 300,
        delay: 120,
        easing: "cubic-bezier(.22,1,.36,1)",
        fill: "both"
      });

      footerAnimation?.finished
        .catch(() => {})
        .finally(() => {
          footerAnimation?.cancel();
          footerBar.style.removeProperty("opacity");
        });

      animateElement(wizardCard, [
        { opacity: .985 },
        { opacity: 1 }
      ], { duration: RETURN_DURATION });

      try {
        await stageAnimation?.finished;
      } catch {
        // Animation wurde durch einen neuen Fokus abgebrochen.
      }

      stageAnimation?.cancel();
      backgroundAnimation?.cancel();
    }

    wizardCard.scrollTop = 0;
    peopleRows.scrollTop = 0;

    if (!shouldAnimate) {
      footerBar.style.removeProperty("opacity");
    }

    viewport.returning = false;
    document.body.classList.remove("keyboard-returning");
    updateNormalGeometry();
  }

  function syncKeyboardMode() {
    if (keyboardShouldStayOpen()) {
      openKeyboardMode();
      applyKeyboardGeometry();
      return;
    }

    if (viewport.keyboardOpen && !keyboardViewportReduced()) {
      void closeKeyboardMode({ animate: true });
      return;
    }

    if (!viewport.keyboardOpen && !viewport.returning) {
      updateNormalGeometry();
    }
  }

  function resetKeyboardViewForStepChange() {
    const active = activeEditable();
    if (active) active.blur();

    wizardCard.scrollTop = 0;

    // Ist die Tastatur beim Klick auf "Weiter" noch physisch sichtbar,
    // bleibt die Kachel kurz oben angeheftet. Sobald der VisualViewport
    // wieder seine normale Höhe hat, übernimmt die normale Rückkehranimation.
    if (viewport.keyboardOpen && keyboardViewportReduced()) {
      return;
    }

    if (viewport.keyboardOpen || viewport.returning) {
      viewport.keyboardOpen = false;
      viewport.returning = false;
      document.body.classList.remove("keyboard-open", "keyboard-returning");
      document.documentElement.style.setProperty("--viewport-offset-y", "0px");
      document.documentElement.style.removeProperty("--keyboard-top");
      document.documentElement.style.removeProperty("--keyboard-card-height");
    }

    updateNormalGeometry();
  }

  updateNormalGeometry();

  window.addEventListener("resize", () => {
    if (viewport.keyboardOpen || viewport.returning) return;

    window.clearTimeout(viewport.closeTimer);
    viewport.closeTimer = window.setTimeout(updateNormalGeometry, 90);
  }, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      window.clearTimeout(viewport.closeTimer);
      viewport.closeTimer = window.setTimeout(() => {
        syncKeyboardMode();

        if (viewport.keyboardOpen) {
          scrollControlIntoCard(activeEditable(), 20);
        }
      }, 90);
    }, { passive: true });

    window.visualViewport.addEventListener("scroll", () => {
      if (viewport.keyboardOpen) applyKeyboardGeometry();
    }, { passive: true });
  }

  document.addEventListener("focusin", (event) => {
    if (!wizardCard.contains(event.target)) return;

    window.setTimeout(() => {
      syncKeyboardMode();
      if (viewport.keyboardOpen) scrollControlIntoCard(event.target, 20);
    }, 55);
  });

  document.addEventListener("focusout", () => {
    // Nicht beim Wechsel Vorname -> Nachname -> Alter zurückspringen.
    window.clearTimeout(viewport.closeTimer);
    viewport.closeTimer = window.setTimeout(syncKeyboardMode, 220);
  });

  document.addEventListener("touchmove", (event) => {
    if (event.target.closest(".wizard-card, .people-rows, .needs-table-wrap, .summary-content, .modal")) return;
    event.preventDefault();
  }, { passive: false });

  let validationToastTimer = null;

  function clearValidationMarks() {
    document.querySelectorAll(".validation-error-target").forEach((element) => {
      element.classList.remove("validation-error-target");
    });
  }

  function showValidationToast(message) {
    if (!validationToast || !validationToastText) return;

    validationToastText.textContent = message;
    validationToast.hidden = false;

    animateElement(validationToast, [
      { opacity: 0, transform: "translateX(-50%) translateY(-6px) scale(.99)" },
      { opacity: 1, transform: "translateX(-50%) translateY(0) scale(1)" }
    ], { duration: 220 });

    if (validationToastTimer) window.clearTimeout(validationToastTimer);
    validationToastTimer = window.setTimeout(() => {
      validationToast.hidden = true;
    }, 4200);
  }

  function centerPersonRow(row) {
    if (!row) return;
    const desired = row.offsetTop - Math.max(0, (peopleRows.clientHeight - row.offsetHeight) / 2);
    peopleRows.scrollTop = Math.max(0, desired);
  }

  function scrollErrorIntoView(target) {
    if (!target) return;

    const row = target.closest?.(".person-row");
    if (row) centerPersonRow(row);

    scrollControlIntoCard(target, 22);
  }

  function reportValidationError(message, target, { focus = true } = {}) {
    clearValidationMarks();
    showValidationToast(message);

    const marker = target?.closest?.(".person-row") || target?.closest?.(".field") || target;
    marker?.classList?.add("validation-error-target");

    scrollErrorIntoView(target);

    if (focus && target?.focus) {
      window.setTimeout(() => {
        target.focus({ preventScroll: true });
        scrollErrorIntoView(target);
        syncKeyboardMode();
        if (viewport.keyboardOpen) scrollControlIntoCard(target, 22);
      }, 30);
    }
  }

  validationToast?.addEventListener("click", () => {
    validationToast.hidden = true;
  });

  document.addEventListener("input", (event) => {
    event.target.closest?.(".validation-error-target")?.classList.remove("validation-error-target");
  });

  document.addEventListener("change", (event) => {
    event.target.closest?.(".validation-error-target")?.classList.remove("validation-error-target");
  });

  function setStep(step) {
    const nextStep = String(step);
    const currentPanel = document.querySelector(".step.active");
    const nextPanel = document.querySelector(`.step[data-step="${CSS.escape(nextStep)}"]`);

    if (!nextPanel || nextPanel === currentPanel) return;

    state.step = nextStep;
    resetKeyboardViewForStepChange();

    currentPanel?.classList.remove("active");
    nextPanel.classList.add("active");

    const progressStep = state.step === "needs" ? 2 : Number(state.step);
    document.querySelectorAll(".progress-dot").forEach((dot) => {
      dot.classList.toggle("active", Number(dot.dataset.progress) === progressStep);
    });
    stepProgress.classList.toggle("hidden", ["code", "done"].includes(state.step));

    wizardCard.scrollTop = 0;
    updateNormalGeometry();

    animateElement(nextPanel, [
      { opacity: 0, transform: "translateY(7px) scale(.996)" },
      { opacity: 1, transform: "translateY(0) scale(1)" }
    ], { duration: 260 });

    animateElement(wizardCard, [
      { transform: "scale(.997)" },
      { transform: "scale(1)" }
    ], { duration: 230 });
  }

  let personRowSerial = 0;

  function createPersonRow(data = {}) {
    const rowId = ++personRowSerial;
    const row = document.createElement("div");
    row.className = "person-row";
    row.dataset.rowId = String(rowId);

    row.innerHTML = `
      <input type="text"
             class="person-first"
             name="guest_first_${rowId}"
             autocomplete="off"
             autocapitalize="words"
             spellcheck="false"
             data-form-type="other"
             data-lpignore="true"
             maxlength="50"
             placeholder="z. B. Mark"
             aria-label="Vorname"
             value="${escapeAttr(data.firstName || "")}">
      <input type="text"
             class="person-last"
             name="guest_last_${rowId}"
             autocomplete="off"
             autocapitalize="words"
             spellcheck="false"
             data-form-type="other"
             data-lpignore="true"
             maxlength="60"
             placeholder="z. B. Springer"
             aria-label="Nachname"
             value="${escapeAttr(data.lastName || "")}">
      <input type="number"
             class="person-age"
             name="guest_age_${rowId}"
             autocomplete="off"
             inputmode="numeric"
             min="0"
             max="120"
             placeholder="33"
             aria-label="Alter"
             value="${data.age ?? ""}">
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
    const hasInitialData = Boolean(data.firstName || data.lastName || data.age !== undefined);
    const row = createPersonRow(data);

    peopleRows.appendChild(row);
    refreshRemoveButtons();
    animateCreated(row);

    const inputs = [...row.querySelectorAll("input")];

    if (!hasInitialData) {
      // Neue Zeilen immer garantiert leer anlegen.
      inputs.forEach((input) => {
        input.value = "";
        input.setAttribute("value", "");
      });
    }

    if (!focus) return row;

    const first = row.querySelector(".person-first");

    // WICHTIG für iPhone / mobile Browser:
    // Der Fokus wird direkt im ursprünglichen Klick-Ereignis gesetzt.
    // Dadurch darf der Browser die Bildschirmtastatur sofort öffnen.
    first.focus({ preventScroll: true });

    // Die neue Zeile direkt in den sichtbaren Bereich der Personenliste holen.
    // Kein scrollIntoView(), weil das die komplette Webseite verschieben könnte.
    peopleRows.scrollTop = peopleRows.scrollHeight;

    // Nach dem Layout-Update die Position noch einmal sauber ausrichten.
    requestAnimationFrame(() => {
      centerPersonRow(row);

      requestAnimationFrame(() => {
        // Falls die Tastatur inzwischen sichtbar ist, wird nur der Inhalt
        // innerhalb der oben angehefteten Kachel zum neuen Eintrag gescrollt.
        syncKeyboardMode();

        if (viewport.keyboardOpen) {
          scrollControlIntoCard(first, 20);
        }
      });
    });

    return row;
  }

  addPersonButton.addEventListener("click", () => {
    addPersonRow({}, true);
  });

  peopleRows.addEventListener("click", async (event) => {
    const removeButton = event.target.closest(".remove-person");
    if (!removeButton || removeButton.disabled) return;

    const row = removeButton.closest(".person-row");
    if (!row) return;

    const animation = animateElement(row, [
      { opacity: 1, transform: "translateY(0) scale(1)" },
      { opacity: 0, transform: "translateY(-5px) scale(.985)" }
    ], { duration: 180, easing: "cubic-bezier(.4,0,.2,1)" });

    try {
      await animation?.finished;
    } catch {}

    row.remove();
    refreshRemoveButtons();
  });

  function readPeople() {
    const rows = [...peopleRows.querySelectorAll(".person-row")];
    const people = [];

    for (const [index, row] of rows.entries()) {
      const firstInput = row.querySelector(".person-first");
      const lastInput = row.querySelector(".person-last");
      const ageInput = row.querySelector(".person-age");

      const firstName = firstInput.value.replace(/\s+/g, " ").trim();
      const lastName = lastInput.value.replace(/\s+/g, " ").trim();
      const rawAge = ageInput.value;
      const age = rawAge === "" ? NaN : Number(rawAge);

      let target = null;
      let detail = "";

      if (!firstName) {
        target = firstInput;
        detail = "Vorname fehlt.";
      } else if (!lastName) {
        target = lastInput;
        detail = "Nachname fehlt.";
      } else if (!Number.isFinite(age) || age < 0 || age > 120) {
        target = ageInput;
        detail = "Bitte ein Alter zwischen 0 und 120 Jahren eintragen.";
      }

      if (target) {
        const message = `Fehler in Zeile ${index + 1}: ${detail}`;
        personError.textContent = message;
        reportValidationError(message, target);
        return null;
      }

      people.push({ firstName, lastName, age });
    }

    clearValidationMarks();
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
    existingContributions.classList.add("hidden");
    existingContributionsList.innerHTML = "";
    contributionSelects.classList.remove("hidden");
    presetSelection.classList.add("hidden");
    contributionIntro.textContent = "Wähle die Kategorie und beschreibe kurz deinen Beitrag.";
    contributionError.textContent = "";
  }

  function matchingContributionStats(categoryValue, subtypeValue = "") {
    return contributionStatsCache.find((item) =>
      item.category === categoryValue &&
      (item.subtype || "") === (subtypeValue || "")
    ) || null;
  }

  function renderExistingContributions(categoryValue = state.category, subtypeValue = state.subtype) {
    if (!existingContributions || !existingContributionsList) return;

    const needsSubtype = Boolean(subtypeOptions[categoryValue]);

    if (!categoryValue || (needsSubtype && !subtypeValue)) {
      existingContributions.classList.add("hidden");
      existingContributionsList.innerHTML = "";
      return;
    }

    const match = matchingContributionStats(categoryValue, subtypeValue);
    const notes = Array.isArray(match?.notes)
      ? match.notes.filter(Boolean)
      : [];

    existingContributions.classList.remove("hidden");

    if (!notes.length) {
      existingContributionsList.innerHTML = `
        <div class="existing-contribution-empty">
          In diesem Bereich wurde bisher noch nichts Konkretes eingetragen.
        </div>`;
      return;
    }

    existingContributionsList.innerHTML = notes
      .map((note) => `<div class="existing-contribution-item">${escapeHtml(note)}</div>`)
      .join("");
  }

  async function refreshContributionStats({ quiet = true } = {}) {
    try {
      const result = await apiRequest("stats");
      contributionStatsCache = Array.isArray(result.stats) ? result.stats : [];
      renderExistingContributions();
      return contributionStatsCache;
    } catch (error) {
      if (!quiet) throw error;
      return contributionStatsCache;
    }
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
    void refreshContributionStats();
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
    renderExistingContributions(categoryValue, subtypeValue || "");
    setStep(3);
    void refreshContributionStats();
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
    clearValidationMarks();
    populateSubtype(state.category, "");

    if (!state.category) {
      contribution.disabled = true;
      contribution.placeholder = "Bitte zuerst die Auswahl oben treffen";
    } else if (state.category === "Spielzeug") {
      contribution.disabled = false;
      contribution.placeholder = "z. B. Wikingerschach, Federball, Straßenkreide …";
    } else if (state.category === "Sonstiges") {
      contribution.disabled = false;
      contribution.placeholder = "z. B. Besteck, Servietten, Müllbeutel …";
    } else {
      contribution.disabled = true;
      contribution.placeholder = "Bitte zuerst beide Auswahlfelder treffen";
    }

    renderExistingContributions(state.category, "");
  });

  subtype.addEventListener("change", () => {
    state.subtype = subtype.value;
    state.contribution = "";
    contribution.value = "";
    contribution.disabled = !state.subtype;
    contribution.placeholder = state.subtype ? "Was genau möchtest du mitbringen?" : "Bitte zuerst beide Auswahlfelder treffen";
    clearValidationMarks();
    renderExistingContributions(state.category, state.subtype);
  });

  contribution.addEventListener("input", () => {
    state.contribution = contribution.value.trim();
    contributionError.textContent = "";
    contribution.closest(".field")?.classList.remove("validation-error-target");
  });

  function validateContribution() {
    state.category = category.value || state.category;
    state.subtype = subtype.value || state.subtype;
    state.contribution = contribution.value.trim();

    if (!state.presetContribution) {
      if (!state.category) {
        const message = "Bitte zuerst eine Kategorie auswählen.";
        contributionError.textContent = message;
        reportValidationError(message, category);
        return false;
      }

      if (subtypeOptions[state.category] && !state.subtype) {
        const message = "Bitte auch die Unterkategorie auswählen.";
        contributionError.textContent = message;
        reportValidationError(message, subtype);
        return false;
      }
    }

    if (!state.contribution) {
      const message = "Bitte kurz eintragen, was du mitbringen möchtest.";
      contributionError.textContent = message;
      reportValidationError(message, contribution);
      return false;
    }

    clearValidationMarks();
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

  function renderNeedsFromStats(stats, note) {
    needsTableBody.innerHTML = needsBuckets.map((bucket) => {
      const match = stats.find((item) =>
        item.category === bucket.category &&
        (item.subtype || "") === bucket.subtype
      );

      const count = Number(match?.count || 0);
      const notes = Array.isArray(match?.notes) ? match.notes.slice(0, 3) : [];

      return `
        <tr>
          <td>
            <span class="needs-label">${escapeHtml(bucket.label)}</span>
            <span class="needs-items">${notes.length ? escapeHtml(notes.join(" · ")) : "Noch nichts eingetragen"}</span>
          </td>
          <td>${count}</td>
          <td>
            <button type="button"
                    class="need-add"
                    data-need-category="${escapeAttr(bucket.category)}"
                    data-need-subtype="${escapeAttr(bucket.subtype)}"
                    aria-label="${escapeAttr(bucket.label)} auswählen">+</button>
          </td>
        </tr>`;
    }).join("");

    needsNote.textContent = note;
  }

  async function renderNeeds() {
    needsTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="needs-loading">Zentrale Planung wird geladen …</td>
      </tr>`;
    needsNote.textContent = "Die Angaben werden aus der gemeinsamen Anmeldung geladen.";

    try {
      const result = await apiRequest("stats");
      contributionStatsCache = Array.isArray(result.stats) ? result.stats : [];
      renderNeedsFromStats(
        contributionStatsCache,
        "Die Anzeige berücksichtigt die bisher zentral gespeicherten Anmeldungen."
      );
    } catch (error) {
      const registrations = getLocalRegistrations();
      const contributions = registrations
        .map(normalizeStoredContribution)
        .filter(Boolean);

      const localStats = needsBuckets.map((bucket) => {
        const matches = contributions.filter((item) =>
          item.category === bucket.category &&
          (item.subtype || "") === bucket.subtype
        );

        return {
          category: bucket.category,
          subtype: bucket.subtype,
          count: matches.length,
          notes: matches.map((item) => item.note).filter(Boolean)
        };
      });

      renderNeedsFromStats(
        localStats,
        "Die zentrale Planung ist gerade nicht erreichbar. Angezeigt werden ersatzweise nur Daten dieses Geräts."
      );
    }
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
      const message = "Bitte einen Zahlungsweg auswählen.";
      paymentError.textContent = message;
      const paymentChoices = document.querySelector(".payment-choice-grid");
      reportValidationError(message, paymentChoices, { focus: false });
      return;
    }
    renderSummary();
    setStep(5);
  });

  function paymentMethodLabel() {
    return paymentMethodLabelFor(state.paymentMethod);
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
    if (!state.submissionId) {
      state.submissionId = crypto.randomUUID?.() ||
        `registration-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    }

    return {
      id: state.submissionId,
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

  function pollCreatedRegistration(registrationId, deadline) {
    return new Promise((resolve, reject) => {
      if (Date.now() >= deadline) {
        reject(new Error(
          "Die Anmeldung wurde möglicherweise gespeichert, aber die Bestätigung konnte nicht geladen werden. Bitte nicht erneut absenden. Lade die Seite kurz neu und prüfe „Meine Anmeldung“."
        ));
        return;
      }

      const callbackName = `__sfCreate_${String(registrationId).replace(/[^a-z0-9_]/gi, "_")}_${Date.now()}`;
      const script = document.createElement("script");
      let settled = false;
      let attemptTimer = null;

      const cleanup = () => {
        if (attemptTimer) {
          window.clearTimeout(attemptTimer);
          attemptTimer = null;
        }

        script.remove();

        try {
          delete window[callbackName];
        } catch {
          window[callbackName] = undefined;
        }
      };

      const retry = (delay = 450) => {
        if (settled) return;
        settled = true;
        cleanup();

        if (Date.now() >= deadline) {
          reject(new Error(
            "Die Anmeldung wurde möglicherweise gespeichert, aber die Bestätigung konnte nicht geladen werden. Bitte nicht erneut absenden. Lade die Seite kurz neu und prüfe „Meine Anmeldung“."
          ));
          return;
        }

        window.setTimeout(() => {
          pollCreatedRegistration(registrationId, deadline).then(resolve, reject);
        }, delay);
      };

      window[callbackName] = (message) => {
        if (settled) return;
        settled = true;
        cleanup();

        if (!message || message.pending) {
          window.setTimeout(() => {
            pollCreatedRegistration(registrationId, deadline).then(resolve, reject);
          }, 450);
          return;
        }

        const result = message.result;

        if (result?.ok && result.registration) {
          resolve(result.registration);
          return;
        }

        reject(new Error(
          result?.message || "Die gespeicherte Anmeldung konnte nicht bestätigt werden."
        ));
      };

      const url = new URL(SUBMIT_ENDPOINT);
      url.searchParams.set("action", "registrationstatus");
      url.searchParams.set("registrationId", registrationId);
      url.searchParams.set("prefix", callbackName);
      url.searchParams.set("_", String(Date.now()));

      script.src = url.toString();
      script.async = true;

      script.onerror = () => retry(650);

      script.onload = () => {
        if (!settled) retry(420);
      };

      // Verhindert ein endloses „Wird gespeichert …“, wenn genau ein
      // Browser-/Netzwerkrequest hängen bleibt.
      attemptTimer = window.setTimeout(() => retry(300), 4000);

      document.head.appendChild(script);
    });
  }

  async function submitRegistration(payload) {
    // Jede neue Anmeldung hat eine eigene submissionId. Sie ist NICHT an das
    // Gerät gekoppelt. Dieselbe ID wird nur bei einem Retry derselben Anmeldung
    // wiederverwendet, damit keine Duplikate entstehen.
    const controller = typeof AbortController !== "undefined"
      ? new AbortController()
      : null;

    const postTimeout = controller
      ? window.setTimeout(() => controller.abort(), 10000)
      : null;

    let postWarning = null;

    try {
      await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        credentials: "omit",
        redirect: "follow",
        signal: controller?.signal,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8"
        },
        body: JSON.stringify({
          requestId: secureRequestId("create"),
          action: "create",
          registration: payload
        })
      });
    } catch (error) {
      // Ein Timeout/Abort bedeutet nicht zwingend, dass Apps Script den POST
      // nicht erhalten hat. Deshalb prüfen wir danach trotzdem die Anmeldung.
      postWarning = error;
      console.warn("CREATE-POST wurde lokal nicht bestätigt:", error);
    } finally {
      if (postTimeout) window.clearTimeout(postTimeout);
    }

    try {
      const registration = await pollCreatedRegistration(
        payload.id,
        Date.now() + 40000
      );

      saveLocalRegistration(registration);
      return registration;
    } catch (statusError) {
      if (postWarning) {
        console.warn("Zusätzlicher POST-Hinweis:", postWarning);
      }
      throw statusError;
    }
  }

  let confirmationCountdownTimer = null;

  function renderDoneRegistration(registration) {
    accessCode.textContent = registration.accessCode || "–";
  }

  function stopConfirmationCountdown() {
    if (confirmationCountdownTimer) {
      window.clearInterval(confirmationCountdownTimer);
      confirmationCountdownTimer = null;
    }
  }

  function startConfirmationCountdown() {
    stopConfirmationCountdown();

    let remaining = 10;
    codeContinueButton.disabled = true;
    codeContinueButton.textContent = `Weiter (${remaining})`;
    codeCountdownHint.textContent =
      `Bitte speichere deinen Anmeldecode. Weiter ist in ${remaining} Sekunden möglich.`;

    confirmationCountdownTimer = window.setInterval(() => {
      remaining -= 1;

      if (remaining <= 0) {
        stopConfirmationCountdown();
        codeContinueButton.disabled = false;
        codeContinueButton.textContent = "Weiter";
        codeCountdownHint.textContent =
          "Du kannst jetzt fortfahren.";
        return;
      }

      codeContinueButton.textContent = `Weiter (${remaining})`;
      codeCountdownHint.textContent =
        `Bitte speichere deinen Anmeldecode. Weiter ist in ${remaining} Sekunden möglich.`;
    }, 1000);
  }

  codeContinueButton.addEventListener("click", () => {
    if (codeContinueButton.disabled) return;
    stopConfirmationCountdown();
    setStep("done");
  });


  downloadPdfButton.addEventListener("click", async () => {
    if (!state.savedRegistration || downloadPdfButton.disabled) return;

    const originalText = downloadPdfButton.textContent;
    downloadPdfButton.disabled = true;
    downloadPdfButton.textContent = "PDF wird vorbereitet …";

    try {
      await downloadRegistrationPdf(state.savedRegistration);
    } finally {
      downloadPdfButton.disabled = false;
      downloadPdfButton.textContent = originalText;
    }
  });

  openSavedRegistrationButton.addEventListener("click", () => {
    if (state.savedRegistration) {
      renderRegistrationModal(state.savedRegistration);
      modalBackdrop.hidden = false;
      return;
    }
    openRegistrationLookup();
  });

  myRegistrationButton.addEventListener("click", openRegistrationLookup);

  function registrationPdfLines(registration) {
    const created = registration.createdAt
      ? new Date(registration.createdAt).toLocaleString("de-DE")
      : new Date().toLocaleString("de-DE");

    const lines = [
      `ANMELDECODE: ${registration.accessCode || ""}`,
      "",
      "Straßenfest in Hilchenbach 2026",
      "Anmeldebestätigung",
      `Gespeichert am: ${created}`,
      "",
      "Angemeldete Personen:"
    ];

    (registration.people || []).forEach((person, index) => {
      lines.push(
        `${index + 1}. ${person.firstName} ${person.lastName}, ${person.age} Jahre - ${formatMoney(person.price)}`
      );
    });

    lines.push("", "Mitbringsel:");

    if (registration.bringing && registration.contribution) {
      const type = registration.contribution.subtype
        ? `${registration.contribution.category} - ${registration.contribution.subtype}`
        : registration.contribution.category;
      lines.push(type);
      lines.push(registration.contribution.note || "");
    } else {
      lines.push("Es wird nichts mitgebracht.");
    }

    lines.push(
      "",
      "Zahlung:",
      `Gesamtbetrag: ${formatMoney(registration.payment?.total)}`,
      paymentMethodLabelFor(registration.payment?.method),
      "",
      "Hinweis:",
      "Mit dem Anmeldecode und einem Nachnamen aus der Anmeldung",
      "kann die Anmeldung später auf der Webseite wieder aufgerufen werden."
    );

    return lines;
  }

  function wrapPdfLines(lines, maxChars = 74) {
    const output = [];

    lines.forEach((line) => {
      const text = String(line || "");
      if (!text) {
        output.push("");
        return;
      }

      const words = text.split(/\s+/);
      let current = "";

      words.forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;

        if (candidate.length <= maxChars) {
          current = candidate;
        } else {
          if (current) output.push(current);
          current = word;
        }
      });

      if (current) output.push(current);
    });

    return output;
  }

  function pdfWinAnsiBytes(text) {
    const cp1252 = new Map([
      [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84],
      [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88],
      [0x2030, 0x89], [0x0160, 0x8A], [0x2039, 0x8B], [0x0152, 0x8C],
      [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92], [0x201C, 0x93],
      [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
      [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B],
      [0x0153, 0x9C], [0x017E, 0x9E], [0x0178, 0x9F]
    ]);

    const bytes = [];

    for (const char of String(text)) {
      const code = char.codePointAt(0);

      if (code <= 0xFF) {
        bytes.push(code);
      } else if (cp1252.has(code)) {
        bytes.push(cp1252.get(code));
      } else {
        bytes.push(0x3F);
      }
    }

    return new Uint8Array(bytes);
  }

  function concatBytes(parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(total);
    let offset = 0;

    parts.forEach((part) => {
      output.set(part, offset);
      offset += part.length;
    });

    return output;
  }

  function pdfEscape(text) {
    return String(text)
      .replaceAll("\\", "\\\\")
      .replaceAll("(", "\\(")
      .replaceAll(")", "\\)");
  }

  function createSimplePdf(lines) {
    const wrapped = wrapPdfLines(lines);
    const perPage = 41;
    const pages = [];

    for (let i = 0; i < wrapped.length; i += perPage) {
      pages.push(wrapped.slice(i, i + perPage));
    }

    if (!pages.length) pages.push(["ANMELDECODE"]);

    const objects = new Map();
    const pageObjectIds = [];

    objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
    objects.set(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    objects.set(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

    pages.forEach((pageLines, index) => {
      const pageId = 5 + index * 2;
      const contentId = pageId + 1;
      pageObjectIds.push(pageId);

      objects.set(
        pageId,
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`
      );

      const commands = [
        "BT",
        "/F1 11 Tf",
        "15 TL",
        "46 792 Td"
      ];

      pageLines.forEach((line, lineIndex) => {
        if (lineIndex > 0) commands.push("T*");

        if (lineIndex === 0 && index === 0) {
          commands.push("/F2 20 Tf");
          commands.push(`(${pdfEscape(line)}) Tj`);
          commands.push("/F1 11 Tf");
        } else if (index === 0 && line === "Straßenfest in Hilchenbach 2026") {
          commands.push("/F2 14 Tf");
          commands.push(`(${pdfEscape(line)}) Tj`);
          commands.push("/F1 11 Tf");
        } else {
          commands.push(`(${pdfEscape(line)}) Tj`);
        }
      });

      commands.push("ET");
      const stream = commands.join("\n");
      const streamLength = pdfWinAnsiBytes(stream).length;

      objects.set(
        contentId,
        `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`
      );
    });

    objects.set(
      2,
      `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`
    );

    const maxObjectId = Math.max(...objects.keys());
    const chunks = [pdfWinAnsiBytes("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")];
    const offsets = new Array(maxObjectId + 1).fill(0);
    let cursor = chunks[0].length;

    for (let id = 1; id <= maxObjectId; id += 1) {
      const body = objects.get(id) || "<<>>";
      const chunk = pdfWinAnsiBytes(`${id} 0 obj\n${body}\nendobj\n`);
      offsets[id] = cursor;
      chunks.push(chunk);
      cursor += chunk.length;
    }

    const xrefOffset = cursor;
    let xref = `xref\n0 ${maxObjectId + 1}\n`;
    xref += "0000000000 65535 f \n";

    for (let id = 1; id <= maxObjectId; id += 1) {
      xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
    }

    xref += `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    chunks.push(pdfWinAnsiBytes(xref));

    return concatBytes(chunks);
  }

  function isMobileBrowser() {
    if (navigator.userAgentData?.mobile) return true;

    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function openPdfFallback(blob, fileName) {
    const url = URL.createObjectURL(blob);

    if (isMobileBrowser()) {
      // Auf Smartphones ist ein geöffneter PDF-Tab zuverlässiger als ein
      // erzwungener Blob-Download. Von dort kann die PDF über den Browser-
      // bzw. Teilen-Dialog in „Dateien“ gespeichert werden.
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Der neue Tab braucht die Blob-URL noch eine Weile.
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  async function downloadRegistrationPdf(registration) {
    const bytes = createSimplePdf(registrationPdfLines(registration));
    const blob = new Blob([bytes], { type: "application/pdf" });

    const safeCode = String(registration.accessCode || "anmeldung")
      .replace(/[^A-Z0-9-]+/gi, "-");

    const fileName = `Strassenfest-Hilchenbach-${safeCode}.pdf`;

    // Auf iPhone/iPad/Android bevorzugen wir den nativen Teilen-/Speichern-
    // Dialog. Damit kann z. B. direkt „In Dateien sichern“ gewählt werden.
    if (
      isMobileBrowser() &&
      typeof File !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function"
    ) {
      const file = new File([blob], fileName, {
        type: "application/pdf",
        lastModified: Date.now()
      });

      try {
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Anmeldung Straßenfest in Hilchenbach",
            files: [file]
          });
          return;
        }
      } catch (error) {
        // Abbrechen durch den Nutzer ist kein Fehler und soll keinen zweiten
        // Downloadversuch auslösen.
        if (error?.name === "AbortError") return;

        console.warn("Nativer PDF-Dialog nicht verfügbar:", error);
      }
    }

    openPdfFallback(blob, fileName);
  }


  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.step !== "5" || state.submitting) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonHtml = submitButton.innerHTML;

    state.submitting = true;
    submitButton.disabled = true;
    submitButton.classList.add("is-processing");
    submitButton.setAttribute("aria-busy", "true");
    submitButton.innerHTML = `<span>Wird gespeichert …</span>`;
    submitStatus.textContent = "Anmeldung wird gespeichert. Bitte kurz warten …";

    try {
      const payload = buildPayload();
      const registration = await submitRegistration(payload);

      state.savedRegistration = registration;
      saveRegistrationIdentity(registration);
      renderDoneRegistration(registration);

      submitStatus.textContent = "Gespeichert.";
      setStep("code");
      startConfirmationCountdown();

      // Erfolgreich: Button bleibt gesperrt. Die nächste Kachel zeigt
      // zunächst den Anmeldecode und lässt erst nach dem Countdown weiter.
    } catch (error) {
      console.error(error);
      submitStatus.textContent =
        error.message ||
        "Die Anmeldung konnte gerade nicht bestätigt werden.";

      // Nur wenn wirklich keine Folgeseite erreicht wurde, darf erneut versucht
      // werden. Durch dieselbe submissionId erzeugt auch ein Retry keinen Duplikat.
      state.submitting = false;
      submitButton.disabled = false;
      submitButton.classList.remove("is-processing");
      submitButton.removeAttribute("aria-busy");
      submitButton.innerHTML = originalButtonHtml;
    }
  });

  restartButton.addEventListener("click", () => {
    stopConfirmationCountdown();
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
    state.savedRegistration = null;
    state.submissionId = null;
    state.submitting = false;
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

    animateElement(modalBackdrop, [
      { opacity: 0 },
      { opacity: 1 }
    ], { duration: 180 });

    animateElement(modalBackdrop.querySelector(".modal"), [
      { opacity: 0, transform: "translateY(7px) scale(.985)" },
      { opacity: 1, transform: "translateY(0) scale(1)" }
    ], { duration: 230 });

    modalClose.focus({ preventScroll: true });
  }

  function renderAdminModal() {
    const registrations = getLocalRegistrations();
    modalTitle.textContent = "Admin · lokaler Cache";
    if (!registrations.length) {
      modalContent.innerHTML = `<p>In diesem Browser wurden noch keine lokalen Anmeldedaten zwischengespeichert.</p><p>Für eine gemeinsame Teilnehmerliste auf mehreren Geräten braucht die GitHub-Pages-Version später einen externen Backend-/Datenbank-Endpunkt.</p>`;
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


  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    animateButtonPress(button);
  });

  refreshMyRegistrationHint();
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
