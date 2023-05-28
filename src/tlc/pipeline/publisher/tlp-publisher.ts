import Publisher from "@app/pipeline/publisher/index";
import TLPLogMessage from "@app/client/tlp";
import tlpClient from "@app/client/tlp/tlp-client";

/**
 * Publisher implementation submitting the processed log objects to the Tiny Log Processor service.
 */
class TLPPublisher implements Publisher<TLPLogMessage> {

    publish(data: TLPLogMessage): void {
        tlpClient.submitLog(data);
    }

}

const tlpPublisher = new TLPPublisher();
export default tlpPublisher;
