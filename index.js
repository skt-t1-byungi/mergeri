module.exports = mergeri

function mergeri (matchers, t) {
    matchers = convertMatchers(matchers || {})
    t = Object(t)

    var len = arguments.length
    for (var i = 2; i < len; i++) t = merge(matchers, t, Object(arguments[i]), [])

    return t
}

function convertMatchers (matchers) {
    var res = []

    for (var k in matchers) {
        if (!hasOwn(matchers, k)) continue

        var tester = convertTester(matchers[k])
        if (k.length > 1 && k.slice(-2) === '.*') k = k.slice(0, -2)

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

function merge (matchers, t, src, addr) {
    matchers = filterMatchers(matchers, addr)

    var tester, srcK, tK, found

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
            tK = isArr(t) && isArr(src) ? t.length : srcK
        }

        if (!hasOwn(t, tK) || !isExtensible(t[tK]) || !isExtensible(src[srcK])) {
            t[tK] = src[srcK]
            continue
        }

        addr.push(tK)
        merge(matchers, t[tK], src[srcK], addr)
        addr.pop()
    }
    return t
}

function filterMatchers (matchers, addr) {
    var res = []
    var idx = addr.length - 1
    var matcher, path

    for (var i = 0; i < matchers.length; i++) {
        matcher = matchers[i]
        path = matcher[0]

        if ((path.length >= addr.length) && ((path[idx] === addr[idx]) || (path[idx] === '*'))) {
            res.push(matcher)
        }
    }

    return res
}

function findTester (matchers, addr) {
    var idx = addr.length - 1
    var matcher, path, tester

    for (var i = 0; i < matchers.length; i++) {
        matcher = matchers[i]
        path = matcher[0]
        tester = matcher[1]
        if ((path[idx] === addr[idx]) || (path[idx] === '*')) return tester
    }

    return null
}

function isMatched (path, addr, depth) {
    var len = addr.length
    if (len !== path.length - 1) return false
    for (var i = 0; i < len; i++) {
        if (addr[i] !== path[i] && path[i] !== '*') return false
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
    var keys = str.split('.')
    while (keys.length) {
        if ((o = o[keys.shift()]) === undefined) return
    }
    return o
}

function isExtensible (o) {
    var type = typeof o
    return o && (type === 'object' || type === 'function')
}

function returnFalse () {
    return false
}
