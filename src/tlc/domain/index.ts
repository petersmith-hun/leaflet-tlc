/**
 * Generic optional type. Covers the given type <T> or null.
 */
export type Optional<T> = T | null;

/**
 * Pipeline context information object.
 */
export interface Context {

    /**
     * Generated unique log stream name.
     */
    logStreamName: string;

    /**
     * Name of the log source (the source file or Docker container).
     */
    logSource: string;
}
