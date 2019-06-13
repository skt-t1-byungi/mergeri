const test = require('ava')
const mergeri = require('.')

test('returns target', t => {
    const target = {}
    t.is(mergeri({}, target), target)
})

test('assign obj', t => {
    const target = { a: 1, b: 2 }
    const src = { b: 5, c: 3 }
    t.deepEqual(mergeri(null, target, src), { a: 1, b: 5, c: 3 })
})

test('assign obj - nested', t => {
    const target = { a: { a: 1, b: 2 } }
    const src = { a: { a: 5, c: 3 } }
    t.deepEqual(mergeri(null, target, src), { a: { a: 5, b: 2, c: 3 } })
})

test('assign obj - triple', t => {
    const target = { a: { a: 1, b: 2 } }
    const src1 = { a: { a: 5, c: 3 } }
    const src2 = { a: { c: 5, d: 4 } }
    t.deepEqual(mergeri(null, target, src1, src2), { a: { a: 5, b: 2, c: 5, d: 4 } })
})

test('If arrary, concat.', t => {
    t.deepEqual(mergeri(null, { a: [1] }, { a: [4, 5] }), { a: [1, 4, 5] })
    t.deepEqual(mergeri(null, { a: [{}] }, { a: [{}, {}] }), { a: [{}, {}, {}] })
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
    const matcher = { 'a': 'id' }
    t.deepEqual(mergeri(matcher, target, src), { a: [
        { id: 2, v: 'c' },
        { id: 1, v: 'b' },
        { id: 3, v: 'a' }
    ] })
})

test('If prop matcher is not available, ignore it.', t => {
    const target = { a: [
        { id: 2, v: 'a' },
        { id: 1, v: 'b' }
    ] }
    const matcher = { 'a': 'id' }
    t.deepEqual(mergeri(matcher, target, { a: 1 }), { a: 1 })
})

test('array, object into arr', t => {
    const target = { a: [
        { id: 2, v: 'a' },
        { id: 1, v: 'b' }
    ] }
    const src = { a: {
        a: { id: 2, v: 'c' },
        0: { id: 3, v: 'd' }
    } }
    const matcher = { 'a': 'id' }
    t.deepEqual(mergeri(matcher, target, src), { a: [
        { id: 2, v: 'c' },
        { id: 1, v: 'b' },
        { id: 3, v: 'd' }
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
        b: { id: 2, v: 'b' },
        c: { id: 3, v: 'c' } // removed by 4
    } }
    const src = { a: {
        a: { id: 2, v: 'c' },
        c: { id: 4, v: 'd' }
    } }
    const matcher = { a: 'id' }
    t.deepEqual(mergeri(matcher, target, src), { a: {
        a: { id: 1, v: 'a' },
        b: { id: 2, v: 'c' },
        c: { id: 4, v: 'd' }
    } })
})

test('prop matcher - ignore if not obj.', t => {
    const target = { a: { c: 1 } }
    const src = { a: { c: 1, d: 2 } }
    const matcher = { 'a.*': 'any' }
    t.deepEqual(mergeri(matcher, target, src), { a: { c: 1, d: 2 } })
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

test('wildcard - first', t => {
    const target = [
        { id: 2, v: 'a' },
        { id: 1, v: 'b' }
    ]
    const src = [
        { id: 2, v: 'c' },
        { id: 3, v: 'a' }
    ]
    const matcher = { '*': 'id' }
    t.deepEqual(mergeri(matcher, target, src), [
        { id: 2, v: 'c' },
        { id: 1, v: 'b' },
        { id: 3, v: 'a' }
    ])
})

test('wildcard - last', t => {
    const target = { a: { b: { c: [
        { id: 2, v: 'a' },
        { id: 1, v: 'b' }
    ] } } }
    const src = { a: { b: { c: [

        { id: 2, v: 'c' },
        { id: 3, v: 'a' }

    ] } } }
    const matcher = { 'a.b.c.*': 'id' }
    t.deepEqual(mergeri(matcher, target, src), { a: { b: { c: [
        { id: 2, v: 'c' },
        { id: 1, v: 'b' },
        { id: 3, v: 'a' }
    ] } } })
})

test('wildcard - middle, multiple', t => {
    const target = { a: { b: [
        {
            a: [
                { id: 2, v: 'a' },
                { id: 1, v: 'b' }
            ]
        }
    ] } }
    const src = { a: { b: [
        {
            a: [
                { id: 2, v: 'c' },
                { id: 3, v: 'a' }
            ]
        }
    ] } }
    const matcher = {
        'a.b.*.a': 'id',
        'a.b': (k1, k2) => k1 === k2
    }
    t.deepEqual(mergeri(matcher, target, src), { a: { b: [
        {
            a: [
                { id: 2, v: 'c' },
                { id: 1, v: 'b' },
                { id: 3, v: 'a' }
            ]
        }
    ] } })
})
