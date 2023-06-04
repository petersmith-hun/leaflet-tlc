import { ConsolePublisher } from "@app/pipeline/publisher/console-publisher";
import sinon, { SinonSpy } from "sinon";
import log from "@app/util/simple-logger";

describe("Unit tests for ConsolePublisher", () => {

    let logStub: SinonSpy;
    let consolePublisher: ConsolePublisher;

    beforeEach(() => {
        logStub = sinon.stub(log, "info");
        consolePublisher = new ConsolePublisher();
    });

    afterEach(() => {
        logStub.restore();
    })

    describe("Test scenarios for #publish", () => {

        it("should log strings directly to the console", () => {

            // given
            const data = "this is a simple string";

            // when
            consolePublisher.publish(data);

            // then
            sinon.assert.calledWith(logStub, data);
        });

        it("should log objects as JSON string to the console", () => {

            // given
            const data = { message: "something", level: "INFO" };
            const dataAsJSON = JSON.stringify(data);

            // when
            consolePublisher.publish(data);

            // then
            sinon.assert.calledWith(logStub, dataAsJSON);
        });
    });
});
