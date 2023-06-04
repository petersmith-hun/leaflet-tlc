import TLPLogMessage from "@app/client/tlp";
import { TLPClient } from "@app/client/tlp/tlp-client";
import { ConfigurationProvider } from "@app/config/configuration-provider";
import log from "@app/util/simple-logger";
import sinon, { SinonStub } from "sinon";
import axios from "axios";
import { blockExecution } from "@test/util";

describe("Unit tests for TLPClient", () => {

    const tlpLogMessage = { content: "This is a log message" } as unknown as TLPLogMessage;

    let configurationProvider: ConfigurationProvider;
    let axiosStub: SinonStub;
    let logStub: SinonStub;
    let tlpClient: TLPClient;

    beforeEach(() => {
        configurationProvider = { tlpConnection: { uri: "http://localhost:9999/tlp" } } as unknown as ConfigurationProvider;
        tlpClient = new TLPClient(configurationProvider);
        axiosStub.reset();
        logStub.reset();
    });

    beforeAll(() => {
        axiosStub = sinon.stub(axios, "post");
        logStub = sinon.stub(log, "error");
    });

    afterAll(() => {
        axiosStub.restore();
        logStub.restore();
    });
    
    describe("Test scenarios #submitLog", () => {

        it("should submit log and not wait for the response", async () => {

            // given
            axiosStub.withArgs("http://localhost:9999/tlp/logs", tlpLogMessage).resolves();

            // when
            tlpClient.submitLog(tlpLogMessage);

            // then
            sinon.assert.callCount(axiosStub, 1);
        });

        it("should submit log and log error", async () => {

            // given
            axiosStub.withArgs("http://localhost:9999/tlp/logs", tlpLogMessage).rejects(new Error("Something went wrong"));

            // when
            tlpClient.submitLog(tlpLogMessage);
            await blockExecution();

            // then
            sinon.assert.callCount(axiosStub, 1);
            sinon.assert.calledWith(logStub, "Failed to transfer log message to TLP; reason=Something went wrong")
        });
    });
});
