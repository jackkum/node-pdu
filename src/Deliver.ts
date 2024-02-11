import { Data } from './utils/Data/Data';
import { Helper } from './utils/Helper';
import { PDU, PDUOptions } from './utils/PDU';
import { SCA } from './utils/SCA/SCA';
import { SCTS } from './utils/SCTS';
import { DeliverType } from './utils/Type/DeliverType';

/**
 * Represents a GSM SMS Deliver PDU.
 *
 * Used for receiving SMS messages. It includes information like the sender's address and the message content,
 * essential for any application or service that needs to process or display incoming text messages to users.
 */
export class Deliver extends PDU {
	private _type: DeliverType;
	private _data: Data;
	private _serviceCenterTimeStamp: SCTS;

	/**
	 * Constructs a SMS Deliver PDU instance.
	 *
	 * @param address The sender's address as a string or an instance of SCA
	 * @param data The message content as a string or an instance of Data
	 * @param options An object containing optional parameters for the Deliver instance
	 */
	constructor(address: string | SCA, data: string | Data, options: DeliverOptions = {}) {
		super(address, options);

		this._type = options.type || new DeliverType();
		this._data = this.findData(data);
		this._serviceCenterTimeStamp = options.serviceCenterTimeStamp || new SCTS(this.getDateTime());
	}

	/*
	 * ================================================
	 *                Getter & Setter
	 * ================================================
	 */

	/**
	 * Retrieves the message type for this Deliver PDU.
	 *
	 * This property represents the specific characteristics and parameters related to the delivery of the SMS message,
	 * such as whether it's a standard message, a status report request, etc.
	 *
	 * @returns The current DeliverType instance, defining the message type
	 */
	get type() {
		return this._type;
	}

	/**
	 * Sets the message type for this Deliver PDU.
	 *
	 * Allows for specifying the type of SMS deliver message, adjusting its parameters like whether it requests
	 * a status report, among other options.
	 *
	 * @param type The new DeliverType instance to set as the message type
	 * @returns The instance of this Deliver, allowing for method chaining
	 */
	setType(type: DeliverType) {
		this._type = type;
		return this;
	}

	/**
	 * Retrieves the data/content of the SMS message.
	 *
	 * This property holds the actual message content that was sent, which can be in various formats
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
	 * @returns The instance of this Deliver, allowing for method chaining
	 */
	setData(data: string | Data) {
		this._data = this.findData(data);
		return this;
	}

	/**
	 * Retrieves the timestamp from the service center.
	 *
	 * This timestamp represents when the SMS message was received by the service center, providing
	 * information about the message's delivery time.
	 *
	 * @returns The current SCTS (Service Center Time Stamp) instance
	 */
	get serviceCenterTimeStamp() {
		return this._serviceCenterTimeStamp;
	}

	/**
	 * Sets the service center timestamp for the SMS message.
	 *
	 * This method updates the timestamp indicating when the message was received by the service center.
	 * It accepts either a Date object or an SCTS instance. If a Date is provided, it is converted to an SCTS.
	 *
	 * @param time The new timestamp, either as a Date or an SCTS instance
	 * @returns The instance of this Deliver, allowing for method chaining
	 */
	setServiceCenterTimeStamp(time: Date | SCTS = this.getDateTime()) {
		if (time instanceof SCTS) {
			this._serviceCenterTimeStamp = time;
			return this;
		}

		this._serviceCenterTimeStamp = new SCTS(time);

		return this;
	}

	/*
	 * ================================================
	 *                Private functions
	 * ================================================
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
	 * Converts the entire Deliver PDU into a string representation.
	 *
	 * This method is intended to provide a complete textual representation of the Deliver PDU,
	 * including all headers and the message content, formatted according to the PDU protocol.
	 *
	 * @returns A string representation of the Deliver PDU
	 */
	toString() {
		return this.getStart();
	}

	/**
	 * Generates a string representation of the start of the PDU.
	 *
	 * This method constructs the initial part of the PDU string, including information like the
	 * service center address, message type, sender's address, protocol identifier, data coding scheme,
	 * and service center timestamp.
	 *
	 * @returns A string representing the start of the PDU
	 */
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

export type DeliverOptions = PDUOptions & {
	type?: DeliverType;
	serviceCenterTimeStamp?: SCTS;
};
