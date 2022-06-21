import { pdu } from '../../index';
import { clr, Modifier, Preset, TxtColor } from '../../utils/color';
import { testFuncResult } from '../index';
import { data } from './data';

const Helper = pdu.utils.Helper;

export default (): testFuncResult => {
	console.log('\n', clr(Preset.info, '【7BitDecoding】:'));

	let total = 0;
	let success = 0;

	for (const test of data) {
		total++;

		const out = Helper.decode7Bit(test.code, test.codeLen, test.alignBits);

		if (out !== test.text) {
			console.log(clr(TxtColor.red, `	#${total} ${test.name}`), clr({ txt: TxtColor.red, modifier: Modifier.bright }, 'failed!'));
			console.log(clr(TxtColor.red, `		Text:\n		${test.text}		Expecting:\n		${test.code}\n		Got:\n		${out}`));
			continue;
		}

		console.log(clr(TxtColor.green, `	#${total} ${test.name} success ✓`));
		success++;
	}

	return { total, success };
};
