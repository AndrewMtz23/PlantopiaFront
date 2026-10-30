import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts;

export const generarPDF = (productos) => {
  const productosPDF = productos.map((producto) => [
    { text: producto.id.toString(), alignment: "center" },
    { text: producto.estatus === 1 ? "Activo" : "Inactivo", alignment: "center" },
    producto.nombre,
    producto.detalles,
    producto.categoria,
    { text: `$${producto.precioCompra}`, alignment: "right" },
    { text: `$${producto.precioVenta}`, alignment: "right" },
    { text: producto.imagen || producto.imagenUrl ? "Disponible" : "No disponible", alignment: "center" },
  ]);

  const docDefinition = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [40, 60, 40, 60],
    header: {
      text: "Informe de Productos",
      alignment: "center",
      margin: [0, 20, 0, 0],
      fontSize: 22,
      bold: true,
      color: "#3366cc",
    },
    footer(currentPage, pageCount) {
      return {
        text: `Pagina ${currentPage} de ${pageCount}`,
        alignment: "center",
      };
    },
    content: [
      {
        text: `Fecha de generacion: ${new Date().toLocaleString()}`,
        alignment: "right",
        margin: [0, 0, 0, 20],
        fontSize: 10,
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "*", "*", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "#", style: "tableHeader" },
              { text: "Estatus", style: "tableHeader" },
              { text: "Nombre", style: "tableHeader" },
              { text: "Detalles", style: "tableHeader" },
              { text: "Categoria", style: "tableHeader" },
              { text: "Precio de compra", style: "tableHeader" },
              { text: "Precio de venta", style: "tableHeader" },
              { text: "Imagen", style: "tableHeader" },
            ],
            ...productosPDF,
          ],
        },
        layout: {
          hLineWidth(i, node) {
            return i === 0 || i === node.table.body.length ? 2 : 1;
          },
          vLineWidth(i, node) {
            return i === 0 || i === node.table.widths.length ? 2 : 1;
          },
          hLineColor(i, node) {
            return i === 0 || i === node.table.body.length ? "black" : "gray";
          },
          vLineColor(i, node) {
            return i === 0 || i === node.table.widths.length ? "black" : "gray";
          },
        },
      },
      {
        text: "\nNota: Los productos pueden usar imagen local del sistema o una URL externa de respaldo.",
        margin: [0, 20, 0, 0],
        fontSize: 10,
        italics: true,
      },
    ],
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: "white",
        fillColor: "#3366cc",
        alignment: "center",
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
  };

  pdfMake.createPdf(docDefinition).open();
};
