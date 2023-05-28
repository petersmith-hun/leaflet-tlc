import { Observable } from "rxjs";

/**
 * Step #2 in a log collection pipeline.
 * Parser implementations are responsible for converting the slice of data emitted by the Listener into any kind of
 * object that can be further processed. Each implementation must emit the parsed piece of data with an RxJS Observable
 * using the subscriber.next() method. Implementations not necessarily need to project the input data 1:1 into output data,
 * so logical "reduction" of the data is possible. A pipeline must have at least one Parser. In case more than one
 * Parser is attached, their order matters.
 */
export default interface Parser<I, O> {

    /**
     * Parses the given inputData and emits the parsed counterpart as type <O> wrapped in an Observable.
     * @param inputData input data of type <I> to be parsed
     */
    parse(inputData: I): Observable<O>;

}
