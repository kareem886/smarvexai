interface Props {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  color: 'teal' | 'blue' | 'purple' | 'amber'
}

const colorMap = {
  teal: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  purple: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
}

export default function StatCard({ label, value, sub, icon, color }: Props) {
  return (
    <div className="bg-[#0c1525] border border-white/6 rounded-xl p-4 hover:border-white/10 transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-white/40 text-xs mb-1 font-medium">{label}</p>
      <p className="text-white font-bold text-xl tracking-tight">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  )
}
