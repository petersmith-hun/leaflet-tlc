/**
 * Step #4 (last step) in a log collection pipeline.
 * Publisher implementations should transfer the processed log messages into a log processor system. Each log pipeline
 * must have at least one publisher attached, and their order do not matter.
 */
export default interface Publisher<T> {

    /**
     * Submits the input data to the implemented target.
     * @param data log object of type <T> to be published
     */
    publish(data: T): void;
}
