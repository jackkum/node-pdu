import { SCTS } from '../../utils/SCTS';
import { GetSubstr } from '../index';

/**
 * Parses the Service Center Time Stamp (SCTS) from a given substring extractor.
 * This function extracts and constructs an SCTS object representing the date and time provided in the PDU string.
 *
 * @param getPduSubstr A function to extract substrings from the PDU string
 *
 * @returns An instance of SCTS containing the parsed date and time information
 * @throws Throws an error if there are not enough bytes to parse or if parsing fails
 */
export default function parseSCTS(getPduSubstr: GetSubstr) {
	const hex = getPduSubstr(14);
	const params: number[] = [];

	if (!hex) {
		throw new Error('node-pdu: Not enough bytes!');
	}

	(hex.match(/.{1,2}/g) || []).map((s) => {
		// NB: 7'th element (index = 6) is TimeZone and it can be a HEX
		if ((params.length < 6 && /\D+/.test(s)) || (params.length === 6 && /[^0-9A-Fa-f]/.test(s))) {
			params.push(0);
			return;
		}

		params.push(parseInt(s.split('').reverse().join(''), params.length < 6 ? 10 : 16));
	});

	if (params.length < 6) {
		throw new Error('node-pdu: Parsing failed!');
	}

	// Parse TimeZone field (see 3GPP TS 23.040 section 9.2.3.11)
	let tzOff = params[6] & 0x7f;
	tzOff = (tzOff >> 4) * 10 + (tzOff & 0x0f); // Semi-octet to int
	tzOff = tzOff * 15; // Quarters of an hour to minutes

	// Check sign
	if (params[6] & 0x80) {
		tzOff *= -1;
	}

	// Build ISO8601 datetime
	const isoTime = new Date(
		Date.UTC(
			// Year
			params[0] > 70 ? 1900 + params[0] : 2000 + params[0],
			// Month
			params[1] - 1,
			// Day
			params[2],
			// Hour
			params[3],
			// Minute
			params[4],
			// Secound
			params[5]
		)
	);

	isoTime.setUTCMinutes(isoTime.getUTCMinutes() - tzOff);

	return new SCTS(isoTime, tzOff);
}
