# mergeri
Effectively deep merge objects by matcher.

[![npm](https://img.shields.io/npm/v/mergeri.svg?style=flat-square)](https://www.npmjs.com/package/mergeri)


![merge objects](pain.gif)

Merging objects that are not matched by keys is pain. 
However, using megeri can solve it.

## Install
```sh
yarn add mergeri
```

## Usage
### Code
```js
const base = {
    a: {
        b: [
            {
                id: 1000,
                data: { a: 1, b: 2 }
            }
        ]
    }
}

const over = {
    a: {
        b: [
            {
                id: 999,
                data: { a: 1 }
            },
            {
                id: 1000,
                data: { c: 3 }
            }
        ]
    }
}

const matcher = { 'a.b': 'id' }

mergeri(matcher, base, over)
```

### Result
```js
{
    a: {
        b: [
            {
                id: 999,
                data: { a: 1 }
            },
            {
                id: 1000,
                data: { a: 1, b: 2, c: 3 }
            }
        ]
    }
}
```

## API
### mergeri(matcher, target, src1, [src2, src3...])
Effectively deep merge objects by matcher. Returns the changed target object.

### Matcher
Value is a matcher, and the key is a path using the matcher. 

#### Dot notation
Path and matcher use dot notation.
```js
const target = {
    a: { 
        b: [
            {c: {d: 'id' }}
        ] 
    }
}

const matcher = { "a.b": "c.d" }
```

#### Multiple matchers
Multiple matchers can be used together.
```js
const matcher = { 
    "a": "b.c.d" ,
    "e.f.g": "h.i",
    "x.y": "z",
}
```

#### Wildcard
Wildcards are also supported. However, a matcher must be defined for where wildcards are used.
```js
const matcher = { 
    "a.*.c": "other_id",
    "a": "id" // Required for "a.*.c"
}
```

#### Complex matcher
Can specify a complex matcher using an array.
```js
const matcher = { 
    "a.b": ["id", "other_id"]
}
```

#### Custom function matcher
Can also use a custom function.
```js
const matcher = { 
    "a.b": function(toK, fromK, toValue, fromValue, toCtx, fromCtx) {
        return toValue.data.id === fromValue.data.id
    }
    // same as "data.id".
}
```

## License
MIT