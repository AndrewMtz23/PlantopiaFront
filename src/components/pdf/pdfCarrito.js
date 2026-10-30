import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import JsBarcode from "jsbarcode";

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts;

const BRAND_GREEN = "#24b36b";
const BRAND_DARK = "#163328";
const INK = "#1f2937";
const MUTED = "#64748b";
const SOFT = "#eef7f1";
const BORDER = "#d9e7dd";

const currency = (value) => `$${Number(value || 0).toFixed(2)}`;

const buildMetaRow = (label, value, bold = false) => ([
  { text: label, color: MUTED, margin: [0, 0, 0, 2] },
  { text: value || "-", bold, color: INK, alignment: "right", margin: [0, 0, 0, 2] },
]);

export const generarFacturaPDF = (carrito, pago, detallesEmpresa) => {
  if (!Array.isArray(carrito) || carrito.length === 0) {
    return;
  }

  const datosUsuario = carrito[0];
  if (!pago?.id) throw new Error('Se requiere un pedido registrado para generar el comprobante.');
  const total = pago.subtotal;
  const montoIVA = pago.iva;
  const totalFinal = pago.total;
  const numeroFactura = `P-${pago.id}`;
  const fechaActual = new Date(pago.fechaRegistro).toLocaleDateString("es-MX");

  const canvas = document.createElement("canvas");
  JsBarcode(canvas, numeroFactura, {
    format: "CODE128",
    width: 1.9,
    height: 42,
    displayValue: false,
    margin: 0,
  });
  const codigoBarras = canvas.toDataURL("image/png");

  const productosBody = [
    [
      { text: "Producto", style: "tableHeader" },
      { text: "Detalles", style: "tableHeader" },
      { text: "Cant.", style: "tableHeaderCenter" },
      { text: "Precio", style: "tableHeaderRight" },
      { text: "Subtotal", style: "tableHeaderRight" },
    ],
    ...carrito.map((item) => [
      { text: item.nombre || "-", style: "tableCellStrong" },
      { text: item.detalles || "-", style: "tableCell" },
      { text: String(item.cantidad || 0), style: "tableCellCenter" },
      { text: currency(item.precioVenta), style: "tableCellRight" },
      { text: currency(item.subtotal), style: "tableCellRightStrong" },
    ]),
  ];

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 42, 40, 40],
    background: [
      {
        canvas: [
          { type: "rect", x: 0, y: 0, w: 595, h: 88, color: "#f7fbf8" },
          { type: "rect", x: 0, y: 770, w: 595, h: 72, color: "#f7fbf8" },
        ],
      },
    ],
    content: [
      {
        columns: [
          {
            width: "*",
            stack: [
              { text: detallesEmpresa.nombre || "Plantopia", style: "brand" },
              { text: "Comprobante de pedido", style: "brandSubline" },
              {
                text: [
                  `${detallesEmpresa.ubicacion || ""}\n`,
                  `${detallesEmpresa.correo || ""}\n`,
                  `${detallesEmpresa.telefono || ""}`,
                ],
                style: "companyMeta",
              },
            ],
          },
          {
            width: 190,
            table: {
              widths: ["*"],
              body: [[
                {
                  stack: [
                    { text: "PEDIDO", style: "invoiceWord" },
                    { text: numeroFactura, style: "invoiceNumber" },
                    { text: `Fecha de emision: ${fechaActual}`, style: "invoiceMeta" },
                  ],
                  fillColor: SOFT,
                  margin: [14, 14, 14, 14],
                  border: [false, false, false, false],
                },
              ]],
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
            },
          },
        ],
      },
      {
        canvas: [
          { type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: BORDER },
        ],
        margin: [0, 18, 0, 18],
      },
      {
        columns: [
          {
            width: "*",
            stack: [
              { text: "Cliente", style: "sectionTitle" },
              {
                table: {
                  widths: ["*"],
                  body: [[
                    {
                      stack: [
                        { text: `${datosUsuario.usuario_nombre || "Cliente Plantopia"}`, style: "clientName" },
                        { text: `Telefono: ${datosUsuario.telefono || "-"}`, style: "clientMeta" },
                        { text: `Correo: ${datosUsuario.correo || "-"}`, style: "clientMeta" },
                        { text: `Domicilio: ${datosUsuario.domicilio || "-"}`, style: "clientMeta" },
                      ],
                      border: [false, false, false, false],
                      margin: [14, 12, 14, 12],
                    },
                  ]],
                },
                layout: {
                  hLineWidth: () => 0,
                  vLineWidth: () => 0,
                },
                margin: [0, 6, 12, 0],
              },
            ],
          },
          {
            width: 180,
            stack: [
              { text: "Resumen rapido", style: "sectionTitle" },
              {
                table: {
                  widths: ["*", "auto"],
                  body: [
                    buildMetaRow("Productos", String(carrito.length)),
                    buildMetaRow("Metodo", pago.metodo),
                    buildMetaRow("Estado de pago", pago.estado, true),
                  ],
                },
                layout: "noBorders",
                margin: [0, 10, 0, 0],
              },
            ],
          },
        ],
      },
      { text: "Detalle de la compra", style: "sectionTitle", margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: [110, "*", 42, 66, 76],
          body: productosBody,
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? SOFT : rowIndex % 2 === 0 ? "#fbfdfb" : "#ffffff"),
          hLineColor: () => BORDER,
          vLineColor: () => BORDER,
          hLineWidth: (i) => (i === 0 ? 0 : 1),
          vLineWidth: () => 0,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: (i) => (i === 0 ? 9 : 8),
          paddingBottom: (i) => (i === 0 ? 9 : 8),
        },
      },
      {
        columns: [
          { width: "*", text: "" },
          {
            width: 190,
            margin: [0, 22, 0, 0],
            table: {
              widths: ["*", "auto"],
              body: [
                buildMetaRow("Subtotal", currency(total)),
                buildMetaRow("IVA (16%)", currency(montoIVA)),
                buildMetaRow("Envio", currency(pago.envio)),
                [
                  { text: "Total", style: "totalLabel" },
                  { text: currency(totalFinal), style: "totalValue", alignment: "right" },
                ],
              ],
            },
            layout: {
              hLineWidth: (i, node) => (i === node.table.body.length - 1 ? 1.2 : 0),
              vLineWidth: () => 0,
              hLineColor: () => BORDER,
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 7,
              paddingBottom: () => 7,
            },
          },
        ],
      },
      {
        margin: [0, 28, 0, 0],
        columns: [
          {
            width: "*",
            stack: [
              { text: "Referencia de compra", style: "microTitle" },
              { image: codigoBarras, width: 132, height: 42, margin: [0, 8, 0, 5] },
              { text: numeroFactura, style: "barcodeCaption" },
            ],
          },
          {
            width: 240,
            stack: [
              { text: "Notas", style: "microTitle" },
              {
                text: pago.estado === 'pendiente' ? 'Pedido pendiente de cobro. Este comprobante no acredita un pago recibido.' : 'Conserva este comprobante de pedido. No es una factura fiscal.',
                style: "note",
                margin: [0, 8, 0, 0],
              },
            ],
          },
        ],
      },
      {
        text: "Gracias por elegir Plantopia",
        style: "thanks",
        margin: [0, 34, 0, 4],
      },
      {
        text: "Curaduria botanica para espacios con vida.",
        style: "thanksSubline",
      },
    ],
    styles: {
      brand: {
        fontSize: 24,
        bold: true,
        color: BRAND_GREEN,
      },
      brandSubline: {
        fontSize: 11,
        color: BRAND_DARK,
        bold: true,
        margin: [0, 2, 0, 8],
      },
      companyMeta: {
        fontSize: 11,
        color: MUTED,
        lineHeight: 1.35,
      },
      invoiceWord: {
        fontSize: 26,
        bold: true,
        color: BRAND_GREEN,
        alignment: "right",
      },
      invoiceNumber: {
        fontSize: 13,
        bold: true,
        color: BRAND_DARK,
        alignment: "right",
        margin: [0, 6, 0, 2],
      },
      invoiceMeta: {
        fontSize: 10.5,
        color: MUTED,
        alignment: "right",
      },
      sectionTitle: {
        fontSize: 16,
        bold: true,
        color: BRAND_DARK,
      },
      clientName: {
        fontSize: 13,
        bold: true,
        color: INK,
        margin: [0, 0, 0, 5],
      },
      clientMeta: {
        fontSize: 11,
        color: MUTED,
        margin: [0, 1, 0, 1],
      },
      tableHeader: {
        fontSize: 10.5,
        bold: true,
        color: BRAND_DARK,
      },
      tableHeaderCenter: {
        fontSize: 10.5,
        bold: true,
        color: BRAND_DARK,
        alignment: "center",
      },
      tableHeaderRight: {
        fontSize: 10.5,
        bold: true,
        color: BRAND_DARK,
        alignment: "right",
      },
      tableCell: {
        fontSize: 10.5,
        color: INK,
      },
      tableCellStrong: {
        fontSize: 10.5,
        bold: true,
        color: INK,
      },
      tableCellCenter: {
        fontSize: 10.5,
        color: INK,
        alignment: "center",
      },
      tableCellRight: {
        fontSize: 10.5,
        color: INK,
        alignment: "right",
      },
      tableCellRightStrong: {
        fontSize: 10.5,
        color: INK,
        bold: true,
        alignment: "right",
      },
      totalLabel: {
        fontSize: 13,
        bold: true,
        color: BRAND_DARK,
        margin: [0, 4, 0, 0],
      },
      totalValue: {
        fontSize: 16,
        bold: true,
        color: BRAND_GREEN,
        margin: [0, 4, 0, 0],
      },
      microTitle: {
        fontSize: 11,
        bold: true,
        color: BRAND_DARK,
      },
      note: {
        fontSize: 10.5,
        color: MUTED,
        lineHeight: 1.4,
      },
      barcodeCaption: {
        fontSize: 10,
        color: MUTED,
      },
      thanks: {
        fontSize: 18,
        bold: true,
        color: BRAND_GREEN,
        alignment: "center",
      },
      thanksSubline: {
        fontSize: 10.5,
        color: MUTED,
        alignment: "center",
      },
    },
    defaultStyle: {
      fontSize: 11,
      color: INK,
    },
  };

  pdfMake.createPdf(docDefinition).open();
};
