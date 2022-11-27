import { PropertyProxy, ProxyType, Schemas } from "./types";
import { lowCaseFirstLetter } from "./util";
import { AnyZodObject, z, ZodObject } from "zod";
import { validate } from "class-validator";
import { ErrorItem, ValidationError } from "./Error/ValidationError";
import { ValidationError as ErrorYup, ObjectSchema, AnyObjectSchema } from "yup";

export function usePropertyProxy<T>() {
	let schemaObj: Schemas;
	let schemaTarget: any;

	function Validate(schama?: Schemas): ClassDecorator {
    	return function(target: any) {
    	  return new Proxy(target, {
    			construct: (_target, args) => {
    				if(schama) {
    					schemaObj = schama as AnyZodObject | AnyObjectSchema;
    				}
                    
					schemaTarget = new _target(...args);
        
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
	                        
							// start support class-validator
							if (schemaTarget){                
								validate(schemaTarget).then(errors => {
									if (errors.length > 0) {
										const errorsMaped: ErrorItem[] = errors.map(error => {
											return {
												property: error.property,
												message: (error.constraints && Object.values(error.constraints)[0]) as string,
												type: error.constraints && Object.keys(error.constraints)[0]
											};
										});
                            
										throw new ValidationError(errorsMaped);
									} 
								});
							} 
							// end support class-validator

							// start support zod
							if (schemaObj && schemaTarget && schemaObj instanceof ZodObject){
								try {
									schemaObj.parse(schemaTarget);
								} catch (_error) {
									const error = _error as z.ZodError ;
									const errorsMaped: ErrorItem[] = error.errors.map(error => {
										return {
											property: error.path[0].toString(),
											message: error.message,
											type: error.code
										};
									});
									throw new ValidationError(errorsMaped);
								}
							}
							// end support zod

							// start support yup
							if (schemaObj && schemaTarget && schemaObj instanceof ObjectSchema){
								schemaObj.validate(schemaTarget, { abortEarly: false }).catch(_error => {
									const error = _error as ErrorYup;

									const errorsMaped: ErrorItem[] = error.inner.map(error => {
										return {
											property: error.path as string,
											message: error.errors[0],
											type: error.type
										};
									});

									throw new ValidationError(errorsMaped);
								});
							}
							// end support yup
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
