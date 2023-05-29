import { PipelineConfig } from "@app/config";
import Parser from "@app/pipeline/parser";
import { ParserType } from "@app/config/pipeline-options";
import { ByteArrayParser, byteArrayParser } from "@app/pipeline/parser/byte-array-parser";
import JoiningJsonParser from "@app/pipeline/parser/joining-json-parser";

type ParserMap = Map<ParserType, Parser<any, any>>;

/**
 * Factory implementation providing the proper parser instances based on the pipeline configuration.
 */
export class ParserFactory {

    private readonly parserMap: ParserMap;

    constructor(byteArrayParser: ByteArrayParser) {
        this.parserMap = this.initParserMap(byteArrayParser);
    }

    /**
     * Returns a list of parsers based on the pipeline configuration.
     *
     * @param pipelineConfig PipelineConfig object
     */
    public getParsers(pipelineConfig: PipelineConfig): Parser<any, any>[] {

        return pipelineConfig.parsers
            .map(parser => this.parserMap.get(parser)!);
    }

    private initParserMap(byteArrayParser: ByteArrayParser): ParserMap {

        return new Map<ParserType, Parser<any, any>>([
            [ParserType.BYTE_ARRAY, byteArrayParser],
            [ParserType.JOINING_JSON, new JoiningJsonParser()]
        ]);
    }
}

export const parserFactory = new ParserFactory(byteArrayParser);