// scripts/seed-products.mjs
//
// Carga datos de muestra en Firestore. Solo funciona mientras
// `firestore.rules` esté abierta (`if true`); ver `docs/deuda-tecnica.md`.
// Cuando se cierren las rules, migrar a Firebase Admin SDK + service account.
//
// Uso:
//   node scripts/seed-products.mjs          # idempotente: aborta si ya hay datos
//   node scripts/seed-products.mjs --reset  # borra products/categories/etc. y reemplaza
//
// Lee la config de `src/environments/environment.ts`. No requiere credenciales
// adicionales porque las rules actuales permiten todo.

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// ---------- 1. Config desde environment.ts ----------

const envPath = fileURLToPath(new URL('../src/environments/environment.ts', import.meta.url));
const envSource = readFileSync(envPath, 'utf-8');

const pick = (key) => {
  const m = envSource.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  if (!m) throw new Error(`No se encontró "${key}" en environment.ts`);
  return m[1];
};

const firebaseConfig = {
  apiKey: pick('apiKey'),
  authDomain: pick('authDomain'),
  projectId: pick('projectId'),
  storageBucket: pick('storageBucket'),
  messagingSenderId: pick('messagingSenderId'),
  appId: pick('appId'),
};

// ---------- 2. Init Firebase ----------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const FIREBASE_PROJECT = firebaseConfig.projectId;

// Conectar al emulador local por defecto (127.0.0.1:8080).
// Para apuntar a producción, exportar FIRESTORE_EMULATOR_HOST='' antes de correr.
// Si el emulador no está corriendo, los writes fallan ruidosamente — eso es lo que queremos
// en dev (no escribir a prod por accidente).
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
try {
  const [host, portStr] = EMULATOR_HOST.split(':');
  connectFirestoreEmulator(db, host, Number(portStr));
  console.log(`(emulador Firestore ${EMULATOR_HOST})`);
} catch (e) {
  console.warn(`No pude conectar al emulador (${EMULATOR_HOST}):`, e.message);
}

// ---------- 3. Datos de muestra ----------
//
// Coherente con los modelos en `src/app/core/models/`.
// Idempotencia: usa `id` explícito en rubros/categories/subcategories/pages
// para que un eventual upsert sea estable. Products usa auto-id (como la app).

const RUBROS = [
  { id: 'muebles', nombre: 'Muebles', orden: 1 },
  { id: 'decoracion', nombre: 'Decoración', orden: 2 },
  { id: 'regalos', nombre: 'Regalos', orden: 3 },
];

const CATEGORIES = [
  { id: 'muebles-living', nombre: 'Living', rubroId: 'muebles', orden: 1 },
  { id: 'muebles-comedor', nombre: 'Comedor', rubroId: 'muebles', orden: 2 },
  { id: 'muebles-dormitorio', nombre: 'Dormitorio', rubroId: 'muebles', orden: 3 },
  { id: 'decoracion-textil', nombre: 'Textil', rubroId: 'decoracion', orden: 1 },
  { id: 'decoracion-iluminacion', nombre: 'Iluminación', rubroId: 'decoracion', orden: 2 },
  { id: 'regalos-hogar', nombre: 'Para el hogar', rubroId: 'regalos', orden: 1 },
];

const SUBCATEGORIES = [
  { id: 'sillones', nombre: 'Sillones', categoryId: 'muebles-living', orden: 1 },
  { id: 'mesas-ratonas', nombre: 'Mesas ratonas', categoryId: 'muebles-living', orden: 2 },
  { id: 'mesas-comedor', nombre: 'Mesas', categoryId: 'muebles-comedor', orden: 1 },
  { id: 'sillas-comedor', nombre: 'Sillas', categoryId: 'muebles-comedor', orden: 2 },
  { id: 'respaldos', nombre: 'Respaldos', categoryId: 'muebles-dormitorio', orden: 1 },
];

const PRODUCTS = [
  {
    nombre: 'Sillón Recoleta',
    slug: 'sillon-recoleta',
    descripcion:
      'Sillón de living tapizado en pana verde botella. Estructura de madera maciza, patas de metal negro mate. Hecho a mano en Buenos Aires.',
    precio: 459000,
    rubroId: 'muebles',
    categoriaId: 'muebles-living',
    subcategoriaId: 'sillones',
    destacado: true,
    descuento: 0,
    disponibilidad: true,
    publicado: true,
  },
  {
    nombre: 'Mesa ratona Palermo',
    slug: 'mesa-ratona-palermo',
    descripcion:
      'Mesa ratona circular con tapa de mármol travertino y base de madera guayubira. Diámetro 90 cm.',
    precio: 178000,
    rubroId: 'muebles',
    categoriaId: 'muebles-living',
    subcategoriaId: 'mesas-ratonas',
    destacado: true,
    descuento: 0,
    disponibilidad: true,
    publicado: true,
  },
  {
    nombre: 'Mesa de comedor Belgrano',
    slug: 'mesa-comedor-belgrano',
    descripcion:
      'Mesa extensible para 6 a 8 personas. Tapa de madera de paraíso lustrada, patas de hierro forjado.',
    precio: 612000,
    rubroId: 'muebles',
    categoriaId: 'muebles-comedor',
    subcategoriaId: 'mesas-comedor',
    destacado: false,
    descuento: 0,
    disponibilidad: true,
    publicado: true,
  },
  {
    nombre: 'Silla Eames réplica',
    slug: 'silla-eames-replica',
    descripcion:
      'Silla de comedor estilo Eames en madera de roble y asiento en polipropileno blanco. Set x4.',
    precio: 195000,
    rubroId: 'muebles',
    categoriaId: 'muebles-comedor',
    subcategoriaId: 'sillas-comedor',
    destacado: false,
    descuento: 0,
    disponibilidad: true,
    publicado: true,
  },
  {
    nombre: 'Respaldo San Telmo',
    slug: 'respaldo-san-telmo',
    descripcion:
      'Respaldo para cama queen en capitoné de lino color arena. Incluye instalación.',
    precio: 285000,
    rubroId: 'muebles',
    categoriaId: 'muebles-dormitorio',
    subcategoriaId: 'respaldos',
    destacado: false,
    descuento: 0,
    disponibilidad: false, // Agotado, para ver el flujo de "no disponible"
    publicado: true,
  },
  {
    nombre: 'Frazada wool Sierra',
    slug: 'frazada-wool-sierra',
    descripcion: 'Frazada 100% lana virgen hilada a mano. Hecha en Patagonia.',
    precio: 84000,
    rubroId: 'decoracion',
    categoriaId: 'decoracion-textil',
    destacado: true,
    descuento: 0,
    disponibilidad: true,
    publicado: true,
  },
  {
    nombre: 'Lámpara de pie Troncos',
    slug: 'lampara-pie-troncos',
    descripcion:
      'Lámpara de pie con pantalla de lino crudo y base de tronco de algarrobo reciclado.',
    precio: 124000,
    rubroId: 'decoracion',
    categoriaId: 'decoracion-iluminacion',
    destacado: false,
    descuento: 0,
    disponibilidad: true,
    publicado: true,
  },
  {
    nombre: 'Set regalo Desayuno',
    slug: 'set-regalo-desayuno',
    descripcion:
      'Caja regalo con mermelada de membrillo casera, té de cedrón y medialunas artesanales. Presentación en caja de madera.',
    precio: 18500,
    rubroId: 'regalos',
    categoriaId: 'regalos-hogar',
    destacado: true,
    descuento: 10,
    disponibilidad: true,
    publicado: true,
  },
];

const PAGES = [
  {
    id: 'about',
    title: 'Sobre Regalarte',
    content:
      'Regalarte es una tienda de muebles, objetos de decoración y regalos para el hogar. Trabajamos con diseñadores y artesanos locales de Buenos Aires y Patagonia. Cada pieza que vendemos está hecha a mano, en tiradas cortas, con materiales nobles. Si te interesa algo que no ves en la tienda, escribinos a hola@regalarte.com.ar y lo conseguimos.',
  },
  {
    id: 'terms',
    title: 'Términos y condiciones',
    content:
      'Las compras se procesan a través de MercadoPago o transferencia bancaria. Los precios están expresados en pesos argentinos (ARS) e incluyen IVA. Los envíos a CABA y GBA se realizan en 5 a 10 días hábiles; al interior del país, 10 a 15. Las piezas personalizadas no tienen cambio ni devolución. El resto de los productos pueden devolverse dentro de los 10 días corridos desde la entrega, en su empaque original.',
  },
  {
    id: 'privacy',
    title: 'Política de privacidad',
    content:
      'Tus datos personales (nombre, email, dirección de envío, teléfono) se usan únicamente para procesar tu pedido y contactarte sobre el estado del envío. No compartimos tu información con terceros con fines comerciales. Podés solicitar la eliminación de tus datos en cualquier momento escribiendo a privacidad@regalarte.com.ar. Este sitio usa cookies técnicas (sesión) y analíticas (Firebase Analytics, agregadas).',
  },
  {
    id: 'returns',
    title: 'Cambios y devoluciones',
    content:
      'Si el producto que recibiste tiene una falla de fabricación o no es lo que pediste, tenés 10 días corridos para pedir el cambio o la devolución. Los productos personalizados (a medida, con grabado, etc.) no tienen cambio. Para iniciar el proceso, escribinos a devoluciones@regalarte.com.ar con el número de pedido y una foto del producto. El costo de envío de la devolución corre por nuestra cuenta si la falla es nuestra.',
  },
];

const CONTACT = {
  email: 'hola@regalarte.com.ar',
  phone: '+54 11 4567-8910',
  whatsapp: '+54 9 11 4567-8910',
  address: 'Defensa 742, San Telmo, Buenos Aires',
  instagram: '@regalarte.ba',
  facebook: 'regalarte.ba',
  twitter: '@regalarteba',
};

// ---------- 4. Helpers ----------

async function deleteCollection(name) {
  const snap = await getDocs(collection(db, name));
  if (snap.empty) return 0;
  // Firestore batch limit = 500 ops. Acá no aplica (datasets chicos), pero dejamos
  // el patrón por si crece.
  const batch = writeBatch(db);
  for (const docSnap of snap.docs) {
    batch.delete(doc(db, name, docSnap.id));
  }
  await batch.commit();
  return snap.size;
}

async function upsertCollection(name, items, idField = 'id') {
  if (items.length === 0) return;
  const batch = writeBatch(db);
  for (const item of items) {
    const id = item[idField];
    const data = { ...item };
    delete data[idField];
    batch.set(doc(db, name, id), data);
  }
  await batch.commit();
  console.log(`  ✓ ${name}: ${items.length} docs`);
}

async function createProducts(items) {
  if (items.length === 0) return;
  const batch = writeBatch(db);
  for (const p of items) {
    const ref = doc(collection(db, 'products')); // auto-id (consistente con la app)
    batch.set(ref, p);
  }
  await batch.commit();
  console.log(`  ✓ products: ${items.length} docs (auto-id)`);
}

// ---------- 5. Run ----------

const shouldReset = process.argv.includes('--reset');

async function main() {
  if (shouldReset) {
    console.log('--reset: borrando collections existentes');
    for (const col of ['products', 'categories', 'subcategories', 'rubros', 'pages', 'contact']) {
      const n = await deleteCollection(col);
      if (n > 0) console.log(`  borrados ${n} docs de ${col}`);
    }
  } else {
    const existing = await getDocs(collection(db, 'products'));
    if (!existing.empty) {
      console.error(`Hay ${existing.size} productos ya cargados.`);
      console.error('Para reemplazarlos corré con --reset:');
      console.error('  node scripts/seed-products.mjs --reset');
      console.error('Abortando para no duplicar.');
      process.exit(1);
    }
  }

  console.log(`\nSembrando datos en proyecto: ${FIREBASE_PROJECT}\n`);

  await upsertCollection('rubros', RUBROS);
  await upsertCollection('categories', CATEGORIES);
  await upsertCollection('subcategories', SUBCATEGORIES);
  await createProducts(PRODUCTS);
  await upsertCollection('pages', PAGES);

  await setDoc(doc(db, 'contact', 'main'), CONTACT);
  console.log('  ✓ contact: 1 doc (id=main)');

  console.log('\nListo.');
  console.log(`  Rubros:        ${RUBROS.length}`);
  console.log(`  Categorías:    ${CATEGORIES.length}`);
  console.log(`  Subcategorías: ${SUBCATEGORIES.length}`);
  console.log(`  Productos:     ${PRODUCTS.length}`);
  console.log(`  Páginas:       ${PAGES.length}`);
  console.log(`  Contact:       1`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
