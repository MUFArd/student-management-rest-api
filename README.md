# Student Management REST API

Aplikasi manajemen data siswa berbasis REST API. Dokumentasi ini ditulis selangkah demi selangkah, jadi kalau kamu baru belajar Node.js/Express, ikuti saja urutannya dari atas ke bawah.

## Daftar Isi

1. [Deskripsi Aplikasi](#1-deskripsi-aplikasi)
2. [Teknologi yang Digunakan](#2-teknologi-yang-digunakan)
3. [Persiapan Sebelum Mulai](#3-persiapan-sebelum-mulai)
4. [Cara Menjalankan Backend](#4-cara-menjalankan-backend)
5. [Cara Menjalankan Frontend](#5-cara-menjalankan-frontend)
6. [Daftar Endpoint API](#6-daftar-endpoint-api)
7. [Screenshot Aplikasi](#7-screenshot-aplikasi)
8. [Identitas Pembuat](#8-identitas-pembuat)
9. [Output](#output)

---

## 1. Deskripsi Aplikasi

Student Management REST API adalah aplikasi manajemen data siswa yang memungkinkan pengguna melakukan operasi **Create, Read, Update, dan Delete (CRUD)** terhadap data siswa. Aplikasi ini dilengkapi dengan fitur pencarian, filter berdasarkan kelas, pagination, upload foto siswa, validasi form, dan mode gelap pada sisi frontend.

## 2. Teknologi yang Digunakan

| Bagian | Teknologi |
|---|---|
| Backend | Node.js, Express.js |
| Database | MySQL (`mysql2`) |
| Lainnya | CORS |
| Frontend | HTML5, Tailwind CSS (CDN), JavaScript (Vanilla JS) |
| Testing API | Postman |
| Menjalankan Frontend | Live Server (ekstensi VS Code) |

## 3. Persiapan Sebelum Mulai

Sebelum mengikuti langkah instalasi, pastikan sudah terpasang di komputer kamu:

- **[Node.js](https://nodejs.org/)** (disarankan versi LTS) — cek dengan `node -v` di terminal
- **[Git](https://git-scm.com/)** — untuk clone repository
- **MySQL** (bisa lewat XAMPP, Laragon, atau instalasi langsung) — pastikan servicenya sudah menyala
- **VS Code** dengan ekstensi **Live Server** — untuk menjalankan frontend
- **Postman** — untuk mencoba endpoint API

## 4. Cara Menjalankan Backend

### Langkah 1 — Clone repository

Buka **Git Bash** (atau terminal apa pun), lalu jalankan:

```bash
git clone https://github.com/MUFArd/student-management-rest-api.git
cd student-management-rest-api
```

### Langkah 2 — Install dependency

```bash
npm install
```

Perintah ini akan membaca `package.json` dan mengunduh semua library yang dibutuhkan (Express, mysql2, cors, dll) ke folder `node_modules`.

### Langkah 3 — Buat database

1. Buka MySQL kamu (lewat phpMyAdmin, HeidiSQL, atau terminal MySQL).
2. Buat database baru, misalnya bernama `student_management`.
3. Jalankan query berikut untuk membuat tabel `siswa`:

```sql
CREATE TABLE `siswa` (
    `id` INT(10) NOT NULL AUTO_INCREMENT,
    `nis` INT(10) NOT NULL,
    `nama` VARCHAR(50) NOT NULL,
    `kelas` VARCHAR(50) NOT NULL,
    `jurusan` VARCHAR(50) NOT NULL,
    `alamat` VARCHAR(50) NOT NULL,
    `foto` LONGTEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `nis` (`nis`)
);
```

### Langkah 4 — Atur koneksi database

Buka file `config/database.js`, sesuaikan kredensial berikut dengan MySQL kamu:

```js
host: process.env.DB_HOST,       // biasanya "localhost"
user: process.env.DB_USER,       // biasanya "root"
password: process.env.DB_PASS,   // kosongkan kalau MySQL kamu tanpa password
database: process.env.DB_NAME    // nama database yang dibuat di Langkah 3
```

Kalau project ini memakai file `.env`, buat file bernama `.env` di root project (sejajar `package.json`) lalu isi:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=student_management
PORT=3000
```

### Langkah 5 — Jalankan server

```bash
node server.js
```

Atau, kalau ingin server otomatis restart setiap ada perubahan kode (lebih enak untuk development):

```bash
npx nodemon server.js
```

### Langkah 6 — Cek server sudah jalan

Buka browser atau Postman, akses:

```
http://localhost:3000
```

Kalau muncul respons dari server (bukan error koneksi), berarti backend sudah berjalan dengan benar.

## 5. Cara Menjalankan Frontend

1. Buka folder project ini di **VS Code**.
2. Masuk ke folder `page/`.
3. Klik kanan pada `index.html` → pilih **Open with Live Server**.
   - Kalau belum ada opsi ini, install dulu ekstensi **Live Server** dari tab Extensions VS Code.
4. Sebelum dipakai, cek file `page/assets/js/script.js`, pastikan baris berikut sudah sesuai alamat backend kamu:
   ```js
   const API_BASE = 'http://localhost:3000/siswa';
   ```
5. Browser akan otomatis terbuka menampilkan halaman aplikasi. Pastikan backend (Langkah 4) sudah jalan dulu sebelum ini, karena frontend butuh mengambil data dari sana.

## 6. Daftar Endpoint API

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/siswa` | Mengambil seluruh data siswa |
| GET | `/siswa/:id` | Mengambil data siswa berdasarkan ID |
| POST | `/siswa` | Menambahkan data siswa baru |
| PUT | `/siswa/:id` | Mengubah data siswa |
| DELETE | `/siswa/:id` | Menghapus data siswa |

**Contoh Body Request (POST/PUT `/siswa`):**

```json
{
    "nis": 242510067,
    "nama": "Muhammad Farel Andriani",
    "kelas": "XII RPL",
    "jurusan": "Rekayasa Perangkat Lunak",
    "alamat": "Sirsak",
    "foto": "data:image/png;base64,..."
}
```

> Tips buat yang baru belajar: coba dulu endpoint `GET /siswa` di Postman untuk memastikan koneksi database jalan, baru lanjut coba `POST` untuk menambah data.

## 7. Screenshot Aplikasi

**Halaman Daftar Siswa**
![Daftar Siswa](./page/assets/img/daftarsiswa.png)

**Form Tambah/Ubah Siswa**
![Form Siswa](./page/assets/img/formadd.png)

**Mode Gelap**
![Dark Mode](./page/assets/img/modegelap.png)

## 8. Identitas Pembuat

- **Nama:** Muhammad Farel Andriani
- **Kelas:** 12 RPL
- **Jurusan:** Rekayasa Perangkat Lunak
- **Proyek:** Tugas REST API — Student Management System

---

## Output

**Link GitHub:** https://github.com/MUFArd/student-management-rest-api

**Screenshot Frontend:**

![Daftar Siswa](./page/assets/img/daftarsiswa.png)
![Form Siswa](./page/assets/img/formadd.png)
![Dark Mode](./page/assets/img/modegelap.png)

**Screenshot Pengujian REST API:**

![GetSiswaAll](./page/assets/img/getsiswaall.png)
![GetSiswaById](./page/assets/img/getsiswabyid.png)
![CreateSiswa](./page/assets/img/createsiswa.png)
![UpdateSiswa](./page/assets/img/updatesiswa.png)
![DeleteSiswa](./page/assets/img/deletesiswa.png)