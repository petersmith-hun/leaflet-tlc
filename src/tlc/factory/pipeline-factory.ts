import { Subject } from "rxjs";
import Pipeline from "@app/pipeline";
import log from "@app/util/simple-logger";
import { PipelineConfig } from "@app/config";
import { configurationProvider, ConfigurationProvider } from "@app/config/configuration-provider";
import { listenerFactory, ListenerFactory } from "@app/factory/listener-factory";
import { mapperFactory, MapperFactory } from "@app/factory/mapper-factory";
import { parserFactory, ParserFactory } from "@app/factory/parser-factory";
import { publisherFactory, PublisherFactory } from "@app/factory/publisher-factory";
import { randomUUID } from "node:crypto";

/**
 * Factory implementation creating pipeline definitions based on the provided pipeline configuration.
 */
export class PipelineFactory {

    private readonly configurationProvider: ConfigurationProvider;
    private readonly listenerFactory: ListenerFactory;
    private readonly parserFactory: ParserFactory;
    private readonly mapperFactory: MapperFactory;
    private readonly publisherFactory: PublisherFactory;

    constructor(configurationProvider: ConfigurationProvider, listenerFactory: ListenerFactory,
                parserFactory: ParserFactory, mapperFactory: MapperFactory,
                publisherFactory: PublisherFactory) {
        this.configurationProvider = configurationProvider;
        this.listenerFactory = listenerFactory;
        this.parserFactory = parserFactory;
        this.mapperFactory = mapperFactory;
        this.publisherFactory = publisherFactory;
    }

    /**
     * Creates one or more pipeline definitions based on the provided configuration.
     * The following steps will be done:
     *  - Sets the pipeline's name to the provided log stream name with a random suffix;
     *  - Sets up the listener, parsers, mappers, and the publishers;
     *  - And passes the disconnection subject to the pipeline.
     * Docker log streams support connecting to multiple containers using the * suffix in their name. In such cases,
     * one pipeline will be created for each container.
     *
     * @param pipelineConfig PipelineConfig object containing the configuration of log collection pipeline
     * @param disconnectionSubject Rx Subject instance for pipelines to send stream disconnection notifications to the controller
     */
    public async createPipeline(pipelineConfig: PipelineConfig, disconnectionSubject: Subject<string>): Promise<Pipeline[]> {

        return (await this.listenerFactory.getListeners(pipelineConfig)).map(listener => {

            const pipelineName = `${pipelineConfig.logStreamName}-${randomUUID().substring(0, 4)}`;

            log.info(`Creating pipeline with name [${pipelineName}] on source stream of type [${pipelineConfig.listenerType}]`);

            return new Pipeline(
                pipelineName,
                listener,
                this.parserFactory.getParsers(pipelineConfig),
                this.mapperFactory.getMapper(pipelineConfig),
                this.publisherFactory.getPublishers(pipelineConfig),
                disconnectionSubject,
                this.configurationProvider
            );
        })
    }
}

export const pipelineFactory = new PipelineFactory(configurationProvider, listenerFactory, parserFactory, mapperFactory, publisherFactory);
