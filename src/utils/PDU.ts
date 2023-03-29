import { DCS } from './DCS';
import { PID } from './PID';
import { SCA } from './SCA/SCA';
import { DeliverType } from './Type/DeliverType';
import { ReportType } from './Type/ReportType';
import { SubmitType } from './Type/SubmitType';

export interface PDUOptions {
	serviceCenterAddress?: SCA;
	protocolIdentifier?: PID;
	dataCodingScheme?: DCS;
}

/*
 * Protocol Description Unit
 */

export abstract class PDU {
	abstract type: DeliverType | ReportType | SubmitType;

	private _address: SCA;
	private _serviceCenterAddress: SCA;
	private _protocolIdentifier: PID;
	private _dataCodingScheme: DCS;

	constructor(address: string | SCA, options: PDUOptions = {}) {
		this._address = this.findAddress(address);

		this._serviceCenterAddress = options.serviceCenterAddress || new SCA(false);
		this._protocolIdentifier = options.protocolIdentifier || new PID();
		this._dataCodingScheme = options.dataCodingScheme || new DCS();
	}

	/*
	 * getter & setter
	 */

	get address() {
		return this._address;
	}

	setAddress(address: string | SCA) {
		this._address = this.findAddress(address);
		return this;
	}

	get serviceCenterAddress() {
		return this._serviceCenterAddress;
	}

	setServiceCenterAddress(address: SCA | string) {
		if (address instanceof SCA) {
			this._serviceCenterAddress = address;
			return this;
		}

		this._serviceCenterAddress.setPhone(address, false, true);
		return this;
	}

	get protocolIdentifier() {
		return this._protocolIdentifier;
	}

	setProtocolIdentifier(pid: PID) {
		this._protocolIdentifier = pid;
		return this;
	}

	get dataCodingScheme() {
		return this._dataCodingScheme;
	}

	setDataCodingScheme(dcs: DCS) {
		this._dataCodingScheme = dcs;
		return this;
	}

	/*
	 * private functions
	 */

	private findAddress(address: string | SCA) {
		if (address instanceof SCA) {
			return address;
		}

		return new SCA().setPhone(address);
	}
}
