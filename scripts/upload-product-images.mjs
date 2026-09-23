// scripts/upload-product-images.mjs
//
// Descarga fotos reales de los 5 iPhones del seed desde Wikimedia Commons,
// las sube a Firebase Storage (emulador) y actualiza el doc del producto
// en Firestore con `imagen` + `imagenes` apuntando a las URLs del emulador.
//
// Usa Firebase Admin SDK para bypassear las security rules (Storage rules
// estan cerradas a admin-only writes — el client SDK no escribiria).
//
// Prerrequisito: `firebase emulators:start` corriendo.
// Uso:
//   node scripts/upload-product-images.mjs          # añade si faltan
//   node scripts/upload-product-images.mjs --reset  # borra previos y reemplaza

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const envPath = fileURLToPath(new URL('../src/environments/environment.ts', import.meta.url));
const envSource = readFileSync(envPath, 'utf-8');
const pick = (key) => {
  const m = envSource.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  if (!m) throw new Error(`No se encontró "${key}" en environment.ts`);
  return m[1];
};

const projectId = pick('projectId');
const storageBucket = pick('storageBucket');

// firebase-admin NO necesita apiKey. Solo projectId + storageBucket.
const app =
  getApps().find((a) => a.name === 'upload-images') ??
  initializeApp({ projectId, storageBucket }, 'upload-images');

const db = getFirestore(app);
db.settings({ host: '127.0.0.1:8080', ssl: false });

// Storage con emulator: firebase-admin v12 no tiene connectStorageEmulator,
// hay que setear el env var. Usamos el nombre de bucket por defecto.
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
const storage = getStorage(app);
const bucket = storage.bucket(storageBucket);

const FIREBASE_PROJECT = projectId;
console.log(`(emuladores Firestore 127.0.0.1:8080 y Storage 9199)`);

// ---------- 1. Mapa de modelos → archivos de Wikimedia ----------
//
// Cada modelo apunta a 3 archivos de Wikimedia Commons. Las URLs directas
// se obtienen en runtime via la API de Wikimedia (no hardcodeamos paths que
// pueden cambiar).

const PRODUCT_IMAGES = {
  'iphone-13': [
    'IPhone_13.jpg',
    'IPhone_13_White_256g.jpg',
    'IPhone_13_and_iPhone_14_Plus.jpg',
  ],
  'iphone-14': [
    'IPhone_14_Product_Red.jpg',
    'Back_view_of_iPhone_14_Blue.jpg',
    'IPhone_14_Plus_and_iPhone_14.jpg',
  ],
  'iphone-15': [
    'IPhone_15.jpg',
    'Back_of_iPhone_15.jpg',
    'IPhone_15_and_15_Plus_in_Apple_Store_-_1.jpg',
  ],
  'iphone-16': [
    'Back_of_iPhone_16.jpg',
    'Back_of_iPhone_16_Blue_model.jpg',
    'IPhone_16_(54251031797).jpg',
  ],
  'iphone-16-pro': [
    'IPhone_16_Pro_-_black.jpg',
    'IPhone_16_Pro_series.jpg',
    'Back_of_iPhone_16_Pro_-_1.jpg',
  ],
};

// ---------- 2. Helpers ----------

/** User-Agent para Wikimedia (ver agent memory para detalle). */
const WIKI_USER_AGENT =
  'TiendaOnlineScript/1.0 (https://ftn-agency.com; sebastianechazu@gmail.com) node-fetch';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, opts = {}, { maxAttempts = 4, baseDelayMs = 1500 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, opts);
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
        if (attempt < maxAttempts) {
          await sleep(baseDelayMs * 2 ** (attempt - 1));
          continue;
        }
      }
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt < maxAttempts) {
        await sleep(baseDelayMs * 2 ** (attempt - 1));
        continue;
      }
    }
  }
  throw lastErr;
}

async function getWikimediaFileUrl(fileName) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json',
    titles: `File:${fileName}`, prop: 'imageinfo', iiprop: 'url',
  });
  const res = await fetchWithRetry(url, { headers: { 'User-Agent': WIKI_USER_AGENT } });
  if (!res.ok) throw new Error(`Wikimedia API HTTP ${res.status} para ${fileName}`);
  const json = await res.json();
  const first = Object.values(json.query?.pages ?? {})[0];
  const info = first?.imageinfo?.[0];
  if (!info?.url) throw new Error(`Sin URL para File:${fileName}`);
  return info.url;
}

async function downloadImage(url) {
  const res = await fetchWithRetry(url, { headers: { 'User-Agent': WIKI_USER_AGENT } });
  if (!res.ok) throw new Error(`Download HTTP ${res.status} para ${url}`);
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    contentType: res.headers.get('content-type') ?? 'image/jpeg',
  };
}

/** Sube un buffer a Storage (firebase-admin bypasea rules). Devuelve URL emulador. */
async function uploadToStorage(slug, fileName, buffer, contentType) {
  const objectName = `${Date.now()}_${fileName}`;
  const path = `products/${slug}/${objectName}`;
  await bucket.file(path).save(buffer, {
    contentType,
    resumable: false, // más rápido para buffers chicos/medianos
    metadata: { cacheControl: 'public, max-age=3600' },
  });
  // URL del emulador de Firebase Storage (formato GET /v0/b/{bucket}/o/{path}?alt=media).
  // No usamos getSignedUrl porque requiere google-auth completo; en dev la URL
  // plana del emulador es suficiente.
  return `http://127.0.0.1:9199/v0/b/${storageBucket}/o/${encodeURIComponent(path)}?alt=media`;
}

/** Borra todos los archivos previos bajo `products/{slug}/` (admin: listado recursivo). */
async function clearProductStorage(slug) {
  const [files] = await bucket.getFiles({ prefix: `products/${slug}/` });
  if (files.length === 0) return 0;
  await Promise.all(files.map((f) => f.delete().catch(() => {})));
  return files.length;
}

/** Actualiza el doc del producto en Firestore con las URLs del Storage. */
async function updateProductDoc(productId, urls) {
  await db.collection('products').doc(productId).update({
    imagen: urls[0],
    imagenes: urls,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/** Busca el id del doc por subcategoriaId o slug. */
async function findProductIdBySlug(slug) {
  const snap = await db.collection('products').get();
  for (const d of snap.docs) {
    const data = d.data();
    if (data.subcategoriaId === slug || data.slug === slug) return d.id;
  }
  return null;
}

// ---------- 3. Run ----------

const shouldReset = process.argv.includes('--reset');

async function uploadForModel(slug, fileNames) {
  console.log(`\n→ ${slug}:`);
  const productId = await findProductIdBySlug(slug);
  if (!productId) {
    console.log(`  ⚠ No encontré producto en Firestore para slug="${slug}". Saltando.`);
    return null;
  }

  if (shouldReset) {
    const removed = await clearProductStorage(slug);
    if (removed > 0) console.log(`  Storage: borrados ${removed} archivos previos`);
    await sleep(500);
  }

  const urls = [];
  for (const fileName of fileNames) {
    try {
      const wikiUrl = await getWikimediaFileUrl(fileName);
      const { buffer, contentType } = await downloadImage(wikiUrl);
      const publicUrl = await uploadToStorage(slug, fileName, buffer, contentType);
      urls.push(publicUrl);
      console.log(`  ✓ ${fileName} → ${publicUrl.slice(0, 70)}...`);
      await sleep(1500);
    } catch (e) {
      console.log(`  ✗ ${fileName}: ${e.message}`);
    }
  }

  if (urls.length === 0) {
    console.log(`  ⚠ Ninguna imagen subió. No actualizo Firestore.`);
    return null;
  }

  await updateProductDoc(productId, urls);
  console.log(`  ✓ Firestore: imagen=${urls[0].slice(0, 60)}... (${urls.length} total)`);
  return urls.length;
}

async function main() {
  console.log(`Subiendo imágenes en proyecto: ${FIREBASE_PROJECT}\n`);
  if (shouldReset) console.log('--reset: borrando imágenes previas antes de subir\n');

  let totalImages = 0;
  for (const [slug, fileNames] of Object.entries(PRODUCT_IMAGES)) {
    const n = await uploadForModel(slug, fileNames);
    if (n) totalImages += n;
  }

  console.log(`\nListo. ${totalImages} imágenes subidas en total.`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});