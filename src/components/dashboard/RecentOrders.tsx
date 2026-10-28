import { Order } from '@/types'

interface Props {
  orders: Order[]
}

const statusColor: Record<string, string> = {
  paid: 'bg-teal-900/30 text-teal-400',
  pending: 'bg-amber-900/30 text-amber-400',
  refunded: 'bg-red-900/30 text-red-400',
  voided: 'bg-gray-900/30 text-gray-400',
}

export default function RecentOrders({ orders }: Props) {
  if (!orders.length) {
    return (
      <div className="bg-[#0f2040] border border-[#1a3050] rounded-xl p-6 text-center">
        <p className="text-[#8a9bb5] text-sm">No orders yet — connect your Shopify store to see live orders.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0f2040] border border-[#1a3050] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1a3050]">
        <h3 className="text-white font-semibold text-sm">Recent Orders</h3>
      </div>
      <div className="divide-y divide-[#1a3050]">
        {orders.map((order) => (
          <div key={order.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#0a1628] border border-[#1a3050] flex items-center justify-center text-xs text-[#8a9bb5] shrink-0">
                #{order.order_number}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm truncate">
                  {order.email || 'Guest'}
                </p>
                <p className="text-[#8a9bb5] text-xs">
                  {new Date(order.shopify_created_at).toLocaleDateString('en-EG', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${statusColor[order.financial_status] || 'bg-gray-900/30 text-gray-400'}`}>
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
