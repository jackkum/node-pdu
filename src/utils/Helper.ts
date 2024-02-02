export class Helper {
	static readonly ALPHABET_7BIT =
		'@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1bÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ`¿abcdefghijklmnopqrstuvwxyzäöñüà';
	static readonly EXTENDED_TABLE =
		'````````````````````^```````````````````{}`````\\````````````[~]`|````````````````````````````````````€``````````````````````````';

	static readonly limitNormal = 140;
	static readonly limitCompress = 160;
	static readonly limitUnicode = 70;

	static ucfirst(str: string) {
		return str.substring(0, 1).toUpperCase() + str.substring(1);
	}

	static order(char: string) {
		return char.charCodeAt(0);
	}

	static char(order: number) {
		return String.fromCharCode(order);
	}

	static decode16Bit(text: string) {
		return (text.match(/.{1,4}/g) || [])
			.map((hex) => {
				const buffer = Buffer.from(hex, 'hex');
				return Helper.char((buffer[0] << 8) | buffer[1]);
			})
			.join('');
	}

	static decode8Bit(text: string) {
		return (text.match(/.{1,2}/g) || [])
			.map((hex) => {
				const buffer = Buffer.from(hex, 'hex');
				return Helper.char(buffer[0]);
			})
			.join('');
	}

	static decode7Bit(text: string, inLen?: number, alignBits?: number) {
		const ret: number[] = [];
		const data = Buffer.from(text, 'hex');

		let dataPos = 0; // Position in the input octets stream
		let buf = 0; // Bit buffer, used in FIFO manner
		let bufLen = 0; // Amount of buffered bits
		let inDone = 0;
		let inExt = false;

		// If we have some leading alignment bits then skip them
		if (alignBits && data.length) {
			alignBits = alignBits % 7;
			buf = data[dataPos++];
			buf >>= alignBits;
			bufLen = 8 - alignBits;
		}

		while (!(bufLen < 7 && dataPos === data.length)) {
			if (bufLen < 7) {
				if (dataPos === data.length) {
					break;
				}

				// Move next input octet to the FIFO buffer
				buf |= data[dataPos++] << bufLen;
				bufLen += 8;
			}

			// Fetch next septet from the FIFO buffer
			const digit = buf & 0x7f;

			buf >>= 7;
			bufLen -= 7;
			inDone++;

			if (digit % 128 === 27) {
				// Escape character
				inExt = true;
			} else {
				let c = inExt ? Helper.EXTENDED_TABLE.charCodeAt(digit) || 63 : Helper.ALPHABET_7BIT.charCodeAt(digit);
				inExt = false;

				if (c < 0x80) {
					ret.push(c);
				} else if (c < 0x800) {
					ret.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
				} else if (
					(c & 0xfc00) === 0xd800 &&
					digit + 1 < Helper.EXTENDED_TABLE.length &&
					(Helper.EXTENDED_TABLE.charCodeAt(digit + 1) & 0xfc00) === 0xdc00
				) {
					// Surrogate Pair
					c = 0x10000 + ((c & 0x03ff) << 10) + (Helper.EXTENDED_TABLE.charCodeAt(digit + 1) & 0x03ff);
					ret.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
				} else {
					ret.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
				}
			}

			// Do we process all input data
			if (inLen === undefined) {
				// If we have only the final (possibly padding) septet and it's empty
				if (dataPos === data.length && bufLen === 7 && !buf) {
					break;
				}
			} else {
				if (inDone >= inLen) {
					break;
				}
			}
		}

		return Buffer.from(ret).toString();
	}

	static encode8Bit(text: string) {
		let length = 0;
		let pdu = '';
		const buffer = Buffer.from(text, 'ascii');

		for (let i = 0; i < buffer.length; i++) {
			pdu += Helper.toStringHex(buffer[i]);
			length++;
		}

		return { length, result: pdu };
	}

	static encode7Bit(text: string, alignBits = 0) {
		let result = '';
		let buf = 0; // Bit buffer, used in FIFO manner
		let bufLen = 0; // Amount of buffered bits
		let length = 0; // Amount of produced septets

		// Adjust for initial padding if alignBits is specified
		bufLen = alignBits;

		for (const symb of text) {
			let code: number;

			if ((code = Helper.ALPHABET_7BIT.indexOf(symb)) !== -1) {
				buf |= code << bufLen;
				bufLen += 7;
				length++;
			} else if ((code = Helper.EXTENDED_TABLE.indexOf(symb)) !== -1) {
				// Add escape character first
				buf |= 27 << bufLen; // 27 is the escape character in the 7-bit alphabet
				bufLen += 7;
				length++;

				// Then add extended character
				buf |= code << bufLen;
				bufLen += 7;
				length++;
			} else {
				buf |= 32 << bufLen; // Replace with space symbol (' ')
				bufLen += 7;
				length++;
			}

			while (bufLen >= 8) {
				result += Helper.toStringHex(buf & 0xff);
				buf >>= 8;
				bufLen -= 8;
			}
		}

		if (bufLen > 0) {
			// here we have less then 8 bits
			result += Helper.toStringHex(buf);
		}

		return { length, result };
	}

	static encode16Bit(text: string) {
		let length = 0;
		let pdu = '';

		for (let i = 0; i < text.length; i++) {
			const byte = Helper.order(text.substring(i, i + 1));
			pdu += Helper.toStringHex(byte, 4);
			length += 2;
		}

		return { length, result: pdu };
	}

	static toStringHex(number: number, fill = 2) {
		return number.toString(16).padStart(fill, '0').toUpperCase();
	}
}
