/**
 * Represents the Protocol Identifier (PID) of an SMS message.
 *
 * Specifies the type or nature of the message, allowing the system to handle it appropriately. It can
 * indicate special types of messages such as voicemail notifications or system messages, among others.
 */
export class PID {
	static readonly PID_ASSIGNED = 0x00; // Assigns bits 0..5 as defined below
	static readonly PID_GSM_03_40 = 0x01; // See GSM 03.40 TP-PID complete definition
	static readonly PID_RESERVED = 0x02; // Reserved
	static readonly PID_SPECIFIC = 0x03; // Assigns bits 0-5 for SC specific use

	static readonly TYPE_IMPLICIT = 0x00; // Implicit
	static readonly TYPE_TELEX = 0x01; // Telex (or teletex reduced to telex format)
	static readonly TYPE_TELEFAX = 0x02; // Group 3 telefax
	static readonly TYPE_VOICE = 0x04; // Voice telephone (i.e. conversion to speech)
	static readonly TYPE_ERMES = 0x05; // ERMES (European Radio Messaging System)
	static readonly TYPE_NPS = 0x06; // National Paging system (known to the SC
	static readonly TYPE_X_400 = 0x11; // Any public X.400-based message handling system
	static readonly TYPE_IEM = 0x12; // Internet Electronic Mail

	private _pid: number;
	private _indicates: number;
	private _type: number;

	/**
	 * Constructs a Protocol Identifier (PID) instance.
	 * @param options An object containing optional parameters for the PID instance
	 */
	constructor(options: PIDOptions = {}) {
		this._pid = options.pid || PID.PID_ASSIGNED;
		this._indicates = options.indicates || 0x00;
		this._type = options.type || PID.TYPE_IMPLICIT;
	}

	/*
	 * ================================================
	 *                Getter & Setter
	 * ================================================
	 */

	/**
	 * Retrieves the Protocol Identifier (PID) value.
	 *
	 * The PID value is crucial for identifying the nature and handling of the SMS message within
	 * the network. It determines if the message is of a specific type, such as voicemail
	 * notifications or system messages.
	 *
	 * @returns The current PID value
	 */
	get pid() {
		return this._pid;
	}

	/**
	 * Sets the Protocol Identifier (PID) value.
	 *
	 * Allows specifying the nature of the SMS message by setting an appropriate PID value. The
	 * value is masked to ensure it fits the allowed range defined by the protocol.
	 *
	 * @param pid The new PID value, which is masked to fit into the allowed range
	 * @returns The instance of this PID, allowing for method chaining
	 */
	setPid(pid: number) {
		this._pid = 0x03 & pid;
		return this;
	}

	/**
	 * Retrieves the indicates value.
	 *
	 * This value is part of determining how the message should be handled or processed by the
	 * receiving entity, contributing to the overall interpretation of the PID.
	 *
	 * @returns The current indicates value
	 */
	get indicates() {
		return this._indicates;
	}

	/**
	 * Sets the indicates value.
	 *
	 * Modifies part of the PID to influence how the SMS message is processed by the network or
	 * receiving device. The value is masked to ensure it adheres to the expected range.
	 *
	 * @param indicates The new indicates value, which is masked to the allowed range
	 * @returns The instance of this PID, allowing for method chaining
	 */
	setIndicates(indicates: number) {
		this._indicates = 0x01 & indicates;
		return this;
	}

	/**
	 * Retrieves the type of the SMS message.
	 *
	 * The type provides further specification within the PID, defining the exact nature or
	 * handling instructions for the message, such as whether it's a voice message or an email.
	 *
	 * @returns The current type value
	 */
	get type() {
		return this._type;
	}

	/**
	 * Sets the type of the SMS message.
	 *
	 * This method allows for detailed specification of the message's nature, affecting how it is
	 * processed. The type is masked to ensure it complies with the defined protocol specifications.
	 *
	 * @param type The new type value, masked to fit the allowed protocol range
	 * @returns The instance of this PID, allowing for method chaining
	 */
	setType(type: number) {
		this._type = 0x1f & type;
		return this;
	}

	/*
	 * ================================================
	 *                 Public functions
	 * ================================================
	 */

	/**
	 * Computes and returns the combined value of the PID, including its indicates and type parts.
	 *
	 * This value is used for encoding the PID field in the SMS message, combining the general PID
	 * with specific flags for message handling.
	 *
	 * @returns The combined PID value as a number
	 */
	getValue() {
		return (this._pid << 6) | (this._indicates << 5) | this._type;
	}

	/**
	 * Provides a string representation of the PID's combined value.
	 *
	 * Useful for logging or debugging, this method returns a string that represents the encoded
	 * value of the PID, including its general identifier, indicates, and type components.
	 *
	 * @returns The PID's combined value as a string
	 */
	toString() {
		return this.getValue().toString();
	}
}

export type PIDOptions = {
	pid?: number;
	indicates?: number;
	type?: number;
};
