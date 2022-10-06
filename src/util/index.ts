export const lowCaseFirstLetter = (str: string): string => {
	return `${str.charAt(0).toLowerCase()}${str.slice(1)}`;
};