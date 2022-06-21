import { pdu } from '../index';

export interface Check {
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
}

export function isValidResult(c: Check, pdu0: pdu.Deliver | pdu.Report | pdu.Submit): true | string {
	if (c.sca !== undefined) {
		if (pdu0.serviceCenterAddress.isAddress) {
			// prettier-ignore
			return ('		.serviceCenterAddress.isAddress is wrong!\n' +
					'			Expecting:\n' +
					`			${false}\n` +
					'			Got:\n' +
					`			${pdu0.serviceCenterAddress.isAddress}`);
		}

		if (pdu0.serviceCenterAddress.phone !== c.sca) {
			// prettier-ignore
			return ('		.serviceCenterAddress.phone is wrong!\n' +
					'			Expecting:\n' +
					`			${c.sca}\n` +
					'			Got:\n' +
					`			${pdu0.serviceCenterAddress.phone}`);
		}
	}

	if (c.address !== undefined) {
		if (!pdu0.address.isAddress) {
			// prettier-ignore
			return ('		.address.isAddress is wrong!\n' +
					'			Expecting:\n' +
					`			${true}\n` +
					'			Got:\n' +
					`			${pdu0.address.isAddress}`);
		}

		if (pdu0.address.phone !== c.address) {
			// prettier-ignore
			return ('		.address.phone is wrong!\n' +
					'			Expecting:\n' +
					`			${c.address}\n` +
					'			Got:\n' +
					`			${pdu0.address.phone}`);
		}
	}

	if (c.dcs !== undefined) {
		if (pdu0.dataCodingScheme.getValue() !== c.dcs) {
			// prettier-ignore
			return ('		.dataCodingScheme.getValue() is wrong!\n' +
					'			Expecting:\n' +
					`			${c.dcs}\n` +
					'			Got:\n' +
					`			${pdu0.dataCodingScheme.getValue()}`);
		}
	}

	if (c.scts !== undefined) {
		if (!(pdu0 instanceof pdu.Deliver)) {
			return '		Service Center Time Stamp cannot be checked because the given pdu type is not a type of Deliver!';
		}

		if (pdu0.serviceCenterTimeStamp.getIsoString() !== c.scts.isoStr) {
			// prettier-ignore
			return ('		.serviceCenterTimeStamp.getIsoString() is wrong!\n' +
					'			Expecting:\n' +
					`			${c.scts.isoStr}\n` +
					'			Got:\n' +
					`			${pdu0.serviceCenterTimeStamp.getIsoString()}`);
		}
	}

	if (c.udh !== undefined) {
		if (pdu0 instanceof pdu.Report) {
			return '		User Data Header cannot be checked because the given pdu type is not a type of Deliver or Submit!';
		}

		if (pdu0.data.parts[0]?.header?.getCurrent() !== c.udh.current) {
			// prettier-ignore
			return ('		.data.parts[0].header.getCurrent() is wrong!\n' +
					'			Expecting:\n' +
					`			${c.udh.current}\n` +
					'			Got:\n' +
					`			${pdu0.data.parts[0]?.header?.getCurrent()}`);
		}

		if (pdu0.data.parts[0]?.header?.getPointer() !== c.udh.pointer) {
			// prettier-ignore
			return ('		.data.parts[0].header.getPointer() is wrong!\n' +
					'			Expecting:\n' +
					`			${c.udh.pointer}\n` +
					'			Got:\n' +
					`			${pdu0.data.parts[0]?.header?.getPointer()}`);
		}

		if (pdu0.data.parts[0]?.header?.getSegments() !== c.udh.segments) {
			// prettier-ignore
			return ('		.data.parts[0].header.getSegments() is wrong!\n' +
					'			Expecting:\n' +
					`			${c.udh.segments}\n` +
					'			Got:\n' +
					`			${pdu0.data.parts[0]?.header?.getSegments()}`);
		}
	}

	if (c.data !== undefined) {
		if (pdu0 instanceof pdu.Report) {
			return '		User Data Header cannot be checked because the given pdu type is not a type of Deliver or Submit!';
		}

		if (pdu0.data.getText() !== c.data.text) {
			// prettier-ignore
			return ('		.data.getText() is wrong!\n' +
					'			Expecting:\n' +
					`			${c.data.text}\n` +
					'			Got:\n' +
					`			${pdu0.data.getText()}`);
		}

		if (c.data.size !== undefined && pdu0.data.size !== c.data.size) {
			// prettier-ignore
			return ('		.data.size is wrong!\n' +
					'			Expecting:\n' +
					`			${c.data.size}\n` +
					'			Got:\n' +
					`			${pdu0.data.size}`);
		}
	}

	return true;
}
