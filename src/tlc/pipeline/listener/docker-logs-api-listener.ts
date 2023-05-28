import { AxiosResponse } from "axios";
import { IncomingMessage } from "http";
import { Observable } from "rxjs";
import Listener from "@app/pipeline/listener/index";
import DockerEngineApiClient from "@app/client/docker/docker-engine-api-client";
import { ContainerDefinition } from "@app/client/docker";
import log from "@app/util/simple-logger";

/**
 * Listener implementation to collect logs from Docker Engine log stream API. On a successful read, it emits a slice of
 * data as byte array. If the Docker Engine stops producing data, or read operation raises an error, subscription is completed.
 */
export default class DockerLogsApiListener implements Listener<Uint8Array> {

    private readonly dockerEngineApiClient: DockerEngineApiClient;
    readonly containerName: string;

    private constructor(containerName: string) {
        this.containerName = containerName.startsWith("/") ? containerName : `/${containerName}`;
        this.dockerEngineApiClient = DockerEngineApiClient.getInstance();
    }

    /**
     * Returns a prototype instance of the DockerLogsApiListener.
     * @param containerName name of the container to attach this listener to
     */
    public static getInstance(containerName: string): DockerLogsApiListener {
        return new DockerLogsApiListener(containerName);
    }

    listen(): Observable<Uint8Array> {

        return new Observable(subscriber => {
            this.initListener()
                .then(logStream => logStream.data
                    .on("data", (line: any) => subscriber.next(line))
                    .on("end", () => subscriber.complete())
                )
                .catch(reason => {
                    log.error(`Failed to initialize listener for container: ${this.containerName}; reason=${reason}`);
                    subscriber.complete();
                });
        });
    }

    private initListener(): Promise<AxiosResponse<IncomingMessage>> {

        return this.dockerEngineApiClient.getContainers()
            .then(containerDefinitions => this.extractRequiredContainer(containerDefinitions))
            .then(container => this.dockerEngineApiClient.getLogStream(container));
    }

    private extractRequiredContainer(containerDefinitions: AxiosResponse<ContainerDefinition[]>): ContainerDefinition {

        const container = containerDefinitions.data
            .find(definition => definition.Names.includes(this.containerName));

        if (!container) {
            throw new Error(`Container [${this.containerName}] not found`);
        }

        return container;
    }
}
