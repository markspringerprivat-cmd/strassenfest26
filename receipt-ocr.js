(() => {
  "use strict";

  const TESSERACT_CDN =
    "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

  let libraryPromise = null;

  const KNOWN_MERCHANTS = [
    ["REWE", /\brewe\b/i],
    ["EDEKA", /\bedeka\b/i],
    ["ALDI", /\baldi\b/i],
    ["Lidl", /\blidl\b/i],
    ["PENNY", /\bpenny\b/i],
    ["Netto", /\bnetto(?:\s+marken[- ]discount)?\b/i],
    ["Kaufland", /\bkaufland\b/i],
    ["dm", /\bdm(?:\s+drogerie)?\b/i],
    ["ROSSMANN", /\brossmann\b/i],
    ["Müller", /\bm[üu]ller\b/i],
    ["METRO", /\bmetro\b/i],
    ["Globus", /\bglobus\b/i],
    ["HIT", /\bhit(?:\s+markt)?\b/i],
    ["NORMA", /\bnorma\b/i],
    ["Action", /\baction\b/i],
    ["TEDi", /\btedi\b/i],
    ["Getränke Hoffmann", /\bgetr[aä]nke\s+hoffmann\b/i],
    ["trinkgut", /\btrinkgut\b/i]
  ];

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

  function makeOcrImage(image) {
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const targetLongSide = Math.min(
      3000,
      Math.max(1800, Math.max(sourceWidth, sourceHeight))
    );
    const scale = Math.min(
      2,
      targetLongSide / Math.max(sourceWidth, sourceHeight)
    );

    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: true
    });

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // Graustufen + moderater Kontrast. Das verbessert Thermopapier,
    // ohne dünne Zeichen durch eine harte Schwarz-Weiß-Schwelle zu verlieren.
    const contrast = 1.48;
    const brightness = 10;

    for (let i = 0; i < pixels.length; i += 4) {
      const gray =
        pixels[i] * 0.299 +
        pixels[i + 1] * 0.587 +
        pixels[i + 2] * 0.114;

      const adjusted = Math.max(
        0,
        Math.min(
          255,
          (gray - 128) * contrast + 128 + brightness
        )
      );

      pixels[i] = adjusted;
      pixels[i + 1] = adjusted;
      pixels[i + 2] = adjusted;
      pixels[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.92);
  }

  async function prepareImage(file, onProgress = () => {}) {
    if (!file || !String(file.type || "").startsWith("image/")) {
      throw new Error("Bitte ein Foto oder eine Bilddatei auswählen.");
    }

    onProgress({
      stage: "prepare",
      progress: 0.08,
      label: "Foto wird vorbereitet …"
    });

    const originalUrl = await readFileAsDataUrl(file);
    const image = await loadImage(originalUrl);

    const maxSide = 2400;
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const minScale = Math.min(
      1,
      maxSide / Math.max(sourceWidth, sourceHeight)
    );

    let width = Math.max(1, Math.round(sourceWidth * minScale));
    let height = Math.max(1, Math.round(sourceHeight * minScale));
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

    onProgress({
      stage: "prepare",
      progress: 0.7,
      label: "Bild wird für die Texterkennung optimiert …"
    });

    const ocrDataUrl = makeOcrImage(image);

    onProgress({
      stage: "prepare",
      progress: 1,
      label: "Foto vorbereitet"
    });

    return {
      dataUrl,
      ocrDataUrl,
      width,
      height,
      sizeBytes: estimatedDataUrlBytes(dataUrl),
      originalName: String(file.name || "kassenbon.jpg").slice(0, 120)
    };
  }

  function normalizeLine(line) {
    return String(line || "")
      .replace(/[|¦]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeForMatching(value) {
    return String(value || "")
      .toLocaleLowerCase("de-DE")
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss");
  }

  function parseGermanMoney(value) {
    let text = String(value || "")
      .replace(/[^\d.,-]/g, "")
      .trim();

    if (!text) return null;

    const negative =
      /^-/.test(text) ||
      /-$/.test(text);

    text = text.replace(/-/g, "");

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

    if (!Number.isFinite(number)) return null;
    return negative ? -number : number;
  }

  function extractMoneyTokens(line) {
    const matches = String(line || "").match(
      /-?(?:\d{1,3}(?:[.\s]\d{3})*|\d+)[,.]\d{2}-?/g
    ) || [];

    return matches
      .map(parseGermanMoney)
      .filter((value) => Number.isFinite(value));
  }

  function centsKey(value) {
    return String(Math.round(Number(value) * 100));
  }

  function almostEqual(a, b, tolerance = 0.03) {
    return (
      Number.isFinite(a) &&
      Number.isFinite(b) &&
      Math.abs(a - b) <= tolerance
    );
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

    const date = new Date(
      numericYear,
      m - 1,
      d,
      12,
      0,
      0
    );

    // Verhindert z. B. den 31.02.
    if (
      date.getFullYear() !== numericYear ||
      date.getMonth() !== m - 1 ||
      date.getDate() !== d
    ) {
      return "";
    }

    return [
      String(numericYear).padStart(4, "0"),
      String(m).padStart(2, "0"),
      String(d).padStart(2, "0")
    ].join("-");
  }

  function confidenceLabel(score, thresholds = {}) {
    const high = thresholds.high ?? 100;
    const medium = thresholds.medium ?? 60;

    if (score >= high) return "high";
    if (score >= medium) return "medium";
    return "low";
  }

  function analyzeMerchant(lines) {
    for (const [name, pattern] of KNOWN_MERCHANTS) {
      const matchingLine = lines.find((line) => pattern.test(line));

      if (matchingLine) {
        return {
          value: name,
          confidence: "high",
          score: 130,
          reason: `Bekannte Händlerbezeichnung „${name}“ erkannt.`
        };
      }
    }

    const candidates = [];

    lines.slice(0, 16).forEach((line, index) => {
      const normalized = normalizeForMatching(line);
      const letters = (line.match(/[A-Za-zÄÖÜäöüß]/g) || []).length;
      const digits = (line.match(/\d/g) || []).length;
      const money = extractMoneyTokens(line);

      if (letters < 3 || line.length > 70) return;

      // Häufige OCR-Falschpositive und typische Nicht-Händler-Zeilen.
      if (
        /[©®]/.test(line) ||
        /https?:|www\.|@/.test(normalized) ||
        /\b(uid|ust|mwst|steuer|iban|bic|kasse|bon|beleg|rechnung|quittung|datum|uhrzeit|center|filiale|tel|telefon|fax|eur|euro)\b/.test(normalized) ||
        /\b(strasse|straße|str\.|weg|platz|allee|gasse)\b/.test(normalized) ||
        /\b\d{5}\b/.test(line) ||
        money.length ||
        /^\W+/.test(line) ||
        /stk|stueck|stuck|kg|g\b|liter|l\b|x\s*\d+[,.]\d{2}/i.test(normalized)
      ) {
        return;
      }

      let score = 35;
      score += Math.max(0, 22 - index * 2);

      if (digits === 0) score += 8;
      if (/^[A-ZÄÖÜ][A-Za-zÄÖÜäöüß& .'-]{2,}$/.test(line)) score += 8;
      if (/\b(gmbh|kg|ohg|ag|markt|supermarkt|drogerie|baeckerei|bäckerei)\b/i.test(line)) {
        score += 16;
      }

      candidates.push({
        value: line,
        score
      });
    });

    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];

    if (!best || best.score < 58) {
      return {
        value: "",
        confidence: "low",
        score: best?.score || 0,
        reason:
          "Das Geschäft konnte nicht zuverlässig erkannt werden. Bitte manuell eintragen."
      };
    }

    return {
      value: best.value,
      confidence: confidenceLabel(
        best.score,
        { high: 82, medium: 58 }
      ),
      score: best.score,
      reason:
        best.score >= 82
          ? "Geschäftsname im Kopfbereich des Bons plausibel erkannt."
          : "Geschäftsname vermutlich erkannt – bitte besonders prüfen."
    };
  }

  function analyzeDate(lines) {
    const datePatterns = [
      /(?:^|\D)(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})(?:\D|$)/,
      /(?:^|\D)(\d{1,2})\s+(\d{1,2})\s+(\d{2,4})(?:\D|$)/
    ];

    const nowYear = new Date().getFullYear();
    const candidates = [];

    lines.forEach((line, index) => {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);

        if (!match) continue;

        const value = isoDateFromMatch(
          match[1],
          match[2],
          match[3]
        );

        if (!value) continue;

        let score = 45;
        const normalized = normalizeForMatching(line);
        const year = Number(value.slice(0, 4));

        if (/\b(datum|date|belegdatum|kaufdatum)\b/.test(normalized)) {
          score += 50;
        }

        if (Math.abs(year - nowYear) <= 1) {
          score += 20;
        } else if (Math.abs(year - nowYear) <= 3) {
          score += 8;
        } else {
          score -= 12;
        }

        if (index >= Math.floor(lines.length * 0.45)) {
          score += 6;
        }

        candidates.push({
          value,
          score,
          line
        });

        break;
      }
    });

    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];

    if (!best) {
      return {
        value: "",
        confidence: "low",
        score: 0,
        reason:
          "Kein eindeutiges Kaufdatum erkannt. Das Feld kann manuell ergänzt werden."
      };
    }

    return {
      value: best.value,
      confidence: confidenceLabel(
        best.score,
        { high: 95, medium: 58 }
      ),
      score: best.score,
      reason:
        best.score >= 95
          ? "Kaufdatum mit eindeutiger Datumskennzeichnung erkannt."
          : "Ein plausibles Datum wurde erkannt – bitte prüfen."
    };
  }

  function parsePaymentEvidence(lines) {
    const paidWords =
      /\b(gegeben|geg\.?|bar|cash|bezahlt|zahlung|kartenzahlung|ec|visa|mastercard)\b/i;
    const changeWords =
      /\b(r[üu]ckgeld|wechselgeld|change|zur[üu]ck)\b/i;

    const paid = [];
    const change = [];

    lines.forEach((line) => {
      const amounts = extractMoneyTokens(line)
        .filter((value) => value >= 0);

      if (!amounts.length) return;

      if (changeWords.test(line)) {
        change.push({
          amount: amounts[amounts.length - 1],
          line
        });
        return;
      }

      if (paidWords.test(line)) {
        paid.push({
          amount: amounts[amounts.length - 1],
          line
        });
      }
    });

    const arithmetic = [];

    paid.forEach((payment) => {
      change.forEach((refund) => {
        const value = payment.amount - refund.amount;

        if (value > 0 && value < 100000) {
          arithmetic.push({
            value: Math.round(value * 100) / 100,
            payment: payment.amount,
            change: refund.amount
          });
        }
      });
    });

    return {
      paid,
      change,
      arithmetic
    };
  }

  function parseItemEvidence(lines) {
    const ignored =
      /\b(summe|gesamt|total|zu\s*zahlen|zahlbetrag|bar|cash|gegeben|geg\.?|r[üu]ckgeld|wechselgeld|mwst|ust|steuer|netto|brutto|visa|mastercard|ec|karte)\b/i;

    const lineValues = [];

    lines.forEach((line) => {
      if (ignored.test(line)) return;

      const normalized = normalizeForMatching(line);

      // z.B. "3 Stk x 0,49"
      const multiplication = line.match(
        /(\d{1,3})\s*(?:stk\.?|st[üu]ck|x)?\s*[xX×]\s*(\d+[,.]\d{2})/i
      );

      if (multiplication) {
        const quantity = Number(multiplication[1]);
        const unitPrice = parseGermanMoney(multiplication[2]);

        if (
          Number.isFinite(quantity) &&
          quantity > 0 &&
          quantity <= 100 &&
          Number.isFinite(unitPrice) &&
          unitPrice >= 0
        ) {
          lineValues.push({
            value:
              Math.round(quantity * unitPrice * 100) / 100,
            line,
            kind: "multiplication"
          });
          return;
        }
      }

      const amounts = extractMoneyTokens(line);

      if (!amounts.length) return;

      const letters =
        (line.match(/[A-Za-zÄÖÜäöüß]/g) || []).length;

      // Nur Zeilen mit erkennbarem Artikeltext als Positionswert verwenden.
      if (
        letters >= 3 &&
        !/\b(uid|str\.|straße|strasse|tel|datum)\b/i.test(normalized)
      ) {
        const value = amounts[amounts.length - 1];

        if (value >= 0 && value < 10000) {
          lineValues.push({
            value,
            line,
            kind: "line"
          });
        }
      }
    });

    const sum =
      lineValues.length >= 2
        ? Math.round(
            lineValues.reduce(
              (total, item) => total + item.value,
              0
            ) * 100
          ) / 100
        : null;

    return {
      items: lineValues,
      sum
    };
  }

  function analyzeAmount(lines) {
    const candidates = new Map();

    const totalWords =
      /\b(gesamtsumme|gesamtbetrag|endsumme|endbetrag|zahlbetrag|zu\s*zahlen|summe|total)\b/i;
    const subtotalWords =
      /\b(zwischensumme|subtotal)\b/i;
    const changeWords =
      /\b(r[üu]ckgeld|wechselgeld|change|zur[üu]ck)\b/i;
    const paymentWords =
      /\b(gegeben|geg\.?|bar|cash|bezahlt|zahlung|kartenzahlung|ec|visa|mastercard)\b/i;
    const taxWords =
      /\b(mwst|ust|steuer|netto|steuerbetrag)\b/i;

    function addCandidate(value, score, evidence, source = "ocr") {
      if (!Number.isFinite(value) || value <= 0 || value > 100000) return;

      const rounded = Math.round(value * 100) / 100;
      const key = centsKey(rounded);

      if (!candidates.has(key)) {
        candidates.set(key, {
          value: rounded,
          score: 0,
          evidence: [],
          sources: new Set()
        });
      }

      const candidate = candidates.get(key);
      candidate.score += score;
      candidate.sources.add(source);

      if (
        evidence &&
        !candidate.evidence.includes(evidence)
      ) {
        candidate.evidence.push(evidence);
      }
    }

    lines.forEach((line, index) => {
      const amounts = extractMoneyTokens(line);
      if (!amounts.length) return;

      const nearBottom =
        index >= Math.floor(lines.length * 0.45);

      amounts.forEach((amount) => {
        let score = nearBottom ? 8 : 0;
        let evidence = "";

        if (totalWords.test(line)) {
          score += 115;
          evidence = "Eine eindeutige Summen-/Zahlbetrag-Zeile wurde erkannt.";
        }

        if (subtotalWords.test(line)) {
          score -= 25;
        }

        if (changeWords.test(line)) {
          score -= 150;
        } else if (
          paymentWords.test(line) &&
          !/\b(zahlbetrag|zu\s*zahlen)\b/i.test(line)
        ) {
          score -= 85;
        }

        if (taxWords.test(line)) {
          score -= 80;
        }

        // Häufig vorkommende identische Beträge sind ein kleines Zusatzsignal.
        addCandidate(
          Math.abs(amount),
          score,
          evidence,
          "ocr"
        );
      });
    });

    const payment = parsePaymentEvidence(lines);

    payment.arithmetic.forEach((item) => {
      addCandidate(
        item.value,
        88,
        `Barzahlung minus Rückgeld ergibt ebenfalls ${item.value
          .toFixed(2)
          .replace(".", ",")} €.`,
        "payment-arithmetic"
      );
    });

    const itemEvidence = parseItemEvidence(lines);

    if (Number.isFinite(itemEvidence.sum)) {
      addCandidate(
        itemEvidence.sum,
        58,
        `Die erkannten Artikel-/Mengenwerte ergeben zusammen ${itemEvidence.sum
          .toFixed(2)
          .replace(".", ",")} €.`,
        "item-sum"
      );
    }

    // Gleiche OCR-Werte an mehreren Stellen stärken.
    const occurrenceCounts = new Map();

    lines.forEach((line) => {
      extractMoneyTokens(line).forEach((amount) => {
        const key = centsKey(Math.abs(amount));
        occurrenceCounts.set(
          key,
          (occurrenceCounts.get(key) || 0) + 1
        );
      });
    });

    candidates.forEach((candidate, key) => {
      const count = occurrenceCounts.get(key) || 0;

      if (count >= 2) {
        candidate.score += Math.min(18, (count - 1) * 6);
        candidate.evidence.push(
          `Der Betrag erscheint ${count}-mal im erkannten Bontext.`
        );
      }

      // Wenn Summenzeile UND unabhängige Rechnung denselben Wert ergeben,
      // ist das besonders stark.
      if (
        candidate.sources.has("payment-arithmetic") &&
        candidate.score >= 150
      ) {
        candidate.score += 28;
      }

      if (
        candidate.sources.has("item-sum") &&
        candidate.score >= 120
      ) {
        candidate.score += 22;
      }
    });

    const ranked = [...candidates.values()]
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];

    if (!best) {
      return {
        value: null,
        confidence: "low",
        score: 0,
        reason:
          "Kein verlässlicher Gesamtbetrag erkannt. Bitte manuell eintragen.",
        alternatives: []
      };
    }

    const confidence = confidenceLabel(
      best.score,
      { high: 145, medium: 72 }
    );

    const evidence = [...new Set(best.evidence)]
      .filter(Boolean);

    let reason;

    if (confidence === "high") {
      reason =
        evidence.length
          ? evidence.slice(0, 2).join(" ")
          : "Der Gesamtbetrag wurde mit hoher Plausibilität erkannt.";
    } else if (confidence === "medium") {
      reason =
        evidence.length
          ? `${evidence[0]} Bitte den Betrag trotzdem prüfen.`
          : "Der Gesamtbetrag ist plausibel, sollte aber geprüft werden.";
    } else {
      reason =
        "Der Gesamtbetrag ist unsicher. Bitte besonders sorgfältig mit dem Bon vergleichen.";
    }

    return {
      value: best.value,
      confidence,
      score: best.score,
      reason,
      alternatives: ranked.slice(1, 4).map((candidate) => ({
        value: candidate.value,
        score: candidate.score
      }))
    };
  }

  function extractReceiptFields(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map(normalizeLine)
      .filter(Boolean);

    const merchant = analyzeMerchant(lines);
    const purchaseDate = analyzeDate(lines);
    const amount = analyzeAmount(lines);

    return {
      merchant: merchant.value,
      purchaseDate: purchaseDate.value,
      amount: Number.isFinite(amount.value)
        ? amount.value
        : null,
      confidence: {
        merchant: merchant.confidence,
        purchaseDate: purchaseDate.confidence,
        amount: amount.confidence
      },
      insights: {
        merchant: merchant.reason,
        purchaseDate: purchaseDate.reason,
        amount: amount.reason
      },
      diagnostics: {
        amountScore: amount.score,
        amountAlternatives: amount.alternatives
      }
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
            progress: Math.max(
              0,
              Math.min(1, rawProgress)
            ),
            label
          });
        }
      });

      try {
        await worker.setParameters({
          preserve_interword_spaces: "1"
        });
      } catch {
        // Ältere/abweichende Worker-Versionen dürfen daran nicht scheitern.
      }

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
