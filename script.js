(() => {
  "use strict";

  const SUBMIT_ENDPOINT = "https://script.google.com/macros/s/AKfycbyR2jC7NmY5h2q__ZLJo-SeuNpGoXoJO-JNyNahOlkVybBKZoRlS1Mb859Gov8Hb3pkEw/exec";
  const STORAGE_KEY = "strassenfest-hilchenbach-registrations";
  const MY_REGISTRATION_KEY = "strassenfest-hilchenbach-my-registration";
  const ADULT_PRICE = 20;
  const ADULT_AGE = 18;

  const state = {
    step: "home",
    people: [],
    bringing: null,
    category: "",
    subtype: "",
    contribution: "",
    contributionOrigin: "choice",
    presetContribution: false,
    paymentMode: null,
    paymentMethod: null,
    totalCost: 0,
    savedRegistration: null,
    paymentChangeOrigin: "payments-home",
    paymentChangeMethod: null,
    paymentChangeMode: null,
    receiptRegistration: null,
    receiptImageDataUrl: "",
    receiptSubmissionId: null,
    submissionId: null,
    submitting: false
  };

  const registrationStage = document.getElementById("registrationStage");
  const wizardCard = document.getElementById("wizardCard");
  const footerBar = document.querySelector(".footer-bar");
  const form = document.getElementById("registrationForm");
  const peopleRows = document.getElementById("peopleRows");
  const peopleListHint = document.getElementById("peopleListHint");
  const peopleCount = document.getElementById("peopleCount");
  const personDraftFirst = document.getElementById("personDraftFirst");
  const personDraftLast = document.getElementById("personDraftLast");
  const personDraftAge = document.getElementById("personDraftAge");
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
  const paymentModeButtons = [...document.querySelectorAll(".payment-mode-choice")];
  const cashPaymentChoiceButtons = [...document.querySelectorAll(".cash-payment-choice")];
  const paypalPaymentPanel = document.getElementById("paypalPaymentPanel");
  const cashPaymentPanel = document.getElementById("cashPaymentPanel");
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
  const processTopNav = document.getElementById("processTopNav");
  const processBackButton = document.getElementById("processBackButton");
  const processHomeButton = document.getElementById("processHomeButton");
  const processNextButton = document.getElementById("processNextButton");
  const firstVisitNotice = document.getElementById("firstVisitNotice");
  const firstVisitNoticeOk = document.getElementById("firstVisitNoticeOk");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");
  const validationToast = document.getElementById("validationToast");
  const validationToastText = document.getElementById("validationToastText");
  const myRegistrationButton = document.getElementById("myRegistrationButton");
  const myRegistrationHint = document.getElementById("myRegistrationHint");
  const accessCode = document.getElementById("accessCode");
  const confirmationPaymentMethod = document.getElementById("confirmationPaymentMethod");
  const confirmationPaymentAmount = document.getElementById("confirmationPaymentAmount");
  const confirmationPaypalArea = document.getElementById("confirmationPaypalArea");
  const changePaymentAfterSubmitButton = document.getElementById("changePaymentAfterSubmitButton");
  const downloadPdfButton = document.getElementById("downloadPdfButton");
  const codeContinueButton = document.getElementById("codeContinueButton");
  const codeCountdownHint = document.getElementById("codeCountdownHint");
  const openSavedRegistrationButton = document.getElementById("openSavedRegistrationButton");
  const existingContributions = document.getElementById("existingContributions");
  const existingContributionsList = document.getElementById("existingContributionsList");

  const homeNewRegistration = document.getElementById("homeNewRegistration");
  const homeExistingRegistration = document.getElementById("homeExistingRegistration");
  const homePayments = document.getElementById("homePayments");
  const paymentsStatusButton = document.getElementById("paymentsStatusButton");
  const paymentsChangeButton = document.getElementById("paymentsChangeButton");
  const paymentsReceiptButton = document.getElementById("paymentsReceiptButton");
  const paymentsHomeBack = document.getElementById("paymentsHomeBack");

  const changePaymentLookupCode = document.getElementById("changePaymentLookupCode");
  const changePaymentLookupError = document.getElementById("changePaymentLookupError");
  const changePaymentLookupBack = document.getElementById("changePaymentLookupBack");
  const changePaymentLookupSubmit = document.getElementById("changePaymentLookupSubmit");

  const changePaymentCode = document.getElementById("changePaymentCode");
  const changePaymentAmount = document.getElementById("changePaymentAmount");
  const changePaymentCurrent = document.getElementById("changePaymentCurrent");
  const changePaymentChoices = document.getElementById("changePaymentChoices");
  const changePaymentNotRequired = document.getElementById("changePaymentNotRequired");
  const changePaymentModeButtons = [...document.querySelectorAll(".change-payment-mode-choice")];
  const changeCashPaymentButtons = [...document.querySelectorAll(".change-cash-payment-choice")];
  const changePaypalPanel = document.getElementById("changePaypalPanel");
  const changeCashPanel = document.getElementById("changeCashPanel");
  const changePaymentError = document.getElementById("changePaymentError");
  const changePaymentBack = document.getElementById("changePaymentBack");
  const changePaymentSave = document.getElementById("changePaymentSave");

  const paymentStatusForm = document.getElementById("paymentStatusForm");
  const paymentStatusCode = document.getElementById("paymentStatusCode");
  const paymentStatusError = document.getElementById("paymentStatusError");
  const paymentStatusBack = document.getElementById("paymentStatusBack");
  const paymentStatusSubmit = document.getElementById("paymentStatusSubmit");

  const paymentStatusViewIcon = document.getElementById("paymentStatusViewIcon");
  const paymentStatusViewTitle = document.getElementById("paymentStatusViewTitle");
  const paymentStatusViewText = document.getElementById("paymentStatusViewText");
  const paymentStatusRemaining = document.getElementById("paymentStatusRemaining");
  const paymentStatusCheckAgain = document.getElementById("paymentStatusCheckAgain");
  const paymentStatusHome = document.getElementById("paymentStatusHome");

  const receiptLookupCode = document.getElementById("receiptLookupCode");
  const receiptLookupError = document.getElementById("receiptLookupError");
  const receiptLookupBack = document.getElementById("receiptLookupBack");
  const receiptLookupSubmit = document.getElementById("receiptLookupSubmit");
  const receiptRegistrationCode = document.getElementById("receiptRegistrationCode");
  const receiptRegistrationName = document.getElementById("receiptRegistrationName");
  const receiptFileInput = document.getElementById("receiptFileInput");
  const receiptPreviewCard = document.getElementById("receiptPreviewCard");
  const receiptPreviewImage = document.getElementById("receiptPreviewImage");
  const receiptReplaceFileButton = document.getElementById("receiptReplaceFileButton");
  const receiptAmount = document.getElementById("receiptAmount");
  const receiptFestivalOnlyConfirmed = document.getElementById("receiptFestivalOnlyConfirmed");
  const receiptPayoutMethodInputs = [...document.querySelectorAll('input[name="receiptPayoutMethod"]')];
  const receiptBankFields = document.getElementById("receiptBankFields");
  const receiptPaypalFields = document.getElementById("receiptPaypalFields");
  const receiptBankName = document.getElementById("receiptBankName");
  const receiptBankIban = document.getElementById("receiptBankIban");
  const receiptPaypalAccount = document.getElementById("receiptPaypalAccount");
  const receiptUploadError = document.getElementById("receiptUploadError");
  const receiptUploadBack = document.getElementById("receiptUploadBack");
  const receiptSubmitButton = document.getElementById("receiptSubmitButton");
  const receiptDoneId = document.getElementById("receiptDoneId");
  const receiptAnotherButton = document.getElementById("receiptAnotherButton");
  const receiptDonePayments = document.getElementById("receiptDonePayments");

  const introBack = document.getElementById("introBack");
  const introStart = document.getElementById("introStart");

  const frontRegistrationLookupForm = document.getElementById("frontRegistrationLookupForm");
  const frontLookupCode = document.getElementById("frontLookupCode");
  const frontLookupError = document.getElementById("frontLookupError");
  const frontLookupSubmit = document.getElementById("frontLookupSubmit");
  const existingBack = document.getElementById("existingBack");

  const frontExistingCode = document.getElementById("frontExistingCode");
  const frontExistingDetails = document.getElementById("frontExistingDetails");
  const frontExistingPaymentMethod = document.getElementById("frontExistingPaymentMethod");
  const frontExistingPaymentAmount = document.getElementById("frontExistingPaymentAmount");
  const frontExistingPaypalArea = document.getElementById("frontExistingPaypalArea");
  const frontExistingChangePayment = document.getElementById("frontExistingChangePayment");
  const frontExistingPdf = document.getElementById("frontExistingPdf");
  const frontExistingOther = document.getElementById("frontExistingOther");
  const frontExistingHome = document.getElementById("frontExistingHome");

  // Häufig verwendete statische DOM-Mengen einmalig cachen.
  const progressDots = [...document.querySelectorAll(".progress-dot")];
  const stepPanels = new Map(
    [...document.querySelectorAll(".step")].map((panel) => [
      String(panel.dataset.step),
      panel
    ])
  );
  let activeStepPanel = document.querySelector(".step.active");


  function setButtonBusy(button, busy, label = "Wird geladen …") {
    if (!button) return;

    if (busy) {
      if (!button.dataset.busyOriginalHtml) {
        button.dataset.busyOriginalHtml = button.innerHTML;
      }
      button.disabled = true;
      button.classList.add("is-server-loading");
      button.setAttribute("aria-busy", "true");
      button.innerHTML = `<span>${escapeHtml(label)}</span><span class="button-inline-spinner" aria-hidden="true"></span>`;
      return;
    }

    button.disabled = false;
    button.classList.remove("is-server-loading");
    button.removeAttribute("aria-busy");

    if (button.dataset.busyOriginalHtml) {
      button.innerHTML = button.dataset.busyOriginalHtml;
      delete button.dataset.busyOriginalHtml;
    }
  }

  function friendlyLookupError(error) {
    if (error?.code === "NOT_FOUND") {
      return "Der Anmeldecode ist falsch oder wurde nicht gefunden.";
    }

    return error?.message || "Die Daten konnten gerade nicht geladen werden.";
  }

  function ensureInitialPersonRow() {
    renderPeopleList();
  }

  function apiRequest(action, data = {}, options = {}) {
    return window.StrassenfestApi.request(
      SUBMIT_ENDPOINT,
      action,
      data,
      {
        prefix: "main",
        timeoutMs: options.timeoutMs || 30000,
        requestId: options.requestId
      }
    );
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

    if (myRegistrationHint) {
      myRegistrationHint.textContent = saved
        ? `Gespeichert: ${saved.code}`
        : "Mit Anmeldecode wieder aufrufen";
    }

    if (saved) {
      frontLookupCode.value = saved.code || "";
    }
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
    if (method === "paypal") {
      return "Digitale Zahlung über den PayPal-Pool.";
    }
    if (method === "briefkasten") {
      return "Barzahlung in den Briefkasten – Nassauische Straße 1, Springer, im Umschlag mit Namen.";
    }
    if (method === "abholung") {
      return "Persönliche Abholung am 30. August ab 18 Uhr.";
    }
    return "Keine Zahlung erforderlich.";
  }

  function shortPaymentMethodLabel(method) {
    if (method === "paypal") return "PayPal";
    if (method === "briefkasten") return "Bar – Briefkasten";
    if (method === "abholung") return "Bar – persönliche Abholung";
    return "Keine Zahlung erforderlich";
  }

  function renderPostRegistrationPayment(registration, target) {
    const method = registration?.payment?.method || "none";
    const total = Number(registration?.payment?.total || 0);

    target.method.textContent = shortPaymentMethodLabel(method);
    target.amount.textContent = formatMoney(total);
    target.paypal.classList.toggle(
      "hidden",
      method !== "paypal" || total <= 0
    );

    if (target.changeButton) {
      target.changeButton.classList.toggle("hidden", total <= 0);
    }
  }

  function resetChangePaymentSelection() {
    state.paymentChangeMethod = null;
    state.paymentChangeMode = null;

    changePaymentModeButtons.forEach((button) => {
      button.classList.remove("selected");
    });

    changeCashPaymentButtons.forEach((button) => {
      button.classList.remove("selected");
    });

    changePaypalPanel.classList.add("hidden");
    changeCashPanel.classList.add("hidden");
    changePaymentError.textContent = "";
  }

  function preselectChangePaymentMethod(method) {
    resetChangePaymentSelection();

    if (method === "paypal") {
      state.paymentChangeMode = "digital";
      state.paymentChangeMethod = "paypal";

      changePaymentModeButtons.forEach((button) => {
        button.classList.toggle(
          "selected",
          button.dataset.changePaymentMode === "digital"
        );
      });

      changePaypalPanel.classList.remove("hidden");
      return;
    }

    if (method === "briefkasten" || method === "abholung") {
      state.paymentChangeMode = "cash";
      state.paymentChangeMethod = method;

      changePaymentModeButtons.forEach((button) => {
        button.classList.toggle(
          "selected",
          button.dataset.changePaymentMode === "cash"
        );
      });

      changeCashPaymentButtons.forEach((button) => {
        button.classList.toggle(
          "selected",
          button.dataset.changePayment === method
        );
      });

      changeCashPanel.classList.remove("hidden");
    }
  }

  function openPaymentChange(registration, origin = "home") {
    state.savedRegistration = registration;
    state.paymentChangeOrigin = origin;

    const total = Number(registration?.payment?.total || 0);
    const method = registration?.payment?.method || "none";

    changePaymentCode.textContent = registration?.accessCode || "–";
    changePaymentAmount.textContent = formatMoney(total);
    changePaymentCurrent.textContent = shortPaymentMethodLabel(method);

    changePaymentChoices.classList.toggle("hidden", total <= 0);
    changePaymentNotRequired.classList.toggle("hidden", total > 0);
    changePaymentSave.classList.toggle("hidden", total <= 0);

    preselectChangePaymentMethod(method);
    setStep("payment-change");
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
        const registration = await loadRegistration(code, "");
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

  const processBackActionMap = {
    intro: "#introBack",
    "payments-home": "#paymentsHomeBack",
    payment: "#paymentStatusBack",
    "payment-view": "#paymentStatusHome",
    "payment-change-lookup": "#changePaymentLookupBack",
    "payment-change": "#changePaymentBack",
    "receipt-lookup": "#receiptLookupBack",
    "receipt-upload": "#receiptUploadBack",
    existing: "#existingBack",
    "2": '[data-step="2"] [data-go="1"]',
    needs: '[data-step="needs"] [data-go="2"]',
    "3": "#contributionBack",
    "4": "#paymentBack"
  };

  const processBackFallbackMap = {
    "1": "intro",
    "5": "4",
    code: "5",
    "receipt-done": "receipt-upload",
    "existing-view": "existing",
    done: "home"
  };

  const processNextActionMap = {
    intro: "#introStart",
    payment: "#paymentStatusSubmit",
    "payment-change-lookup": "#changePaymentLookupSubmit",
    "payment-change": "#changePaymentSave",
    "receipt-lookup": "#receiptLookupSubmit",
    "receipt-upload": "#receiptSubmitButton",
    existing: "#frontLookupSubmit",
    "1": "#peopleContinue",
    "3": "#contributionContinue",
    "4": "#paymentContinue",
    "5": "#submitButton",
    code: "#codeContinueButton"
  };

  function processAction(selector) {
    return selector
      ? document.querySelector(selector)
      : null;
  }

  function updateProcessNavigation() {
    const home = state.step === "home";

    document.body.classList.toggle(
      "process-mode",
      !home
    );

    wizardCard.classList.toggle(
      "process-card",
      !home
    );

    processTopNav?.classList.toggle(
      "hidden",
      home
    );

    if (home) {
      return;
    }

    const backAction = processAction(processBackActionMap[state.step]);
    if (processBackButton) {
      processBackButton.disabled = !backAction && !processBackFallbackMap[state.step];
    }

    const nextAction = processAction(processNextActionMap[state.step]);
    if (processNextButton) {
      processNextButton.disabled = !nextAction || Boolean(nextAction.disabled);
    }
  }

  processBackButton?.addEventListener(
    "click",
    () => {
      const action =
        processAction(
          processBackActionMap[state.step]
        );

      if (action && !action.disabled) {
        action.click();
        return;
      }

      const fallback =
        processBackFallbackMap[state.step];

      if (fallback) {
        setStep(fallback);
      }
    }
  );

  processHomeButton?.addEventListener(
    "click",
    () => {
      setStep("home");
    }
  );

  processNextButton?.addEventListener(
    "click",
    () => {
      const action =
        processAction(
          processNextActionMap[state.step]
        );

      if (
        action &&
        !action.disabled
      ) {
        action.click();
      }
    }
  );

  document.addEventListener(
    "input",
    () => {
      window.setTimeout(
        updateProcessNavigation,
        0
      );
    }
  );

  document.addEventListener(
    "change",
    () => {
      window.setTimeout(
        updateProcessNavigation,
        0
      );
    }
  );

  function setStep(step) {
    const nextStep = String(step);
    const currentPanel = activeStepPanel;
    const nextPanel = stepPanels.get(nextStep);

    if (!nextPanel) return;

    // Zielseite zuerst aktivieren. Zusatznavigation darf den Wechsel nie blockieren.
    if (nextPanel !== currentPanel) {
      currentPanel?.classList.remove("active");
      nextPanel.classList.add("active");
      activeStepPanel = nextPanel;
    }

    state.step = nextStep;

    const progressStep = state.step === "needs" ? 2 : Number(state.step);
    progressDots.forEach((dot) => {
      dot.classList.toggle("active", Number(dot.dataset.progress) === progressStep);
    });

    const progressHidden = [
      "home", "payments-home", "receipt-lookup", "receipt-upload",
      "receipt-done", "intro", "existing", "existing-view", "payment",
      "payment-view", "payment-change-lookup", "payment-change", "code", "done"
    ].includes(state.step);
    stepProgress?.classList.toggle("hidden", progressHidden);

    try { resetKeyboardViewForStepChange(); } catch (error) { console.warn("Keyboard reset skipped", error); }

    try {
      updateProcessNavigation();
    } catch (error) {
      console.error("Process navigation skipped", error);
      document.body.classList.toggle("process-mode", nextStep !== "home");
      wizardCard.classList.toggle("process-card", nextStep !== "home");
    }

    if (nextStep === "home") { try { updateNormalGeometry(); } catch {} }
    try { wizardCard.scrollTop = 0; } catch {}

    animateElement(nextPanel, [
      { opacity: 0, transform: "translateY(5px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], { duration: 190 });
  }

  let personRowSerial = 0;

  function renderPeopleList() {
    peopleRows.innerHTML = "";

    const count = state.people.length;

    peopleCount.textContent =
      String(count);

    peopleListHint.textContent =
      count === 0
        ? "Noch niemand hinzugefügt"
        : count === 1
          ? "1 Person hinzugefügt"
          : `${count} Personen hinzugefügt`;

    if (!count) {
      peopleRows.innerHTML = `
        <div class="people-empty-state">
          <strong>Noch keine Person in der Liste</strong>
          <span>Oben Daten eingeben und auf „Hinzufügen“ tippen.</span>
        </div>
      `;
      return;
    }

    state.people.forEach(
      (person, index) => {
        const row =
          document.createElement("article");

        row.className =
          "person-added-row";

        row.dataset.personIndex =
          String(index);

        row.innerHTML = `
          <div class="person-added-avatar"
               aria-hidden="true">
            ${index + 1}
          </div>

          <div class="person-added-data">
            <strong>
              ${escapeHtml(person.firstName)}
              ${escapeHtml(person.lastName)}
            </strong>
            <span>${person.age} Jahre</span>
          </div>

          <button type="button"
                  class="remove-person"
                  aria-label="${escapeAttr(
                    `${person.firstName} ${person.lastName} entfernen`
                  )}">
            ×
          </button>
        `;

        peopleRows.appendChild(
          row
        );
      }
    );
  }

  function clearPersonComposer({
    focus = true
  } = {}) {
    personDraftFirst.value = "";
    personDraftLast.value = "";
    personDraftAge.value = "";
    personError.textContent = "";

    [
      personDraftFirst,
      personDraftLast,
      personDraftAge
    ].forEach((input) => {
      input.classList.remove(
        "validation-error-target"
      );
    });

    if (focus) {
      personDraftFirst.focus({
        preventScroll: true
      });
    }
  }

  function validatePersonComposer() {
    const firstName =
      personDraftFirst.value
        .replace(/\s+/g, " ")
        .trim();

    const lastName =
      personDraftLast.value
        .replace(/\s+/g, " ")
        .trim();

    const ageValue =
      personDraftAge.value;

    const age =
      ageValue === ""
        ? NaN
        : Number(ageValue);

    if (!firstName) {
      const message =
        "Bitte den Vornamen eintragen.";

      personError.textContent =
        message;

      reportValidationError(
        message,
        personDraftFirst
      );

      return null;
    }

    if (!lastName) {
      const message =
        "Bitte den Nachnamen eintragen.";

      personError.textContent =
        message;

      reportValidationError(
        message,
        personDraftLast
      );

      return null;
    }

    if (
      !Number.isFinite(age) ||
      age < 0 ||
      age > 120
    ) {
      const message =
        "Bitte ein Alter zwischen 0 und 120 Jahren eintragen.";

      personError.textContent =
        message;

      reportValidationError(
        message,
        personDraftAge
      );

      return null;
    }

    return {
      firstName,
      lastName,
      age
    };
  }

  function addPersonFromComposer() {
    const person =
      validatePersonComposer();

    if (!person) {
      return false;
    }

    state.people.push(person);
    clearValidationMarks();
    clearPersonComposer({
      focus: false
    });
    renderPeopleList();
    updateProcessNavigation();

    animateElement(
      peopleRows.lastElementChild,
      [
        {
          opacity: 0,
          transform:
            "translateY(-4px) scale(.99)"
        },
        {
          opacity: 1,
          transform:
            "translateY(0) scale(1)"
        }
      ],
      {
        duration: 190
      }
    );

    return true;
  }

  addPersonButton.addEventListener(
    "click",
    () => {
      if (addPersonFromComposer()) {
        personDraftFirst.focus({
          preventScroll: true
        });
      }
    }
  );

  [
    personDraftFirst,
    personDraftLast,
    personDraftAge
  ].forEach((input) => {
    input.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();

        if (input === personDraftFirst) {
          personDraftLast.focus({
            preventScroll: true
          });
          return;
        }

        if (input === personDraftLast) {
          personDraftAge.focus({
            preventScroll: true
          });
          return;
        }

        if (addPersonFromComposer()) {
          personDraftFirst.focus({
            preventScroll: true
          });
        }
      }
    );
  });

  peopleRows.addEventListener(
    "click",
    async (event) => {
      const removeButton =
        event.target.closest(
          ".remove-person"
        );

      if (!removeButton) {
        return;
      }

      const row =
        removeButton.closest(
          ".person-added-row"
        );

      if (!row) {
        return;
      }

      const index =
        Number(
          row.dataset.personIndex
        );

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= state.people.length
      ) {
        return;
      }

      const animation =
        animateElement(
          row,
          [
            {
              opacity: 1,
              transform:
                "translateY(0) scale(1)"
            },
            {
              opacity: 0,
              transform:
                "translateY(-4px) scale(.985)"
            }
          ],
          {
            duration: 150
          }
        );

      try {
        await animation?.finished;
      } catch {}

      state.people.splice(index, 1);
      renderPeopleList();
      updateProcessNavigation();
    }
  );

  function readPeople() {
    if (!state.people.length) {
      const message =
        "Bitte mindestens eine Person hinzufügen.";

      personError.textContent =
        message;

      reportValidationError(
        message,
        personDraftFirst
      );

      return null;
    }

    clearValidationMarks();
    personError.textContent = "";

    return state.people.map(
      (person) => ({
        ...person
      })
    );
  }

  peopleContinue.addEventListener(
    "click",
    () => {
      const people =
        readPeople();

      if (!people) {
        return;
      }

      state.people = people;
      setStep(2);
    }
  );

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
    state.paymentMode = null;
    state.paymentMode = null;
    state.paymentMethod = null;
    preparePayment();
    setStep(4);
  });

  showNeeds.addEventListener("click", async () => {
    setButtonBusy(showNeeds, true, "Wird geladen …");
    setStep("needs");

    try {
      await renderNeeds();
    } finally {
      setButtonBusy(showNeeds, false);
    }
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
        <td colspan="3" class="needs-loading">
          <div class="needs-loading-state">
            <span class="server-spinner" aria-hidden="true"></span>
            <span>Zentrale Planung wird geladen …</span>
          </div>
        </td>
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

  function resetPaymentSelectionUi() {
    paymentModeButtons.forEach((button) => {
      button.classList.remove("selected");
    });

    cashPaymentChoiceButtons.forEach((button) => {
      button.classList.remove("selected");
    });

    paypalPaymentPanel.classList.add("hidden");
    cashPaymentPanel.classList.add("hidden");
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

    state.paymentMode = null;
    state.paymentMethod = null;
    resetPaymentSelectionUi();
    paymentError.textContent = "";

    if (cost.total === 0) {
      state.paymentMethod = "none";
      paymentMethodArea.classList.add("hidden");
      noPaymentNote.classList.remove("hidden");
    } else {
      paymentMethodArea.classList.remove("hidden");
      noPaymentNote.classList.add("hidden");
    }
  }

  paymentModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.paymentMode;

      state.paymentMode = mode;
      paymentError.textContent = "";

      paymentModeButtons.forEach((item) => {
        item.classList.toggle("selected", item === button);
      });

      if (mode === "digital") {
        state.paymentMethod = "paypal";

        cashPaymentChoiceButtons.forEach((item) => {
          item.classList.remove("selected");
        });

        cashPaymentPanel.classList.add("hidden");
        paypalPaymentPanel.classList.remove("hidden");
        return;
      }

      state.paymentMethod = null;
      paypalPaymentPanel.classList.add("hidden");
      cashPaymentPanel.classList.remove("hidden");
    });
  });

  cashPaymentChoiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.paymentMode = "cash";
      state.paymentMethod = button.dataset.payment;

      paymentModeButtons.forEach((item) => {
        item.classList.toggle(
          "selected",
          item.dataset.paymentMode === "cash"
        );
      });

      cashPaymentChoiceButtons.forEach((item) => {
        item.classList.toggle("selected", item === button);
      });

      paypalPaymentPanel.classList.add("hidden");
      cashPaymentPanel.classList.remove("hidden");
      paymentError.textContent = "";
    });
  });

  paymentBack.addEventListener("click", () => {
    setStep(state.bringing ? 3 : 2);
  });

  paymentContinue.addEventListener("click", () => {
    if (state.totalCost > 0 && !state.paymentMode) {
      const message = "Bitte auswählen, ob du digital oder bar bezahlen möchtest.";
      paymentError.textContent = message;
      reportValidationError(message, paymentMethodArea, { focus: false });
      return;
    }

    if (
      state.totalCost > 0 &&
      state.paymentMode === "cash" &&
      !state.paymentMethod
    ) {
      const message = "Bitte auswählen, wie du bar bezahlen möchtest.";
      paymentError.textContent = message;
      reportValidationError(message, cashPaymentPanel, { focus: false });
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

  function showExistingRegistration(registration) {
    state.savedRegistration = registration;
    frontExistingCode.textContent = registration.accessCode || "–";
    frontExistingDetails.innerHTML = registrationDetailsHtml(registration);

    renderPostRegistrationPayment(registration, {
      method: frontExistingPaymentMethod,
      amount: frontExistingPaymentAmount,
      paypal: frontExistingPaypalArea,
      changeButton: frontExistingChangePayment
    });

    setStep("existing-view");
  }

  homeNewRegistration.addEventListener("click", () => {
    setStep("intro");
  });

  introBack.addEventListener("click", () => {
    setStep("home");
  });

  introStart.addEventListener("click", () => {
    ensureInitialPersonRow();
    setStep(1);
  });

  function renderPaymentStatus(status) {
    const remaining = Math.max(0, Number(status.remaining || 0));

    if (status.state === "free") {
      paymentStatusViewIcon.textContent = "✓";
      paymentStatusViewTitle.textContent = "Keine Zahlung erforderlich";
      paymentStatusViewText.textContent =
        "Für diese Anmeldung ist kein Kostenbeitrag offen.";
      paymentStatusRemaining.textContent = formatMoney(0);
    } else if (status.state === "paid") {
      paymentStatusViewIcon.textContent = "✓";
      paymentStatusViewTitle.textContent = "Zahlung beglichen";
      paymentStatusViewText.textContent =
        "Die Zahlung wurde im System als vollständig getätigt eingetragen.";
      paymentStatusRemaining.textContent = formatMoney(0);
    } else {
      paymentStatusViewIcon.textContent = "€";
      paymentStatusViewTitle.textContent = "Zahlung noch offen";
      paymentStatusViewText.textContent =
        "Die Zahlung ist im System noch nicht vollständig als beglichen eingetragen.";
      paymentStatusRemaining.textContent = formatMoney(remaining);
    }

    setStep("payment-view");
  }

  homePayments.addEventListener("click", () => {
    setStep("payments-home");
  });

  paymentsHomeBack.addEventListener("click", () => {
    setStep("home");
  });

  paymentsStatusButton.addEventListener("click", () => {
    const saved = getSavedRegistrationIdentity();

    if (saved) {
      paymentStatusCode.value = saved.code || "";
    }

    paymentStatusError.textContent = "";
    setStep("payment");
  });

  paymentStatusBack.addEventListener("click", () => {
    paymentStatusError.textContent = "";
    setStep("payments-home");
  });

  async function checkPaymentStatus() {
    const code = paymentStatusCode.value.trim();

    if (!code) {
      paymentStatusError.textContent = "Bitte deinen Anmeldecode eingeben.";
      return;
    }

    setButtonBusy(paymentStatusSubmit, true, "Wird geprüft …");
    paymentStatusError.textContent = "";

    try {
      const result = await apiRequest("paymentStatus", { code });

      if (!result.paymentStatus) {
        throw new Error("Der Zahlungsstatus konnte nicht geladen werden.");
      }

      renderPaymentStatus(result.paymentStatus);
    } catch (error) {
      paymentStatusError.textContent = friendlyLookupError(error);
    } finally {
      setButtonBusy(paymentStatusSubmit, false);
    }
  }

  paymentStatusSubmit.addEventListener("click", () => {
    void checkPaymentStatus();
  });

  paymentStatusCode.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void checkPaymentStatus();
  });

  paymentStatusCheckAgain.addEventListener("click", () => {
    paymentStatusError.textContent = "";
    setStep("payment");
  });

  paymentStatusHome.addEventListener("click", () => {
    paymentStatusError.textContent = "";
    setStep("payments-home");
  });

  paymentsChangeButton.addEventListener("click", () => {
    const saved = getSavedRegistrationIdentity();

    if (saved) {
      changePaymentLookupCode.value = saved.code || "";
    }

    changePaymentLookupError.textContent = "";
    state.paymentChangeOrigin = "payments-home";
    setStep("payment-change-lookup");
  });

  changePaymentLookupBack.addEventListener("click", () => {
    changePaymentLookupError.textContent = "";
    setStep("payments-home");
  });

  async function lookupRegistrationForPaymentChange() {
    const code = changePaymentLookupCode.value.trim();

    if (!code) {
      changePaymentLookupError.textContent =
        "Bitte deinen Anmeldecode eingeben.";
      return;
    }

    setButtonBusy(
      changePaymentLookupSubmit,
      true,
      "Wird geladen …"
    );

    changePaymentLookupError.textContent = "";

    try {
      const registration = await loadRegistration(code, "");
      saveRegistrationIdentity(registration);
      openPaymentChange(registration, "home");
    } catch (error) {
      changePaymentLookupError.textContent = friendlyLookupError(error);
    } finally {
      setButtonBusy(changePaymentLookupSubmit, false);
    }
  }

  changePaymentLookupSubmit.addEventListener("click", () => {
    void lookupRegistrationForPaymentChange();
  });

  changePaymentLookupCode.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void lookupRegistrationForPaymentChange();
  });

  changePaymentModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.changePaymentMode;

      state.paymentChangeMode = mode;
      changePaymentError.textContent = "";

      changePaymentModeButtons.forEach((item) => {
        item.classList.toggle("selected", item === button);
      });

      if (mode === "digital") {
        state.paymentChangeMethod = "paypal";

        changeCashPaymentButtons.forEach((item) => {
          item.classList.remove("selected");
        });

        changeCashPanel.classList.add("hidden");
        changePaypalPanel.classList.remove("hidden");
        return;
      }

      state.paymentChangeMethod = null;
      changePaypalPanel.classList.add("hidden");
      changeCashPanel.classList.remove("hidden");
    });
  });

  changeCashPaymentButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.paymentChangeMode = "cash";
      state.paymentChangeMethod = button.dataset.changePayment;
      changePaymentError.textContent = "";

      changePaymentModeButtons.forEach((item) => {
        item.classList.toggle(
          "selected",
          item.dataset.changePaymentMode === "cash"
        );
      });

      changeCashPaymentButtons.forEach((item) => {
        item.classList.toggle("selected", item === button);
      });

      changePaypalPanel.classList.add("hidden");
      changeCashPanel.classList.remove("hidden");
    });
  });

  function returnFromPaymentChange() {
    if (state.paymentChangeOrigin === "code") {
      if (state.savedRegistration) {
        renderDoneRegistration(state.savedRegistration);
      }
      setStep("code");
      return;
    }

    if (state.paymentChangeOrigin === "existing-view") {
      if (state.savedRegistration) {
        showExistingRegistration(state.savedRegistration);
      } else {
        setStep("existing");
      }
      return;
    }

    setStep("payment-change-lookup");
  }

  changePaymentBack.addEventListener("click", () => {
    returnFromPaymentChange();
  });

  changePaymentSave.addEventListener("click", async () => {
    const registration = state.savedRegistration;
    const total = Number(registration?.payment?.total || 0);

    if (!registration?.accessCode || total <= 0) {
      returnFromPaymentChange();
      return;
    }

    if (!state.paymentChangeMode) {
      changePaymentError.textContent =
        "Bitte auswählen, ob du digital oder bar bezahlen möchtest.";
      return;
    }

    if (
      state.paymentChangeMode === "cash" &&
      !state.paymentChangeMethod
    ) {
      changePaymentError.textContent =
        "Bitte auswählen, wie du bar bezahlen möchtest.";
      return;
    }

    setButtonBusy(
      changePaymentSave,
      true,
      "Wird gespeichert …"
    );

    changePaymentError.textContent = "";

    try {
      const result = await apiRequest("updatePaymentMethod", {
        code: registration.accessCode,
        paymentMethod: state.paymentChangeMethod
      });

      if (!result.registration) {
        throw new Error(
          "Der Zahlungsweg konnte nicht aktualisiert werden."
        );
      }

      state.savedRegistration = result.registration;
      saveRegistrationIdentity(result.registration);

      if (state.paymentChangeOrigin === "code") {
        renderDoneRegistration(result.registration);
        setStep("code");
      } else {
        showExistingRegistration(result.registration);
      }
    } catch (error) {
      changePaymentError.textContent =
        error.message ||
        "Der Zahlungsweg konnte nicht gespeichert werden.";
    } finally {
      setButtonBusy(changePaymentSave, false);
    }
  });

  function resetReceiptForm({ keepRegistration = false } = {}) {
    if (!keepRegistration) {
      state.receiptRegistration = null;
    }

    state.receiptImageDataUrl = "";
    state.receiptSubmissionId = null;

    receiptFileInput.value = "";
    receiptPreviewImage.removeAttribute("src");
    receiptPreviewCard.classList.add("hidden");
    receiptAmount.value = "";
    receiptFestivalOnlyConfirmed.checked = false;
    receiptPayoutMethodInputs.forEach((input) => {
      input.checked = false;
    });
    receiptBankName.value = "";
    receiptBankIban.value = "";
    receiptPaypalAccount.value = "";
    receiptBankFields.classList.add("hidden");
    receiptPaypalFields.classList.add("hidden");
    receiptUploadError.textContent = "";
    receiptSubmitButton.disabled = true;
  }

  function receiptMainName(registration) {
    const first = Array.isArray(registration?.people)
      ? registration.people[0]
      : null;

    return first
      ? `${first.firstName || ""} ${first.lastName || ""}`.trim()
      : "–";
  }

  function parseReceiptAmount(value) {
    const raw = String(value || "")
      .trim()
      .replace(/\s/g, "");

    let normalized = raw;

    if (raw.includes(",") && raw.includes(".")) {
      normalized = raw.replace(/\./g, "").replace(",", ".");
    } else if (raw.includes(",")) {
      normalized = raw.replace(",", ".");
    }

    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : NaN;
  }

  function normalizedIban(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .toUpperCase();
  }

  function selectedReceiptPayoutMethod() {
    return receiptPayoutMethodInputs.find(
      (input) => input.checked
    )?.value || "";
  }

  function receiptPayoutIsComplete() {
    const method = selectedReceiptPayoutMethod();

    if (method === "bank") {
      return (
        receiptBankName.value.trim().length >= 2 &&
        /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(
          normalizedIban(receiptBankIban.value)
        )
      );
    }

    if (method === "paypal") {
      return receiptPaypalAccount.value.trim().length >= 3;
    }

    return false;
  }

  function renderReceiptPayoutFields() {
    const method = selectedReceiptPayoutMethod();

    receiptBankFields.classList.toggle(
      "hidden",
      method !== "bank"
    );

    receiptPaypalFields.classList.toggle(
      "hidden",
      method !== "paypal"
    );

    updateReceiptSubmitState();
  }

  function updateReceiptSubmitState() {
    const amount = parseReceiptAmount(receiptAmount.value);

    receiptSubmitButton.disabled = !(
      state.receiptRegistration?.accessCode &&
      state.receiptImageDataUrl &&
      Number.isFinite(amount) &&
      amount > 0 &&
      receiptPayoutIsComplete() &&
      receiptFestivalOnlyConfirmed.checked
    );
  }

  function readReceiptFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(
        new Error("Das Foto konnte nicht gelesen werden.")
      );
      reader.readAsDataURL(file);
    });
  }

  function loadReceiptImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(
        new Error("Das Foto konnte nicht verarbeitet werden.")
      );
      image.src = dataUrl;
    });
  }

  async function prepareReceiptImage(file) {
    if (!file || !String(file.type || "").startsWith("image/")) {
      throw new Error(
        "Bitte ein Foto oder eine Bilddatei des Kassenbons auswählen."
      );
    }

    const originalUrl = await readReceiptFile(file);
    const image = await loadReceiptImage(originalUrl);

    const maxSide = 2400;
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const scale = Math.min(
      1,
      maxSide / Math.max(sourceWidth, sourceHeight)
    );

    let width = Math.max(1, Math.round(sourceWidth * scale));
    let height = Math.max(1, Math.round(sourceHeight * scale));
    let quality = 0.86;
    let dataUrl = "";

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { alpha: false });
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      dataUrl = canvas.toDataURL("image/jpeg", quality);

      const payload = dataUrl.split(",")[1] || "";
      const bytes = Math.ceil(payload.length * 0.75);

      if (bytes <= 900000) {
        break;
      }

      quality = Math.max(0.58, quality - 0.07);

      if (attempt >= 2) {
        width = Math.max(900, Math.round(width * 0.86));
        height = Math.max(900, Math.round(height * 0.86));
      }
    }

    const payload = dataUrl.split(",")[1] || "";
    const bytes = Math.ceil(payload.length * 0.75);

    if (bytes > 1300000) {
      throw new Error(
        "Das Foto ist trotz Komprimierung noch zu groß. Bitte den Kassenbon etwas näher fotografieren."
      );
    }

    return dataUrl;
  }

  paymentsReceiptButton.addEventListener("click", () => {
    const saved = getSavedRegistrationIdentity();

    if (saved) {
      receiptLookupCode.value = saved.code || "";
    }

    receiptLookupError.textContent = "";
    resetReceiptForm();
    setStep("receipt-lookup");
  });

  receiptLookupBack.addEventListener("click", () => {
    receiptLookupError.textContent = "";
    setStep("payments-home");
  });

  async function lookupReceiptRegistration() {
    const code = receiptLookupCode.value.trim();

    if (!code) {
      receiptLookupError.textContent =
        "Bitte deinen Anmeldecode eingeben.";
      return;
    }

    setButtonBusy(receiptLookupSubmit, true, "Wird geladen …");
    receiptLookupError.textContent = "";

    try {
      const registration = await loadRegistration(code, "");
      state.receiptRegistration = registration;
      saveRegistrationIdentity(registration);

      receiptRegistrationCode.textContent =
        registration.accessCode || "–";
      receiptRegistrationName.textContent =
        receiptMainName(registration);

      resetReceiptForm({ keepRegistration: true });
      setStep("receipt-upload");
    } catch (error) {
      receiptLookupError.textContent = friendlyLookupError(error);
    } finally {
      setButtonBusy(receiptLookupSubmit, false);
    }
  }

  receiptLookupSubmit.addEventListener("click", () => {
    void lookupReceiptRegistration();
  });

  receiptLookupCode.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void lookupReceiptRegistration();
  });

  receiptUploadBack.addEventListener("click", () => {
    resetReceiptForm({ keepRegistration: true });
    setStep("receipt-lookup");
  });

  receiptFileInput.addEventListener("change", async () => {
    const file = receiptFileInput.files?.[0];

    if (!file) {
      state.receiptImageDataUrl = "";
      receiptPreviewImage.removeAttribute("src");
      receiptPreviewCard.classList.add("hidden");
      updateReceiptSubmitState();
      return;
    }

    receiptUploadError.textContent = "";
    receiptSubmitButton.disabled = true;

    try {
      const dataUrl = await prepareReceiptImage(file);
      state.receiptImageDataUrl = dataUrl;
      receiptPreviewImage.src = dataUrl;
      receiptPreviewCard.classList.remove("hidden");
    } catch (error) {
      state.receiptImageDataUrl = "";
      receiptFileInput.value = "";
      receiptPreviewImage.removeAttribute("src");
      receiptPreviewCard.classList.add("hidden");
      receiptUploadError.textContent = error.message;
    }

    updateReceiptSubmitState();
  });

  receiptReplaceFileButton.addEventListener("click", () => {
    receiptFileInput.click();
  });

  [
    receiptAmount,
    receiptFestivalOnlyConfirmed,
    receiptBankName,
    receiptBankIban,
    receiptPaypalAccount
  ].forEach((element) => {
    element.addEventListener("input", updateReceiptSubmitState);
    element.addEventListener("change", updateReceiptSubmitState);
  });

  receiptPayoutMethodInputs.forEach((input) => {
    input.addEventListener("change", renderReceiptPayoutFields);
  });

  receiptBankIban.addEventListener("input", () => {
    const compact = normalizedIban(receiptBankIban.value);
    receiptBankIban.value = compact
      .replace(/(.{4})/g, "$1 ")
      .trim();
  });

  receiptSubmitButton.addEventListener("click", async () => {
    const registration = state.receiptRegistration;
    const amount = parseReceiptAmount(receiptAmount.value);

    if (!registration?.accessCode || !state.receiptImageDataUrl) {
      receiptUploadError.textContent =
        "Bitte zuerst einen Kassenbon auswählen.";
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      receiptUploadError.textContent =
        "Bitte einen gültigen Gesamtpreis eintragen.";
      return;
    }

    const payoutMethod = selectedReceiptPayoutMethod();

    if (!receiptPayoutIsComplete()) {
      receiptUploadError.textContent =
        payoutMethod === "bank"
          ? "Bitte Name des Kontoinhabers und eine vollständige IBAN für die Rückerstattung angeben."
          : payoutMethod === "paypal"
            ? "Bitte die PayPal-E-Mail oder den PayPal-Benutzernamen angeben."
            : "Bitte Überweisung oder PayPal für die Rückerstattung auswählen.";
      return;
    }

    if (!receiptFestivalOnlyConfirmed.checked) {
      receiptUploadError.textContent =
        "Bitte bestätige, dass der angegebene Preis nur die für das Straßenfest aufgewendeten Bezüge enthält.";
      return;
    }

    if (!state.receiptSubmissionId) {
      state.receiptSubmissionId =
        window.StrassenfestApi.createRequestId("receipt");
    }

    setButtonBusy(receiptSubmitButton, true, "Wird eingereicht …");
    receiptUploadError.textContent = "";

    try {
      const result = await apiRequest(
        "submitReceipt",
        {
          receipt: {
            id: state.receiptSubmissionId,
            code: registration.accessCode,
            amount,
            festivalOnlyConfirmed: true,
            payoutMethod,
            payoutName:
              payoutMethod === "bank"
                ? receiptBankName.value.trim()
                : "",
            payoutIban:
              payoutMethod === "bank"
                ? normalizedIban(receiptBankIban.value)
                : "",
            payoutPaypal:
              payoutMethod === "paypal"
                ? receiptPaypalAccount.value.trim()
                : "",
            imageDataUrl: state.receiptImageDataUrl
          }
        },
        { timeoutMs: 60000 }
      );

      receiptDoneId.textContent = result.receipt?.id || "–";
      state.receiptSubmissionId = null;
      setStep("receipt-done");
    } catch (error) {
      receiptUploadError.textContent = error.message;
    } finally {
      setButtonBusy(receiptSubmitButton, false);
      updateReceiptSubmitState();
    }
  });

  receiptAnotherButton.addEventListener("click", () => {
    const registration = state.receiptRegistration;

    resetReceiptForm({ keepRegistration: true });

    if (registration) {
      receiptRegistrationCode.textContent =
        registration.accessCode || "–";
      receiptRegistrationName.textContent =
        receiptMainName(registration);
      setStep("receipt-upload");
    } else {
      setStep("receipt-lookup");
    }
  });

  receiptDonePayments.addEventListener("click", () => {
    resetReceiptForm();
    setStep("payments-home");
  });

  homeExistingRegistration.addEventListener("click", () => {
    const saved = getSavedRegistrationIdentity();

    if (saved) {
      frontLookupCode.value = saved.code || "";
    }

    frontLookupError.textContent = "";
    setStep("existing");
  });

  existingBack.addEventListener("click", () => {
    frontLookupError.textContent = "";
    setStep("home");
  });

  async function lookupExistingRegistration() {
    const code = frontLookupCode.value.trim();

    if (!code) {
      frontLookupError.textContent = "Bitte deinen Anmeldecode eingeben.";
      return;
    }

    setButtonBusy(frontLookupSubmit, true, "Wird geladen …");
    frontLookupError.textContent = "";

    try {
      const registration = await loadRegistration(code, "");
      saveRegistrationIdentity(registration);
      showExistingRegistration(registration);
    } catch (error) {
      frontLookupError.textContent = friendlyLookupError(error);
    } finally {
      setButtonBusy(frontLookupSubmit, false);
    }
  }

  frontLookupSubmit.addEventListener("click", () => {
    void lookupExistingRegistration();
  });

  frontLookupCode.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void lookupExistingRegistration();
  });

  frontExistingChangePayment.addEventListener("click", () => {
    if (!state.savedRegistration) return;
    openPaymentChange(state.savedRegistration, "existing-view");
  });

  frontExistingPdf.addEventListener("click", async () => {
    if (!state.savedRegistration || frontExistingPdf.disabled) return;

    const originalText = frontExistingPdf.textContent;
    frontExistingPdf.disabled = true;
    frontExistingPdf.textContent = "PDF wird vorbereitet …";

    try {
      await downloadRegistrationPdf(state.savedRegistration);
    } finally {
      frontExistingPdf.disabled = false;
      frontExistingPdf.textContent = originalText;
    }
  });

  frontExistingOther.addEventListener("click", () => {
    state.savedRegistration = null;
    frontLookupError.textContent = "";
    frontLookupCode.value = "";
    setStep("existing");
  });

  frontExistingHome.addEventListener("click", () => {
    setStep("home");
  });

  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => setStep(button.dataset.go));
  });

  document.addEventListener("click", (event) => {
    const navButton = event.target.closest?.("[data-go]");
    if (!navButton || navButton.disabled) return;
    setStep(navButton.dataset.go);
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

  async function submitRegistration(payload) {
    // requestId und registration.id bleiben für diesen Versuch eindeutig.
    // Falls der Nutzer nach einem Timeout erneut absendet, bleibt
    // state.submissionId bestehen und der Server erkennt dieselbe Anmeldung
    // weiterhin idempotent.
    const result = await apiRequest(
      "create",
      { registration: payload },
      { timeoutMs: 40000 }
    );

    if (!result?.registration) {
      throw new Error(
        "Die Anmeldung wurde nicht vollständig vom Server bestätigt."
      );
    }

    saveLocalRegistration(result.registration);
    return result.registration;
  }

  let confirmationCountdownTimer = null;

  function renderDoneRegistration(registration) {
    accessCode.textContent = registration.accessCode || "–";

    renderPostRegistrationPayment(registration, {
      method: confirmationPaymentMethod,
      amount: confirmationPaymentAmount,
      paypal: confirmationPaypalArea,
      changeButton: changePaymentAfterSubmitButton
    });
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


  changePaymentAfterSubmitButton.addEventListener("click", () => {
    if (!state.savedRegistration) return;
    openPaymentChange(state.savedRegistration, "code");
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

  myRegistrationButton?.addEventListener("click", openRegistrationLookup);

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

    const submitButton = document.getElementById("finalSubmitButton");
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
    state.step = "home";
    state.people = [];
    state.bringing = null;
    state.category = "";
    state.subtype = "";
    state.contribution = "";
    state.contributionOrigin = "choice";
    state.presetContribution = false;
    state.paymentMode = null;
    state.paymentMethod = null;
    state.totalCost = 0;
    state.savedRegistration = null;
    state.paymentChangeOrigin = "payments-home";
    state.paymentChangeMethod = null;
    state.paymentChangeMode = null;
    state.submissionId = null;
    state.submitting = false;
    form.reset();
    peopleRows.innerHTML = "";
    clearPersonComposer({ focus: false });
    renderPeopleList();
    resetContribution();
    personError.textContent = "";
    paymentError.textContent = "";
    submitStatus.textContent = "";
    setStep("home");
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

  modalClose.addEventListener("click", () => { modalBackdrop.hidden = true; });
  modalBackdrop.addEventListener("click", (event) => { if (event.target === modalBackdrop) modalBackdrop.hidden = true; });
  window.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modalBackdrop.hidden) modalBackdrop.hidden = true; });


  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    animateButtonPress(button);
  });

  const FIRST_VISIT_NOTICE_KEY =
    "strassenfest-hilchenbach-planungshinweis-2026-v1";

  function showFirstVisitNoticeIfNeeded() {
    let seen = false;

    try {
      seen =
        localStorage.getItem(
          FIRST_VISIT_NOTICE_KEY
        ) === "1";
    } catch {}

    if (seen) {
      return;
    }

    firstVisitNotice?.classList.remove(
      "hidden"
    );

    window.setTimeout(
      () => {
        firstVisitNoticeOk?.focus();
      },
      80
    );
  }

  function closeFirstVisitNotice() {
    firstVisitNotice?.classList.add(
      "hidden"
    );

    try {
      localStorage.setItem(
        FIRST_VISIT_NOTICE_KEY,
        "1"
      );
    } catch {}
  }

  firstVisitNoticeOk?.addEventListener(
    "click",
    closeFirstVisitNotice
  );

  refreshMyRegistrationHint();
  ensureInitialPersonRow();
  updateProcessNavigation();
  showFirstVisitNoticeIfNeeded();

  // Feuerwerk v22: sauber auf die tatsächliche Canvas-Größe skaliert,
  // etwas heller und mit runderen, klareren Explosionen.
  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && ctx) {
    const rockets = [];
    const particles = [];
    const palette = [
      "255, 222, 118",
      "255, 170, 195",
      "255, 247, 225",
      "210, 190, 255",
      "120, 226, 255",
      "255, 191, 92"
    ];

    let width = 1;
    let height = 1;
    let dpr = 1;
    let nextLaunch = performance.now() + 350;
    let fireworksPaused = document.visibilityState !== "visible";

    document.addEventListener("visibilitychange", () => {
      fireworksPaused = document.visibilityState !== "visible";

      if (!fireworksPaused) {
        nextLaunch = performance.now() + 250;
      }
    });

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();

      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      // CSS- und Zeichenfläche explizit synchron halten. Dadurch kann das
      // Feuerwerk auf mobilen Browsern nicht mehr horizontal/vertikal gestaucht
      // werden, wenn sich die Browserleiste oder Viewport-Höhe verändert.
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      if (typeof ctx.resetTransform === "function") {
        ctx.resetTransform();
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }

      ctx.scale(dpr, dpr);
    }

    resizeCanvas();

    window.addEventListener("resize", () => {
      if (!viewport.keyboardOpen) resizeCanvas();
    }, { passive: true });

    window.addEventListener("orientationchange", () => {
      window.setTimeout(resizeCanvas, 180);
    }, { passive: true });

    function launchRocket(delayOffset = 0) {
      window.setTimeout(() => {
        const targetX = width * (0.08 + Math.random() * 0.84);
        const targetY = height * (0.09 + Math.random() * 0.34);
        const startX = targetX + (Math.random() - 0.5) * 90;

        rockets.push({
          x: startX,
          y: height + 18,
          vx: (targetX - startX) / (56 + Math.random() * 12),
          vy: -(2.05 + Math.random() * 0.52),
          targetY,
          alpha: .72,
          color: palette[Math.floor(Math.random() * palette.length)]
        });
      }, delayOffset);
    }

    function explode(rocket) {
      const count = 42 + Math.floor(Math.random() * 20);
      const baseSpeed = 1.10 + Math.random() * .52;
      const doubleRing = Math.random() > .62;

      const addRing = (speedFactor, alphaFactor, sizeFactor) => {
        for (let i = 0; i < count; i += 1) {
          const angle =
            (Math.PI * 2 * i) / count +
            (Math.random() - .5) * .055;

          const speed =
            baseSpeed *
            speedFactor *
            (.78 + Math.random() * .34);

          if (particles.length >= 420) {
            particles.splice(0, Math.min(60, particles.length));
          }

          particles.push({
            x: rocket.x,
            y: rocket.y,
            oldX: rocket.x,
            oldY: rocket.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            gravity: .012,
            alpha: (.60 + Math.random() * .23) * alphaFactor,
            fade: .0030 + Math.random() * .0016,
            size: (1.35 + Math.random() * 1.55) * sizeFactor,
            color: rocket.color
          });
        }
      };

      addRing(1, 1, 1);

      if (doubleRing) {
        addRing(.58, .72, .76);
      }

      // Kleiner heller Kern, damit die Explosion definierter wirkt.
      for (let i = 0; i < 10; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = .35 + Math.random() * .55;

        particles.push({
          x: rocket.x,
          y: rocket.y,
          oldX: rocket.x,
          oldY: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: .009,
          alpha: .92,
          fade: .006 + Math.random() * .002,
          size: 1.7 + Math.random() * 1.25,
          color: "255, 248, 222"
        });
      }
    }

    function animate(now) {
      if (fireworksPaused) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      if (now >= nextLaunch) {
        const total = Math.random() > .67 ? 2 : 1;

        for (let i = 0; i < total; i += 1) {
          launchRocket(i * 360);
        }

        nextLaunch = now + 1750 + Math.random() * 1850;
      }

      // Raketen
      ctx.globalCompositeOperation = "source-over";

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const rocket = rockets[i];
        const oldX = rocket.x;
        const oldY = rocket.y;

        rocket.x += rocket.vx;
        rocket.y += rocket.vy;

        ctx.beginPath();
        ctx.moveTo(oldX, oldY + 9);
        ctx.lineTo(rocket.x, rocket.y);
        ctx.strokeStyle = `rgba(${rocket.color}, ${rocket.alpha * .82})`;
        ctx.lineWidth = 1.55;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 2.05, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rocket.color}, ${rocket.alpha})`;
        ctx.fill();

        if (rocket.y <= rocket.targetY) {
          explode(rocket);
          rockets.splice(i, 1);
        }
      }

      // Additives Zeichnen macht die Funken heller, ohne das Bild zuzudecken.
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];

        particle.oldX = particle.x;
        particle.oldY = particle.y;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity;
        particle.vx *= .995;
        particle.alpha -= particle.fade;

        if (particle.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, particle.alpha);

        // Kurzer Schweif
        ctx.beginPath();
        ctx.moveTo(particle.oldX, particle.oldY);
        ctx.lineTo(
          particle.x - particle.vx * 1.8,
          particle.y - particle.vy * 1.8
        );
        ctx.strokeStyle = `rgba(${particle.color}, ${alpha * .42})`;
        ctx.lineWidth = Math.max(.65, particle.size * .48);
        ctx.stroke();

        // Funkenkopf
        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(${particle.color}, ${alpha})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }
})();
