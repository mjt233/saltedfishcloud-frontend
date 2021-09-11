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
     */
    execute(executor, time = 1000) {
        if (this.itvHolder) {
            clearInterval(this.itvHolder)
            const itv = setInterval(async() => {
                try {
                    executor()
                } catch (e) { console.log(e) }
                clearInterval(itv)
                this.itvHolder = null
            }, time)
            this.itvHolder = itv
        } else {
            try {
                executor()
            } catch (e) { console.log(e) }
            const itv = setInterval(() => {
                clearInterval(itv)
                this.itvHolder = null
            }, time)
            this.itvHolder = itv
        }
    }
}
export {
    Debouncer,
    Throttle
}
