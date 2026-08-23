# 🐳 Docker Deployment Guide — Fuel Monitoring Backend (NestJS)

Panduan deployment dan manajemen container Docker untuk **Fuel Monitoring & Management Backend API (NestJS)**.

---

## 📋 Daftar Isi
- [Arsitektur & Spesifikasi](#-arsitektur--spesifikasi)
- [Prasyarat](#-prasyarat)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Menjalankan dengan Docker Compose](#-menjalankan-dengan-docker-compose-rekomendasi)
- [Menjalankan Standalone Container](#-menjalankan-standalone-container)
- [Manajemen & Monitoring](#-manajemen--monitoring)
- [Troubleshooting & Solusi](#-troubleshooting--solusi)

---

## 🏗️ Arsitektur & Spesifikasi

- **Base Image:** `node:20-alpine` (Ringan & Cepat)
- **Metode Build:** Multi-stage Build (`builder` ➔ `runner`)
- **Keamanan:** Menjalankan aplikasi dengan user non-root (`nestjs:nodejs` UID/GID: `1001`)
- **Ukuran Image:** Minimalis (hanya menyertakan compiled `dist/` dan production dependencies `npm ci --omit=dev`)
- **Port Default:** `4000`

---

## ⚙️ Prasyarat

- Docker Engine versi `>= 24.0.0`
- Docker Compose versi `>= 2.20.0`
- File `.env` yang sudah disiapkan dari template `.env.example`

---

## 📝 Konfigurasi Environment

Sebelum menjalankan container, pastikan file `.env` sudah dibuat di direktori root backend:

```bash
cp .env.example .env
```

### Variabel Utama `.env`:

| Variabel | Deskripsi | Default / Contoh |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment aplikasi | `production` |
| `PORT` | Port internal aplikasi | `4000` |
| `DB_HOST` | Host MySQL database *(Gunakan `host.docker.internal` jika DB di host machine)* | `host.docker.internal` atau `localhost` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_USER` | Username database | `root` |
| `DB_PASS` | Password database | `password` |
| `DB_NAME` | Nama database utama | `fuel_monitoring` |
| `JWT_SECRET` | Secret key JWT Token | *(string rahasia)* |
| `CORS_ORIGIN` | Domain frontend yang diizinkan | `http://localhost:3000,http://localhost:4001` |

> 💡 **Catatan untuk Windows/macOS**: Jika database MySQL berjalan langsung di komputer lokal (bukan di dalam docker network), ubah `DB_HOST=host.docker.internal` di `.env`.

---

## 🚀 Menjalankan dengan Docker Compose (Rekomendasi)

Orkestrasi bersama Frontend Next.js diatur dalam `docker-compose.yml`:

```bash
# 1. Jalankan dan build semua container di latar belakang (daemon)
docker compose up -d --build

# 2. Periksa status container
docker compose ps

# 3. Pantau log real-time
docker compose logs -f backend

# 4. Hentikan container
docker compose down
```

---

## 🛠️ Menjalankan Standalone Container

Jika ingin mem-build dan menjalankan backend secara terpisah tanpa Docker Compose:

### 1. Build Image
```bash
docker build -t fuel-backend:latest .
```

### 2. Jalankan Container
```bash
# Menggunakan file .env
docker run -d \
  --name fuel-backend \
  -p 4000:4000 \
  --env-file .env \
  --restart unless-stopped \
  fuel-backend:latest
```

### 3. Akses Swagger API Docs
Buka di browser: `http://localhost:4000/api/docs`

---

## 📊 Manajemen & Monitoring

### Melihat Log Aplikasi
```bash
# Realtime log tail 100 baris
docker logs -f --tail 100 fuel-backend
```

### Masuk ke Shell Container
```bash
docker exec -it fuel-backend sh
```

### Restart Container
```bash
docker restart fuel-backend
```

### Menghapus & Reset Container
```bash
docker stop fuel-backend
docker rm fuel-backend
```

---

## 🔍 Troubleshooting & Solusi

### 1. `ECONNREFUSED` / Database connection failed
- Pastikan MySQL sedang aktif.
- Jika database berjalan di OS host (bukan Docker), ubah konfigurasi di `.env` menjadi:
  ```env
  DB_HOST=host.docker.internal
  ```
- Jika MySQL berjalan di dalam Linux host murni (tanpa Docker Desktop), tambahkan parameter `--add-host=host.docker.internal:host-gateway`.

### 2. Port 4000 sudah digunakan
- Periksa proses lokal: `netstat -ano | findstr :4000` (Windows)
- Ganti mapping port di command atau `docker-compose.yml`, misalnya: `"4005:4000"`

### 3. Izin File Logs
Container menggunakan user non-root `nestjs`. Folder `logs/` otomatis dibuat dan dimiliki oleh user `nestjs` di dalam container.
