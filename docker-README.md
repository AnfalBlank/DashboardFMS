# 🐳 Docker Deployment Guide — Fuel Monitoring Frontend (Next.js)

Panduan deployment dan manajemen container Docker untuk **Fuel Monitoring & Management Dashboard (Next.js 16 + React 19)**.

---

## 📋 Daftar Isi
- [Arsitektur & Spesifikasi](#-arsitektur--spesifikasi)
- [Prasyarat](#-prasyarat)
- [Build Arguments & Environment Variables](#-build-arguments--environment-variables)
- [Menjalankan dengan Docker Compose](#-menjalankan-dengan-docker-compose-rekomendasi)
- [Menjalankan Standalone Container](#-menjalankan-standalone-container)
- [Manajemen & Monitoring](#-manajemen--monitoring)
- [Troubleshooting & Tips](#-troubleshooting--tips)

---

## 🏗️ Arsitektur & Spesifikasi

- **Base Image:** `node:20-alpine` dengan `libc6-compat`
- **Metode Build:** 3-Stage Multi-stage Build (`deps` ➔ `builder` ➔ `runner`)
- **Keamanan:** Menjalankan aplikasi dengan user non-root (`nextjs:nodejs` UID/GID: `1001`)
- **Telemetry:** `NEXT_TELEMETRY_DISABLED=1` (Dinonaktifkan untuk performa dan privasi)
- **Port Default:** `4001`
- **Host Binding:** `0.0.0.0` (Mendukung akses LAN / Reverse Proxy)

---

## ⚙️ Prasyarat

- Docker Engine versi `>= 24.0.0`
- Docker Compose versi `>= 2.20.0`

---

## 📝 Build Arguments & Environment Variables

| Variabel / Argumen | Tipe | Deskripsi | Default / Contoh |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Build ARG / ENV | URL backend API yang diakses browser | `http://localhost:4000` |
| `PORT` | Environment | Port web server Next.js | `4001` |
| `HOSTNAME` | Environment | Host listening IP | `0.0.0.0` |
| `NODE_ENV` | Environment | Mode environment | `production` |

> ⚠️ **Penting untuk Next.js (`NEXT_PUBLIC_*`)**:
> Variabel dengan awalan `NEXT_PUBLIC_` di-embed ke dalam JavaScript bundle saat proses **build** (bukan saat runtime). Oleh karena itu, jika target API URL berubah, image harus di-build ulang dengan `--build-arg NEXT_PUBLIC_API_URL=...`.

---

## 🚀 Menjalankan dengan Docker Compose (Rekomendasi)

Jalankan langsung dari folder `backend` yang memuat `docker-compose.yml`:

```bash
cd "f:\project\pertamina\Dashboar Monitoring Fuel\backend"

# Build & jalankan Frontend dan Backend bersamaan
docker compose up -d --build

# Pantau log Frontend
docker compose logs -f frontend

# Hentikan semua service
docker compose down
```

---

## 🛠️ Menjalankan Standalone Container

Jika ingin mem-build dan menjalankan frontend secara terpisah:

### 1. Build Image
```bash
cd "f:\project\pertamina\Dashboar Monitoring Fuel\fuel-monitoring"

# Build dengan default API URL (http://localhost:4000)
docker build -t fuel-frontend:latest .

# ATAU build dengan custom API URL (misal untuk server IP / domain)
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://192.168.1.100:4000 \
  -t fuel-frontend:latest .
```

### 2. Jalankan Container
```bash
docker run -d \
  --name fuel-frontend \
  -p 4001:4001 \
  -e PORT=4001 \
  --restart unless-stopped \
  fuel-frontend:latest
```

### 3. Buka di Browser
Akses dashboard di: `http://localhost:4001`

---

## 📊 Manajemen & Monitoring

### Melihat Log Realtime
```bash
docker logs -f --tail 100 fuel-frontend
```

### Masuk ke Shell Container
```bash
docker exec -it fuel-frontend sh
```

### Restart Container
```bash
docker restart fuel-frontend
```

### Hapus & Reset Container
```bash
docker stop fuel-frontend
docker rm fuel-frontend
```

---

## 🔍 Troubleshooting & Tips

### 1. Request API gagal (`Network Error` / `CORS Error`)
- Periksa nilai `NEXT_PUBLIC_API_URL`. Jika diakses dari browser komputer lain di jaringan LAN, `localhost:4000` tidak akan bekerja dari perangkat client. Build ulang dengan IP LAN server:
  ```bash
  docker build --build-arg NEXT_PUBLIC_API_URL=http://<IP_SERVER>:4000 -t fuel-frontend:latest .
  ```
- Pastikan `CORS_ORIGIN` pada backend mengizinkan origin frontend (`http://<IP_SERVER>:4001`).

### 2. Port 4001 sudah digunakan
- Ubah port mapping saat menjalankan container: `-p 4005:4001`
- Dashboard akan dapat diakses melalui `http://localhost:4005`.
