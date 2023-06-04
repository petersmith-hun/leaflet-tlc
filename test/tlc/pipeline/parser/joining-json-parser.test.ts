import JoiningJsonParser from "@app/pipeline/parser/joining-json-parser";
import { Observable } from "rxjs";

describe("Unit tests for JoiningJsonParser", () => {

    let joiningJsonParser: JoiningJsonParser;

    beforeEach(() => {
        joiningJsonParser = new JoiningJsonParser();
    });

    describe("Test scenarios for #parse", () => {

        it("should return JSON document via subscriber from a single piece of data", () => {

            // given
            const expectedOutput = { content: "This is a log message", level: "INFO" };
            const jsonInput = `${JSON.stringify(expectedOutput)}\n`;

            // when
            const result = joiningJsonParser.parse(jsonInput);

            // then
            expect(getValues(result)).toStrictEqual([expectedOutput]);
        });

        it("should split multiple JSON documents sent at once then return them one-by-one via subscriber", () => {

            // given
            const expectedOutput1 = { content: "This is a log message", level: "INFO" };
            const expectedOutput2 = { content: "This is another log message", level: "ERROR" };
            const expectedOutput3 = { content: "This is the third log message", level: "WARN" };
            const jsonInput = `${JSON.stringify(expectedOutput1)}\n${JSON.stringify(expectedOutput2)}\n${JSON.stringify(expectedOutput3)}\n`;

            // when
            const result = joiningJsonParser.parse(jsonInput);

            // then
            expect(getValues(result)).toStrictEqual([
                expectedOutput1,
                expectedOutput2,
                expectedOutput3
            ]);
        });

        it("should await all pieces of JSON document and then return it via subscriber", () => {

            // given
            const expectedOutput = { content: "This is a log message", level: "INFO" };
            const jsonInput = `${JSON.stringify(expectedOutput)}\n`;

            // when
            joiningJsonParser.parse(jsonInput.slice(0, 20)).subscribe(() => {});
            const result = joiningJsonParser.parse(jsonInput.slice(20));

            // then
            expect(getValues(result)).toStrictEqual([expectedOutput]);
        });

        it("should drop invalid JSON document", () => {

            // given
            const jsonInput = `INFO This is a standard log message\n`;

            // when
            const result = joiningJsonParser.parse(jsonInput);

            // then
            expect(getValues(result)).toStrictEqual([]);
        });

        function getValues(observable: Observable<object>): object[] {

            let subscriberCalledWith: object[] = [];
            observable.subscribe(value => { subscriberCalledWith.push(value); });

            return subscriberCalledWith;
        }
    });
});
