/**
 * 函数节流执行器
 */
class Throttle {
    /**
     * 节流方式执行函数
     * @param {Function} executor 函数执行体
     * @param {Number=} time 两次之间触发的间隔
     */
    execute(executor, time = 1000) {
        if (!this.timeout) {
            try {
                executor()
            } catch (e) { console.log(e) }
            this.timeout = setTimeout(() => {
                this.timeout = null
            }, time)
        }
    }
}
/**
 * 函数防抖执行器
 */
class Debouncer {
    /**
     * 防抖方式执行函数
     * @param {Function} executor 执行体
     * @param {Number} time 延迟
     * @param {Boolean} immediate 可用时是否立即执行
     * @param {Boolean} ignoreExecute 对于被拦截的请求是否忽略而不是延迟执行
     */
    execute(executor, time = 1000, immediate = true, ignoreExecute = false) {
        if (this.itvHolder) {
            if (ignoreExecute) return
            // 存在等待
            clearInterval(this.itvHolder)
            const itv = setInterval(() => {
                try {
                    executor()
                } catch (e) { console.log(e) }
                clearInterval(itv)
                this.itvHolder = null
            }, time)
            this.itvHolder = itv
        } else if (immediate) {
            // 立即执行
            try {
                executor()
            } catch (e) { console.log(e) }
            const itv = setInterval(() => {
                clearInterval(itv)
                this.itvHolder = null
            }, time)
            this.itvHolder = itv
        } else {
            // 延迟执行
            const itv = setInterval(() => {
                clearInterval(itv)
                this.itvHolder = null
                try {
                    executor()
                } catch (error) { console.log(error) }
            }, time)
            this.itvHolder = itv
        }
    }
}
export {
    Debouncer,
    Throttle
}
