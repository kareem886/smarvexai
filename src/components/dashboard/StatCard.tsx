interface Props {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  color: 'teal' | 'blue' | 'purple' | 'amber'
}

const colorMap = {
  teal: 'bg-teal-900/30 text-teal-400',
  blue: 'bg-blue-900/30 text-blue-400',
  purple: 'bg-purple-900/30 text-purple-400',
  amber: 'bg-amber-900/30 text-amber-400',
}

export default function StatCard({ label, value, sub, icon, color }: Props) {
  return (
    <div className="bg-[#0f2040] border border-[#1a3050] rounded-xl p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-[#8a9bb5] text-xs mb-1">{label}</p>
      <p className="text-white font-bold text-xl">{value}</p>
      {sub && <p className="text-[#8a9bb5] text-xs mt-1">{sub}</p>}
    </div>
  )
}
