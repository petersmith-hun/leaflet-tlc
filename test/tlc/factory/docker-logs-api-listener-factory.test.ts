import { DockerLogsApiListenerFactory } from "@app/factory/docker-logs-api-listener-factory";
import sinon, { SinonStubbedInstance } from "sinon";
import { DockerEngineApiClient } from "@app/client/docker/docker-engine-api-client";
import { PipelineConfig } from "@app/config";
import { AxiosResponse } from "axios";
import { ContainerDefinition } from "@app/client/docker";
import DockerLogsApiListener from "@app/pipeline/listener/docker-logs-api-listener";

describe("Unit tests for DockerLogsApiListenerFactory", () => {

    let dockerEngineApiClient: SinonStubbedInstance<DockerEngineApiClient>;
    let dockerLogsApiListenerFactory: DockerLogsApiListenerFactory;

    beforeEach(() => {
        dockerEngineApiClient = sinon.createStubInstance(DockerEngineApiClient);
        dockerLogsApiListenerFactory = new DockerLogsApiListenerFactory(dockerEngineApiClient);
    });

    describe("Test scenarios for #createListeners", () => {

        it("should return a single listener for explicitly named container", async () => {

            // given
            const containerDefinition = { Id: "container-1", Names: ["/container-1"] };
            const axiosResponse = { data: [containerDefinition] } as AxiosResponse<ContainerDefinition[]>;
            const pipelineConfig = { listenerConfig: { containerName: "/container-1" } } as PipelineConfig;

            dockerEngineApiClient.getContainers.resolves(axiosResponse);

            // when
            const result = await dockerLogsApiListenerFactory.createListeners(pipelineConfig);

            // then
            expect(result.length).toBe(1);
            expect(result[0]).toBeInstanceOf(DockerLogsApiListener);
            expect(result[0].sourceName()).toBe("docker:/container-1");
        });

        it("should return multiple listeners for asterisk-suffixed container name", async () => {

            // given
            const containerDefinition1 = { Id: "container-1", Names: ["/some-other-container"] };
            const containerDefinition2 = { Id: "container-2", Names: ["/app-primary"] };
            const containerDefinition3 = { Id: "container-3", Names: ["/app-standby"] };
            const axiosResponse = {
                data: [
                    containerDefinition1,
                    containerDefinition2,
                    containerDefinition3
                ]
            } as AxiosResponse<ContainerDefinition[]>;
            const pipelineConfig = { listenerConfig: { containerName: "app*" } } as PipelineConfig;

            dockerEngineApiClient.getContainers.resolves(axiosResponse);

            // when
            const result = await dockerLogsApiListenerFactory.createListeners(pipelineConfig);

            // then
            expect(result.length).toBe(2);
            expect(result[0]).toBeInstanceOf(DockerLogsApiListener);
            expect(result[0].sourceName()).toBe("docker:/app-primary");
            expect(result[1]).toBeInstanceOf(DockerLogsApiListener);
            expect(result[1].sourceName()).toBe("docker:/app-standby");
        });

        it("should throw error on no matching container", async () => {

            // given
            const containerDefinition = { Id: "container-1", Names: ["/container-1"] };
            const axiosResponse = { data: [containerDefinition] } as AxiosResponse<ContainerDefinition[]>;
            const pipelineConfig = { listenerConfig: { containerName: "/app" } } as PipelineConfig;

            dockerEngineApiClient.getContainers.resolves(axiosResponse);

            // when
            const failingCall = () => dockerLogsApiListenerFactory.createListeners(pipelineConfig);

            // then
            await expect(failingCall).rejects.toThrow("No matching container found by name '/app'");
        });
    });
});
