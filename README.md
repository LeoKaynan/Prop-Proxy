# Prop-Proxy
### Proxy for class properties

[![npm version](https://badge.fury.io/js/prop-proxy.svg)](https://badge.fury.io/js/prop-proxy) [![unpkg](https://img.shields.io/badge/unpkg-100000?style=flat&logo=pkgsrc&logoColor=white&labelColor=737373&color=black)](https://www.npmjs.com/package/prop-proxy) [![install size](https://packagephobia.com/badge?p=prop-proxy)](https://packagephobia.com/result?p=prop-proxy)

Prop-Proxy allows you to intercept getters and setters of class attributes through decorators

## Installation
This package need to be used with Typescript

```sh
npm install prop-proxy --save
yarn add prop-proxy
```

## Configuration
You need to enable in tsconfig.json:

```json
{
  "compilerOptions": {
    {
        "experimentalDecorators": true, 
        "emitDecoratorMetadata": true
    }
}
```


## Usage
### Using proxy for interception

```typescript
import { usePropertyProxy } from 'prop-proxy'

interface Struct {
    title: string;
    isActive: boolean;
}

const { Property, proxy } = usePropertyProxy<Struct>();

class Category implements Struct {
    @Property()
    title!: string;

    @Property()
    isActive!: boolean;

    constructor({title, isActive}: Struct){
        Object.assign(this, {title, isActive})
    }
}

//getter intercept
proxy.getTitle((value) => `other_${value}`)

//setter intercept
proxy.setIsActive(({setValue, value}) => setValue(true));

const category = new Category({title: 'title', isActive: false})

console.log(category.title) // output: other_title

console.log(category.isActive) // output: true
```

### Using validator with class-validator

```typescript
import { usePropertyProxy } from 'prop-proxy'
import { Length } from 'class-validator'

interface Struct {
    title: string;
    isActive: boolean;
}

const { Property, Validate } = usePropertyProxy<Struct>();

@Validate()
class Category implements Struct {
    @Property()
    @Length(0, 10)
    title!: string;

    @Property()
    isActive!: boolean;

    constructor({title, isActive}: Struct){
        Object.assign(this, {title, isActive})
    }
}

const category = new Category({title: 'title longer than 10 characters', isActive: true})

// output: an error is thrown, as the title length cannot be greater than 10 characters, according to schema.
```

> The error is thrown both for values ​​sent by the constructor and for those modified by the Class instance.

### Using validator with zod

```typescript
import { usePropertyProxy } from 'prop-proxy'
import { z } from 'zod'

interface Struct {
    title: string;
    isActive: boolean;
}

const SchemaCategory: z.ZodType<Struct> = z.object({
    title: z.string().max(10),
    isActive: z.boolean(),
})

const { Property, Validate } = usePropertyProxy<Struct>();

@Validate(SchemaCategory)
class Category implements Struct {
    @Property()
    title!: string;

    @Property()
    isActive!: boolean;

    constructor({title, isActive}: Struct){
        Object.assign(this, {title, isActive})
    }
}

const category = new Category({title: 'title longer than 10 characters', isActive: true})

// output: an error is thrown, as the title length cannot be greater than 10 characters, according to schema.
```

> The error is thrown both for values ​​sent by the constructor and for those modified by the Class instance.

### Using validator with yup

```typescript
import { usePropertyProxy } from 'prop-proxy'

import { object, string, boolean } from 'yup';

interface Struct {
    title: string;
    isActive: boolean;
}

const SchemaCategory = object({
  title: string().required().max(10),
  isActive: boolean().required(),
});

const { Property, Validate } = usePropertyProxy<Struct>();

@Validate(SchemaCategory)
class Category implements Struct {
    @Property()
    title!: string;

    @Property()
    isActive!: boolean;

    constructor({title, isActive}: Struct){
        Object.assign(this, {title, isActive})
    }
}

const category = new Category({title: 'title longer than 10 characters', isActive: true})

// output: an error is thrown, as the title length cannot be greater than 10 characters, according to schema.
```

> The error is thrown both for values ​​sent by the constructor and for those modified by the Class instance.

## License

MIT
**Free Software, Yeah!**
