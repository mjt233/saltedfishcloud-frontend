let fullLog = ''
let isDirty = false

const MAX_LENGTH = 50000

function truncateLog() {
  if (fullLog.length > MAX_LENGTH) {
    const overflowLength = fullLog.length - MAX_LENGTH
    const firstNewline = fullLog.indexOf('\n', overflowLength)
    fullLog = fullLog.slice(firstNewline !== -1 ? firstNewline + 1 : overflowLength)
  }
}

self.addEventListener('message', (e) => {
  const { type, payload } = e.data
  if (type === 'append') {
    fullLog += payload
    isDirty = true
    truncateLog()
  } else if (type === 'reset') {
    fullLog = payload || ''
    isDirty = true
    truncateLog()
  }
})

setInterval(() => {
  if (isDirty) {
    self.postMessage({ type: 'update', payload: fullLog })
    isDirty = false
  }
}, 200)
