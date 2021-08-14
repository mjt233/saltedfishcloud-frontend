import { emit } from './QueueUtils'
const QueueStatus = {
    EXECUTING: 'executing',
    PAUSING: 'pausing',
    PAUSED: 'paused',
    EMPTY: 'empty'
}
const queueInfo = {
    eventBinding: {
        add: [],
        paused: [],
        pausing: [],
        resume: [],
        stop: [],
        upload: [],
        complete: [],
        statusChange: []
    },
    /**
     * @type {import('./FileQueueHandler').FileInfo}
     */
    queue: [],
    status: 'waiting',
    /**
     * @type {import('@/utils/FormUtils/FileFormUtils').FileSliceUploader}
     */
    uploader: null
}
Object.defineProperty(queueInfo, 'status', {
    old: queueInfo.status,
    get(v) {
        return v
    },
    set(v) {
        if (this.old != v) {
            emit(queueInfo.eventBinding.statusChange, v)
        }
        this.old = v
    }
})

export {
    queueInfo as FileUploadQueue,
    QueueStatus
}
