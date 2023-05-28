import { ApplicationConfig, DockerConnection, PipelineConfig, SystemConfig, TLPConnection } from "@app/config/index";
import config from "config";

/**
 * Configuration initializer and provider implementation, built using the 'config' library.
 * @see config/default.yml
 */
export default class ConfigurationProvider {

    private static instance: ConfigurationProvider;

    private readonly applicationConfig: ApplicationConfig;

    private constructor() {
        this.applicationConfig = new ApplicationConfig(config.get("tlc"));
    }

    /**
     * Returns a singleton instance of the ConfigurationProvider.
     */
    public static getInstance(): ConfigurationProvider {

        if (!ConfigurationProvider.instance) {
            ConfigurationProvider.instance = new ConfigurationProvider();
        }

        return ConfigurationProvider.instance;
    }

    /**
     * Returns the system-wide configuration parameters.
     * Refers to the parameters under {@code tlc.system} section.
     * @see SystemConfig
     */
    getSystemConfig(): SystemConfig {
        return this.applicationConfig.systemConfig;
    }

    /**
     * Returns the configured pipeline.
     * Refers to the parameter array under {@code tlc.pipelines} section.
     * @see PipelineConfig
     */
    getPipelines(): PipelineConfig[] {
        return this.applicationConfig.pipelines;
    }

    /**
     * Returns the Docker connection configuration parameters.
     * Refers to the parameters under {@code tlc.connection.docker} section.
     * @see DockerConnection
     */
    getDockerConnection(): DockerConnection {
        return this.applicationConfig.connectionConfig.dockerConnection;
    }

    /**
     * Returns the TLP service connection configuration parameters.
     * Refers to the parameters under {@code tlc.connection.tlp} section.
     * @see TLPConnection
     */
    getTLPConnection(): TLPConnection {
        return this.applicationConfig.connectionConfig.tlpConnection;
    }
}
