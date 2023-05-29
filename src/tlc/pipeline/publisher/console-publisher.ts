import Publisher from "@app/pipeline/publisher/index";
import log from "@app/util/simple-logger";

/**
 * Publisher implementation displaying the processed log objects on the standard output. Recommended for debugging
 * purposes only.
 */
export class ConsolePublisher implements Publisher<object> {

    publish(data: string | object): void {
        log.info(typeof data === "object" ? JSON.stringify(data) : data);
    }
}

export const consolePublisher = new ConsolePublisher();
