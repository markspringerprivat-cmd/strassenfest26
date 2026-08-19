(() => {
  "use strict";

  const API_ENDPOINT = "https://script.google.com/macros/s/AKfycbyR2jC7NmY5h2q__ZLJo-SeuNpGoXoJO-JNyNahOlkVybBKZoRlS1Mb859Gov8Hb3pkEw/exec";
  const SESSION_KEY = "strassenfest-admin-session";

  const state = {
    token: sessionStorage.getItem(SESSION_KEY) || "",
    people: [],
    expenses: [],
    tickets: [],
    receipts: [],
    activeReceiptId: "",
    summary: {
      peopleCount: 0,
      due: 0,
      paid: 0,
      open: 0
    },
    expandedRegistrations: new Set(),
    editingExpenseId: "",
    pendingPrimaryDeletion: null
  };

  const loginCard = document.getElementById("loginCard");
  const loginForm = document.getElementById("loginForm");
  const adminPassword = document.getElementById("adminPassword");
  const loginButton = document.getElementById("loginButton");
  const loginError = document.getElementById("loginError");
  const adminApp = document.getElementById("adminApp");
  const logoutButton = document.getElementById("logoutButton");
  const adminToast = document.getElementById("adminToast");

  const tabButtons = [...document.querySelectorAll(".tab-button")];
  const tabPanels = [...document.querySelectorAll(".tab-panel")];

  const peopleToolsToggle = document.getElementById("peopleToolsToggle");
  const peopleToolsPanel = document.getElementById("peopleToolsPanel");
  const peopleToolMode = document.getElementById("peopleToolMode");
  const peopleSearchType = document.getElementById("peopleSearchType");
  const peopleSearchOptions = document.getElementById("peopleSearchOptions");
  const peopleSortOptions = document.getElementById("peopleSortOptions");
  const peopleTextSearchWrap = document.getElementById("peopleTextSearchWrap");
  const peopleTextSearchLabel = document.getElementById("peopleTextSearchLabel");
  const paymentFilterWrap = document.getElementById("paymentFilterWrap");
  const categoryFilterWrap = document.getElementById("categoryFilterWrap");
  const peopleToolsReset = document.getElementById("peopleToolsReset");
  const peopleSearch = document.getElementById("peopleSearch");
  const paymentFilter = document.getElementById("paymentFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const peopleSort = document.getElementById("peopleSort");
  const peopleResultCount = document.getElementById("peopleResultCount");
  const adminPeopleList = document.getElementById("adminPeopleList");
  const refreshOverview = document.getElementById("refreshOverview");
  const overviewSaveStatus = document.getElementById("overviewSaveStatus");

  const metricPeople = document.getElementById("metricPeople");
  const metricDue = document.getElementById("metricDue");
  const metricPaid = document.getElementById("metricPaid");
  const metricOpen = document.getElementById("metricOpen");

  const shoppingPaid = document.getElementById("shoppingPaid");
  const shoppingExpenses = document.getElementById("shoppingExpenses");
  const shoppingRemaining = document.getElementById("shoppingRemaining");
  const remainingCard = document.getElementById("remainingCard");
  const expenseTotalBottom = document.getElementById("expenseTotalBottom");
  const shoppingPaidBottom = document.getElementById("shoppingPaidBottom");
  const shoppingExpensesBottom = document.getElementById("shoppingExpensesBottom");
  const shoppingRemainingBottom = document.getElementById("shoppingRemainingBottom");
  const expenseList = document.getElementById("expenseList");
  const addExpenseButton = document.getElementById("addExpenseButton");
  const shoppingSaveStatus = document.getElementById("shoppingSaveStatus");

  const ticketTabCount = document.getElementById("ticketTabCount");
  const metricTickets = document.getElementById("metricTickets");
  const metricTicketsOpen = document.getElementById("metricTicketsOpen");
  const ticketSearch = document.getElementById("ticketSearch");
  const ticketFilter = document.getElementById("ticketFilter");
  const ticketSort = document.getElementById("ticketSort");
  const ticketResultCount = document.getElementById("ticketResultCount");
  const ticketList = document.getElementById("ticketList");
  const refreshTickets = document.getElementById("refreshTickets");
  const ticketSaveStatus = document.getElementById("ticketSaveStatus");

  const receiptTabCount = document.getElementById("receiptTabCount");
  const metricReceiptsTotal = document.getElementById("metricReceiptsTotal");
  const metricReceiptsReimbursed = document.getElementById("metricReceiptsReimbursed");
  const metricReceiptsOpen = document.getElementById("metricReceiptsOpen");
  const receiptFilter = document.getElementById("receiptFilter");
  const receiptSort = document.getElementById("receiptSort");
  const receiptResultCount = document.getElementById("receiptResultCount");
  const receiptList = document.getElementById("receiptList");
  const refreshReceipts = document.getElementById("refreshReceipts");
  const receiptSaveStatus = document.getElementById("receiptSaveStatus");

  const reportStatus = document.getElementById("reportStatus");
  const reportRegistrations = document.getElementById("reportRegistrations");
  const reportPeople = document.getElementById("reportPeople");
  const reportPaid = document.getElementById("reportPaid");
  const reportOpen = document.getElementById("reportOpen");
  const reportExpenses = document.getElementById("reportExpenses");
  const reportReviewedReceipts = document.getElementById("reportReviewedReceipts");
  const reportReimbursementOpen = document.getElementById("reportReimbursementOpen");
  const reportFinalCosts = document.getElementById("reportFinalCosts");
  const reportCashBalance = document.getElementById("reportCashBalance");
  const reportBreakdown = document.getElementById("reportBreakdown");
  const generateReportPdf = document.getElementById("generateReportPdf");
  const reportPdfProgress = document.getElementById("reportPdfProgress");

  const receiptModal = document.getElementById("receiptModal");
  const receiptModalTitle = document.getElementById("receiptModalTitle");
  const receiptModalCode = document.getElementById("receiptModalCode");
  const receiptModalName = document.getElementById("receiptModalName");
  const receiptImageLoading = document.getElementById("receiptImageLoading");
  const receiptModalImage = document.getElementById("receiptModalImage");
  const receiptModalAmount = document.getElementById("receiptModalAmount");
  const receiptModalReimbursed = document.getElementById("receiptModalReimbursed");
  const receiptModalError = document.getElementById("receiptModalError");
  const deleteReceiptButton = document.getElementById("deleteReceiptButton");
  const cancelReceiptModal = document.getElementById("cancelReceiptModal");
  const saveReceiptButton = document.getElementById("saveReceiptButton");

  const primaryDeleteModal = document.getElementById("primaryDeleteModal");
  const primaryDeleteTitle = document.getElementById("primaryDeleteTitle");
  const primaryDeleteText = document.getElementById("primaryDeleteText");
  const replacementPrimaryField = document.getElementById("replacementPrimaryField");
  const replacementPrimarySelect = document.getElementById("replacementPrimarySelect");
  const cancelPrimaryDelete = document.getElementById("cancelPrimaryDelete");
  const confirmPrimaryDelete = document.getElementById("confirmPrimaryDelete");

  const expenseModal = document.getElementById("expenseModal");
  const expenseModalTitle = document.getElementById("expenseModalTitle");
  const expenseForm = document.getElementById("expenseForm");
  const expenseModalItem = document.getElementById("expenseModalItem");
  const expenseModalAmount = document.getElementById("expenseModalAmount");
  const expenseModalCategory = document.getElementById("expenseModalCategory");
  const expenseModalNote = document.getElementById("expenseModalNote");
  const expenseModalError = document.getElementById("expenseModalError");
  const cancelExpenseModal = document.getElementById("cancelExpenseModal");
  const saveExpenseModal = document.getElementById("saveExpenseModal");

  function apiRequest(action, data = {}, options = {}) {
    return window.StrassenfestApi.request(
      API_ENDPOINT,
      action,
      data,
      {
        prefix: "admin",
        timeoutMs: options.timeoutMs || 30000
      }
    );
  }

  function formatMoney(value) {
    return `${Number(value || 0).toFixed(2).replace(".", ",")} €`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  function normalize(value) {
    return String(value ?? "")
      .toLocaleLowerCase("de-DE")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function paymentMethodLabel(method) {
    if (method === "paypal") return "PayPal";
    if (method === "briefkasten") return "Briefkasten";
    if (method === "abholung") return "Abholung";
    return "Keine Zahlung";
  }

  function setSaveStatus(element, text, type = "") {
    element.textContent = text;
    element.classList.remove("saving", "error");
    if (type) element.classList.add(type);
  }

  let toastTimer = null;
  function showToast(message) {
    adminToast.textContent = message;
    adminToast.classList.remove("hidden");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => adminToast.classList.add("hidden"), 2200);
  }

  function handleApiError(error) {
    if (error?.code === "ADMIN_SESSION_INVALID") {
      sessionStorage.removeItem(SESSION_KEY);
      state.token = "";
      showLogin("Deine Admin-Sitzung ist abgelaufen. Bitte erneut anmelden.");
      return true;
    }
    return false;
  }

  function showLogin(message = "") {
    adminApp.classList.add("hidden");
    logoutButton.classList.add("hidden");
    loginCard.classList.remove("hidden");
    loginError.textContent = message;
    adminPassword.value = "";
  }

  function showAdmin() {
    loginCard.classList.add("hidden");
    adminApp.classList.remove("hidden");
    logoutButton.classList.remove("hidden");
  }

  async function login(password) {
    loginButton.disabled = true;
    loginError.textContent = "Anmeldung wird geprüft …";

    try {
      const result = await apiRequest("adminLogin", { password });
      state.token = result.token;
      sessionStorage.setItem(SESSION_KEY, state.token);
      loginError.textContent = "";
      showAdmin();
      await loadAll();
    } catch (error) {
      loginError.textContent = error.message;
    } finally {
      loginButton.disabled = false;
    }
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = adminPassword.value;
    if (!password) return;
    void login(password);
  });

  logoutButton.addEventListener("click", async () => {
    const token = state.token;
    sessionStorage.removeItem(SESSION_KEY);
    state.token = "";
    showLogin();

    if (token) {
      try {
        await apiRequest("adminLogout", { token });
      } catch {}
    }
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      tabPanels.forEach((panel) => {
        panel.classList.toggle(
          "active",
          panel.dataset.panel === button.dataset.tab
        );
      });
    });
  });

  function updateSummary() {
    const due = state.people.reduce((sum, person) => sum + Number(person.price || 0), 0);
    const paid = state.people.reduce(
      (sum, person) => sum + (person.paid ? Number(person.price || 0) : 0),
      0
    );
    const open = Math.max(0, due - paid);

    state.summary = {
      peopleCount: state.people.length,
      due,
      paid,
      open
    };

    metricPeople.textContent = String(state.summary.peopleCount);
    metricDue.textContent = formatMoney(due);
    metricPaid.textContent = formatMoney(paid);
    metricOpen.textContent = formatMoney(open);

    updateShoppingTotals();

    if (typeof renderFinalReport === "function") {
      renderFinalReport();
    }
  }

  function updateShoppingTotals() {
    const expenses = state.expenses.reduce(
      (sum, expense) => sum + Math.max(0, Number(expense.amount || 0)),
      0
    );
    const remaining = state.summary.paid - expenses;

    shoppingPaid.textContent = formatMoney(state.summary.paid);
    shoppingExpenses.textContent = formatMoney(expenses);
    shoppingRemaining.textContent = formatMoney(remaining);
    expenseTotalBottom.textContent = formatMoney(expenses);
    shoppingPaidBottom.textContent = formatMoney(state.summary.paid);
    shoppingExpensesBottom.textContent = formatMoney(expenses);
    shoppingRemainingBottom.textContent = formatMoney(remaining);

    remainingCard.style.borderColor = remaining < 0
      ? "rgba(255, 183, 197, .38)"
      : "";
    shoppingRemaining.style.color = remaining < 0
      ? "var(--danger)"
      : "";
    shoppingRemainingBottom.style.color = remaining < 0
      ? "var(--danger)"
      : "";
  }

  function resetInactivePeopleFilters(activeType = "") {
    if (activeType !== "name" && activeType !== "code") {
      peopleSearch.value = "";
    }
    if (activeType !== "payment") {
      paymentFilter.value = "all";
    }
    if (activeType !== "category") {
      categoryFilter.value = "all";
    }
  }

  function updatePeopleSearchTypeUI() {
    const type = peopleSearchType.value;

    peopleTextSearchWrap.classList.toggle(
      "hidden",
      !["name", "code"].includes(type)
    );
    paymentFilterWrap.classList.toggle("hidden", type !== "payment");
    categoryFilterWrap.classList.toggle("hidden", type !== "category");

    if (type === "code") {
      peopleTextSearchLabel.textContent = "Anmeldecode";
      peopleSearch.placeholder = "Anmeldecode eingeben …";
    } else {
      peopleTextSearchLabel.textContent = "Name";
      peopleSearch.placeholder = "Name eingeben …";
    }

    resetInactivePeopleFilters(type);
    renderPeople();
  }

  function updatePeopleToolsUI() {
    const mode = peopleToolMode.value;
    peopleSearchOptions.classList.toggle("hidden", mode !== "search");
    peopleSortOptions.classList.toggle("hidden", mode !== "sort");

    if (mode === "search") {
      updatePeopleSearchTypeUI();
    }
  }

  peopleToolsToggle.addEventListener("click", () => {
    const opening = peopleToolsPanel.classList.contains("hidden");
    peopleToolsPanel.classList.toggle("hidden", !opening);
    peopleToolsToggle.setAttribute("aria-expanded", String(opening));
  });

  peopleToolMode.addEventListener("change", () => {
    if (peopleToolMode.value === "sort") {
      resetInactivePeopleFilters("");
    }
    updatePeopleToolsUI();
    renderPeople();
  });

  peopleSearchType.addEventListener("change", updatePeopleSearchTypeUI);
  peopleSearch.addEventListener("input", renderPeople);
  paymentFilter.addEventListener("change", renderPeople);
  categoryFilter.addEventListener("change", renderPeople);
  peopleSort.addEventListener("change", renderPeople);

  peopleToolsReset.addEventListener("click", () => {
    peopleToolMode.value = "";
    peopleSearchType.value = "name";
    peopleSearch.value = "";
    paymentFilter.value = "all";
    categoryFilter.value = "all";
    peopleSort.value = "lastName-asc";
    updatePeopleToolsUI();
    renderPeople();
  });

  function groupRegistrations() {
    const groups = new Map();

    state.people.forEach((person) => {
      const registrationId = String(person.registrationId || "");
      if (!groups.has(registrationId)) {
        groups.set(registrationId, {
          registrationId,
          people: [],
          accessCode: person.accessCode || "",
          createdAt: person.createdAt || "",
          paymentMethod: person.paymentMethod || "none",
          contribution: person.contribution || null
        });
      }

      groups.get(registrationId).people.push(person);
    });

    return [...groups.values()].map((group) => {
      group.people.sort((a, b) => Number(a.position) - Number(b.position));
      group.primary = group.people.find((person) => Number(person.position) === 1) ||
        group.people[0];

      group.due = group.people.reduce(
        (sum, person) => sum + Math.max(0, Number(person.price || 0)),
        0
      );

      group.paidAmount = group.people.reduce(
        (sum, person) =>
          sum + (person.paid ? Math.max(0, Number(person.price || 0)) : 0),
        0
      );

      group.payablePeople = group.people.filter(
        (person) => Number(person.price || 0) > 0
      );

      group.allPaid = group.payablePeople.length > 0 &&
        group.payablePeople.every((person) => person.paid);

      group.hasOpen = group.payablePeople.some((person) => !person.paid);

      return group;
    });
  }

  function filteredRegistrations() {
    const query = normalize(peopleSearch.value);
    const searchType = peopleToolMode.value === "search"
      ? peopleSearchType.value
      : "";
    const payment = paymentFilter.value;
    const category = categoryFilter.value;
    const sort = peopleSort.value;

    const groups = groupRegistrations().filter((group) => {
      if (query && ["name", "code"].includes(searchType)) {
        const haystack = searchType === "code"
          ? normalize(group.accessCode)
          : normalize(
              group.people
                .map((person) => `${person.firstName} ${person.lastName}`)
                .join(" ")
            );

        if (!haystack.includes(query)) return false;
      }

      if (payment === "open" && !group.hasOpen) return false;
      if (payment === "paid" && !group.allPaid) return false;
      if (payment === "free" && group.due > 0) return false;

      const groupCategory = group.contribution?.category || "none";
      if (category !== "all" && groupCategory !== category) return false;

      return true;
    });

    const collator = new Intl.Collator("de", { sensitivity: "base" });

    groups.sort((a, b) => {
      const ap = a.primary || {};
      const bp = b.primary || {};

      if (sort === "lastName-asc") {
        return collator.compare(ap.lastName || "", bp.lastName || "") ||
          collator.compare(ap.firstName || "", bp.firstName || "");
      }

      if (sort === "lastName-desc") {
        return collator.compare(bp.lastName || "", ap.lastName || "") ||
          collator.compare(bp.firstName || "", ap.firstName || "");
      }

      if (sort === "firstName-asc") {
        return collator.compare(ap.firstName || "", bp.firstName || "") ||
          collator.compare(ap.lastName || "", bp.lastName || "");
      }

      if (sort === "age-asc") {
        return Number(ap.age || 0) - Number(bp.age || 0);
      }

      if (sort === "age-desc") {
        return Number(bp.age || 0) - Number(ap.age || 0);
      }

      if (sort === "paid-open") {
        const aOpen = a.hasOpen ? 0 : 1;
        const bOpen = b.hasOpen ? 0 : 1;
        return aOpen - bOpen ||
          collator.compare(ap.lastName || "", bp.lastName || "");
      }

      if (sort === "created-desc") {
        return new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime();
      }

      return 0;
    });

    return groups;
  }

  function contributionHtmlForGroup(group) {
    if (!group.contribution) {
      return `
        <div class="compact-meta-item">
          <span>Mitbringsel</span>
          <strong>Keins</strong>
        </div>`;
    }

    const type = group.contribution.subtype
      ? `${group.contribution.category} · ${group.contribution.subtype}`
      : group.contribution.category;

    return `
      <div class="compact-meta-item">
        <span>Mitbringsel</span>
        <strong>${escapeHtml(type)}</strong>
        <small>${escapeHtml(group.contribution.note || "–")}</small>
      </div>`;
  }

  function participantHtml(person, isPrimary) {
    const free = Number(person.price || 0) <= 0;
    const paidLabel = free
      ? "kostenlos"
      : (person.paid ? "bezahlt" : "offen");

    return `
      <div class="participant-admin-row ${isPrimary ? "primary-participant" : "attached-participant"}"
           data-person-key="${escapeAttr(person.key)}">
        <div class="participant-identity">
          <span class="participant-role">
            ${isPrimary ? "Hauptperson" : "Mitangemeldet"}
          </span>
          <strong>${escapeHtml(person.firstName)} ${escapeHtml(person.lastName)}</strong>
        </div>

        <span class="participant-age">${person.age} J.</span>
        <strong class="participant-price">${formatMoney(person.price)}</strong>

        <label class="payment-toggle participant-payment"
               title="${free ? "Keine Zahlung erforderlich" : "Bezahlstatus ändern"}">
          <input type="checkbox"
                 class="paid-checkbox"
                 ${person.paid ? "checked" : ""}
                 ${free ? "disabled" : ""}
                 aria-label="Bezahlstatus für ${escapeAttr(person.firstName + " " + person.lastName)}">
          <span>${paidLabel}</span>
        </label>

        <button class="delete-person-button"
                type="button"
                aria-label="${escapeAttr(person.firstName + " " + person.lastName)} löschen"
                title="Person löschen">×</button>
      </div>`;
  }

  function renderPeople() {
    const groups = filteredRegistrations();
    const personCount = groups.reduce((sum, group) => sum + group.people.length, 0);

    peopleResultCount.textContent =
      `${groups.length} ${groups.length === 1 ? "Anmeldung" : "Anmeldungen"} · ` +
      `${personCount} ${personCount === 1 ? "Person" : "Personen"}`;

    if (!groups.length) {
      adminPeopleList.innerHTML = `
        <div class="empty-state">
          Für die aktuelle Suche bzw. Sortierung wurden keine Anmeldungen gefunden.
        </div>`;
      return;
    }

    adminPeopleList.innerHTML = groups.map((group) => {
      const expanded = state.expandedRegistrations.has(group.registrationId);
      const date = group.createdAt
        ? new Date(group.createdAt).toLocaleDateString("de-DE")
        : "–";

      const attached = group.people.filter(
        (person) => Number(person.position) !== Number(group.primary?.position)
      );

      const attachedNames = attached.length
        ? attached.map((person) =>
            `${person.firstName} ${person.lastName}`
          ).join(", ")
        : "Keine weiteren Personen";

      const paymentText = group.due <= 0
        ? "Keine Zahlung erforderlich"
        : `${formatMoney(group.paidAmount)} von ${formatMoney(group.due)} bezahlt`;

      const groupButtonText = group.allPaid
        ? "Alle wieder auf offen"
        : "Alle als bezahlt markieren";

      return `
        <article class="registration-admin-group ${expanded ? "is-expanded" : ""}"
                 data-registration-id="${escapeAttr(group.registrationId)}">
          <button type="button"
                  class="registration-summary-toggle"
                  aria-expanded="${expanded ? "true" : "false"}">
            <span class="compact-registration-primary">
              <small>Hauptzahler / Hauptanmeldung</small>
              <strong>${escapeHtml(group.primary?.firstName || "")} ${escapeHtml(group.primary?.lastName || "")}</strong>
            </span>

            <span class="compact-registration-attached">
              <small>Mitangemeldet</small>
              <span>${escapeHtml(attachedNames)}</span>
            </span>

            <span class="compact-registration-chevron" aria-hidden="true">
              ${expanded ? "⌃" : "⌄"}
            </span>
          </button>

          <div class="registration-expanded-details ${expanded ? "" : "hidden"}">
            <div class="compact-registration-meta">
              <div class="compact-meta-item">
                <span>Anmeldecode</span>
                <code>${escapeHtml(group.accessCode || "")}</code>
                <small>${escapeHtml(date)}</small>
              </div>

              ${contributionHtmlForGroup(group)}

              <div class="compact-meta-item">
                <span>Zahlungsart</span>
                <strong>${escapeHtml(paymentMethodLabel(group.paymentMethod))}</strong>
              </div>

              <div class="compact-meta-item compact-payment-summary">
                <span>Zahlungsstand</span>
                <strong>${escapeHtml(paymentText)}</strong>
                ${group.due > 0 ? `
                  <button type="button"
                          class="group-paid-button ${group.allPaid ? "is-all-paid" : ""}"
                          data-target-paid="${group.allPaid ? "false" : "true"}">
                    ${escapeHtml(groupButtonText)}
                  </button>` : ""}
              </div>
            </div>

            <div class="registration-participants">
              ${group.people.map((person) =>
                participantHtml(
                  person,
                  Number(person.position) === Number(group.primary?.position)
                )
              ).join("")}
            </div>
          </div>
        </article>`;
    }).join("");
  }

  async function setPaid(person, paid, checkbox) {
    setSaveStatus(overviewSaveStatus, "Speichert …", "saving");
    checkbox.disabled = true;

    try {
      const result = await apiRequest("adminSetPaid", {
        token: state.token,
        registrationId: person.registrationId,
        position: person.position,
        paid
      });

      person.paid = Boolean(result.paid);
      person.paidAt = result.paidAt || null;
      updateSummary();
      renderPeople();
      setSaveStatus(overviewSaveStatus, "Gespeichert");
      window.setTimeout(() => {
        setSaveStatus(overviewSaveStatus, "Aktuell");
      }, 1100);
    } catch (error) {
      person.paid = !paid;
      if (!handleApiError(error)) {
        setSaveStatus(overviewSaveStatus, "Fehler", "error");
        showToast(error.message);
        renderPeople();
      }
    }
  }

  async function setRegistrationPaid(group, paid, button) {
    if (!group || group.due <= 0) return;

    setSaveStatus(overviewSaveStatus, "Speichert …", "saving");
    button.disabled = true;

    try {
      const result = await apiRequest("adminSetRegistrationPaid", {
        token: state.token,
        registrationId: group.registrationId,
        paid
      });

      const updates = Array.isArray(result.people) ? result.people : [];

      updates.forEach((update) => {
        const person = state.people.find((item) =>
          item.registrationId === group.registrationId &&
          Number(item.position) === Number(update.position)
        );
        if (!person) return;
        person.paid = Boolean(update.paid);
        person.paidAt = update.paidAt || null;
      });

      updateSummary();
      renderPeople();
      setSaveStatus(overviewSaveStatus, "Gespeichert");
      showToast(
        paid
          ? "Alle kostenpflichtigen Personen dieser Anmeldung wurden als bezahlt markiert."
          : "Alle kostenpflichtigen Personen dieser Anmeldung wurden wieder auf offen gesetzt."
      );

      window.setTimeout(() => {
        setSaveStatus(overviewSaveStatus, "Aktuell");
      }, 1100);
    } catch (error) {
      if (!handleApiError(error)) {
        setSaveStatus(overviewSaveStatus, "Fehler", "error");
        showToast(error.message);
        renderPeople();
      }
    }
  }

  function closePrimaryDeleteModal() {
    state.pendingPrimaryDeletion = null;
    primaryDeleteModal.classList.add("hidden");
    replacementPrimarySelect.innerHTML = "";
  }

  function openPrimaryDeleteModal(person, group) {
    state.pendingPrimaryDeletion = { person, group };
    const replacements = group.people.filter(
      (candidate) => candidate.key !== person.key
    );

    if (!replacements.length) {
      primaryDeleteTitle.textContent = "Letzte Person löschen?";
      primaryDeleteText.textContent =
        "Diese Anmeldung enthält keine weitere Person. Wenn du fortfährst, wird die gesamte Anmeldung gelöscht.";
      replacementPrimaryField.classList.add("hidden");
      confirmPrimaryDelete.textContent = "Anmeldung löschen";
    } else {
      primaryDeleteTitle.textContent = "Neue Hauptperson auswählen";
      primaryDeleteText.textContent =
        `${person.firstName} ${person.lastName} ist aktuell die Hauptperson. Wähle aus, wer die Hauptanmeldung übernehmen soll.`;
      replacementPrimaryField.classList.remove("hidden");
      replacementPrimarySelect.innerHTML = replacements.map((candidate) => `
        <option value="${Number(candidate.position)}">
          ${escapeHtml(candidate.firstName)} ${escapeHtml(candidate.lastName)}
        </option>
      `).join("");
      confirmPrimaryDelete.textContent = "Löschen & Hauptperson wechseln";
    }

    primaryDeleteModal.classList.remove("hidden");
  }

  async function deletePerson(person, replacementPosition = null) {
    setSaveStatus(overviewSaveStatus, "Löscht …", "saving");

    try {
      const result = await apiRequest("adminDeletePerson", {
        token: state.token,
        registrationId: person.registrationId,
        position: person.position,
        replacementPosition
      });

      if (result.registrationDeleted) {
        state.expandedRegistrations.delete(person.registrationId);
      }

      await loadOverview();
      showToast(
        result.registrationDeleted
          ? "Die Anmeldung wurde gelöscht."
          : "Die Person wurde gelöscht."
      );
    } catch (error) {
      if (!handleApiError(error)) {
        setSaveStatus(overviewSaveStatus, "Fehler", "error");
        showToast(error.message);
      }
    }
  }

  cancelPrimaryDelete.addEventListener("click", closePrimaryDeleteModal);

  primaryDeleteModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-primary-modal]")) {
      closePrimaryDeleteModal();
    }
  });

  confirmPrimaryDelete.addEventListener("click", async () => {
    const pending = state.pendingPrimaryDeletion;
    if (!pending) return;

    const replacements = pending.group.people.filter(
      (candidate) => candidate.key !== pending.person.key
    );

    const replacementPosition = replacements.length
      ? Number(replacementPrimarySelect.value)
      : null;

    confirmPrimaryDelete.disabled = true;
    try {
      closePrimaryDeleteModal();
      await deletePerson(pending.person, replacementPosition);
    } finally {
      confirmPrimaryDelete.disabled = false;
    }
  });

  adminPeopleList.addEventListener("change", (event) => {
    const checkbox = event.target.closest(".paid-checkbox");
    if (!checkbox) return;

    const row = checkbox.closest(".participant-admin-row");
    const person = state.people.find(
      (item) => item.key === row?.dataset.personKey
    );
    if (!person) return;

    void setPaid(person, checkbox.checked, checkbox);
  });

  adminPeopleList.addEventListener("click", (event) => {
    const summaryButton = event.target.closest(".registration-summary-toggle");

    if (summaryButton) {
      const article = summaryButton.closest(".registration-admin-group");
      const registrationId = article?.dataset.registrationId;
      if (!registrationId) return;

      if (state.expandedRegistrations.has(registrationId)) {
        state.expandedRegistrations.delete(registrationId);
      } else {
        state.expandedRegistrations.add(registrationId);
      }

      renderPeople();
      return;
    }

    const deleteButton = event.target.closest(".delete-person-button");

    if (deleteButton) {
      const row = deleteButton.closest(".participant-admin-row");
      const person = state.people.find(
        (item) => item.key === row?.dataset.personKey
      );
      if (!person) return;

      const group = groupRegistrations().find(
        (item) => item.registrationId === person.registrationId
      );
      if (!group) return;

      const isPrimary =
        Number(person.position) === Number(group.primary?.position);

      if (isPrimary) {
        openPrimaryDeleteModal(person, group);
      } else if (
        window.confirm(
          `${person.firstName} ${person.lastName} wirklich aus dieser Anmeldung löschen?`
        )
      ) {
        void deletePerson(person);
      }
      return;
    }

    const button = event.target.closest(".group-paid-button");
    if (!button) return;

    const article = button.closest(".registration-admin-group");
    const registrationId = article?.dataset.registrationId;
    const group = groupRegistrations().find(
      (item) => item.registrationId === registrationId
    );
    if (!group) return;

    void setRegistrationPaid(
      group,
      button.dataset.targetPaid === "true",
      button
    );
  });

  refreshOverview.addEventListener("click", () => void loadOverview());

  function renderExpenses() {
    if (!state.expenses.length) {
      expenseList.innerHTML = `
        <div class="empty-state">Noch keine Einkaufsposten vorhanden.</div>`;
      updateShoppingTotals();

      if (typeof renderFinalReport === "function") {
        renderFinalReport();
      }
      return;
    }

    expenseList.innerHTML = state.expenses.map((expense) => {
      const hasDetails = Boolean(
        String(expense.note || "").trim() ||
        String(expense.category || "").trim()
      );

      return `
        <article class="expense-row expense-list-row"
                 data-expense-id="${escapeAttr(expense.id)}">
          <div class="expense-list-item">
            ${escapeHtml(expense.item || "Ohne Bezeichnung")}
          </div>

          <strong class="expense-list-price">
            ${formatMoney(expense.amount)}
          </strong>

          <button class="expense-note-toggle ${hasDetails ? "has-note" : ""}"
                  type="button"
                  aria-label="${escapeAttr(expense.item || "Posten")} bearbeiten"
                  title="Kategorie, Notiz und Posten bearbeiten">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 3h9l4 4v14H6z"/>
              <path d="M15 3v5h5M9 12h7M9 16h7"/>
            </svg>
          </button>

          <button class="delete-expense"
                  type="button"
                  aria-label="${escapeAttr(expense.item || "Posten")} löschen"
                  title="Posten löschen">×</button>
        </article>`;
    }).join("");

    updateShoppingTotals();

    if (typeof renderFinalReport === "function") {
      renderFinalReport();
    }
  }

  function parseExpenseAmount(value) {
    const cleaned = String(value || "")
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");

    if (!cleaned) return NaN;

    const amount = Number(cleaned);
    return Number.isFinite(amount) ? amount : NaN;
  }

  function closeExpenseModal() {
    state.editingExpenseId = "";
    expenseModal.classList.add("hidden");
    expenseModalError.textContent = "";
    expenseForm.reset();
    expenseModalCategory.value = "Essen";
    saveExpenseModal.disabled = false;
  }

  function openExpenseModal(expense = null) {
    state.editingExpenseId = expense?.id || "";

    expenseModalTitle.textContent = expense
      ? "Posten bearbeiten"
      : "Posten hinzufügen";

    saveExpenseModal.textContent = expense
      ? "Speichern"
      : "Hinzufügen";

    expenseModalItem.value = expense?.item || "";
    expenseModalAmount.value = expense
      ? Number(expense.amount || 0).toFixed(2).replace(".", ",")
      : "";
    expenseModalCategory.value = expense?.category || "Essen";
    expenseModalNote.value = expense?.note || "";
    expenseModalError.textContent = "";
    expenseModal.classList.remove("hidden");

    // Fokus erst nach dem Öffnen, ohne Scrollsprung der Seite.
    window.setTimeout(() => {
      expenseModalItem.focus({ preventScroll: true });
    }, 30);
  }

  addExpenseButton.addEventListener("click", () => {
    openExpenseModal();
  });

  cancelExpenseModal.addEventListener("click", closeExpenseModal);

  expenseModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-expense-modal]")) {
      closeExpenseModal();
    }
  });

  expenseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (saveExpenseModal.disabled) return;

    const item = expenseModalItem.value.trim();
    const amount = parseExpenseAmount(expenseModalAmount.value);
    const category = expenseModalCategory.value;
    const note = expenseModalNote.value.trim();

    if (!item) {
      expenseModalError.textContent = "Bitte eintragen, was eingekauft wurde.";
      expenseModalItem.focus({ preventScroll: true });
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      expenseModalError.textContent = "Bitte einen gültigen Preis eintragen.";
      expenseModalAmount.focus({ preventScroll: true });
      return;
    }

    saveExpenseModal.disabled = true;
    expenseModalError.textContent = "";
    setSaveStatus(shoppingSaveStatus, "Speichert …", "saving");

    try {
      const result = await apiRequest("adminSaveExpense", {
        token: state.token,
        expense: {
          id: state.editingExpenseId || "",
          category,
          item,
          amount,
          note
        }
      });

      const index = state.expenses.findIndex(
        (expense) => expense.id === result.expense.id
      );

      if (index >= 0) {
        state.expenses[index] = result.expense;
      } else {
        state.expenses.push(result.expense);
      }

      renderExpenses();
      closeExpenseModal();
      setSaveStatus(shoppingSaveStatus, "Gespeichert");

      window.setTimeout(() => {
        setSaveStatus(shoppingSaveStatus, "Aktuell");
      }, 1100);

    } catch (error) {
      saveExpenseModal.disabled = false;

      if (!handleApiError(error)) {
        expenseModalError.textContent = error.message;
        setSaveStatus(shoppingSaveStatus, "Fehler", "error");
      }
    }
  });

  expenseList.addEventListener("click", async (event) => {
    const noteButton = event.target.closest(".expense-note-toggle");

    if (noteButton) {
      const row = noteButton.closest(".expense-row");
      const expense = state.expenses.find(
        (item) => item.id === row?.dataset.expenseId
      );

      if (expense) openExpenseModal(expense);
      return;
    }

    const deleteButton = event.target.closest(".delete-expense");
    if (!deleteButton) return;

    const row = deleteButton.closest(".expense-row");
    const id = row?.dataset.expenseId;
    if (!id) return;

    const expense = state.expenses.find((item) => item.id === id);
    const label = expense?.item || "diesen Einkaufsposten";

    if (!window.confirm(`${label} wirklich löschen?`)) return;

    setSaveStatus(shoppingSaveStatus, "Löscht …", "saving");
    deleteButton.disabled = true;

    try {
      await apiRequest("adminDeleteExpense", {
        token: state.token,
        expenseId: id
      });

      state.expenses = state.expenses.filter((item) => item.id !== id);
      renderExpenses();
      setSaveStatus(shoppingSaveStatus, "Gespeichert");

      window.setTimeout(() => {
        setSaveStatus(shoppingSaveStatus, "Aktuell");
      }, 1100);

    } catch (error) {
      deleteButton.disabled = false;

      if (!handleApiError(error)) {
        setSaveStatus(shoppingSaveStatus, "Fehler", "error");
        showToast(error.message);
      }
    }
  });

  function updateTicketMetrics() {
    const total = state.tickets.length;
    const open = state.tickets.filter((ticket) => ticket.status === "OPEN").length;

    metricTickets.textContent = String(total);
    metricTicketsOpen.textContent = String(open);
    ticketTabCount.textContent = String(open);
    ticketTabCount.classList.toggle("hidden", open === 0);
  }

  function filteredTickets() {
    const query = normalize(ticketSearch.value);
    const filter = ticketFilter.value;
    const sort = ticketSort.value;

    const result = state.tickets.filter((ticket) => {
      if (filter !== "all" && ticket.status !== filter) return false;

      if (query) {
        const haystack = normalize([
          ticket.name,
          ticket.contactMethod,
          ticket.contactValue,
          ticket.message,
          ticket.id
        ].join(" "));

        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      if (sort === "name") {
        return new Intl.Collator("de", { sensitivity: "base" })
          .compare(a.name || "", b.name || "");
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }

  function ticketContactLabel(method) {
    if (method === "email") return "E-Mail";
    if (method === "telefon") return "Telefon";
    if (method === "whatsapp") return "WhatsApp";
    return "Kontakt";
  }

  function contactHref(ticket) {
    const value = String(ticket.contactValue || "");

    if (ticket.contactMethod === "email") {
      return `mailto:${encodeURIComponent(value)}`;
    }

    if (["telefon", "whatsapp"].includes(ticket.contactMethod)) {
      const normalized = value.replace(/[^0-9+]/g, "");
      return `tel:${normalized}`;
    }

    return "";
  }

  function renderTickets() {
    updateTicketMetrics();
    const tickets = filteredTickets();

    ticketResultCount.textContent =
      `${tickets.length} ${tickets.length === 1 ? "Ticket" : "Tickets"}`;

    if (!tickets.length) {
      ticketList.innerHTML = `
        <div class="empty-state">
          Für die aktuelle Suche bzw. den Filter wurden keine Tickets gefunden.
        </div>`;
      return;
    }

    ticketList.innerHTML = tickets.map((ticket) => {
      const date = ticket.createdAt
        ? new Date(ticket.createdAt).toLocaleString("de-DE")
        : "–";

      const done = ticket.status === "DONE";
      const href = contactHref(ticket);

      return `
        <article class="ticket-card ${done ? "ticket-done" : ""}"
                 data-ticket-id="${escapeAttr(ticket.id)}">
          <div class="ticket-card-head">
            <div>
              <span class="ticket-status ${done ? "done" : "open"}">
                ${done ? "Erledigt" : "Offen"}
              </span>
              <h3>${escapeHtml(ticket.name)}</h3>
              <small>${escapeHtml(date)}</small>
            </div>

            <button type="button"
                    class="ticket-status-button"
                    data-next-status="DONE">
              ${done ? "Ticket löschen" : "Erledigt & löschen"}
            </button>
          </div>

          <div class="ticket-contact">
            <span>${escapeHtml(ticketContactLabel(ticket.contactMethod))}</span>
            ${href
              ? `<a href="${escapeAttr(href)}">${escapeHtml(ticket.contactValue)}</a>`
              : `<strong>${escapeHtml(ticket.contactValue)}</strong>`}
          </div>

          <div class="ticket-message">
            ${escapeHtml(ticket.message).replace(/\n/g, "<br>")}
          </div>

          <div class="ticket-id-line">
            Ticket-ID: ${escapeHtml(ticket.id)}
          </div>
        </article>`;
    }).join("");
  }

  async function setTicketStatus(ticket, nextStatus, button) {
    if (
      !window.confirm(
        ticket.status === "DONE"
          ? "Dieses erledigte Ticket dauerhaft löschen?"
          : "Ticket als erledigt markieren und dauerhaft aus der Ticketliste löschen?"
      )
    ) {
      return;
    }

    button.disabled = true;
    setSaveStatus(ticketSaveStatus, "Löscht …", "saving");

    try {
      await apiRequest("adminDeleteTicket", {
        token: state.token,
        ticketId: ticket.id
      });

      state.tickets = state.tickets.filter((item) => item.id !== ticket.id);
      renderTickets();
      setSaveStatus(ticketSaveStatus, "Gespeichert");
      showToast("Ticket erledigt und gelöscht.");

      window.setTimeout(() => {
        setSaveStatus(ticketSaveStatus, "Aktuell");
      }, 1100);
    } catch (error) {
      if (!handleApiError(error)) {
        setSaveStatus(ticketSaveStatus, "Fehler", "error");
        showToast(error.message);
        renderTickets();
      }
    }
  }

  ticketList.addEventListener("click", (event) => {
    const button = event.target.closest(".ticket-status-button");
    if (!button) return;

    const card = button.closest(".ticket-card");
    const ticket = state.tickets.find(
      (item) => item.id === card?.dataset.ticketId
    );

    if (!ticket) return;

    void setTicketStatus(
      ticket,
      button.dataset.nextStatus,
      button
    );
  });

  [ticketSearch, ticketFilter, ticketSort].forEach((control) => {
    control.addEventListener(
      control.tagName === "INPUT" ? "input" : "change",
      renderTickets
    );
  });

  refreshTickets.addEventListener("click", () => void loadTickets());

  async function loadTickets() {
    setSaveStatus(ticketSaveStatus, "Lädt …", "saving");

    try {
      const result = await apiRequest("adminTickets", { token: state.token });
      state.tickets = Array.isArray(result.tickets) ? result.tickets : [];
      renderTickets();
      setSaveStatus(ticketSaveStatus, "Aktuell");
    } catch (error) {
      if (!handleApiError(error)) {
        setSaveStatus(ticketSaveStatus, "Fehler", "error");
        showToast(error.message);
      }
      throw error;
    }
  }

  function receiptTotal(receipts) {
    return receipts.reduce(
      (sum, receipt) =>
        sum + Math.max(0, Number(receipt.amount || 0)),
      0
    );
  }

  function updateReceiptMetrics() {
    const total = receiptTotal(state.receipts);
    const reimbursed = receiptTotal(
      state.receipts.filter((receipt) => receipt.reimbursed)
    );
    const open = Math.max(0, total - reimbursed);
    const openCount = state.receipts.filter(
      (receipt) => !receipt.reimbursed
    ).length;

    receiptTabCount.textContent = String(openCount);
    metricReceiptsTotal.textContent = formatMoney(total);
    metricReceiptsReimbursed.textContent = formatMoney(reimbursed);
    metricReceiptsOpen.textContent = formatMoney(open);
  }

  function filteredReceipts() {
    const filter = receiptFilter.value;
    const sort = receiptSort.value;

    const rows = state.receipts.filter((receipt) => {
      if (filter === "open") return !receipt.reimbursed;
      if (filter === "reimbursed") return receipt.reimbursed;
      return true;
    });

    rows.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.submittedAt).getTime() -
          new Date(b.submittedAt).getTime();
      }

      if (sort === "amount-desc") {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }

      if (sort === "name") {
        return String(a.primaryName || "").localeCompare(
          String(b.primaryName || ""),
          "de-DE"
        );
      }

      return new Date(b.submittedAt).getTime() -
        new Date(a.submittedAt).getTime();
    });

    return rows;
  }

  function receiptGroupKey(receipt) {
    return (
      receipt.registrationId ||
      receipt.accessCode ||
      receipt.primaryName ||
      receipt.id
    );
  }

  function renderReceipts() {
    updateReceiptMetrics();
    const rows = filteredReceipts();

    receiptResultCount.textContent =
      `${rows.length} ${rows.length === 1 ? "Kassenbon" : "Kassenbons"}`;

    if (!rows.length) {
      receiptList.innerHTML =
        '<div class="empty-state">Keine passenden Kassenbons vorhanden.</div>';
      renderFinalReport();
      return;
    }

    const groups = new Map();

    rows.forEach((receipt) => {
      const key = receiptGroupKey(receipt);

      if (!groups.has(key)) {
        groups.set(key, {
          name: receipt.primaryName || "Ohne Name",
          accessCode: receipt.accessCode || "",
          receipts: []
        });
      }

      groups.get(key).receipts.push(receipt);
    });

    receiptList.innerHTML = [...groups.values()].map((group) => {
      const subtotal = receiptTotal(group.receipts);
      const reimbursedSubtotal = receiptTotal(
        group.receipts.filter((receipt) => receipt.reimbursed)
      );

      const items = group.receipts.map((receipt) => {
        const submitted = receipt.submittedAt
          ? new Date(receipt.submittedAt).toLocaleDateString("de-DE")
          : "–";

        return `
          <article class="receipt-admin-row"
                   data-receipt-id="${escapeAttr(receipt.id)}">
            <div class="receipt-admin-main">
              <strong>${formatMoney(receipt.amount)}</strong>
              <small>
                Eingereicht ${escapeHtml(submitted)}
                · ${receipt.reimbursed ? "erstattet" : "noch offen"}
              </small>
            </div>

            <div class="receipt-admin-side receipt-entry-actions">
              <label class="receipt-inline-check">
                <input class="receipt-reimbursed-toggle"
                       type="checkbox"
                       ${receipt.reimbursed ? "checked" : ""} />
                <span>Erstattet</span>
              </label>

              <button class="receipt-edit-button" type="button">
                Bearbeiten
              </button>

              <button class="receipt-delete-row-button" type="button">
                Löschen
              </button>
            </div>
          </article>`;
      }).join("");

      return `
        <section class="receipt-user-group">
          <div class="receipt-user-group-heading">
            <div>
              <strong>${escapeHtml(group.name)}</strong>
              <small>${escapeHtml(group.accessCode)}</small>
            </div>
            <div class="receipt-user-subtotals">
              <span>Teilsumme ${formatMoney(subtotal)}</span>
              <small>davon erstattet ${formatMoney(reimbursedSubtotal)}</small>
            </div>
          </div>
          <div class="receipt-user-items">
            ${items}
          </div>
        </section>`;
    }).join("");

    renderFinalReport();
  }

  function closeReceiptModal() {
    state.activeReceiptId = "";
    receiptModal.classList.add("hidden");
    receiptModalImage.classList.add("hidden");
    receiptModalImage.removeAttribute("src");
    receiptModalError.textContent = "";
  }

  async function openReceiptModal(receipt) {
    state.activeReceiptId = receipt.id;
    receiptModalTitle.textContent = "Kassenbon bearbeiten";
    receiptModalCode.textContent = receipt.accessCode || "–";
    receiptModalName.textContent = receipt.primaryName || "–";
    receiptModalAmount.value = Number(receipt.amount || 0)
      .toFixed(2)
      .replace(".", ",");
    receiptModalReimbursed.checked = Boolean(receipt.reimbursed);
    receiptModalError.textContent = "";
    receiptImageLoading.classList.remove("hidden");
    receiptModalImage.classList.add("hidden");
    receiptModal.classList.remove("hidden");

    try {
      const result = await apiRequest(
        "adminReceiptImage",
        {
          token: state.token,
          receiptId: receipt.id
        },
        { timeoutMs: 45000 }
      );

      receiptModalImage.src = result.imageDataUrl || "";
      receiptModalImage.classList.remove("hidden");
    } catch (error) {
      if (!handleApiError(error)) {
        receiptModalError.textContent =
          `Bild konnte nicht geladen werden: ${error.message}`;
      }
    } finally {
      receiptImageLoading.classList.add("hidden");
    }
  }

  function parseAdminReceiptAmount(value) {
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

  async function saveReceiptPatch(receipt, patch, { showMessage = false } = {}) {
    const amount = Object.prototype.hasOwnProperty.call(patch, "amount")
      ? patch.amount
      : Number(receipt.amount || 0);

    const reimbursed = Object.prototype.hasOwnProperty.call(patch, "reimbursed")
      ? Boolean(patch.reimbursed)
      : Boolean(receipt.reimbursed);

    const result = await apiRequest("adminUpdateReceipt", {
      token: state.token,
      receipt: {
        id: receipt.id,
        amount,
        reimbursed
      }
    });

    const index = state.receipts.findIndex(
      (item) => item.id === result.receipt.id
    );

    if (index >= 0) {
      state.receipts[index] = {
        ...state.receipts[index],
        ...result.receipt
      };
    }

    renderReceipts();

    if (showMessage) {
      showToast("Kassenbon gespeichert.");
    }

    return result.receipt;
  }

  async function deleteReceipt(receipt) {
    if (!window.confirm(
      `Kassenbon von ${receipt.primaryName || "dieser Anmeldung"} wirklich löschen?`
    )) {
      return false;
    }

    setSaveStatus(receiptSaveStatus, "Löscht …", "saving");

    try {
      await apiRequest("adminDeleteReceipt", {
        token: state.token,
        receiptId: receipt.id
      });

      state.receipts = state.receipts.filter(
        (item) => item.id !== receipt.id
      );

      renderReceipts();
      setSaveStatus(receiptSaveStatus, "Aktuell");
      showToast("Kassenbon gelöscht.");
      return true;
    } catch (error) {
      if (!handleApiError(error)) {
        setSaveStatus(receiptSaveStatus, "Fehler", "error");
        showToast(error.message);
      }
      return false;
    }
  }

  receiptList.addEventListener("click", (event) => {
    const row = event.target.closest(".receipt-admin-row");
    if (!row) return;

    const receipt = state.receipts.find(
      (item) => item.id === row.dataset.receiptId
    );

    if (!receipt) return;

    if (event.target.closest(".receipt-edit-button")) {
      void openReceiptModal(receipt);
      return;
    }

    if (event.target.closest(".receipt-delete-row-button")) {
      void deleteReceipt(receipt);
    }
  });

  receiptList.addEventListener("change", async (event) => {
    const toggle = event.target.closest(".receipt-reimbursed-toggle");
    if (!toggle) return;

    const row = toggle.closest(".receipt-admin-row");
    const receipt = state.receipts.find(
      (item) => item.id === row?.dataset.receiptId
    );

    if (!receipt) return;

    toggle.disabled = true;
    setSaveStatus(receiptSaveStatus, "Speichert …", "saving");

    try {
      await saveReceiptPatch(receipt, {
        reimbursed: toggle.checked
      });
      setSaveStatus(receiptSaveStatus, "Aktuell");
    } catch (error) {
      toggle.checked = Boolean(receipt.reimbursed);

      if (!handleApiError(error)) {
        setSaveStatus(receiptSaveStatus, "Fehler", "error");
        showToast(error.message);
      }
    } finally {
      toggle.disabled = false;
    }
  });

  cancelReceiptModal.addEventListener("click", closeReceiptModal);

  receiptModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-receipt-modal]")) {
      closeReceiptModal();
    }
  });

  saveReceiptButton.addEventListener("click", async () => {
    const receipt = state.receipts.find(
      (item) => item.id === state.activeReceiptId
    );

    if (!receipt) return;

    const amount = parseAdminReceiptAmount(receiptModalAmount.value);

    if (!Number.isFinite(amount) || amount <= 0) {
      receiptModalError.textContent =
        "Bitte einen gültigen Betrag eintragen.";
      return;
    }

    saveReceiptButton.disabled = true;
    receiptModalError.textContent = "";
    setSaveStatus(receiptSaveStatus, "Speichert …", "saving");

    try {
      await saveReceiptPatch(
        receipt,
        {
          amount,
          reimbursed: receiptModalReimbursed.checked
        },
        { showMessage: true }
      );

      closeReceiptModal();
      setSaveStatus(receiptSaveStatus, "Aktuell");
    } catch (error) {
      if (!handleApiError(error)) {
        receiptModalError.textContent = error.message;
        setSaveStatus(receiptSaveStatus, "Fehler", "error");
      }
    } finally {
      saveReceiptButton.disabled = false;
    }
  });

  deleteReceiptButton.addEventListener("click", async () => {
    const receipt = state.receipts.find(
      (item) => item.id === state.activeReceiptId
    );

    if (!receipt) return;

    deleteReceiptButton.disabled = true;

    try {
      const deleted = await deleteReceipt(receipt);
      if (deleted) {
        closeReceiptModal();
      }
    } finally {
      deleteReceiptButton.disabled = false;
    }
  });

  receiptFilter.addEventListener("change", renderReceipts);
  receiptSort.addEventListener("change", renderReceipts);
  refreshReceipts.addEventListener("click", () => void loadReceipts());

  function finalReportData() {
    const registrations = groupRegistrations().map((group) => ({
      accessCode: group.accessCode,
      primaryName:
        `${group.primary?.firstName || ""} ${group.primary?.lastName || ""}`.trim(),
      peopleCount: group.people.length,
      due: group.due,
      paid: group.paidAmount,
      paymentMethod: paymentMethodLabel(group.paymentMethod)
    }));

    const expenseTotal = state.expenses.reduce(
      (sum, expense) => sum + Math.max(0, Number(expense.amount || 0)),
      0
    );

    const receiptTotalValue = receiptTotal(state.receipts);
    const reimbursedReceipts = state.receipts.filter(
      (receipt) => receipt.reimbursed
    );

    const reviewedReceiptTotal = receiptTotalValue;
    const reimbursedTotal = receiptTotal(reimbursedReceipts);
    const reimbursementOpen = Math.max(
      0,
      receiptTotalValue - reimbursedTotal
    );

    return {
      registrationCount: registrations.length,
      peopleCount: state.summary.peopleCount,
      due: state.summary.due,
      paid: state.summary.paid,
      open: state.summary.open,
      expenseTotal,
      receiptTotal: receiptTotalValue,
      reviewedReceiptTotal,
      reimbursedTotal,
      reimbursementOpen,
      finalizedCostTotal: expenseTotal + reviewedReceiptTotal,
      cashBalance: state.summary.paid - expenseTotal - reimbursedTotal,
      registrations,
      expenses: [...state.expenses],
      receipts: [...state.receipts]
    };
  }

  function renderFinalReport() {
    const report = finalReportData();

    reportRegistrations.textContent = String(report.registrationCount);
    reportPeople.textContent = String(report.peopleCount);
    reportPaid.textContent = formatMoney(report.paid);
    reportOpen.textContent = formatMoney(report.open);
    reportExpenses.textContent = formatMoney(report.expenseTotal);
    reportReviewedReceipts.textContent = formatMoney(report.reviewedReceiptTotal);
    reportReimbursementOpen.textContent = formatMoney(report.reimbursementOpen);
    reportFinalCosts.textContent = formatMoney(report.finalizedCostTotal);
    reportCashBalance.textContent = formatMoney(report.cashBalance);

    reportBreakdown.innerHTML = `
      <article class="report-breakdown-card">
        <h3>Einnahmen</h3>
        <p>
          Soll: ${formatMoney(report.due)} · bezahlt: ${formatMoney(report.paid)}
          · offen: ${formatMoney(report.open)}
        </p>
      </article>

      <article class="report-breakdown-card">
        <h3>Kosten</h3>
        <p>
          Einkauf vor Fest: ${formatMoney(report.expenseTotal)} ·
          nachgereichte Kassenbons: ${formatMoney(report.receiptTotal)}
        </p>
      </article>

      <article class="report-breakdown-card">
        <h3>Erstattungen</h3>
        <p>
          Bereits erstattet: ${formatMoney(report.reimbursedTotal)} ·
          noch zu erstatten: ${formatMoney(report.reimbursementOpen)}
        </p>
      </article>`;
  }

  generateReportPdf.addEventListener("click", async () => {
    if (generateReportPdf.disabled) return;

    const report = finalReportData();

    generateReportPdf.disabled = true;
    reportPdfProgress.textContent = "PDF wird vorbereitet …";
    setSaveStatus(reportStatus, "Erstellt PDF …", "saving");

    try {
      await window.AdminFinalReport.generate(
        report,
        async (receiptId) => {
          const result = await apiRequest(
            "adminReceiptImage",
            {
              token: state.token,
              receiptId
            },
            { timeoutMs: 45000 }
          );

          return result.imageDataUrl || "";
        },
        (progress) => {
          reportPdfProgress.textContent = progress.label || "";
        }
      );

      reportPdfProgress.textContent = "PDF wurde erstellt.";
      setSaveStatus(reportStatus, "Aktuell");

    } catch (error) {
      reportPdfProgress.textContent = error.message;
      setSaveStatus(reportStatus, "Fehler", "error");
    } finally {
      generateReportPdf.disabled = false;
    }
  });

  async function loadOverview() {
    setSaveStatus(overviewSaveStatus, "Lädt …", "saving");

    try {
      const result = await apiRequest("adminOverview", { token: state.token });
      state.people = Array.isArray(result.people) ? result.people : [];
      updateSummary();
      renderPeople();
      setSaveStatus(overviewSaveStatus, "Aktuell");
    } catch (error) {
      if (!handleApiError(error)) {
        setSaveStatus(overviewSaveStatus, "Fehler", "error");
        showToast(error.message);
      }
      throw error;
    }
  }

  async function loadExpenses() {
    setSaveStatus(shoppingSaveStatus, "Lädt …", "saving");

    try {
      const result = await apiRequest("adminExpenses", { token: state.token });
      state.expenses = Array.isArray(result.expenses) ? result.expenses : [];
      renderExpenses();
      setSaveStatus(shoppingSaveStatus, "Aktuell");
    } catch (error) {
      if (!handleApiError(error)) {
        setSaveStatus(shoppingSaveStatus, "Fehler", "error");
        showToast(error.message);
      }
      throw error;
    }
  }

  async function loadReceipts() {
    setSaveStatus(receiptSaveStatus, "Lädt …", "saving");

    try {
      const result = await apiRequest("adminReceipts", { token: state.token });
      state.receipts = Array.isArray(result.receipts) ? result.receipts : [];
      renderReceipts();
      setSaveStatus(receiptSaveStatus, "Aktuell");
    } catch (error) {
      if (!handleApiError(error)) {
        setSaveStatus(receiptSaveStatus, "Fehler", "error");
        showToast(error.message);
      }
      throw error;
    }
  }

  async function loadAll() {
    try {
      await Promise.all([
        loadOverview(),
        loadExpenses(),
        loadTickets(),
        loadReceipts()
      ]);
      renderFinalReport();
    } catch {}
  }

  async function restoreSession() {
    if (!state.token) {
      showLogin();
      return;
    }

    loginCard.classList.add("hidden");
    adminApp.classList.add("hidden");

    try {
      await apiRequest("adminSession", { token: state.token });
      showAdmin();
      await loadAll();
    } catch (error) {
      state.token = "";
      sessionStorage.removeItem(SESSION_KEY);
      showLogin("Bitte melde dich an.");
    }
  }

  void restoreSession();
})();
