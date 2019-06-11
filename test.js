const test = require('ava')
const mergeri = require('.')

test('returns target', t => {
    const target = {}
    t.is(mergeri({}, target), target)
})

test('assign obj#1', t => {
    const target = { a: 1, b: 2 }
    const src = { b: 5, c: 3 }
    t.deepEqual(mergeri(null, target, src), { a: 1, b: 5, c: 3 })
})

test('assign obj#2', t => {
    const target = { a: { a: 1, b: 2 } }
    const src = { a: { a: 5, c: 3 } }
    t.deepEqual(mergeri(null, target, src), { a: { a: 5, b: 2, c: 3 } })
})

test('assign obj#3', t => {
    const target = { a: { a: 1, b: 2 } }
    const src1 = { a: { a: 5, c: 3 } }
    const src2 = { a: { c: 5, d: 4 } }
    t.deepEqual(mergeri(null, target, src1, src2), { a: { a: 5, b: 2, c: 5, d: 4 } })
})

test('concat arr', t => {
    const target = { a: [1, 2, 3] }
    const src = { a: [4, 5] }
    t.deepEqual(mergeri(null, target, src), { a: [1, 2, 3, 4, 5] })
})

test('prop matcher', t => {
    const target = { a: [
        { id: 2, v: 'a' },
        { id: 1, v: 'b' }
    ] }
    const src = { a: [
        { id: 2, v: 'c' },
        { id: 3, v: 'a' }
    ] }
    const matcher = { a: 'id' }
    t.deepEqual(mergeri(matcher, target, src), { a: [
        { id: 2, v: 'c' },
        { id: 1, v: 'b' },
        { id: 3, v: 'a' }
    ] })
})

test('complex matcher', t => {
    const target = { a: [
        { id: 1, other: 11, v: 'a' },
        { id: 2, other: 12, v: 'b' },
        { id: 3, other: 13, v: 'a' }
    ] }
    const src = { a: [
        { id: 1, other: 13, v: 'c' },
        { id: 2, other: 12, v: 'a' },
        { id: 4, other: 11, v: 'a' }
    ] }
    const matcher = { a: ['id', 'other'] }
    t.deepEqual(mergeri(matcher, target, src), { a: [
        { id: 1, other: 11, v: 'a' },
        { id: 2, other: 12, v: 'a' },
        { id: 3, other: 13, v: 'a' },
        { id: 1, other: 13, v: 'c' },
        { id: 4, other: 11, v: 'a' }
    ] })
})

test('prop matcher on obj', t => {
    const target = { a: {
        a: { id: 1, v: 'a' },
        b: { id: 2, v: 'b' }
    } }
    const src = { a: {
        c: { id: 2, v: 'c' },
        d: { id: 3, v: 'd' }
    } }
    const matcher = { a: 'id' }
    t.deepEqual(mergeri(matcher, target, src), { a: {
        a: { id: 1, v: 'a' },
        b: { id: 2, v: 'c' },
        d: { id: 3, v: 'd' }
    } })
})

test('custom matcher', t => {
    const target = { a: [1, 2, 3] }
    const src = { a: [4, 5] }
    const matcher = { a: (k1, k2) => k1 === k2 }
    t.deepEqual(mergeri(matcher, target, src), { a: [4, 5, 3] })
})

test('dot notation', t => {
    const target = { a: { b: { c: {
        d: [
            { id: 2, v: 'a' },
            { id: 1, v: 'b' }
        ]
    } } } }
    const src = { a: { b: { c: {
        d: [
            { id: 2, v: 'c' },
            { id: 3, v: 'a' }
        ]
    } } } }
    const matcher = { 'a.b.c.d': 'id' }
    t.deepEqual(mergeri(matcher, target, src), { a: { b: { c: {
        d: [
            { id: 2, v: 'c' },
            { id: 1, v: 'b' },
            { id: 3, v: 'a' }
        ]
    } } } })
})

test('wildcard#1 - last', t => {
    const target = { a: { b: { c: [
        [
            { id: 2, v: 'a' },
            { id: 1, v: 'b' }
        ]
    ] } } }
    const src = { a: { b: { c: [
        [
            { id: 2, v: 'c' },
            { id: 3, v: 'a' }
        ]
    ] } } }
    const matcher = { 'a.b.c.*': 'id' }
    t.deepEqual(mergeri(matcher, target, src), { a: { b: { c: [
        [
            { id: 2, v: 'c' },
            { id: 1, v: 'b' },
            { id: 3, v: 'a' }
        ]
    ] } } })
})

test('wildcard#2 - first', t => {
    const target = [
        { id: 2, v: 'a' },
        { id: 1, v: 'b' }
    ]
    const src = [
        { id: 2, v: 'c' },
        { id: 1, v: 'b' },
        { id: 3, v: 'a' }
    ]
    const matcher = { '*': 'id' }
    t.deepEqual(mergeri(matcher, target, src), [
        { id: 2, v: 'a' },
        { id: 1, v: 'b' },
        { id: 3, v: 'a' }
    ])
})

test('wildcard#3 - multiple', t => {
    const target = { a: { b: { c: [
        {
            a: [
                { id: 2, v: 'a' },
                { id: 1, v: 'b' }
            ]
        }
    ] } } }
    const src = { a: { b: { c: [
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
    t.deepEqual(mergeri(matcher, target, src), { a: { b: { c: [
        {
            a: [
                { id: 2, v: 'c' },
                { id: 1, v: 'b' },
                { id: 3, v: 'a' }
            ]
        }
    ] } } })
})

test('wildcard#4', t => {
    const target = {
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
    const src = {
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
    t.deepEqual(mergeri(matcher, target, src), {
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
