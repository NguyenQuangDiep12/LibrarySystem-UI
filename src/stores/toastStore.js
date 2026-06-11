import { create } from 'zustand'

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now()
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }))
    const duration = toast.type === 'error' ? 5000 : toast.type === 'warning' ? 4000 : 3000
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, duration)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (message) => useToastStore.getState().addToast({ type: 'success', message }),
  error: (message) => useToastStore.getState().addToast({ type: 'error', message }),
  warning: (message) => useToastStore.getState().addToast({ type: 'warning', message }),
}
