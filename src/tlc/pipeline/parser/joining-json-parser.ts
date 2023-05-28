import { Observable } from "rxjs";
import Parser from "@app/pipeline/parser/index";
import log from "@app/util/simple-logger";

const newLineCharacter = "\n";

/**
 * Parser implementation that can convert multiple corresponding string objects into a single JSON document. This behavior
 * is achieved by maintaining a local "buffer", and awaiting the corresponding pieces, then joining them together.
 * Therefore, this parser must not be shared among different log streams, each log pipeline should have its own instance.
 */
export default class JoiningJsonParser implements Parser<string, object> {

    private buffer: string[];

    private constructor() {
        this.buffer = [];
    }

    /**
     * Returns a prototype instance of the JoiningJsonParser.
     */
    public static create(): JoiningJsonParser {
        return new JoiningJsonParser();
    }

    parse(inputData: string): Observable<object> {

        return new Observable(subscriber => {

            this.buffer.push(inputData);
            if (inputData.endsWith(newLineCharacter)) {
                this.buffer.join("")
                    .trim()
                    .split(newLineCharacter)
                    .forEach(value => {
                        try {
                            subscriber.next(JSON.parse(value));
                        } catch (error) {
                            log.warn("Log message could not be parsed as JSON");
                        }
                    });
                this.buffer = [];
            }
        });
    }
}
