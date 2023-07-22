/**
 * Domain class representing an error object in the log.
 */
export interface ErrorLog {
    className: string;
    message: string;
    stackTrace?: string;
}

/**
 * Domain class representing a TLP API compatible log message.
 */
export default interface TLPLogMessage {
    source: string;
    threadName: string;
    timeStamp: number;
    loggerName: string;
    level: {
        levelStr: string
    };
    content: string;
    exception?: ErrorLog;
    context?: object;
}
