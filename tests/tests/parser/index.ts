import { pdu } from '../../index';
import { clr, Modifier, Preset, TxtColor } from '../../utils/color';
import { isValidResult } from '../../utils/isValidResult';
import { testFuncResult } from '../index';
import { data } from './data';

export default (): testFuncResult => {
	console.log('\n', clr(Preset.info, '【parser】:'));

	let total = 0;
	let success = 0;

	for (const test of data) {
		total++;

		let msg: pdu.Deliver | pdu.Report | pdu.Submit;

		try {
			msg = pdu.parse(test.pduStr);
		} catch (e) {
			console.log(
				clr(TxtColor.red, `	#${total} ${test.name}`),
				clr({ txt: TxtColor.red, modifier: Modifier.bright }, 'parsing failed!'),
				'\n\n'
			);
			console.error(e);
			console.log('\n');

			continue;
		}

		const isValid = isValidResult(test.expectedResult, msg);

		if (isValid !== true) {
			console.log(
				clr(TxtColor.red, `	#${total} ${test.name}`),
				clr({ txt: TxtColor.red, modifier: Modifier.bright }, 'has an invalid data!')
			);
			console.log(clr(TxtColor.red, isValid));

			continue;
		}

		if (!(msg instanceof pdu.Report)) {
			const resPdu = msg.data.parts[0].toString(msg);

			if (resPdu !== test.pduStr.toUpperCase()) {
				console.log(
					clr(TxtColor.red, `	#${total} ${test.name}`),
					clr({ txt: TxtColor.red, modifier: Modifier.bright }, 'recreation failed!')
				);
				console.log(clr(TxtColor.red, `		Origin:\n		${test.pduStr}\n		Result:\n		${resPdu}`));

				continue;
			}
		}

		console.log(clr(TxtColor.green, `	#${total} ${test.name} success ✓`));
		success++;
	}

	return { total, success };
};
