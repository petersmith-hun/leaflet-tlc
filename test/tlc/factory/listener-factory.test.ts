import { DockerEngineApiClient } from "@app/client/docker/docker-engine-api-client";
import { ListenerFactory } from "@app/factory/listener-factory";
import { ListenerType } from "@app/config/pipeline-options";
import { PipelineConfig } from "@app/config";
import DockerLogsApiListener from "@app/pipeline/listener/docker-logs-api-listener";
import sinon from "sinon";

describe("Unit tests for ListenerFactory", () => {

    let dockerEngineAPIClient = sinon.fake() as unknown as DockerEngineApiClient;
    let listenerFactory: ListenerFactory;

    beforeEach(() => {
        listenerFactory = new ListenerFactory(dockerEngineAPIClient);
    });

    describe("Test scenarios for #getListener", () => {

        it("should return a docker logs listener", () => {

            // given
            const pipelineConfig = preparePipelineConfig(ListenerType.DOCKER);

            // when
            const result = listenerFactory.getListener(pipelineConfig);

            // then
            expect(result).toBeInstanceOf(DockerLogsApiListener);
            // @ts-ignore
            expect(result.dockerEngineAPIClient === dockerEngineAPIClient).toBe(true);
            // @ts-ignore
            expect(result.containerName).toBe("/container-1");
        });

        it("should return different docker logs listener instances on consecutive calls", () => {

            // given
            const pipelineConfig = preparePipelineConfig(ListenerType.DOCKER);

            // when
            const resultFirst = listenerFactory.getListener(pipelineConfig);
            const resultSecond = listenerFactory.getListener(pipelineConfig);

            // then
            expect(resultFirst !== resultSecond).toBe(true);
        });

        function preparePipelineConfig(listener: ListenerType): PipelineConfig {
            return {
                listenerType: listener,
                listenerConfig: {
                    containerName: "container-1"
                }
            } as unknown as PipelineConfig;
        }
    });
});
