import pLimit from "p-limit";

import { and, eq, gte, lte } from "drizzle-orm";
import { Temporal } from "temporal-polyfill";
import { database } from "../database/database.js";
import { lineActivities } from "../database/schema.js";
import { importLine } from "../import/import-line.js";
import { importVehicle } from "../import/import-vehicle.js";
import type { VehicleJourney } from "../types/vehicle-journey.js";

const ACTIVITY_THRESHOLD_MNS = 10;

const registerFn = pLimit(1);

export function registerActivity(journey: VehicleJourney) {
	return registerFn(() => _registerActivity(journey));
}

async function _registerActivity(journey: VehicleJourney) {
	if (typeof journey.line === "undefined" || typeof journey.vehicleRef === "undefined") return;

	const vehicle = await importVehicle(journey.networkRef, journey.vehicleRef, journey.operatorRef);
	const line = await importLine(
		journey.networkRef,
		journey.line,
		Temporal.Instant.from(journey.updatedAt),
	);

	const recordedAt = Temporal.ZonedDateTime.from(journey.updatedAt);

	const [currentActivity] = await database
		.select()
		.from(lineActivities)
		.where(
			and(
				eq(lineActivities.vehicleId, vehicle.id),
				eq(lineActivities.lineId, line.id),
				gte(lineActivities.updatedAt, recordedAt.subtract({ minutes: ACTIVITY_THRESHOLD_MNS })),
			),
		);

	if (typeof currentActivity !== "undefined") {
		await database
			.update(lineActivities)
			.set({ updatedAt: recordedAt })
			.where(eq(lineActivities.id, currentActivity.id));
	} else {
		await database.insert(lineActivities).values({
			vehicleId: vehicle.id,
			lineId: line.id,
			serviceDate: Temporal.PlainDate.from(journey.serviceDate!).toString(),
			startedAt: recordedAt,
			updatedAt: recordedAt,
		});
	}
}
