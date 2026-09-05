import { dockerEngineAPIClient, DockerEngineApiClient } from "@app/client/docker/docker-engine-api-client";
import { DockerListenerConfig, PipelineConfig } from "@app/config";
import Listener from "@app/pipeline/listener";
import DockerLogsApiListener from "@app/pipeline/listener/docker-logs-api-listener";
import { AxiosResponse } from "axios";
import { ContainerDefinition } from "@app/client/docker";

/**
 * Factory implementation providing the proper DockerLogsApiListener instances based on the pipeline configuration.
 */
export class DockerLogsApiListenerFactory {

    private readonly dockerEngineAPIClient: DockerEngineApiClient;

    constructor(dockerEngineAPIClient: DockerEngineApiClient) {
        this.dockerEngineAPIClient = dockerEngineAPIClient;
    }

    /**
     * Creates one or more DockerLogsApiListener instances based on the given pipeline configuration. The listener
     * implementation will be able to collect logs from the specified Docker container(s).
     *
     * @param pipelineConfig PipelineConfig object
     */
    public async createListeners(pipelineConfig: PipelineConfig): Promise<Listener<any>[]> {

        return this.dockerEngineAPIClient.getContainers()
            .then(response => this.filterRequiredContainers(pipelineConfig, response))
            .then(definitions => definitions
                .map(definition => new DockerLogsApiListener(this.dockerEngineAPIClient, definition.Names[0])));
    }

    private filterRequiredContainers(pipelineConfig: PipelineConfig, containerDefinitions: AxiosResponse<ContainerDefinition[]>): ContainerDefinition[] {

        const [containerName, multiInstanceMatch] = this.getExpectedContainerName(pipelineConfig);

        const containers = containerDefinitions.data
            .filter(definition => multiInstanceMatch
                ? definition.Names.some(name => name.startsWith(containerName))
                : definition.Names.includes(containerName));

        if (!containers.length) {
            throw new Error(`No matching container found by name '${containerName}'`);
        }

        return containers;
    }

    private getExpectedContainerName(pipelineConfig: PipelineConfig): [string, boolean] {

        let multiInstanceMatch = false;
        let containerName = (pipelineConfig.listenerConfig as DockerListenerConfig).containerName;
        containerName = containerName.startsWith("/") ? containerName : `/${containerName}`

        if (containerName.endsWith("*")) {
            multiInstanceMatch = true;
            containerName = containerName.substring(0, containerName.length - 1);
        }


        return [containerName, multiInstanceMatch];
    }
}

export const dockerLogsApiListenerFactory = new DockerLogsApiListenerFactory(dockerEngineAPIClient);
