
---

## 🛠️ Alur Kerja Pengembangan (Modular HTML)

Website ini dikembangkan menggunakan konsep **Modular HTML**. Kode program dipecah menjadi beberapa komponen kecil agar mudah di-maintenance, lalu dirakit menjadi satu file `index.html` utuh menggunakan Node.js.

### 📁 Struktur Folder Penting:
* **`src/`** ➡️ **SELAIN CSS, EDIT KODE DI SINI!**
  * `src/index.html` ➡️ Template utama layout.
  * `src/components/` ➡️ Folder tempat potongan HTML komponen (navbar, profil, sertifikat, projek, dll.).
* **`assets/`** ➡️ File aset seperti CSS, gambar, dll.
  * `assets/css/style.css` ➡️ CSS Utama.
  * `assets/css/certif_style.css` ➡️ CSS khusus Sertifikat & Galeri Modal.
* **`index.html` (di luar/root)** ➡️ **JANGAN DI-EDIT MANUAL!** File ini dihasilkan otomatis oleh compiler.

---

## ⚡ Langkah-Langkah Menjalankan Development Server

Setiap kali Anda ingin melakukan perubahan kode, ikuti langkah berikut:

### Langkah 1: Jalankan Auto-Compiler (Watch Mode)
Buka Terminal di root folder project (`AkuRangga`) dan jalankan perintah Node.js berikut:
```bash
node build.js --watch
```
> [!IMPORTANT]
> **Selalu jalankan perintah di atas sebelum mulai mengedit kode!** 
> Dengan mode `--watch`, setiap kali Anda menyimpan file di dalam folder `src/` (Ctrl+S), script akan langsung memperbarui file `index.html` di root secara otomatis dalam milidetik.

### Langkah 2: Lihat Preview dengan Live Server
Untuk melihat tampilan website secara real-time di browser:
1. Buka file **`index.html`** yang berada di **root folder** (bukan di dalam folder `src/`).
2. Klik kanan pada file `index.html` tersebut.
3. Pilih **"Open with Live Server"** (atau klik tombol **Go Live** di pojok kanan bawah VS Code jika menggunakan ekstensi Live Server).
4. Setiap kali `build.js` memperbarui file `index.html`, Live Server akan otomatis me-refresh browser Anda.

---

## 📝 Ringkasan Perintah

| Perintah | Fungsi | Kapan Digunakan? |
| :--- | :--- | :--- |
| `node build.js` | Mengompilasi komponen sekali saja | Saat pertama kali buka project / sebelum deploy |
| `node build.js --watch` | Mengompilasi otomatis setiap kali file disimpan | **Selalu jalankan saat coding** |

---

*Selamat berkarya! Majulah walau hanya selangkah. 🚀*

*The worst part is not about failed, it's about Stop Trying*