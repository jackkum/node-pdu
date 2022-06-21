import { pdu } from '../../index';
import { clr, Modifier, Preset, TxtColor } from '../../utils/color';
import { data } from '../7BitDecoding/data';
import { testFuncResult } from '../index';

const Helper = pdu.utils.Helper;

export default (): testFuncResult => {
	console.log('\n', clr(Preset.info, '【7BitEncoding】:'));

	let total = 0;
	let success = 0;

	for (const test of data) {
		total++;

		const out = Helper.encode7Bit(test.text, test.alignBits);

		if (out.result !== test.code) {
			console.log(clr(TxtColor.red, `	#${total} ${test.name}`), clr({ txt: TxtColor.red, modifier: Modifier.bright }, 'failed!'));
			console.log(clr(TxtColor.red, `		Text:\n		${test.text}		Expecting:\n		${test.code}\n		Got:\n		${out.result}`));

			continue;
		}

		console.log(clr(TxtColor.green, `	#${total} ${test.name} success ✓`));
		success++;
	}

	return { total, success };
};
