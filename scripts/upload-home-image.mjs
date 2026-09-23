// scripts/upload-home-image.mjs
//
// Una sola imagen para el hero del home ("Atención personal - Equipo en Mendoza").
// Baja desde Wikimedia Commons y la sube a Firebase Storage bajo `home/`.
//
// Reemplaza la URL de Unsplash hardcoded en home.html:192 que mostraba un
// anillo decorativo fuera del contexto.
//
// Prerrequisito: `firebase emulators:start` corriendo.
//
// Uso:
//   node scripts/upload-home-image.mjs

import { initializeApp } from 'firebase/app';
import {
  getStorage,
  connectStorageEmulator,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
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

const app = initializeApp({
  apiKey: pick('apiKey'),
  authDomain: pick('authDomain'),
  projectId: pick('projectId'),
  storageBucket: pick('storageBucket'),
  messagingSenderId: pick('messagingSenderId'),
  appId: pick('appId'),
});

const storage = getStorage(app);
try {
  connectStorageEmulator(storage, '127.0.0.1', 9199);
} catch {}

// ---------- 2. Wikimedia ----------
//
// Imagen: "Hand holding iphone with a setting sun (Unsplash).jpg"
// Una mano sosteniendo un iPhone al atardecer. Wikimedia Commons hospeda
// el archivo aunque originalmente fuera de Unsplash — la licencia y la
// atribución van por cuenta de la persona que la subió.
// https://commons.wikimedia.org/wiki/File:Hand_holding_iphone_with_a_setting_sun_(Unsplash).jpg
const WIKI_FILE = 'Hand_holding_iphone_with_a_setting_sun_(Unsplash).jpg';
const WIKI_USER_AGENT =
  'TiendaOnlineScript/1.0 (https://ftn-agency.com; sebastianechazu@gmail.com) node-fetch';

async function getWikiUrl(fileName) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: `File:${fileName}`,
    prop: 'imageinfo',
    iiprop: 'url',
  });
  const res = await fetch(url, { headers: { 'User-Agent': WIKI_USER_AGENT } });
  if (!res.ok) throw new Error(`Wikimedia API HTTP ${res.status}`);
  const json = await res.json();
  const first = Object.values(json.query?.pages ?? {})[0];
  return first?.imageinfo?.[0]?.url;
}

async function downloadAndUpload() {
  console.log(`Resolviendo File:${WIKI_FILE}...`);
  const fileUrl = await getWikiUrl(WIKI_FILE);
  if (!fileUrl) throw new Error(`Sin URL para ${WIKI_FILE}`);
  console.log(`URL directa: ${fileUrl}`);

  console.log('Descargando...');
  const res = await fetch(fileUrl, { headers: { 'User-Agent': WIKI_USER_AGENT } });
  if (!res.ok) throw new Error(`Download HTTP ${res.status}`);
  const buffer = new Uint8Array(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  console.log(`  ${buffer.length} bytes, content-type=${contentType}`);

  const objectName = `${Date.now()}_hand_holding_iphone.jpg`;
  const path = `home/${objectName}`;
  console.log(`Subiendo a Storage: ${path}...`);
  const ref = storageRef(storage, path);
  await uploadBytes(ref, buffer, { contentType });
  const publicUrl = await getDownloadURL(ref);
  return publicUrl;
}

downloadAndUpload()
  .then((url) => {
    console.log(`\nHecho. URL pública:\n${url}`);
    console.log(`\nPegar en src/app/modules/public/home/home.html:192 dentro del <img src="...">`);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });