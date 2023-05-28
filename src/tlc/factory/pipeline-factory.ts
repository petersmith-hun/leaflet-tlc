import { Subject } from "rxjs";
import DockerLogsApiListener from "@app/pipeline/listener/docker-logs-api-listener";
import ByteArrayParser from "@app/pipeline/parser/byte-array-parser";
import JoiningJsonParser from "@app/pipeline/parser/joining-json-parser";
import ConsolePublisher from "@app/pipeline/publisher/console-publisher";
import Pipeline from "@app/pipeline";
import log from "@app/util/simple-logger";
import Mapper from "@app/pipeline/mapper";
import IdentityMapper from "@app/pipeline/mapper/identity-mapper";
import LogstashToTLPMapper from "@app/pipeline/mapper/logstash-to-tlp-mapper";
import Publisher from "@app/pipeline/publisher";
import Listener from "@app/pipeline/listener";
import Parser from "@app/pipeline/parser";
import TLPPublisher from "@app/pipeline/publisher/tlp-publisher";
import CustomToTLPMapper from "@app/pipeline/mapper/custom-to-tlp-mapper";
import { ListenerType, MapperType, ParserType, PublisherType } from "@app/config/pipeline-options";
import { PipelineConfig } from "@app/config";

/**
 * Factory implementation creating pipeline definitions based on the provided pipeline configuration.
 */
export default class PipelineFactory {

    private readonly listenerMap = new Map<ListenerType, (pipelineConfig: PipelineConfig) => Listener<any>>([
        [ListenerType.DOCKER, pipelineConfig => DockerLogsApiListener.getInstance(pipelineConfig.listenerConfig!.containerName)]
    ]);

    private readonly parserMap = new Map<ParserType, Parser<any, any>>([
        [ParserType.BYTE_ARRAY, ByteArrayParser.getInstance()],
        [ParserType.JOINING_JSON, JoiningJsonParser.getInstance()]
    ]);

    private readonly mapperMap = new Map<MapperType, (pipelineConfig: PipelineConfig) => Mapper<any, any>>([
        [MapperType.IDENTITY, _ => IdentityMapper.getInstance()],
        [MapperType.LOGSTASH_TO_TLP, pipelineConfig => LogstashToTLPMapper.getInstance(pipelineConfig.logStreamName)],
        [MapperType.CUSTOM_TO_TLP, pipelineConfig => CustomToTLPMapper.getInstance(pipelineConfig)]
    ]);

    private readonly publisherMap = new Map<PublisherType, Publisher<any>>([
        [PublisherType.CONSOLE, ConsolePublisher.getInstance()],
        [PublisherType.TLP, TLPPublisher.getInstance()]
    ]);

    private static instance: PipelineFactory;

    private readonly disconnectionSubject: Subject<string>;

    private constructor(disconnectionSubject: Subject<string>) {
        this.disconnectionSubject = disconnectionSubject;
    }

    /**
     * Returns a singleton instance of the PipelineFactory.
     * @param disconnectionSubject RxJS Subject for disconnection notifications.
     */
    public static getInstance(disconnectionSubject: Subject<string>): PipelineFactory {

        if (!PipelineFactory.instance) {
            PipelineFactory.instance = new PipelineFactory(disconnectionSubject);
        }

        return PipelineFactory.instance;
    }

    /**
     * Creates a pipeline definition based on the provided configuration.
     * The following steps will be done:
     *  - Sets the pipeline's name to the provided log stream name;
     *  - Sets up the listener, parsers, mapper and the publishers;
     *  - And passes the disconnection subject to the pipeline.
     *
     * @param pipelineConfig
     */
    public createPipeline(pipelineConfig: PipelineConfig): Pipeline {

        log.info(`Creating pipeline with name [${pipelineConfig.logStreamName}] on source stream of type [${pipelineConfig.listenerType}]`);

        return new Pipeline(
            pipelineConfig.logStreamName,
            this.getListener(pipelineConfig),
            this.getParsers(pipelineConfig),
            this.getMapper(pipelineConfig),
            this.getPublishers(pipelineConfig),
            this.disconnectionSubject
        );
    }

    private getListener(pipelineConfig: PipelineConfig): Listener<any> {
        return this.listenerMap.get(pipelineConfig.listenerType)!(pipelineConfig);
    }

    private getParsers(pipelineConfig: PipelineConfig): Parser<any, any>[] {

        return pipelineConfig.parsers
            .map(parser => this.parserMap.get(parser)!);
    }

    private getMapper(pipelineConfig: PipelineConfig): Mapper<any, any> {
        return this.mapperMap.get(pipelineConfig.mapperType)!(pipelineConfig);
    }

    private getPublishers(pipelineConfig: PipelineConfig): Publisher<any>[] {

        return pipelineConfig.publishers
            .map(publisher => this.publisherMap.get(publisher)!);
    }
}
