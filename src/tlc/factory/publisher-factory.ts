import { PipelineConfig } from "@app/config";
import Publisher from "@app/pipeline/publisher";
import { PublisherType } from "@app/config/pipeline-options";
import { ConsolePublisher, consolePublisher } from "@app/pipeline/publisher/console-publisher";
import { TLPPublisher, tlpPublisher } from "@app/pipeline/publisher/tlp-publisher";

type PublisherMap = Map<PublisherType, Publisher<any>>;

/**
 * Factory implementation providing the proper publisher instances based on the pipeline configuration.
 */
export class PublisherFactory {

    private readonly publisherMap: PublisherMap;

    constructor(consolePublisher: ConsolePublisher, tlpPublisher: TLPPublisher) {
        this.publisherMap = this.initPublisherMap(consolePublisher, tlpPublisher);
    }

    /**
     * Returns a list of publishers based on the pipeline configuration.
     *
     * @param pipelineConfig PipelineConfig object
     */
    public getPublishers(pipelineConfig: PipelineConfig): Publisher<any>[] {

        return pipelineConfig.publishers
            .map(publisher => this.publisherMap.get(publisher)!);
    }

    private initPublisherMap(consolePublisher: ConsolePublisher, tlpPublisher: TLPPublisher): PublisherMap {

        return new Map([
            [PublisherType.CONSOLE, consolePublisher],
            [PublisherType.TLP, tlpPublisher]
        ]);
    }
}

export const publisherFactory = new PublisherFactory(consolePublisher, tlpPublisher);
