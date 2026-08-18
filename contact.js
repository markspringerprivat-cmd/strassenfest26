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

  function apiRequest(action, data) {
    return window.StrassenfestApi.request(
      API_ENDPOINT,
      action,
      data,
      {
        prefix: "contact",
        timeoutMs: 30000
      }
    );
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
