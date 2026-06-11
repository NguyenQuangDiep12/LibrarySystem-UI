import Button from './Button'

export default function Pagination({ page, totalPages, totalRecords, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
      <p className="text-sm text-slate-500">
        Tổng cộng <span className="font-medium text-slate-700">{totalRecords}</span> kết quả
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Trước
        </Button>
        <span className="text-sm text-slate-600">
          Trang {page} / {totalPages}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Sau
        </Button>
      </div>
    </div>
  )
}
