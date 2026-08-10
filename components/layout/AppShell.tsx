'use client';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[248px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 bg-[#f4f6f9]">
          {children}
        </main>
      </div>
    </div>
  );
}
