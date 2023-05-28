import Publisher from "@app/pipeline/publisher/index";
import log from "@app/util/simple-logger";

/**
 * Publisher implementation displaying the processed log objects on the standard output. Recommended for debugging
 * purposes only.
 */
export default class ConsolePublisher implements Publisher<object> {

    private static instance: ConsolePublisher;

    private constructor() { }

    /**
     * Returns a singleton instance of the ConsolePublisher.
     */
    public static getInstance(): ConsolePublisher {

        if (!ConsolePublisher.instance) {
            ConsolePublisher.instance = new ConsolePublisher();
        }

        return ConsolePublisher.instance;
    }

    publish(data: string | object): void {
        log.info(typeof data === "object" ? JSON.stringify(data) : data);
    }
}
