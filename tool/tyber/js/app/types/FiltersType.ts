export interface Filters {
	regex: string;
	regexFlags: string;
	searchInTraceTitle: boolean;
	searchInStepTitle: boolean;
	searchInDetail: boolean;
	displaySucceeded: boolean;
	displayRunning: boolean;
	displayFailed: boolean;
}
