# mergeri
> Simple object merge using matcher.

[![npm](https://img.shields.io/npm/v/mergeri.svg?style=flat-square)](https://www.npmjs.com/package/mergeri)

![merge objects](pain.gif)

## Install
```sh
npm i mergeri
```

## Example
### Basic
```js
const obj1 = {
    a: {
        b: [
            {
                id: 1000,
                data: { a: 1 }
            }
        ]
    }
}

const obj2 = {
    a: {
        b: [
            {
                id: 999,
                data: { a: 2 }
            },
            {
                id: 1000,
                data: { b: 3 }
            }
        ]
    }
}

const result = mergeri({ 'a.b': 'id' }, obj1, obj2)
```

`result`
```js
{
    a: {
        b: [
            {
                id: 999,
                data: { a: 2 }
            },
            {
                id: 1000,
                data: { a: 1, b: 3 }
            }
        ]
    }
}
```

## API
### mergeri(matcher, target, src1, [src2, src3...])

#### Matcher

##### Dot notation
```js
const obj = {
    a: { 
        b: [
            {c: {d: 1 }},
            {c: {d: 2 }}
        ] 
    }
}

const matcher = { "a.b": "c.d" }
```

#### Multiple matchers
```js
const matcher = { 
    "a": "b.c.d" ,
    "e.f.g": "h.i",
    "x.y": "z",
}
```

#### Wildcard
```js
const matcher = { 
    "a.*.c": "other_id"
}
```

#### Complex matcher
```js
const matcher = { 
    "a.b": ["id", "other_id"]
}
```

#### Custom matcher
```js
const matcher = { 
    "a.b": function(toKey, fromKey, toValue, fromValue, toObj, fromObj) {
        return toValue.c.id === fromValue.c.id
    }
    // same as {"a.b": "c.id"}
}
```


## License
MIT