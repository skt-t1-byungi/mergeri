const test = require('ava')
const mergeri = require('.')

test('returns to', t => {
    const to = {}
    t.is(mergeri({}, to), to)
})

test('shallow assign', t => {
    const to = { a: 1, b: 2 }
    const from = { b: 5, c: 3 }

    t.deepEqual(mergeri({}, to, from), { a: 1, b: 5, c: 3 })
})

test('assign each obj', t => {
    const to = { a: { a: 1, b: 2 } }
    const from = { a: { a: 5, c: 3 } }

    t.deepEqual(mergeri({}, to, from), { a: { a: 5, b: 2, c: 3 } })
})

test('assign each obj more', t => {
    const to = { a: { a: 1, b: 2 } }
    const from1 = { a: { a: 5, c: 3 } }
    const from2 = { a: { c: 5, d: 4 } }

    t.deepEqual(mergeri({}, to, from1, from2), { a: { a: 5, b: 2, c: 5, d: 4 } })
})

test('concat each arr', t => {
    const to = { a: [1, 2, 3] }
    const from = { a: [4, 5] }

    t.deepEqual(mergeri({}, to, from), { a: [1, 2, 3, 4, 5] })
})

test('assign array by str matcher', t => {
    const to = { a: [
        { id: 2, v: 'a' },
        { id: 1, v: 'b' }
    ] }
    const from = { a: [
        { id: 2, v: 'c' },
        { id: 3, v: 'a' }
    ] }

    const matcher = { a: 'id' }

    t.deepEqual(mergeri(matcher, to, from), { a: [
        { id: 2, v: 'c' },
        { id: 1, v: 'b' },
        { id: 3, v: 'a' }
    ] })
})

test('assign array by multiple str matcher', t => {
    const to = { a: [
        { id: 1, other: 11, v: 'a' },
        { id: 2, other: 12, v: 'b' },
        { id: 3, other: 13, v: 'a' }
    ] }
    const from = { a: [
        { id: 1, other: 13, v: 'c' },
        { id: 2, other: 12, v: 'a' },
        { id: 4, other: 11, v: 'a' }
    ] }

    const matcher = { a: ['id', 'other'] }

    t.deepEqual(mergeri(matcher, to, from), { a: [
        { id: 1, other: 11, v: 'a' },
        { id: 2, other: 12, v: 'a' },
        { id: 3, other: 13, v: 'a' },
        { id: 1, other: 13, v: 'c' },
        { id: 4, other: 11, v: 'a' }
    ] })
})

test('assign obj by str matcher', t => {
    const to = { a: {
        a: { id: 1, v: 'a' },
        b: { id: 2, v: 'b' }
    } }
    const from = { a: {
        c: { id: 2, v: 'c' },
        d: { id: 3, v: 'd' }
    } }

    const matcher = { a: 'id' }

    t.deepEqual(mergeri(matcher, to, from), { a: {
        a: { id: 1, v: 'a' },
        b: { id: 2, v: 'c' },
        d: { id: 3, v: 'd' }
    } })
})

test('assign each array by func matcher', t => {
    const to = { a: [1, 2, 3] }
    const from = { a: [4, 5] }

    const matcher = { a: (k1, k2) => k1 === k2 }

    t.deepEqual(mergeri(matcher, to, from), { a: [4, 5, 3] })
})

test('deep assign array by str matcher', t => {
    const to = { a: { b: { c: {
        d: [
            { id: 2, v: 'a' },
            { id: 1, v: 'b' }
        ]
    } } } }

    const from = { a: { b: { c: {
        d: [
            { id: 2, v: 'c' },
            { id: 3, v: 'a' }
        ]
    } } } }

    const matcher = { 'a.b.c.d': 'id' }

    t.deepEqual(mergeri(matcher, to, from), { a: { b: { c: {
        d: [
            { id: 2, v: 'c' },
            { id: 1, v: 'b' },
            { id: 3, v: 'a' }
        ]
    } } } })
})

test('wildcard expression #1 - last segment', t => {
    const to = { a: { b: { c: [
        [
            { id: 2, v: 'a' },
            { id: 1, v: 'b' }
        ]
    ] } } }

    const from = { a: { b: { c: [
        [
            { id: 2, v: 'c' },
            { id: 3, v: 'a' }
        ]
    ] } } }

    const matcher = { 'a.b.c.*': 'id' }

    t.deepEqual(mergeri(matcher, to, from), { a: { b: { c: [
        [
            { id: 2, v: 'c' },
            { id: 1, v: 'b' },
            { id: 3, v: 'a' }
        ]
    ] } } })
})

test('wildcard expression #2 - multiple, custom', t => {
    const to = { a: { b: { c: [
        {
            a: [
                { id: 2, v: 'a' },
                { id: 1, v: 'b' }
            ]
        }
    ] } } }

    const from = { a: { b: { c: [
        {
            a: [
                { id: 2, v: 'c' },
                { id: 3, v: 'a' }
            ]
        }
    ] } } }

    const matcher = {
        'a.b.c.*.a': 'id',
        'a.b.c': (k1, k2) => k1 === k2
    }

    t.deepEqual(mergeri(matcher, to, from), { a: { b: { c: [
        {
            a: [
                { id: 2, v: 'c' },
                { id: 1, v: 'b' },
                { id: 3, v: 'a' }
            ]
        }
    ] } } })
})

test('wildcard expression #3', t => {
    const to = {
        a: 'hello',
        b: [
            {
                id: 1,
                c: [
                    {
                        id: 1000,
                        d: { a: 1, b: 2 }
                    },
                    {
                        id: 1001,
                        d: { a: 3 }
                    }
                ]
            },
            {
                id: 2,
                c: [
                    {
                        id: 1000,
                        d: { a: 2 }
                    },
                    {
                        id: 1001,
                        d: { a: 10 }
                    }
                ]
            }
        ]
    }

    const from = {
        a: 'bye',
        b: [
            {
                id: 2,
                c: [
                    {
                        id: 1000,
                        d: { b: 4, c: 6 }
                    },
                    {
                        id: 1001,
                        d: { a: 100 }
                    }
                ]
            },
            {
                id: 1,
                c: [
                    {
                        id: 999,
                        d: { a: 1, b: 2 }
                    },
                    {
                        id: 1000,
                        d: { c: 3 }
                    }
                ]
            }
        ]
    }

    const matcher = {
        'b': 'id',
        'b.*.c': 'id'
    }

    t.deepEqual(mergeri(matcher, to, from), {
        a: 'bye',
        b: [
            {
                id: 1,
                c: [
                    {
                        id: 1000,
                        d: { a: 1, b: 2, c: 3 }
                    },
                    {
                        id: 1001,
                        d: { a: 3 }
                    },
                    {
                        id: 999,
                        d: { a: 1, b: 2 }
                    }
                ]
            },
            {
                id: 2,
                c: [
                    {
                        id: 1000,
                        d: { a: 2, b: 4, c: 6 }
                    },
                    {
                        id: 1001,
                        d: { a: 100 }
                    }
                ]
            }
        ]
    })
})
