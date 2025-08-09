import { ref } from 'vue'

type ToastItem = { id: number; text: string; type?: 'info'|'success'|'warn'|'error'; timeout?: number }
const list = ref<ToastItem[]>([])
let seq = 1

export function useToast() {
  function push(text: string, type: ToastItem['type']='success', timeout=2200) {
    const id = seq++
    list.value.push({ id, text, type, timeout })
    setTimeout(() => remove(id), timeout)
  }
  function remove(id: number) {
    const i = list.value.findIndex(t => t.id === id)
    if (i >= 0) list.value.splice(i, 1)
  }
  return { toasts: list, push, remove }
}
