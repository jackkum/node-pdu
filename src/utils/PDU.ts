import { DCS } from './DCS';
import { PID } from './PID';
import { SCA } from './SCA/SCA';
import { DeliverType } from './Type/DeliverType';
import { ReportType } from './Type/ReportType';
import { SubmitType } from './Type/SubmitType';

/**
 * An abstract base class for Protocol Data Units (PDU) in SMS messaging.
 *
 * Defines the basic structure and functionalities common to all types of PDUs used in the GSM SMS system.
 * This class serves as a foundation for more specific PDU classes like Submit, Deliver, and Report.
 */
export abstract class PDU {
	abstract type: DeliverType | ReportType | SubmitType;

	private _address: SCA;
	private _serviceCenterAddress: SCA;
	private _protocolIdentifier: PID;
	private _dataCodingScheme: DCS;

	/**
	 * Constructs a Protocol Description Unit (PDU) instance.
	 *
	 * @param address The address as a string or SCA instance
	 * @param options An object containing optional parameters for the PDU instance
	 */
	constructor(address: string | SCA, options: PDUOptions = {}) {
		this._address = this.findAddress(address);

		this._serviceCenterAddress = options.serviceCenterAddress || new SCA(false);
		this._protocolIdentifier = options.protocolIdentifier || new PID();
		this._dataCodingScheme = options.dataCodingScheme || new DCS();
	}

	/*
	 * ================================================
	 *                Getter & Setter
	 * ================================================
	 */

	/**
	 * Represents the address of the recipient.
	 * @returns The current address as an SCA instance
	 */
	get address() {
		return this._address;
	}

	/**
	 * Sets the address of the recipient.
	 *
	 * This method updates the address for the PDU. It accepts either a string or an SCA instance.
	 * If a string is provided, it converts it to an SCA instance.
	 *
	 * @param address The new address, either as a string or an SCA instance
	 * @returns The instance of this PDU, allowing for method chaining
	 */
	setAddress(address: string | SCA) {
		this._address = this.findAddress(address);
		return this;
	}

	/**
	 * Returns the Service Center Address (SCA) of the SMS message.
	 *
	 * The Service Center Address is used by the GSM network to know where to send the SMS.
	 *
	 * @returns The current service center address as an SCA instance
	 */
	get serviceCenterAddress() {
		return this._serviceCenterAddress;
	}

	/**
	 * Sets the Service Center Address (SCA) for the SMS message.
	 *
	 * This address is crucial for routing the message through the GSM network. The method accepts
	 * either an SCA instance directly or a string that will be converted into an SCA.
	 *
	 * @param address The new service center address, either as a string or an SCA instance
	 * @returns The instance of this PDU, allowing for method chaining
	 */
	setServiceCenterAddress(address: SCA | string) {
		if (address instanceof SCA) {
			this._serviceCenterAddress = address;
			return this;
		}

		this._serviceCenterAddress.setPhone(address, false, true);
		return this;
	}

	/**
	 * Retrieves the Protocol Identifier (PID) of the SMS message.
	 *
	 * The PID is used to indicate interworking and teleservices. It determines how the message
	 * should be processed by the receiving entity.
	 *
	 * @returns The current protocol identifier as a PID instance
	 */
	get protocolIdentifier() {
		return this._protocolIdentifier;
	}

	/**
	 * Sets the Protocol Identifier (PID) for the SMS message.
	 *
	 * This method allows customization of the message's PID, which can affect delivery and processing.
	 * Only PID instances are accepted to ensure correct format and compatibility.
	 *
	 * @param pid The new protocol identifier as a PID instance
	 * @returns The instance of this PDU, allowing for method chaining
	 */
	setProtocolIdentifier(pid: PID) {
		this._protocolIdentifier = pid;
		return this;
	}

	/**
	 * Retrieves the Data Coding Scheme (DCS) of the SMS message.
	 *
	 * The DCS indicates the data type of the message content (e.g., text, UCS2, etc.) and may
	 * influence how the message is displayed on the recipient's device.
	 *
	 * @returns The current data coding scheme as a DCS instance
	 */
	get dataCodingScheme() {
		return this._dataCodingScheme;
	}

	/**
	 * Sets the Data Coding Scheme (DCS) for the SMS message.
	 *
	 * Adjusting the DCS can change how the message content is interpreted and displayed by the
	 * recipient's device. This method accepts only DCS instances to ensure proper format.
	 *
	 * @param dcs The new data coding scheme as a DCS instance
	 * @returns The instance of this PDU, allowing for method chaining
	 */
	setDataCodingScheme(dcs: DCS) {
		this._dataCodingScheme = dcs;
		return this;
	}

	/*
	 * ================================================
	 *                Private functions
	 * ================================================
	 */

	private findAddress(address: string | SCA) {
		if (address instanceof SCA) {
			return address;
		}

		return new SCA().setPhone(address);
	}
}

export type PDUOptions = {
	serviceCenterAddress?: SCA;
	protocolIdentifier?: PID;
	dataCodingScheme?: DCS;
};
