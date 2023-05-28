import TLPLogMessage from "@app/client/tlp/index";
import axios from "axios";
import log from "@app/util/simple-logger";
import configurationProvider from "@app/config/configuration-provider";

/**
 * API client implementation for communicating with the Tiny Log Processor (TLP) service.
 * Implementation is using Axios as the network client.
 */
class TLPClient {

    private readonly tlpLogsPath: string;

    constructor() {
        this.tlpLogsPath = `${configurationProvider.getTLPConnection().uri}/logs`;
    }

    /**
     * Send the given log message to the TLP service. Response is not awaited, request is sent in a fire-and-forget
     * manner, but promise rejection is logged in case of an error.
     * @param tlpLogMessage TLPLogMessage object to be submitted
     */
    public submitLog(tlpLogMessage: TLPLogMessage): void {

        axios.post(this.tlpLogsPath, tlpLogMessage)
            .catch(reason => log.error(`Failed to transfer log message to TLP; reason=${reason?.message}`));
    }
}

const tlpClient = new TLPClient();
export default tlpClient;
