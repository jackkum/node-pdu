import { PDUType } from './PDUType';

/**
 * Represents the PDU type for an SMS-SUBMIT message in GSM SMS messaging.
 */
export class SubmitType extends PDUType {
	readonly messageTypeIndicator = PDUType.SMS_SUBMIT;

	constructor(params: SubmitParams = {}) {
		super({
			replyPath: params.replyPath ? 1 & params.replyPath : 0,
			userDataHeader: params.userDataHeader ? 1 & params.userDataHeader : 0,
			statusReportRequest: params.statusReportRequest ? 1 & params.statusReportRequest : 0,
			validityPeriodFormat: params.validityPeriodFormat ? 3 & params.validityPeriodFormat : 0,
			rejectDuplicates: params.rejectDuplicates ? 1 & params.rejectDuplicates : 0
		});
	}
}

export type SubmitParams = {
	replyPath?: number;
	userDataHeader?: number;
	statusReportRequest?: number;
	validityPeriodFormat?: number;
	rejectDuplicates?: number;
};
