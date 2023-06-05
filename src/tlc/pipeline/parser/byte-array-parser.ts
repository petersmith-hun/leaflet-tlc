import { Observable } from "rxjs";
import { SystemConfig } from "@app/config";
import { configurationProvider } from "@app/config/configuration-provider";
import Parser from "@app/pipeline/parser";
import log from "@app/util/simple-logger";

/**
 * Parser implementation that converts the given Uint8Array data slice to a string. Recommended to be used along with
 * the Docker Engine API listener, as the is emitted as a Uint8Array stream, that must be converted before being processed.
 * Slices that cannot be parsed are suppressed (subscriber.next() is not called in such cases).
 */
export class ByteArrayParser implements Parser<Uint8Array, string> {

    private static readonly stdoutHeaderSizeInBytes = 8;

    private readonly systemConfig: SystemConfig;

    constructor(systemConfig: SystemConfig) {
        this.systemConfig = systemConfig;
    }

    parse(inputData: Uint8Array): Observable<string> {

        return new Observable(subscriber => {

            try {
                const line = this.systemConfig.enableTrimmingStdoutHeader
                    ? this.parseLine(inputData.slice(ByteArrayParser.stdoutHeaderSizeInBytes))
                    : this.parseLine(inputData);
                subscriber.next(line);
            } catch (error) {
                log.warn("Log message could not be parsed as byte array");
            }
        });
    }

    private parseLine(inputData: Uint8Array): string {

        return Buffer
            .from(inputData)
            .toString("utf8");
    }
}

export const byteArrayParser = new ByteArrayParser(configurationProvider.systemConfig);
