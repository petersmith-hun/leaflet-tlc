import { ListenerType } from "@app/config/pipeline-options";
import { FileListenerConfig, PipelineConfig } from "@app/config";
import Listener from "@app/pipeline/listener";
import FileListener from "@app/pipeline/listener/file-listener";
import {
    dockerLogsApiListenerFactory,
    DockerLogsApiListenerFactory
} from "@app/factory/docker-logs-api-listener-factory";

type ListenerMap = Map<ListenerType, (pipelineConfig: PipelineConfig) => Listener<any>[]>;

/**
 * Factory implementation providing the proper listener instance based on the pipeline configuration.
 */
export class ListenerFactory {

    private readonly listenerMap: ListenerMap;

    constructor(dockerLogsApiListenerFactory: DockerLogsApiListenerFactory) {
        this.listenerMap = this.initListenerMap(dockerLogsApiListenerFactory);
    }

    /**
     * Returns a listener based on the pipeline configuration. May return multiple listeners based on the configuration.
     *
     * @param pipelineConfig PipelineConfig object
     */
    public async getListeners(pipelineConfig: PipelineConfig): Promise<Listener<any>[]> {
        return this.listenerMap.get(pipelineConfig.listenerType)!(pipelineConfig);
    }

    private initListenerMap(dockerLogsApiListenerFactory: DockerLogsApiListenerFactory): ListenerMap {

        // @ts-ignore
        return new Map([
            [ListenerType.DOCKER, async pipelineConfig =>
                await dockerLogsApiListenerFactory.createListeners(pipelineConfig)],
            [ListenerType.FILE, pipelineConfig =>
                [new FileListener((pipelineConfig.listenerConfig as FileListenerConfig).sourceFilePath)]]
        ]);
    }
}

export const listenerFactory = new ListenerFactory(dockerLogsApiListenerFactory);
