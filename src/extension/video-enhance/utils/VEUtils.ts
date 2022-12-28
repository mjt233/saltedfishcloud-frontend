function paddingZero(input: number) {
  if (input < 10) {
    return '0' + input
  } else {
    return '' + input
  }
}

export namespace VEUtils {
  export function formatBitRate(input: string | number) {
    if (input < 1000) {
      return input + 'bps'
    } else if (input < 1000000) {
      return (Number(input) / 1000).toFixed(2) + 'Kbps'
    } else if (input < 1000000000) {
      return (Number(input) / 1000000).toFixed(2) + 'Mbps'
    } else {
      return input
    }
  }

  export function formatDuration(input: string | number) {
    const sec = Number(input)
    const h = paddingZero(Math.floor(sec/3600))
    const m = paddingZero(Math.floor(sec/60%60))
    const s = paddingZero(Math.floor(sec%60))
    return `${h}:${m}:${s}`
  }
}