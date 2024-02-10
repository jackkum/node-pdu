import { Data } from './utils/Data/Data';
import { Helper } from './utils/Helper';
import { PDU, PDUOptions } from './utils/PDU';
import { SCA } from './utils/SCA/SCA';
import { SubmitType } from './utils/Type/SubmitType';
import { VP } from './utils/VP';

export type SubmitOptions = PDUOptions & {
	type?: SubmitType;
	messageReference?: number;
	validityPeriod?: VP;
};

export class Submit extends PDU {
	private _type: SubmitType;
	private _data: Data;
	private _messageReference: number;
	private _validityPeriod: VP;

	constructor(address: string | SCA, data: string | Data, options: SubmitOptions = {}) {
		super(address, options);

		this._type = options.type || new SubmitType();
		this._data = this.findData(data);
		this._messageReference = options.messageReference || 0x00;
		this._validityPeriod = options.validityPeriod || new VP();
	}

	/*
	 * getter & setter
	 */

	get type() {
		return this._type;
	}

	get data() {
		return this._data;
	}

	get messageReference() {
		return this._messageReference;
	}

	get validityPeriod() {
		return this._validityPeriod;
	}

	setType(type: SubmitType) {
		this._type = type;
		return this;
	}

	setData(data: string | Data) {
		this._data = this.findData(data);
		return this;
	}

	setMessageReference(messageReference: number) {
		this._messageReference = messageReference;
		return this;
	}

	setValidityPeriod(value: VP | string | number) {
		if (value instanceof VP) {
			this._validityPeriod = value;
			return this;
		}

		this._validityPeriod = new VP();

		if (typeof value === 'string') {
			this._validityPeriod.setDateTime(value);
		} else {
			this._validityPeriod.setInterval(value);
		}

		return this;
	}

	/*
	 * private functions
	 */

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
		return this.getParts()
			.map((part) => part.toString(this))
			.join('\n');
	}

	getStart() {
		let str = '';

		str += this.serviceCenterAddress.toString();
		str += this._type.toString();
		str += Helper.toStringHex(this._messageReference);
		str += this.address.toString();
		str += Helper.toStringHex(this.protocolIdentifier.getValue());
		str += this.dataCodingScheme.toString();
		str += this._validityPeriod.toString(this);

		return str;
	}
}
