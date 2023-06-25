export type testFunc = () => testFuncResult;
export type testFuncResult = { total: number; success: number };

export async function getTests() {
	const array = [
		(await import('./7BitEncoding')).default,
		(await import('./7BitDecoding')).default,
		(await import('./parser')).default,
		(await import('./append')).default
	];

	return array;
}
