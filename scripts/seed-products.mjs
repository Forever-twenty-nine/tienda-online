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
//
// Catálogo: tienda de iPhones en Mendoza. 5 productos entre iPhone 13 y iPhone 16 Pro.
// Colores y capacidades coinciden con los disponibles oficialmente en Apple Store AR
// al momento del seed. Imágenes son placeholders de picsum.photos (provisorios hasta
// que se suban fotos reales vía admin).

const RUBROS = [
  { id: 'tecnologia', nombre: 'Tecnología', orden: 1 },
];

const CATEGORIES = [
  { id: 'celulares', nombre: 'Celulares', rubroId: 'tecnologia', orden: 1 },
  { id: 'accesorios', nombre: 'Accesorios', rubroId: 'tecnologia', orden: 2 },
];

const SUBCATEGORIES = [
  { id: 'iphone-13', nombre: 'iPhone 13', categoryId: 'celulares', orden: 1 },
  { id: 'iphone-14', nombre: 'iPhone 14', categoryId: 'celulares', orden: 2 },
  { id: 'iphone-15', nombre: 'iPhone 15', categoryId: 'celulares', orden: 3 },
  { id: 'iphone-16', nombre: 'iPhone 16', categoryId: 'celulares', orden: 4 },
  { id: 'iphone-16-pro', nombre: 'iPhone 16 Pro', categoryId: 'celulares', orden: 5 },
];

const img = (slug) => `https://picsum.photos/seed/${slug}/800/800`;

const PRODUCTS = [
  {
    nombre: 'iPhone 13',
    slug: 'iphone-13',
    descripcion:
      'Chip A15 Bionic con Neural Engine. Sistema de dos cámaras de 12 MP con modo Cine. Batería que dura todo el día. Pantalla Super Retina XDR de 6.1 pulgadas. Ceramic Shield en la parte frontal.',
    precio: 1299000,
    imagen: img('iphone-13'),
    imagenes: [img('iphone-13'), img('iphone-13-2'), img('iphone-13-3')],
    rubroId: 'tecnologia',
    categoriaId: 'celulares',
    subcategoriaId: 'iphone-13',
    destacado: false,
    descuento: 0,
    disponibilidad: false, // Agotado, para ver el flujo "sin stock"
    publicado: true,
    colores: [
      { nombre: 'Rosa', hex: '#fad0bc' },
      { nombre: 'Azul', hex: '#3a4a6b' },
      { nombre: 'Medianoche', hex: '#232a35' },
      { nombre: 'Luz estelar', hex: '#f4f1ec' },
      { nombre: '(PRODUCT)RED', hex: '#bf0013' },
    ],
    capacidades: ['128 GB', '256 GB', '512 GB'],
    specs: {
      chip: 'A15 Bionic',
      pantalla: '6.1" Super Retina XDR',
      camara: '12 MP · 12 MP',
      bateria: '19 hs',
      conector: 'Lightning',
      capacidadMin: '128 GB',
    },
  },
  {
    nombre: 'iPhone 14',
    slug: 'iphone-14',
    descripcion:
      'Chip A15 Bionic con GPU de 5 núcleos. Detección de Choques. Batería de hasta 20 horas de reproducción de video. Pantalla Super Retina XDR de 6.1 pulgadas con Ceramic Shield.',
    precio: 1499000,
    imagen: img('iphone-14'),
    imagenes: [img('iphone-14'), img('iphone-14-2'), img('iphone-14-3')],
    rubroId: 'tecnologia',
    categoriaId: 'celulares',
    subcategoriaId: 'iphone-14',
    destacado: false,
    descuento: 0,
    disponibilidad: true,
    publicado: true,
    colores: [
      { nombre: 'Amarillo', hex: '#f5e96d' },
      { nombre: 'Azul', hex: '#a5c4e0' },
      { nombre: 'Medianoche', hex: '#232a35' },
      { nombre: 'Luz estelar', hex: '#f4f1ec' },
      { nombre: 'Morado', hex: '#c2b5d6' },
      { nombre: '(PRODUCT)RED', hex: '#bf0013' },
    ],
    capacidades: ['128 GB', '256 GB', '512 GB'],
    specs: {
      chip: 'A15 Bionic',
      pantalla: '6.1" Super Retina XDR',
      camara: '12 MP · 12 MP',
      bateria: '20 hs',
      conector: 'Lightning',
      capacidadMin: '128 GB',
    },
  },
  {
    nombre: 'iPhone 15',
    slug: 'iphone-15',
    descripcion:
      'Dynamic Island. Cámara de 48 MP con teleobjetivo de 2x. Puerto USB-C. Chip A16 Bionic. Vidrio trasero con infusión de color. Pantalla Super Retina XDR de 6.1 pulgadas.',
    precio: 1799000,
    imagen: img('iphone-15'),
    imagenes: [img('iphone-15'), img('iphone-15-2'), img('iphone-15-3')],
    rubroId: 'tecnologia',
    categoriaId: 'celulares',
    subcategoriaId: 'iphone-15',
    destacado: true,
    descuento: 10,
    disponibilidad: true,
    publicado: true,
    colores: [
      { nombre: 'Rosa', hex: '#fad0bc' },
      { nombre: 'Amarillo', hex: '#f5e96d' },
      { nombre: 'Verde', hex: '#c4dcc4' },
      { nombre: 'Azul', hex: '#a5c4e0' },
      { nombre: 'Negro', hex: '#1d1d1f' },
    ],
    capacidades: ['128 GB', '256 GB', '512 GB'],
    specs: {
      chip: 'A16 Bionic',
      pantalla: '6.1" Super Retina XDR',
      camara: '48 MP · 12 MP',
      bateria: '20 hs',
      conector: 'USB-C',
      capacidadMin: '128 GB',
    },
  },
  {
    nombre: 'iPhone 16',
    slug: 'iphone-16',
    descripcion:
      'Chip A18 con Neural Engine de 16 núcleos. Control de Cámara. Nuevo botón de Acción. Sistema de cámaras Fusion de 48 MP. Apple Intelligence integrado. Pantalla Super Retina XDR de 6.1 pulgadas.',
    precio: 1999000,
    imagen: img('iphone-16'),
    imagenes: [img('iphone-16'), img('iphone-16-2'), img('iphone-16-3')],
    rubroId: 'tecnologia',
    categoriaId: 'celulares',
    subcategoriaId: 'iphone-16',
    destacado: true,
    descuento: 0,
    disponibilidad: true,
    publicado: true,
    colores: [
      { nombre: 'Ultramarino', hex: '#5a7aab' },
      { nombre: 'Verde azulado', hex: '#7ea9a8' },
      { nombre: 'Rosa', hex: '#f6c1d4' },
      { nombre: 'Blanco', hex: '#f4f1ec' },
      { nombre: 'Negro', hex: '#1d1d1f' },
    ],
    capacidades: ['128 GB', '256 GB', '512 GB'],
    specs: {
      chip: 'A18',
      pantalla: '6.1" Super Retina XDR',
      camara: '48 MP Fusion · 12 MP',
      bateria: '22 hs',
      conector: 'USB-C',
      capacidadMin: '128 GB',
    },
  },
  {
    nombre: 'iPhone 16 Pro',
    slug: 'iphone-16-pro',
    descripcion:
      'Chip A18 Pro. Pantalla ProMotion de 6.3 pulgadas con tecnología always-on. Cámara Fusion de 48 MP con teleobjetivo 5x. Diseño en titanio con Ceramic Shield de última generación. Apple Intelligence integrado.',
    precio: 2599000,
    imagen: img('iphone-16-pro'),
    imagenes: [img('iphone-16-pro'), img('iphone-16-pro-2'), img('iphone-16-pro-3')],
    rubroId: 'tecnologia',
    categoriaId: 'celulares',
    subcategoriaId: 'iphone-16-pro',
    destacado: true,
    descuento: 0,
    disponibilidad: true,
    publicado: true,
    colores: [
      { nombre: 'Titanio del desierto', hex: '#c4a886' },
      { nombre: 'Titanio natural', hex: '#9b9a93' },
      { nombre: 'Titanio blanco', hex: '#ecebe6' },
      { nombre: 'Titanio negro', hex: '#3a3a3c' },
    ],
    capacidades: ['128 GB', '256 GB', '512 GB', '1 TB'],
    specs: {
      chip: 'A18 Pro',
      pantalla: '6.3" ProMotion',
      camara: '48 MP Fusion · 12 MP · 12 MP',
      bateria: '27 hs',
      conector: 'USB-C',
      capacidadMin: '128 GB',
    },
  },
];

const PAGES = [
  {
    id: 'about',
    title: 'Sobre nosotros',
    content:
      'Somos una tienda online de tecnología con local físico en Mendoza, Argentina. Nos especializamos en iPhones y accesorios Apple, con productos originales, garantía oficial y atención personalizada. Todas las compras incluyen 12 cuotas sin interés y envío gratis en compras mayores a $50.000 ARS. Si necesitás un modelo que no ves en la tienda, escribinos a hola@ftn-tienda.com.ar y lo conseguimos.',
  },
  {
    id: 'terms',
    title: 'Términos y condiciones',
    content:
      'Las compras se procesan a través de transferencia bancaria, MercadoPago o efectivo en el local. Los precios están expresados en pesos argentinos (ARS) e incluyen IVA. Ofrecemos 12 cuotas sin interés con tarjetas de bancos seleccionados. Los envíos a Mendoza capital se realizan en 24 a 48 hs hábiles; al resto del país, entre 3 y 7 días hábiles según destino. La garantía oficial Apple se respeta en todos los productos comercializados.',
  },
  {
    id: 'privacy',
    title: 'Política de privacidad',
    content:
      'Tus datos personales (nombre, email, dirección de envío, teléfono) se usan únicamente para procesar tu pedido y contactarte sobre el estado del envío. No compartimos tu información con terceros con fines comerciales. Podés solicitar la eliminación de tus datos en cualquier momento escribiendo a privacidad@ftn-tienda.com.ar. Este sitio usa cookies técnicas (sesión) y analíticas agregadas.',
  },
  {
    id: 'returns',
    title: 'Cambios y devoluciones',
    content:
      'Si el producto que recibiste tiene una falla de fábrica o no es lo que pediste, tenés 10 días corridos para pedir el cambio o la devolución, sin cargo. Los productos con la caja abierta o usados no tienen cambio. Para iniciar el proceso, escribinos a devoluciones@ftn-tienda.com.ar con el número de pedido y una foto del producto. Los productos en garantía oficial Apple se derivan al servicio técnico oficial.',
  },
];

const CONTACT = {
  email: 'hola@ftn-tienda.com.ar',
  phone: '+54 261 555-1234',
  whatsapp: '+54 9 261 555-1234',
  address: 'Sarmiento 111, Mendoza, Argentina',
  instagram: '@ftn.tienda',
  facebook: 'ftn.tienda',
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