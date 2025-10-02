import logger from "../dist/index";
import path from "path";

logger.error("Error: Server timeout occurred while processing the request.", "halo, halo", path.basename(__filename));
