import { Deliver } from '../../Deliver';
import { Submit } from '../../Submit';
import { DCS } from '../DCS';
import { Helper } from '../Helper';
import { Header } from './Header';
import { Part } from './Part';

/**
 * Represents the data content of an SMS message.
 *
 * Holds the actual message content, whether text or binary data. It is central to the purpose of SMS,
 * conveying the intended information from sender to recipient.
 */
export class Data {
	static readonly HEADER_SIZE = 7; // UDHL + UDH

	private _data: string;
	private _size: number;
	private _parts: Part[];
	private _isUnicode: boolean;

	/**
	 * Constructs a Data instance.
	 * @param options An object containing optional parameters for the Data instance
	 */
	constructor(options: DataOptions = {}) {
		this._size = options.size || 0;
		this._data = options.data || '';
		this._parts = options.parts || [];
		this._isUnicode = options.isUnicode || false;
	}

	/*
	 * ================================================
	 *                Getter & Setter
	 * ================================================
	 */

	/**
	 * Gets the raw data of the SMS message.
	 *
	 * This property holds the actual content of the message, which could be text or binary data,
	 * depending on how the message was encoded.
	 *
	 * @returns The raw data as a string
	 */
	get data() {
		return this._data;
	}

	/**
	 * Retrieves the size of the message data.
	 *
	 * The size is determined based on the encoding and content of the message. It reflects the
	 * number of characters or bytes.
	 *
	 * @returns The size of the data
	 */
	get size() {
		return this._size;
	}

	/**
	 * Provides access to the individual parts of the message.
	 *
	 * For longer messages that are split into multiple parts (segments), this getter allows access
	 * to each part. Each part contains a portion of the message data along with metadata.
	 *
	 * @returns An array of Part instances, each representing a segment of the message
	 */
	get parts() {
		return this._parts;
	}

	/**
	 * Indicates whether the message data is encoded using Unicode.
	 *
	 * This property is true if the message content includes characters that require Unicode encoding
	 * (e.g., non-Latin characters). Otherwise, it's false.
	 *
	 * @returns A boolean indicating if the message data is Unicode.
	 */
	get isUnicode() {
		return this._isUnicode;
	}

	/**
	 * Sets the data for the SMS message.
	 *
	 * This method encodes the provided data string according to the specified PDU type (Deliver or Submit)
	 * and updates the message parts accordingly. It handles encoding, part splitting, and header preparation.
	 *
	 * @param data The new message data as a string
	 * @param pdu The PDU instance (Deliver or Submit) associated with this data
	 * @returns The instance of this Data, allowing for method chaining
	 */
	setData(data: string, pdu: Deliver | Submit) {
		this._data = data;

		// encode message
		this.checkData();

		// preapre parts
		this.prepareParts(pdu);

		return this;
	}

	/*
	 * ================================================
	 *                Private functions
	 * ================================================
	 */

	private checkData() {
		// set is unicode to false
		this._isUnicode = false;
		// set zero size
		this._size = 0;

		// check message
		for (let i = 0; i < this._data.length; i++) {
			// get byte
			const byte = Helper.order(this._data.substring(i, i + 1));

			if (byte > 0xc0) {
				this._isUnicode = true;
			}

			this._size++;
		}
	}

	private prepareParts(pdu: Deliver | Submit) {
		let headerSize = Data.HEADER_SIZE;
		let max = Helper.limitNormal;

		if (this._isUnicode) {
			// max length sms to unicode
			max = Helper.limitUnicode;

			// can't compress message
			pdu.dataCodingScheme
				.setTextCompressed(false) // no compress
				.setTextAlphabet(DCS.ALPHABET_UCS2); // type alphabet is UCS2
		}

		// if message is compressed
		if (pdu.dataCodingScheme.compressedText) {
			max = Helper.limitCompress;
			headerSize++;
		}

		const parts = this.splitMessage(max, headerSize);
		const haveHeader = parts.length > 1;
		const uniqID = Math.floor(Math.random() * 0xffff);

		// message will be splited, need headers
		if (haveHeader) {
			pdu.type.setUserDataHeader(1);
		}

		parts.forEach((text, index) => {
			const header = haveHeader ? new Header({ SEGMENTS: parts.length, CURRENT: index + 1, POINTER: uniqID }) : undefined;

			const tmp = (() => {
				switch (pdu.dataCodingScheme.textAlphabet) {
					case DCS.ALPHABET_DEFAULT:
						return Helper.encode7Bit(text);

					case DCS.ALPHABET_8BIT:
						return Helper.encode8Bit(text);

					case DCS.ALPHABET_UCS2:
						return Helper.encode16Bit(text);

					default:
						throw new Error('node-pdu: Unknown alphabet!');
				}
			})();

			let size = tmp.length;
			const data = tmp.result;

			if (haveHeader) {
				size += headerSize;
			}

			this._parts.push(new Part(data, size, '', header));
		});
	}

	private partExists(part: Part) {
		for (const p of this._parts) {
			if (part.header === null || p.header === null) {
				throw new Error('node-pdu: Part is missing a header!');
			}

			if (part.header.getPointer() !== p.header.getPointer() || part.header.getSegments() !== p.header.getSegments()) {
				throw new Error('node-pdu: Part from different message!');
			}

			if (p.header.getCurrent() === part.header.getCurrent()) {
				return true;
			}
		}

		return false;
	}

	private sortParts() {
		this._parts.sort((p1, p2) => {
			const index1 = p1.header?.getCurrent() || 1;
			const index2 = p2.header?.getCurrent() || 1;

			return index1 > index2 ? 1 : -1;
		});

		this._data = this._parts.map((part) => part.text).join('');
	}

	private splitMessage(max: number, headerSize = Data.HEADER_SIZE) {
		// size less or equal max
		if (this.size <= max) {
			return [this._data];
		}

		// parts of message
		const data = [];
		const size = max - headerSize;
		let offset = 0;

		do {
			const part = this._data.substring(offset, offset + size);
			data.push(part);
			offset += size;
		} while (offset < this.size);

		return data;
	}

	/*
	 * ================================================
	 *                 Public functions
	 * ================================================
	 */

	/**
	 * Retrieves the textual content of the SMS message.
	 *
	 * This method decodes the raw data into a readable text format, considering the encoding scheme
	 * (e.g., GSM 7-bit, UCS-2) used for the message.
	 *
	 * @returns The decoded text of the message
	 */
	getText() {
		return this.data;
	}

	/**
	 * Appends the parts from another PDU to this data instance.
	 *
	 * This method is used to combine the parts of another message (Deliver or Submit) into this one,
	 * effectively concatenating the messages. It ensures parts are added only once and sorts them.
	 *
	 * @param pdu The PDU instance (Deliver or Submit) whose parts are to be appended
	 */
	append(pdu: Deliver | Submit) {
		pdu.getParts().forEach((part) => {
			if (!this.partExists(part)) {
				this._parts.push(part);
			}
		});

		this.sortParts();
	}
}

export type DataOptions = {
	data?: string;
	size?: number;
	parts?: Part[];
	isUnicode?: boolean;
};
