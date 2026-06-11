import Button from './Button'

export default function ErrorState({ message = 'Đã xảy ra lỗi', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-red-600">{message}</p>
      {onRetry && (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  )
}
