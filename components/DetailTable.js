export default function DetailTable({ title, icon, rows }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/10 flex items-center gap-2">
        {icon && <span className="text-white/40">{icon}</span>}
        <h3 className="font-semibold text-white/75 text-sm">{title}</h3>
      </div>
      <table className="w-full">
        <tbody>
          {rows.map(({ label, value, status }) => (
            <tr key={label} className="border-b border-white/5 last:border-0">
              <td className="px-5 py-3 text-white/45 text-sm w-[45%]">{label}</td>
              <td className="px-5 py-3 text-sm font-medium leading-snug">
                {status === "good" && (
                  <span className="text-emerald-400">{value}</span>
                )}
                {status === "warn" && (
                  <span className="text-yellow-400">{value}</span>
                )}
                {status === "bad" && (
                  <span className="text-red-400">{value}</span>
                )}
                {!status && <span className="text-white/75">{value}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
