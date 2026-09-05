import sinon, { SinonStubbedInstance } from "sinon";
import { DockerEngineApiClient } from "@app/client/docker/docker-engine-api-client";
import DockerLogsApiListener from "@app/pipeline/listener/docker-logs-api-listener";
import { IncomingMessage } from "http";
import { AxiosResponse } from "axios";
import { blockExecution } from "@test/util";
import { ContainerDefinition } from "@app/client/docker";

describe("Unit tests for DockerLogsApiListener", () => {

    let dockerEngineApiClientMock: SinonStubbedInstance<DockerEngineApiClient>;
    let incomingMessageMock: SinonStubbedInstance<IncomingMessage>;
    let dockerLogsApiListener: DockerLogsApiListener;

    beforeEach(() => {
        dockerEngineApiClientMock = sinon.createStubInstance(DockerEngineApiClient);
        incomingMessageMock = sinon.createStubInstance(IncomingMessage);
        dockerLogsApiListener = new DockerLogsApiListener(dockerEngineApiClientMock, "container1");
    });

    describe("Test scenarios for constructor", () => {

        it("should handle container name with trailing slash", () => {

            // when
            const result = new DockerLogsApiListener(dockerEngineApiClientMock, "/container1");

            // then
            expect(result.containerName).toBe("/container1");
        });

        it("should handle container name without trailing slash", () => {

            // when
            const result = new DockerLogsApiListener(dockerEngineApiClientMock, "container1");

            // then
            expect(result.containerName).toBe("/container1");
        });
    });

    describe("Test scenarios for #listen", () => {

        it("should init the log stream, attach it to an observable, and start listening to log messages", async () => {

            // given
            const container1 = { Id: "container1", Names: ["/container1"] };
            const container2 = { Id: "container2", Names: ["/container2"] };
            const expectedLine = "this is a log message";
            const containersResponse = { data: [container1, container2] } as unknown as AxiosResponse<ContainerDefinition[]>;
            const logStreamResponse = { data: incomingMessageMock } as unknown as AxiosResponse<IncomingMessage>;

            dockerEngineApiClientMock.getContainers.resolves(containersResponse);
            dockerEngineApiClientMock.getLogStream.withArgs(container1).resolves(logStreamResponse);
            incomingMessageMock.on.returns(incomingMessageMock);

            // when
            const result = dockerLogsApiListener.listen();

            // then
            let subscriberCalledWith: any = "";
            const subscription = result.subscribe(value => { subscriberCalledWith = value; });
            await blockExecution();
            const incomingMessageDataCall = incomingMessageMock.on.getCall(0);
            incomingMessageDataCall.callArgWith(1, expectedLine);

            expect(subscription.closed).toBe(false);
            expect(subscriberCalledWith).toBe(expectedLine);
        });

        it("should complete the observable on the last data item", async () => {

            // given
            const container1 = { Id: "container1", Names: ["/container1"] };
            const containersResponse = { data: [container1] } as unknown as AxiosResponse<ContainerDefinition[]>;
            const logStreamResponse = { data: incomingMessageMock } as unknown as AxiosResponse<IncomingMessage>;

            dockerEngineApiClientMock.getContainers.resolves(containersResponse);
            dockerEngineApiClientMock.getLogStream.withArgs(container1).resolves(logStreamResponse);
            incomingMessageMock.on.returns(incomingMessageMock);

            // when
            const result = dockerLogsApiListener.listen();

            // then
            const subscription = result.subscribe(() => {});
            await blockExecution();
            const incomingMessageDataCall = incomingMessageMock.on.getCall(1);
            incomingMessageDataCall.callArg(1);

            expect(subscription.closed).toBe(true);
        });

        it("should complete the observable on error", async () => {

            // given
            dockerEngineApiClientMock.getContainers.rejects("Something went wrong");

            // when
            const result = dockerLogsApiListener.listen();

            // then
            const subscription = result.subscribe(() => {});
            await blockExecution();

            expect(subscription.closed).toBe(true);
        });

        it("should immediately complete the observable if container is missing", async () => {

            // given
            const container1 = { Id: "container1", Names: ["/not-the-expected-container"] };
            const containersResponse = { data: [container1] } as unknown as AxiosResponse<ContainerDefinition[]>;

            dockerEngineApiClientMock.getContainers.resolves(containersResponse);

            // when
            const result = dockerLogsApiListener.listen();

            // then
            const subscription = result.subscribe(() => {});
            await blockExecution();

            expect(subscription.closed).toBe(true);
        });
    });

    describe("Test scenarios for #sourceName", () => {

        it("should return the source container name prefixed with 'docker:'", () => {

            // when
            const result = dockerLogsApiListener.sourceName();

            // then
            expect(result).toBe("docker:/container1");
        });
    });
});
