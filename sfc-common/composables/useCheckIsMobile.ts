import { onMounted, onUnmounted, ref } from 'vue'

export function useCheckIsMobile() {
  const isMobile = ref(false)
  const check = () => {
    isMobile.value = window.innerWidth < 720
  }
  onMounted(() => {
    check()
    window.addEventListener('resize', check)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', check)
  })
  return isMobile
}