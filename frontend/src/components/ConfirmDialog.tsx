interface Props {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onCancel}>
      <div
        className="bg-dracula-bg border border-dracula-current rounded-xl w-full max-w-sm p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-dracula-red mb-2">{title}</h3>
        <p className="text-sm text-dracula-comment mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-dracula-comment hover:text-dracula-fg rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-dracula-red text-dracula-bg rounded-lg font-medium hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
