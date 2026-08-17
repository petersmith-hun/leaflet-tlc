import sinon, { SinonStubbedInstance } from "sinon";
import { DockerEngineApiClient } from "@app/client/docker/docker-engine-api-client";
import DockerLogsApiListener from "@app/pipeline/listener/docker-logs-api-listener";
import { IncomingMessage } from "http";
import { AxiosResponse } from "axios";
import { blockExecution } from "@test/util";

describe("Unit tests for DockerLogsApiListener", () => {

    const containerDefinition = { Id: "container1", Names: ["/container1"] };

    let dockerEngineApiClientMock: SinonStubbedInstance<DockerEngineApiClient>;
    let incomingMessageMock: SinonStubbedInstance<IncomingMessage>;
    let dockerLogsApiListener: DockerLogsApiListener;

    beforeEach(() => {
        dockerEngineApiClientMock = sinon.createStubInstance(DockerEngineApiClient);
        incomingMessageMock = sinon.createStubInstance(IncomingMessage);
        dockerLogsApiListener = new DockerLogsApiListener(dockerEngineApiClientMock, containerDefinition);
    });

    describe("Test scenarios for #listen", () => {

        it("should init the log stream, attach it to an observable, and start listening to log messages", async () => {

            // given
            const container1 = { Id: "container1", Names: ["/container1"] };
            const expectedLine = "this is a log message";
            const logStreamResponse = { data: incomingMessageMock } as unknown as AxiosResponse<IncomingMessage>;

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
            const logStreamResponse = { data: incomingMessageMock } as unknown as AxiosResponse<IncomingMessage>;

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
            dockerEngineApiClientMock.getLogStream.rejects("Something went wrong");

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
            expect(result).toBe(`docker:${containerDefinition.Names[0]}`);
        });
    });
});
