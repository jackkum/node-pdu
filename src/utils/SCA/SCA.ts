import { Helper } from '../Helper';
import { SCAType } from './SCAType';

/**
 * Represents the Service Centre Address (SCA) of an SMS message.
 *
 * The address of the SMSC responsible for the delivery of the message. It is crucial for routing the SMS
 * through the correct service center to reach the intended recipient.
 */
export class SCA {
	type: SCAType;

	private _isAddress: boolean;
	private _size = 0x00;
	private _encoded = '';
	private _phone: string | null = null;

	constructor(isAddress = false, options: SCAOptions = {}) {
		this.type = options.type || new SCAType();
		this._isAddress = isAddress;
	}

	/*
	 * ================================================
	 *                Getter & Setter
	 * ================================================
	 */

	/**
	 * Indicates whether the current instance represents an address.
	 * @returns True if the instance represents an address; otherwise, false
	 */
	get isAddress() {
		return this._isAddress;
	}

	/**
	 * Retrieves the size of the encoded address.
	 * The size is calculated based on the encoding scheme used.
	 *
	 * @returns The size of the encoded address
	 */
	get size() {
		return this._size;
	}

	/**
	 * Retrieves the encoded representation of the address.
	 * The encoding scheme depends on the type of address.
	 *
	 * @returns The encoded address as a hexadecimal string
	 */
	get encoded() {
		return this._encoded;
	}

	/**
	 * Retrieves the phone number associated with the address.
	 * @returns The phone number associated with the address
	 */
	get phone() {
		return this._phone;
	}

	/**
	 * Sets the phone number associated with the address.
	 *
	 * This method allows setting the phone number for the address. It also performs
	 * encoding based on the address type and detects the type of address if requested.
	 *
	 * @param phone The phone number to set
	 * @param detectType Flag indicating whether to detect the address type
	 * @param SC Flag indicating whether the address is a service center address
	 *
	 * @returns The instance of this SCA, allowing for method chaining
	 */
	setPhone(phone: string, detectType = true, SC = false) {
		this._phone = phone.trim();
		this._isAddress = !SC;

		if (this._isAddress && detectType) {
			this.detectScaType(this._phone);
		}

		if (this.type.type === SCAType.TYPE_ALPHANUMERICAL) {
			const tmp = Helper.encode7Bit(phone);

			this._size = Math.ceil((tmp.length * 7) / 4); // septets to semi-octets
			this._encoded = tmp.result;

			return this;
		}

		const clear = this._phone.replace(/[^a-c0-9*#]/gi, '');

		// get size
		// service center address counting by octets OA or DA as length numbers
		this._size = SC ? 1 + Math.ceil(clear.length / 2) : clear.length;

		this._encoded = clear
			.split('')
			.map((s) => SCA.mapFilterEncode(s))
			.join('');

		return this;
	}

	/*
	 * ================================================
	 *                Private functions
	 * ================================================
	 */

	private detectScaType(phone: string) {
		const phoneSpaceless = phone.replace(/^\s+|\s+$/g, '');

		if (/\+\d+$/.test(phoneSpaceless)) {
			this._phone = phoneSpaceless.substring(1);
			this.type.setType(SCAType.TYPE_INTERNATIONAL);
			return;
		}

		if (/00\d+$/.test(phoneSpaceless)) {
			this._phone = phoneSpaceless.substring(2);
			this.type.setType(SCAType.TYPE_INTERNATIONAL);
			return;
		}

		if (/\d+$/.test(phoneSpaceless)) {
			this._phone = phoneSpaceless;
			this.type.setType(SCAType.TYPE_UNKNOWN);
			return;
		}

		this.type.setType(SCAType.TYPE_ALPHANUMERICAL);
	}

	/*
	 * ================================================
	 *                 Public functions
	 * ================================================
	 */

	/**
	 * Retrieves the offset for the SCA in the PDU.
	 * The offset indicates the position of the SCA within the PDU.
	 *
	 * @returns The offset for the SCA in the PDU
	 */
	getOffset() {
		return !this._size ? 2 : this._size + 4;
	}

	/**
	 * Converts the SCA instance to a string representation.
	 *
	 * This method converts the SCA instance to its string representation suitable for
	 * inclusion in the PDU.
	 *
	 * @returns The string representation of the SCA
	 */
	toString() {
		let str = Helper.toStringHex(this.size);

		if (this.size !== 0) {
			str += this.type.toString();

			if (this.type.type !== SCAType.TYPE_ALPHANUMERICAL) {
				// reverse octets
				const l = this.encoded.length;

				for (let i = 0; i < l; i += 2) {
					const b1 = this.encoded.substring(i, i + 1);
					const b2 = i + 1 >= l ? 'F' : this.encoded.substring(i + 1, i + 2);

					// add to pdu
					str += b2 + b1;
				}
			} else {
				str += this.encoded;
			}
		}

		return str;
	}

	/*
	 * ================================================
	 *                 Static functions
	 * ================================================
	 */

	/**
	 * Maps and decodes a hexadecimal letter to its corresponding character.
	 * This method decodes a hexadecimal letter back to its original character value.
	 *
	 * @param letter The hexadecimal letter to decode
	 * @returns The decoded character
	 */
	static mapFilterDecode(letter: string) {
		const buffer = Buffer.from(letter, 'hex');

		switch (buffer[0]) {
			case 0x0a:
				return '*';
			case 0x0b:
				return '#';
			case 0x0c:
				return 'a';
			case 0x0d:
				return 'b';
			case 0x0e:
				return 'c';
			default:
				return letter;
		}
	}

	/**
	 * Maps and encodes a character to its corresponding hexadecimal representation.
	 * This method encodes a character to its hexadecimal representation.
	 *
	 * @param letter The character to encode
	 * @returns The encoded hexadecimal representation
	 */
	static mapFilterEncode(letter: string) {
		switch (letter) {
			case '*':
				return 'A';
			case '#':
				return 'B';
			case 'a':
				return 'C';
			case 'b':
				return 'D';
			case 'c':
				return 'E';
			default:
				return letter;
		}
	}
}

export type SCAOptions = {
	type?: SCAType;
};
