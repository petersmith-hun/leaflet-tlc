import Mapper from "@app/pipeline/mapper";
import { Context, Optional } from "@app/domain";

/**
 * Mapper implementation immediately returning the given input data.
 * Can be used in log pipelines where mapping is not needed.
 */
export class IdentityMapper implements Mapper<object, object> {

    map(inputData: object, _: Context): Optional<object> {
        return inputData;
    }
}

export const identityMapper = new IdentityMapper();
