module.exports = mergeri

function mergeri (matchers, t) {
    matchers = convertMatchers(matchers || {})
    t = Object(t)

    var len = arguments.length
    for (var i = 2; i < len; i++) t = merge(matchers, Object(arguments[i]))

    return t
}

function convertMatchers (matchers) {
    var res = []
    for (var k in matchers) {
        if (!hasOwn(k)) continue
        var addr = k.split('.')
        if (addr[addr.length - 1] !== '*') addr.push('*')
        res.push([addr, convertTester(matchers[k])])
    }
    return res
}

function convertTester (v) {
    if (typeof v === 'function') return v
    if (typeof v === 'string') {
        return function (_, __, tV, srcV) {
            return get(tV, v) === get(srcV, v)
        }
    }
    if (isArr(v)) {
        return function (_, __, tV, srcV) {
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
    var t, paths, tester, srcK, tK, found

    while (curr = stack.pop()) {
        t = curr[0]
        src = curr[1]
        paths = curr[2]

        for (srcK in src) {
            if (!hasOwn(src, srcK)) continue

            if (tester = findTester(matchers, paths)) {
                found = false
                for (tK in t) {
                    if (hasOwn(t, tK) && tester(tK, srcK, t[tK], src[srcK], t, src)) {
                        found = true
                        break
                    }
                }
                if (!found) tK = srcK
            } else {
                tK = srcK
            }

            if (hasOwn(t, tK) && isExtensible(t[tK]) && isExtensible(src[srcK])) {
                stack.push([t[tK], src[srcK], paths.concat(tK)])
                continue
            }

            if (isArr(t) && isArr(src)) {
                t.push(src[srcK])
            } else {
                t[tK] = src[srcK]
            }
        }
    }

    return root
}

function findTester (matchers, paths) {
    var len = matchers.length
    for (var i = 0; i < len; i++) {
        if (isMatched(matchers[i][0], paths)) return matchers[i][1]
    }
}

function isMatched (addr, paths) {
    var len = paths.length
    for (var i = 0; i < len; i++) {
        var p = paths[i]
        if (p !== addr[i] && addr[i] !== '*') return false
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
