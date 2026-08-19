const fs = require('fs');
const path = require('path');

const collection = {
  info: {
    _postman_id: "e4a781b2-297d-4e9f-9c04-586b62d80d19",
    name: "Fuel Monitoring & Management API (SPBP Polda Papua Barat)",
    description: "Koleksi Postman lengkap untuk Backend API Sistem Monitoring BBM (SPBP Polda Papua Barat) berbasis NestJS, TypeORM, MySQL, dan Hardware Controller Integration.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  auth: {
    type: "bearer",
    bearer: [
      {
        key: "token",
        value: "{{token}}",
        type: "string"
      }
    ]
  },
  variable: [
    {
      key: "baseUrl",
      value: "http://localhost:4000",
      type: "string",
      description: "Host URL backend API"
    },
    {
      key: "token",
      value: "",
      type: "string",
      description: "JWT Bearer Token (otomatis terisi saat Login berhasil)"
    },
    {
      key: "controller_secret",
      value: "spbp-controller-2026",
      type: "string",
      description: "Shared secret key untuk autentikasi hardware dispenser controller"
    },
    {
      key: "fms_base_url",
      value: "http://192.168.1.100/api",
      type: "string",
      description: "Target URL Forecourt Controller API (CodeIgniter 3)"
    }
  ],
  item: [
    // ════════════════════ 00. Health Check ════════════════════
    {
      name: "00. Health Check",
      item: [
        {
          name: "Health Check",
          request: {
            auth: { type: "noauth" },
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/health",
              host: ["{{baseUrl}}"],
              path: ["health"]
            },
            description: "Memeriksa status operasional service backend API."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 01. Authentication ════════════════════
    {
      name: "01. Authentication",
      item: [
        {
          name: "Login User",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "if (pm.response.code === 200) {",
                  "    var json = pm.response.json();",
                  "    if (json && json.data && json.data.token) {",
                  "        pm.collectionVariables.set('token', json.data.token);",
                  "        console.log('✓ JWT Token successfully saved to collection variable: token');",
                  "    }",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            auth: { type: "noauth" },
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                username: "ADMIN01",
                password: "Admin@2026"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/auth/login",
              host: ["{{baseUrl}}"],
              path: ["api", "auth", "login"]
            },
            description: "Login untuk mendapatkan JWT token otorisasi. Token akan otomatis disimpan ke variable collection."
          },
          response: []
        },
        {
          name: "Get Current Profile (Me)",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/auth/me",
              host: ["{{baseUrl}}"],
              path: ["api", "auth", "me"]
            },
            description: "Mendapatkan profil dan role pengguna yang sedang login."
          },
          response: []
        },
        {
          name: "Change Password",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                currentPassword: "Admin@2026",
                newPassword: "NewAdmin@2026"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/auth/change-password",
              host: ["{{baseUrl}}"],
              path: ["api", "auth", "change-password"]
            },
            description: "Mengubah password pengguna saat ini."
          },
          response: []
        },
        {
          name: "Logout User",
          request: {
            method: "POST",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/auth/logout",
              host: ["{{baseUrl}}"],
              path: ["api", "auth", "logout"]
            },
            description: "Logout user dan mencatat ke audit trail."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 02. Dashboard ════════════════════
    {
      name: "02. Dashboard",
      item: [
        {
          name: "Get Dashboard Summary",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/dashboard",
              host: ["{{baseUrl}}"],
              path: ["api", "dashboard"]
            },
            description: "Mendapatkan metrik ringkasan KPI dashboard (stok aktif, transaksi hari ini, pemakaian kuota, alert)."
          },
          response: []
        },
        {
          name: "Get Active Alerts",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/dashboard/alerts",
              host: ["{{baseUrl}}"],
              path: ["api", "dashboard", "alerts"]
            },
            description: "Mendapatkan daftar peringatan aktif (stok kritis, kuota habis, selisih totalizer)."
          },
          response: []
        },
        {
          name: "Mark Alert as Read",
          request: {
            method: "POST",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/dashboard/alerts/:id/read",
              host: ["{{baseUrl}}"],
              path: ["api", "dashboard", "alerts", ":id", "read"],
              variable: [
                {
                  key: "id",
                  value: "alt-01",
                  description: "Alert ID"
                }
              ]
            },
            description: "Menandai notifikasi alert sebagai sudah dibaca."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 03. Transactions ════════════════════
    {
      name: "03. Transactions",
      item: [
        {
          name: "List Transactions",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/transactions?card=&unit=&product=&status=&from=&to=&limit=50&offset=0",
              host: ["{{baseUrl}}"],
              path: ["api", "transactions"],
              query: [
                { key: "card", value: "", description: "Filter nomor kartu / RFID UID" },
                { key: "unit", value: "", description: "Filter ID Satuan Kerja / Unit" },
                { key: "product", value: "", description: "Filter ID Produk BBM (e.g. prod-ptx)" },
                { key: "status", value: "", description: "Filter status: SUCCESS / VOID / REJECTED" },
                { key: "from", value: "", description: "Tanggal mulai (YYYY-MM-DD)" },
                { key: "to", value: "", description: "Tanggal akhir (YYYY-MM-DD)" },
                { key: "limit", value: "50", description: "Jumlah limit per halaman" },
                { key: "offset", value: "0", description: "Offset pagination" }
              ]
            },
            description: "Mendapatkan riwayat transaksi penyaluran BBM dengan filter dan pagination."
          },
          response: []
        },
        {
          name: "Get Transaction by ID",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/transactions/:id",
              host: ["{{baseUrl}}"],
              path: ["api", "transactions", ":id"],
              variable: [
                {
                  key: "id",
                  value: "tx-01",
                  description: "Transaction ID"
                }
              ]
            },
            description: "Mendapatkan detail lengkap satu transaksi berdasarkan ID."
          },
          response: []
        },
        {
          name: "Create Transaction (Manual / API)",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                card_number: "CRD-2026-001",
                product_id: "prod-ptx",
                nozzle_id: "nzl-01-1",
                pump_id: "pump-01",
                volume_l: 45.5,
                shift: "PAGI",
                totalizer_before: 12500.5,
                totalizer_after: 12546.0,
                source: "MANUAL",
                transaction_time: "2026-08-17T10:30:00.000Z"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/transactions",
              host: ["{{baseUrl}}"],
              path: ["api", "transactions"]
            },
            description: "Mencatat transaksi pengisian BBM manual oleh operator SPBP."
          },
          response: []
        },
        {
          name: "Void Transaction",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                reason: "Salah input volume transaksi oleh operator"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/transactions/:id/void",
              host: ["{{baseUrl}}"],
              path: ["api", "transactions", ":id", "void"],
              variable: [
                {
                  key: "id",
                  value: "tx-01",
                  description: "Transaction ID"
                }
              ]
            },
            description: "Membatalkan (void) transaksi yang telah berhasil serta memulihkan kuota dan stok terkait."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 04. Cards & RFID ════════════════════
    {
      name: "04. Cards & RFID",
      item: [
        {
          name: "List Cards",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/cards?search=&status=&unit=&limit=100&offset=0",
              host: ["{{baseUrl}}"],
              path: ["api", "cards"],
              query: [
                { key: "search", value: "", description: "Cari nomor kartu, nama pemegang, atau RFID UID" },
                { key: "status", value: "", description: "Status: ACTIVE / BLOCKED / INACTIVE / EXPIRED" },
                { key: "unit", value: "", description: "Filter ID Satuan Kerja" },
                { key: "limit", value: "100", description: "Jumlah limit data" },
                { key: "offset", value: "0", description: "Offset pagination" }
              ]
            },
            description: "Mendapatkan daftar kartu BBM terdaftar."
          },
          response: []
        },
        {
          name: "Get Card Details",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/cards/:id",
              host: ["{{baseUrl}}"],
              path: ["api", "cards", ":id"],
              variable: [
                {
                  key: "id",
                  value: "crd-01",
                  description: "Card ID atau Nomor Kartu"
                }
              ]
            },
            description: "Mendapatkan data detail kartu berdasarkan ID atau Nomor Kartu."
          },
          response: []
        },
        {
          name: "Get Card Transaction History",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/cards/:id/transactions?limit=20&offset=0",
              host: ["{{baseUrl}}"],
              path: ["api", "cards", ":id", "transactions"],
              variable: [
                {
                  key: "id",
                  value: "crd-01",
                  description: "Card ID"
                }
              ],
              query: [
                { key: "limit", value: "20", description: "Limit riwayat transaksi" },
                { key: "offset", value: "0", description: "Offset pagination" }
              ]
            },
            description: "Mendapatkan riwayat transaksi pengisian kartu tertentu."
          },
          response: []
        },
        {
          name: "Get Card Quota Info",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/cards/:id/quota",
              host: ["{{baseUrl}}"],
              path: ["api", "cards", ":id", "quota"],
              variable: [
                {
                  key: "id",
                  value: "crd-01",
                  description: "Card ID"
                }
              ]
            },
            description: "Mendapatkan informasi alokasi dan sisa kuota kartu."
          },
          response: []
        },
        {
          name: "Create Card",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                card_number: "CRD-2026-099",
                card_type: "REGULER",
                holder_name: "Bripka Joko Susilo",
                unit_id: "unit-ditres",
                vehicle_id: "veh-01",
                monthly_limit: 200,
                expiry_date: "2027-12-31",
                activation_date: "2026-01-01",
                rfid_uid: "E28068940000",
                notes: "Kendaraan Dinas Patroli Satker Ditreskrimsus"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/cards",
              host: ["{{baseUrl}}"],
              path: ["api", "cards"]
            },
            description: "Mendaftarkan kartu BBM / RFID baru ke dalam sistem. Jenis bahan bakar (fuel_type) secara otomatis mengikuti kendaraan yang ditautkan (vehicle_id)."
          },
          response: []
        },
        {
          name: "Update Card",
          request: {
            method: "PUT",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                holder_name: "Bripka Joko Susilo Updated",
                unit_id: "unit-ditres",
                vehicle_id: "veh-01",
                monthly_limit: 250,
                notes: "Penyesuaian kuota bulanan operasi dinas"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/cards/:id",
              host: ["{{baseUrl}}"],
              path: ["api", "cards", ":id"],
              variable: [
                {
                  key: "id",
                  value: "crd-01",
                  description: "Card ID"
                }
              ]
            },
            description: "Memperbarui informasi pemegang kartu, batas kuota, atau kendaraan tertaut."
          },
          response: []
        },
        {
          name: "Block Card",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                reason: "Kartu dilaporkan hilang atau rusak oleh pemegang"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/cards/:id/block",
              host: ["{{baseUrl}}"],
              path: ["api", "cards", ":id", "block"],
              variable: [
                {
                  key: "id",
                  value: "crd-01",
                  description: "Card ID"
                }
              ]
            },
            description: "Memblokir kartu BBM sehingga tidak dapat digunakan untuk transaksi dispenser."
          },
          response: []
        },
        {
          name: "Unblock Card",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                reason: "Kartu telah ditemukan kembali dan diverifikasi oleh admin"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/cards/:id/unblock",
              host: ["{{baseUrl}}"],
              path: ["api", "cards", ":id", "unblock"],
              variable: [
                {
                  key: "id",
                  value: "crd-01",
                  description: "Card ID"
                }
              ]
            },
            description: "Membuka blokir kartu BBM yang sebelumnya dinonaktifkan."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 05. Quota Management ════════════════════
    {
      name: "05. Quota Management",
      item: [
        {
          name: "List Card Quotas",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/quota?period_id=&card_id=&unit_id=",
              host: ["{{baseUrl}}"],
              path: ["api", "quota"],
              query: [
                { key: "period_id", value: "", description: "Filter ID Periode Kuota" },
                { key: "card_id", value: "", description: "Filter ID Kartu" },
                { key: "unit_id", value: "", description: "Filter ID Satuan Kerja" }
              ]
            },
            description: "Mendapatkan daftar alokasi kuota kartu per periode berjalan/spesifik."
          },
          response: []
        },
        {
          name: "List Quota Periods",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/quota/periods",
              host: ["{{baseUrl}}"],
              path: ["api", "quota", "periods"]
            },
            description: "Mendapatkan daftar seluruh periode kuota bulanan."
          },
          response: []
        },
        {
          name: "Get Card Quota Ledger",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/quota/ledger/:cardId",
              host: ["{{baseUrl}}"],
              path: ["api", "quota", "ledger", ":cardId"],
              variable: [
                {
                  key: "cardId",
                  value: "crd-01",
                  description: "Card ID"
                }
              ]
            },
            description: "Mendapatkan buku besar mutasi kuota kartu (alokasi, pemakaian transaksi, top-up, void)."
          },
          response: []
        },
        {
          name: "Generate Monthly Quotas",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                period: "August 2026",
                year: 2026,
                month: 8,
                scope: "all"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/quota/generate",
              host: ["{{baseUrl}}"],
              path: ["api", "quota", "generate"]
            },
            description: "Menghasilkan (generate) alokasi kuota bulanan secara massal. Produk BBM otomatis disesuaikan dari master kartu / kendaraan masing-masing, dan volume kuota disesuaikan dari limit kartu (atau default_l jika diberikan)."
          },
          response: []
        },
        {
          name: "Top-up Card Quota",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                card_id: "crd-01",
                amount_l: 50,
                reason: "Tambahan alokasi dinas patroli luar kota"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/quota/topup",
              host: ["{{baseUrl}}"],
              path: ["api", "quota", "topup"]
            },
            description: "Menambahkan kuota darurat/tambahan (top-up) ke kartu tertentu dengan alasan dinas. product_id bersifat opsional karena otomatis diambil dari data kendaraan/kartu."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 06. Tanks & Storage ════════════════════
    {
      name: "06. Tanks & Storage",
      item: [
        {
          name: "List Storage Tanks",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/tanks",
              host: ["{{baseUrl}}"],
              path: ["api", "tanks"]
            },
            description: "Mendapatkan daftar tangki pendam SPBP, kapasitas, volume saat ini, dan level status."
          },
          response: []
        },
        {
          name: "Get Tank Details",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/tanks/:id",
              host: ["{{baseUrl}}"],
              path: ["api", "tanks", ":id"],
              variable: [
                {
                  key: "id",
                  value: "tank-01",
                  description: "Tank ID"
                }
              ]
            },
            description: "Mendapatkan detail spesifik tangki pendam beserta produk yang ditampung."
          },
          response: []
        },
        {
          name: "Get Tank Readings History",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/tanks/:id/readings?limit=50",
              host: ["{{baseUrl}}"],
              path: ["api", "tanks", ":id", "readings"],
              variable: [
                {
                  key: "id",
                  value: "tank-01",
                  description: "Tank ID"
                }
              ],
              query: [
                { key: "limit", value: "50", description: "Jumlah data pembacaan" }
              ]
            },
            description: "Mendapatkan riwayat pembacaan sensor ATG / pengukuran manual tangki."
          },
          response: []
        },
        {
          name: "Push Tank Reading (Sensor / Manual ATG)",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                volume_l: 12500,
                height_cm: 280.5,
                water_level: 0.0,
                temperature: 28.5,
                source: "SENSOR",
                read_at: "2026-08-17T10:00:00.000Z"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/tanks/:id/readings",
              host: ["{{baseUrl}}"],
              path: ["api", "tanks", ":id", "readings"],
              variable: [
                {
                  key: "id",
                  value: "tank-01",
                  description: "Tank ID"
                }
              ]
            },
            description: "Mengirimkan data pengukuran volume, level air, dan suhu tangki dari sensor ATG atau manual."
          },
          response: []
        },
        {
          name: "Update Tank Thresholds / Stock",
          request: {
            method: "PUT",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                current_l: 12000,
                threshold_low: 30,
                threshold_critical: 15,
                threshold_high: 90,
                reason: "Kalibrasi fisik tangki pendam"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/tanks/:id",
              host: ["{{baseUrl}}"],
              path: ["api", "tanks", ":id"],
              variable: [
                {
                  key: "id",
                  value: "tank-01",
                  description: "Tank ID"
                }
              ]
            },
            description: "Memperbarui konfigurasi ambang batas alarm (low, critical, high) atau stok tangki."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 07. Stock & Inventory ════════════════════
    {
      name: "07. Stock & Inventory",
      item: [
        {
          name: "Get Stock Summary",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/stock",
              host: ["{{baseUrl}}"],
              path: ["api", "stock"]
            },
            description: "Mendapatkan ringkasan total stok saat ini per jenis produk BBM."
          },
          response: []
        },
        {
          name: "Get Stock Movements",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/stock/movements?product_id=&from=&to=&limit=50",
              host: ["{{baseUrl}}"],
              path: ["api", "stock", "movements"],
              query: [
                { key: "product_id", value: "", description: "Filter ID Produk BBM" },
                { key: "from", value: "", description: "Tanggal mulai (YYYY-MM-DD)" },
                { key: "to", value: "", description: "Tanggal akhir (YYYY-MM-DD)" },
                { key: "limit", value: "50", description: "Jumlah limit log" }
              ]
            },
            description: "Mendapatkan mutasi log stok BBM (penerimaan, penyaluran, penyesuaian/koreksi)."
          },
          response: []
        },
        {
          name: "Get Deliveries History",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/stock/deliveries",
              host: ["{{baseUrl}}"],
              path: ["api", "stock", "deliveries"]
            },
            description: "Mendapatkan riwayat penerimaan delivery supply BBM dari Pertamina."
          },
          response: []
        },
        {
          name: "Create Fuel Delivery",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                date: "2026-08-17",
                supplier: "PT Pertamina Patra Niaga",
                product_id: "prod-ptx",
                quantity_l: 8000,
                tank_id: "tank-01",
                doc_number: "DO-2026-0881",
                delivery_note: "Penerimaan BBM via Mobil Tangki Pertamina"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/stock/deliveries",
              host: ["{{baseUrl}}"],
              path: ["api", "stock", "deliveries"]
            },
            description: "Mencatat dan mengonfirmasi penerimaan delivery BBM ke tangki pendam SPBP."
          },
          response: []
        },
        {
          name: "Create Stock Adjustment",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                product_id: "prod-ptx",
                tank_id: "tank-01",
                delta_l: -50,
                reason: "Koreksi penguapan suhu udara tinggi mingguan"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/stock/adjustment",
              host: ["{{baseUrl}}"],
              path: ["api", "stock", "adjustment"]
            },
            description: "Mencatat penyesuaian fisik stok BBM (karena penguapan, kalibrasi, atau sampling)."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 08. Pumps & Nozzles ════════════════════
    {
      name: "08. Pumps & Nozzles",
      item: [
        {
          name: "List Pumps",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/pumps",
              host: ["{{baseUrl}}"],
              path: ["api", "pumps"]
            },
            description: "Mendapatkan daftar pulau pompa (pump dispensers) di SPBP."
          },
          response: []
        },
        {
          name: "List Nozzles (via Pumps)",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/pumps/nozzles",
              host: ["{{baseUrl}}"],
              path: ["api", "pumps", "nozzles"]
            },
            description: "Mendapatkan daftar nozzle beserta produk yang disalurkan."
          },
          response: []
        },
        {
          name: "List Nozzles (Direct)",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/nozzles",
              host: ["{{baseUrl}}"],
              path: ["api", "nozzles"]
            },
            description: "Mendapatkan daftar seluruh nozzle dispenser yang terdaftar."
          },
          response: []
        },
        {
          name: "Get Totalizers Readings",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/pumps/totalizers?date=",
              host: ["{{baseUrl}}"],
              path: ["api", "pumps", "totalizers"],
              query: [
                { key: "date", value: "", description: "Filter tanggal shift (YYYY-MM-DD)" }
              ]
            },
            description: "Mendapatkan data pembacaan totalizer dispenser per nozzle."
          },
          response: []
        },
        {
          name: "Save Totalizer Reading",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                nozzle_id: "nzl-01-1",
                opening_value: 10450.5,
                current_value: 10890.2,
                shift_date: "2026-08-17",
                shift: "PAGI"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/pumps/totalizers",
              host: ["{{baseUrl}}"],
              path: ["api", "pumps", "totalizers"]
            },
            description: "Mencatat angka awal dan akhir totalizer mekanik/elektronik per shift kerja."
          },
          response: []
        },
        {
          name: "Get Pump Dispenser Reconciliation",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/pumps/reconciliation?date=",
              host: ["{{baseUrl}}"],
              path: ["api", "pumps", "reconciliation"],
              query: [
                { key: "date", value: "", description: "Filter tanggal (YYYY-MM-DD)" }
              ]
            },
            description: "Mendapatkan perbandingan antara total liter totalizer pompa vs total transaksi sistem."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 09. Reconciliation ════════════════════
    {
      name: "09. Reconciliation",
      item: [
        {
          name: "Get Daily Reconciliations",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/reconciliation?date=",
              host: ["{{baseUrl}}"],
              path: ["api", "reconciliation"],
              query: [
                { key: "date", value: "", description: "Filter tanggal rekonsiliasi (YYYY-MM-DD)" }
              ]
            },
            description: "Mendapatkan data hasil rekonsiliasi stok harian (Stok Awal + Penerimaan - Transaksi vs Stok Akhir Fisik)."
          },
          response: []
        },
        {
          name: "Run Daily Reconciliation",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                date: "2026-08-17"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/reconciliation/run",
              host: ["{{baseUrl}}"],
              path: ["api", "reconciliation", "run"]
            },
            description: "Menjalankan kalkulasi rekonsiliasi harian dan mendeteksi varians/selisih fisik vs buku."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 10. Reports & Analytics ════════════════════
    {
      name: "10. Reports & Analytics",
      item: [
        {
          name: "Report: Transactions Summary",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/reports/transactions?from=&to=&unit_id=&product_id=&limit=500",
              host: ["{{baseUrl}}"],
              path: ["api", "reports", "transactions"],
              query: [
                { key: "from", value: "", description: "Tanggal mulai (YYYY-MM-DD)" },
                { key: "to", value: "", description: "Tanggal akhir (YYYY-MM-DD)" },
                { key: "unit_id", value: "", description: "Filter Satuan Kerja" },
                { key: "product_id", value: "", description: "Filter Produk BBM" },
                { key: "limit", value: "500", description: "Maksimal data transaksi" }
              ]
            },
            description: "Laporan transaksi penyaluran BBM lengkap dengan agregasi volume dan nominal per produk."
          },
          response: []
        },
        {
          name: "Report: Quota Utilization",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/reports/quota?period_id=",
              host: ["{{baseUrl}}"],
              path: ["api", "reports", "quota"],
              query: [
                { key: "period_id", value: "", description: "Filter Periode Kuota" }
              ]
            },
            description: "Laporan utilisasi kuota BBM per satuan kerja, alokasi vs realisasi pemakaian."
          },
          response: []
        },
        {
          name: "Report: Stock Reconciliation History",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/reports/stock",
              host: ["{{baseUrl}}"],
              path: ["api", "reports", "stock"]
            },
            description: "Laporan rekapitulasi audit dan rekonsiliasi stok BBM bulanan."
          },
          response: []
        },
        {
          name: "Report: Fuel Consumption Breakdown",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/reports/usage?from=&to=",
              host: ["{{baseUrl}}"],
              path: ["api", "reports", "usage"],
              query: [
                { key: "from", value: "", description: "Tanggal awal (YYYY-MM-DD)" },
                { key: "to", value: "", description: "Tanggal akhir (YYYY-MM-DD)" }
              ]
            },
            description: "Laporan rincian konsumsi BBM per unit dan kartu dinas."
          },
          response: []
        },
        {
          name: "Report: Totalizer Audit",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/reports/totalizer",
              host: ["{{baseUrl}}"],
              path: ["api", "reports", "totalizer"]
            },
            description: "Laporan audit dispenser totalizer vs transaksi sistem."
          },
          response: []
        },
        {
          name: "Report: Executive Monthly KPI & Variance",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/reports/executive?month=8&year=2026",
              host: ["{{baseUrl}}"],
              path: ["api", "reports", "executive"],
              query: [
                { key: "month", value: "8", description: "Bulan (1-12)" },
                { key: "year", value: "2026", description: "Tahun (YYYY)" }
              ]
            },
            description: "Laporan ringkasan eksekutif pimpinan (KPI efisiensi, varians rugi/laba BBM, deviasi anggaran)."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 11. Master Data ════════════════════
    {
      name: "11. Master Data",
      item: [
        // Products
        {
          name: "Products: List",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/master/products",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "products"]
            },
            description: "Mendapatkan daftar master produk BBM (Pertamax, Pertalite, Dexlite, dll)."
          },
          response: []
        },
        {
          name: "Products: Create",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                code: "PTX",
                name: "Pertamax",
                type: "Bensin",
                unit: "Liter"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/master/products",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "products"]
            },
            description: "Menambahkan jenis produk BBM baru."
          },
          response: []
        },

        // Prices
        {
          name: "Prices: List History",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/master/prices",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "prices"]
            },
            description: "Mendapatkan riwayat perubahan harga produk BBM."
          },
          response: []
        },
        {
          name: "Prices: Create / Update Price",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                product_id: "prod-ptx",
                price_per_unit: 12500,
                effective_date: "2026-09-01"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/master/prices",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "prices"]
            },
            description: "Menetapkan harga baru produk BBM dengan tanggal berlaku (effective date)."
          },
          response: []
        },

        // Vehicles
        {
          name: "Vehicles: List",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/master/vehicles?unit_id=",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "vehicles"],
              query: [
                { key: "unit_id", value: "", description: "Filter ID Satuan Kerja" }
              ]
            },
            description: "Mendapatkan daftar kendaraan dinas kepolisian."
          },
          response: []
        },
        {
          name: "Vehicles: Register Vehicle",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                police_number: "PB 1234 XX",
                type: "Sedan",
                brand: "Toyota",
                model: "Corolla Altis",
                year: 2023,
                unit_id: "unit-ditres",
                product_id: "prod-ptx",
                fuel_type: "Pertamax",
                notes: "Mobil Dinas Operasional Khusus"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/master/vehicles",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "vehicles"]
            },
            description: "Mendaftarkan data kendaraan dinas kepolisian baru beserta relasi master produk BBM (product_id)."
          },
          response: []
        },
        {
          name: "Vehicles: Update Vehicle",
          request: {
            method: "PUT",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                type: "Sedan",
                brand: "Toyota",
                model: "Corolla Altis",
                year: 2023,
                unit_id: "unit-ditres",
                product_id: "prod-ptx",
                fuel_type: "Pertamax",
                status: "ACTIVE",
                notes: "Update catatan pemeliharaan kendaraan"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/master/vehicles/:id",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "vehicles", ":id"],
              variable: [
                {
                  key: "id",
                  value: "veh-01",
                  description: "Vehicle ID"
                }
              ]
            },
            description: "Memperbarui rincian kendaraan dinas dan relasi master produk BBM (otomatis menyelaraskan kartu terkait)."
          },
          response: []
        },

        // Units
        {
          name: "Units: List Organization Units",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/master/units",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "units"]
            },
            description: "Mendapatkan daftar seluruh satuan kerja (Satker/Unit) Polda Papua Barat."
          },
          response: []
        },
        {
          name: "Units: Create Unit",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                code: "DITRES",
                name: "DITRESKRIMSUS",
                parent_id: "unit-polda",
                commander: "Kombes Polisi Hendra",
                default_alloc_l: 250
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/master/units",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "units"]
            },
            description: "Menambahkan satuan kerja / divisi kepolisian baru."
          },
          response: []
        },
        {
          name: "Units: Update Unit",
          request: {
            method: "PUT",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "DITRESKRIMSUS Polda Papua Barat",
                commander: "Kombes Polisi Hendra, S.I.K.",
                default_alloc_l: 300,
                status: "ACTIVE"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/master/units/:id",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "units", ":id"],
              variable: [
                {
                  key: "id",
                  value: "unit-ditres",
                  description: "Unit ID"
                }
              ]
            },
            description: "Memperbarui nama, pimpinan satker, dan pagu alokasi default unit."
          },
          response: []
        },

        // Users, Roles, Permissions
        {
          name: "Users: List System Users",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/master/users",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "users"]
            },
            description: "Mendapatkan daftar pengguna sistem SPBP."
          },
          response: []
        },
        {
          name: "Roles: List Roles",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/master/roles",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "roles"]
            },
            description: "Mendapatkan daftar peran pengguna sistem (Super Admin, Operator, Auditor, Pimpinan, dll)."
          },
          response: []
        },
        {
          name: "Permissions: List System Permissions",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/master/permissions",
              host: ["{{baseUrl}}"],
              path: ["api", "master", "permissions"]
            },
            description: "Mendapatkan seluruh daftar hak akses izin fitur granular di sistem."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 12. System Management ════════════════════
    {
      name: "12. System Management",
      item: [
        {
          name: "Audit: Get Audit Logs",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/system/audit?module=&user_id=&from=&to=&limit=100&offset=0",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "audit"],
              query: [
                { key: "module", value: "", description: "Filter Modul (Auth, Transaction, Card, Quota, Stock, etc)" },
                { key: "user_id", value: "", description: "Filter ID User pembuat aksi" },
                { key: "from", value: "", description: "Tanggal mulai (YYYY-MM-DD)" },
                { key: "to", value: "", description: "Tanggal akhir (YYYY-MM-DD)" },
                { key: "limit", value: "100", description: "Jumlah limit log" },
                { key: "offset", value: "0", description: "Offset pagination" }
              ]
            },
            description: "Mendapatkan jejak audit trail seluruh aksi perubahan data dan keamanan sistem."
          },
          response: []
        },
        {
          name: "Approvals: List Approval Requests",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/system/approvals?status=PENDING",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "approvals"],
              query: [
                { key: "status", value: "PENDING", description: "Status: PENDING / APPROVED / REJECTED" }
              ]
            },
            description: "Mendapatkan daftar permintaan persetujuan (approval) kuota tambahan atau koreksi stok."
          },
          response: []
        },
        {
          name: "Approvals: Approve Request",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                note: "Disetujui untuk pemenuhan tugas operasi pengamanan dinas kepolisian"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/system/approvals/:id/approve",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "approvals", ":id", "approve"],
              variable: [
                {
                  key: "id",
                  value: "appr-01",
                  description: "Approval ID"
                }
              ]
            },
            description: "Menyetujui permohonan kuota atau permohonan koreksi."
          },
          response: []
        },
        {
          name: "Approvals: Reject Request",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                note: "Ditolak karena melebihi pagu anggaran alokasi bulanan Satker"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/system/approvals/:id/reject",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "approvals", ":id", "reject"],
              variable: [
                {
                  key: "id",
                  value: "appr-01",
                  description: "Approval ID"
                }
              ]
            },
            description: "Menolak permohonan kuota atau permohonan koreksi."
          },
          response: []
        },
        {
          name: "Settings: Get System Settings",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/system/settings",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "settings"]
            },
            description: "Mendapatkan seluruh pasangan konfigurasi global sistem key-value."
          },
          response: []
        },
        {
          name: "Settings: Update System Settings",
          request: {
            method: "PUT",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                COMPANY_NAME: "SPBP Polda Papua Barat",
                SYSTEM_MODE: "ONLINE",
                MAX_DAILY_LITER: "5000",
                AUTO_RECONCILE_TIME: "23:59",
                fms_base_url: "http://192.168.1.100/api",
                fms_timeout_ms: "15000",
                fms_debug: "false",
                fms_enabled: "true"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/system/settings",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "settings"]
            },
            description: "Memperbarui konfigurasi parameter global sistem di database. Invalidation cache FMS Client otomatis terpicu."
          },
          response: []
        },
        {
          name: "FMS Config: Get Active Resolved Config",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/system/fms-config",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "fms-config"]
            },
            description: "Mendapatkan konfigurasi aktif integrasi Forecourt Controller FMS (teresolusi dari database, environment fallback, atau default)."
          },
          response: []
        },
        {
          name: "FMS Config: Update FMS Settings",
          request: {
            method: "PUT",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                baseUrl: "http://192.168.1.100/api",
                timeoutMs: 15000,
                debug: false,
                enabled: true,
                headers: {
                  "X-SPBU-ID": "SPBP-PAPUA-BARAT-01"
                }
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/system/fms-config",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "fms-config"]
            },
            description: "Menyimpan atau memperbarui konfigurasi parameter koneksi FMS langsung ke tabel system_settings di database, menghapus cache in-memory, dan mencatat audit trail."
          },
          response: []
        },
        {
          name: "FMS Config: Test Controller Connection",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                baseUrl: "http://192.168.1.100/api",
                timeoutMs: 5000
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/system/fms-config/test",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "fms-config", "test"]
            },
            description: "Menguji koneksi handshake ping dan mengukur respon latensi (ms) ke target Forecourt Controller FMS."
          },
          response: []
        },
        {
          name: "Notifications: Get Notifications",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/system/notifications",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "notifications"]
            },
            description: "Mendapatkan daftar notifikasi sistem terkini."
          },
          response: []
        },
        {
          name: "Notifications: Mark All as Read",
          request: {
            method: "PUT",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/system/notifications/read-all",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "notifications", "read-all"]
            },
            description: "Menandai seluruh notifikasi sistem sebagai sudah dibaca."
          },
          response: []
        },
        {
          name: "Integration: Get Controller & FMS Status",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/system/integration",
              host: ["{{baseUrl}}"],
              path: ["api", "system", "integration"]
            },
            description: "Mendapatkan status integrasi transaksi controller pompa dispenser serta live status koneksi Forecourt Controller FMS (latensi ms, status connected, versi controller, jam server)."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 13. Hardware & Controller Integration ════════════════════
    {
      name: "13. Controller Hardware Integration",
      item: [
        {
          name: "Controller Push Dispense Transaction",
          request: {
            auth: { type: "noauth" },
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              },
              {
                key: "x-controller-secret",
                value: "{{controller_secret}}",
                description: "Shared secret key controller hardware"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                card_number: "CRD-2026-001",
                product_code: "PTX",
                product_id: "prod-ptx",
                volume_l: 35.0,
                nozzle_id: "nzl-01-1",
                pump_id: "pump-01",
                shift: "PAGI",
                totalizer_before: 12500.0,
                totalizer_after: 12535.0,
                transaction_time: "2026-08-17T10:45:00.000Z"
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/controller/transaction",
              host: ["{{baseUrl}}"],
              path: ["api", "controller", "transaction"]
            },
            description: "Endpoint push otomatis dari hardware controller dispenser saat pengisian BBM selesai."
          },
          response: []
        }
      ]
    },

    // ════════════════════ 14. Forecourt Management System (FMS) ════════════════════
    {
      name: "14. Forecourt Management System (FMS)",
      item: [
        {
          name: "Test Connection to Controller (POST)",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                baseUrl: "http://192.168.1.100/api",
                timeoutMs: 5000
              }, null, 2)
            },
            url: {
              raw: "{{baseUrl}}/api/fms/test-connection",
              host: ["{{baseUrl}}"],
              path: ["api", "fms", "test-connection"]
            },
            description: "Menguji konektivitas, latency handshake, dan status controller hardware FMS aktif atau custom target URL."
          },
          response: []
        },
        {
          name: "Test Connection Quick (GET)",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/fms/test-connection",
              host: ["{{baseUrl}}"],
              path: ["api", "fms", "test-connection"]
            },
            description: "Shortcut GET untuk menguji koneksi cepat ke target Forecourt Controller aktif (tersinkron database/env)."
          },
          response: []
        }
      ]
    }
  ]
};

const environment = {
  id: "c82b09a1-8742-4f11-9a74-d41a7f6f9821",
  name: "Fuel Monitoring - Local Development",
  values: [
    {
      key: "baseUrl",
      value: "http://localhost:4000",
      type: "default",
      enabled: true
    },
    {
      key: "token",
      value: "",
      type: "secret",
      enabled: true
    },
    {
      key: "controller_secret",
      value: "spbp-controller-2026",
      type: "secret",
      enabled: true
    },
    {
      key: "fms_base_url",
      value: "http://192.168.1.100/api",
      type: "default",
      enabled: true
    },
    {
      key: "default_username",
      value: "ADMIN01",
      type: "default",
      enabled: true
    },
    {
      key: "default_password",
      value: "Admin@2026",
      type: "secret",
      enabled: true
    }
  ],
  _postman_variable_scope: "environment"
};

const outputPathCollection = path.join(__dirname, '..', 'Fuel_Monitoring_API.postman_collection.json');
const outputPathEnvironment = path.join(__dirname, '..', 'Fuel_Monitoring_API.postman_environment.json');

fs.writeFileSync(outputPathCollection, JSON.stringify(collection, null, 2), 'utf-8');
fs.writeFileSync(outputPathEnvironment, JSON.stringify(environment, null, 2), 'utf-8');

console.log('Collection created at: ' + outputPathCollection);
console.log('Environment created at: ' + outputPathEnvironment);
console.log('Total items in collection: ' + collection.item.reduce((acc, cat) => acc + cat.item.length, 0));
