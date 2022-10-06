# Prop-Proxy
### Proxy for class properties

[![npm version](https://badge.fury.io/js/prop-proxy.svg)](https://badge.fury.io/js/prop-proxy) [![unpkg](https://img.shields.io/badge/unpkg-100000?style=flat&logo=pkgsrc&logoColor=white&labelColor=737373&color=black)](https://www.npmjs.com/package/prop-proxy) [![install size](https://packagephobia.com/badge?p=prop-proxy)](https://packagephobia.com/result?p=prop-proxy)

Prop-Proxy allows you to intercept getters and setters of class attributes through decorators

## Installation
This package has to be used with Typescript

```sh
npm install prop-proxy --save
yarn add prop-proxy
```

## Configuration
You need to enable in tsconfig.json:

```json
{
    "experimentalDecorators": true, 
    "emitDecoratorMetadata": true
}
```


## Usage
```typescript
import { usePropertyProxy } from 'prop-proxy'

type PartialPick<T, K extends keyof T> = Partial<T> & Pick<T, K>

interface Struct {
    title: string;
    isActive: boolean;
}

type Params = PartialPick<Struct, 'title'> //isActive is optional param in constructor

const { Property, proxy } = usePropertyProxy<Struct>();

class Category implements Struct {
    @Property()
    title!: string;

    @Property()
    isActive!: boolean;

    constructor({title, isActive}: Params){
        Object.assign(this, {title, isActive})
    }
}

//getter intercept
proxy.getTitle((value) => `other_${value}`)

//setter intercept
proxy.setIsActive(({setValue, value}) => value ? setValue(value) : setValue(true));

const category = new Category({title: 'title'})

console.log(category.title) // output: other_title

console.log(category.isActive) // output: true
```



## License

MIT
**Free Software, Yeah!**