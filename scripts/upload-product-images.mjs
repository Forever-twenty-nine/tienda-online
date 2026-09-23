// scripts/upload-product-images.mjs
//
// Descarga fotos reales de los 5 iPhones del seed desde Wikimedia Commons,
// las sube a Firebase Storage y actualiza los docs de Firestore con las URLs
// públicas resultantes. Idempotente: corre con --reset para borrar las imágenes
// previas de Storage de cada producto antes de subir las nuevas.
//
// Fuente: Wikimedia Commons (CC-BY-SA). NO son fotos profesionales de Apple — son
// de usuarios (manos, mostradores,大街). Cumple el pendiente #2 de docs/cambios.md.
//
// Prerrequisito: `firebase emulators:start` corriendo en otra terminal.
//
// Uso:
//   node scripts/upload-product-images.mjs          # añade imágenes faltantes
//   node scripts/upload-product-images.mjs --reset  # borra previas y reemplaza

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import {
  getStorage,
  connectStorageEmulator,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
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
const storage = getStorage(app);
const FIREBASE_PROJECT = firebaseConfig.projectId;

const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
try {
  const [host, portStr] = EMULATOR_HOST.split(':');
  connectFirestoreEmulator(db, host, Number(portStr));
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  console.log(`(emuladores Firestore ${EMULATOR_HOST} y Storage 9199)`);
} catch (e) {
  console.warn(`No pude conectar a emuladores (${EMULATOR_HOST}):`, e.message);
}

// ---------- 3. Mapa de modelos → archivos de Wikimedia ----------
//
// Cada modelo apunta a 3 archivos de Wikimedia Commons que muestran el producto.
// Las URLs directas se obtienen en runtime via la API de Wikimedia para no hardcodear
// paths que pueden cambiar. Los File: names son estables.

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

// ---------- 4. Helpers ----------

/**
 * User-Agent para Wikimedia. La wiki pide identificar al bot con contacto real;
 * sin esto, el WAF bloquea con 403 (rechazo activo, no rate-limit). Sigue la
 * guía: https://meta.wikimedia.org/wiki/User-Agent_policy
 */
const WIKI_USER_AGENT =
  'TiendaOnlineScript/1.0 (https://ftn-agency.com; sebastianechazu@gmail.com) node-fetch';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Wrapper de fetch con retry exponencial para HTTP 429 y 5xx.
 * Wikimedia rate-limite agresivamente sin User-Agent descriptivo.
 */
async function fetchWithRetry(url, opts = {}, { maxAttempts = 4, baseDelayMs = 1500 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, opts);
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
        if (attempt < maxAttempts) {
          const wait = baseDelayMs * 2 ** (attempt - 1);
          await sleep(wait);
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

/** Devuelve la URL directa (upload.wikimedia.org) de un archivo Wikimedia. */
async function getWikimediaFileUrl(fileName) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: `File:${fileName}`,
    prop: 'imageinfo',
    iiprop: 'url',
  });
  const res = await fetchWithRetry(url, { headers: { 'User-Agent': WIKI_USER_AGENT } });
  if (!res.ok) throw new Error(`Wikimedia API HTTP ${res.status} para ${fileName}`);
  const json = await res.json();
  const pages = json.query?.pages ?? {};
  const first = Object.values(pages)[0];
  const info = first?.imageinfo?.[0];
  if (!info?.url) throw new Error(`Sin URL para File:${fileName} (página no existe o sin imageinfo)`);
  return info.url;
}

/** Descarga el archivo y devuelve su contenido como Uint8Array + contentType. */
async function downloadImage(url) {
  const res = await fetchWithRetry(url, { headers: { 'User-Agent': WIKI_USER_AGENT } });
  if (!res.ok) throw new Error(`Download HTTP ${res.status} para ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  return { buffer: buf, contentType };
}

/** Sube un buffer a Storage bajo `products/{slug}/{timestamp}_{filename}` y devuelve la URL pública. */
async function uploadToStorage(slug, fileName, buffer, contentType) {
  const objectName = `${Date.now()}_${fileName}`;
  const path = `products/${slug}/${objectName}`;
  const ref = storageRef(storage, path);
  await uploadBytes(ref, buffer, { contentType });
  return await getDownloadURL(ref);
}

/** Borra todos los archivos previos bajo `products/{slug}/`. */
async function clearProductStorage(slug) {
  const folderRef = storageRef(storage, `products/${slug}`);
  const listed = await listAll(folderRef);
  await Promise.all(listed.items.map((item) => deleteObject(item).catch(() => {})));
  return listed.items.length;
}

/** Actualiza el doc del producto en Firestore con las nuevas URLs. */
async function updateProductDoc(productId, urls) {
  const ref = doc(db, 'products', productId);
  await updateDoc(ref, {
    imagen: urls[0],
    imagenes: urls,
  });
}

/** Busca el id del doc por slug (no asumimos que sea igual). */
async function findProductIdBySlug(slug) {
  const snap = await getDocs(collection(db, 'products'));
  for (const d of snap.docs) {
    const data = d.data();
    if (data.subcategoriaId === slug || data.slug === slug) return d.id;
  }
  return null;
}

// ---------- 5. Run ----------

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
    // Pequeño delay después de borrar antes de empezar uploads
    await sleep(500);
  }

  const urls = [];
  for (const fileName of fileNames) {
    try {
      const wikiUrl = await getWikimediaFileUrl(fileName);
      const { buffer, contentType } = await downloadImage(wikiUrl);
      const publicUrl = await uploadToStorage(slug, fileName, buffer, contentType);
      urls.push(publicUrl);
      console.log(`  ✓ ${fileName} → ${publicUrl.slice(0, 60)}...`);
      // Delay entre imágenes para no triggerear rate limit de Wikimedia
      // (~1.5s, suficiente para <50 req/min que es lo que permite el API).
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
  console.log(`  ✓ Firestore: imagen=${urls[0].slice(0, 50)}... (${urls.length} total)`);
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