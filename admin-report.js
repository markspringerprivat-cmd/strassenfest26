(() => {
  "use strict";

  const JSPDF_CDN =
    "https://unpkg.com/jspdf@4.2.1/dist/jspdf.umd.min.js";

  let loadPromise = null;

  function loadJsPdf() {
    if (window.jspdf?.jsPDF) {
      return Promise.resolve(window.jspdf.jsPDF);
    }

    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = JSPDF_CDN;
      script.async = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        if (window.jspdf?.jsPDF) {
          resolve(window.jspdf.jsPDF);
        } else {
          reject(new Error("Die PDF-Bibliothek konnte nicht geladen werden."));
        }
      };

      script.onerror = () => {
        reject(new Error("Die PDF-Bibliothek konnte nicht geladen werden."));
      };

      document.head.appendChild(script);
    });

    return loadPromise;
  }

  function money(value) {
    return `${Number(value || 0).toFixed(2).replace(".", ",")} EUR`;
  }

  function date(value) {
    if (!value) return "–";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString("de-DE");
  }

  function safeText(value) {
    return String(value ?? "")
      .replace(/[–—]/g, "-")
      .replace(/€/g, "EUR")
      .replace(/[^\x20-\x7EÄÖÜäöüß]/g, " ");
  }

  async function generate(report, getReceiptImage, onProgress = () => {}) {
    const JsPdf = await loadJsPdf();
    const doc = new JsPdf({
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = 18;

    const addPage = () => {
      doc.addPage();
      y = 18;
    };

    const ensure = (height = 12) => {
      if (y + height > pageHeight - 16) addPage();
    };

    const title = (text, size = 15) => {
      ensure(size + 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.text(safeText(text), margin, y);
      y += size * 0.55 + 4;
    };

    const line = (label, value) => {
      ensure(7);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(safeText(label), margin, y);
      doc.setFont("helvetica", "bold");
      const valueText = safeText(value);
      const valueWidth = doc.getTextWidth(valueText);
      doc.text(valueText, pageWidth - margin - valueWidth, y);
      y += 6;
    };

    const paragraph = (text, indent = 0) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const rows = doc.splitTextToSize(
        safeText(text),
        contentWidth - indent
      );

      ensure(rows.length * 4.2 + 3);
      doc.text(rows, margin + indent, y);
      y += rows.length * 4.2 + 2;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Strassenfest in Hilchenbach 2026", margin, y);
    y += 9;

    doc.setFontSize(13);
    doc.text("Abschlussbericht", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(
      `Erstellt am ${new Date().toLocaleString("de-DE")}`,
      margin,
      y
    );
    y += 9;

    title("Uebersicht", 12);
    line("Anmeldungen", report.registrationCount);
    line("Personen", report.peopleCount);
    line("Soll-Einnahmen", money(report.due));
    line("Als bezahlt erfasst", money(report.paid));
    line("Noch offen", money(report.open));
    line("Einkauf vor dem Fest", money(report.expenseTotal));
    line("Kassenbons eingereicht", money(report.receiptTotal));
    line("Davon geprueft", money(report.reviewedReceiptTotal));
    line("Davon erstattet", money(report.reimbursedTotal));
    line("Noch zu erstatten", money(report.reimbursementOpen));
    line("Finalisierte Gesamtkosten", money(report.finalizedCostTotal));
    line("Aktueller Kassenstand", money(report.cashBalance));

    y += 4;
    title("Anmeldungen", 12);

    report.registrations.forEach((registration, index) => {
      ensure(18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(
        `${index + 1}. ${safeText(registration.primaryName)} - ${safeText(registration.accessCode)}`,
        margin,
        y
      );
      y += 5;

      paragraph(
        `${registration.peopleCount} Person(en) | Soll ${money(registration.due)} | ` +
        `bezahlt ${money(registration.paid)} | Zahlungsweg ${registration.paymentMethod}`,
        3
      );
    });

    y += 3;
    title("Einkauf vor dem Fest", 12);

    if (!report.expenses.length) {
      paragraph("Keine Einkaufsposten vorhanden.");
    } else {
      report.expenses.forEach((expense, index) => {
        paragraph(
          `${index + 1}. ${expense.item || "Ohne Bezeichnung"} | ` +
          `${expense.category || "Sonstiges"} | ${money(expense.amount)}` +
          (expense.note ? ` | ${expense.note}` : "")
        );
      });
      line("Summe Einkauf", money(report.expenseTotal));
    }

    y += 3;
    title("Nachgereichte Kassenbons", 12);

    if (!report.receipts.length) {
      paragraph("Keine Kassenbons eingereicht.");
    } else {
      report.receipts.forEach((receipt, index) => {
        paragraph(
          `${index + 1}. ${receipt.primaryName} | ${receipt.merchant || "Geschaeft unbekannt"} | ` +
          `${date(receipt.purchaseDate)} | ${money(receipt.amount)} | ` +
          `${receipt.reviewed ? "geprueft" : "ungeprueft"} | ` +
          `${receipt.reimbursed ? "erstattet" : "nicht erstattet"}`
        );
      });
    }

    // Originalbilder als Anlagen.
    for (let index = 0; index < report.receipts.length; index += 1) {
      const receipt = report.receipts[index];

      onProgress({
        current: index + 1,
        total: report.receipts.length,
        label: `Kassenbon ${index + 1}/${report.receipts.length} wird eingebettet …`
      });

      let imageData = "";

      try {
        imageData = await getReceiptImage(receipt.id);
      } catch {
        imageData = "";
      }

      addPage();
      title(`Anlage Kassenbon ${index + 1}`, 12);

      paragraph(
        `${receipt.primaryName} | ${receipt.accessCode} | ` +
        `${receipt.merchant || "Geschaeft unbekannt"} | ${date(receipt.purchaseDate)} | ` +
        `${money(receipt.amount)} | ${receipt.reviewed ? "geprueft" : "ungeprueft"}`
      );

      if (!imageData) {
        paragraph("Das Kassenbon-Bild konnte fuer diese PDF nicht geladen werden.");
        continue;
      }

      try {
        const properties = doc.getImageProperties(imageData);
        const maxWidth = contentWidth;
        const maxHeight = 225;
        const ratio = Math.min(
          maxWidth / properties.width,
          maxHeight / properties.height
        );

        const width = properties.width * ratio;
        const height = properties.height * ratio;
        const x = margin + (contentWidth - width) / 2;

        doc.addImage(
          imageData,
          "JPEG",
          x,
          y + 2,
          width,
          height,
          undefined,
          "FAST"
        );
      } catch {
        paragraph("Das Kassenbon-Bild konnte nicht in die PDF eingebettet werden.");
      }
    }

    const pageCount = doc.getNumberOfPages();

    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(
        `Seite ${page} von ${pageCount}`,
        pageWidth - margin - 22,
        pageHeight - 8
      );
    }

    doc.save(
      `Strassenfest-Hilchenbach-Abschlussbericht-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  }

  window.AdminFinalReport = Object.freeze({
    generate
  });
})();
