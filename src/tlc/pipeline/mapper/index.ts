import { Optional } from "@app/domain";

/**
 * Step #3 in a log collection pipeline.
 * Implementation must be able to convert a parsed log object into a different data structure. Each log pipeline can
 * have one mapper attached (if no mapping is needed, use the IdentityMapper implementation). If mapping is not possible,
 * implementation must return with null, so it can be filtered out before passing it to the publisher.
 */
export default interface Mapper<I, O> {

    /**
     * Maps the given input data of type <T> to an output object of type <O>.
     * @param inputData input data of type <T> to be mapped.
     */
    map(inputData: I): Optional<O>;
}
