import { buildTime } from "@build-time";
import { version } from "@package";
import log from "@app/util/simple-logger";
import { controller } from "@app/controller";

(async () => {
    log.info(`Running TLC version ${version} built on ${buildTime}`);
    await controller.init();
})();
