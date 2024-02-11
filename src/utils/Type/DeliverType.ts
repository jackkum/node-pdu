import { PDUType } from './PDUType';

/**
 * Represents the PDU type for an SMS-DELIVER message in GSM SMS messaging.
 */
export class DeliverType extends PDUType {
	readonly messageTypeIndicator = PDUType.SMS_DELIVER;

	constructor(params: DeliverParams = {}) {
		super({
			replyPath: params.replyPath ? 1 & params.replyPath : 0,
			userDataHeader: params.userDataHeader ? 1 & params.userDataHeader : 0,
			statusReportRequest: params.statusReportRequest ? 1 & params.statusReportRequest : 0,
			rejectDuplicates: params.mms ? 1 & params.mms : 0,
			validityPeriodFormat: 0x00 // not used
		});
	}
}

export type DeliverParams = {
	replyPath?: number;
	userDataHeader?: number;
	statusReportRequest?: number;
	mms?: number;
};
