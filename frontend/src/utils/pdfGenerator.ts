import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const loadAndDrawImage = (doc: any, url: string, x: number, y: number, w: number, h: number): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL("image/png");
          doc.addImage(base64, "PNG", x, y, w, h);
        }
      } catch (err) {
        console.error("Error drawing QR to canvas:", err);
      }
      resolve();
    };
    img.onerror = (err) => {
      console.error("Error loading QR image:", err);
      resolve(); // resolve anyway to avoid blocking the PDF download
    };
    img.src = url;
  });
};

export const generarFacturaPDF = async (pedido: any) => {
  if (!pedido) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Colores corporativos (Estilo El Taller de los Detalles)
  const PRIMARY_COLOR: [number, number, number] = [30, 58, 138]; // Azul oscuro (#1e3a8a)
  const TEXT_DARK: [number, number, number] = [17, 24, 39]; // Gris muy oscuro (#111827)
  const TEXT_MUTED: [number, number, number] = [107, 114, 128]; // Gris medio (#6b7280)

  // Cabecera del Documento
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text("EL TALLER DE LOS DETALLES", 13, 20);

  // Información Comercial del Negocio
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text("NIT: 123456789-010 (Factura Simplificada)", 14, 25);
  doc.text("Av. Las Américas Nro 456, Santa Cruz, Bolivia", 14, 29);
  doc.text("Teléfono / WhatsApp: +591 70043210", 14, 33);

  // Cuadro de Número de Factura / Detalle del Pedido (Derecha)
  doc.setFillColor(243, 244, 246); // Gris claro
  doc.rect(130, 12, 66, 23, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(`COMPROBANTE DE VENTA`, 134, 18);
  doc.setFontSize(12);
  doc.text(`Nº PEDIDO: #${pedido.id}`, 134, 24);

  const fechaObj = pedido.fecha ? new Date(pedido.fecha) : new Date();
  const fechaStr = fechaObj.toLocaleDateString() + " " + fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(`Fecha: ${fechaStr}`, 134, 30);

  // Línea divisoria decorativa
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(14, 39, 196, 39);

  // Sección de Datos de Facturación / Cliente
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text("CLIENTE ", 14, 46);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(`Nombre:  ${pedido.nombreCompleto || "Consumidor Final"}`, 14, 52);
  doc.text(`Celular: ${pedido.telefono || "N/A"}`, 14, 57);
  doc.text(`Correo: ${pedido.correo || "N/A"}`, 14, 62);

  // Tabla de Productos / Detalles
  const tableHeaders = [["Producto / Artículo", "Cantidad", "Precio Unitario", "Subtotal"]];
  const tableRows = (pedido.detalles || []).map((det: any) => [
    det.producto?.nombre || "Artículo de Tienda",
    det.cantidad,
    `Bs ${Number(det.precioUnitario).toFixed(2)}`,
    `Bs ${Number(det.subtotal || det.precioUnitario * det.cantidad).toFixed(2)}`,
  ]);

  // Invocar jspdf-autotable de manera compatible con TypeScript
  autoTable(doc, {
    startY: 68,
    head: tableHeaders,
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
  });

  // Obtener la posición vertical al finalizar la tabla para dibujar el totalizador
  const finalY = (doc as any).lastAutoTable?.finalY || 100;

  // Cuadro de Resumen y Monto Total
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(`MONTO TOTAL NETO:`, 110, finalY + 12);
  doc.setFontSize(14);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(`Bs ${Number(pedido.total).toFixed(2)}`, 160, finalY + 12);

  let currentY = finalY;

  if (pedido.metodoPago === "QR") {
    // Escaner de QR
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text("ESCANEE PARA PAGAR (QR)", 14, finalY + 12);

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagoElTallerDeLosDetalles_Pedido_${pedido.id}_Total_${pedido.total}`;
    await loadAndDrawImage(doc, qrUrl, 14, finalY + 16, 32, 32);
    currentY = finalY + 32;
  }

  // Pie de Página / Mensaje de Agradecimiento
  doc.setDrawColor(229, 231, 235);
  doc.line(14, currentY + 22, 196, currentY + 22);

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text("¡Muchas gracias por confiar en El Taller de los Detalles!", 14, currentY + 29);
  doc.text("Este documento sirve como comprobante simple y constancia de transacción en nuestro sistema.", 14, currentY + 34);

  // Guardar/Descargar el PDF en el navegador
  doc.save(`factura_pedido_#${pedido.id}.pdf`);
};
