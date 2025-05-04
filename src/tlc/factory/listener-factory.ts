import { ListenerType } from "@app/config/pipeline-options";
import { DockerListenerConfig, FileListenerConfig, PipelineConfig } from "@app/config";
import Listener from "@app/pipeline/listener";
import DockerLogsApiListener from "@app/pipeline/listener/docker-logs-api-listener";
import { DockerEngineApiClient, dockerEngineAPIClient } from "@app/client/docker/docker-engine-api-client";
import FileListener from "@app/pipeline/listener/file-listener";

type ListenerMap = Map<ListenerType, (pipelineConfig: PipelineConfig) => Listener<any>>;

/**
 * Factory implementation providing the proper listener instance based on the pipeline configuration.
 */
export class ListenerFactory {

    private readonly listenerMap: ListenerMap;

    constructor(dockerEngineAPIClient: DockerEngineApiClient) {
        this.listenerMap = this.initListenerMap(dockerEngineAPIClient);
    }

    /**
     * Returns a listener based on the pipeline configuration.
     *
     * @param pipelineConfig PipelineConfig object
     */
    public getListener(pipelineConfig: PipelineConfig): Listener<any> {
        return this.listenerMap.get(pipelineConfig.listenerType)!(pipelineConfig);
    }

    private initListenerMap(dockerEngineAPIClient: DockerEngineApiClient): ListenerMap {

        // @ts-ignore
        return new Map([
            [ListenerType.DOCKER, pipelineConfig =>
                new DockerLogsApiListener(dockerEngineAPIClient, (pipelineConfig.listenerConfig as DockerListenerConfig).containerName)],
            [ListenerType.FILE, pipelineConfig =>
                new FileListener((pipelineConfig.listenerConfig as FileListenerConfig).sourceFilePath)]
        ]);
    }
}

export const listenerFactory = new ListenerFactory(dockerEngineAPIClient);
