(() => {
  "use strict";

  const MESSAGE_TYPE = "strassenfest-api-response-v1";
  const DEFAULT_TIMEOUT_MS = 30000;

  function createRequestId(prefix = "sf") {
    const bytes = new Uint8Array(18);
    crypto.getRandomValues(bytes);

    const random = Array.from(
      bytes,
      (byte) => byte.toString(16).padStart(2, "0")
    ).join("");

    return `${prefix}-${Date.now()}-${random}`;
  }

  function errorFromResult(result) {
    const error = new Error(
      result?.message ||
      "Die Anfrage an die Datenbank ist fehlgeschlagen."
    );

    error.code = result?.error || "";
    return error;
  }

  function request(endpoint, action, data = {}, options = {}) {
    if (!endpoint) {
      return Promise.reject(
        new Error("Die Datenbank ist noch nicht verbunden.")
      );
    }

    const timeoutMs = Math.max(
      5000,
      Number(options.timeoutMs || DEFAULT_TIMEOUT_MS)
    );

    const requestId =
      options.requestId ||
      createRequestId(options.prefix || "sf");

    const payload = {
      requestId,
      action,
      ...data
    };

    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      const form = document.createElement("form");

      const frameName =
        `sf_api_frame_${requestId.replace(/[^a-z0-9_]/gi, "_")}`;

      let settled = false;
      let timer = null;

      iframe.name = frameName;
      iframe.setAttribute("aria-hidden", "true");
      iframe.tabIndex = -1;

      Object.assign(iframe.style, {
        position: "fixed",
        width: "1px",
        height: "1px",
        opacity: "0",
        pointerEvents: "none",
        border: "0",
        left: "-10000px",
        top: "-10000px"
      });

      form.method = "POST";
      form.action = endpoint;
      form.target = frameName;
      form.acceptCharset = "UTF-8";

      function addField(name, value) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }

      addField("transport", "iframe");
      addField("requestId", requestId);
      addField(
        "replyOrigin",
        window.location.origin && window.location.origin !== "null"
          ? window.location.origin
          : "*"
      );
      addField("payload", JSON.stringify(payload));

      const cleanup = () => {
        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }

        window.removeEventListener("message", onMessage);
        form.remove();
        iframe.remove();
      };

      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        callback(value);
      };

      const onMessage = (event) => {
        const message = event.data;

        if (
          !message ||
          message.type !== MESSAGE_TYPE ||
          message.requestId !== requestId
        ) {
          return;
        }

        const trustedGoogleOrigin =
          event.origin === "https://script.google.com" ||
          /^https:\/\/[A-Za-z0-9.-]+\.googleusercontent\.com$/.test(
            event.origin
          );

        if (!trustedGoogleOrigin) return;

        const result = message.result;

        if (result?.ok) {
          finish(resolve, result);
          return;
        }

        finish(reject, errorFromResult(result));
      };

      window.addEventListener("message", onMessage);

      timer = window.setTimeout(() => {
        finish(
          reject,
          new Error(
            "Die Datenbank hat innerhalb des Zeitlimits nicht geantwortet. Bitte versuche es erneut."
          )
        );
      }, timeoutMs);

      document.body.appendChild(iframe);
      document.body.appendChild(form);

      try {
        form.submit();
      } catch (error) {
        finish(
          reject,
          new Error(
            "Die Verbindung zur Datenbank konnte nicht gestartet werden."
          )
        );
      }
    });
  }

  window.StrassenfestApi = Object.freeze({
    request,
    createRequestId
  });
})();
