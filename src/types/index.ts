import { ObjectSchema } from "yup";
import { z, ZodObject } from "zod";

interface Setter<T> {
    setValue: (value: T) => void,
    value: T
}

export type ProxyType<T> = {
    [P in keyof T]:Partial<{
        getter: (value: T[P]) => T[P],
        setter: (props: Setter<T[P]>) => void
    }>;
  };

type Set<T> = {
    [P in keyof T as `set${Capitalize<string & P>}`]: (cb: (props: Setter<T[P]>) => void) => void
} 

type Get<T> = {
    [P in keyof T as `get${Capitalize<string & P>}`]: (cb: (value:T[P]) => T[P]) => void
} 


export type PropertyProxy<T> = Set<T> & Get<T> 

export type Schemas = typeof ZodObject.prototype | typeof ObjectSchema.prototype | z.ZodType;