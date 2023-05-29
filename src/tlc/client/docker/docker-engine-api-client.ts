import axios, { AxiosResponse } from "axios";
import { IncomingMessage } from "http";
import { DockerConnection, DockerConnectionType, SystemConfig } from "@app/config";
import { ContainerDefinition } from "@app/client/docker/index";
import { configurationProvider, ConfigurationProvider } from "@app/config/configuration-provider";

enum DockerEnginePath {
    CONTAINERS = "/v1.41/containers/json?all=true",
    CONTAINER_LOGS = "/v1.41/containers/{id}/logs?stdout=true&follow=true&since={since}"
}

/**
 * API client implementation for communicating with the Docker Engine.
 * Implementation is using Axios as the network client, and is able to the engine via UNIX socket (recommended)
 * and TCP (HTTP) protocol as well.
 * @see DockerConnection
 */
export class DockerEngineApiClient {

    private readonly dockerConnection: DockerConnection;
    private readonly systemConfig: SystemConfig;

    constructor(configurationProvider: ConfigurationProvider) {
        this.dockerConnection = configurationProvider.dockerConnection;
        this.systemConfig = configurationProvider.systemConfig;
    }

    /**
     * Retrieves the list of existing containers (regardless of their status).
     */
    public getContainers(): Promise<AxiosResponse<ContainerDefinition[]>> {
        return this.callDockerEngine(DockerEnginePath.CONTAINERS, false);
    }

    /**
     * Connects to the specified log stream and returns an IncomingMessage that can be used to read the streaming data.
     * @param container ContainerDefinition object containing the ID of the container to connect the log stream of
     */
    public getLogStream(container: ContainerDefinition): Promise<AxiosResponse<IncomingMessage>> {

        const logsPath = DockerEnginePath.CONTAINER_LOGS
            .replace("{id}", container.Id)
            .replace("{since}", this.calculateSinceParameter());

        return this.callDockerEngine(logsPath, true);
    }

    private calculateSinceParameter(): string {

        const sinceInMs = new Date().getTime() - this.systemConfig.reconnectionPollRate;
        const since = Math.floor(sinceInMs / 1000);

        return since.toString();
    }

    private callDockerEngine<T>(path: string, streaming: boolean = false): Promise<AxiosResponse<T>> {

        return axios.request({
            socketPath: this.dockerConnection.connectionType === DockerConnectionType.SOCKET ? this.dockerConnection.uri : undefined,
            baseURL: this.dockerConnection.connectionType === DockerConnectionType.TCP ? this.dockerConnection.uri : undefined,
            method: "get",
            url: path,
            responseType: streaming ? "stream" : "json",
            validateStatus: () => true,
            headers: {
                Host: null,
                Accept: "*/*"
            }
        })
    }
}

export const dockerEngineAPIClient = new DockerEngineApiClient(configurationProvider);
