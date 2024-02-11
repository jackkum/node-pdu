import { PDUType } from '../../utils/Type/PDUType';
import { SubmitType } from '../../utils/Type/SubmitType';
import { VP } from '../../utils/VP';
import { GetSubstr } from '../index';
import parseSCTS from './parseSCTS';

/**
 * Parses the validity period (VP) from a PDU string based on the specified validity period format (VPF).
 * This function is used specifically for parsing the validity period of a Submit type PDU.
 *
 * @param type The SubmitType instance specifying the validity period format (VPF)
 * @param getPduSubstr A function to extract substrings from the PDU string
 *
 * @returns An instance of VP representing the parsed validity period
 * @throws Throws an error if an unknown validity period format (VPF) is encountered
 */
export default function parseVP(type: SubmitType, getPduSubstr: GetSubstr) {
	const vpf = type.validityPeriodFormat;
	const vp = new VP();

	if (vpf === PDUType.VPF_NONE) {
		return vp;
	}

	if (vpf === PDUType.VPF_ABSOLUTE) {
		const scts = parseSCTS(getPduSubstr);
		vp.setDateTime(scts.getIsoString());

		return vp;
	}

	if (vpf === PDUType.VPF_RELATIVE) {
		const buffer = Buffer.from(getPduSubstr(2), 'hex');
		const byte = buffer[0];

		if (byte <= 143) {
			vp.setInterval((byte + 1) * (5 * 60));
			return vp;
		}

		if (byte <= 167) {
			vp.setInterval(3600 * 24 * 12 + (byte - 143) * (30 * 60));
			return vp;
		}

		if (byte <= 196) {
			vp.setInterval((byte - 166) * (3600 * 24));
			return vp;
		}

		vp.setInterval((byte - 192) * (3600 * 24 * 7));
		return vp;
	}

	throw new Error('node-pdu: Unknown validity period format!');
}
