# AGENT.MD — SPBP Mobile POS & Fuel Monitoring (Flutter)

Dokumen panduan, spesifikasi arsitektur, desain sistem, dan instruksi AI Agent untuk pengembangan aplikasi **Mobile Flutter SPBP (Stasiun Pengisian Bahan Bakar Polri) Manokwari — Polda Papua Barat**.

> [!NOTE]
> **Batasan Ruang Lingkup (Scope):**
> Aplikasi mobile ini difokuskan **HANYA** pada 2 modul utama:
> 1. **Authentication / Login Module**
> 2. **POS (Point of Sale) Dispenser Terminal Module** (Identifikasi RFID, Dispenser & Nozzle, Kalkulator Volume/Nominal, Validasi Kuota, Cetak Struk Thermal, Riwayat & VOID).

---

## 1. Project Overview & Role Definition

- **Aplikasi:** SPBP Manokwari Mobile POS (Fuel Management System)
- **Target Platform:** Android (Smartphone & Handheld POS Android seperti Sunmi V2/V2 Pro, iMin, Pax), iOS.
- **Pengguna Utama:** Operator SPBP (Petugas Pompa Bensin Dinas Polri) dan Admin Lapangan.
- **Tujuan:** Memvalidasi alokasi BBM jatah dinas kepolisian secara real-time melalui kartu RFID/NFC, mencegah over-quota atau ketidakcocokan jenis BBM, mencatat transaksi pengisian BBM ke backend, serta mencetak struk thermal resmi.

---

## 2. Design System & Visual Guidelines

Aplikasi mengadopsi tema **Polri & Pertamina Modern Executive**:

### Palet Warna (Color Palette)
| Token | Hex Code | Penggunaan |
|---|---|---|
| **Primary Navy** | `#1E3A5F` | Header, Brand Gradient Start, Kartu RFID |
| **Primary Blue** | `#2563EB` | Brand Gradient End, Active Tab, Primary Button, Accent |
| **Success Emerald** | `#10B981` | Tombol Eksekusi Transaksi, Status Active, Sisa Kuota |
| **Warning Amber** | `#F59E0B` | Status Alert, Warning BBM Mismatch, Notifikasi Kuota Kritis |
| **Danger Crimson** | `#EF4444` | Status Blocked/Suspended, Tombol VOID, Error State |
| **Surface Slate Dark** | `#0F172A` / `#1E293B` | POS Display Kalkulator, Info Card RFID, Dark Panel |
| **Background Light** | `#F4F6F9` | Latar Belakang Aplikasi |
| **Card White** | `#FFFFFF` | Latar Belakang Kartu Konten |
| **Border Slate** | `#E2E8F0` / `#CBD5E1` | Border Kartu dan Input Field |
| **Text Dark** | `#0F172A` | Teks Utama Heading & Body |
| **Text Muted** | `#64748B` / `#94A3B8` | Label, Placeholder, Subtitle |

### Tipografi
- **Font Utama:** `Inter` (Google Fonts)
- **Font Angka / Display / Struk:** `JetBrains Mono` / `Courier Prime` (Monospace untuk angka kalkulator, kode kartu, jam, dan struk thermal)

---

## 3. Recommended Flutter Architecture & Tech Stack

```
lib/
├── core/
│   ├── constants/        # App colors, styles, dimensions, API endpoints
│   ├── network/          # Dio client, Interceptor (JWT Bearer Token), Error handlers
│   ├── storage/          # FlutterSecureStorage / SharedPreferences (Token & Session)
│   ├── theme/            # ThemeData (Light & Dark), ColorScheme, Custom styles
│   └── utils/            # Currency formatter, Date formatter, Thermal print helpers
├── features/
│   ├── auth/
│   │   ├── data/         # AuthRepository, AuthRemoteDataSource, AuthModels
│   │   ├── presentation/ # LoginScreen, LoginController/Notifier, Widgets
│   │   └── domain/       # User entity, LoginUseCase
│   └── pos/
│       ├── data/         # PosRepository, PosRemoteDataSource, PosModels
│       ├── presentation/ # PosScreen, PosController/Notifier, Widgets:
│       │   ├── widgets/
│       │   │   ├── pos_header.dart          # Jam digital, Operator, Shift selector
│       │   │   ├── pos_kpi_summary.dart     # Total Trx, Volume L, Nilai Rp
│       │   │   ├── pump_nozzle_selector.dart# Pilihan Dispenser & Nozzle
│       │   │   ├── rfid_card_panel.dart     # Search card, NFC Scan, Detail Kuota
│       │   │   ├── pos_calculator.dart      # Input Liter/Rupiah, Keypad, Preset buttons
│       │   │   ├── receipt_dialog.dart      # Modal preview struk & thermal print
│       │   │   ├── void_dialog.dart         # Modal pembatalan VOID dengan alasan
│       │   │   └── pos_history_table.dart   # Riwayat transaksi shift ini
│       └── domain/       # PosEntities, ExecuteTransactionUseCase, VoidUseCase
└── shared/
    ├── widgets/          # CustomCard, CustomBadge, PrimaryButton, LoadingOverlay, Toast
    └── models/           # Common API Response models (ApiResponse, ApiListResponse)
```

### Dependencies yang Direkomendasikan (`pubspec.yaml`)
```yaml
dependencies:
  flutter:
    sdk: flutter
  # State Management & DI
  flutter_riverpod: ^2.5.1
  # Routing
  go_router: ^14.2.0
  # Network & JSON
  dio: ^5.4.3+1
  json_annotation: ^4.9.0
  # Local Storage & Security
  flutter_secure_storage: ^9.2.2
  shared_preferences: ^2.2.3
  # UI & Icons
  lucide_icons: ^0.257.0 # atau phosphor_flutter / cupertino_icons
  google_fonts: ^6.2.1
  intl: ^0.19.0
  # Hardware & POS Device Integration
  nfc_manager: ^3.3.0       # Scan RFID/NFC Kartu Dinas
  mobile_scanner: ^5.1.1    # QR/Barcode Scanner
  blue_thermal_printer: ^1.2.3 # Cetak Struk ke Mini POS Printer Bluetooth (58mm/80mm)
  esc_pos_utils_plus: ^2.0.3   # Generator Byte ESC/POS Struk Kasir
```

---

## 4. Spesifikasi Modul 1: Login / Authentication

### 4.1 UI & Layout Specification
- **Header:**
  - Icon SPBP (`Fuel` Icon) dalam box rounded bersudut halus dengan gradient `#1E3A5F` -> `#2563EB`.
  - Judul: **SPBP Manokwari** (Font size: 22, weight: Light/Semibold).
  - Subtitle: **Fuel Monitoring & Management System**.
  - Badge Organisasi: **Polda Papua Barat** (Muted text).
- **Form Card:**
  - Card putih dengan border halus (`#E2E8F0`) dan shadow soft.
  - Heading: **Masuk ke Sistem**.
  - Input Username:
    - Label: "Username"
    - Placeholder: "mis. ADMIN01"
    - Prefix icon user.
  - Input Password:
    - Label: "Password"
    - Placeholder: "••••••••"
    - Suffix icon: Toggle Eye / Eye-off untuk intip password.
  - Error Alert Banner:
    - Ditampilkan jika kredensial salah atau jaringan offline (Background `#FEF2F2`, border `#FECACA`, text `#B91C1C`).
  - Tombol Submit (Masuk):
    - Background Gradient: `#1E3A5F` -> `#2563EB`.
    - Loading indicator saat memverifikasi API.
  - Footer Hint:
    - "Default login: ADMIN01 / Admin@2026"
  - Copyright:
    - "© 2026 SPBP Polda Papua Barat — Fuel Management System v1.0"

### 4.2 Authentication Flow & API Contract
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "username": "ADMIN01",
    "password": "Admin@2026"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "USR-001",
        "name": "Bripka Ahmad Fauzi",
        "username": "ADMIN01",
        "email": "ahmad.fauzi@papuabarat.polri.go.id",
        "role": "OPERATOR",
        "status": "ACTIVE",
        "unit": "Logistik Polda"
      }
    }
  }
  ```
- **Session Handling:**
  - Simpan `token` ke `FlutterSecureStorage`.
  - Simpan objek `user` ke lokal.
  - Pasang header `Authorization: Bearer <token>` pada setiap request Dio selanjutnya.
  - Cek endpoint `GET /api/auth/me` pada splash screen untuk auto-login jika token masih valid.

---

## 5. Spesifikasi Modul 2: POS Terminal Dispenser

### 5.1 Header & Session Bar
1. **Logo & Terminal Title:**
   - Judul: "POS Terminal Dispenser SPBP"
   - Subtitle: "Stasiun Pengisian Bahan Bakar Polri • Polda Papua Barat"
   - Status Badge: `API INTEGRATED` (Hijau/Emerald).
2. **Session Controls:**
   - **Operator Selector Dropdown:** Mengambil daftar user dari `GET /api/master/users` (Filter role: `OPERATOR` / `ADMIN`).
   - **Shift Selector Dropdown:**
     - `Shift 1 - Pagi (06:00 - 14:00)`
     - `Shift 2 - Siang (14:00 - 22:00)`
     - `Shift 3 - Malam (22:00 - 06:00)`
   - **Tombol Refresh Data:** Muat ulang data API (Pumps, Nozzles, Products, Cards, Transactions).
   - **Live Digital Clock:** Format `HH:mm:ss` (Waktu lokal WIT / Indonesia Timur).

### 5.2 KPI Summary Cards (Session Metrics)
Empat kartu metrik ringkas di bagian atas/dashboard POS:
1. **Total Transaksi:** Jumlah transaksi sukses pada shift aktif (misal: `12 Trx`).
2. **Volume Disalurkan:** Total liter yang telah didistribusikan (misal: `340.5 Liter`).
3. **Nilai Transaksi:** Valuasi alokasi BBM dalam Rupiah (misal: `Rp 4.256.250`).
4. **Dispenser Terpilih:** Status pompa & nozzle yang aktif (misal: `P1-N1 • Pertamax • Rp 12.500/L`).

---

### 5.3 Step 1: Pemilihan Dispenser & Nozzle
- **Dispenser Selector (Grid/Segmented):**
  - Mengambil data dari `GET /api/pumps`.
  - Menampilkan Dispenser 1, Dispenser 2, dst. dengan info lokasi ("Pulau SPBP Utama").
  - Menyorot dispenser yang sedang dipilih.
- **Nozzle BBM List:**
  - Mengambil data dari `GET /api/pumps/nozzles`.
  - Menampilkan nomor Nozzle (N1, N2, N3, N4).
  - Nama Produk BBM (Solar B35, Pertamax, Pertalite, Dexlite).
  - Harga per Liter resmi (misal: `Rp 12.000 / Liter`).
  - Badge Status (`ACTIVE` / `MAINTENANCE`).
  - Ketika nozzle dipilih, otomatis mengupdate harga acuan untuk perhitungan transaksi.

---

### 5.4 Step 2: Identifikasi Kartu RFID & Validasi Kuota
- **Metode Pencarian & Scan:**
  1. **Autocomplete / Search Input:** Input teks untuk mencari Nomor Kartu, Nama Pemegang (Personel), Satuan Kerja (Satker), atau Nomor Polisi Kendaraan Dinas.
  2. **Scan RFID / NFC:** Tombol scan memanfaatkan sensor NFC ponsel/POS atau scan Barcode/QR pada kartu fisik.
- **Tampilan Kartu Terpilih (Dark Card Executive Container):**
  - **Nomor Kartu:** `#RFID-POL-2026-001` (Font Mono Emerald).
  - **Status Badge:** `ACTIVE` (Hijau) / `BLOCKED` (Merah) / `SUSPENDED` (Kuning).
  - **Nama Pemegang:** Misal "Kompol Budi Santoso, S.I.K."
  - **Satuan Kerja / Unit:** Misal "Dit Reskrimum Polda PB"
  - **Plat Kendaraan Dinas:** Misal "PB 1234 XX"
  - **BBM Terdaftar:** Misal "Pertamax" / "Solar" / "Semua"
  - **Gauge Sisa Kuota Bulanan:**
    - Diambil dari `GET /api/cards/{id}/quota`.
    - Menampilkan: **Sisa Kuota (L)**, **Terpakai (L)**, dan **Alokasi Total (L)**.
    - Progress bar visual (Warna Hijau jika kuota cukup, Kuning jika < 20%, Merah jika habis).

---

### 5.5 Step 3: Kalkulator Pengisian & Eksekusi Transaksi
- **Mode Input Toggle:**
  - **LITER (Volume Mode)**
  - **RUPIAH (Nominal Mode)**
- **Interactive Display & Kalkulasi Real-time:**
  - Rumus: $\text{Total Rupiah} = \text{Volume (L)} \times \text{Harga Satuan}$
  - Rumus: $\text{Volume (L)} = \frac{\text{Total Rupiah}}{\text{Harga Satuan}}$
  - Input field besar dengan font monospaced.
- **Preset Quick Buttons:**
  - **Preset Volume (Liter):** `5 L`, `10 L`, `15 L`, `20 L`, `25 L`, `30 L`, `40 L`, `50 L`.
  - **Preset Nominal (Rupiah):** `50rb`, `100rb`, `150rb`, `200rb`, `300rb`, `500rb`.
  - **Tombol Pintas "Isi Sisa Kuota":** Otomatis memasukkan angka persis sisa kuota yang tersedia di kartu.
- **Aturan Validasi Ketat (Business Rules):**
  1. Kartu dinas **wajib** dipilih.
  2. Status kartu harus `ACTIVE` (Tolak jika `BLOCKED` atau `SUSPENDED`).
  3. **Kesesuaian BBM:** Jenis BBM kartu harus cocok dengan BBM nozzle yang dipilih (contoh: Kartu Solar ditolak jika memilih nozzle Pertamax).
  4. Volume pengisian harus $> 0\text{ Liter}$.
  5. Volume pengisian **tidak boleh melebihi sisa kuota kartu**.
- **Alert Banner Validasi:** Menampilkan pesan peringatan warna kuning/merah jika salah satu syarat di atas tidak terpenuhi.
- **Tombol Eksekusi:**
  - Warna: Hijau Emerald (`#10B981`).
  - Label: `PROSES TRANSAKSI (X.XX L)`.
  - Disabled jika validasi gagal.
  - Menampilkan loading spinner saat request berlangsung.

---

### 5.6 Step 4: Struk Pengisian (Digital Receipt) & Thermal Printing
Setelah transaksi berhasil disimpan via API:
1. **Tampilkan Dialog Struk Resmi:**
   - **Header:**
     ```
     KEPOLISIAN NEGARA REPUBLIK INDONESIA
     DAERAH PAPUA BARAT
     STASIUN PENGISIAN BAHAN BAKAR POLRI (SPBP)
     Jl. Pahlawan No. 01, Manokwari • Papua Barat
     ```
   - **Informasi Transaksi:**
     - No. Transaksi (ID): `TRX-XXXXXXXX`
     - Waktu & Tanggal
     - Dispenser & Nozzle: `P1 / N1`
     - Operator & Shift
     - No. Kartu RFID, Pemegang, Satker, No. Polisi Kendaraan
     - Produk BBM & Harga/L
     - **Volume Terisi (L)** & **Total Valuasi (Rp)**
     - Sisa Kuota Sebelum & Sesudah Transaksi
   - **Footer:**
     ```
     *** PENGISIAN RESMI DINAS POLRI ***
     TERIMA KASIH - TETAP SEMANGAT BERTUGAS
     ```
2. **Action Buttons:**
   - **Cetak Struk (Thermal Print):** Mengirim format teks / byte ESC-POS ke printer bluetooth (58mm / 80mm).
   - **Selesai / Tutup:** Reset form input untuk transaksi berikutnya dan perbarui sisa kuota.

---

### 5.7 Step 5: Riwayat Transaksi Shift Ini & Fitur VOID
- **List / Card Riwayat Transaksi:**
  - Mengambil data dari `GET /api/transactions` (Filter limit: 50).
  - Search filter: ID Transaksi, No. Kartu, Nama Pemegang, Plat Nomor.
  - Filter Status: `ALL`, `SUCCESS`, `VOID`.
- **Aksi Tiap Baris/Item:**
  1. **Cetak Ulang Struk:** Buka modal struk thermal.
  2. **Batalkan Transaksi (VOID):**
     - Hanya aktif untuk transaksi berstatus `SUCCESS`.
     - Membuka modal konfirmasi VOID dengan **wajib memasukkan Alasan Pembatalan**.
     - Memanggil endpoint `POST /api/transactions/{id}/void`.
     - Otomatis mengembalikan kuota kartu yang sempat terpotong.

---

## 6. Spesifikasi API Endpoints & Data Contracts

### 6.1 Authentication
- `POST /api/auth/login` — Login user/operator.
- `GET /api/auth/me` — Ambil profil user yang sedang login.
- `POST /api/auth/logout` — Logout user.

### 6.2 Master Data & POS Dependencies
- `GET /api/master/users` — Daftar operator SPBP.
- `GET /api/master/products` — Daftar jenis BBM (Solar, Pertamax, dll) dan harga terkini.
- `GET /api/pumps` — Daftar dispenser SPBP.
- `GET /api/pumps/nozzles` — Daftar nozzle per dispenser.
- `GET /api/cards?limit=100` — Daftar kartu dinas RFID.
- `GET /api/cards/{id}/quota` — Sisa kuota real-time untuk kartu tertentu.

### 6.3 Transaksi POS
- `GET /api/transactions?limit=50` — Riwayat transaksi terkini.
- `POST /api/transactions` — Catat transaksi pengisian baru.
  **Request Payload:**
  ```json
  {
    "card_number": "POL-2026-001",
    "product_id": "PROD-PERTAMAX",
    "volume_l": 25.0,
    "nozzle_id": "NOZ-01",
    "pump_id": "PUMP-01",
    "shift": "PAGI",
    "source": "MOBILE_POS",
    "transaction_time": "2026-08-18T23:15:00.000Z"
  }
  ```
  **Response Success:**
  ```json
  {
    "success": true,
    "data": {
      "id": "TRX-20260818-0042",
      "status": "SUCCESS"
    }
  }
  ```
- `POST /api/transactions/{id}/void` — Batalkan transaksi pengisian.
  **Request Payload:**
  ```json
  {
    "reason": "Salah input dispenser oleh operator"
  }
  ```

---

## 7. Model Data Utama (Dart Data Classes)

```dart
// User
class UserModel {
  final String id;
  final String name;
  final String username;
  final String role;
  final String? unit;

  UserModel({required this.id, required this.name, required this.username, required this.role, this.unit});
  factory UserModel.fromJson(Map<String, dynamic> json) => ...;
}

// Product (BBM)
class ProductModel {
  final String id;
  final String code;
  final String name;
  final double currentPrice;

  ProductModel({required this.id, required this.code, required this.name, required this.currentPrice});
  factory ProductModel.fromJson(Map<String, dynamic> json) => ...;
}

// Pump (Dispenser)
class PumpModel {
  final String id;
  final String number;
  final String? location;

  PumpModel({required this.id, required this.number, this.location});
  factory PumpModel.fromJson(Map<String, dynamic> json) => ...;
}

// Nozzle
class NozzleModel {
  final String id;
  final String pumpId;
  final String pumpNumber;
  final String number;
  final String productId;
  final String productName;
  final String status;

  NozzleModel({required this.id, required this.pumpId, required this.pumpNumber, required this.number, required this.productId, required this.productName, required this.status});
  factory NozzleModel.fromJson(Map<String, dynamic> json) => ...;
}

// RFID Card
class CardModel {
  final String id;
  final String cardNumber;
  final String holderName;
  final String unitName;
  final String policeNumber;
  final String fuelType;
  final String status; // ACTIVE, BLOCKED, SUSPENDED
  final double allocated;
  final double used;
  final double remaining;

  CardModel({...});
  factory CardModel.fromJson(Map<String, dynamic> json) => ...;
}

// Card Quota
class CardQuotaModel {
  final String id;
  final String cardId;
  final double allocatedL;
  final double usedL;
  final double remainingL;

  CardQuotaModel({...});
  factory CardQuotaModel.fromJson(Map<String, dynamic> json) => ...;
}

// Transaction
class TransactionModel {
  final String id;
  final String? cardNumber;
  final String? holderName;
  final String? unitName;
  final String? policeNumber;
  final String? productName;
  final double volumeL;
  final double pricePerUnit;
  final double totalAmount;
  final String? pumpNumber;
  final String? nozzleNumber;
  final String? operatorName;
  final String? shift;
  final String status; // SUCCESS, VOID
  final String? transactionTime;
  final double? quotaBefore;
  final double? quotaDeducted;
  final double? quotaAfter;

  TransactionModel({...});
  factory TransactionModel.fromJson(Map<String, dynamic> json) => ...;
}
```

---

## 8. Panduan Khusus Perangkat POS Handheld & Offline Usability

1. **Optimalisasi Layar & Visibilitas Lapangan:**
   - Karena SPBP berlokasi di area luar ruangan (outdoor dispenser pulau), gunakan tingkat kontras yang tinggi (teks hitam tegas di atas putih dan panel gelap dengan angka hijau terang).
   - Ukuran touch target tombol minimal `48x48 dp` untuk kemudahan operator bersarung tangan.
2. **Haptic Feedback:**
   - Berikan `HapticFeedback.lightImpact()` pada setiap ketukan tombol preset dan tombol submit untuk konfirmasi fisik.
3. **Double Submission Prevention:**
   - Kunci tombol submit (`submitting == true`) segera setelah ditekan untuk mencegah duplikasi pemotongan kuota.
4. **Thermal Printer Format (ESC/POS 58mm):**
   - Lebar karakter standar 32 karakter per baris (58mm) atau 48 karakter (80mm).
   - Gunakan pemisah garis putus-putus `--------------------------------`.

---

## 9. Aturan & Perilaku untuk AI Agent saat Menulis Kode Flutter

1. **Fokus Kode:** Jangan menambahkan fitur di luar Login dan POS (seperti Manajemen Stok, Kalibrasi Tangki, Audit Log, User CRUD, dll) kecuali jika secara eksplisit diminta.
2. **Clean Code & Null Safety:** Seluruh kode Dart wajib mengaktifkan Null Safety penuh tanpa casting `any` atau `as dynamic` yang tidak aman.
3. **State Management:** Pisahkan antara UI Widget dengan Business Logic (Gunakan StateNotifier / Riverpod / Cubit / ChangeNotifier).
4. **Error Handling Terisolasi:** Tangani kegagalan koneksi jaringan dengan SnackBar/Toast yang ramah pengguna berbahasa Indonesia.
