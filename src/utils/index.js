/**
 * @author GuangHui
 * @description 常用js工具函数
 */

/**
 * 取一个区间的随机整数
 * @param {Number} min 最小值
 * @param {Number} max 最大值
 */
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * 随机打乱一个数组
 * @param arr
 * @returns {Array}
 */
export function shuffle(arr) {
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

/**
 * 去抖函数
 * (underscore 1.8.2实现)
 * http://www.css88.com/doc/underscore/docs/underscore.html
 * 连续触发某一事件时，只在最后一次事件触发时的wait时间后才真正执行处理函数
 * 场景：搜索建议（停止输入后再触发请求）
 * @param   {Function}  func  需要延迟的函数
 * @param   {Number}    wait  延迟时间
 * @param   {Boolean}   immediate 是否需要在第一次触发时立即执行func
 * @returns {Function}
 */
export function debounce(func, wait, immediate) {
  var timeout, args, context, timestamp, result

  var later = function() {
    var last = new Date().getTime() - timestamp

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function() {
    context = this
    args = arguments
    timestamp = new Date().getTime()
    var callNow = immediate && !timeout
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * 节流函数
 * (underscore 1.8.2实现)
 * http://www.css88.com/doc/underscore/docs/underscore.html
 * 连续触发某一事件时，会自动间隔wait时间去执行一次处理函数
 * wait时间内重复触发的事件会被忽略
 * 节流会稀释函数的执行频率
 * 场景：resize、scroll时并不需要如此密集的事件触发频率
 * @param   {Function}  func
 * @param   {Number}    wait
 * @param   {Boolean}   options
 * @returns {Function}
 */
export function throttle(func, wait, options) {
  var context, args, result
  var timeout = null
  var previous = 0
  if (!options) options = {}
  var later = function() {
    previous = options.leading === false ? 0 : new Date().getTime()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function() {
    var now = new Date().getTime()
    if (!previous && options.leading === false) previous = now
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

/**
 * 实现分时的函数，在intervalTime时间间隔内执行count次fn函数
 * @param {Array}     ary       每次fn执行需要的参数数组
 * @param {Function}  fn        处理函数
 * @param {Number}    count     每个时间间隔内执行的次数
 * @param {Number}    interval  时间间隔
 */
export function timeChunk(ary, fn, count, interval) {
  var obj,
    t,
    len = ary.length,
    intervalTime = interval || 200 // 默认时间间隔200ms
  var start = function() {
    for (var i = 0; i < Math.min(count || 1, len); i++) {
      obj = ary.shift()
      fn(obj)
    }
  }
  return function() {
    t = setInterval(function() {
      if (ary.length === 0) {
        return clearInterval(t)
      }
      start()
    }, intervalTime)
  }
}

/**
 * 将一个数组按size拆分成多个数组的块，然后把这些块组成新的数组
 * @author cgh
 * @time   2018-04-09
 * @param  {[type]}   array [description]
 * @param  {[type]}   size  [description]
 * @return {[type]}         [返回一个新数组]
 * @example
 *
 * chunk(['a', 'b', 'c', 'd'], 2);
 * // => [['a', 'b'], ['c', 'd']]
 *
 * chunk(['a', 'b', 'c', 'd'], 3);
 * // => [['a', 'b', 'c'], ['d']]
 */
export function chunk(array, size) {
  let length = array.length ? array.length : 0
  if (!length || !size) {
    return []
  }
  let index = 0
  let resIndex = 0
  let result = new Array(Math.ceil(length / size))

  while (index < length) {
    result[resIndex++] = array.slice(index, (index += size))
  }
  return result
}

/**
 * dateFormat unix时间戳格式化
 */
export function dateFormat(timestamp, format = 'yyyy-MM-dd hh:mm:ss') {
  timestamp = timestamp.toString().length === 13 ? timestamp : timestamp * 1000
  let date = new Date(timestamp)
  let args = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (var i in args) {
    let n = args[i]
    if (new RegExp('(' + i + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? n : ('00' + n).substr(('' + n).length)
      )
    }
  }
  return format
}

/**
 * 判断浏览器是否支持passive模式
 */
export const eventListenerPassiveSupported = () => {
  let supported = false

  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        supported = true
      }
    })

    window.addEventListener('test', null, opts)
    window.removeEventListener('test', null, opts)
  } catch (e) {}

  return supported
}

/**
 * 断言
 *
 * @export
 * @param {Any} conditions
 * @param {String} msg
 */
export function assert(conditions, msg) {
  if (process.env.NODE_ENV === 'production') return

  if (!conditions) console.warn(`[Assert Error]:${msg}`)
}

/**
 * 解析查询字符串
 * @param {String} qs 需要解析的查询字符串
 * @return {Object} 解析后的对象
 * http://www.domain.com/?user=anonymous&id=123&id=456&city=%E5%8C%97%E4%BA%AC&d&enabled
 * 解析后:
 * {
  user: 'anonymous',
  id: [123, 456],     // 重复出现的 key 要组装成数组，能被转成数字的就转成数字类型
  city: '北京',        // 中文
  enabled: true,      // 未指定值的 key 约定值为 true
  d:true
}
 */
export function getQueryObject(qs = location.search) {
  if (!qs || typeof qs !== 'string') return {}

  qs = decodeURIComponent(qs.substring(qs.lastIndexOf('?')))

  const re = /([^?&=]+)(=([^&?=]+))?/g

  const obj = {}

  for (let result = re.exec(qs); result != null; result = re.exec(qs)) {
    let { 1: key, 3: value } = result

    if (value == null) {
      obj[key] = true
      continue
    }

    if (!isNaN(Number(value))) value = Number(value)

    const target = obj[key]
    if (target) {
      if (Array.isArray(target)) {
        target.push(value)
      } else {
        obj[key] = [target, value]
      }
    } else {
      obj[key] = value
    }
  }

  return obj
}

/**
 * 驼峰、帕斯卡转烤串
 * @param {String} str camelCase、PascalCase字符串
 * @returns {String} kebab-case字符串
 */
export const str2kebab = str => str.replace(/\B([A-Z])/g, '-$1').toLowerCase()

/**
 * 毫秒转换为 时'分"秒 形式
 * @param {Number|String} num 需要转换的数字
 * @param {String} sep 主要分隔符；默认为'
 * @param {String} subSep 次要分隔符；默认为"
 * @param {Boolean} needPadZero 是否需要前补0；默认为true
 * @param {Boolean} showH 是否需要展示时；默认为true
 * @param {Boolean} showM 是否需要展示分；默认为true
 */
export function ms2hms({
  num,
  sep = "'",
  subSep = '"',
  needPadZero = true,
  showH = true,
  showM = true
}) {
  const n = Math.floor(num)
  // null 会被floor函数转为0
  if (isNaN(n) || n === 0) return num

  const padZeroFn = num => `${num < 10 && num >= 0 ? '0' + num : num}`

  const ms2s = ms => Math.floor(ms / 1000)

  const ms2m = ms => Math.floor(ms2s(ms) / 60)

  const ms2h = ms => Math.floor(ms2m(ms) / 60)

  if (!showM) return needPadZero ? padZeroFn(ms2s(n)) : n + ''

  if (!showH) {
    const m = ms2m(n)
    const s = ms2s(n) % 60

    return needPadZero
      ? `${padZeroFn(m)}${subSep}${padZeroFn(s)}`
      : `${m}${subSep}${s}`
  } else {
    const h = ms2h(n)
    const m = ms2m(n) % 60
    const s = ms2s(n) % 60

    return needPadZero
      ? `${padZeroFn(h)}${sep}${padZeroFn(m)}${subSep}${padZeroFn(s)}`
      : `${h}${sep}${m}${subSep}${s}`
  }
}

/**
 * 保留位数
 *
 * @export
 * @param {*} originalNum 原始值
 * @param {number} [keepCount=1] 保留的位数，默认1
 * @param {boolean} [round=true] 四舍五入，默认为true，否则直接截取
 * @param {boolean} [keepNegativeZero=false] 是否保留负零，默认为false，不保留
 * @returns {string} 调整后的数字字符串
 */
export function fixedDecimal(
  originalNum,
  keepCount = 1,
  round = true,
  keepNegativeZero = false
) {
  let num = parseFloat(originalNum)
  if (isNaN(num)) return originalNum

  let numStr = ''
  if (round) {
    numStr = num.toFixed(keepCount)
  } else {
    const stringNum = num.toString()
    let { 0: interget, 1: decimal = '' } = stringNum.split('.')

    if (!keepCount) return interget

    let decimalLen = decimal ? decimal.length : 0
    if (decimalLen === keepCount) return stringNum

    if (decimalLen > keepCount) return decimal.substring(0, keepCount)

    while (decimalLen < keepCount) {
      decimal = decimal + '0'
      decimalLen++
    }

    numStr = `${interget}.${decimal}`
  }

  return !keepNegativeZero &&
    parseFloat(numStr) === 0 &&
    numStr.indexOf('-') === 0
    ? numStr.slice(1)
    : numStr
}

/**
 * 数字转百分比
 * @param {Number|String} originalNum 需要转换的数字
 */
export function num2percentage(originalNum) {
  const num = parseFloat(originalNum)
  if (isNaN(num) || num > 1 || num < 0) return originalNum

  return num * 100
}

/**
 * 数组深度扁平化
 * @param {Array} arr 待转换数组
 */
export const flatten = arr =>
  arr.reduce(
    (result, shouldFlatten) =>
      result.concat(
        Array.isArray(shouldFlatten) ? flatten(shouldFlatten) : shouldFlatten
      ),
    []
  )

/**
 * 替换emoji
 * @param {String} str 原始字符串
 * @param {String} placeholder 替换字符
 */
export const replaceEmoji = (str, placeholder = '') =>
  typeof str === 'string'
    ? str.replace(
        /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g,
        placeholder
      )
    : str

/**
 * 从url中获取图片的流
 * @param {String} url 图片url
 */
export function getImgURLBlob(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open('GET', url, true)
    xhr.responseType = 'blob'

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.response)
    }

    xhr.onerror = reject

    xhr.send()
  })
}
