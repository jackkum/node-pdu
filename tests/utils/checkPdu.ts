import { expect } from 'vitest';
import { Deliver, Report, Submit, utils } from '../../src/index';

export function expectDeliver(pdu: utils.PDU): asserts pdu is Deliver {
	expect(pdu).instanceOf(Deliver);
}

export function expectReport(pdu: utils.PDU): asserts pdu is Report {
	expect(pdu).instanceOf(Report);
}

export function expectSubmit(pdu: utils.PDU): asserts pdu is Submit {
	expect(pdu).instanceOf(Submit);
}

export function expectDeliverOrSubmit(pdu: utils.PDU): asserts pdu is Deliver | Submit {
	expect(pdu instanceof Deliver || pdu instanceof Submit, 'expects PDU to be an instance of Deliver or Submit').toBeTruthy();
}

export function expectServiceCenterAddress(pdu: Deliver | Report | Submit, expecting: string) {
	expect(pdu.serviceCenterAddress.isAddress).toBeFalsy();
	expect(pdu.serviceCenterAddress.phone).toBe(expecting);
}

export function expectAddress(pdu: Deliver | Report | Submit, expecting: string) {
	const isInternatinal = expecting.startsWith('00') || expecting.startsWith('+');

	if (isInternatinal) {
		if (expecting.startsWith('+')) {
			expecting = expecting.substring(1);
		}

		if (expecting.startsWith('00')) {
			expecting = expecting.substring(2);
		}
	}

	expect(pdu.address.isAddress).toBeTruthy();
	expect(pdu.address.phone).toBe(expecting);

	if (isInternatinal) {
		expect(pdu.address.type.type).toBe(utils.SCAType.TYPE_INTERNATIONAL);
	}
}

export function expectDataCodingScheme(pdu: Deliver | Report | Submit, expecting: number) {
	expect(pdu.dataCodingScheme.getValue()).toBe(expecting);
}

export function expectServiceCenterTimeStamp(pdu: Deliver, expecting: string) {
	expect(pdu.serviceCenterTimeStamp.getIsoString()).toBe(expecting);
}

export function expectUserDataHeader(pdu: Deliver | Submit, expecting: { current: number; pointer: number; segments: number }) {
	const header = pdu.data.parts[0]?.header;

	expect(header).instanceOf(utils.Header);
	expect(header?.getCurrent()).toBe(expecting.current);
	expect(header?.getPointer()).toBe(expecting.pointer);
	expect(header?.getSegments()).toBe(expecting.segments);
}

export function expectUserData(pdu: Deliver | Submit, expecting: { text: string; size?: number }) {
	expect(pdu.data.getText()).toBe(expecting.text);

	if (expecting.size !== undefined) {
		expect(pdu.data.size).toBe(expecting.size);
	}
}
