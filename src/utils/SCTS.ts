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

	getIsoString() {
		const datetime = this.getDateWithOffset()
			.toISOString()
			.replace(/.\d{3}Z$/, '');

		const offset = Math.abs(this.tzOff / 60)
			.toString()
			.padStart(2, '0');

		return datetime + (this.tzOff > 0 ? '+' : '-') + offset + ':00';
	}

	toString() {
		return (this.getDateTime().match(/.{1,2}/g) || []).map((s) => s.split('').reverse().join('')).join('');
	}
}
