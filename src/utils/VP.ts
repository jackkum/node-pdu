import { Helper } from './Helper';
import { PDU } from './PDU';
import { SCTS } from './SCTS';
import { PDUType } from './Type/PDUType';

/**
 * Represents the Validity Period (VP) of an SMS message.
 *
 * Defines how long an SMS is stored at the SMSC before delivery attempts cease. This duration
 * ensures messages remain relevant and can vary from minutes to days based on the sender's preference.
 */
export class VP {
	static readonly PID_ASSIGNED = 0x00;

	private _datetime: Date | null;
	private _interval: number | null;

	/**
	 * Constructs a Validity Period (VP) instance.
	 * @param options An object containing optional parameters for the VP instance
	 */
	constructor(options: VPOptions = {}) {
		this._datetime = options.datetime || null;
		this._interval = options.interval || null;
	}

	/*
	 * ================================================
	 *                Getter & Setter
	 * ================================================
	 */

	/**
	 * Retrieves the datetime set for the Validity Period.
	 *
	 * This property represents the exact date and time the SMS should be considered valid.
	 * If null, it implies that a specific datetime has not been set for this validity period.
	 *
	 * @returns The datetime as a Date object or null if not set
	 */
	get dateTime() {
		return this._datetime;
	}

	/**
	 * Sets the datetime for the SMS Validity Period.
	 *
	 * This method allows setting a specific date and time until which the SMS is considered valid.
	 * Can be set using a Date object or a string that can be parsed into a Date.
	 *
	 * @param datetime The datetime to set as a Date object or a string representation
	 * @returns The instance of this VP, allowing for method chaining
	 */
	setDateTime(datetime: string | Date) {
		if (datetime instanceof Date) {
			this._datetime = datetime;
			return this;
		}

		this._datetime = new Date(Date.parse(datetime));
		return this;
	}

	/**
	 * Retrieves the interval set for the Validity Period.
	 *
	 * This property represents the duration in seconds for which the SMS should be considered valid.
	 * If null, it implies that a specific interval has not been set for this validity period.
	 *
	 * @returns The interval in seconds or null if not set
	 */
	get interval() {
		return this._interval;
	}

	/**
	 * Sets the interval for the SMS Validity Period.
	 *
	 * This method allows setting a specific duration in seconds until which the SMS is considered valid.
	 * It's an alternative to setting a specific datetime.
	 *
	 * @param interval The interval in seconds to set for the validity period
	 * @returns The instance of this VP, allowing for method chaining
	 */
	setInterval(interval: number) {
		this._interval = interval;
		return this;
	}

	/*
	 * ================================================
	 *                 Public functions
	 * ================================================
	 */

	/**
	 * Converts the Validity Period to a PDU string representation.
	 *
	 * This method generates a string suitable for inclusion in a PDU, based on the validity period's format.
	 * It can handle both absolute and relative formats and adjusts the PDU's validity period format accordingly.
	 * This is critical for ensuring that the SMS's validity period is correctly interpreted by the SMSC.
	 *
	 * @param pdu The PDU instance to which this validity period belongs
	 * @returns A string representation of the validity period for inclusion in the PDU
	 */
	toString(pdu: PDU): string {
		const type = pdu.type;

		// absolute value
		if (this._datetime !== null) {
			type.setValidityPeriodFormat(PDUType.VPF_ABSOLUTE);

			return new SCTS(this._datetime).toString();
		}

		// relative value in seconds
		if (this._interval) {
			type.setValidityPeriodFormat(PDUType.VPF_RELATIVE);

			const minutes = Math.ceil(this._interval / 60);
			const hours = Math.ceil(this._interval / 60 / 60);
			const days = Math.ceil(this._interval / 60 / 60 / 24);
			const weeks = Math.ceil(this._interval / 60 / 60 / 24 / 7);

			if (hours <= 12) {
				return Helper.toStringHex(Math.ceil(minutes / 5) - 1);
			}

			if (hours <= 24) {
				return Helper.toStringHex(Math.ceil((minutes - 720) / 30) + 143);
			}

			if (hours <= 30 * 24 * 3600) {
				return Helper.toStringHex(days + 166);
			}

			return Helper.toStringHex((weeks > 63 ? 63 : weeks) + 192);
		}

		// vpf not used
		type.setValidityPeriodFormat(PDUType.VPF_NONE);

		return '';
	}
}

export type VPOptions = {
	datetime?: Date;
	interval?: number;
};
