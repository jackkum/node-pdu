import { Helper } from '../Helper';

/**
 * Represents the header information in a segmented SMS message part.
 *
 * Contains metadata essential for the reassembly of segmented SMS messages, such as part numbering and
 * reference identifiers. It ensures that multipart messages are correctly reconstructed upon receipt.
 */
export class Header {
	static readonly IE_CONCAT_8BIT_REF = 0x00;
	static readonly IE_CONCAT_16BIT_REF = 0x08;

	private ies: IES[] = [];
	private concatIeIdx?: number;

	constructor(params: HeaderParams) {
		if (Array.isArray(params)) {
			/*
			 * NB: This code can be factored out into a separate method if we have
			 * a usecase for it.
			 */

			for (const ie of params) {
				const buf = Buffer.from(ie.dataHex, 'hex');

				// Parse known IEs (e.g. concatenetion)
				if (ie.type === Header.IE_CONCAT_8BIT_REF) {
					// Preserve IE index
					this.concatIeIdx = this.ies.length;

					this.ies.push({
						type: ie.type,
						dataHex: ie.dataHex,
						data: {
							msgRef: buf[0],
							maxMsgNum: buf[1],
							msgSeqNo: buf[2]
						}
					});

					continue;
				}

				if (ie.type === Header.IE_CONCAT_16BIT_REF) {
					// Preserve IE index
					this.concatIeIdx = this.ies.length;

					this.ies.push({
						type: ie.type,
						dataHex: ie.dataHex,
						data: {
							msgRef: (buf[0] << 8) | buf[1],
							maxMsgNum: buf[2],
							msgSeqNo: buf[3]
						}
					});

					continue;
				}

				this.ies.push({
					type: ie.type,
					dataHex: ie.dataHex
				});
			}

			return;
		}

		const dataHex = Helper.toStringHex(params.POINTER, 4) + Helper.toStringHex(params.SEGMENTS) + Helper.toStringHex(params.CURRENT);

		this.ies.push({
			type: Header.IE_CONCAT_16BIT_REF,
			dataHex: dataHex,
			data: {
				msgRef: params.POINTER,
				maxMsgNum: params.SEGMENTS,
				msgSeqNo: params.CURRENT
			}
		});

		this.concatIeIdx = this.ies.length - 1;
	}

	/*
	 * ================================================
	 *                 Public functions
	 * ================================================
	 */

	/**
	 * Converts the header information to an object.
	 *
	 * This function is useful for serializing the header information, including the message reference number,
	 * total number of segments, and current segment number. It's particularly useful for diagnostics or
	 * interfacing with systems that require these details in a structured format.
	 *
	 * @returns An object containing the pointer
	 */
	toJSON() {
		return {
			POINTER: this.getPointer(),
			SEGMENTS: this.getSegments(),
			CURRENT: this.getCurrent()
		};
	}

	/**
	 * Calculates the total size of the User Data Header Length (UDHL).
	 *
	 * The size is calculated based on the length of all Information Elements (IEs) included in the header.
	 * This is crucial for correctly encoding and decoding segmented SMS messages.
	 *
	 * @returns The total size of the UDHL
	 */
	getSize() {
		let udhl = 0;

		this.ies.forEach((ie) => {
			udhl += 2 + ie.dataHex.length / 2;
		});

		return udhl;
	}

	/**
	 * Retrieves the type of the concatenation Information Element (IE).
	 *
	 * This method checks if there's a known concatenation IE present and returns its type.
	 * It distinguishes between 8-bit and 16-bit reference numbers for concatenated messages.
	 *
	 * @returns The type of the concatenation IE, or undefined if not present
	 */
	getType() {
		if (this.concatIeIdx !== undefined) {
			return this.ies[this.concatIeIdx].type;
		}

		return;
	}

	/**
	 * Gets the size of the pointer (message reference number) in bytes.
	 *
	 * The size is determined based on the type of concatenation IE present, reflecting the
	 * length of the message reference number field.
	 *
	 * @returns The size of the pointer in bytes, or 0 if no concatenation IE is present
	 */
	getPointerSize() {
		if (this.concatIeIdx !== undefined) {
			this.ies[this.concatIeIdx].dataHex.length / 2;
		}

		return 0;
	}

	/**
	 * Retrieves the message reference number for the segmented SMS message.
	 *
	 * This number is used to correlate all segments of a multi-part SMS message, ensuring
	 * they can be correctly reassembled upon receipt.
	 *
	 * @returns The message reference number, or 0 if no concatenation IE is present
	 */
	getPointer() {
		if (this.concatIeIdx !== undefined) {
			return this.ies[this.concatIeIdx].data?.msgRef;
		}

		return 0;
	}

	/**
	 * Gets the total number of segments in the segmented SMS message.
	 *
	 * This information is critical for understanding how many parts the message has been
	 * divided into, enabling correct reassembly.
	 *
	 * @returns The total number of segments, or 1 if no concatenation IE is present
	 */
	getSegments() {
		if (this.concatIeIdx !== undefined) {
			return this.ies[this.concatIeIdx].data?.maxMsgNum;
		}

		return 1;
	}

	/**
	 * Retrieves the current segment number of this part of the segmented SMS message.
	 *
	 * This number indicates the order of the current segment in the sequence of the total
	 * message parts, aiding in proper reconstruction.
	 *
	 * @returns The current segment number, or 1 if no concatenation IE is present
	 */
	getCurrent() {
		if (this.concatIeIdx !== undefined) {
			return this.ies[this.concatIeIdx].data?.msgSeqNo;
		}

		return 1;
	}

	/**
	 * Generates a string representation of the User Data Header (UDH).
	 *
	 * This method constructs the UDH string by concatenating the encoded lengths and data of all
	 * Information Elements (IEs), prefixed with the overall UDH length. It's essential for
	 * encoding the header part of segmented SMS messages.
	 *
	 * @returns A string representing the encoded User Data Header
	 */
	toString() {
		let udhl = 0;
		let head = '';

		this.ies.forEach((ie) => {
			udhl += 2 + ie.dataHex.length / 2;
			head += Helper.toStringHex(ie.type) + Helper.toStringHex(ie.dataHex.length / 2) + ie.dataHex;
		});

		return Helper.toStringHex(udhl) + head;
	}
}

export type HeaderParams =
	| {
			POINTER: number;
			SEGMENTS: number;
			CURRENT: number;
	  }
	| {
			type: number;
			dataHex: string;
	  }[];

export type IES = {
	type: number;
	dataHex: string;
	data?: {
		msgRef: number;
		maxMsgNum: number;
		msgSeqNo: number;
	};
};
