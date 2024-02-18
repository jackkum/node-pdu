import { PDUType } from './PDUType';

/**
 * Represents the PDU type for an SMS-REPORT message in GSM SMS messaging.
 */
export class ReportType extends PDUType {
	readonly messageTypeIndicator = PDUType.SMS_REPORT;

	/**
	 * Constructs a ReportType instance.
	 * @param params Parameters for configuring the ReportType instance
	 */
	constructor(params: ReportParams = {}) {
		super({
			replyPath: params.replyPath ? 1 & params.replyPath : 0,
			userDataHeader: params.userDataHeader ? 1 & params.userDataHeader : 0,
			statusReportRequest: params.statusReportRequest ? 1 & params.statusReportRequest : 0,
			rejectDuplicates: params.mms ? 1 & params.mms : 0,
			validityPeriodFormat: 0x00 // not used
		});
	}
}

export type ReportParams = {
	replyPath?: number;
	userDataHeader?: number;
	statusReportRequest?: number;
	mms?: number;
};
