import { Deliver } from '../Deliver';
import { Report } from '../Report';
import { Submit } from '../Submit';
import { SCA } from '../utils/SCA/SCA';
import { DeliverType } from '../utils/Type/DeliverType';
import { ReportType } from '../utils/Type/ReportType';
import { SubmitType } from '../utils/Type/SubmitType';

// import the parser for the utils

import parseData from './parseUtils/parseData';
import parseDCS from './parseUtils/parseDCS';
import parsePID from './parseUtils/parsePID';
import parseSCA from './parseUtils/parseSCA';
import parseSCTS from './parseUtils/parseSCTS';
import parseType from './parseUtils/parseType';
import parseVP from './parseUtils/parseVP';

export type GetSubstr = (length: number) => string;

/**
 * Parses a PDU string into an instance of a PDU object (Deliver, Submit, or Report).
 *
 * This function is a high-level entry point for parsing PDU strings into their corresponding PDU object types
 * based on the detected PDU type within the provided string. It handles the initial parsing steps common to all PDU types,
 * such as the Service Center Address (SCA) and PDU type determination, and then delegates to specific parsing functions
 * based on the PDU type.
 *
 * @param str The PDU string to be parsed
 *
 * @returns An instance of a PDU object (Deliver, Submit, or Report) depending on the PDU type detected in the input string
 * @throws Throws an error if an unknown SMS type is encountered
 */
export function parse(str: string) {
	let pduParse = str.toUpperCase();

	const getSubstr: GetSubstr = (length: number) => {
		const str = pduParse.substring(0, length);
		pduParse = pduParse.substring(length);

		return str;
	};

	// The correct order of parsing is important!!!

	const sca = parseSCA(getSubstr, false);
	const type = parseType(getSubstr);

	if (type instanceof DeliverType) {
		return parseDeliver(sca, type, getSubstr);
	}

	if (type instanceof ReportType) {
		return parseReport(sca, type, getSubstr);
	}

	if (type instanceof SubmitType) {
		return parseSubmit(sca, type, getSubstr);
	}

	throw new Error('node-pdu: Unknown SMS type!');
}

/**
 * Parses the "Deliver" type PDU from a given substring extractor.
 * This function extracts and constructs a Deliver PDU object from the provided PDU string parts.
 *
 * @param serviceCenterAddress The service center address extracted from the PDU string
 * @param type The detected DeliverType instance
 * @param getSubstr A function to extract substrings from the PDU string
 *
 * @returns An instance of Deliver containing parsed data
 */
function parseDeliver(serviceCenterAddress: SCA, type: DeliverType, getSubstr: GetSubstr) {
	// The correct order of parsing is important!

	const address = parseSCA(getSubstr, true);
	const protocolIdentifier = parsePID(getSubstr);
	const dataCodingScheme = parseDCS(getSubstr);
	const serviceCenterTimeStamp = parseSCTS(getSubstr);
	const userDataLength = Buffer.from(getSubstr(2), 'hex')[0];
	const userData = parseData(type, dataCodingScheme, userDataLength, getSubstr);

	return new Deliver(address, userData, { serviceCenterAddress, type, protocolIdentifier, dataCodingScheme, serviceCenterTimeStamp });
}

/**
 * Parses the "Report" type PDU from a given substring extractor.
 * This function extracts and constructs a Report PDU object from the provided PDU string parts.
 *
 * @param serviceCenterAddress The service center address extracted from the PDU string
 * @param type The detected ReportType instance
 * @param getSubstr A function to extract substrings from the PDU string
 *
 * @returns An instance of Report containing parsed data
 */
function parseReport(serviceCenterAddress: SCA, type: ReportType, getSubstr: GetSubstr) {
	// The correct order of parsing is important!

	const referencedBytes = Buffer.from(getSubstr(2), 'hex')[0];
	const address = parseSCA(getSubstr, true);
	const timestamp = parseSCTS(getSubstr);
	const discharge = parseSCTS(getSubstr);
	const status = Buffer.from(getSubstr(2), 'hex')[0];

	return new Report(address, referencedBytes, timestamp, discharge, status, { serviceCenterAddress, type });
}

/**
 * Parses the "Submit" type PDU from a given substring extractor.
 * This function extracts and constructs a Submit PDU object from the provided PDU string parts.
 *
 * @param serviceCenterAddress The service center address extracted from the PDU string
 * @param type The detected SubmitType instance
 * @param getSubstr A function to extract substrings from the PDU string
 *
 * @returns An instance of Submit containing parsed data
 */
function parseSubmit(serviceCenterAddress: SCA, type: SubmitType, getSubstr: GetSubstr) {
	// The correct order of parsing is important!

	const messageReference = Buffer.from(getSubstr(2), 'hex')[0];
	const address = parseSCA(getSubstr, true);
	const protocolIdentifier = parsePID(getSubstr);
	const dataCodingScheme = parseDCS(getSubstr);
	const validityPeriod = parseVP(type, getSubstr);
	const userDataLength = Buffer.from(getSubstr(2), 'hex')[0];
	const userData = parseData(type, dataCodingScheme, userDataLength, getSubstr);

	return new Submit(address, userData, {
		serviceCenterAddress,
		type,
		messageReference,
		protocolIdentifier,
		dataCodingScheme,
		validityPeriod
	});
}
