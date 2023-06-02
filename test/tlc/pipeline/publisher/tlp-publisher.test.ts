import sinon, { SinonStubbedInstance } from "sinon";
import { TLPClient } from "@app/client/tlp/tlp-client";
import { TLPPublisher } from "@app/pipeline/publisher/tlp-publisher";
import TLPLogMessage from "@app/client/tlp";

describe("Unit tests for TLPPublisher", () => {

    let tlpClientMock: SinonStubbedInstance<TLPClient>
    let tlpPublisher: TLPPublisher;

    beforeEach(() => {
        tlpClientMock = sinon.createStubInstance(TLPClient);
        tlpPublisher = new TLPPublisher(tlpClientMock);
    });

    describe("Test scenarios for #publish", () => {

        it("should publish log message via TLPClient", () => {

            // given
            const logMessage = { content: "log message 1" } as TLPLogMessage;

            // when
            tlpPublisher.publish(logMessage);

            // then
            sinon.assert.calledWith(tlpClientMock.submitLog, logMessage);
        });
    });
});
