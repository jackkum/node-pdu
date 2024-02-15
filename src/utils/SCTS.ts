import { Helper } from './Helper';

/**
 * Represents the Service Centre Time Stamp (SCTS) of an SMS message.
 *
 * Marks the time and date the SMSC received the message, used in delivery reports and incoming
 * messages for timing analysis and record-keeping, providing a temporal reference for the message's handling.
 */
export class SCTS {
	readonly time: number;
	readonly tzOff: number;

	constructor(date: Date, tzOff?: number) {
		this.time = date.getTime() / 1000;
		this.tzOff = tzOff || -1 * date.getTimezoneOffset();
	}

	/*
	 * ================================================
	 *                Private functions
	 * ================================================
	 */

	private getDateTime() {
		const tzAbs = Math.floor(Math.abs(this.tzOff) / 15); // To quarters of an hour
		const x = Math.floor(tzAbs / 10) * 16 + (tzAbs % 10) + (this.tzOff < 0 ? 0x80 : 0x00);

		return this.getDateWithOffset().toISOString().replace(/[-T:]/g, '').slice(2, 14) + Helper.toStringHex(x);
	}

	private getDateWithOffset() {
		return new Date(this.time * 1000 + this.tzOff * 60 * 1000);
	}

	/*
	 * ================================================
	 *                 Public functions
	 * ================================================
	 */

	/**
	 * Converts the SCTS to an ISO 8601 string format with a custom time zone offset.
	 *
	 * This method formats the date and time into an easily readable ISO 8601 format,
	 * adjusting for the stored time zone offset to reflect the local time at the service centre.
	 *
	 * @returns The SCTS as an ISO 8601 formatted string with a custom time zone offset.
	 */
	getIsoString() {
		const datetime = this.getDateWithOffset()
			.toISOString()
			.replace(/.\d{3}Z$/, '');

		const offset = Math.abs(this.tzOff / 60)
			.toString()
			.padStart(2, '0');

		return datetime + (this.tzOff > 0 ? '+' : '-') + offset + ':00';
	}

	/**
	 * Converts the SCTS to a string representation based on the SMS PDU specifications.
	 *
	 * This method formats the service centre time stamp into a semi-octet representation suitable
	 * for inclusion in a PDU message, converting the date and time components and including the
	 * time zone in a standardized format.
	 *
	 * @returns The SCTS as a string formatted according to the SMS PDU specifications
	 */
	toString() {
		return (this.getDateTime().match(/.{1,2}/g) || []).map((s) => s.split('').reverse().join('')).join('');
	}
}
