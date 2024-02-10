import { Data } from './utils/Data/Data';
import { Helper } from './utils/Helper';
import { PDU, PDUOptions } from './utils/PDU';
import { SCA } from './utils/SCA/SCA';
import { SCTS } from './utils/SCTS';
import { DeliverType } from './utils/Type/DeliverType';

export type DeliverOptions = PDUOptions & {
	type?: DeliverType;
	serviceCenterTimeStamp?: SCTS;
};

export class Deliver extends PDU {
	private _type: DeliverType;
	private _data: Data;
	private _serviceCenterTimeStamp: SCTS;

	constructor(address: string | SCA, data: string | Data, options: DeliverOptions = {}) {
		super(address, options);

		this._type = options.type || new DeliverType();
		this._data = this.findData(data);
		this._serviceCenterTimeStamp = options.serviceCenterTimeStamp || new SCTS(this.getDateTime());
	}

	/*
	 * getter & setter
	 */

	get type() {
		return this._type;
	}

	setType(type: DeliverType) {
		this._type = type;
		return this;
	}

	get data() {
		return this._data;
	}

	setData(data: string | Data) {
		this._data = this.findData(data);
		return this;
	}

	get serviceCenterTimeStamp() {
		return this._serviceCenterTimeStamp;
	}

	setServiceCenterTimeStamp(time: Date | SCTS = this.getDateTime()) {
		if (time instanceof SCTS) {
			this._serviceCenterTimeStamp = time;
			return this;
		}

		this._serviceCenterTimeStamp = new SCTS(time);

		return this;
	}

	/*
	 * private functions
	 */

	private getDateTime() {
		// Create Date in the increment of 10 days
		return new Date(Date.now() + 864000000);
	}

	private findData(data: string | Data) {
		if (data instanceof Data) {
			return data;
		}

		return new Data().setData(data, this);
	}

	/*
	 * public functions
	 */

	getParts() {
		return this._data.parts;
	}

	getPartStrings() {
		return this._data.parts.map((part) => part.toString(this));
	}

	toString() {
		return this.getStart();
	}

	getStart() {
		let str = '';

		str += this.serviceCenterAddress.toString();
		str += this._type.toString();
		str += this.address.toString();
		str += Helper.toStringHex(this.protocolIdentifier.getValue());
		str += this.dataCodingScheme.toString();
		str += this._serviceCenterTimeStamp.toString();

		return str;
	}
}
