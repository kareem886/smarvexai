'use client'

import { useState, useEffect } from 'react'
import { Brand, DashboardStats } from '@/types'
import StatCard from './StatCard'
import RecentOrders from './RecentOrders'
import SiroChat from './SiroChat'
import { TrendingUp, ShoppingBag, Users, AlertTriangle, LogOut, LayoutDashboard, Package, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  brand: Brand
  stats: DashboardStats
  shopifyConnected?: boolean
  shopifyDomain?: string | null
}

export default function PulseDashboard({ brand, stats, shopifyConnected = false, shopifyDomain = null }: Props) {
  const [activeTab, setActiveTab] = useState<'pulse' | 'orders' | 'stock' | 'customers' | 'siro'>('pulse')
  const [shopifyToast, setShopifyToast] = useState(false)
  const [connectingShopify, setConnectingShopify] = useState(false)

  const monthGrowth = stats.revenue_last_month > 0
    ? ((stats.revenue_month - stats.revenue_last_month) / stats.revenue_last_month * 100).toFixed(1)
    : null

  // Show success toast if redirected back after Shopify connect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('shopify') === 'connected') {
        setShopifyToast(true)
        window.history.replaceState({}, '', '/dashboard')
        setTimeout(() => setShopifyToast(false), 5000)
      }
    }
  }, [])

  const handleConnectShopify = () => {
    const shop = prompt('Enter your Shopify store domain (e.g. mystore.myshopify.com):')
    if (!shop) return
    const domain = shop.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    if (!domain.includes('.myshopify.com')) {
      alert('Please enter a valid .myshopify.com domain')
      return
    }
    setConnectingShopify(true)
    window.location.href = `/api/shopify/install?shop=${encodeURIComponent(domain)}`
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const tabs = [
    { key: 'pulse', label: 'Pulse', icon: <LayoutDashboard size={15} /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag size={15} /> },
    { key: 'stock', label: 'Stock', icon: <Package size={15} /> },
    { key: 'customers', label: 'Customers', icon: <Users size={15} /> },
    { key: 'siro', label: 'SIRO', icon: <Sparkles size={15} /> },
  ]

  return (
    <div className="min-h-screen bg-[#080d1a] text-white">

      {/* Shopify connected toast */}
      {shopifyToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 shadow-lg shadow-black/40 text-sm font-medium animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          Shopify connected successfully!
        </div>
      )}

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-56 bg-[#0c1525] border-r border-white/5 flex flex-col z-20 hidden lg:flex">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-violet-500/25">
              S
            </div>
            <div>
              <p className="text-white font-semibold text-sm tracking-tight">SIRO</p>
              <p className="text-violet-400 text-[10px] font-medium">powered by SmarvexAI</p>
            </div>
          </div>
        </div>

        {/* Brand pill */}
        <div className="px-3 py-3 border-b border-white/5">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500/30 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center text-violet-300 font-bold text-xs shrink-0">
              {brand.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-white/80 text-xs font-medium truncate">{brand.name}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? tab.key === 'siro'
                    ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-300 border border-violet-500/20'
                    : 'bg-white/8 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <span className={activeTab === tab.key && tab.key === 'siro' ? 'text-violet-400' : ''}>{tab.icon}</span>
              {tab.label}
              {tab.key === 'siro' && (
                <span className="ml-auto text-[9px] font-semibold bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/20">AI</span>
              )}
            </button>
          ))}
        </nav>

        {/* Shopify status */}
        <div className="px-3 py-3 border-t border-white/5">
          {shopifyConnected ? (
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400/80 text-xs truncate">{shopifyDomain}</span>
            </div>
          ) : (
            <button
              onClick={handleConnectShopify}
              disabled={connectingShopify}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 text-white/50 hover:text-white/80 text-xs font-medium transition-all"
            >
              <ExternalLink size={13} />
              {connectingShopify ? 'Connecting…' : 'Connect Shopify'}
            </button>
          )}
        </div>

        {/* Logout */}
        <div className="px-3 pb-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile header */}
      <header className="lg:hidden bg-[#0c1525] border-b border-white/5 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            S
          </div>
          <div>
            <p className="text-white font-semibold text-sm">SIRO</p>
            <p className="text-violet-400 text-[10px]">powered by SmarvexAI</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-white/30 hover:text-white/60 transition-colors">
          <LogOut size={16} />
        </button>
      </header>

      {/* Mobile tabs */}
      <div className="lg:hidden bg-[#0c1525] border-b border-white/5 px-2 flex overflow-x-auto sticky top-[57px] z-10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? tab.key === 'siro'
                  ? 'border-violet-500 text-violet-400'
                  : 'border-white text-white'
                : 'border-transparent text-white/40'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="lg:pl-56 min-h-screen">
        <div className="p-5 lg:p-7 max-w-5xl">

          {/* PULSE TAB */}
          {activeTab === 'pulse' && (
            <div className="space-y-6">
              {/* Page header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-white font-semibold text-xl tracking-tight">Pulse</h1>
                  <p className="text-white/40 text-sm mt-0.5">Live overview of your brand</p>
                </div>
                <div className="hidden lg:flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-violet-400 text-xs font-medium">Live</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                  label="Revenue Today"
                  value={`EGP ${stats.revenue_today.toLocaleString()}`}
                  icon={<TrendingUp size={16} />}
                  color="purple"
                />
                <StatCard
                  label="This Month"
                  value={`EGP ${stats.revenue_month.toLocaleString()}`}
                  sub={monthGrowth ? `${Number(monthGrowth) >= 0 ? '↑' : '↓'} ${Math.abs(Number(monthGrowth))}% vs last month` : undefined}
                  icon={<TrendingUp size={16} />}
                  color="purple"
                />
                <StatCard
                  label="Orders Today"
                  value={stats.orders_today.toString()}
                  sub={`${stats.orders_month} this month`}
                  icon={<ShoppingBag size={16} />}
                  color="blue"
                />
                <StatCard
                  label="Customers"
                  value={stats.total_customers.toLocaleString()}
                  sub={`+${stats.new_customers_month} this month`}
                  icon={<Users size={16} />}
                  color="teal"
                />
              </div>

              {/* Low stock alert */}
              {stats.low_stock_count > 0 && (
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3.5 flex items-center gap-3">
                  <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                  <p className="text-amber-300/80 text-sm">
                    <span className="font-semibold text-amber-300">{stats.low_stock_count} variant{stats.low_stock_count > 1 ? 's' : ''}</span> running low on stock
                  </p>
                  <button onClick={() => setActiveTab('stock')} className="ml-auto text-amber-400 text-xs hover:underline shrink-0">
                    View →
                  </button>
                </div>
              )}

              {/* Siro insight teaser */}
              <button
                onClick={() => setActiveTab('siro')}
                className="w-full bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/15 rounded-xl px-4 py-4 flex items-center gap-3 hover:border-violet-500/30 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm font-medium">Ask SIRO anything</p>
                  <p className="text-white/30 text-xs mt-0.5">What's driving my revenue this month? Why did sales drop?</p>
                </div>
                <span className="text-violet-400/60 group-hover:text-violet-400 transition-colors text-sm">→</span>
              </button>

              {/* Recent Orders */}
              <RecentOrders orders={stats.recent_orders} />
            </div>
          )}

          {/* SIRO TAB */}
          {activeTab === 'siro' && (
            <SiroChat brandId={brand.id} brandName={brand.name} />
          )}

          {/* PLACEHOLDER TABS */}
          {(activeTab === 'orders' || activeTab === 'stock' || activeTab === 'customers') && (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
                {activeTab === 'orders' && <ShoppingBag size={24} className="text-white/30" />}
                {activeTab === 'stock' && <Package size={24} className="text-white/30" />}
                {activeTab === 'customers' && <Users size={24} className="text-white/30" />}
              </div>
              <h3 className="text-white font-semibold text-base capitalize">{activeTab}</h3>
              <p className="text-white/30 text-sm mt-2 max-w-xs">
                Connect your Shopify store to unlock your {activeTab} dashboard.
              </p>
              {shopifyConnected ? (
                <div className="mt-5 flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle2 size={15} />
                  <span>Shopify connected — data syncing soon</span>
                </div>
              ) : (
                <button
                  onClick={handleConnectShopify}
                  disabled={connectingShopify}
                  className="mt-5 bg-white text-[#080d1a] font-semibold px-5 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors disabled:opacity-60"
                >
                  {connectingShopify ? 'Connecting…' : 'Connect Shopify'}
                </button>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
