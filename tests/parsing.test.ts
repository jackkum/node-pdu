import { describe, test } from 'vitest';
import { parse } from '../src/index';
import {
	expectAddress,
	expectDataCodingScheme,
	expectDeliver,
	expectDeliverOrSubmit,
	expectServiceCenterAddress,
	expectServiceCenterTimeStamp,
	expectSubmit,
	expectUserData,
	expectUserDataHeader
} from './utils/checkPdu';

describe('Parser', () => {
	test('Simple Deliver message', () => {
		const pduStr = '07919730071111F1000B919746121611F10000811170021222230DC8329BFD6681EE6F399B1C02';
		const parsedPdu = parse(pduStr);

		expectDeliver(parsedPdu);
		expectServiceCenterAddress(parsedPdu, '79037011111');
		expectAddress(parsedPdu, '79642161111');
		expectServiceCenterTimeStamp(parsedPdu, '2018-11-07T20:21:22+08:00');
		expectUserData(parsedPdu, { text: 'Hello, world!' });
	});

	test('Negative SCTS Time Zone offset', () => {
		const pduStr = '07919730071111F1000B919746121611F100008111700212222B0DC8329BFD6681EE6F399B1C02';
		const parsedPdu = parse(pduStr);

		expectDeliver(parsedPdu);
		expectServiceCenterTimeStamp(parsedPdu, '2018-11-07T20:21:22-08:00');
	});

	test.each([
		{
			pduStr: '001100039199F90000FF1A4937BD2C7787E9E9B73BCC06C1D16F7719E4AEB7C56539',
			address: '+999',
			text: 'International phone number'
		},
		{
			pduStr: '001100039199F90000FF1A4937BD2C7787E9E9B73BCC06C1D16F7719E4AEB7C56539',
			address: '00999',
			text: 'International phone number'
		}
	])('International phone number ($address)', ({ pduStr, address, text }) => {
		const parsedPdu = parse(pduStr);

		expectDeliverOrSubmit(parsedPdu);
		expectAddress(parsedPdu, address);
		expectUserData(parsedPdu, { text });
	});

	test('Non-International phone number', () => {
		const pduStr = '000100038199F9000005C8329BFD06';
		const parsedPdu = parse(pduStr);

		expectSubmit(parsedPdu);
		expectAddress(parsedPdu, '999');
		expectUserData(parsedPdu, { text: 'Hello' });
	});

	test('Alphanumeric OA', () => {
		const pduStr = '07911326060032F0000DD0D432DBFC96D30100001121313121114012D7327BFC6E9741F437885A669BDF723A';
		const parsedPdu = parse(pduStr);

		expectDeliver(parsedPdu);
		expectAddress(parsedPdu, 'Telfort');
		expectServiceCenterAddress(parsedPdu, '31626000230');
		expectServiceCenterTimeStamp(parsedPdu, '2011-12-13T13:12:11+01:00');
		expectUserData(parsedPdu, { text: 'Welcome to Telfort' });
	});

	test('Flash SMS', () => {
		const pduStr = '07919730071111F1000B919746121611F10010811170021222231054747A0E4ACF416190991D9EA343';
		const parsedPdu = parse(pduStr);

		expectDeliver(parsedPdu);
		expectAddress(parsedPdu, '79642161111');
		expectDataCodingScheme(parsedPdu, 0x10);
		expectUserData(parsedPdu, { text: 'This is a flash!' });
	});

	test.each([
		{
			pduStr: '07919730071111F1000B919746121611F10000811170021222230A1B5E583C2697CD1B1F',
			text: '[abcdef]',
			size: 10
		},
		{
			pduStr: '07919730071111F1000B919746121611F1000081117002122223081B14BD3CA76F52',
			text: '{test}',
			size: 8
		}
	])('Extended 7 bit symbols ("$text")', ({ pduStr, text, size }) => {
		const parsedPdu = parse(pduStr);

		expectDeliverOrSubmit(parsedPdu);
		expectUserData(parsedPdu, { text, size });
	});

	test('UCS2 encoded', () => {
		const pduStr = '07919730071111F1000B919746121611F100088111800212222318041F04400438043204350442002C0020043C043804400021';
		const parsedPdu = parse(pduStr);

		expectDeliver(parsedPdu);

		// Russian: "Hello, world!"
		expectUserData(parsedPdu, { text: '\u041f\u0440\u0438\u0432\u0435\u0442, \u043c\u0438\u0440!', size: 24 });
	});

	test('Test small letters at input', () => {
		const pduStr = '07919730071111f1400b919746121611f100008111701222822310050a03000410846f3619f476b3f3';
		const parsedPdu = parse(pduStr);

		expectDeliver(parsedPdu);
		expectUserData(parsedPdu, { text: 'Bold only' });
	});

	test.each([
		{
			pduStr: '07919730071111F1400B919746121611F100008111701222322342140A030004100A030606200A030E09400A031C0D80C2379BCC0225E961767ACC0255DDE4B29C9D76974161371934A5CBD3EB321D2D7FD7CF6817',
			text: 'Bold, Italic, Underline and Strikethrough.'
		},
		{
			pduStr: '07919730071111F1400B919746121611F100008111701222822310050A03000410846F3619F476B3F3',
			text: 'Bold only'
		}
	])('EMS formatted text (#%#)', ({ pduStr, text }) => {
		const parsedPdu = parse(pduStr);

		expectDeliverOrSubmit(parsedPdu);
		expectUserData(parsedPdu, { text });
	});

	test.each([
		{
			pduStr: '07919730071111F1400B919746121611F10000100161916223230D0500032E020190E175DD1D06',
			pointer: 0x2e,
			segments: 2,
			current: 1,
			text: 'Hakuna'
		},
		{
			pduStr: '07919730071111F1400B919746121611F10000100161916233230E0500032E020240ED303D4C0F03',
			pointer: 0x2e,
			segments: 2,
			current: 2,
			text: ' matata'
		}
	])('Concatenated messages with 8bit ref. (#%#)', ({ pduStr, pointer, segments, current, text }) => {
		const parsedPdu = parse(pduStr);

		expectDeliverOrSubmit(parsedPdu);
		expectUserDataHeader(parsedPdu, { pointer, segments, current });
		expectUserData(parsedPdu, { text });
	});

	test.each([
		{
			pduStr: '07919730071111F1400B919746121611F10000811170021222230E06080412340201C8329BFD6601',
			pointer: 0x1234,
			segments: 2,
			current: 1,
			text: 'Hello,'
		},
		{
			pduStr: '07919730071111F1400B919746121611F10000811170021232230F06080412340202A0FB5BCE268700',
			pointer: 0x1234,
			segments: 2,
			current: 2,
			text: ' world!'
		},
		{
			pduStr: '07919730071111F1400B919746121611F10000811170021222230B06080412350201C8340B',
			pointer: 0x1235,
			segments: 2,
			current: 1,
			text: 'Hi,'
		},
		{
			pduStr: '07919730071111F1400B919746121611F10000811170021232230F06080412350202A0FB5BCE268700',
			pointer: 0x1235,
			segments: 2,
			current: 2,
			text: ' world!'
		},
		{
			pduStr: '07919730071111F1400B919746121611F10000811170021222230E060804123403015774987E9A03',
			pointer: 0x1234,
			segments: 3,
			current: 1,
			text: "What's"
		},
		{
			pduStr: '07919730071111F1400B919746121611F10000811170021232230C06080412340302A03A9C05',
			pointer: 0x1234,
			segments: 3,
			current: 2,
			text: ' up,'
		},
		{
			pduStr: '07919730071111F1400B919746121611F10000811170021242230D06080412340303A076D8FD03',
			pointer: 0x1234,
			segments: 3,
			current: 3,
			text: ' man?'
		}
	])('Concatenated messages with 16bit ref. (#%#)', ({ pduStr, pointer, segments, current, text }) => {
		const parsedPdu = parse(pduStr);

		expectDeliverOrSubmit(parsedPdu);
		expectUserDataHeader(parsedPdu, { pointer, segments, current });
		expectUserData(parsedPdu, { text });
	});
});
