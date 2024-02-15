import { Deliver } from '../../Deliver';
import { Submit } from '../../Submit';
import { Helper } from '../Helper';
import { Header } from './Header';

/**
 * Represents a part of a segmented SMS message.
 *
 * Used for messages that exceed the size limit for a single SMS and must be split. Each part contains
 * a segment of the full message, facilitating the reassembly of the complete message by the recipient.
 */
export class Part {
	readonly data: string;
	readonly size: number;
	readonly text: string;
	readonly header: Header | null;

	/**
	 * Constructs a new Part instance for a segmented SMS message.
	 *
	 * @param data The raw data of this message part
	 * @param size The size of this part, including headers and content
	 * @param text The decoded text content of this part
	 * @param header An optional header for concatenated message support
	 */
	constructor(data: string, size: number, text: string, header?: Header) {
		this.data = data;
		this.size = size;
		this.text = text;
		this.header = header || null;
	}

	/*
	 * ================================================
	 *                Private functions
	 * ================================================
	 */

	private getPduString(pdu: Deliver | Submit) {
		return pdu.getStart();
	}

	private getPartSize() {
		return Helper.toStringHex(this.size);
	}

	/*
	 * ================================================
	 *                 Public functions
	 * ================================================
	 */

	/**
	 * Generates a string representation of this SMS part, suitable for transmission.
	 *
	 * This method constructs the PDU string for this part by concatenating the PDU start,
	 * the size of the part, any headers, and the data content.
	 *
	 * @param pdu The PDU (either Deliver or Submit) that this part belongs to.
	 * @returns A string representing the PDU for this part of the message.
	 */
	toString(pdu: Deliver | Submit) {
		// concate pdu, size of part, headers, data
		return this.getPduString(pdu) + this.getPartSize() + (this.header || '') + this.data;
	}
}
