"use client";
import { useState } from "react";

export default function PDFExport({ reportRef, url, authorityScore }) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const el = reportRef.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#020617",
        logging: false,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;

      // Branded header
      pdf.setFillColor(2, 6, 23);
      pdf.rect(0, 0, pageW, pageH, "F");
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageW, 18, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Authority Audit Engine", 8, 11);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(120, 130, 150);
      pdf.text(
        `${new URL(url).hostname}  •  Authority Score: ${authorityScore}  •  ${new Date().toLocaleDateString()}`,
        8,
        16
      );

      // Page 1 content
      const firstPageH = Math.min(imgH, pageH - 22);
      pdf.addImage(imgData, "PNG", 0, 20, pageW, imgH);

      // Additional pages if content overflows
      if (imgH > firstPageH) {
        let yOffset = firstPageH;
        while (yOffset < imgH) {
          pdf.addPage();
          pdf.setFillColor(2, 6, 23);
          pdf.rect(0, 0, pageW, pageH, "F");
          pdf.addImage(imgData, "PNG", 0, -yOffset + 20, pageW, imgH);
          yOffset += pageH;
        }
      }

      pdf.save(`authority-audit-${new URL(url).hostname}-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generate}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 bg-white/8 hover:bg-white/15 border border-white/15 rounded-xl font-medium text-sm text-white/80 transition-all disabled:opacity-40"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </>
      )}
    </button>
  );
}
