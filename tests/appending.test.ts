import { describe, expect, test } from 'vitest';
import { parse } from '../src/index';
import { expectDeliver, expectUserData } from './utils/checkPdu';

describe('Appending PDU strings', () => {
	test('Simple concatenated message', () => {
		const pduStr1 = '07919730071111F1400B919746121611F10000811170021222230E06080412340201C8329BFD6601';
		const pduStr2 = '07919730071111F1400B919746121611F10000811170021232230F06080412340202A0FB5BCE268700';

		const parsedPdu1 = parse(pduStr1);
		expectDeliver(parsedPdu1);

		const parsedPdu2 = parse(pduStr2);
		expectDeliver(parsedPdu2);

		parsedPdu1.data.append(parsedPdu2);
		expectUserData(parsedPdu1, { text: 'Hello, world!' });
	});

	test('Concatenated message with reversed part order', () => {
		const pduStr1 = '07919730071111F1400B919746121611F10000811170021232230F06080412350202A0FB5BCE268700';
		const pduStr2 = '07919730071111F1400B919746121611F10000811170021222230B06080412350201C8340B';

		const parsedPdu1 = parse(pduStr1);
		expectDeliver(parsedPdu1);

		const parsedPdu2 = parse(pduStr2);
		expectDeliver(parsedPdu2);

		parsedPdu1.data.append(parsedPdu2);
		expectUserData(parsedPdu1, { text: 'Hi, world!' });
	});

	test.each([
		{
			parts: '1 & 2',
			pduStr1: '07919730071111F1400B919746121611F10000811170021222230E060804123403015774987E9A03',
			pduStr2: '07919730071111F1400B919746121611F10000811170021232230C06080412340302A03A9C05',
			text: "What's up,"
		},
		{
			parts: '2 & 3',
			pduStr1: '07919730071111F1400B919746121611F10000811170021232230C06080412340302A03A9C05',
			pduStr2: '07919730071111F1400B919746121611F10000811170021242230D06080412340303A076D8FD03',
			text: ' up, man?'
		},
		{
			parts: '1 & 3',
			pduStr1: '07919730071111F1400B919746121611F10000811170021222230E060804123403015774987E9A03',
			pduStr2: '07919730071111F1400B919746121611F10000811170021242230D06080412340303A076D8FD03',
			text: "What's man?"
		}
	])('Concatenated message unsorted parts ($parts)', ({ pduStr1, pduStr2, text }) => {
		const parsedPdu1 = parse(pduStr1);
		expectDeliver(parsedPdu1);

		const parsedPdu2 = parse(pduStr2);
		expectDeliver(parsedPdu2);

		parsedPdu1.data.append(parsedPdu2);
		expectUserData(parsedPdu1, { text });
	});

	test('Duplicated parts of a concatenated message', () => {
		const pduStr = '07919730071111F1400B919746121611F10000811170021222230E06080412340201C8329BFD6601';

		const parsedPdu = parse(pduStr);
		expectDeliver(parsedPdu);

		// Appending the same part
		parsedPdu.data.append(parsedPdu);

		expectUserData(parsedPdu, { text: 'Hello,' });
	});

	test('Parts of different messages', () => {
		const pduStr1 = '07919730071111F1400B919746121611F10000811170021222230E06080412340201C8329BFD6601';
		const pduStr2 = '07919730071111F1400B919746121611F10000811170021232230F06080412350202A0FB5BCE268700';

		const parsedPdu1 = parse(pduStr1);
		expectDeliver(parsedPdu1);

		const parsedPdu2 = parse(pduStr2);
		expectDeliver(parsedPdu2);

		expect(() => parsedPdu1.data.append(parsedPdu2)).toThrowError('Part from different message!');
	});

	test('Parts with a collided identifiers', () => {
		const pduStr1 = '07919730071111F1400B919746121611F10000811170021222230E06080412340201C8329BFD6601';
		const pduStr2 = '07919730071111F1400B919746121611F10000811170021232230C06080412340302A03A9C05';

		const parsedPdu1 = parse(pduStr1);
		expectDeliver(parsedPdu1);

		const parsedPdu2 = parse(pduStr2);
		expectDeliver(parsedPdu2);

		expect(() => parsedPdu1.data.append(parsedPdu2)).toThrowError('Part from different message!');
	});

	test('Concat message with 8bit ref.', () => {
		const pduStr1 = '07919730071111F1400B919746121611F10000100161916223230D0500032E020190E175DD1D06';
		const pduStr2 = '07919730071111F1400B919746121611F10000100161916233230E0500032E020240ED303D4C0F03';

		const parsedPdu1 = parse(pduStr1);
		expectDeliver(parsedPdu1);

		const parsedPdu2 = parse(pduStr2);
		expectDeliver(parsedPdu2);

		parsedPdu1.data.append(parsedPdu2);
		expectUserData(parsedPdu1, { text: 'Hakuna matata' });
	});
});
