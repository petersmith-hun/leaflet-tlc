import { ListenerFactory } from "@app/factory/listener-factory";
import { ListenerType } from "@app/config/pipeline-options";
import { PipelineConfig } from "@app/config";
import DockerLogsApiListener from "@app/pipeline/listener/docker-logs-api-listener";
import FileListener from "@app/pipeline/listener/file-listener";
import sinon, { SinonStubbedInstance } from "sinon";
import { DockerLogsApiListenerFactory } from "@app/factory/docker-logs-api-listener-factory";
import { dockerEngineAPIClient } from "@app/client/docker/docker-engine-api-client";

describe("Unit tests for ListenerFactory", () => {

    let dockerLogsApiListenerFactoryStub: SinonStubbedInstance<DockerLogsApiListenerFactory>;
    let listenerFactory: ListenerFactory;

    beforeEach(() => {
        dockerLogsApiListenerFactoryStub = sinon.createStubInstance(DockerLogsApiListenerFactory);

        listenerFactory = new ListenerFactory(dockerLogsApiListenerFactoryStub);
    });

    describe("Test scenarios for #getListener", () => {

        it("should return a docker logs listener", async () => {

            // given
            const pipelineConfig = preparePipelineConfig(ListenerType.DOCKER);
            const containerDefinition = { Id: "container-1", Names: ["/container-1"] }
            const dockerLogsApiListener = new DockerLogsApiListener(dockerEngineAPIClient, containerDefinition.Names[0]);

            dockerLogsApiListenerFactoryStub.createListeners.withArgs(pipelineConfig).resolves([dockerLogsApiListener])

            // when
            const result = (await listenerFactory.getListeners(pipelineConfig))[0];

            // then
            expect(result).toBeInstanceOf(DockerLogsApiListener);
            // @ts-ignore
            expect(result.dockerEngineAPIClient === dockerEngineAPIClient).toBe(true);
            // @ts-ignore
            expect(result.containerName).toBe(containerDefinition.Names[0]);
        });

        it("should return a file listener", async () => {

            // given
            const pipelineConfig = preparePipelineConfig(ListenerType.FILE);

            // when
            const result = (await listenerFactory.getListeners(pipelineConfig))[0];

            // then
            expect(result).toBeInstanceOf(FileListener);
            // @ts-ignore
            expect(result.filename).toBe("/opt/test.log");
        });

        it("should return different docker logs listener instances on consecutive calls", () => {

            // given
            const pipelineConfig = preparePipelineConfig(ListenerType.DOCKER);

            // when
            const resultFirst = listenerFactory.getListeners(pipelineConfig);
            const resultSecond = listenerFactory.getListeners(pipelineConfig);

            // then
            expect(resultFirst !== resultSecond).toBe(true);
        });

        it("should return different file listener instances on consecutive calls", () => {

            // given
            const pipelineConfig = preparePipelineConfig(ListenerType.FILE);

            // when
            const resultFirst = listenerFactory.getListeners(pipelineConfig);
            const resultSecond = listenerFactory.getListeners(pipelineConfig);

            // then
            expect(resultFirst !== resultSecond).toBe(true);
        });

        function preparePipelineConfig(listener: ListenerType): PipelineConfig {
            return {
                listenerType: listener,
                listenerConfig: {
                    containerName: listener === ListenerType.DOCKER ? "container-1" : null,
                    sourceFilePath: listener === ListenerType.FILE ? "/opt/test.log" : null,
                }
            } as unknown as PipelineConfig;
        }
    });
});
