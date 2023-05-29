import { Subject } from "rxjs";
import Pipeline from "@app/pipeline";
import log from "@app/util/simple-logger";
import { PipelineConfig } from "@app/config";
import { configurationProvider, ConfigurationProvider } from "@app/config/configuration-provider";
import { listenerFactory, ListenerFactory } from "@app/factory/listener-factory";
import { mapperFactory, MapperFactory } from "@app/factory/mapper-factory";
import { parserFactory, ParserFactory } from "@app/factory/parser-factory";
import { publisherFactory, PublisherFactory } from "@app/factory/publisher-factory";

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
     * Creates a pipeline definition based on the provided configuration.
     * The following steps will be done:
     *  - Sets the pipeline's name to the provided log stream name;
     *  - Sets up the listener, parsers, mapper and the publishers;
     *  - And passes the disconnection subject to the pipeline.
     *
     * @param pipelineConfig PipelineConfig object containing the configuration of log collection pipeline
     * @param disconnectionSubject Rx Subject instance for pipelines to send stream disconnection notifications to the controller
     */
    public createPipeline(pipelineConfig: PipelineConfig, disconnectionSubject: Subject<string>): Pipeline {

        log.info(`Creating pipeline with name [${pipelineConfig.logStreamName}] on source stream of type [${pipelineConfig.listenerType}]`);

        return new Pipeline(
            pipelineConfig.logStreamName,
            this.listenerFactory.getListener(pipelineConfig),
            this.parserFactory.getParsers(pipelineConfig),
            this.mapperFactory.getMapper(pipelineConfig),
            this.publisherFactory.getPublishers(pipelineConfig),
            disconnectionSubject,
            this.configurationProvider
        );
    }
}

export const pipelineFactory = new PipelineFactory(configurationProvider, listenerFactory, parserFactory, mapperFactory, publisherFactory);
