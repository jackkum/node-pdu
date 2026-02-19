/**
 * A utility class providing static methods for encoding and decoding SMS messages.
 *
 * This class contains methods for converting text into various encoding formats used in SMS,
 * such as GSM 7-bit, 8-bit, and UCS-2 (16-bit). It also includes utility methods
 * for handling characters and converting values to hexadecimal strings.
 */
export class Helper {
	static readonly ALPHABET_7BIT =
		'@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1bÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ`¿abcdefghijklmnopqrstuvwxyzäöñüà';
	static readonly EXTENDED_TABLE =
		'````````````````````^```````````````````{}`````\\````````````[~]`|````````````````````````````````````€``````````````````````````';

	static readonly limitNormal = 140;
	static readonly limitCompress = 160;
	static readonly limitUnicode = 70;

	private static readonly TEXT_ENCODER = new TextEncoder();
	// private static readonly TEXT_DECODER = new TextDecoder();

	/**
	 * Converts a hex string to a Uint8Array.
	 *
	 * @param hex The hex string to convert
	 * @returns A Uint8Array representing the hex string
	 */
	static hexToUint8Array(hex: string): Uint8Array {
		if (hex.length % 2 !== 0) {
			throw new Error('Hex string must have an even number of characters');
		}

		const bytes = new Uint8Array(hex.length / 2);

		for (let i = 0; i < hex.length; i += 2) {
			bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
		}

		return bytes;
	}

	/**
	 * Converts an ASCII string to a Uint8Array.
	 *
	 * @param ascii The ASCII string to convert
	 * @returns A Uint8Array representing the ASCII string
	 */
	static asciiToUint8Array(ascii: string): Uint8Array {
		return this.TEXT_ENCODER.encode(ascii);
	}

	/**
	 * Converts the first two characters of a hexadecimal string to a number.
	 *
	 * @param hexStr The hexadecimal string to convert
	 * @returns The number represented by the first two characters of the hexadecimal string
	 */
	static getByteFromHex(hexStr: string): number {
		return parseInt(hexStr.substring(0, 2), 16);
	}

	/**
	 * Capitalizes the first character of the input string.
	 *
	 * @param str The string to capitalize
	 * @returns The input string with its first character capitalized
	 */
	static ucfirst(str: string) {
		return str.substring(0, 1).toUpperCase() + str.substring(1);
	}

	/**
	 * Returns the Unicode code point of the first character of the input string.
	 *
	 * @param char A single character string
	 * @returns The Unicode code point of the character
	 */
	static order(char: string) {
		return char.charCodeAt(0);
	}

	/**
	 * Returns the character represented by the specified Unicode code point.
	 *
	 * @param order The Unicode code point
	 * @returns A string containing the character represented by the code point
	 */
	static char(order: number) {
		return String.fromCharCode(order);
	}

	/**
	 * Decodes a 16-bit encoded string into a human-readable text.
	 *
	 * @param text The 16-bit encoded hexadecimal string
	 * @returns The decoded text
	 */
	static decode16Bit(text: string) {
		return (text.match(/.{1,4}/g) || [])
			.map((hex) => {
				const buffer = Helper.hexToUint8Array(hex);
				return Helper.char((buffer[0] << 8) | buffer[1]);
			})
			.join('');
	}

	/**
	 * Decodes an 8-bit encoded string into a human-readable text.
	 *
	 * @param text The 8-bit encoded hexadecimal string
	 * @returns The decoded text
	 */
	static decode8Bit(text: string) {
		return (text.match(/.{1,2}/g) || []).map((hex) => Helper.char(Helper.getByteFromHex(hex))).join('');
	}

	/**
	 * Decodes a 7-bit encoded string into a human-readable text.
	 *
	 * @param text The 7-bit encoded hexadecimal string
	 * @param inLen The length of the input data in septets
	 * @param alignBits The number of bits for alignment
	 *
	 * @returns The decoded text
	 */
	static decode7Bit(text: string, inLen?: number, alignBits?: number) {
		const ret: number[] = [];
		const data = Helper.hexToUint8Array(text);

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
				// Determine Unicode code point for this septet
				let c = inExt ? Helper.EXTENDED_TABLE.charCodeAt(digit) || 63 : Helper.ALPHABET_7BIT.charCodeAt(digit);
				inExt = false;

				// If we encountered a high surrogate in the extended table, and next is a low
				// surrogate, combine into a single code point.
				if ((c & 0xfc00) === 0xd800 && inExt === false && digit + 1 < Helper.EXTENDED_TABLE.length) {
					const low = Helper.EXTENDED_TABLE.charCodeAt(digit + 1);
					if ((low & 0xfc00) === 0xdc00) {
						c = 0x10000 + ((c & 0x03ff) << 10) + (low & 0x03ff);
					}
				}

				ret.push(c);
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

		// Convert collected Unicode code points to string
		// Use String.fromCodePoint to correctly handle supplementary planes
		return String.fromCodePoint(...ret);
	}

	/**
	 * Encodes a text string into 8-bit hexadecimal PDU format.
	 *
	 * @param text The text to encode
	 * @returns An object containing the length of the encoded text and the result as a hexadecimal string
	 */
	static encode8Bit(text: string) {
		const buffer = Helper.asciiToUint8Array(text);
		let result = '';

		for (let i = 0; i < buffer.length; i++) {
			result += Helper.toStringHex(buffer[i]);
		}

		return { length: buffer.length, result };
	}

	/**
	 * Encodes a text string into 7-bit hexadecimal PDU format.
	 *
	 * @param text The text to encode
	 * @param alignBits The number of bits for alignment, if needed
	 *
	 * @returns An object containing the length of the encoded text in septets and the result as a hexadecimal string
	 */
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
				// Normal character
				buf |= code << bufLen;
				bufLen += 7;
				length++;
			} else if ((code = Helper.EXTENDED_TABLE.indexOf(symb)) !== -1) {
				// ESC character (27), then the actual extended character
				buf |= 27 << bufLen;
				bufLen += 7;
				length++;

				// Then add extended character
				buf |= code << bufLen;
				bufLen += 7;
				length++;
			} else {
				// Replace unknown with space (' '- code 0x20)
				buf |= 32 << bufLen;
				bufLen += 7;
				length++;
			}

			while (bufLen >= 8) {
				result += Helper.toStringHex(buf & 0xff);
				buf >>= 8;
				bufLen -= 8;
			}
		}

		// Write out remaining bits if needed
		if (bufLen > 0) {
			result += Helper.toStringHex(buf & 0xff);
		}

		if (alignBits) {
			length++; // Add 1 to length to account for the padding septet
		}

		return { length, result };
	}

	/**
	 * Encodes a text string into 16-bit hexadecimal PDU format.
	 *
	 * @param text The text to encode
	 * @returns An object containing the length of the encoded text in septets and the result as a hexadecimal string
	 */
	static encode16Bit(text: string) {
		let pdu = '';

		for (let i = 0; i < text.length; i++) {
			const byte = Helper.order(text.substring(i, i + 1));
			pdu += Helper.toStringHex(byte, 4);
		}

		return { length: text.length * 2, result: pdu };
	}

	/**
	 * Converts a number to a hexadecimal string with optional zero padding.
	 *
	 * @param number The number to convert
	 * @param fill The minimum length of the resulting string, padded with zeros if necessary
	 * @returns The number as a hexadecimal string
	 */
	static toStringHex(number: number, fill = 2) {
		return number.toString(16).padStart(fill, '0').toUpperCase();
	}
}
