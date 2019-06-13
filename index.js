module.exports = mergeri

function mergeri (matchers, t) {
    matchers = convertMatchers(matchers || {})
    t = Object(t)

    var len = arguments.length
    for (var i = 2; i < len; i++) t = merge(matchers, t, Object(arguments[i]))

    return t
}

function convertMatchers (matchers) {
    var res = []

    for (var k in matchers) {
        if (!hasOwn(matchers, k)) continue

        var tester = convertTester(matchers[k])
        if (k.slice(-1) !== '*') k += '.*'

        res.push([k.split('.'), tester])
    }

    return res
}

function convertTester (v) {
    if (typeof v === 'function') return v

    if (typeof v === 'string') {
        return function (_, __, tV, srcV) {
            return isObjAll(tV, srcV) && get(tV, v) === get(srcV, v)
        }
    }

    if (isArr(v)) {
        return function (_, __, tV, srcV) {
            if (!isObjAll(tV, srcV)) return false
            var len = v.length
            for (var i = 0; i < len; i++) {
                if (get(tV, v[i]) !== get(srcV, v[i])) return false
            }
            return true
        }
    }

    return returnFalse
}

function merge (matchers, root, src) {
    var curr = [root, src, []]
    var stack = [curr]
    var t, addr, tester, srcK, tK, found

    while (curr = stack.pop()) {
        t = curr[0]
        src = curr[1]
        addr = curr[2]
        tester = undefined

        for (srcK in src) {
            if (!hasOwn(src, srcK)) continue

            if (tester === undefined) tester = findTester(matchers, addr)
            if (tester) {
                found = false
                for (tK in t) {
                    if (hasOwn(t, tK) && tester(tK, srcK, t[tK], src[srcK], t, src)) {
                        found = true
                        break
                    }
                }
                if (!found) tK = isArr(t) ? t.length : srcK
            } else {
                tK = srcK
            }

            if (!tester && isArr(t) && isArr(src)) {
                t.push(src[srcK])
                continue
            }

            if (hasOwn(t, tK) && isExtensible(t[tK]) && isExtensible(src[srcK])) {
                stack.push([t[tK], src[srcK], addr.concat(tK)])
                continue
            }

            t[tK] = src[srcK]
        }
    }

    return root
}

function findTester (matchers, addr) {
    var len = matchers.length
    for (var i = 0; i < len; i++) {
        if (isMatched(matchers[i][0], addr)) return matchers[i][1]
    }
    return null
}

function isMatched (paths, addr) {
    var len = addr.length
    if (len !== paths.length - 1) return false
    for (var i = 0; i < len; i++) {
        if (addr[i] !== paths[i] && paths[i] !== '*') return false
    }
    return true
}

function isObjAll () {
    var len = arguments.length
    for (var i = 0; i < len; i++) {
        if (typeof arguments[i] !== 'object') return false
    }
    return true
}

function isArr (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
}

function hasOwn (o, prop) {
    return Object.prototype.hasOwnProperty.call(o, prop)
}

function get (o, str) {
    var paths = str.split('.')
    while (paths.length) {
        if ((o = o[paths.shift()]) === undefined) return
    }
    return o
}

function isExtensible (obj) {
    var type = typeof obj
    return obj && (type === 'object' || type === 'function')
}

function returnFalse () {
    return false
}
