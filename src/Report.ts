import { PDU, PDUOptions } from './utils/PDU';
import { SCA } from './utils/SCA/SCA';
import { SCTS } from './utils/SCTS';
import { ReportType } from './utils/Type/ReportType';

/**
 * Represents a GSM SMS delivery Report PDU.
 *
 * Provides feedback on the delivery status of sent SMS messages, indicating success, failure, or delay.
 * This is crucial for ensuring message reliability in services that require confirmation of message delivery,
 * such as transaction alerts and critical notifications.
 */
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

	/**
	 * Constructs a Report PDU instance.
	 *
	 * @param address The sender's address as a string or an instance of SCA
	 * @param reference The reference number of the SMS message for which this report is generated
	 * @param dateTime The original message submission timestamp represented by an SCTS instance
	 * @param discharge The discharge time indicating the completion of the delivery process, as an SCTS instance
	 * @param status The status code indicating the outcome of the delivery attempt
	 * @param options An object containing optional parameters for the Report instance
	 */
	constructor(address: string | SCA, reference: number, dateTime: SCTS, discharge: SCTS, status: number, options: ReportOptions = {}) {
		super(address, options);

		this._type = options.type || new ReportType();
		this._reference = reference;
		this._dateTime = dateTime;
		this._discharge = discharge;
		this._status = status;
	}

	/*
	 * ================================================
	 *                Getter & Setter
	 * ================================================
	 */

	/**
	 * Retrieves the message type for this Report PDU.
	 *
	 * This property indicates the specific type of delivery report, such as whether it's a delivery
	 * acknowledgment or a failure report, providing context for the reported delivery status.
	 *
	 * @returns The current ReportType instance, defining the report type
	 */
	get type() {
		return this._type;
	}

	/**
	 * Sets the message type for this Report PDU.
	 *
	 * Allows for specifying the type of delivery report, which impacts the interpretation of the
	 * report's content and the delivery status it conveys.
	 *
	 * @param type The new ReportType instance to set as the report type
	 * @returns The instance of this Report, allowing for method chaining
	 */
	setType(type: ReportType) {
		this._type = type;
		return this;
	}

	/**
	 * Retrieves the message reference number.
	 *
	 * This number uniquely identifies the SMS message for which this delivery report is generated,
	 * allowing for correlation between sent messages and their respective delivery reports.
	 *
	 * @returns The reference number of the SMS message
	 */
	get reference() {
		return this._reference;
	}

	/**
	 * Sets the message reference number.
	 *
	 * Updates the reference number to match the SMS message this delivery report pertains to,
	 * ensuring accurate identification and tracking of message delivery status.
	 *
	 * @param reference The new reference number for the SMS message
	 * @returns The instance of this Report, allowing for method chaining
	 */
	setReference(reference: number) {
		this._reference = reference;
		return this;
	}

	/**
	 * Retrieves the original message submission timestamp.
	 *
	 * This timestamp represents when the SMS message was originally submitted for delivery,
	 * providing context for the delivery process and timing.
	 *
	 * @returns The SCTS (Service Center Time Stamp) instance representing the submission timestamp
	 */
	get dateTime() {
		return this._dateTime;
	}

	/**
	 * Sets the original message submission timestamp.
	 *
	 * Updates the timestamp indicating when the SMS message was submitted, which is useful for
	 * tracking the duration between message submission and its final delivery status.
	 *
	 * @param dateTime The new SCTS instance representing the submission timestamp
	 * @returns The instance of this Report, allowing for method chaining
	 */
	setDateTime(dateTime: SCTS) {
		this._dateTime = dateTime;
		return this;
	}

	/**
	 * Retrieves the discharge time of the SMS message.
	 *
	 * The discharge time indicates when the message delivery process was completed, whether successfully
	 * or not, providing precise timing information about the delivery status.
	 *
	 * @returns The SCTS (Service Center Time Stamp) instance representing the discharge time
	 */
	get discharge() {
		return this._discharge;
	}

	/**
	 * Sets the discharge time of the SMS message.
	 *
	 * Updates the discharge time to accurately reflect when the message delivery process concluded,
	 * essential for detailed delivery reporting.
	 *
	 * @param discharge The new SCTS instance representing the discharge time
	 * @returns The instance of this Report, allowing for method chaining
	 */
	setDischarge(discharge: SCTS) {
		this._discharge = discharge;
		return this;
	}

	/**
	 * Retrieves the status of the SMS message delivery.
	 *
	 * This status provides detailed information about the outcome of the delivery attempt,
	 * such as success, failure, or specific error conditions.
	 *
	 * @returns The status code representing the delivery outcome
	 */
	get status() {
		return this._status;
	}

	/**
	 * Sets the status of the SMS message delivery.
	 *
	 * Updates the delivery status to accurately represent the outcome of the delivery attempt,
	 * critical for applications requiring confirmation of message delivery.
	 *
	 * @param status The new status code indicating the delivery outcome
	 * @returns The instance of this Report, allowing for method chaining
	 */
	setStatus(status: number) {
		this._status = status;
		return this;
	}
}

export type ReportOptions = PDUOptions & {
	type?: ReportType;
};
