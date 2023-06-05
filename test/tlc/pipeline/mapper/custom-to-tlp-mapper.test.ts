import CustomToTLPMapper from "@app/pipeline/mapper/custom-to-tlp-mapper";
import { CustomMapping, PipelineConfig } from "@app/config";

describe("Unit tests for CustomToTLPMapper", () => {

    const logStreamName = "log-stream-1";
    let customToTLPMapper: CustomToTLPMapper;

    describe("Test scenarios for #map", () => {

        it("should map fully populated log request using custom mapping", () => {

            // given
            const customMapping = prepareMapping();
            const logMessage = prepareLogMessage();
            const expectedTLPLogMessage = prepareExpectedTLPLogRequest();

            customToTLPMapper = new CustomToTLPMapper({
                logStreamName: logStreamName,
                mapperConfig: customMapping
            } as unknown as PipelineConfig);

            // when
            const result = customToTLPMapper.map(logMessage);

            // then
            expect(result).toStrictEqual(expectedTLPLogMessage);
        });

        it("should map to empty log request without mapping", () => {

            // given
            const customMapping = {};
            const logMessage = prepareLogMessage();
            const expectedTLPLogMessage = prepareEmptyTLPLogRequest();

            customToTLPMapper = new CustomToTLPMapper({
                logStreamName: logStreamName,
                mapperConfig: customMapping
            } as unknown as PipelineConfig);

            // when
            const result = customToTLPMapper.map(logMessage);

            // then
            expect(result).toStrictEqual(expectedTLPLogMessage);
        });

        it("should return null on mapping error", () => {

            // given
            const customMapping = null;
            const logMessage = prepareLogMessage();

            customToTLPMapper = new CustomToTLPMapper({
                logStreamName: logStreamName,
                mapperConfig: customMapping
            } as unknown as PipelineConfig);

            // when
            const result = customToTLPMapper.map(logMessage);

            // then
            expect(result).toBeNull();
        });

        function prepareMapping(): CustomMapping {

            return {
                timeStamp: "$.date",
                level: "$.log_level",
                loggerName: "$.logged_by",
                threadName: "$.thread",
                content: "$.log_message",
                message: "$.error.message",
                stackTrace: "$.error.metadata[1]",
                className: "$.error.metadata[0]",
                mdc: {
                    requestID: "$.context.requestID",
                    userID: "$.context.userID"
                }
            } as unknown as CustomMapping;
        }

        function prepareLogMessage(): object {

            return {
                date: "2023-05-29T13:21:30Z",
                log_level: "ERROR",
                logged_by: "app.handler.RequestHandler",
                thread: "http-request-1",
                log_message: "Failed to process request",
                error: {
                    message: "Something went wrong",
                    metadata: [
                        "app.error.InvalidRequestError",
                        "\tapp.handler.RequestHandler\n\tapp.Main"
                    ]
                },
                context: {
                    requestID: "request-1234",
                    userID: "user-1"
                }
            }
        }

        function prepareExpectedTLPLogRequest(): object {

            return {
                source: logStreamName,
                timeStamp: "2023-05-29T13:21:30Z",
                level: {
                    levelStr: "ERROR"
                },
                loggerName: "app.handler.RequestHandler",
                threadName: "http-request-1",
                content: "Failed to process request",
                exception: {
                    className: "app.error.InvalidRequestError",
                    message: "Something went wrong",
                    stackTrace: "\tapp.handler.RequestHandler\n\tapp.Main"
                },
                mdc: {
                    requestID: "request-1234",
                    userID: "user-1"
                }
            }
        }

        function prepareEmptyTLPLogRequest(): object {

            return {
                source: logStreamName,
                timeStamp: 0,
                level: {
                    levelStr: "UNDEFINED"
                },
                loggerName: "default",
                threadName: "main",
                content: "",
                exception: undefined,
                mdc: {}
            }
        }
    });
});
