(() => {
  "use strict";

  const API_ENDPOINT = "https://script.google.com/macros/s/AKfycbyR2jC7NmY5h2q__ZLJo-SeuNpGoXoJO-JNyNahOlkVybBKZoRlS1Mb859Gov8Hb3pkEw/exec";

  const form = document.getElementById("contactForm");
  const card = document.getElementById("contactCard");
  const success = document.getElementById("contactSuccess");
  const nameInput = document.getElementById("contactName");
  const methodInput = document.getElementById("contactMethod");
  const valueInput = document.getElementById("contactValue");
  const valueLabel = document.getElementById("contactValueLabel");
  const messageInput = document.getElementById("contactMessage");
  const websiteInput = document.getElementById("contactWebsite");
  const status = document.getElementById("contactStatus");
  const submitButton = document.getElementById("contactSubmit");
  const ticketIdOutput = document.getElementById("contactTicketId");

  let stableTicketId = null;
  let submitting = false;

  function secureId(prefix = "ticket") {
    const bytes = new Uint8Array(18);
    crypto.getRandomValues(bytes);
    const random = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
    return `${prefix}-${Date.now()}-${random}`;
  }

  function updateContactInput() {
    const method = methodInput.value;
    valueInput.value = "";
    valueInput.removeAttribute("inputmode");
    valueInput.removeAttribute("autocomplete");

    if (method === "email") {
      valueLabel.textContent = "E-Mail-Adresse *";
      valueInput.type = "email";
      valueInput.placeholder = "name@beispiel.de";
      valueInput.autocomplete = "email";
      return;
    }

    valueInput.type = "text";

    if (method === "telefon") {
      valueLabel.textContent = "Telefonnummer *";
      valueInput.placeholder = "z. B. 02733 123456";
      valueInput.inputMode = "tel";
      valueInput.autocomplete = "tel";
      return;
    }

    if (method === "whatsapp") {
      valueLabel.textContent = "WhatsApp-Nummer *";
      valueInput.placeholder = "z. B. +49 170 1234567";
      valueInput.inputMode = "tel";
      valueInput.autocomplete = "tel";
      return;
    }

    valueLabel.textContent = "Kontaktmöglichkeit *";
    valueInput.placeholder = "Bitte zuerst Kontaktweg auswählen";
  }

  methodInput.addEventListener("change", updateContactInput);

  function clearInvalid() {
    [nameInput, methodInput, valueInput, messageInput].forEach((element) =>
      element.classList.remove("invalid")
    );
  }

  function fail(message, element) {
    status.textContent = message;
    element?.classList.add("invalid");
    element?.focus();
    return null;
  }

  function validate() {
    clearInvalid();
    status.textContent = "";

    const name = nameInput.value.replace(/\s+/g, " ").trim();
    const contactMethod = methodInput.value;
    const contactValue = valueInput.value.replace(/\s+/g, " ").trim();
    const message = messageInput.value.trim();

    if (name.length < 2) {
      return fail("Bitte deinen Namen eintragen.", nameInput);
    }

    if (!["email", "telefon", "whatsapp"].includes(contactMethod)) {
      return fail("Bitte einen Kontaktweg auswählen.", methodInput);
    }

    if (!contactValue) {
      return fail("Bitte eine Kontaktmöglichkeit eintragen.", valueInput);
    }

    if (contactMethod === "email" && !/^\S+@\S+\.\S+$/.test(contactValue)) {
      return fail("Bitte eine gültige E-Mail-Adresse eintragen.", valueInput);
    }

    if (
      ["telefon", "whatsapp"].includes(contactMethod) &&
      (!/^[0-9+()\/ .-]{5,40}$/.test(contactValue))
    ) {
      return fail("Bitte eine gültige Telefonnummer eintragen.", valueInput);
    }

    if (message.length < 5) {
      return fail("Bitte deine Anfrage etwas genauer beschreiben.", messageInput);
    }

    return {
      ticketId: stableTicketId || (stableTicketId = secureId()),
      name,
      contactMethod,
      contactValue,
      message,
      website: websiteInput.value
    };
  }

  function pollResult(requestId, deadline) {
    return new Promise((resolve, reject) => {
      if (Date.now() >= deadline) {
        reject(new Error(
          "Die Anfrage wurde möglicherweise gespeichert, aber die Bestätigung konnte nicht geladen werden. Bitte nicht mehrfach absenden."
        ));
        return;
      }

      const callbackName =
        `__contact_${requestId.replace(/[^a-z0-9_]/gi, "_")}_${Date.now()}`;
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

      const retry = (delay = 420) => {
        if (settled) return;
        settled = true;
        cleanup();

        if (Date.now() >= deadline) {
          reject(new Error(
            "Die Anfrage wurde möglicherweise gespeichert, aber die Bestätigung konnte nicht geladen werden. Bitte nicht mehrfach absenden."
          ));
          return;
        }

        window.setTimeout(() => {
          pollResult(requestId, deadline).then(resolve, reject);
        }, delay);
      };

      window[callbackName] = (message) => {
        if (settled) return;
        settled = true;
        cleanup();

        if (!message || message.pending) {
          window.setTimeout(() => {
            pollResult(requestId, deadline).then(resolve, reject);
          }, 350);
          return;
        }

        const result = message.result;

        if (result?.ok) {
          resolve(result);
        } else {
          const error = new Error(
            result?.message || "Die Anfrage konnte nicht gespeichert werden."
          );
          error.code = result?.error || "";
          reject(error);
        }
      };

      const url = new URL(API_ENDPOINT);
      url.searchParams.set("action", "poll");
      url.searchParams.set("requestId", requestId);
      url.searchParams.set("prefix", callbackName);
      url.searchParams.set("_", String(Date.now()));

      script.src = url.toString();
      script.async = true;
      script.onerror = () => retry(520);

      script.onload = () => {
        if (!settled) retry(380);
      };

      attemptTimer = window.setTimeout(() => retry(300), 4000);

      document.head.appendChild(script);
    });
  }

  async function apiRequest(action, data) {
    const requestId = secureId("contact-request");
    const deadline = Date.now() + 22000;

    const confirmationPromise = pollResult(requestId, deadline);

    const postFailurePromise = fetch(API_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      credentials: "omit",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body: JSON.stringify({
        requestId,
        action,
        ...data
      })
    }).then(
      () => new Promise(() => {}),
      (error) => {
        console.error("Kontakt-POST fehlgeschlagen:", error);
        throw new Error(
          "Die Datenbank konnte nicht erreicht werden. Bitte prüfe deine Internetverbindung."
        );
      }
    );

    return Promise.race([
      confirmationPromise,
      postFailurePromise
    ]);
  }

  form.addEventListener("input", (event) => {
    event.target.classList.remove("invalid");
    if (status.textContent) status.textContent = "";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;

    const ticket = validate();
    if (!ticket) return;

    submitting = true;
    submitButton.disabled = true;
    submitButton.classList.add("is-processing");
    submitButton.textContent = "Wird gesendet …";
    status.textContent = "Deine Anfrage wird gespeichert …";

    try {
      const result = await apiRequest("createTicket", { ticket });
      const savedTicket = result.ticket;

      ticketIdOutput.textContent = savedTicket?.id || stableTicketId || "gespeichert";
      card.classList.add("hidden");
      success.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      status.textContent = error.message;
      submitting = false;
      submitButton.disabled = false;
      submitButton.classList.remove("is-processing");
      submitButton.textContent = "Anfrage senden";
    }
  });

  updateContactInput();
})();
