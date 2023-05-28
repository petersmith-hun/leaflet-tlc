import { filter, finalize, map, mergeMap, Subject } from "rxjs";
import Listener from "src/tlc/pipeline/listener";
import Parser from "src/tlc/pipeline/parser";
import Publisher from "src/tlc/pipeline/publisher";
import Mapper from "@app/pipeline/mapper";
import { SystemConfig } from "@app/config";
import ConfigurationProvider from "@app/config/configuration-provider";

/**
 * Representation and runner logic of a log processing pipeline.
 */
export default class Pipeline {

    private readonly listener: Listener<any>;
    private readonly parsers: Parser<any, any>[];
    private readonly mapper: Mapper<any, any>;
    private readonly publishers: Publisher<any>[];
    private readonly disconnection: Subject<string>;
    private readonly systemConfig: SystemConfig;
    readonly logStreamName: string;

    constructor(logStreamName: string, listener: Listener<any>,
                parsers: Parser<any, any>[], mapper: Mapper<any, any>,
                publishers: Publisher<any>[], disconnection: Subject<string>) {
        this.logStreamName = logStreamName;
        this.listener = listener;
        this.parsers = parsers;
        this.mapper = mapper;
        this.publishers = publishers;
        this.disconnection = disconnection;
        this.systemConfig = ConfigurationProvider.getInstance().getSystemConfig();
    }

    /**
     * Initializes the configured log processing pipeline. Implementation does the following steps:
     *  1) Starts the listener and sets the disconnection subject, so the pipeline will be able to notify the controller
     *     to try reconnecting the pipeline;
     *  2) Executes the parsers in the defined order;
     *  3) Executes the mapper;
     *  4) Filters out the null log objects.
     *  5) Finally, executes the publishers.
     */
    start(): void {

        let listenerObservable = this.listener.listen()
            .pipe(finalize(() => setTimeout(
                () => this.disconnection.next(this.logStreamName),
                this.systemConfig.reconnectionPollRate)
            ));
        this.parsers
            .map(parser => mergeMap(value => parser.parse(value)))
            .forEach(parserMergeMap => listenerObservable = listenerObservable.pipe(parserMergeMap));

        listenerObservable
            .pipe(map(data => this.mapper.map(data)))
            .pipe(filter(data => data !== null))
            .subscribe(value => this.publishers
                .forEach(publisher => publisher.publish(value)));
    }
}
