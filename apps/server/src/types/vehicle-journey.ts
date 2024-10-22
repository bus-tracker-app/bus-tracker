import type { Temporal } from "temporal-polyfill";

export type VehicleJourneyDirection = "OUTBOUND" | "INBOUND";
export type VehicleJourneyLineType =
	| "TRAMWAY"
	| "SUBWAY"
	| "RAIL"
	| "BUS"
	| "FERRY"
	| "COACH"
	| "UNKNOWN";

export type VehicleJourneyLine = {
	ref: string;
	number: string;
	type: VehicleJourneyLineType;
	color?: string;
	textColor?: string;
};

export type VehicleJourneyCall = {
	aimedTime: string;
	expectedTime?: string;
	stopRef: string;
	stopName: string;
	stopOrder: number;
	callStatus: "SCHEDULED" | "SKIPPED";
};

export type VehicleJourneyPosition = {
	latitude: number;
	longitude: number;
	atStop: boolean;
	type: "GPS" | "COMPUTED";
	recordedAt: string;
};

export type VehicleJourney = {
	id: string;
	line?: VehicleJourneyLine;
	direction?: VehicleJourneyDirection;
	destination?: string;
	calls?: VehicleJourneyCall[];
	position: VehicleJourneyPosition;
	networkRef: string;
	journeyRef?: string;
	operatorRef?: string;
	vehicleRef?: string;
	serviceDate?: string;
	updatedAt: string;
};
