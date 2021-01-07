const DOMUtils = {
    /**
     * 计算一个父子节点之间的总offsetTop（途径节点必须position必须为非static或非默认）
     * @param {HTMLElement} childElement 子节点
     * @param {HTMLElement} parentElement 父节点
     * @return {Number}
     */
    getAbsoluteOffsetTop(childElement, parentElement) {
        let el = childElement
        let res = 0
        let log = []
        while (el !== parentElement && el !== document.body) {
            if (window.getComputedStyle(el).position !== 'static') {
                res += el.offsetTop
            }
            el = el.parentElement
        }
        return res
    },
    /**
     * 计算一个父子节点之间的总offsetLeft（途径节点必须position必须为非static或非默认）
     * @param {HTMLElement} childElement 子节点
     * @param {HTMLElement} parentElement 父节点
     * @return {Number}
     */
    getAbsoluteOffsetLeft(childElement, parentElement) {
        let el = childElement
        let res = 0
        while (el !== parentElement && el !== document.body) {
            if (window.getComputedStyle(el).position !== 'static') {
                res += el.offsetLeft
            }
            el = el.parentElement
        }
        return res
    },
    /**
     * 根据类名取某个元素的父节点，成功返回DOM，失败返回null
     * @param {HTMLElement} elem
     * @param {String} className
     * @return {HTMLElement}
     */
    getElParentByClass (elem, className) {
        let t = elem
        while(t.nodeName === '#text' || (!t.classList.contains(className) && t.tagName !== 'HTML')) {
            t = t.parentNode
        }
        if (t.tagName === 'HTML') {
            return null
        } else {
            return t
        }
    }
}
module.exports = DOMUtils