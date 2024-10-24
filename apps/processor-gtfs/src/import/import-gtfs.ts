import { importAgencies } from "./components/import-agencies.js";
import { type RouteRecord, importRoutes } from "./components/import-routes.js";
import { importServices } from "./components/import-services.js";
import { importShapes } from "./components/import-shapes.js";
import { importStops } from "./components/import-stops.js";
import { importTrips } from "./components/import-trips.js";

export type LoadShapesStrategy = "LOAD-IF-EXISTS" | "IGNORE";

export type ImportGtfsOptions = {
	excludeRoute?: (route: RouteRecord) => boolean;
	shapesStrategy?: LoadShapesStrategy;
};

export async function importGtfs(gtfsDirectory: string, options: ImportGtfsOptions = {}) {
	const [agencies, services, shapes, stops] = await Promise.all([
		importAgencies(gtfsDirectory),
		importServices(gtfsDirectory),
		importShapes(gtfsDirectory, options),
		importStops(gtfsDirectory),
	]);
	const routes = await importRoutes(gtfsDirectory, options, agencies);
	const trips = await importTrips(gtfsDirectory, options, routes, services, shapes, stops);
	return { agencies, routes, services, stops, trips, journeys: [] };
}
