import { buildTime } from "@build-time";
import { version } from "@package";
import log from "@app/util/simple-logger";
import controller from "@app/controller";

log.info(`Running version ${version} built on ${buildTime}`)

controller.init();
