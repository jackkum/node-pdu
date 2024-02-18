import { Helper } from '../Helper';

/**
 * Represents the abstract base for different types of Protocol Data Units (PDU) in SMS messaging.
 *
 * This abstract class defines the core structure for various SMS PDU types and
 * ensuring standardized handling and processing across different messaging operations.
 */
export abstract class PDUType {
	abstract messageTypeIndicator: number;

	static readonly SMS_SUBMIT = 0x01;
	static readonly SMS_DELIVER = 0x00;
	static readonly SMS_REPORT = 0x02;

	static readonly VPF_NONE = 0x00;
	static readonly VPF_SIEMENS = 0x01;
	static readonly VPF_RELATIVE = 0x02;
	static readonly VPF_ABSOLUTE = 0x03;

	private readonly replyPath: number;
	private readonly rejectDuplicates: number;
	private _userDataHeader: number;
	private _statusReportRequest: number;
	private _validityPeriodFormat: number;

	/**
	 * Constructs a PDUType instance.
	 * @param params Parameters for configuring the PDUType instance
	 */
	constructor(params: TypeParams) {
		this.replyPath = params.replyPath;
		this._userDataHeader = params.userDataHeader;
		this._statusReportRequest = params.statusReportRequest;
		this._validityPeriodFormat = params.validityPeriodFormat;
		this.rejectDuplicates = params.rejectDuplicates;
	}

	/*
	 * ================================================
	 *                Getter & Setter
	 * ================================================
	 */

	/**
	 * Retrieves the User Data Header (UDH) indicator status.
	 *
	 * The User Data Header is part of the SMS payload and can contain various control
	 * information such as concatenated message reference numbers, port numbers for WAP
	 * Push, and other service indications. This indicator specifies whether UDH is present.
	 *
	 * @returns The current status of the User Data Header indicator
	 */
	get userDataHeader() {
		return this._userDataHeader;
	}

	/**
	 * Sets the User Data Header (UDH) indicator.
	 *
	 * This method configures the presence of a User Data Header in the SMS message. It is
	 * primarily used for advanced messaging features such as concatenated SMS or application
	 * port addressing. The value is masked to ensure it is within valid range.
	 *
	 * @param userDataHeader The desired status for the UDH indicator (0 or 1)
	 * @returns The instance of this PDUType, allowing for method chaining
	 */
	setUserDataHeader(userDataHeader: number) {
		this._userDataHeader = 0x01 & userDataHeader;
		return this;
	}

	/**
	 * Retrieves the Status Report Request (SRR) status.
	 *
	 * The SRR is a feature in SMS that requests the network to send a delivery report
	 * for the sent message. This indicator specifies whether such a report is requested.
	 *
	 * @returns The current status of the Status Report Request indicator
	 */
	get statusReportRequest() {
		return this._statusReportRequest;
	}

	/**
	 * Sets the Status Report Request (SRR) indicator.
	 *
	 * This method enables or disables the request for a delivery report for the SMS message.
	 * It ensures the delivery status can be tracked. The value is masked to ensure it is
	 * within valid range.
	 *
	 * @param srr The desired status for the SRR indicator (0 or 1)
	 * @returns The instance of this PDUType, allowing for method chaining
	 */
	setStatusReportRequest(srr: number) {
		this._statusReportRequest = 0x01 & srr;
		return this;
	}

	/**
	 * Retrieves the Validity Period Format (VPF).
	 *
	 * The VPF specifies the format of the validity period of the SMS message, dictating how
	 * long the message should be stored in the network before delivery is attempted. It supports
	 * several formats including none, relative, and absolute.
	 *
	 * @returns The current format of the validity period
	 */
	get validityPeriodFormat() {
		return this._validityPeriodFormat;
	}

	/**
	 * Sets the Validity Period Format (VPF) for the SMS message.
	 *
	 * This method configures the time frame in which the SMS should be delivered. It is crucial
	 * for time-sensitive messages. The value is masked and validated to ensure it corresponds to
	 * one of the predefined formats. An error is thrown for invalid formats.
	 *
	 * @param validityPeriodFormat The desired format for the message validity period
	 * @returns The instance of this PDUType, allowing for method chaining
	 */
	setValidityPeriodFormat(validityPeriodFormat: number) {
		this._validityPeriodFormat = 0x03 & validityPeriodFormat;

		switch (this._validityPeriodFormat) {
			case PDUType.VPF_NONE:
				break;
			case PDUType.VPF_SIEMENS:
				break;
			case PDUType.VPF_RELATIVE:
				break;
			case PDUType.VPF_ABSOLUTE:
				break;
			default:
				throw new Error('node-pdu: Wrong validity period format!');
		}

		return this;
	}

	/*
	 * ================================================
	 *                 Public functions
	 * ================================================
	 */

	/**
	 * Calculates and returns the overall value of the PDU type based on its components.
	 *
	 * This method aggregates the various indicators and settings into a single value, which
	 * represents the configuration of the PDU type. It is used for generating the final PDU
	 * string representation.
	 *
	 * @returns The aggregated value of the PDU type settings
	 */
	getValue() {
		return (
			((1 & this.replyPath) << 7) |
			((1 & this._userDataHeader) << 6) |
			((1 & this._statusReportRequest) << 5) |
			((3 & this._validityPeriodFormat) << 3) |
			((1 & this.rejectDuplicates) << 2) |
			(3 & this.messageTypeIndicator)
		);
	}

	/**
	 * Generates a string representation of the PDU type value.
	 *
	 * This method utilizes a helper function to convert the aggregated PDU type value into
	 * a hexadecimal string. It is useful for logging and debugging purposes to see the
	 * encoded PDU type.
	 *
	 * @returns A hexadecimal string representation of the PDU type value
	 */
	toString() {
		return Helper.toStringHex(this.getValue());
	}
}

export type TypeParams = {
	replyPath: number;
	userDataHeader: number;
	statusReportRequest: number;
	validityPeriodFormat: number;
	rejectDuplicates: number;
};
