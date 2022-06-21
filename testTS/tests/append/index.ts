import { testFuncResult } from '..';
import { pdu } from '../../index';
import { clr, Modifier, Preset, TxtColor } from '../../utils/color';
import { isValidResult } from '../../utils/isValidResult';
import { data } from './data';

export default (): testFuncResult => {
	console.log('\n', clr(Preset.info, '【append】:'));

	let total = 0;
	let success = 0;

	for (const test of data) {
		total++;

		let msg1: pdu.Deliver | pdu.Report | pdu.Submit;
		let msg2: pdu.Deliver | pdu.Report | pdu.Submit;

		try {
			msg1 = pdu.parse(test.pduStr1);
			msg2 = pdu.parse(test.pduStr2);
		} catch (e) {
			console.log(clr(TxtColor.red, `	#${total} ${test.name}`), clr({ txt: TxtColor.red, modifier: Modifier.bright }, 'parsing failed'), '\n\n');
			console.error(e);

			continue;
		}

		if (msg1 instanceof pdu.Report || msg2 instanceof pdu.Report) {
			console.log(
				clr(TxtColor.yellow, `	#${total} ${test.name}`),
				clr({ txt: TxtColor.red, modifier: Modifier.bright }, 'cannot append because one of both strings is a Report type!')
			);

			continue;
		}

		try {
			msg1.data.append(msg2);

			if (test.expectedError) {
				console.log(
					clr(TxtColor.red, `	#${total} ${test.name}`),
					clr({ txt: TxtColor.red, modifier: Modifier.bright }, 'has an expected error but one was thrown!')
				);

				continue;
			}
		} catch (e) {
			if (e?.message !== test.expectedError) {
				console.log(
					clr(TxtColor.red, `	#${total} ${test.name}`),
					clr({ txt: TxtColor.red, modifier: Modifier.bright }, 'appending failed!'),
					'\n\n'
				);
				console.error(e);
				console.log('\n');

				continue;
			}
		}

		const isValid = isValidResult(test.expectedResult || {}, msg1);

		if (!test.expectedError && isValid !== true) {
			console.log(clr(TxtColor.red, `	#${total} ${test.name}`), clr({ txt: TxtColor.red, modifier: Modifier.bright }, 'has an invalid data!'));
			console.log(clr(TxtColor.red, isValid));

			continue;
		}

		console.log(clr(TxtColor.green, `	#${total} ${test.name} success ✓`));
		success++;
	}

	return { total, success };
};
