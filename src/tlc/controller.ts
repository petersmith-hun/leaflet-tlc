import { Subject } from "rxjs";
import configurationProvider from "@app/config/configuration-provider";
import PipelineFactory from "@app/factory/pipeline-factory";
import Pipeline from "@app/pipeline";
import log from "@app/util/simple-logger";

/**
 * Logic initializing and controlling the log processing pipelines.
 */
class Controller {

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

        const disconnectionSubject = new Subject<string>();
        const pipelineFactory = PipelineFactory.create(disconnectionSubject);

        const pipelines: Pipeline[] = configurationProvider.pipelines
            .filter(pipelineConfig => pipelineConfig.enabled)
            .map(pipelineConfig => pipelineFactory.createPipeline(pipelineConfig))

        this.attachDisconnectionSubject(pipelines, disconnectionSubject);
        this.startPipelines(pipelines);
    }

    private attachDisconnectionSubject(pipelines: Pipeline[], disconnectionSubject: Subject<string>): void {

        disconnectionSubject.subscribe(logStreamName => {
            log.warn(`Trying to reconnect pipeline [${logStreamName}]`)
            pipelines.find(pipeline => pipeline.logStreamName === logStreamName)?.start()
        });
    }

    private startPipelines(pipelines: Pipeline[]): void {
        pipelines.forEach(pipeline => pipeline.start())
    }
}

const controller = new Controller();
export default controller;
