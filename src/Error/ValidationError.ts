export interface ErrorItem {
    property: string;
    message: string;
    type?: string;
}


export class ValidationError extends Error {
	errors: ErrorItem[] = [];
    
	constructor(errors: ErrorItem[]){
		super("Error Validation");
		
		errors.forEach(error => this.errors.push(error));
	}
}