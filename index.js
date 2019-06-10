module.exports = mergeri

function mergeri (def, t, ...sources) {
    const matchers = convertMatchers(def || {})
    return sources.reduce((t, src) => merge(matchers, t, Object(src), []), Object(t))
}

function convertMatchers (def) {
    return Object.entries(def).map(([k, v]) => [k.split('.'), convertTester(v)])
}

function convertTester (v) {
    if (typeof v === 'function') return v
    if (typeof v === 'string') return (k1, k2, v1, v2) => objectGet(v1, v) === objectGet(v2, v)
    if (Array.isArray(v)) return (k1, k2, v1, v2) => v.every(k => objectGet(v1, k) === objectGet(v2, k))
    return () => false
}

function merge (matchers, t, src, path) {
    if (path.length > 0) matchers = filterMatchers(matchers, path)

    if (Array.isArray(t) && Array.isArray(src)) {
        mergeArr(matchers, t, src, path)
    } else {
        mergeObj(matchers, t, src, path)
    }

    return t
}

function mergeArr (matchers, target, src, path) {
    const tester = findTester(matchers, path)

    if (!tester) return [].push.apply(target, src)

    src.forEach((srcV, srcK) => {
        const matchedK = target.findIndex((targetV, targetK) => tester(targetK, srcK, targetV, srcV, target, src))
        const matched = target[matchedK]

        if (!matched) return target.push(srcV)

        if (isExtensible(matched) && isExtensible(srcV)) {
            path.push(matchedK)
            merge(matchers, matched, srcV, path)
            path.pop()
        } else {
            target[matchedK] = srcV
        }
    })
}

function mergeObj (matchers, target, src, path) {
    const tester = findTester(matchers, path)
    const tEntries = tester ? Object.entries(target) : undefined

    Object.entries(src).forEach(([srcK, srcV]) => {
        const [matchedK, matched] = tester
            ? (tEntries.find(([targetK, targetV]) => tester(targetK, srcK, targetV, srcV, target, src)) || [srcK])
            : [srcK, target[srcK]]

        if (isExtensible(matched) && isExtensible(srcV)) {
            path.push(matchedK)
            merge(matchers, matched, srcV, path)
            path.pop()
        } else {
            target[matchedK] = srcV
        }
    })
}

function objectGet (src, path) {
    const paths = path.split('.')
    while (paths.length) {
        if ((src = src[paths.shift()]) === undefined) return
    }
    return src
}

function findTester (matchers, path) {
    const matcher = matchers.find(([segments]) => isReached(segments, path))
    if (matcher) return matcher[1] // tester
}

function filterMatchers (matchers, path) {
    return matchers.filter(([segments]) => isReached(segments, path, true))
}

function isReached (segments, path, isPath) {
    const len = (isPath ? path : segments).length

    for (let i = 0; i < len; i++) {
        const seg = segments[i]
        if (seg !== path[i] && seg !== '*') return false
    }

    return true
}

function isExtensible (obj) {
    const type = typeof obj
    return obj && (type === 'object' || type === 'function')
}
