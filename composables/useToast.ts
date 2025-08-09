type Toast = { id:number; message:string; timeout?:number }
const list = ref<Toast[]>([])
let seq = 1
export function useToast() {
  function push(message:string, timeout=3000) {
    const id = seq++
    list.value.push({ id, message, timeout })
    if (timeout>0) setTimeout(()=> remove(id), timeout)
  }
  function remove(id:number){ list.value = list.value.filter(t=>t.id!==id) }
  return { list, push, remove }
}
