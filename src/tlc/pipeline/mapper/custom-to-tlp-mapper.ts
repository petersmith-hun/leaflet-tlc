import Mapper from "@app/pipeline/mapper";
import TLPLogMessage, { ErrorLog } from "@app/client/tlp";
import { JSONPath } from "jsonpath-plus";
import log from "@app/util/simple-logger";
import { CustomMapping, PipelineConfig } from "@app/config";
import { Optional } from "@app/domain";

/**
 * Mapper implementation converting custom-structured log objects into TLPLogMessage request objects.
 * Behavior is similar to the LogstashToTLPMapper's, but uses the provided mapping to convert the structure.
 * The mapping can be provided in the pipeline configuration, under the mapping-config parameter as key-value pairs,
 * where keys are the target TLPLogMessage field names, and the values are JSON path expressions to extract the data
 * from the JSON document (inputData).
 * @see CustomMapping
 */
export default class CustomToTLPMapper implements Mapper<object, TLPLogMessage> {

    private readonly sourceStream: string;
    private readonly mapping: CustomMapping;

    constructor(pipelineConfig: PipelineConfig) {
        this.sourceStream = pipelineConfig.logStreamName;
        this.mapping = pipelineConfig.mapperConfig!;
    }

    map(inputData: object): Optional<TLPLogMessage> {

        try {
            return {
                source: this.sourceStream,
                timeStamp: new Date(this.applyPath(inputData, this.mapping.timeStamp) ?? 0).getTime(),
                level: {
                    levelStr: `${this.applyPath(inputData, this.mapping.level)}`.toUpperCase()
                },
                loggerName: this.applyPath(inputData, this.mapping.loggerName) ?? "default",
                threadName: this.applyPath(inputData, this.mapping.threadName) ?? "main",
                content: this.applyPath(inputData, this.mapping.content) ?? "",
                exception: this.mapping.exception || this.mapping.message
                    ? this.mapException(inputData)
                    : undefined,
                context: this.mapMDC(inputData)
            };

        } catch (error) {
            log.error(`Could not map input data; reason=${error}`);
            return null;
        }
    }

    private mapException(inputData: object): ErrorLog | undefined {

        let exception: ErrorLog | undefined = undefined;
        const errorMessage = this.applyPath(inputData, this.mapping.message) as string;
        if (errorMessage) {
            exception = {
                message: errorMessage,
                stackTrace: this.applyPath(inputData, this.mapping.stackTrace),
                className: this.applyPath(inputData, this.mapping.className)!
            }
        }

        return exception;
    }

    private mapMDC(inputData: object): object {

        const mdc: { [key: string]: string | undefined } = {};
        if (this.mapping.context) {
            for (let key of Object.keys(this.mapping.context)) {
                const path = this.mapping.context[key];
                mdc[key] = this.applyPath(inputData, path);
            }
        }

        return mdc;
    }

    private applyPath<T>(inputData: object, path?: string): T | undefined {

        return path
            ? JSONPath({json: inputData, path: path, wrap: false})
            : undefined
    }
}
