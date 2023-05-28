import Mapper from "@app/pipeline/mapper/index";
import { Optional } from "@app/domain";

/**
 * Mapper implementation immediately returning the given input data.
 * Can be used in log pipelines where mapping is not needed.
 */
class IdentityMapper implements Mapper<object, object> {

    map(inputData: object): Optional<object> {
        return inputData;
    }
}

const identityMapper = new IdentityMapper();
export default identityMapper;
