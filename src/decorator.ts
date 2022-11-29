import { PropertyProxy, ProxyType, Schemas } from "./types";
import { lowCaseFirstLetter } from "./util";
import { classValidate, yupValidate, zodValidate } from "./validates";

export function usePropertyProxy<T>() {
	let schemaObj: Schemas;
	let schemaTarget: any;

	function Validate(schama?: Schemas): ClassDecorator {
    	return function(target: any) {
    	  return new Proxy(target, {
    			construct: (_target, args) => {
					schemaTarget = new target(...args);
                    
    				if(schama) {
    					schemaObj = schama;
						zodValidate(schemaTarget, schama);
						yupValidate(schemaTarget, schama);
    				}

					classValidate(schemaTarget);
    				return schemaTarget;
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
							if(ObjectProxy[key]?.setter) {
								ObjectProxy[key].setter?.({setValue(value) {
									val = value;
								}, value: newValue});
								return;
							}
							val = newValue;

							if (schemaTarget && schemaTarget[key] !== newValue) {
								Object.assign(schemaTarget, { [key]: newValue} );
							}
	                        
							classValidate(schemaTarget);
							zodValidate(schemaTarget, schemaObj);
							yupValidate(schemaTarget, schemaObj);
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
