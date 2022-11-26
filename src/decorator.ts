import { PropertyProxy, ProxyType } from "./types";
import { lowCaseFirstLetter } from "./util";
import { AnyZodObject } from "zod";

export function usePropertyProxy<T>() {
	let schemaObj: AnyZodObject;

	function Validate(schama: AnyZodObject): ClassDecorator {
    	return function(target: any) {
    	  return new Proxy(target, {
    			construct: (_target, args) => {
    				if(schama) {
    					schemaObj = schama;
    				}
    				return new target(...args);
    			}
    		});
    	};
	}

	function Property(): (target: any, key: keyof T) => void {
		return function(target: any, key: keyof T){
			Object.defineProperty(target, key, {
				get: () => "",
				set: function(v: any) {
					let val: T[keyof T];
					Object.defineProperty(this, key, {
						get: () => ObjectProxy[key]?.getter?.(val) || val,
						set: (newValue) => {
							if (schemaObj){
    							const prop = schemaObj.pick({ [key as string]: true });
    							prop.parse({ [key]: newValue});
    						}

							if(ObjectProxy[key]?.setter) {
								ObjectProxy[key].setter?.({setValue(value) {
									val = value;
								}, value: newValue});
								return;
							}
							val = newValue;
						},
						enumerable: true,
					});
					this[key] = v;
				},
			}); 
		};
	} 

	const ObjectProxy = {} as ProxyType<T>;

	const proxy = new Proxy({}, {
		get(_target: any, p: string) {

			const isSet = p.includes("set");
			const originalParam = isSet ? lowCaseFirstLetter(p.split("set")[1]) : lowCaseFirstLetter(p.split("get")[1]);

			const obj = {
				[p]: (cb: any) => {
					Object.assign(ObjectProxy, {
						[originalParam]: {
							[`${isSet ? "setter" : "getter"}`]: cb
						}
					});
				}
			};

			return obj[p];
		},
	}) as unknown as PropertyProxy<T>;

	return {Property, proxy, Validate};
}
