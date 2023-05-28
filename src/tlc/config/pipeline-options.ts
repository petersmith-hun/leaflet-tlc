/**
 * Supported listener types.
 */
export enum ListenerType {

    /**
     * Selects Docker Engine log stream API as data source.
     */
    DOCKER = "docker"
}

/**
 * Supported parser types.
 */
export enum ParserType {

    /**
     * Log stream is parsed from byte array into strings.
     */
    BYTE_ARRAY = "byte-array",

    /**
     * Log stream is parsed from sequential pieces of strings into JSON documents.
     */
    JOINING_JSON = "joining-json"
}

/**
 * Supported mapper types.
 */
export enum MapperType {

    /**
     * Identity mapping is applied (input is passed through without any changes).
     */
    IDENTITY = "identity",

    /**
     * Logstash-like JSON log objects are converted into TLP API compatible log request objects.
     */
    LOGSTASH_TO_TLP = "logstash-to-tlp",

    /**
     * Custom JSON log objects are converted into TLP API compatible log request objects.
     */
    CUSTOM_TO_TLP = "custom-to-tlp"
}

/**
 * Supported publisher types.
 */
export enum PublisherType {

    /**
     * Processed log objects are displayed on the standard output. Recommended for debugging purposes only.
     */
    CONSOLE = "console",

    /**
     * Processed log objects are submitted to the TLP API.
     */
    TLP = "tlp"
}
