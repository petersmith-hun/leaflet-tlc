import { Subject } from "rxjs";
import { configurationProvider, ConfigurationProvider } from "@app/config/configuration-provider";
import { PipelineFactory, pipelineFactory } from "@app/factory/pipeline-factory";
import Pipeline from "@app/pipeline";
import log from "@app/util/simple-logger";

/**
 * Logic initializing and controlling the log processing pipelines.
 */
export class Controller {

    private readonly disconnectionSubject: Subject<string>;
    private readonly configurationProvider: ConfigurationProvider;
    private readonly pipelineFactory: PipelineFactory;

    constructor(disconnectionSubject: Subject<string>, configurationProvider: ConfigurationProvider,
                pipelineFactory: PipelineFactory) {

        this.disconnectionSubject = disconnectionSubject;
        this.configurationProvider = configurationProvider;
        this.pipelineFactory = pipelineFactory;
    }

    /**
     * Initializes all pipelines. It does the following steps:
     *  1) Creates the disconnection subject to be passed to the pipelines;
     *  2) Reads the configuration;
     *  3) Creates the PipelineFactory instance;
     *  4) Creates the pipelines using the factory, based on the configuration;
     *  5) Attaches the disconnection subject to the pipelines;
     *  6) Finally, starts the pipelines.
     */
    init(): void {

        const pipelines: Pipeline[] = this.configurationProvider.pipelines
            .filter(pipelineConfig => pipelineConfig.enabled)
            .map(pipelineConfig => this.pipelineFactory.createPipeline(pipelineConfig, this.disconnectionSubject))

        this.attachDisconnectionSubject(pipelines);
        this.startPipelines(pipelines);
    }

    private attachDisconnectionSubject(pipelines: Pipeline[]): void {

        this.disconnectionSubject.subscribe(logStreamName => {
            log.warn(`Trying to reconnect pipeline [${logStreamName}]`)
            pipelines.find(pipeline => pipeline.logStreamName === logStreamName)?.start()
        });
    }

    private startPipelines(pipelines: Pipeline[]): void {
        pipelines.forEach(pipeline => pipeline.start())
    }
}

export const controller = new Controller(
    new Subject<string>(),
    configurationProvider,
    pipelineFactory
);
