import { AxiosResponse } from "axios";
import { IncomingMessage } from "http";
import { Observable } from "rxjs";
import Listener from "@app/pipeline/listener/index";
import { ContainerDefinition } from "@app/client/docker";
import log from "@app/util/simple-logger";
import { DockerEngineApiClient } from "@app/client/docker/docker-engine-api-client";

/**
 * Listener implementation to collect logs from Docker Engine log stream API. On a successful read, it emits a slice of
 * data as byte array. If the Docker Engine stops producing data, or read operation raises an error, subscription is completed.
 */
export default class DockerLogsApiListener implements Listener<Uint8Array> {

    private readonly dockerEngineAPIClient: DockerEngineApiClient;
    readonly containerName: string;

    constructor(dockerEngineAPIClient: DockerEngineApiClient, containerName: string) {
        this.dockerEngineAPIClient = dockerEngineAPIClient;
        this.containerName = containerName.startsWith("/") ? containerName : `/${containerName}`;
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

        return this.dockerEngineAPIClient.getContainers()
            .then(containerDefinitions => this.extractRequiredContainer(containerDefinitions))
            .then(container => this.dockerEngineAPIClient.getLogStream(container));
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
