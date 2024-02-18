import { Helper } from '../Helper';

/**
 * Defines the Service Centre Address (SCA) format in SMS messages.
 *
 * Specifies the SCA format, crucial for SMS routing and delivery. Types may include international,
 * national, and others, ensuring compatibility across networks.
 */
export class SCAType {
	static readonly TYPE_UNKNOWN = 0x00;
	static readonly TYPE_INTERNATIONAL = 0x01;
	static readonly TYPE_NATIONAL = 0x02;
	static readonly TYPE_ACCEPTER_INTO_NET = 0x03;
	static readonly TYPE_SUBSCRIBER_NET = 0x04;
	static readonly TYPE_ALPHANUMERICAL = 0x05;
	static readonly TYPE_TRIMMED = 0x06;
	static readonly TYPE_RESERVED = 0x07;

	static readonly PLAN_UNKNOWN = 0x00;
	static readonly PLAN_ISDN = 0x01;
	static readonly PLAN_X_121 = 0x02;
	static readonly PLAN_TELEX = 0x03;
	static readonly PLAN_NATIONAL = 0x08;
	static readonly PLAN_INDIVIDUAL = 0x09;
	static readonly PLAN_ERMES = 0x0a;
	static readonly PLAN_RESERVED = 0x0f;

	private _type: number;
	private _plan: number;

	constructor(value = 0x91) {
		this._type = 0x07 & (value >> 4);
		this._plan = 0x0f & value;
	}

	/*
	 * ================================================
	 *                Getter & Setter
	 * ================================================
	 */

	/**
	 * Retrieves the type of the Service Centre Address (SCA).
	 * The type indicates the format or category of the SCA, such as international, national, or alphanumeric.
	 *
	 * @returns The type of the SCA
	 */
	get type() {
		return this._type;
	}

	/**
	 * Sets the type of the Service Centre Address (SCA).
	 * This method allows updating the type of the SCA, ensuring compatibility and proper routing.
	 *
	 * @param type The new type of the SCA
	 * @returns The instance of this SCAType, allowing for method chaining
	 */
	setType(type: number) {
		this._type = 0x07 & type;
		return this;
	}

	/**
	 * Retrieves the numbering plan identification of the Service Centre Address (SCA).
	 * The plan indicates the numbering plan used for the SCA, such as ISDN, national, or individual.
	 *
	 * @returns The numbering plan identification of the SCA
	 */
	get plan() {
		return this._plan;
	}

	/**
	 * Sets the numbering plan identification of the Service Centre Address (SCA).
	 * This method allows updating the numbering plan used for the SCA, ensuring compatibility and proper routing.
	 *
	 * @param plan The new numbering plan identification for the SCA
	 * @returns The instance of this SCAType, allowing for method chaining
	 */
	setPlan(plan: number) {
		this._plan = 0x0f & plan;
		return this;
	}

	/*
	 * ================================================
	 *                 Public functions
	 * ================================================
	 */

	/**
	 * Retrieves the numerical value representing the SCAType.
	 * This value is used internally and for PDU encoding.
	 *
	 * @returns The numerical value representing the SCAType
	 */
	getValue() {
		return (1 << 7) | (this._type << 4) | this._plan;
	}

	/**
	 * Converts the SCAType instance to its hexadecimal string representation.
	 *
	 * This method converts the SCAType instance to its hexadecimal string representation suitable for
	 * inclusion in PDUs.
	 *
	 * @returns The hexadecimal string representation of the SCAType
	 */
	toString() {
		return Helper.toStringHex(this.getValue());
	}
}
