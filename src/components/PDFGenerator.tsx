import jsPDF from "jspdf";
import Button from "./buttons/Button";
import { FaShare } from "react-icons/fa6";
import { useState } from "react";
import { FaFileDownload } from "react-icons/fa";
import { toast } from "@/components/toast/toast";

interface PDFGeneratorProps {
  invoiceData: {
    supplier: any;
    customer: any;
    orderDetails: any;
    date: string;
    orderProducts: any[];
    subtotal: number;
  };
  filename: string;
}

export default function PDFGenerator({
  invoiceData,
  filename,
}: PDFGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const loadImageAsDataURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } else {
          reject(new Error("Failed to get canvas context"));
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const generatePDF = async (): Promise<jsPDF | null> => {
    setIsLoading(true);
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let y = margin;

      // Helper functions
      const addLine = (yPos: number, thickness = 0.5) => {
        pdf.setLineWidth(thickness);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
      };

      const checkPageBreak = (requiredSpace: number) => {
        if (y + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // Load logo if exists
      let logoData: string | null = null;
      if (invoiceData.supplier?.logo) {
        try {
          logoData = await loadImageAsDataURL(invoiceData.supplier.logo);
        } catch (err) {
          console.error("Failed to load logo:", err);
        }
      }

      // Header Section
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("Invoice", margin, y);

      // Logo (if available)
      if (logoData) {
        const logoSize = 20;
        pdf.addImage(
          logoData,
          "PNG",
          pageWidth - margin - logoSize,
          y - 5,
          logoSize,
          logoSize
        );
      }

      y += 10;
      addLine(y, 0.5);
      y += 8;

      // Company Info and Invoice Details (Two columns)
      const col1X = margin;
      const col2X = pageWidth / 2 + 10;
      let leftY = y;
      let rightY = y;

      // Left Column - Company Info
      if (invoiceData.supplier) {
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(invoiceData.supplier.companyName || "", col1X, leftY);
        leftY += 5;

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        if (invoiceData.supplier.branchName) {
          pdf.text(invoiceData.supplier.branchName, col1X, leftY);
          leftY += 4;
        }
        if (invoiceData.supplier.address) {
          pdf.text(invoiceData.supplier.address, col1X, leftY);
          leftY += 4;
        }
        if (invoiceData.supplier.city) {
          pdf.text(invoiceData.supplier.city, col1X, leftY);
          leftY += 4;
        }
      }

      // Right Column - Invoice Details (right-aligned)
      const rightEdge = pageWidth - margin;
      pdf.setFontSize(9);

      // Invoice Number
      pdf.setFont("helvetica", "bold");
      pdf.text("Invoice Number:", rightEdge - 2, rightY, { align: "right" });
      rightY += 4;
      pdf.setFont("helvetica", "normal");
      pdf.text(invoiceData.orderDetails?.id || "N/A", rightEdge - 2, rightY, {
        align: "right",
      });
      rightY += 6;

      // Telephone
      pdf.setFont("helvetica", "bold");
      pdf.text("Telephone:", rightEdge - 2, rightY, { align: "right" });
      rightY += 4;
      pdf.setFont("helvetica", "normal");
      pdf.text(invoiceData.supplier?.phone || "N/A", rightEdge - 2, rightY, {
        align: "right",
      });
      rightY += 6;

      // Email
      pdf.setFont("helvetica", "bold");
      pdf.text("Email:", rightEdge - 2, rightY, { align: "right" });
      rightY += 4;
      pdf.setFont("helvetica", "normal");
      pdf.text(invoiceData.supplier?.email || "N/A", rightEdge - 2, rightY, {
        align: "right",
      });
      rightY += 4;

      y = Math.max(leftY, rightY) + 5;

      // Customer Account and Date
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text("Customer Account", margin, y);
      pdf.setTextColor(0);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(invoiceData.customer?.id || "N/A", margin, y + 4);

      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text("Date", margin + 50, y);
      pdf.setTextColor(0);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(invoiceData.date || "", margin + 50, y + 4);

      y += 12;

      // Bill To and Deliver To (Two columns with borders)
      const boxHeight = 20;
      const boxWidth = (contentWidth - 5) / 2;

      // Bill To Box
      pdf.setLineWidth(0.3);
      pdf.rect(margin, y, boxWidth, boxHeight);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Bill To", margin + 2, y + 5);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      let billY = y + 10;
      if (invoiceData.customer?.branchName) {
        pdf.text(invoiceData.customer.branchName, margin + 2, billY);
        billY += 4;
      }
      if (invoiceData.customer?.address) {
        pdf.text(invoiceData.customer.address, margin + 2, billY);
        billY += 4;
      }
      if (invoiceData.customer?.city) {
        pdf.text(invoiceData.customer.city, margin + 2, billY);
      }

      // Deliver To Box
      pdf.rect(margin + boxWidth + 5, y, boxWidth, boxHeight);
      pdf.setFont("helvetica", "bold");
      pdf.text("Deliver To", margin + boxWidth + 7, y + 5);

      pdf.setFont("helvetica", "normal");
      let deliverY = y + 10;
      if (invoiceData.customer?.address) {
        pdf.text(invoiceData.customer.address, margin + boxWidth + 7, deliverY);
        deliverY += 4;
      }
      if (invoiceData.customer?.city) {
        pdf.text(invoiceData.customer.city, margin + boxWidth + 7, deliverY);
      }

      y += boxHeight + 8;

      // Products Table
      checkPageBreak(40);

      // Table Header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, y, contentWidth, 7, "F");

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");

      const colWidths = [18, 35, 10, 22, 20, 18, 13, 12, 20];
      const headers = [
        "Code",
        "Name",
        "Qty",
        "Batch Number",
        "Expiry Date",
        "Price (Inc)",
        "Disc %",
        "Tax",
        "Total (Incl)",
      ];

      let xPos = margin + 1;
      headers.forEach((header, i) => {
        if (i === 2 || i === 3 || i === 4) {
          // Center-aligned headers
          pdf.text(header, xPos + colWidths[i] / 2, y + 5, { align: "center" });
        } else if (i >= 5) {
          // Right-aligned headers
          pdf.text(header, xPos + colWidths[i] - 1, y + 5, { align: "right" });
        } else {
          pdf.text(header, xPos, y + 5);
        }
        xPos += colWidths[i];
      });

      y += 7;
      pdf.setLineWidth(0.5);
      addLine(y);
      y += 2;

      // Table Rows
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(0);

      invoiceData.orderProducts.forEach((product) => {
        checkPageBreak(10);

        const rowY = y + 5;
        xPos = margin + 1;

        // Code
        const code = product.id?.slice(0, 6) || "";
        pdf.text(code + "...", xPos, rowY);
        xPos += colWidths[0];

        // Name - with text wrapping if needed
        const name = product.title || "";
        const maxNameWidth = colWidths[1] - 2;
        if (pdf.getTextWidth(name) > maxNameWidth) {
          const truncated = name.substring(0, 20) + "...";
          pdf.text(truncated, xPos, rowY);
        } else {
          pdf.text(name, xPos, rowY);
        }
        xPos += colWidths[1];

        // Qty - centered
        pdf.text(String(product.quantity || 0), xPos + colWidths[2] / 2, rowY, {
          align: "center",
        });
        xPos += colWidths[2];

        // Batch Number - centered
        pdf.text(product.batchNumber || "N/A", xPos + colWidths[3] / 2, rowY, {
          align: "center",
        });
        xPos += colWidths[3];

        // Expiry Date - centered
        pdf.text(product.expiryDate || "", xPos + colWidths[4] / 2, rowY, {
          align: "center",
        });
        xPos += colWidths[4];

        // Price - right aligned
        pdf.text(
          "$" + product.price.toFixed(2),
          xPos + colWidths[5] - 1,
          rowY,
          {
            align: "right",
          }
        );
        xPos += colWidths[5];

        // Discount - right aligned
        pdf.text("0.0%", xPos + colWidths[6] - 1, rowY, { align: "right" });
        xPos += colWidths[6];

        // Tax - right aligned
        pdf.text("0.00", xPos + colWidths[7] - 1, rowY, { align: "right" });
        xPos += colWidths[7];

        // Total - right aligned
        const total = product.price * (product.quantity || 1);
        pdf.text("$" + total.toFixed(2), xPos + colWidths[8] - 1, rowY, {
          align: "right",
        });

        y += 8;
        pdf.setLineWidth(0.1);
        addLine(y);
        y += 2;
      });

      y += 5;

      // Totals Section
      const totalsX = pageWidth - margin - 60;
      const totalsWidth = 60;

      pdf.setFontSize(9);

      // Total Excl
      pdf.setFont("helvetica", "normal");
      pdf.text("Total Excl", totalsX, y);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        "$" + invoiceData.subtotal.toFixed(2),
        totalsX + totalsWidth - 2,
        y,
        {
          align: "right",
        }
      );
      y += 5;
      pdf.setLineWidth(0.3);
      pdf.line(totalsX, y, totalsX + totalsWidth, y);
      y += 5;

      // Tax Total
      pdf.setFont("helvetica", "normal");
      pdf.text("Tax Total", totalsX, y);
      pdf.setFont("helvetica", "bold");
      pdf.text("0.00", totalsX + totalsWidth - 2, y, { align: "right" });
      y += 5;
      pdf.setLineWidth(0.3);
      pdf.line(totalsX, y, totalsX + totalsWidth, y);
      y += 5;

      // Total Discount
      pdf.setFont("helvetica", "normal");
      pdf.text("Total Discount", totalsX, y);
      pdf.setFont("helvetica", "bold");
      pdf.text("0.00", totalsX + totalsWidth - 2, y, { align: "right" });
      y += 5;
      pdf.setLineWidth(0.5);
      pdf.line(totalsX, y, totalsX + totalsWidth, y);
      y += 6;

      // Invoice Total
      pdf.setFillColor(249, 250, 251);
      pdf.rect(totalsX - 2, y - 5, totalsWidth + 2, 8, "F");
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("INVOICE TOTAL USD", totalsX, y);
      pdf.text(
        "$" + invoiceData.subtotal.toFixed(2),
        totalsX + totalsWidth - 2,
        y,
        {
          align: "right",
        }
      );

      y += 10;

      // Footer - Returns Policy
      checkPageBreak(30);
      pdf.setLineWidth(0.5);
      addLine(y);
      y += 6;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("RETURNS & POLICY", margin, y);
      y += 5;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Returns and exchanges accepted within 30 days of purchase with original receipt.",
        margin,
        y
      );

      y += 15;

      // Signature Lines
      const sigWidth = (contentWidth - 10) / 3;
      const sigY = y;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(60);

      pdf.text("Received By", margin, sigY);
      pdf.text("Signed", margin + sigWidth + 5, sigY);
      pdf.text("Date", margin + 2 * sigWidth + 10, sigY);

      const lineY = sigY + 10;
      pdf.setLineWidth(0.3);
      pdf.line(margin, lineY, margin + sigWidth, lineY);
      pdf.line(margin + sigWidth + 5, lineY, margin + 2 * sigWidth + 5, lineY);
      pdf.line(margin + 2 * sigWidth + 10, lineY, pageWidth - margin, lineY);

      return pdf;
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast({
        title: "Generation Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "error",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const pdf = await generatePDF();
      if (!pdf) return;

      const cleanFilename = filename.endsWith(".pdf")
        ? filename
        : `${filename}.pdf`;
      pdf.save(cleanFilename);

      toast({
        title: "Success!",
        description: "Invoice downloaded successfully",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Download Error",
        description: "Failed to download invoice",
        variant: "error",
      });
    }
  };

  const handleShare = async () => {
    try {
      const pdf = await generatePDF();
      if (!pdf) return;

      const blob = pdf.output("blob") as Blob;
      const cleanFilename = filename.endsWith(".pdf")
        ? filename
        : `${filename}.pdf`;
      const file = new File([blob], cleanFilename, { type: "application/pdf" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Order Invoice",
          text: `Invoice: ${cleanFilename}`,
        });
        toast({
          title: "Success!",
          description: "Invoice shared successfully",
          variant: "success",
        });
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        toast({
          title: "Info",
          description: "Invoice opened in new tab",
          variant: "success",
        });
      }
    } catch (error: any) {
      toast({
        title: "Share Error",
        description: "Failed to share invoice",
        variant: "error",
      });
    }
  };

  return (
    <div className="flex justify-end items-center space-x-4 w-full">
      <Button
        className="flex items-center space-x-2 bg-primary rounded-lg h-10"
        onClick={handleDownload}
        disabled={isLoading}
        isLoading={isLoading}
      >
        <FaFileDownload className="w-4 h-4" />
        <span>Download Invoice</span>
      </Button>
      <Button
        className="flex items-center space-x-2 bg-primary rounded-lg h-10"
        onClick={handleShare}
        disabled={isLoading}
      >
        <FaShare className="w-4 h-4" />
        <span>Share Invoice</span>
      </Button>
    </div>
  );
}
