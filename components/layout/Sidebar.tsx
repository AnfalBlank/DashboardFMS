'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, CreditCard, Clock, ArrowUpCircle, Calendar,
  Droplets, Package, Truck, SlidersHorizontal, Gauge, GitBranch,
  BarChart3, FileText, Star, Database, Tag, Car, Building2, Users,
  UserCog, Settings, ShieldCheck, CheckSquare, Activity, Layers,
  ChevronDown, ChevronRight, Fuel
} from 'lucide-react';
import { useState } from 'react';

const nav = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    label: 'Fuel Management', icon: Droplets, children: [
      { label: 'Transactions', href: '/transactions', icon: Clock },
      { label: 'Cards', href: '/cards', icon: CreditCard },
      { label: 'Quota', href: '/quota', icon: Gauge },
      { label: 'Top Up', href: '/topup', icon: ArrowUpCircle },
      { label: 'Monthly Allocation', href: '/allocation', icon: Calendar },
    ]
  },
  {
    label: 'Inventory', icon: Package, children: [
      { label: 'Tank Monitoring', href: '/tanks', icon: Layers },
      { label: 'Stock', href: '/stock', icon: Database },
      { label: 'Delivery', href: '/delivery', icon: Truck },
      { label: 'Stock Adjustment', href: '/stock-adjustment', icon: SlidersHorizontal },
    ]
  },
  {
    label: 'Dispensing', icon: GitBranch, children: [
      { label: 'Pumps', href: '/pumps', icon: Gauge },
      { label: 'Nozzles', href: '/nozzles', icon: Droplets },
      { label: 'Totalizer', href: '/totalizer', icon: BarChart3 },
      { label: 'Reconciliation', href: '/reconciliation', icon: CheckSquare },
    ]
  },
  {
    label: 'Reports', icon: FileText, children: [
      { label: 'Transaction Report', href: '/reports/transactions', icon: FileText },
      { label: 'Fuel Usage', href: '/reports/usage', icon: BarChart3 },
      { label: 'Quota Report', href: '/reports/quota', icon: Gauge },
      { label: 'Stock Report', href: '/reports/stock', icon: Database },
      { label: 'Totalizer Report', href: '/reports/totalizer', icon: Activity },
      { label: 'Executive Report', href: '/reports/executive', icon: Star },
    ]
  },
  {
    label: 'Master Data', icon: Layers, children: [
      { label: 'Products', href: '/master/products', icon: Tag },
      { label: 'Price', href: '/master/price', icon: Tag },
      { label: 'Cards', href: '/master/cards', icon: CreditCard },
      { label: 'Vehicles', href: '/master/vehicles', icon: Car },
      { label: 'Units / Satker', href: '/master/units', icon: Building2 },
      { label: 'Users', href: '/master/users', icon: Users },
      { label: 'Operators', href: '/master/operators', icon: UserCog },
    ]
  },
  {
    label: 'System', icon: Settings, children: [
      { label: 'Users', href: '/system/users', icon: Users },
      { label: 'Roles', href: '/system/roles', icon: ShieldCheck },
      { label: 'Permissions', href: '/system/permissions', icon: ShieldCheck },
      { label: 'Approval', href: '/system/approval', icon: CheckSquare },
      { label: 'Audit Log', href: '/system/audit', icon: Activity },
      { label: 'Integration', href: '/system/integration', icon: GitBranch },
    ]
  },
  { label: 'Pengaturan', href: '/settings', icon: Settings },
];

function NavGroup({ item, pathname }: { item: typeof nav[number]; pathname: string }) {
  const hasChildren = 'children' in item && item.children;
  const isActive = hasChildren
    ? item.children!.some(c => pathname === c.href || pathname.startsWith(c.href + '/'))
    : pathname === item.href;
  const [open, setOpen] = useState(isActive);
  const Icon = item.icon;

  /* ── Single link (Dashboard) ── */
  if (!hasChildren) {
    return (
      <Link
        href={(item as { href: string }).href}
        className={clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150',
          isActive
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-300 hover:text-white hover:bg-white/10'
        )}
      >
        <Icon size={16} className="flex-shrink-0" />
        {item.label}
      </Link>
    );
  }

  /* ── Group with children ── */
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150',
          isActive
            ? 'text-white'
            : 'text-slate-400 hover:text-white hover:bg-white/10'
        )}
      >
        <Icon size={16} className="flex-shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <span className={clsx('transition-transform duration-200', open ? 'rotate-0' : '-rotate-90')}>
          <ChevronDown size={13} />
        </span>
      </button>

      {open && (
        <div className="mt-0.5 mb-1 ml-4 pl-3 border-l-2 border-slate-600/50 space-y-0.5">
          {item.children!.map(child => {
            const CIcon = child.icon;
            const childActive = pathname === child.href || pathname.startsWith(child.href + '/');
            return (
              <Link
                key={child.href}
                href={child.href}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150',
                  childActive
                    ? 'bg-white/15 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/8'
                )}
              >
                <CIcon size={13} className="flex-shrink-0" />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[248px] flex flex-col z-50 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #1a3352 40%, #162b44 100%)' }}
    >
      {/* subtle top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

      {/* Logo / Org */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Fuel size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[13.5px] font-bold text-white leading-tight">SPBP Manokwari</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Fuel Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          <span className="text-[11px] text-slate-300 font-medium">Polda Papua Barat</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map((item, i) => (
          <NavGroup key={i} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate">ADMIN01</p>
            <p className="text-[11px] text-slate-400 truncate">Administrator SPBP</p>
          </div>
          <Settings size={14} className="text-slate-500 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
