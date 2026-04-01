const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const expoNotFoundPath = path.join(distDir, '+not-found.html');
const firebaseNotFoundPath = path.join(distDir, '404.html');

if (!fs.existsSync(distDir)) {
  throw new Error('dist directory not found. Run the web export before preparing Firebase Hosting output.');
}

if (fs.existsSync(expoNotFoundPath)) {
  fs.copyFileSync(expoNotFoundPath, firebaseNotFoundPath);
  console.log('Prepared dist/404.html for Firebase Hosting.');
} else {
  console.log('No +not-found.html found. Skipped Firebase 404 page preparation.');
}
