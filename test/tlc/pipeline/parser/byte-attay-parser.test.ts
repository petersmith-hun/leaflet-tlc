import { ByteArrayParser } from "@app/pipeline/parser/byte-array-parser";
import { blockExecution } from "@test/util";

describe("Unit tests for ByteArrayParser", () => {

    let byteArrayParser: ByteArrayParser;

    beforeEach(() => {
        byteArrayParser = new ByteArrayParser();
    });

    describe("Test scenarios for #parse", () => {

        it("should successfully parse the passed data and return it via subscriber", () => {

            // given
            const data = "this is an input string";
            const inputData = Buffer.from(data, "utf8");

            // when
            const result = byteArrayParser.parse(inputData);

            // then
            let subscriberCalledWith = "";
            result.subscribe(value => { subscriberCalledWith = value; });
            expect(subscriberCalledWith).toBe(data);
        });

        it("should skip the data on parsing error", async () => {

            // given
            const data = { data: "something is off" };

            // when
            // @ts-ignore
            const result = byteArrayParser.parse(data);

            // then
            let subscriberCalled = false;
            result.subscribe(() => {
                subscriberCalled = true;
            });
            await blockExecution();
            expect(subscriberCalled).toBe(false);
        });
    });
});
