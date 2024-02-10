import { PDU, PDUOptions } from './utils/PDU';
import { SCA } from './utils/SCA/SCA';
import { SCTS } from './utils/SCTS';
import { ReportType } from './utils/Type/ReportType';

export type ReportOptions = PDUOptions & {
	type?: ReportType;
};

export class Report extends PDU {
	private _type: ReportType;
	private _reference: number;
	private _dateTime: SCTS;
	private _discharge: SCTS;

	/*
	 * report status
	 * 0x00 Short message received succesfully
	 * 0x01 Short message forwarded to the mobile phone, but unable to confirm delivery
	 * 0x02 Short message replaced by the service center
	 * 0x20 Congestion
	 * 0x21 SME busy
	 * 0x22 No response from SME
	 * 0x23 Service rejected
	 * 0x24 Quality of service not available
	 * 0x25 Error in SME
	 * 0x40 Remote procedure error
	 * 0x41 Incompatible destination
	 * 0x42 Connection rejected by SME
	 * 0x43 Not obtainable
	 * 0x44 Quality of service not available
	 * 0x45 No interworking available
	 * 0x46 SM validity period expired
	 * 0x47 SM deleted by originating SME
	 * 0x48 SM deleted by service center administration
	 * 0x49 SM does not exist
	 * 0x60 Congestion
	 * 0x61 SME busy
	 * 0x62 No response from SME
	 * 0x63 Service rejected
	 * 0x64 Quality of service not available
	 * 0x65 Error in SME
	 */
	private _status: number;

	constructor(address: string | SCA, reference: number, dateTime: SCTS, discharge: SCTS, status: number, options: ReportOptions = {}) {
		super(address, options);

		this._type = options.type || new ReportType();
		this._reference = reference;
		this._dateTime = dateTime;
		this._discharge = discharge;
		this._status = status;
	}

	/*
	 * getter & setter
	 */

	get type() {
		return this._type;
	}

	setType(type: ReportType) {
		this._type = type;
		return this;
	}

	get reference() {
		return this._reference;
	}

	setReference(reference: number) {
		this._reference = reference;
		return this;
	}

	get dateTime() {
		return this._dateTime;
	}

	setDateTime(dateTime: SCTS) {
		this._dateTime = dateTime;
		return this;
	}

	get discharge() {
		return this._discharge;
	}

	setDischarge(discharge: SCTS) {
		this._discharge = discharge;
		return this;
	}

	get status() {
		return this._status;
	}

	setStatus(status: number) {
		this._status = status;
		return this;
	}
}
