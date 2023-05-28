import Mapper from "@app/pipeline/mapper/index";
import TLPLogMessage, { ErrorLog } from "@app/client/tlp";
import log from "@app/util/simple-logger";
import { Optional } from "@app/domain";

type LogstashErrorLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LogstashDataStructure {
    "@timestamp": Date,
    message: string,
    logger_name: string,
    thread_name: string,
    level: LogstashErrorLevel,
    mdc?: object,
    stack_trace?: string,
    exception_class?: string,
    exception_message?: string
}

/**
 * Mapper implementation converting Logstash-like log objects into TLPLogMessage request objects.
 * Implementation considers the input data to be formatted as the standard Logstash log message structure, additionally
 * considering the mdc field holding MDC key-value pairs, as well as the exception_class and exception_message fields
 * holding the FQDN of the thrown exception and the exception message respectively. It also sets the log stream name
 * in the "source" field, that is used by TLP to distinguish the source application the log message is coming from.
 */
export default class LogstashToTLPMapper implements Mapper<LogstashDataStructure, TLPLogMessage> {

    private readonly sourceStream: string;

    private constructor(sourceStream: string) {
        this.sourceStream = sourceStream;
    }

    /**
     * Returns a prototype instance of the LogstashToTLPMapper, setting the source stream name.
     * @param sourceStream source stream name to be set in the TLP requests
     */
    public static getInstance(sourceStream: string): LogstashToTLPMapper {
        return new LogstashToTLPMapper(sourceStream);
    }

    map(inputData: LogstashDataStructure): Optional<TLPLogMessage> {

        try {
            return {
                source: this.sourceStream,
                timeStamp: new Date(inputData["@timestamp"]).getTime(),
                level: {
                    levelStr: inputData.level
                },
                loggerName: inputData.logger_name,
                threadName: inputData.thread_name,
                content: inputData.message,
                exception: inputData.stack_trace
                    ? this.mapException(inputData)
                    : undefined,
                mdc: inputData.mdc ?? {}
            };
        } catch (error) {
            log.error(`Could not map input data; reason=${error}`);
            return null;
        }
    }

    private mapException(inputData: LogstashDataStructure): ErrorLog {

        return {
            className: inputData.exception_class!,
            message: inputData.exception_message!,
            stackTrace: inputData.stack_trace
        };
    }
}
