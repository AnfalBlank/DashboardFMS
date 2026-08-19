'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api, Product, Pump, Nozzle, Card as CardType, CardQuota, Transaction, User } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  Fuel, CreditCard, Radio, Zap, AlertTriangle,
  Printer, Search, Clock, User as UserIcon,
  SlidersHorizontal, Ban, Gauge, CheckSquare,
  Droplets, RefreshCw, CheckCircle2, ChevronRight, Loader2
} from 'lucide-react';

const SHIFTS = [
  { id: 'PAGI', label: 'Shift 1 - Pagi (06:00 - 14:00)' },
  { id: 'SIANG', label: 'Shift 2 - Siang (14:00 - 22:00)' },
  { id: 'MALAM', label: 'Shift 3 - Malam (22:00 - 06:00)' },
];

const VOLUME_PRESETS = [5, 10, 15, 20, 25, 30, 40, 50];
const NOMINAL_PRESETS = [50000, 100000, 150000, 200000, 300000, 500000];

export default function POSPage() {
  const { success: toastSuccess, warning: toastWarning, error: toastError } = useToast();

  // API State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [operators, setOperators] = useState<User[]>([]);

  // Card Quota API State
  const [cardQuotaData, setCardQuotaData] = useState<CardQuota | null>(null);
  const [loadingQuota, setLoadingQuota] = useState(false);

  // Session State
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<string>('PAGI');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Selected Pump & Nozzle
  const [selectedPumpId, setSelectedPumpId] = useState<string>('');
  const [selectedNozzleId, setSelectedNozzleId] = useState<string>('');

  // Selected Card
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [cardSearch, setCardSearch] = useState<string>('');
  const [isCardDropdownOpen, setIsCardDropdownOpen] = useState(false);
  const [isRfidModalOpen, setIsRfidModalOpen] = useState(false);

  // Form State
  const [inputMode, setInputMode] = useState<'VOLUME' | 'NOMINAL'>('VOLUME');
  const [volumeInput, setVolumeInput] = useState<string>('20');
  const [nominalInput, setNominalInput] = useState<string>('0');
  const [odometerInput, setOdometerInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('Giat Operasional Dinas');

  // Receipt Modal
  const [receiptTrx, setReceiptTrx] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Void Modal
  const [voidTarget, setVoidTarget] = useState<Transaction | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);

  // History Filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');

  // ── Fetch Dynamic Data from API ──────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, pumpRes, nozRes, cardRes, trxRes, userRes] = await Promise.allSettled([
        api.master.products(),
        api.pumps.list(),
        api.pumps.nozzles(),
        api.cards.list({ limit: 100 }),
        api.transactions.list({ limit: 50 }),
        api.master.users(),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value?.data) {
        setProducts(prodRes.value.data);
      }
      if (pumpRes.status === 'fulfilled' && pumpRes.value?.data) {
        setPumps(pumpRes.value.data);
        if (pumpRes.value.data.length > 0 && !selectedPumpId) {
          setSelectedPumpId(pumpRes.value.data[0].id);
        }
      }
      if (nozRes.status === 'fulfilled' && nozRes.value?.data) {
        setNozzles(nozRes.value.data);
      }
      if (cardRes.status === 'fulfilled' && cardRes.value?.data) {
        setCards(cardRes.value.data);
      }
      if (trxRes.status === 'fulfilled' && trxRes.value?.data) {
        setTransactions(trxRes.value.data);
      }
      if (userRes.status === 'fulfilled' && userRes.value?.data) {
        setOperators(userRes.value.data);
        if (userRes.value.data.length > 0 && !selectedOperator) {
          setSelectedOperator(userRes.value.data[0].name || userRes.value.data[0].username);
        }
      }
    } catch (err) {
      console.error('Failed to load POS data from API:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPumpId, selectedOperator]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Current Pump
  const currentPump = useMemo(() => {
    return pumps.find(p => p.id === selectedPumpId) || pumps[0] || null;
  }, [pumps, selectedPumpId]);

  // Pump Nozzles
  const currentPumpNozzles = useMemo(() => {
    if (!currentPump) return [];
    return nozzles.filter(n => n.pump_id === currentPump.id || n.pump_number === currentPump.number);
  }, [nozzles, currentPump]);

  // Auto select first nozzle if pump changes
  useEffect(() => {
    if (currentPumpNozzles.length > 0) {
      const exists = currentPumpNozzles.some(n => n.id === selectedNozzleId);
      if (!exists) {
        setSelectedNozzleId(currentPumpNozzles[0].id);
      }
    }
  }, [currentPumpNozzles, selectedNozzleId]);

  // Current Nozzle
  const currentNozzle = useMemo(() => {
    return currentPumpNozzles.find(n => n.id === selectedNozzleId) || currentPumpNozzles[0] || null;
  }, [currentPumpNozzles, selectedNozzleId]);

  // Current Product
  const currentProduct = useMemo(() => {
    if (!currentNozzle) return products[0] || null;
    return products.find(p => p.id === currentNozzle.product_id || p.name === currentNozzle.product_name || p.name === currentNozzle.product) || products[0] || null;
  }, [products, currentNozzle]);

  // Current Product Price
  const currentPrice = useMemo(() => {
    if (!currentProduct) return 12000;
    return currentProduct.current_price ?? currentProduct.currentPrice ?? 12000;
  }, [currentProduct]);

  // Current Card
  const selectedCard = useMemo(() => {
    return cards.find(c => c.id === selectedCardId || c.card_number === selectedCardId || c.number === selectedCardId) || null;
  }, [cards, selectedCardId]);

  // Fetch Quota from Quota API for the Selected Card
  const fetchCardQuota = useCallback(async (cardId: string) => {
    if (!cardId) {
      setCardQuotaData(null);
      return;
    }
    try {
      setLoadingQuota(true);
      const res = await api.cards.quota(cardId).catch(() => api.quota.list({ card_id: cardId }));
      if (res?.data && res.data.length > 0) {
        setCardQuotaData(res.data[0]);
      } else {
        setCardQuotaData(null);
      }
    } catch (err) {
      console.warn('Failed to fetch card quota from API:', err);
      setCardQuotaData(null);
    } finally {
      setLoadingQuota(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCard) {
      const idToFetch = selectedCard.id || selectedCard.card_number || selectedCard.number || '';
      fetchCardQuota(idToFetch);
    } else {
      setCardQuotaData(null);
    }
  }, [selectedCard, fetchCardQuota]);

  // Calculations
  const parsedVolume = useMemo(() => {
    const v = parseFloat(volumeInput);
    return isNaN(v) || v <= 0 ? 0 : v;
  }, [volumeInput]);

  const parsedTotal = useMemo(() => {
    return Math.round(parsedVolume * currentPrice);
  }, [parsedVolume, currentPrice]);

  const handleVolumeChange = (val: string) => {
    setVolumeInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setNominalInput((num * currentPrice).toFixed(0));
    } else {
      setNominalInput('0');
    }
  };

  const handleNominalChange = (val: string) => {
    setNominalInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && currentPrice > 0) {
      setVolumeInput((num / currentPrice).toFixed(2));
    } else {
      setVolumeInput('0');
    }
  };

  // Dynamic Card Quota Values (sourced from Quota API with card fallback)
  const cardQuota = useMemo(() => {
    if (cardQuotaData) {
      const allocated = cardQuotaData.allocated_l ?? (selectedCard?.allocated ?? selectedCard?.monthly_limit ?? 200);
      const used = cardQuotaData.used_l ?? (selectedCard?.used ?? 0);
      const remaining = cardQuotaData.remaining_l ?? Math.max(0, allocated - used);
      return { allocated, used, remaining };
    }
    if (!selectedCard) return { allocated: 0, used: 0, remaining: 0 };
    const allocated = selectedCard.allocated ?? selectedCard.monthly_limit ?? selectedCard.monthlyLimit ?? 200;
    const used = selectedCard.used ?? 0;
    const remaining = selectedCard.remaining ?? Math.max(0, allocated - used);
    return { allocated, used, remaining };
  }, [selectedCard, cardQuotaData]);

  const handleApplyFullQuota = () => {
    if (!selectedCard) {
      toastWarning('Pilih Kartu', 'Silakan pilih kartu dinas terlebih dahulu.');
      return;
    }
    const rem = cardQuota.remaining;
    if (rem <= 0) {
      toastError('Kuota Habis', 'Kartu ini sudah tidak memiliki sisa kuota bulanan.');
      return;
    }
    handleVolumeChange(rem.toString());
  };

  const handleSelectCard = (card: CardType) => {
    setSelectedCardId(card.id || card.card_number || card.number || '');
    setIsCardDropdownOpen(false);
    setIsRfidModalOpen(false);

    // Auto match nozzle with card fuel type if available
    const cardFuel = (card.fuel_type || card.fuelType || '').toLowerCase();
    if (cardFuel && currentProduct && currentProduct.name.toLowerCase() !== cardFuel) {
      const match = nozzles.find(n => (n.product_name || n.product || '').toLowerCase() === cardFuel);
      if (match) {
        if (match.pump_id) setSelectedPumpId(match.pump_id);
        setSelectedNozzleId(match.id);
      }
    }
  };

  // Card Search Filter
  const filteredCards = useMemo(() => {
    if (!cardSearch.trim()) return cards;
    const q = cardSearch.toLowerCase();
    return cards.filter(c => {
      const num = c.card_number || c.number || '';
      const holder = c.holder_name || c.holder || '';
      const unit = c.unit_name || c.unit || '';
      const veh = c.police_number || c.vehicle || '';
      return num.toLowerCase().includes(q) || holder.toLowerCase().includes(q) || unit.toLowerCase().includes(q) || veh.toLowerCase().includes(q);
    });
  }, [cards, cardSearch]);


  // Validation
  const validation = useMemo(() => {
    if (!selectedCard) {
      return { valid: false, message: 'Pilih atau scan kartu RFID penerima BBM' };
    }
    if (selectedCard.status === 'BLOCKED') {
      return { valid: false, message: 'Kartu DIBLOKIR. Transaksi ditolak sistem.' };
    }
    if (selectedCard.status === 'SUSPENDED') {
      return { valid: false, message: 'Kartu DITANGGUHKAN sementara.' };
    }
    const cardFuel = (selectedCard.fuel_type || selectedCard.fuelType || '').toLowerCase();
    const prodName = (currentProduct?.name || '').toLowerCase();
    if (cardFuel && prodName && cardFuel !== prodName) {
      return { valid: false, message: `BBM tidak sesuai: Kartu terdaftar untuk [${selectedCard.fuel_type || selectedCard.fuelType}], nozzle mengeluarkan [${currentProduct?.name}].` };
    }
    if (parsedVolume <= 0) {
      return { valid: false, message: 'Volume pengisian harus lebih dari 0 Liter.' };
    }
    if (parsedVolume > cardQuota.remaining) {
      return { valid: false, message: `Volume pengisian (${parsedVolume} L) melebihi sisa kuota (${cardQuota.remaining} L).` };
    }
    return { valid: true, message: 'Siap untuk melakukan transaksi dispensing BBM' };
  }, [selectedCard, currentProduct, parsedVolume, cardQuota]);

  // Submit Transaction to API
  const handleExecuteTransaction = async () => {
    if (!validation.valid || !selectedCard || !currentProduct) {
      toastError('Transaksi Tidak Valid', validation.message);
      return;
    }

    try {
      setSubmitting(true);
      const cardNum = selectedCard.card_number || selectedCard.number || selectedCard.id;
      const res = await api.transactions.create({
        card_number: cardNum,
        product_id: currentProduct.id,
        volume_l: parsedVolume,
        nozzle_id: currentNozzle?.id || undefined,
        pump_id: currentPump?.id || undefined,
        shift: selectedShift,
        source: 'API',
        transaction_time: new Date().toISOString(),
      });

      const newTrxId = res?.data?.id || `TRX-${Date.now()}`;
      const newTrx: Transaction = {
        id: newTrxId,
        card_number: cardNum,
        holder_name: selectedCard.holder_name || selectedCard.holder,
        unit_name: selectedCard.unit_name || selectedCard.unit,
        police_number: selectedCard.police_number || selectedCard.vehicle,
        product_name: currentProduct.name,
        volume_l: parsedVolume,
        price_per_unit: currentPrice,
        total_amount: parsedTotal,
        pump_number: currentPump?.number,
        nozzle_number: currentNozzle?.number,
        operator_name: selectedOperator,
        shift: selectedShift,
        transaction_time: new Date().toISOString(),
        status: 'SUCCESS',
        quota_before: cardQuota.remaining,
        quota_deducted: parsedVolume,
        quota_after: Math.max(0, cardQuota.remaining - parsedVolume),
      };

      toastSuccess('Transaksi Berhasil', `Pengisian ${parsedVolume} L ${currentProduct.name} berhasil dicatat.`);
      setReceiptTrx(newTrx);
      setIsReceiptModalOpen(true);
      if (selectedCard) {
        fetchCardQuota(selectedCard.id || selectedCard.card_number || selectedCard.number || '');
      }
      loadData();
    } catch (err) {
      toastError('Gagal Mencatat Transaksi', err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses API.');
    } finally {
      setSubmitting(false);
    }
  };

  // Void Transaction
  const handleConfirmVoid = async () => {
    if (!voidTarget || !voidReason.trim()) {
      toastError('Alasan Diperlukan', 'Silakan masukkan alasan pembatalan transaksi (VOID).');
      return;
    }

    try {
      setSubmitting(true);
      await api.transactions.void(voidTarget.id, voidReason);
      toastSuccess('Transaksi Di-VOID', `Transaksi ${voidTarget.id} berhasil dibatalkan.`);
      setIsVoidModalOpen(false);
      setVoidTarget(null);
      setVoidReason('');
      if (selectedCard) {
        fetchCardQuota(selectedCard.id || selectedCard.card_number || selectedCard.number || '');
      }
      loadData();
    } catch (err) {
      toastError('Gagal VOID', err instanceof Error ? err.message : 'Terjadi kesalahan pada API VOID.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    return transactions.filter(t => {
      const q = historySearch.toLowerCase();
      const cardNum = t.card_number || t.card || '';
      const holder = t.holder_name || t.holder || '';
      const veh = t.police_number || t.vehicle || '';
      const id = t.id || '';
      const matchesSearch = !q || id.toLowerCase().includes(q) || cardNum.toLowerCase().includes(q) || holder.toLowerCase().includes(q) || veh.toLowerCase().includes(q);
      const matchesStatus = historyStatusFilter === 'ALL' || t.status === historyStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, historySearch, historyStatusFilter]);

  // Session Stats
  const sessionStats = useMemo(() => {
    const active = transactions.filter(t => t.status === 'SUCCESS');
    const count = active.length;
    const totalVol = active.reduce((acc, t) => acc + (t.volume_l ?? t.volume ?? 0), 0);
    const totalAmt = active.reduce((acc, t) => acc + (t.total_amount ?? t.total ?? 0), 0);
    return { count, totalVol, totalAmt };
  }, [transactions]);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header & Session Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Fuel size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">POS Terminal Dispenser SPBP</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                API INTEGRATED
              </span>
            </div>
            <p className="text-xs text-slate-400">Stasiun Pengisian Bahan Bakar Polri • Polda Papua Barat</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Operator */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
            <UserIcon size={14} className="text-blue-400" />
            <select
              value={selectedOperator}
              onChange={e => setSelectedOperator(e.target.value)}
              className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs"
            >
              {operators.length > 0 ? (
                operators.map(op => (
                  <option key={op.id} value={op.name || op.username} className="bg-slate-900 text-white">
                    {op.name || op.username} ({op.role || 'Operator'})
                  </option>
                ))
              ) : (
                <option value="Operator SPBP" className="bg-slate-900 text-white">Operator SPBP</option>
              )}
            </select>
          </div>

          {/* Shift */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
            <Clock size={14} className="text-amber-400" />
            <select
              value={selectedShift}
              onChange={e => setSelectedShift(e.target.value)}
              className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs"
            >
              {SHIFTS.map(sh => (
                <option key={sh.id} value={sh.id} className="bg-slate-900 text-white">
                  {sh.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Data */}
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Refresh Data API"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-blue-400' : ''} />
          </button>

          {/* Clock */}
          <div className="bg-slate-800/90 border border-slate-700/80 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold text-slate-200 tracking-wider">
            {currentTime || '00:00:00'}
          </div>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="bg-white border border-slate-200 shadow-sm" padding={false}>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Transaksi</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{sessionStats.count} <span className="text-xs font-normal text-slate-400">Trx</span></p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Shift {selectedShift}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckSquare size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm" padding={false}>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Volume Disalurkan</p>
              <p className="text-2xl font-bold text-blue-600 mt-0.5">{sessionStats.totalVol.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">Liter</span></p>
              <p className="text-[11px] text-slate-400 mt-1">Total Dispensing</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Droplets size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm" padding={false}>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nilai Transaksi</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">Rp {sessionStats.totalAmt.toLocaleString('id-ID')}</p>
              <p className="text-[11px] text-slate-400 mt-1">Valuasi Alokasi BBM</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CreditCard size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm" padding={false}>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dispenser Terpilih</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {currentPump ? `P${currentPump.number}-N${currentNozzle?.number || '1'}` : '-'}
              </p>
              <p className="text-[11px] text-blue-600 font-medium mt-1">
                {currentProduct?.name || 'BBM'} • Rp {currentPrice.toLocaleString('id-ID')}/L
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Zap size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Main POS 3-Panel Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Panel 1: Dispenser & Nozzle ── */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-white border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">1. Pilih Dispenser & Nozzle</h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                {pumps.length} Dispenser
              </span>
            </div>

            {/* Dispenser List */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {pumps.map(pump => {
                const isSelected = pump.id === selectedPumpId;
                return (
                  <button
                    key={pump.id}
                    onClick={() => setSelectedPumpId(pump.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <p className="text-xs font-bold">{pump.number ? `Dispenser ${pump.number}` : pump.id}</p>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {pump.location || 'Pulau SPBP'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Nozzle List */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Nozzle BBM Tersedia
              </label>
              {currentPumpNozzles.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-xl">
                  Tidak ada nozzle terdaftar pada dispenser ini
                </div>
              ) : (
                currentPumpNozzles.map(nozzle => {
                  const isSelected = nozzle.id === selectedNozzleId;
                  const prod = products.find(p => p.id === nozzle.product_id || p.name === nozzle.product_name || p.name === nozzle.product);
                  const price = prod?.current_price ?? prod?.currentPrice ?? 12000;

                  return (
                    <div
                      key={nozzle.id}
                      onClick={() => setSelectedNozzleId(nozzle.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                        >
                          N{nozzle.number}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{nozzle.product_name || nozzle.product || prod?.name || 'BBM'}</p>
                          <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            Rp {price.toLocaleString('id-ID')} / Liter
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusVariant(nozzle.status || 'ACTIVE')}>{nozzle.status || 'ACTIVE'}</Badge>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* ── Panel 2: Identifikasi Kartu RFID ── */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-white border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">2. Identifikasi Kartu RFID</h2>
              </div>
              <Button
                variant="aloe"
                size="sm"
                onClick={() => setIsRfidModalOpen(true)}
                className="!text-xs !py-1 !px-3 font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Radio size={13} /> Scan RFID
              </Button>
            </div>

            {/* Card Search Autocomplete */}
            <div className="relative mb-3">
              <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition">
                <Search size={14} className="text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Cari Kartu / Pemegang / Satker / Plat..."
                  value={cardSearch}
                  onChange={e => {
                    setCardSearch(e.target.value);
                    setIsCardDropdownOpen(true);
                  }}
                  onFocus={() => setIsCardDropdownOpen(true)}
                  className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              {isCardDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {filteredCards.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">Kartu tidak ditemukan</div>
                  ) : (
                    filteredCards.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCard(c)}
                        className="p-2.5 hover:bg-blue-50/70 transition cursor-pointer text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{c.card_number || c.number}</span>
                            <span className="text-slate-600 font-medium">{c.holder_name || c.holder}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {c.unit_name || c.unit} • {c.police_number || c.vehicle} ({c.fuel_type || c.fuelType})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {c.status}
                          </span>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">Sisa: {c.remaining ?? 0} L</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Card View */}
            {selectedCard ? (
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-700 relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="text-emerald-400" />
                    <span className="font-mono text-xs font-bold tracking-wider text-emerald-300">
                      #{selectedCard.card_number || selectedCard.number}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${selectedCard.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-red-500/20 text-red-300 border border-red-400/30'}`}>
                    {selectedCard.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Pemegang & Satker</p>
                    <p className="font-bold text-sm text-white">{selectedCard.holder_name || selectedCard.holder}</p>
                    <p className="text-xs text-blue-300 font-medium mt-0.5">{selectedCard.unit_name || selectedCard.unit}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                    <div>
                      <p className="text-[10px] text-slate-400">Plat Nomor</p>
                      <p className="font-bold text-xs text-slate-100">{selectedCard.police_number || selectedCard.vehicle || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">BBM Terdaftar</p>
                      <p className="font-bold text-xs text-amber-300">{selectedCard.fuel_type || selectedCard.fuelType || 'Semua'}</p>
                    </div>
                  </div>

                  {/* Quota Progress */}
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="flex justify-between text-[11px] items-center">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        Sisa Kuota:
                        {loadingQuota ? (
                          <Loader2 size={11} className="animate-spin text-emerald-300" />
                        ) : (
                          <strong className="text-emerald-300">{cardQuota.remaining} L</strong>
                        )}
                      </span>
                      <span className="text-slate-400">{cardQuota.used} / {cardQuota.allocated} L</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (cardQuota.used / (cardQuota.allocated || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsRfidModalOpen(true)}
                className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                  <Radio size={22} className="text-blue-600" />
                </div>
                <p className="text-xs font-bold text-slate-700">Pilih / Scan Kartu RFID</p>
                <p className="text-[11px] text-slate-400">Pilih kartu dinas kepolisian untuk validasi alokasi BBM</p>
              </div>
            )}
          </Card>
        </div>

        {/* ── Panel 3: Kalkulator & Eksekusi Transaksi ── */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-white border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">3. Nominal & Eksekusi</h2>
              </div>

              <div className="bg-slate-100 p-0.5 rounded-lg flex text-[11px] font-semibold">
                <button
                  onClick={() => setInputMode('VOLUME')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${inputMode === 'VOLUME' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  Liter
                </button>
                <button
                  onClick={() => setInputMode('NOMINAL')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${inputMode === 'NOMINAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  Rupiah
                </button>
              </div>
            </div>

            {/* Input Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-inner mb-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{inputMode === 'VOLUME' ? 'Volume Pengisian (Liter)' : 'Nominal Pengisian (Rupiah)'}</span>
                <span className="font-mono text-blue-400 font-bold">@ Rp {currentPrice.toLocaleString('id-ID')} / L</span>
              </div>

              {inputMode === 'VOLUME' ? (
                <div className="flex items-baseline justify-between">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={volumeInput}
                    onChange={e => handleVolumeChange(e.target.value)}
                    className="w-2/3 bg-transparent text-3xl font-extrabold text-white outline-none font-mono tracking-tight"
                    placeholder="0"
                  />
                  <span className="text-xl font-bold text-slate-400">LITER</span>
                </div>
              ) : (
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-400 mr-2">Rp</span>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={nominalInput}
                    onChange={e => handleNominalChange(e.target.value)}
                    className="w-full bg-transparent text-3xl font-extrabold text-white outline-none font-mono tracking-tight"
                    placeholder="0"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">
                  {inputMode === 'VOLUME' ? 'Total Tagihan (Rp):' : 'Total Volume (L):'}
                </span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {inputMode === 'VOLUME' ? `Rp ${parsedTotal.toLocaleString('id-ID')}` : `${parsedVolume.toFixed(2)} Liter`}
                </span>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 uppercase">
                <span>Tombol Pintas Preset</span>
                {selectedCard && (
                  <button onClick={handleApplyFullQuota} className="text-blue-600 hover:text-blue-700 font-bold normal-case text-xs cursor-pointer">
                    Isi Sisa Kuota ({cardQuota.remaining}L)
                  </button>
                )}
              </div>

              {inputMode === 'VOLUME' ? (
                <div className="grid grid-cols-4 gap-1.5">
                  {VOLUME_PRESETS.map(p => (
                    <button
                      key={p}
                      onClick={() => handleVolumeChange(p.toString())}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition cursor-pointer ${parsedVolume === p ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {p} L
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {NOMINAL_PRESETS.map(p => (
                    <button
                      key={p}
                      onClick={() => handleNominalChange(p.toString())}
                      className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition cursor-pointer ${parseInt(nominalInput, 10) === p ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {(p / 1000).toLocaleString('id-ID')}rb
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Validation Message */}
            {!validation.valid && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 flex items-start gap-2 mb-4">
                <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-amber-600" />
                <p className="leading-snug">{validation.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleExecuteTransaction}
              disabled={!validation.valid || submitting}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${validation.valid && !submitting
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
            >
              <Zap size={18} /> {submitting ? 'Menyimpan Transaksi...' : `PROSES TRANSAKSI (${parsedVolume} L)`}
            </button>
          </Card>
        </div>
      </div>

      {/* ── Transaction History Table ── */}
      <Card className="bg-white border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Riwayat Transaksi POS</h3>
            <p className="text-xs text-slate-400">Daftar transaksi pengisian bahan bakar resmi yang tersimpan di sistem</p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari TRX / Kartu / Plat..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-400 w-48"
              />
            </div>

            <select
              value={historyStatusFilter}
              onChange={e => setHistoryStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="VOID">VOID</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <th className="py-2.5 px-3">ID Transaksi</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Pemegang / Satker</th>
                <th className="py-2.5 px-3">Kendaraan</th>
                <th className="py-2.5 px-3">Produk & Nozzle</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
                <th className="py-2.5 px-3 text-right">Total (Rp)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Tidak ada transaksi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredHistory.map(trx => {
                  const vol = trx.volume_l ?? trx.volume ?? 0;
                  const tot = trx.total_amount ?? trx.total ?? 0;
                  const time = trx.transaction_time ? trx.transaction_time.slice(11, 19) : trx.time || '-';

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{trx.id}</td>
                      <td className="py-2.5 px-3 text-slate-500">{time}</td>
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-800">{trx.holder_name || trx.holder || '-'}</p>
                        <p className="text-[10px] text-slate-400">{trx.unit_name || trx.unit || '-'} • #{trx.card_number || trx.card || '-'}</p>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{trx.police_number || trx.vehicle || '-'}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-800">{trx.product_name || trx.product || 'BBM'}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">(P{trx.pump_number || trx.pump || '1'}-N{trx.nozzle_number || trx.nozzle || '1'})</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-600">{vol} L</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        Rp {tot.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant={statusVariant(trx.status)}>{trx.status}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setReceiptTrx(trx);
                              setIsReceiptModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                            title="Cetak Struk"
                          >
                            <Printer size={14} />
                          </button>
                          {trx.status === 'SUCCESS' && (
                            <button
                              onClick={() => {
                                setVoidTarget(trx);
                                setVoidReason('');
                                setIsVoidModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                              title="Batalkan (VOID)"
                            >
                              <Ban size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── MODAL: Scan RFID Card ── */}
      <Modal
        open={isRfidModalOpen}
        onClose={() => setIsRfidModalOpen(false)}
        title="Pilih Kartu RFID Dinas"
      >
        <div className="space-y-4">
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {cards.map(c => (
              <div
                key={c.id}
                onClick={() => handleSelectCard(c)}
                className="pt-2 p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/70 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{c.card_number || c.number}</span>
                      <span className="text-xs font-semibold text-slate-700">{c.holder_name || c.holder}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {c.unit_name || c.unit} • {c.police_number || c.vehicle}
                    </p>
                    <p className="text-[10px] text-blue-600 font-semibold">BBM: {c.fuel_type || c.fuelType || 'Semua'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsRfidModalOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Digital Struk / Receipt Modal ── */}
      <Modal
        open={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Struk Pengisian Bahan Bakar"
      >
        {receiptTrx && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-300 rounded-xl p-6 font-mono text-xs text-slate-900 shadow-sm space-y-4 max-w-md mx-auto">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <p className="font-bold text-sm tracking-tight">KEPOLISIAN NEGARA REPUBLIK INDONESIA</p>
                <p className="font-bold text-xs">DAERAH PAPUA BARAT</p>
                <p className="text-[11px] text-slate-600">STASIUN PENGISIAN BAHAN BAKAR POLRI (SPBP)</p>
                <p className="text-[10px] text-slate-500">Jl. Pahlawan No. 01, Manokwari • Papua Barat</p>
              </div>

              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Transaksi :</span>
                  <span className="font-bold">{receiptTrx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal / Jam :</span>
                  <span>{new Date().toLocaleDateString('id-ID')} {receiptTrx.transaction_time ? receiptTrx.transaction_time.slice(11, 19) : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispenser/Nozzle:</span>
                  <span className="font-bold">P{receiptTrx.pump_number || '1'} / N{receiptTrx.nozzle_number || '1'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operator / Shift:</span>
                  <span>{receiptTrx.operator_name || receiptTrx.operator || '-'} ({receiptTrx.shift || '-'})</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Kartu RFID:</span>
                  <span className="font-bold">{receiptTrx.card_number || receiptTrx.card || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pemegang :</span>
                  <span className="font-bold">{receiptTrx.holder_name || receiptTrx.holder || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Satker / Unit :</span>
                  <span>{receiptTrx.unit_name || receiptTrx.unit || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plat Kendaraan :</span>
                  <span className="font-bold text-blue-700">{receiptTrx.police_number || receiptTrx.vehicle || '-'}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between font-bold">
                  <span>Produk BBM :</span>
                  <span>{receiptTrx.product_name || receiptTrx.product || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Harga / Liter :</span>
                  <span>Rp {(receiptTrx.price_per_unit ?? receiptTrx.price ?? 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span>Volume Terisi :</span>
                  <span className="text-blue-700">{receiptTrx.volume_l ?? receiptTrx.volume ?? 0} LITER</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200">
                  <span>Total Valuasi :</span>
                  <span className="text-slate-900">Rp {(receiptTrx.total_amount ?? receiptTrx.total ?? 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-2">
                <p>*** PENGISIAN RESMI DINAS POLRI ***</p>
                <p className="mt-0.5">TERIMA KASIH - TETAP SEMANGAT BERTUGAS</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-1.5">
                <Printer size={14} /> Cetak Struk
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsReceiptModalOpen(false)}>
                Selesai
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL: Pembatalan Transaksi (VOID) ── */}
      <Modal
        open={isVoidModalOpen}
        onClose={() => setIsVoidModalOpen(false)}
        title="Pembatalan Transaksi (VOID)"
      >
        {voidTarget && (
          <div className="space-y-4 text-xs">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-800 flex items-start gap-2">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-bold">Konfirmasi Pembatalan Transaksi</p>
                <p className="mt-0.5">
                  Membatalkan transaksi <strong>{voidTarget.id}</strong> ({voidTarget.volume_l ?? voidTarget.volume} L) untuk kartu <strong>#{voidTarget.card_number || voidTarget.card}</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Alasan Pembatalan (Wajib)</label>
              <textarea
                rows={3}
                placeholder="Masukkan alasan dinas pembatalan..."
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsVoidModalOpen(false)}>
                Batal
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmVoid} disabled={submitting}>
                {submitting ? 'Memproses VOID...' : 'Konfirmasi VOID'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
