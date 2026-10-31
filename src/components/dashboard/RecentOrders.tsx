import { Order } from '@/types'

interface Props {
  orders: Order[]
}

const statusColor: Record<string, string> = {
  paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  refunded: 'bg-red-500/10 text-red-400 border border-red-500/20',
  voided: 'bg-white/5 text-white/30 border border-white/8',
}

export default function RecentOrders({ orders }: Props) {
  if (!orders.length) {
    return (
      <div className="bg-[#0c1525] border border-white/6 rounded-xl p-8 text-center">
        <p className="text-white/25 text-sm">No orders yet — connect your Shopify store to see live orders.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0c1525] border border-white/6 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-white/80 font-semibold text-sm">Recent Orders</h3>
        <span className="text-white/25 text-xs">{orders.length} orders</span>
      </div>
      <div className="divide-y divide-white/4">
        {orders.map((order) => (
          <div key={order.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-white/2 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/4 border border-white/6 flex items-center justify-center text-[11px] text-white/30 font-mono shrink-0">
                #{order.order_number}
              </div>
              <div className="min-w-0">
                <p className="text-white/70 text-sm truncate font-medium">
                  {order.email || 'Guest'}
                </p>
                <p className="text-white/25 text-xs">
                  {new Date(order.shopify_created_at).toLocaleDateString('en-EG', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium capitalize ${statusColor[order.financial_status] || 'bg-white/5 text-white/30 border border-white/8'}`}>
                {order.financial_status}
              </span>
              <p className="text-white font-semibold text-sm">
                EGP {Number(order.total_price).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
