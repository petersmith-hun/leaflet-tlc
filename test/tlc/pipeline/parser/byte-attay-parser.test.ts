import { SystemConfig } from "@app/config";
import { ByteArrayParser } from "@app/pipeline/parser/byte-array-parser";
import { blockExecution } from "@test/util";

describe("Unit tests for ByteArrayParser", () => {

    let byteArrayParser: ByteArrayParser;

    describe("Test scenarios for #parse", () => {

        it("should successfully parse the passed data without stdout header and return it via subscriber", () => {

            // given
            prepareByteArrayParser(false);
            const data = "this is an input string";
            const inputData = Buffer.from(data, "utf8");

            // when
            const result = byteArrayParser.parse(inputData);

            // then
            let subscriberCalledWith = "";
            result.subscribe(value => { subscriberCalledWith = value; });
            expect(subscriberCalledWith).toBe(data);
        });

        it("should successfully parse the passed data with stdout header and return it via subscriber", () => {

            // given
            prepareByteArrayParser(true);
            const data = "this is an input string";
            const header = "*header*";
            const inputData = Buffer.from(header + data, "utf8");

            // when
            const result = byteArrayParser.parse(inputData);

            // then
            let subscriberCalledWith = "";
            result.subscribe(value => { subscriberCalledWith = value; });
            expect(subscriberCalledWith).toBe(data);
        });

        it("should skip the data on parsing error", async () => {

            // given
            prepareByteArrayParser(false);
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

    function prepareByteArrayParser(withTrimmingEnabled: boolean): void {
        byteArrayParser = new ByteArrayParser({ enableTrimmingStdoutHeader: withTrimmingEnabled } as SystemConfig)
    }
});
