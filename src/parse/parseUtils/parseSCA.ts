import { Helper } from '../../utils/Helper';
import { SCA } from '../../utils/SCA/SCA';
import { SCAType } from '../../utils/SCA/SCAType';
import { GetSubstr } from '../index';

/**
 * Parses the Service Center Address (SCA) from a given substring extractor.
 * This function extracts and constructs an SCA object from the provided PDU string parts.
 *
 * @param getPduSubstr A function to extract substrings from the PDU string
 * @param isAddress Indicates whether the SCA represents an address (OA or DA)
 *
 * @returns An instance of SCA containing the parsed SCA information
 */
export default function parseSCA(getPduSubstr: GetSubstr, isAddress: boolean) {
	const buffer = Buffer.from(getPduSubstr(2), 'hex');
	const sca = new SCA(isAddress);
	let size = buffer[0];
	let octets;

	if (!size) {
		return sca;
	}

	// if is OA or DA then the size in semi-octets
	if (isAddress) {
		octets = Math.ceil(size / 2); // to full octets
		// else size in octets
	} else {
		size--;
		octets = size;
		size *= 2; // to semi-octets for future usage
	}

	const bufferScaType = Buffer.from(getPduSubstr(2), 'hex');
	const type = new SCAType(bufferScaType[0]);
	const hex = getPduSubstr(octets * 2);

	sca.type.setType(type.type);
	sca.type.setPlan(type.plan);

	if (sca.type.type === SCAType.TYPE_ALPHANUMERICAL) {
		size = Math.floor((size * 4) / 7); // semi-octets to septets
		return sca.setPhone(Helper.decode7Bit(hex, size), false, !isAddress);
	}

	// Detect padding char
	if (!isAddress && hex.charAt(size - 2) === 'F') {
		size--;
	}

	const phone = (hex.match(/.{1,2}/g) || [])
		.map((b) => SCA.mapFilterDecode(b).split('').reverse().join(''))
		.join('')
		.slice(0, size);

	return sca.setPhone(phone, false, !isAddress);
}
