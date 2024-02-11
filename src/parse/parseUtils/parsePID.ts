import { PID } from '../../utils/PID';
import { GetSubstr } from '../index';

/**
 * Parses Protocol Identifier (PID) from a PDU string.
 *
 * This function extracts Protocol Identifier information from the provided PDU string
 * and constructs a PID object to represent it.
 *
 * @param getPduSubstr A function to extract substrings from the PDU string
 * @returns An instance of PID containing parsed information
 */
export default function parsePID(getPduSubstr: GetSubstr) {
	const buffer = Buffer.from(getPduSubstr(2), 'hex');
	const byte = buffer[0];
	const pid = new PID();

	pid.setPid(byte >> 6);
	pid.setIndicates(byte >> 5);
	pid.setType(byte);

	return pid;
}
