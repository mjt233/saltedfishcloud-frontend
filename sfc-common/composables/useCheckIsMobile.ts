import { onMounted, onUnmounted, ref } from 'vue'

const isMobile = ref(false)
const check = () => {
  isMobile.value = window.innerWidth < 720
}

check()
window.addEventListener('resize', check)
export function useCheckIsMobile() {
  return isMobile
}