import TLPLogMessage, { ErrorLog } from "@app/client/tlp";
import { ListenerType, MapperType, ParserType, PublisherType } from "@app/config/pipeline-options";

type SystemConfigKey = "reconnection-poll-rate" | "enable-trimming-stdout-header";
type ConnectionConfigKey = "docker" | "tlp";
type DockerConnectionConfigKey = "type" | "uri";
type DockerListenerConfigKey = "container-name";
type PipelineConfigKey =
    "enabled"
    | "log-stream-name"
    | "listener-type"
    | "listener-config"
    | "parsers"
    | "mapper-type"
    | "mapper-config"
    | "publishers";
type ConfigKey =
    SystemConfigKey
    | ConnectionConfigKey
    | DockerConnectionConfigKey
    | PipelineConfigKey
    | DockerListenerConfigKey;
type ConfigNode = "system" | "connection" | "pipelines";
type PipelineConfigNode = { [Key in PipelineConfigKey]: string | string[] };
type DockerListenerConfigNode = { [Key in DockerListenerConfigKey]: string | string[] };
type MapValue = string | number | boolean | object | undefined;
type MapNode = Map<string, MapValue> | undefined;

const getNode = (parameters: MapNode, node: ConfigNode): MapNode => {
    return parameters?.get(node) as MapNode;
};

const getValue = <Type>(parameters: MapNode, key: ConfigKey, defaultValue: string | number | boolean = "unknown"): Type => {
    return (parameters?.has(key)
        ? parameters.get(key)
        : defaultValue) as Type;
};

const getPipelineConfigValue = <Type>(parameters: PipelineConfigNode, key: PipelineConfigKey): Type => {
    return parameters[key] as Type;
};

const getDockerListenerConfigValue = <Type>(parameters: DockerListenerConfigNode, key: DockerListenerConfigKey): Type => {
    return parameters[key] as Type;
};

// -- System configuration --

/**
 * System-wide configuration parameters.
 */
export class SystemConfig {

    /**
     * Attempt reconnecting a disconnected log stream every [reconnection-poll-rate] milliseconds.
     */
    reconnectionPollRate: number;

    /**
     * Enables trimming the stdout header of the Docker Engine log stream (first 8 bytes are removed, if enabled).
     * Should be enabled on Linux systems.
     */
    enableTrimmingStdoutHeader: boolean;

    constructor(parameters: MapNode) {
        this.reconnectionPollRate = getValue(parameters, "reconnection-poll-rate");
        this.enableTrimmingStdoutHeader = getValue(parameters, "enable-trimming-stdout-header");
    }
}

// -- Connection configuration --

/**
 * Supported Docker connection types.
 */
export enum DockerConnectionType {

    /**
     * Connect to the API using a UNIX socket.
     */
    SOCKET = "socket",

    /**
     * Connect to the API using TCP (HTTP) protocol.
     */
    TCP = "tcp"
}

/**
 * Docker connection configuration parameters.
 */
export class DockerConnection {

    /**
     * Determines how TLC is going to connect to the Docker Engine API.
     */
    connectionType: DockerConnectionType;

    /**
     * Target endpoint, depending on the selected connection type.
     * Usually should be set to /var/run/docker.sock (socket) or http://localhost:2375 (tcp).
     */
    uri: string;

    constructor(parameters: MapNode) {
        this.connectionType = getValue(parameters, "type");
        this.uri = getValue(parameters, "uri");
    }
}

/**
 * TLP service connection configuration parameters.
 */
export class TLPConnection {

    /**
     * TLP service host.
     */
    uri: string;

    constructor(parameters: MapNode) {
        this.uri = getValue(parameters, "uri");
    }
}

/**
 * External service connection related configuration parameters.
 */
export class ConnectionConfig {

    /**
     * Docker connection.
     * @see DockerConnection
     */
    dockerConnection: DockerConnection;

    /**
     * TLP connection.
     * @see TLPConnection
     */
    tlpConnection: TLPConnection;

    constructor(parameters: MapNode) {
        this.dockerConnection = new DockerConnection(getValue(parameters, "docker"));
        this.tlpConnection = new TLPConnection(getValue(parameters, "tlp"));
    }
}

// -- Listener configuration --

/**
 * Configuration parameters of the Docker Engine log stream listener.
 */
export class DockerListenerConfig {

    /**
     * Name of the container to be listened to.
     */
    containerName: string;

    constructor(parameters: DockerListenerConfigNode) {
        this.containerName = getDockerListenerConfigValue(parameters, "container-name");
    }
}

/**
 * Aggregator type for all listener configuration classes.
 */
export type ListenerConfig = DockerListenerConfig;

// -- Pipeline configuration

/**
 * Parameter map skeleton for custom log mapping. Keys should be the keys of TLPLogMessage and ErrorLog interfaces.
 * Values are supposed to be JSON path expressions. In case of the mdc field, the value should be key-value pairs,
 * defining the mapping of the custom fields (these fields will always be added under the mdc field in the TLPLogMessage)
 * @see TLPLogMessage
 * @see ErrorLog
 */
export type CustomMapping = Partial<{ [key in keyof TLPLogMessage]: string; } & { [key in keyof ErrorLog]: string; } & { context: object }>

/**
 * Log processing pipeline definition.
 */
export class PipelineConfig {

    /**
     * Enables/disables this pipeline. Optional, defaults to true.
     */
    enabled: boolean;

    /**
     * Arbitrary name of the log stream. Will be sent over to the TLP service as the "source" of the log message.
     */
    logStreamName: string;

    /**
     * Log stream listener type. A listener defines the source of the log messages.
     * @see ListenerType
     */
    listenerType: ListenerType;

    /**
     * Listener configuration. Optional, only if needed by the selected listener.
     * @see ListenerConfig
     */
    listenerConfig?: ListenerConfig;

    /**
     * Log stream parsers. A parser processes the raw log messages, and turns them into an object that can be further processed.
     * @see ParserType
     */
    parsers: ParserType[];

    /**
     * Log stream mappers. A mapper transforms the structure and the contents of a log object.
     * @see MapperType
     */
    mapperType: MapperType;

    /**
     * Optional mapper configuration for custom mapping.
     * @see CustomMapping
     */
    mapperConfig?: CustomMapping;

    /**
     * Log publisher types. Publishers transfer the log messages (e.g. to an external system).
     * @see PublisherType
     */
    publishers: PublisherType[];

    constructor(parameters: PipelineConfigNode) {
        this.enabled = getPipelineConfigValue(parameters, "enabled") ?? true;
        this.logStreamName = getPipelineConfigValue(parameters, "log-stream-name");
        this.listenerType = getPipelineConfigValue(parameters, "listener-type") as ListenerType;
        this.listenerConfig = this.listenerType === ListenerType.DOCKER
            ? new DockerListenerConfig(getPipelineConfigValue(parameters, "listener-config"))
            : undefined;
        this.parsers = getPipelineConfigValue(parameters, "parsers");
        this.mapperType = getPipelineConfigValue(parameters, "mapper-type");
        this.mapperConfig = getPipelineConfigValue(parameters, "mapper-config");
        this.publishers = getPipelineConfigValue(parameters, "publishers");
    }
}

/**
 * Application configuration wrapper.
 */
export class ApplicationConfig {

    /**
     * System configuration.
     * @see SystemConfig
     */
    systemConfig: SystemConfig;

    /**
     * External service connection configuration.
     * @see ConnectionConfig
     */
    connectionConfig: ConnectionConfig;

    /**
     * Log collection pipeline configuration.
     * @see PipelineConfig
     */
    pipelines: PipelineConfig[];

    constructor(parameters: MapNode) {
        this.systemConfig = new SystemConfig(getNode(parameters, "system"));
        this.connectionConfig = new ConnectionConfig(getNode(parameters, "connection"));
        this.pipelines = (getNode(parameters, "pipelines") as unknown as PipelineConfigNode[])
            .map(pipeline => new PipelineConfig(pipeline));
    }
}
