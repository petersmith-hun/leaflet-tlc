import { ApplicationConfig, DockerConnectionType } from "@app/config";
import { ConfigurationProvider } from "@app/config/configuration-provider";
import { ListenerType, MapperType, ParserType, PublisherType } from "@app/config/pipeline-options";

describe("Unit tests for ConfigurationProvider", () => {

    const configuration = prepareApplicationConfig();
    let configurationProvider: ConfigurationProvider;

    beforeEach(() => {
        configurationProvider = new ConfigurationProvider();
    });

    describe("Test scenarios for #systemConfig", () => {

        it("should return system configuration", () => {

            // when
            const result = configurationProvider.systemConfig;

            // then
            expectNormalized(result, configuration.systemConfig);
        });
    });

    describe("Test scenarios for #dockerConnection", () => {

        it("should return Docker connection configuration", () => {

            // when
            const result = configurationProvider.dockerConnection;

            // then
            expectNormalized(result, configuration.connectionConfig.dockerConnection);
        });
    });

    describe("Test scenarios for #tlpConnection", () => {

        it("should return TLP connection configuration", () => {

            // when
            const result = configurationProvider.tlpConnection;

            // then
            expectNormalized(result, configuration.connectionConfig.tlpConnection);
        });
    });

    describe("Test scenarios for #pipelines", () => {

        it("should return the pipeline configurations", () => {

            // when
            const result = configurationProvider.pipelines;

            // then
            expect(result.length).toBe(2);
            expectNormalized(result[0], configuration.pipelines[0]);
            expectNormalized(result[1], configuration.pipelines[1]);
        });
    });

    function expectNormalized(result: any, expectation: any): void {

        const resultNormalized = JSON.parse(JSON.stringify(result));
        const expectationNormalized = JSON.parse(JSON.stringify(expectation));

        expect(resultNormalized).toStrictEqual(expectationNormalized);
    }

    function prepareApplicationConfig(): ApplicationConfig {

        return {
            systemConfig: {
                reconnectionPollRate: 500,
                enableTrimmingStdoutHeader: true
            },
            connectionConfig: {
                dockerConnection: {
                    connectionType: DockerConnectionType.TCP,
                    uri: "http://localhost:8888"
                },
                tlpConnection: {
                    uri: "http://localhost:9999/tlp"
                }
            },
            pipelines: [
                {
                    logStreamName: "app1",
                    listenerType: ListenerType.DOCKER,
                    listenerConfig: {
                        containerName: "container-app1"
                    },
                    parsers: [
                        ParserType.BYTE_ARRAY,
                        ParserType.JOINING_JSON
                    ],
                    mapperType: MapperType.LOGSTASH_TO_TLP,
                    publishers: [
                        PublisherType.CONSOLE,
                        PublisherType.TLP
                    ],
                    enabled: true
                },
                {
                    logStreamName: "app2",
                    listenerType: ListenerType.DOCKER,
                    listenerConfig: {
                        containerName: "container-app2"
                    },
                    parsers: [
                        ParserType.BYTE_ARRAY
                    ],
                    mapperType: MapperType.CUSTOM_TO_TLP,
                    mapperConfig: {
                        level: "$.level",
                        className: "$.exception.class",
                        message: "$.exception.message",
                        stackTrace: "$.exception.stacktrace",
                        mdc: {
                            requestID: "$.requestID"
                        }
                    },
                    publishers: [
                        PublisherType.CONSOLE
                    ],
                    enabled: false
                }
            ]
        } as ApplicationConfig;
    }
});
