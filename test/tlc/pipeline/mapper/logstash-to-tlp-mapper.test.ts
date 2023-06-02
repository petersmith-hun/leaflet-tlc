import LogstashToTLPMapper from "@app/pipeline/mapper/logstash-to-tlp-mapper";
import TLPLogMessage from "@app/client/tlp";

describe("Unit tests for LogstashToTLPMapper", () => {

    let logstashToTLPMapper: LogstashToTLPMapper;

    beforeEach(() => {
        logstashToTLPMapper = new LogstashToTLPMapper("log-stream-1");
    });

    describe("Test scenarios for #map", () => {

        it("should map log message with exception", () => {

            // given
            const inputDate = prepareInputData(true);
            const expectedOutput = prepareExpectedOutput(true);

            // when
            const result = logstashToTLPMapper.map(inputDate);

            // then
            expect(result).toStrictEqual(expectedOutput);
        });

        it("should map log message without exception and mdc", () => {

            // given
            const inputDate = prepareInputData(false);
            const expectedOutput = prepareExpectedOutput(false);

            // when
            const result = logstashToTLPMapper.map(inputDate);

            // then
            expect(result).toStrictEqual(expectedOutput);
        });

        it("should return null on error while mapping", () => {

            // when
            // @ts-ignore
            const result = logstashToTLPMapper.map(null);

            // then
            expect(result).toBeNull();
        });

        function prepareInputData(withExceptionAndMDC: boolean): any {

            return {
                "@timestamp": "2023-05-29T13:21:30.122330935Z",
                message: "This is a log messsage",
                logger_name: "hu.psprog.leaflet.LeafletBackendApplication",
                thread_name: "main",
                level: "INFO",
                mdc: withExceptionAndMDC ? { "requestID": "request-1234" } : undefined,
                stack_trace: withExceptionAndMDC ? "stacktrace" : undefined,
                exception_class: withExceptionAndMDC ? "java.lang.NullPointerException" : undefined,
                exception_message: withExceptionAndMDC ? "null" : undefined
            }
        }

        function prepareExpectedOutput(withExceptionAndMDC: boolean): TLPLogMessage {

            return {
                source: "log-stream-1",
                timeStamp: 1685366490122,
                level: {
                    levelStr: "INFO"
                },
                loggerName: "hu.psprog.leaflet.LeafletBackendApplication",
                threadName: "main",
                content: "This is a log messsage",
                exception: withExceptionAndMDC ? {
                    className: "java.lang.NullPointerException",
                    message: "null",
                    stackTrace: "stacktrace"
                } : undefined,
                mdc: withExceptionAndMDC
                    ? { "requestID": "request-1234" }
                    : {}
            }
        }
    });
});
