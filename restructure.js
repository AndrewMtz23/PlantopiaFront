const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const pagesDir = path.join(srcDir, 'pages');
const appDir = path.join(srcDir, 'app');

if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

// Mapa de origen (sin extensión) a destino 
const moveMap = {
  'public/HomePage': 'home/page',
  'public/CompanyPage': 'cia/page',
  'public/AboutPage': 'acerca-de/page',
  'public/FaqPage': 'preguntas/page',
  'public/CollectionsPage': 'colecciones/page',
  'public/CareGuidePage': 'cuidados/page',
  'public/ShippingPage': 'envios/page',
  'public/GiftingPage': 'regalos-botanicos/page',
  'auth/LoginPage': 'auth/login/page',
  'auth/RegisterPage': 'auth/register/page',
  'shop/CatalogPage': 'catalogo/page',
  'shop/CartPage': 'carrito/page',
  'shop/WishlistPage': 'lista/page',
  'admin/CrudHubPage': 'cruds/page',
  'admin/UsersPage': 'usuarios/page',
  'admin/ProductsPage': 'productos/page',
  'admin/BranchesPage': 'sucursales/page',
  'admin/ProvidersPage': 'proveedores/page',
  'admin/InventoryPage': 'inventarios/page',
  'admin/MetricsPage': 'graficas/page',
  'admin/ProfitabilityPage': 'graficas/rentabilidad/page'
};

let appJsContent = fs.readFileSync(path.join(srcDir, 'App.js'), 'utf-8');

for (const [oldPath, newPath] of Object.entries(moveMap)) {
  const oldFullJs = path.join(pagesDir, `${oldPath}.js`);
  const oldFullJsx = path.join(pagesDir, `${oldPath}.jsx`);
  
  let oldFull = null;
  if (fs.existsSync(oldFullJs)) oldFull = oldFullJs;
  else if (fs.existsSync(oldFullJsx)) oldFull = oldFullJsx;

  if (oldFull) {
    const ext = path.extname(oldFull);
    const newFull = path.join(appDir, `${newPath}${ext}`);
    const newDir = path.dirname(newFull);
    
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }
    
    fs.renameSync(oldFull, newFull);
    console.log(`Moved ${oldPath} to app/${newPath}`);
    
    // Replace in App.js
    const oldImport = `./pages/${oldPath}`;
    const newImport = `./app/${newPath}`;
    appJsContent = appJsContent.replace(oldImport, newImport);
  }
}

fs.writeFileSync(path.join(srcDir, 'App.js'), appJsContent);
console.log('App.js updated');

// Let's also create the admin category page boilerplate so it exists when we add it
const catDir = path.join(appDir, 'categorias');
if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, {recursive:true});
fs.writeFileSync(path.join(catDir, 'page.js'), 
`import React from 'react';
export default function CategoriesPage() {
  return <div>Categorias</div>;
}`);
appJsContent = appJsContent.replace('import ProfitabilityPage', 'import ProfitabilityPage from "./app/graficas/rentabilidad/page";\nimport CategoriesPage from "./app/categorias/page";');
// Actually better replace in App.js by looking for the last route
appJsContent = appJsContent.replace('</Routes>', '  <Route path="/categorias" element={<CategoriesPage />} />\n        </Routes>');
fs.writeFileSync(path.join(srcDir, 'App.js'), appJsContent);

