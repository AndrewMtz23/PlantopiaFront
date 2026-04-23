import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const generarPDF = (usuarios) => {
  const usuariosPDF = usuarios.map(usuario => [
    usuario.id,
    usuario.estatus,
    usuario.tipo,
    usuario.clave,
    usuario.nombre,
    usuario.fechaNacimiento,
    usuario.genero,
    usuario.telefono,
    usuario.correo,
    usuario.domicilio,
  ]);

  const docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [40, 60, 40, 60],
    header: {
      text: 'Sistema de Gestión de Usuarios',
      alignment: 'center',
      margin: [0, 20, 0, 0],
      fontSize: 16,
      bold: true,
      color: '#1B4F72'
    },
    footer: function(currentPage, pageCount) {
      return {
        text: 'Página ' + currentPage.toString() + ' de ' + pageCount,
        alignment: 'center',
        margin: [0, 10, 0, 0]
      };
    },
    content: [
      { text: "Informe de Usuarios", style: "header" },
      {
        text: `Generado el: ${new Date().toLocaleString()}`,
        alignment: 'right',
        margin: [0, 0, 0, 20],
        fontSize: 10,
        italics: true
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: '#', style: 'tableHeader' },
              { text: 'Estatus', style: 'tableHeader' },
              { text: 'Tipo', style: 'tableHeader' },
              { text: 'Clave', style: 'tableHeader' },
              { text: 'Nombre', style: 'tableHeader' },
              { text: 'Fecha de Nacimiento', style: 'tableHeader' },
              { text: 'Género', style: 'tableHeader' },
              { text: 'Teléfono', style: 'tableHeader' },
              { text: 'Correo', style: 'tableHeader' },
              { text: 'Domicilio', style: 'tableHeader' },
            ],
            ...usuariosPDF
          ],
        },
        layout: {
          hLineWidth: function(i, node) {
            return (i === 0 || i === node.table.body.length) ? 2 : 1;
          },
          vLineWidth: function(i, node) {
            return (i === 0 || i === node.table.widths.length) ? 2 : 1;
          },
          hLineColor: function(i, node) {
            return (i === 0 || i === node.table.body.length) ? '#5D6D7E' : '#AEB6BF';
          },
          vLineColor: function(i, node) {
            return (i === 0 || i === node.table.widths.length) ? '#5D6D7E' : '#AEB6BF';
          },
          paddingLeft: function(i) { return 10; },
          paddingRight: function(i) { return 10; },
          paddingTop: function(i) { return 5; },
          paddingBottom: function(i) { return 5; }
        }
      },
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20],
        color: '#1B4F72'
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'white',
        fillColor: '#2980B9'
      }
    },
    defaultStyle: {
      fontSize: 10,
      color: '#2C3E50'
    }
  };

  pdfMake.createPdf(docDefinition).open();
};