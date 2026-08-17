import { Observable } from "rxjs";
import Listener from "@app/pipeline/listener";
import { ContainerDefinition } from "@app/client/docker";
import log from "@app/util/simple-logger";
import { DockerEngineApiClient } from "@app/client/docker/docker-engine-api-client";

/**
 * Listener implementation to collect logs from Docker Engine log stream API. On a successful read, it emits a slice of
 * data as a byte-array. If the Docker Engine stops producing data, or read operation raises an error, the subscription is completed.
 */
export default class DockerLogsApiListener implements Listener<Uint8Array> {

    private readonly dockerEngineAPIClient: DockerEngineApiClient;
    private readonly containerDefinition: ContainerDefinition;

    constructor(dockerEngineAPIClient: DockerEngineApiClient, containerDefinition: ContainerDefinition) {
        this.dockerEngineAPIClient = dockerEngineAPIClient;
        this.containerDefinition = containerDefinition;
    }

    listen(): Observable<Uint8Array> {

        return new Observable(subscriber => {
            this.dockerEngineAPIClient.getLogStream(this.containerDefinition)
                .then(logStream => logStream.data
                    .on("data", (line: any) => subscriber.next(line))
                    .on("end", () => subscriber.complete())
                )
                .catch(reason => {
                    log.error(`Failed to initialize listener for container: ${this.containerDefinition.Names[0]}; reason=${reason}`);
                    subscriber.complete();
                });
        });
    }

    sourceName(): string {
        return `docker:${this.containerDefinition.Names[0]}`;
    }
}
