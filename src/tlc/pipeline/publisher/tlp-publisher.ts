import Publisher from "@app/pipeline/publisher";
import TLPLogMessage from "@app/client/tlp";
import { tlpClient, TLPClient } from "@app/client/tlp/tlp-client";

/**
 * Publisher implementation submitting the processed log objects to the Tiny Log Processor service.
 */
export class TLPPublisher implements Publisher<TLPLogMessage> {

    private readonly tlpClient: TLPClient;

    constructor(tlpClient: TLPClient) {
        this.tlpClient = tlpClient;
    }

    publish(data: TLPLogMessage): void {
        this.tlpClient.submitLog(data);
    }

}

export const tlpPublisher = new TLPPublisher(tlpClient);
