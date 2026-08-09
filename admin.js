(() => {
  "use strict";

  const API_ENDPOINT = "https://script.google.com/macros/s/AKfycbyR2jC7NmY5h2q__ZLJo-SeuNpGoXoJO-JNyNahOlkVybBKZoRlS1Mb859Gov8Hb3pkEw/exec";
  const SESSION_KEY = "strassenfest-admin-session";

  const state = {
    token: sessionStorage.getItem(SESSION_KEY) || "",
    people: [],
    expenses: [],
    summary: {
      peopleCount: 0,
      due: 0,
      paid: 0,
      open: 0
    },
    expenseTimers: new Map()
  };

  const loginCard = document.getElementById("loginCard");
  const loginForm = document.getElementById("loginForm");
  const adminPassword = document.getElementById("adminPassword");
  const loginButton = document.getElementById("loginButton");
  const loginError = document.getElementById("loginError");
  const adminApp = document.getElementById("adminApp");
  const logoutButton = document.getElementById("logoutButton");
  const apiTransportHost = document.getElementById("apiTransportHost");
  const adminToast = document.getElementById("adminToast");

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
      let callbackCalled = false;

      const cleanup = () => {
        script.remove();
        try {
          delete window[callbackName];
        } catch {
          window[callbackName] = undefined;
        }
      };

      window[callbackName] = (message) => {
        callbackCalled = true;
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

      const url = new URL(API_ENDPOINT);
      url.searchParams.set("action", "poll");
      url.searchParams.set("requestId", requestId);
      url.searchParams.set("prefix", callbackName);
      url.searchParams.set("_", String(Date.now()));

      script.src = url.toString();
      script.async = true;

      script.onerror = () => {
        cleanup();

        if (Date.now() >= deadline) {
          reject(new Error(
            "Die Datenbank konnte nicht erreicht werden. Bitte versuche es erneut."
          ));
          return;
        }

        window.setTimeout(() => {
          pollApiResult(requestId, deadline).then(resolve, reject);
        }, 500);
      };

      script.onload = () => {
        if (callbackCalled) return;

        cleanup();

        if (Date.now() >= deadline) {
          reject(new Error(
            "Die Datenbank hat keine verwertbare Antwort geliefert."
          ));
          return;
        }

        window.setTimeout(() => {
          pollApiResult(requestId, deadline).then(resolve, reject);
        }, 350);
      };

      document.head.appendChild(script);
    });
  }

  async function apiRequest(action, data = {}) {
    if (!API_ENDPOINT) {
      throw new Error("Die Datenbank ist noch nicht verbunden.");
    }

    const requestId = secureRequestId("admin");
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
      await fetch(API_ENDPOINT, {
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

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.panel === button.dataset.tab);
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

  function filteredPeople() {
    const query = normalize(peopleSearch.value);
    const payment = paymentFilter.value;
    const category = categoryFilter.value;
    const sort = peopleSort.value;

    const rows = state.people.filter((person) => {
      if (query) {
        const haystack = normalize([
          person.firstName,
          person.lastName,
          person.accessCode,
          person.contribution?.category,
          person.contribution?.subtype,
          person.contribution?.note
        ].filter(Boolean).join(" "));

        if (!haystack.includes(query)) return false;
      }

      if (payment === "open" && (person.price <= 0 || person.paid)) return false;
      if (payment === "paid" && (person.price <= 0 || !person.paid)) return false;
      if (payment === "free" && person.price > 0) return false;

      const personCategory = person.contribution?.category || "none";
      if (category !== "all" && personCategory !== category) return false;

      return true;
    });

    const collator = new Intl.Collator("de", { sensitivity: "base" });

    rows.sort((a, b) => {
      if (sort === "lastName-asc") {
        return collator.compare(a.lastName, b.lastName) ||
          collator.compare(a.firstName, b.firstName);
      }
      if (sort === "lastName-desc") {
        return collator.compare(b.lastName, a.lastName) ||
          collator.compare(b.firstName, a.firstName);
      }
      if (sort === "firstName-asc") {
        return collator.compare(a.firstName, b.firstName) ||
          collator.compare(a.lastName, b.lastName);
      }
      if (sort === "age-asc") return a.age - b.age;
      if (sort === "age-desc") return b.age - a.age;
      if (sort === "paid-open") {
        const aOpen = a.price > 0 && !a.paid ? 0 : 1;
        const bOpen = b.price > 0 && !b.paid ? 0 : 1;
        return aOpen - bOpen || collator.compare(a.lastName, b.lastName);
      }
      if (sort === "created-desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return rows;
  }

  function contributionHtml(person) {
    if (!person.contribution) {
      return `
        <div class="person-contribution">
          <strong>Kein Mitbringsel</strong>
          <small>–</small>
        </div>`;
    }

    const type = person.contribution.subtype
      ? `${person.contribution.category} · ${person.contribution.subtype}`
      : person.contribution.category;

    return `
      <div class="person-contribution">
        <strong>${escapeHtml(type)}</strong>
        <small>${escapeHtml(person.contribution.note || "–")}</small>
      </div>`;
  }

  function renderPeople() {
    const rows = filteredPeople();
    peopleResultCount.textContent = `${rows.length} ${rows.length === 1 ? "Person" : "Personen"}`;

    if (!rows.length) {
      adminPeopleList.innerHTML = `
        <div class="empty-state">Für die aktuelle Suche bzw. den Filter wurden keine Personen gefunden.</div>`;
      return;
    }

    adminPeopleList.innerHTML = rows.map((person) => {
      const free = Number(person.price || 0) <= 0;
      const paidLabel = free ? "kostenlos" : (person.paid ? "bezahlt" : "offen");
      const date = person.createdAt
        ? new Date(person.createdAt).toLocaleDateString("de-DE")
        : "–";

      return `
        <article class="person-row-admin" data-person-key="${escapeAttr(person.key)}">
          <div class="person-main">
            <strong>${escapeHtml(person.firstName)} ${escapeHtml(person.lastName)}</strong>
            <small>${escapeHtml(paymentMethodLabel(person.paymentMethod))}</small>
          </div>

          <div class="person-meta-mobile">
            <span class="person-age">${person.age} J.</span>
            <span class="person-price">${formatMoney(person.price)}</span>
          </div>

          ${contributionHtml(person)}

          <div class="person-registration">
            <code>${escapeHtml(person.accessCode || "")}</code>
            <small>Anmeldung ${escapeHtml(date)}</small>
          </div>

          <label class="payment-toggle" title="${free ? "Keine Zahlung erforderlich" : "Bezahlstatus ändern"}">
            <input type="checkbox"
                   class="paid-checkbox"
                   ${person.paid ? "checked" : ""}
                   ${free ? "disabled" : ""}
                   aria-label="Bezahlstatus für ${escapeAttr(person.firstName + " " + person.lastName)}">
            <span>${paidLabel}</span>
          </label>
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
      window.setTimeout(() => setSaveStatus(overviewSaveStatus, "Aktuell"), 1100);
    } catch (error) {
      person.paid = !paid;
      if (!handleApiError(error)) {
        setSaveStatus(overviewSaveStatus, "Fehler", "error");
        showToast(error.message);
        renderPeople();
      }
    } finally {
      checkbox.disabled = false;
    }
  }

  adminPeopleList.addEventListener("change", (event) => {
    const checkbox = event.target.closest(".paid-checkbox");
    if (!checkbox) return;

    const row = checkbox.closest(".person-row-admin");
    const person = state.people.find((item) => item.key === row?.dataset.personKey);
    if (!person) return;

    void setPaid(person, checkbox.checked, checkbox);
  });

  [peopleSearch, paymentFilter, categoryFilter, peopleSort].forEach((control) => {
    control.addEventListener(control === peopleSearch ? "input" : "change", renderPeople);
  });

  refreshOverview.addEventListener("click", () => void loadOverview());

  function renderExpenses() {
    if (!state.expenses.length) {
      expenseList.innerHTML = `
        <div class="empty-state">Noch keine Einkaufsposten vorhanden.</div>`;
      updateShoppingTotals();
      return;
    }

    expenseList.innerHTML = state.expenses.map((expense) => `
      <article class="expense-row" data-expense-id="${escapeAttr(expense.id)}">
        <select class="expense-category" aria-label="Kategorie">
          ${["Essen", "Getränke", "Spielzeug", "Sonstiges"].map((category) => `
            <option value="${escapeAttr(category)}" ${expense.category === category ? "selected" : ""}>
              ${escapeHtml(category)}
            </option>`).join("")}
        </select>

        <input class="expense-item" type="text" maxlength="100"
               value="${escapeAttr(expense.item || "")}"
               placeholder="Posten, z. B. Pappteller" aria-label="Posten">

        <input class="expense-amount" type="number" inputmode="decimal"
               min="0" step="0.01"
               value="${Number(expense.amount || 0).toFixed(2)}"
               aria-label="Betrag in Euro">

        <input class="expense-note" type="text" maxlength="220"
               value="${escapeAttr(expense.note || "")}"
               placeholder="Notiz (optional)" aria-label="Notiz">

        <button class="delete-expense" type="button" aria-label="Posten löschen">×</button>
      </article>`).join("");

    updateShoppingTotals();
  }

  function readExpenseRow(row) {
    return {
      id: row.dataset.expenseId,
      category: row.querySelector(".expense-category").value,
      item: row.querySelector(".expense-item").value.trim(),
      amount: Number(row.querySelector(".expense-amount").value || 0),
      note: row.querySelector(".expense-note").value.trim()
    };
  }

  function syncExpenseLocal(expense) {
    const index = state.expenses.findIndex((item) => item.id === expense.id);
    if (index >= 0) state.expenses[index] = { ...state.expenses[index], ...expense };
    updateShoppingTotals();
  }

  function scheduleExpenseSave(row) {
    const id = row.dataset.expenseId;
    window.clearTimeout(state.expenseTimers.get(id));

    const draft = readExpenseRow(row);
    syncExpenseLocal(draft);

    if (!draft.item) {
      setSaveStatus(shoppingSaveStatus, "Bezeichnung fehlt", "error");
      return;
    }

    setSaveStatus(shoppingSaveStatus, "Speichert …", "saving");

    const timer = window.setTimeout(() => {
      void saveExpenseRow(row);
    }, 650);

    state.expenseTimers.set(id, timer);
  }

  async function saveExpenseRow(row) {
    const expense = readExpenseRow(row);
    if (!expense.item) return;

    window.clearTimeout(state.expenseTimers.get(expense.id));
    setSaveStatus(shoppingSaveStatus, "Speichert …", "saving");

    try {
      const result = await apiRequest("adminSaveExpense", {
        token: state.token,
        expense
      });

      const index = state.expenses.findIndex((item) => item.id === expense.id);
      if (index >= 0) state.expenses[index] = result.expense;

      row.dataset.expenseId = result.expense.id;
      setSaveStatus(shoppingSaveStatus, "Gespeichert");
      updateShoppingTotals();
      window.setTimeout(() => setSaveStatus(shoppingSaveStatus, "Aktuell"), 1100);
    } catch (error) {
      if (!handleApiError(error)) {
        setSaveStatus(shoppingSaveStatus, "Fehler", "error");
        showToast(error.message);
      }
    }
  }

  expenseList.addEventListener("input", (event) => {
    const row = event.target.closest(".expense-row");
    if (!row) return;
    scheduleExpenseSave(row);
  });

  expenseList.addEventListener("change", (event) => {
    const row = event.target.closest(".expense-row");
    if (!row) return;
    scheduleExpenseSave(row);
  });

  expenseList.addEventListener("focusout", (event) => {
    const row = event.target.closest(".expense-row");
    if (!row) return;

    window.setTimeout(() => {
      if (!row.contains(document.activeElement)) {
        void saveExpenseRow(row);
      }
    }, 0);
  });

  expenseList.addEventListener("click", async (event) => {
    const button = event.target.closest(".delete-expense");
    if (!button) return;

    const row = button.closest(".expense-row");
    const id = row?.dataset.expenseId;
    if (!id) return;

    if (!window.confirm("Diesen Einkaufsposten wirklich löschen?")) return;

    setSaveStatus(shoppingSaveStatus, "Speichert …", "saving");
    button.disabled = true;

    try {
      await apiRequest("adminDeleteExpense", {
        token: state.token,
        expenseId: id
      });

      state.expenses = state.expenses.filter((item) => item.id !== id);
      renderExpenses();
      setSaveStatus(shoppingSaveStatus, "Gespeichert");
      window.setTimeout(() => setSaveStatus(shoppingSaveStatus, "Aktuell"), 1100);
    } catch (error) {
      button.disabled = false;
      if (!handleApiError(error)) {
        setSaveStatus(shoppingSaveStatus, "Fehler", "error");
        showToast(error.message);
      }
    }
  });

  addExpenseButton.addEventListener("click", async () => {
    setSaveStatus(shoppingSaveStatus, "Speichert …", "saving");
    addExpenseButton.disabled = true;

    try {
      const result = await apiRequest("adminSaveExpense", {
        token: state.token,
        expense: {
          category: "Sonstiges",
          item: "Neuer Posten",
          amount: 0,
          note: ""
        }
      });

      state.expenses.push(result.expense);
      renderExpenses();

      const row = expenseList.querySelector(`[data-expense-id="${CSS.escape(result.expense.id)}"]`);
      const itemInput = row?.querySelector(".expense-item");

      if (itemInput) {
        itemInput.focus();
        itemInput.select();
      }

      setSaveStatus(shoppingSaveStatus, "Gespeichert");
      window.setTimeout(() => setSaveStatus(shoppingSaveStatus, "Aktuell"), 1100);
    } catch (error) {
      if (!handleApiError(error)) {
        setSaveStatus(shoppingSaveStatus, "Fehler", "error");
        showToast(error.message);
      }
    } finally {
      addExpenseButton.disabled = false;
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

  async function loadAll() {
    try {
      await Promise.all([loadOverview(), loadExpenses()]);
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
