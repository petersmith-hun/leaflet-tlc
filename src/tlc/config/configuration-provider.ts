import { ApplicationConfig, DockerConnection, PipelineConfig, SystemConfig, TLPConnection } from "@app/config";
import config from "config";

/**
 * Configuration initializer and provider implementation, built using the 'config' library.
 * @see config/default.yml
 */
export class ConfigurationProvider {

    private readonly applicationConfig: ApplicationConfig;

    constructor() {
        this.applicationConfig = new ApplicationConfig(config.get("tlc"));
    }

    /**
     * Returns the system-wide configuration parameters.
     * Refers to the parameters under {@code tlc.system} section.
     * @see SystemConfig
     */
    public get systemConfig(): SystemConfig {
        return this.applicationConfig.systemConfig;
    }

    /**
     * Returns the configured pipeline.
     * Refers to the parameter array under {@code tlc.pipelines} section.
     * @see PipelineConfig
     */
    public get pipelines(): PipelineConfig[] {
        return this.applicationConfig.pipelines;
    }

    /**
     * Returns the Docker connection configuration parameters.
     * Refers to the parameters under {@code tlc.connection.docker} section.
     * @see DockerConnection
     */
    public get dockerConnection(): DockerConnection {
        return this.applicationConfig.connectionConfig.dockerConnection;
    }

    /**
     * Returns the TLP service connection configuration parameters.
     * Refers to the parameters under {@code tlc.connection.tlp} section.
     * @see TLPConnection
     */
    public get tlpConnection(): TLPConnection {
        return this.applicationConfig.connectionConfig.tlpConnection;
    }
}

export const configurationProvider = new ConfigurationProvider();
