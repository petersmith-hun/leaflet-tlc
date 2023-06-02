import { ParserFactory } from "@app/factory/parser-factory";
import { ByteArrayParser } from "@app/pipeline/parser/byte-array-parser";
import { PipelineConfig } from "@app/config";
import { ParserType } from "@app/config/pipeline-options";
import JoiningJsonParser from "@app/pipeline/parser/joining-json-parser";

describe("Unit tests for ParserFactory", () => {

    const byteArrayParser = new ByteArrayParser();
    let parserFactory: ParserFactory;

    beforeEach(() => {
        parserFactory = new ParserFactory(byteArrayParser);
    });

    describe("Test scenarios for #getParsers", () => {

        it("should return a byte array parser", () => {

            // given
            const pipelineConfig = preparePipelineConfig(ParserType.BYTE_ARRAY);

            // when
            const result = parserFactory.getParsers(pipelineConfig);

            // then
            expect(result.length).toBe(1);
            expect(result[0]).toStrictEqual(byteArrayParser);
        });

        it("should return a joining json parser", () => {

            // given
            const pipelineConfig = preparePipelineConfig(ParserType.JOINING_JSON);

            // when
            const result = parserFactory.getParsers(pipelineConfig);

            // then
            expect(result.length).toBe(1);
            expect(result[0]).toBeInstanceOf(JoiningJsonParser);
        });

        it("should return all parsers in order (byte array first)", () => {

            // given
            const pipelineConfig = preparePipelineConfig(ParserType.BYTE_ARRAY, ParserType.JOINING_JSON);

            // when
            const result = parserFactory.getParsers(pipelineConfig);

            // then
            expect(result.length).toBe(2);
            expect(result[0]).toStrictEqual(byteArrayParser);
            expect(result[1]).toBeInstanceOf(JoiningJsonParser);
        });

        it("should return all parsers in order (joining json first)", () => {

            // given
            const pipelineConfig = preparePipelineConfig(ParserType.JOINING_JSON, ParserType.BYTE_ARRAY);

            // when
            const result = parserFactory.getParsers(pipelineConfig);

            // then
            expect(result.length).toBe(2);
            expect(result[0]).toBeInstanceOf(JoiningJsonParser);
            expect(result[1]).toStrictEqual(byteArrayParser);
        });

        it("should return the same byte array parser instances on consecutive calls", () => {

            // given
            const pipelineConfig = preparePipelineConfig(ParserType.BYTE_ARRAY);

            // when
            const resultFirst = parserFactory.getParsers(pipelineConfig);
            const resultSecond = parserFactory.getParsers(pipelineConfig);

            // then
            expect(resultFirst[0] === resultSecond[0]).toBe(true);
        });

        it("should return different joining json parser instances on consecutive calls", () => {

            // given
            const pipelineConfig = preparePipelineConfig(ParserType.JOINING_JSON);

            // when
            const resultFirst = parserFactory.getParsers(pipelineConfig);
            const resultSecond = parserFactory.getParsers(pipelineConfig);

            // then
            expect(resultFirst[0] === resultSecond[0]).toBe(false);
        });

        function preparePipelineConfig(...parsers: ParserType[]): PipelineConfig {
            return { parsers: parsers } as unknown as PipelineConfig;
        }
    });
});
