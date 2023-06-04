import { Observable } from "rxjs";

/**
 * Step #1 in a log collection pipeline.
 * Listener implementations are supposed to be collecting log messages from a specific source. Each collected slice of
 * data must be emitted via an RxJS Observable, using the subscriber.next() method. Each log collection pipeline must
 * have exactly one Listener attached.
 */
export default interface Listener<T> {

    /**
     * Starts listening to a log stream.
     */
    listen(): Observable<T>;
}
