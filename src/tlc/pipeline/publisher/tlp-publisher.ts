import Publisher from "@app/pipeline/publisher/index";
import TLPLogMessage from "@app/client/tlp";
import TLPClient from "@app/client/tlp/tlp-client";

/**
 * Publisher implementation submitting the processed log objects to the Tiny Log Processor service.
 */
export default class TLPPublisher implements Publisher<TLPLogMessage> {

    private static instance: TLPPublisher;

    private readonly tlpClient: TLPClient;

    private constructor() {
        this.tlpClient = TLPClient.getInstance();
    }

    /**
     * Returns a singleton instance of the TLPPublisher.
     */
    public static getInstance() {

        if (!TLPPublisher.instance) {
            TLPPublisher.instance = new TLPPublisher();
        }

        return TLPPublisher.instance;
    }

    publish(data: TLPLogMessage): void {
        this.tlpClient.submitLog(data);
    }

}
