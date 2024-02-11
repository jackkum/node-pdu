import { Data } from './utils/Data/Data';
import { Helper } from './utils/Helper';
import { PDU, PDUOptions } from './utils/PDU';
import { SCA } from './utils/SCA/SCA';
import { SubmitType } from './utils/Type/SubmitType';
import { VP } from './utils/VP';

/**
 * Represents a GSM SMS Submit PDU.
 *
 * Facilitates sending SMS messages from devices to the SMSC. It's critical for any application or service
 * that needs to initiate outbound text messages.
 */
export class Submit extends PDU {
	private _type: SubmitType;
	private _data: Data;
	private _messageReference: number;
	private _validityPeriod: VP;

	/**
	 * Constructs a SMS Submit PDU instance.
	 *
	 * @param address The recipents address as a string or an instance of SCA
	 * @param data The message content as a string or an instance of Data
	 * @param options An object containing optional parameters for the Submit instance
	 */
	constructor(address: string | SCA, data: string | Data, options: SubmitOptions = {}) {
		super(address, options);

		this._type = options.type || new SubmitType();
		this._data = this.findData(data);
		this._messageReference = options.messageReference || 0x00;
		this._validityPeriod = options.validityPeriod || new VP();
	}

	/*
	 * ================================================
	 *                Getter & Setter
	 * ================================================
	 */

	/**
	 * Retrieves the message type for this Submit PDU.
	 *
	 * This property represents the specific characteristics and parameters related to the submission of the SMS message,
	 * such as whether it's a standard message, a status report request, etc.
	 *
	 * @returns The current SubmitType instance, defining the message type
	 */
	get type() {
		return this._type;
	}

	/**
	 * Sets the message type for this Submit PDU.
	 *
	 * Allows for specifying the type of SMS submit message, adjusting its parameters like whether it requests
	 * a status report, among other options.
	 *
	 * @param type The new SubmitType instance to set as the message type
	 * @returns The instance of this Submit, allowing for method chaining
	 */
	setType(type: SubmitType) {
		this._type = type;
		return this;
	}

	/**
	 * Retrieves the data/content of the SMS message.
	 *
	 * This property holds the actual message content that will be sent, which can be in various formats
	 * (e.g., plain text, binary data) depending on the data coding scheme.
	 *
	 * @returns The current Data instance containing the message content
	 */
	get data() {
		return this._data;
	}

	/**
	 * Sets the data/content of the SMS message.
	 *
	 * This method allows the message content to be updated, accepting either a string (which will be
	 * converted to a Data instance internally) or a Data instance directly.
	 *
	 * @param data The new message content, either as a string or a Data instance
	 * @returns The instance of this Submit, allowing for method chaining
	 */
	setData(data: string | Data) {
		this._data = this.findData(data);
		return this;
	}

	/**
	 * Retrieves the message reference number for this Submit PDU.
	 *
	 * The message reference is a unique identifier for the message, used for tracking purposes and
	 * to correlate delivery reports with the original messages.
	 *
	 * @returns The current message reference number
	 */
	get messageReference() {
		return this._messageReference;
	}

	/**
	 * Sets the message reference number for this Submit PDU.
	 *
	 * This method allows setting a custom message reference number for tracking and correlation purposes.
	 *
	 * @param messageReference The new message reference number
	 * @returns The instance of this Submit, allowing for method chaining
	 */
	setMessageReference(messageReference: number) {
		this._messageReference = messageReference;
		return this;
	}

	/**
	 * Retrieves the Validity Period (VP) for the SMS message.
	 *
	 * The validity period indicates how long the message is valid for delivery before it expires.
	 * This can be specified as an absolute date/time or as a time interval from the submission.
	 *
	 * @returns The current validity period as a VP instance
	 */
	get validityPeriod() {
		return this._validityPeriod;
	}

	/**
	 * Sets the Validity Period (VP) for the SMS message.
	 *
	 * This method allows specifying how long the message is valid for delivery before it expires.
	 * The validity period can be set as an absolute date/time or as a time interval from the submission.
	 *
	 * @param value The new validity period, either as a VP instance, a string (for absolute date/time), or a number (for time interval)
	 * @returns The instance of this Submit, allowing for method chaining
	 */
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
	 * ================================================
	 *                Private functions
	 * ================================================
	 */

	private findData(data: string | Data) {
		if (data instanceof Data) {
			return data;
		}

		return new Data().setData(data, this);
	}

	/*
	 * ================================================
	 *                 Public functions
	 * ================================================
	 */

	/**
	 * Retrieves all parts of the message data.
	 *
	 * For messages that are split into multiple parts (e.g., concatenated SMS), this method returns
	 * all parts as an array.
	 *
	 * @returns An array of Data parts representing the message content
	 */
	getParts() {
		return this._data.parts;
	}

	/**
	 * Retrieves all parts of the message as strings.
	 *
	 * This method is useful for concatenated messages, converting each part of the message data
	 * into a string format based on the current data coding scheme.
	 *
	 * @returns An array of strings, each representing a part of the message content
	 */
	getPartStrings() {
		return this._data.parts.map((part) => part.toString(this));
	}

	/**
	 * Converts the entire Submit PDU into a string representation.
	 *
	 * This method is intended to provide a complete textual representation of the Submit PDU,
	 * including all headers and the message content, formatted according to the PDU protocol.
	 *
	 * @returns A string representation of the Submit PDU
	 */
	toString() {
		return this.getParts()
			.map((part) => part.toString(this))
			.join('\n');
	}

	/**
	 * Generates a string representation of the start of the PDU.
	 *
	 * This method constructs the initial part of the PDU string, including information like the
	 * service center address, message type, message reference number, sender's address, protocol identifier,
	 * data coding scheme, and validity period.
	 *
	 * @returns A string representing the start of the PDU
	 */
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

export type SubmitOptions = PDUOptions & {
	type?: SubmitType;
	messageReference?: number;
	validityPeriod?: VP;
};
