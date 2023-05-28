enum LogLevel {
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}

interface Log {
    info: (message: any) => void;
    warn: (message: any) => void;
    error: (message: any) => void;
}

const logger = (logLevel: LogLevel, message: any): void => {
    console[logLevel](`${new Date().toISOString()} ${logLevel.toUpperCase().padEnd(5)} ${message}`);
}

/**
 * A very simple logger component, logging to the standard output.
 */
const log: Log = {
    info: (message: any) => logger(LogLevel.INFO, message),
    warn: (message: any) => logger(LogLevel.WARN, message),
    error: (message: any) => logger(LogLevel.ERROR, message)
}

export default log;
