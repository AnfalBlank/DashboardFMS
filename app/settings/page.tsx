"use client";
import { useState, useEffect } from "react";
import { api, SystemSettings, NotificationSettings } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    station_name: "SPBP Polda Papua Barat",
    station_code: "SPBP-PB-01",
    address: "Jl. Utama Polda Papua Barat, Manokwari",
    operating_hours: "24 Jam",
    auto_reconcile: true,
    alert_critical_pct: 15,
    alert_low_pct: 30,
    daily_report_time: "23:59",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_alerts: true,
    telegram_alerts: true,
    sms_alerts: false,
    alert_recipients:
      "admin.spbp@papuabarat.polri.go.id, logistik@papuabarat.polri.go.id",
    telegram_bot_token: "••••••••••••••••",
    telegram_chat_id: "-1002345678901",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    Promise.allSettled([
      api.system.settings(),
      api.system.notifications(),
    ]).then(([sRes, nRes]) => {
      if (sRes.status === "fulfilled" && sRes.value?.data)
        setSettings(sRes.value.data as SystemSettings);
      if (
        nRes.status === "fulfilled" &&
        nRes.value?.data &&
        !Array.isArray(nRes.value.data)
      ) {
        setNotifications(nRes.value.data as NotificationSettings);
      }
      setLoading(false);
    });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await Promise.all([
        api.system.updateSettings(settings),
        api.system.updateNotifications(notifications),
      ]);
      success(
        "Pengaturan Disimpan",
        "Konfigurasi sistem SPBP berhasil diperbarui.",
      );
    } catch (err: unknown) {
      toastError(
        "Gagal Menyimpan Pengaturan",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="System Settings"
        subtitle="Konfigurasi operasional SPBP, ambang batas alarm, dan notifikasi telemetri"
      />

      <form onSubmit={handleSaveSettings} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          {/* Station Profile */}
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">
              Profil Stasiun Pengisian (SPBP)
            </h3>
            <div className="space-y-3">
              <Input
                label="Nama Stasiun"
                value={settings.station_name}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, station_name: v }))
                }
              />
              <Input
                label="Kode Stasiun"
                value={settings.station_code}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, station_code: v }))
                }
              />
              <Input
                label="Alamat Lokasi"
                value={settings.address}
                onChange={(v) => setSettings((s) => ({ ...s, address: v }))}
              />
              <Input
                label="Jam Operasional"
                value={settings.operating_hours}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, operating_hours: v }))
                }
              />
            </div>
          </Card>

          {/* Operational thresholds */}
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">
              Ambang Batas Alarm Stok Tangki
            </h3>
            <div className="space-y-3">
              <Input
                label="Threshold Stok Kritis (%)"
                type="number"
                value={settings.alert_critical_pct?.toString()}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, alert_critical_pct: Number(v) }))
                }
              />
              <Input
                label="Threshold Stok Rendah / Low (%)"
                type="number"
                value={settings.alert_low_pct?.toString()}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, alert_low_pct: Number(v) }))
                }
              />
              <Input
                label="Waktu Eksekusi Rekonsiliasi Otomatis Harian"
                type="time"
                value={settings.daily_report_time}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, daily_report_time: v }))
                }
              />
            </div>
          </Card>
        </div>

        {/* Notifications */}
        <Card>
          <h3 className="text-[13px] font-semibold mb-4">
            Konfigurasi Kanal Notifikasi & Peringatan
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="email_alerts"
                  checked={notifications.email_alerts}
                  onChange={(e) =>
                    setNotifications((n) => ({
                      ...n,
                      email_alerts: e.target.checked,
                    }))
                  }
                  className="rounded border-zinc-300 w-4 h-4 text-black focus:ring-black"
                />
                <label
                  htmlFor="email_alerts"
                  className="text-[13px] font-medium text-zinc-800"
                >
                  Aktifkan Notifikasi Email
                </label>
              </div>
              <Input
                label="Penerima Email (pisahkan dengan koma)"
                value={notifications.alert_recipients}
                onChange={(v) =>
                  setNotifications((n) => ({ ...n, alert_recipients: v }))
                }
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="telegram_alerts"
                  checked={notifications.telegram_alerts}
                  onChange={(e) =>
                    setNotifications((n) => ({
                      ...n,
                      telegram_alerts: e.target.checked,
                    }))
                  }
                  className="rounded border-zinc-300 w-4 h-4 text-black focus:ring-black"
                />
                <label
                  htmlFor="telegram_alerts"
                  className="text-[13px] font-medium text-zinc-800"
                >
                  Aktifkan Telegram Bot Alert
                </label>
              </div>
              <Input
                label="Telegram Chat ID Group"
                value={notifications.telegram_chat_id}
                onChange={(v) =>
                  setNotifications((n) => ({ ...n, telegram_chat_id: v }))
                }
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Menyimpan…" : "Simpan Semua Pengaturan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
