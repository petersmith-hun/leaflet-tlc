import { buildTime } from "@build-time";
import { version } from "@package";
import Controller from "@app/controller";
import log from "@app/util/simple-logger";

log.info(`Running version ${version} built on ${buildTime}`)

Controller.getInstance().init();
