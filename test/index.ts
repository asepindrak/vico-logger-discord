import logger from "../src/index";
import path from "path";
// Testing logger with different error messages
// logger.error("Error: First ERror");
// logger.error("Error: User authentication failed.");
// logger.error("Error: Missing required parameters in API request.");
// logger.error("Error: Invalid input format.");
// logger.error("Error: Resource not found.");
// logger.error("Error: Unauthorized access attempt detected.");
logger.error("Error: Server timeout occurred while processing the request.", path.basename(__filename));
