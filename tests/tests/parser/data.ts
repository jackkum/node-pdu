export const data: Data[] = [
	{
		name: 'Simple Delivery message #1',
		pduStr: '07919730071111F1000B919746121611F10000811170021222230DC8329BFD6681EE6F399B1C02',
		expectedResult: {
			sca: '79037011111',
			address: '79642161111',
			scts: {
				isoStr: '2018-11-07T20:21:22+08:00'
			},
			data: {
				text: 'Hello, world!'
			}
		}
	},
	{
		name: 'Negative SCTS Time Zone offset',
		pduStr: '07919730071111F1000B919746121611F100008111700212222B0DC8329BFD6681EE6F399B1C02',
		expectedResult: {
			scts: {
				isoStr: '2018-11-07T20:21:22-08:00'
			}
		}
	},
	{
		name: 'Extended 7 bit symbols #1',
		pduStr: '07919730071111F1000B919746121611F10000811170021222230A1B5E583C2697CD1B1F',
		expectedResult: {
			data: {
				size: 10,
				text: '[abcdef]'
			}
		}
	},
	{
		name: 'Extended 7 bit symbols #2',
		pduStr: '07919730071111F1000B919746121611F1000081117002122223081B14BD3CA76F52',
		expectedResult: {
			data: {
				size: 8,
				text: '{test}'
			}
		}
	},
	{
		name: 'UCS2 encoded #1',
		pduStr: '07919730071111F1000B919746121611F100088111800212222318041F04400438043204350442002C0020043C043804400021',
		expectedResult: {
			data: {
				size: 24,
				text: '\u041f\u0440\u0438\u0432\u0435\u0442, \u043c\u0438\u0440!' /* Russian: "Hello, world!" */
			}
		}
	},
	{
		name: 'International phone number #1',
		pduStr: '000100039199F9000005C8329BFD06',
		expectedResult: {
			address: '+999',
			data: {
				text: 'Hello'
			}
		}
	},
	{
		name: 'International phone number #2',
		pduStr: '000100039199F9000005C8329BFD06',
		expectedResult: {
			address: '00999',
			data: {
				text: 'Hello'
			}
		}
	},
	{
		name: 'Non-International phone number',
		pduStr: '000100038199F9000005C8329BFD06',
		expectedResult: {
			address: '999',
			data: {
				text: 'Hello'
			}
		}
	},
	{
		name: 'Alphanumeric OA',
		pduStr: '07911326060032F0000DD0D432DBFC96D30100001121313121114012D7327BFC6E9741F437885A669BDF723A',
		expectedResult: {
			sca: '31626000230',
			address: 'Telfort',
			scts: {
				isoStr: '2011-12-13T13:12:11+01:00'
			},
			data: {
				text: 'Welcome to Telfort'
			}
		}
	},
	{
		name: 'Concatenated message #1 (part 1/2) with 16bit ref.',
		pduStr: '07919730071111F1400B919746121611F10000811170021222230E06080412340201C8329BFD6601',
		expectedResult: {
			udh: {
				pointer: 0x1234,
				segments: 2,
				current: 1
			},
			data: {
				text: 'Hello,'
			}
		}
	},
	{
		name: 'Concatenated message #1 (part 2/2) with 16bit ref.',
		pduStr: '07919730071111F1400B919746121611F10000811170021232230F06080412340202A0FB5BCE268700',
		expectedResult: {
			udh: {
				pointer: 0x1234,
				segments: 2,
				current: 2
			},
			data: {
				text: ' world!'
			}
		}
	},
	{
		name: 'Concatenated message #2 (part 1/2) with 16bit ref.',
		pduStr: '07919730071111F1400B919746121611F10000811170021222230B06080412350201C8340B',
		expectedResult: {
			udh: {
				pointer: 0x1235,
				segments: 2,
				current: 1
			},
			data: {
				text: 'Hi,'
			}
		}
	},
	{
		name: 'Concatenated message #2 (part 2/2) with 16bit ref.',
		pduStr: '07919730071111F1400B919746121611F10000811170021232230F06080412350202A0FB5BCE268700',
		expectedResult: {
			udh: {
				pointer: 0x1235,
				segments: 2,
				current: 2
			},
			data: {
				text: ' world!'
			}
		}
	},
	{
		name: 'Concatenated message #3 (part 1/3) with 16bit ref.',
		pduStr: '07919730071111F1400B919746121611F10000811170021222230E060804123403015774987E9A03',
		expectedResult: {
			udh: {
				pointer: 0x1234,
				segments: 3,
				current: 1
			},
			data: {
				text: "What's"
			}
		}
	},
	{
		name: 'Concatenated message #3 (part 2/3) with 16bit ref.',
		pduStr: '07919730071111F1400B919746121611F10000811170021232230C06080412340302A03A9C05',
		expectedResult: {
			udh: {
				pointer: 0x1234,
				segments: 3,
				current: 2
			},
			data: {
				text: ' up,'
			}
		}
	},
	{
		name: 'Concatenated message #3 (part 3/3) with 16bit ref.',
		pduStr: '07919730071111F1400B919746121611F10000811170021242230D06080412340303A076D8FD03',
		expectedResult: {
			udh: {
				pointer: 0x1234,
				segments: 3,
				current: 3
			},
			data: {
				text: ' man?'
			}
		}
	},
	{
		name: 'Concatenated message #4 (part 1/2) with 8bit ref.',
		pduStr: '07919730071111F1400B919746121611F10000100161916223230D0500032E020190E175DD1D06',
		expectedResult: {
			udh: {
				pointer: 0x2e,
				segments: 2,
				current: 1
			},
			data: {
				text: 'Hakuna'
			}
		}
	},
	{
		name: 'Concatenated message #4 (part 2/2) with 8bit ref.',
		pduStr: '07919730071111F1400B919746121611F10000100161916233230E0500032E020240ED303D4C0F03',
		expectedResult: {
			udh: {
				pointer: 0x2e,
				segments: 2,
				current: 2
			},
			data: {
				text: ' matata'
			}
		}
	},
	{
		name: 'EMS formatted text #1',
		pduStr: '07919730071111F1400B919746121611F100008111701222322342140A030004100A030606200A030E09400A031C0D80C2379BCC0225E961767ACC0255DDE4B29C9D76974161371934A5CBD3EB321D2D7FD7CF6817',
		expectedResult: {
			data: {
				text: 'Bold, Italic, Underline and Strikethrough.'
			}
		}
	},
	{
		name: 'EMS formatted text #2',
		pduStr: '07919730071111F1400B919746121611F100008111701222822310050A03000410846F3619F476B3F3',
		expectedResult: {
			data: {
				text: 'Bold only'
			}
		}
	},
	{
		name: 'Flash SMS',
		pduStr: '07919730071111F1000B919746121611F10010811170021222231054747A0E4ACF416190991D9EA343',
		expectedResult: {
			dcs: 0x10,
			data: { text: 'This is a flash!' }
		}
	}
];

export interface Data {
	name: string;
	pduStr: string;
	expectedResult: {
		sca?: string;
		address?: string;
		scts?: {
			isoStr: string;
		};
		data?: {
			text: string;
			size?: number;
		};
		udh?: {
			pointer: number;
			segments: number;
			current: number;
		};
		dcs?: number;
	};
}
