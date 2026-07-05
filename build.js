const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const ENTRY_FILE = path.join(SRC_DIR, 'index.html');
const OUTPUT_FILE = path.join(__dirname, 'index.html');

function compile() {
    console.log(`[${new Date().toLocaleTimeString()}] Memulai kompilasi...`);
    try {
        if (!fs.existsSync(SRC_DIR)) {
            console.error(`Error: Folder src tidak ditemukan di: ${SRC_DIR}`);
            return;
        }

        // Cari semua file .html langsung di bawah folder src/ (tidak termasuk subfolder)
        const files = fs.readdirSync(SRC_DIR).filter(file => {
            const filePath = path.join(SRC_DIR, file);
            return fs.statSync(filePath).isFile() && file.endsWith('.html');
        });

        for (const file of files) {
            const entryFile = path.join(SRC_DIR, file);
            const outputFile = path.join(__dirname, file);

            let content = fs.readFileSync(entryFile, 'utf8');
            
            // Regex untuk mencari <!-- @include filename.html -->
            const includeRegex = /<!--\s*@include\s+([^\s]+)\s*-->/g;
            
            let match;
            let hasReplacements = true;
            let iteration = 0;
            const maxIterations = 5; // Mencegah circular reference
            
            while (hasReplacements && iteration < maxIterations) {
                hasReplacements = false;
                content = content.replace(includeRegex, (fullMatch, filename) => {
                    const componentPath = path.join(SRC_DIR, filename);
                    if (fs.existsSync(componentPath)) {
                        hasReplacements = true;
                        return fs.readFileSync(componentPath, 'utf8');
                    } else {
                        console.warn(`[WARNING] File komponen tidak ditemukan: ${componentPath}`);
                        return `<!-- ERROR: ${filename} tidak ditemukan -->`;
                    }
                });
                iteration++;
            }

            fs.writeFileSync(outputFile, content, 'utf8');
            console.log(`[SUCCESS] Kompilasi berhasil: src/${file} -> ${file}`);
        }
        console.log(`[SUCCESS] Semua halaman berhasil dikompilasi!\n`);
    } catch (error) {
        console.error(`[ERROR] Terjadi kesalahan saat kompilasi:`, error);
    }
}

// Cek argumen watch
const isWatch = process.argv.includes('--watch');

// Jalankan kompilasi pertama
compile();

if (isWatch) {
    console.log(`Watching changes di folder: ${SRC_DIR}...`);
    let debounceTimer;
    
    // Watch folder src secara rekursif
    fs.watch(SRC_DIR, { recursive: true }, (eventType, filename) => {
        if (filename) {
            // Debounce compiler agar tidak berjalan berulang-ulang ketika menyimpan banyak file sekaligus
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                console.log(`[WATCH] File berubah: ${filename}`);
                compile();
            }, 100);
        }
    });
}
