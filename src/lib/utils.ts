// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deepMerge = (target: any, source: any): any => {
	if (typeof source !== 'object' || source === null) return source;
	const output = {...target};
	for (const key in source) {
		if (source[key] === undefined || source[key] === null) continue;

		if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
			output[key] = deepMerge(output[key] || {}, source[key]);
		} else {
			output[key] = source[key];
		}
	}
	return output;
};
