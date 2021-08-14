/**
 * 执行一系列事件handler
 * @param {import("./FileQueue").QueueEventHandler[]} handlers 事件handler集合
 * @param {any} param 给handler传入的参数
 */
function emit(handlers, param) {
    handlers.forEach(handler => {
        try {
            handler(param)
        } catch (error) {
            console.error(error)
        }
    })
}


export {
    emit
}
