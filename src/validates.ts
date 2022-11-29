import { validate } from "class-validator";
import { z, ZodObject } from "zod";
import { ErrorItem, ValidationError } from "./Error/ValidationError";
import { ValidationError as ErrorYup, ObjectSchema } from "yup";

export const classValidate = (target?: any) => {
	if (target) {
		validate(target).then(errors => {
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
};

export const zodValidate = (target: any, schema?: any) => {
	if (schema && target && schema instanceof ZodObject){
		try {
			schema.parse(target);
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
};

export const yupValidate = (target: any, schema?: any) => {
	if (schema && target && schema instanceof ObjectSchema){
		schema.validate(target, { abortEarly: false }).catch(_error => {
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
};