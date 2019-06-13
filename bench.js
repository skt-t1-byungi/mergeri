const bench = require('nanobench')
const mergeri = require('.')

const o1 = mo()
const o2 = mo()

bench('no matcher', b => {
    b.start()
    mergeri(null, {}, o1, o2)
    b.end()
})

bench('1 matcher', b => {
    const matchers = mm(1)
    b.start()
    mergeri(matchers, {}, o1, o2)
    b.end()
})

bench('1000 matcher', b => {
    const matchers = mm(1000)
    b.start()
    mergeri(matchers, {}, o1, o2)
    b.end()
})

bench('3000 matcher', b => {
    const matchers = mm(3000)
    b.start()
    mergeri(matchers, {}, o1, o2)
    b.end()
})

function mo (o = {}, d = 3) {
    if (--d === 0) return o
    for (let i = 0; i < 500; i++) o[i] = mo({}, d)
    return o
}

function mm (size) {
    const matchers = {}
    for (let i = 0; i < size; i++) matchers[i] = '0'
    return matchers
}
