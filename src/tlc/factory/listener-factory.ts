import { ListenerType } from "@app/config/pipeline-options";
import { PipelineConfig } from "@app/config";
import Listener from "@app/pipeline/listener";
import DockerLogsApiListener from "@app/pipeline/listener/docker-logs-api-listener";
import { DockerEngineApiClient, dockerEngineAPIClient } from "@app/client/docker/docker-engine-api-client";

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

        return new Map([
            [ListenerType.DOCKER, pipelineConfig => new DockerLogsApiListener(dockerEngineAPIClient, pipelineConfig.listenerConfig!.containerName)]
        ]);
    }
}

export const listenerFactory = new ListenerFactory(dockerEngineAPIClient);
