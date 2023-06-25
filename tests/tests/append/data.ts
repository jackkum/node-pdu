export const data: Data[] = [
	{
		name: 'Simple concatenated message #1',
		pduStr1: '07919730071111F1400B919746121611F10000811170021222230E06080412340201C8329BFD6601',
		pduStr2: '07919730071111F1400B919746121611F10000811170021232230F06080412340202A0FB5BCE268700',
		expectedResult: {
			data: {
				text: 'Hello, world!'
			}
		}
	},
	{
		name: 'Simple concatenated message #2, rev. parts order',
		pduStr1: '07919730071111F1400B919746121611F10000811170021232230F06080412350202A0FB5BCE268700',
		pduStr2: '07919730071111F1400B919746121611F10000811170021222230B06080412350201C8340B',
		expectedResult: {
			data: {
				text: 'Hi, world!'
			}
		}
	},
	{
		name: 'Simple concatenated message #3, parts 1 & 2',
		pduStr1: '07919730071111F1400B919746121611F10000811170021222230E060804123403015774987E9A03',
		pduStr2: '07919730071111F1400B919746121611F10000811170021232230C06080412340302A03A9C05',
		expectedResult: {
			data: {
				text: "What's up,"
			}
		}
	},
	{
		name: 'Simple concatenated message #3, parts 1 & 3',
		pduStr1: '07919730071111F1400B919746121611F10000811170021222230E060804123403015774987E9A03',
		pduStr2: '07919730071111F1400B919746121611F10000811170021242230D06080412340303A076D8FD03',
		expectedResult: {
			data: {
				text: "What's man?"
			}
		}
	},
	{
		name: 'Simple concatenated message #3, parts 2 & 3',
		pduStr1: '07919730071111F1400B919746121611F10000811170021232230C06080412340302A03A9C05',
		pduStr2: '07919730071111F1400B919746121611F10000811170021242230D06080412340303A076D8FD03',
		expectedResult: {
			data: {
				text: ' up, man?'
			}
		}
	},
	{
		name: 'Duplicated parts of a concatenated message',
		pduStr1: '07919730071111F1400B919746121611F10000811170021222230E06080412340201C8329BFD6601',
		pduStr2: '07919730071111F1400B919746121611F10000811170021222230E06080412340201C8329BFD6601',
		expectedResult: {
			data: {
				text: 'Hello,'
			}
		}
	},
	{
		name: 'Parts of different messages',
		pduStr1: '07919730071111F1400B919746121611F10000811170021222230E06080412340201C8329BFD6601',
		pduStr2: '07919730071111F1400B919746121611F10000811170021232230F06080412350202A0FB5BCE268700',
		expectedError: 'node-pdu: Part from different message!'
	},
	{
		name: 'Parts with a collided identifiers',
		pduStr1: '07919730071111F1400B919746121611F10000811170021222230E06080412340201C8329BFD6601',
		pduStr2: '07919730071111F1400B919746121611F10000811170021232230C06080412340302A03A9C05',
		expectedError: 'node-pdu: Part from different message!'
	},
	{
		name: 'Concat message with 8bit ref.',
		pduStr1: '07919730071111F1400B919746121611F10000100161916223230D0500032E020190E175DD1D06',
		pduStr2: '07919730071111F1400B919746121611F10000100161916233230E0500032E020240ED303D4C0F03',
		expectedResult: {
			data: {
				text: 'Hakuna matata'
			}
		}
	}
];

export interface Data {
	name: string;
	pduStr1: string;
	pduStr2: string;
	expectedResult?: {
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
	expectedError?: string;
}
