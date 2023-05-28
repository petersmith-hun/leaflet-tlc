import Mapper from "@app/pipeline/mapper/index";
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

    private constructor(pipelineConfig: PipelineConfig) {
        this.sourceStream = pipelineConfig.logStreamName;
        this.mapping = pipelineConfig.mapperConfig!;
    }

    /**
     * Returns a prototype instance of the CustomToTLPMapper, setting the source stream name and the parameter mapping.
     * @param pipelineConfig PipelineConfig object to extract the necessary configuration parameters from
     */
    public static getInstance(pipelineConfig: PipelineConfig): CustomToTLPMapper {
        return new CustomToTLPMapper(pipelineConfig);
    }

    map(inputData: object): Optional<TLPLogMessage> {

        try {
            return {
                source: this.sourceStream,
                timeStamp: this.applyPath(inputData, this.mapping.timeStamp) ?? 0,
                level: {
                    levelStr: `${this.applyPath(inputData, this.mapping.level)}`.toUpperCase()
                },
                loggerName: this.applyPath(inputData, this.mapping.loggerName) ?? "",
                threadName: this.applyPath(inputData, this.mapping.threadName) ?? "",
                content: this.applyPath(inputData, this.mapping.content) ?? "",
                exception: this.mapping.exception || this.mapping.message
                    ? this.mapException(inputData)
                    : undefined,
                mdc: this.mapMDC(inputData)
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
        if (this.mapping.mdc) {
            for (let key of Object.keys(this.mapping.mdc)) {
                const path = this.mapping.mdc[key];
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
