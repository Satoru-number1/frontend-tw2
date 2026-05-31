import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

const STORE_NAME = 'Mini Market El Ahorro';
const CURRENCY = 'BOB';

function addHeader(doc: jsPDF, title: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Store name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(STORE_NAME, pageWidth / 2, 22, { align: 'center' });

  // Line
  doc.setDrawColor(180);
  doc.setLineWidth(0.5);
  doc.line(14, 28, pageWidth - 14, 28);

  // Title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 37, { align: 'center' });

  // Date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleString()}`, pageWidth - 14, 45, { align: 'right' });
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `${STORE_NAME} - Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  doc.setTextColor(0);
}

// ─── COMPROBANTE DE VENTA ─────────────────────────────────────
export function generarComprobantePdf(saleData: {
  ventaId: number;
  total: number;
  fechaCompra: string;
  metodoPago: string;
  vuelto: number;
  detalle: Array<{ nombreProducto: string; precio: number; cantidad: number }>;
}) {
  const doc = new jsPDF({ unit: 'mm', format: [80, 200] }); // receipt format
  const w = doc.internal.pageSize.getWidth();

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(STORE_NAME, w / 2, 10, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('--- COMPROBANTE DE VENTA ---', w / 2, 16, { align: 'center' });

  doc.setFontSize(8);
  let y = 23;
  doc.text(`Venta #: ${saleData.ventaId}`, 4, y); y += 5;
  doc.text(`Fecha: ${new Date(saleData.fechaCompra).toLocaleString()}`, 4, y); y += 5;
  doc.text(`Método: ${saleData.metodoPago}`, 4, y); y += 5;

  doc.setDrawColor(180);
  doc.line(4, y, w - 4, y); y += 4;

  doc.setFont('helvetica', 'bold');
  doc.text('Producto', 4, y);
  doc.text('Cant.', 44, y);
  doc.text('Subt.', w - 4, y, { align: 'right' });
  y += 4;
  doc.setFont('helvetica', 'normal');

  for (const item of saleData.detalle) {
    const subtotal = item.precio * item.cantidad;
    doc.text(item.nombreProducto.substring(0, 20), 4, y);
    doc.text(String(item.cantidad), 46, y);
    doc.text(`${subtotal.toFixed(2)}`, w - 4, y, { align: 'right' });
    y += 4;
  }

  doc.line(4, y, w - 4, y); y += 5;

  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: ${saleData.total.toFixed(2)} ${CURRENCY}`, 4, y); y += 5;

  if (saleData.vuelto > 0) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Vuelto: ${saleData.vuelto.toFixed(2)} ${CURRENCY}`, 4, y); y += 5;
  }

  y += 3;
  doc.setFontSize(7);
  doc.text('¡Gracias por su compra!', w / 2, y, { align: 'center' });

  doc.save(`comprobante_venta_${saleData.ventaId}.pdf`);
}

// ─── REPORTE DE INVENTARIO ────────────────────────────────────
export function generarInventarioPdf(products: Array<{
  codigoBarras: string;
  nombre: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
  disponibilidad: string;
  fechaVencimiento: string;
}>) {
  const doc = new jsPDF();
  addHeader(doc, 'REPORTE DE INVENTARIO');

  doc.autoTable({
    startY: 50,
    head: [['Código', 'Producto', 'Categoría', 'Stock', 'Mín.', 'Estado', 'Vencimiento']],
    body: products.map(p => [
      p.codigoBarras || 'S/C',
      p.nombre,
      p.categoria,
      p.stock,
      p.stockMinimo,
      p.stock <= 0 ? 'Agotado' : p.stock <= p.stockMinimo ? 'Stock Bajo' : (p.disponibilidad || 'Disponible'),
      new Date(p.fechaVencimiento).toLocaleDateString()
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    theme: 'grid'
  });

  const finalY = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(9);
  doc.text(`Total de productos: ${products.length}`, 14, finalY);
  doc.text(`Productos con stock bajo: ${products.filter(p => p.stock > 0 && p.stock <= p.stockMinimo).length}`, 14, finalY + 5);
  doc.text(`Productos agotados: ${products.filter(p => p.stock <= 0).length}`, 14, finalY + 10);

  addFooter(doc);
  doc.save('reporte_inventario.pdf');
}

// ─── REPORTE DE VENTAS ────────────────────────────────────────
export function generarReporteVentasPdf(reportData: {
  periodo: string;
  totalTransacciones: number;
  totalRecaudado: number;
  masVendidos: Array<{ nombre: string; cantidadVendida: number; totalRecaudado: number }>;
}, period: string) {
  const doc = new jsPDF();
  addHeader(doc, `REPORTE DE VENTAS — ${period.toUpperCase()}`);

  let y = 52;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${reportData.periodo}`, 14, y); y += 6;
  doc.text(`Total de transacciones: ${reportData.totalTransacciones}`, 14, y); y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total recaudado: ${reportData.totalRecaudado.toFixed(2)} ${CURRENCY}`, 14, y); y += 10;

  doc.setFont('helvetica', 'normal');

  if (reportData.masVendidos && reportData.masVendidos.length > 0) {
    doc.autoTable({
      startY: y,
      head: [['Producto', 'Cantidad Vendida', `Total Recaudado (${CURRENCY})`]],
      body: reportData.masVendidos.map(item => [
        item.nombre,
        item.cantidadVendida,
        item.totalRecaudado.toFixed(2)
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      theme: 'grid'
    });
  } else {
    doc.text('No hay productos vendidos en este período.', 14, y);
  }

  addFooter(doc);
  doc.save(`reporte_ventas_${period}.pdf`);
}
