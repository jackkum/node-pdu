import { getTests } from './tests/index';
import { clr, Modifier, TxtColor } from './utils/color';

export * as pdu from '../dist/index';

async function start() {
	const tests = await getTests();
	let total = 0;
	let success = 0;

	console.log('\n', clr({ txt: TxtColor.white, modifier: Modifier.bright }, 'Tests are loaded'), '\n');

	for (const test of tests) {
		const result = test();

		total += result.total;
		success += result.success;
	}

	console.log('\n');
	console.log(clr({ txt: TxtColor.white, modifier: Modifier.bright }, `${total} tests finished!`));
	console.log('	', clr(TxtColor.green, `Success: ${success}`), clr(TxtColor.red, `Failed: ${total - success}`));
	console.log('\n');
}

start();
