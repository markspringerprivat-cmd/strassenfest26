(() => {
  "use strict";

  const TESSERACT_CDN =
    "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

  let libraryPromise = null;

  function loadScriptOnce(url, globalName) {
    if (window[globalName]) return Promise.resolve(window[globalName]);

    if (libraryPromise) return libraryPromise;

    libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        if (window[globalName]) {
          resolve(window[globalName]);
        } else {
          reject(new Error("Die OCR-Bibliothek konnte nicht geladen werden."));
        }
      };

      script.onerror = () => {
        reject(new Error(
          "Die automatische Texterkennung konnte nicht geladen werden. " +
          "Du kannst die Bon-Daten trotzdem manuell eintragen."
        ));
      };

      document.head.appendChild(script);
    });

    return libraryPromise;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Das Foto konnte nicht gelesen werden."));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Das Foto konnte nicht verarbeitet werden."));
      image.src = dataUrl;
    });
  }

  function estimatedDataUrlBytes(dataUrl) {
    const comma = dataUrl.indexOf(",");
    const payload = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    return Math.ceil(payload.length * 0.75);
  }

  async function prepareImage(file, onProgress = () => {}) {
    if (!file || !String(file.type || "").startsWith("image/")) {
      throw new Error("Bitte ein Foto oder eine Bilddatei auswählen.");
    }

    onProgress({ stage: "prepare", progress: 0.08, label: "Foto wird vorbereitet …" });

    const originalUrl = await readFileAsDataUrl(file);
    const image = await loadImage(originalUrl);

    const maxSide = 2400;
    const minScale = Math.min(
      1,
      maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height)
    );

    let width = Math.max(1, Math.round((image.naturalWidth || image.width) * minScale));
    let height = Math.max(1, Math.round((image.naturalHeight || image.height) * minScale));
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

      if (estimatedDataUrlBytes(dataUrl) <= 900_000) {
        break;
      }

      quality = Math.max(0.58, quality - 0.07);

      if (attempt >= 2) {
        width = Math.max(900, Math.round(width * 0.86));
        height = Math.max(900, Math.round(height * 0.86));
      }
    }

    if (estimatedDataUrlBytes(dataUrl) > 1_300_000) {
      throw new Error(
        "Das Foto ist trotz Komprimierung noch zu groß. " +
        "Bitte fotografiere den Kassenbon etwas näher oder wähle ein kleineres Bild."
      );
    }

    onProgress({ stage: "prepare", progress: 1, label: "Foto vorbereitet" });

    return {
      dataUrl,
      width,
      height,
      sizeBytes: estimatedDataUrlBytes(dataUrl),
      originalName: String(file.name || "kassenbon.jpg").slice(0, 120)
    };
  }

  function normalizeLine(line) {
    return String(line || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseGermanMoney(value) {
    let text = String(value || "")
      .replace(/[^\d.,-]/g, "")
      .trim();

    if (!text) return null;

    const lastComma = text.lastIndexOf(",");
    const lastDot = text.lastIndexOf(".");

    if (lastComma > lastDot) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else if (lastDot > lastComma && /\.\d{2}$/.test(text)) {
      text = text.replace(/,/g, "");
    } else {
      text = text.replace(/[.,]/g, "");
    }

    const number = Number(text);
    return Number.isFinite(number) ? Math.abs(number) : null;
  }

  function extractMoneyTokens(line) {
    const matches = String(line || "").match(
      /(?:\d{1,3}(?:[.\s]\d{3})*|\d+)[,.]\d{2}/g
    ) || [];

    return matches
      .map(parseGermanMoney)
      .filter((value) => Number.isFinite(value));
  }

  function isoDateFromMatch(day, month, year) {
    let numericYear = Number(year);

    if (String(year).length === 2) {
      numericYear += numericYear >= 70 ? 1900 : 2000;
    }

    const d = Number(day);
    const m = Number(month);

    if (
      !Number.isInteger(d) ||
      !Number.isInteger(m) ||
      d < 1 || d > 31 ||
      m < 1 || m > 12 ||
      numericYear < 2000 || numericYear > 2100
    ) {
      return "";
    }

    return [
      String(numericYear).padStart(4, "0"),
      String(m).padStart(2, "0"),
      String(d).padStart(2, "0")
    ].join("-");
  }

  function extractReceiptFields(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map(normalizeLine)
      .filter(Boolean);

    const merchantBlacklist =
      /^(kassenbon|bon|beleg|rechnung|quittung|steuer|ust|mwst|datum|kasse|filiale|tel\.?|www\.?|eur|euro)$/i;

    let merchant = "";

    for (const line of lines.slice(0, 12)) {
      const letters = (line.match(/[A-Za-zÄÖÜäöüß]/g) || []).length;

      if (
        letters >= 3 &&
        line.length <= 80 &&
        !merchantBlacklist.test(line) &&
        !/^\d[\d\s./:-]+$/.test(line)
      ) {
        merchant = line;
        break;
      }
    }

    let purchaseDate = "";
    const datePatterns = [
      /(?:^|\D)(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})(?:\D|$)/,
      /(?:^|\D)(\d{1,2})\s+(\d{1,2})\s+(\d{2,4})(?:\D|$)/
    ];

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);

        if (match) {
          purchaseDate = isoDateFromMatch(match[1], match[2], match[3]);
          if (purchaseDate) break;
        }
      }

      if (purchaseDate) break;
    }

    const totalWords =
      /(gesamt|gesamtsumme|summe|endsumme|endbetrag|zu\s*zahlen|zahlbetrag|total|betrag)\b/i;

    let amount = null;

    for (const line of lines) {
      if (!totalWords.test(line)) continue;
      const amounts = extractMoneyTokens(line);

      if (amounts.length) {
        amount = amounts[amounts.length - 1];
      }
    }

    if (!Number.isFinite(amount)) {
      for (const line of lines.slice(Math.floor(lines.length * 0.55))) {
        const amounts = extractMoneyTokens(line);
        if (amounts.length) {
          amount = amounts[amounts.length - 1];
        }
      }
    }

    return {
      merchant,
      purchaseDate,
      amount: Number.isFinite(amount) ? amount : null
    };
  }

  async function recognize(dataUrl, onProgress = () => {}) {
    const Tesseract = await loadScriptOnce(TESSERACT_CDN, "Tesseract");

    let worker = null;

    try {
      worker = await Tesseract.createWorker("deu", 1, {
        logger(message) {
          const rawProgress = Number(message?.progress || 0);
          const status = String(message?.status || "");

          let label = "Kassenbon wird gelesen …";

          if (/loading language/i.test(status)) {
            label = "Deutsche Texterkennung wird geladen …";
          } else if (/initializing/i.test(status)) {
            label = "Texterkennung wird vorbereitet …";
          } else if (/recognizing text/i.test(status)) {
            label = "Text auf dem Kassenbon wird erkannt …";
          }

          onProgress({
            stage: "ocr",
            progress: Math.max(0, Math.min(1, rawProgress)),
            label
          });
        }
      });

      const result = await worker.recognize(dataUrl);
      const text = String(result?.data?.text || "");

      return {
        text,
        fields: extractReceiptFields(text)
      };
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch {}
      }
    }
  }

  window.ReceiptOcr = Object.freeze({
    prepareImage,
    recognize,
    extractReceiptFields
  });
})();
