'use client'

import { useState } from 'react'
import { Brand, DashboardStats } from '@/types'
import StatCard from './StatCard'
import RecentOrders from './RecentOrders'
import AIAskBar from './AIAskBar'
import { TrendingUp, ShoppingBag, Users, AlertTriangle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  brand: Brand
  stats: DashboardStats
}

export default function PulseDashboard({ brand, stats }: Props) {
  const [activeTab, setActiveTab] = useState<'pulse' | 'orders' | 'stock' | 'customers' | 'ask'>('pulse')
  const router = useRouter()

  const monthGrowth = stats.revenue_last_month > 0
    ? ((stats.revenue_month - stats.revenue_last_month) / stats.revenue_last_month * 100).toFixed(1)
    : null

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="bg-[#0f2040] border-b border-[#1a3050] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {brand.logo_url ? (
            <img src={brand.logo_url} alt={brand.name} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#4db8b8] flex items-center justify-center text-[#0a1628] font-bold text-sm">
              {brand.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-white font-semibold text-sm">{brand.name}</h1>
            <p className="text-[#4db8b8] text-xs">SmarvexAI</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[#8a9bb5] hover:text-white text-sm transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      {/* Nav Tabs */}
      <nav className="bg-[#0f2040] border-b border-[#1a3050] px-6 flex gap-1 overflow-x-auto">
        {[
          { key: 'pulse', label: 'Pulse' },
          { key: 'orders', label: 'Orders' },
          { key: 'stock', label: 'Stock' },
          { key: 'customers', label: 'Customers' },
          { key: 'ask', label: 'Ask AI' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[#4db8b8] text-[#4db8b8]'
                : 'border-transparent text-[#8a9bb5] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="p-6 max-w-6xl mx-auto">

        {/* PULSE TAB */}
        {activeTab === 'pulse' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-lg font-semibold">Today&apos;s Pulse</h2>
              <p className="text-[#8a9bb5] text-sm mt-0.5">Live overview of your brand</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Revenue Today"
                value={`EGP ${stats.revenue_today.toLocaleString()}`}
                icon={<TrendingUp size={18} />}
                color="teal"
              />
              <StatCard
                label="This Month"
                value={`EGP ${stats.revenue_month.toLocaleString()}`}
                sub={monthGrowth ? `${monthGrowth}% vs last month` : undefined}
                icon={<TrendingUp size={18} />}
                color="teal"
              />
              <StatCard
                label="Orders Today"
                value={stats.orders_today.toString()}
                sub={`${stats.orders_month} this month`}
                icon={<ShoppingBag size={18} />}
                color="blue"
              />
              <StatCard
                label="Customers"
                value={stats.total_customers.toLocaleString()}
                sub={`+${stats.new_customers_month} this month`}
                icon={<Users size={18} />}
                color="purple"
              />
            </div>

            {/* Low stock alert */}
            {stats.low_stock_count > 0 && (
              <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl px-5 py-4 flex items-center gap-3">
                <AlertTriangle size={20} className="text-amber-400 shrink-0" />
                <div>
                  <p className="text-amber-300 font-medium text-sm">Low Stock Alert</p>
                  <p className="text-amber-400/70 text-xs mt-0.5">
                    {stats.low_stock_count} variant{stats.low_stock_count > 1 ? 's' : ''} running low (5 units or less). Check your stock tab.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('stock')}
                  className="ml-auto text-amber-400 text-xs hover:underline whitespace-nowrap"
                >
                  View →
                </button>
              </div>
            )}

            {/* Recent Orders */}
            <RecentOrders orders={stats.recent_orders} />
          </div>
        )}

        {/* ASK AI TAB */}
        {activeTab === 'ask' && (
          <AIAskBar brandId={brand.id} brandName={brand.name} />
        )}

        {/* PLACEHOLDER TABS */}
        {(activeTab === 'orders' || activeTab === 'stock' || activeTab === 'customers') && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0f2040] border border-[#1a3050] flex items-center justify-center mb-4">
              {activeTab === 'orders' && <ShoppingBag size={28} className="text-[#4db8b8]" />}
              {activeTab === 'stock' && <AlertTriangle size={28} className="text-[#4db8b8]" />}
              {activeTab === 'customers' && <Users size={28} className="text-[#4db8b8]" />}
            </div>
            <h3 className="text-white font-semibold text-lg capitalize">{activeTab}</h3>
            <p className="text-[#8a9bb5] text-sm mt-2">
              Connect your Shopify store to see your {activeTab} here.
            </p>
            <button className="mt-6 bg-[#4db8b8] text-[#0a1628] font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-[#3da0a0] transition-colors">
              Connect Shopify
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
