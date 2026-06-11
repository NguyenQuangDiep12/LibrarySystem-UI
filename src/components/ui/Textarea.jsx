export default function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-blue-100 ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
