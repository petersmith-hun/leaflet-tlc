import Mapper from "@app/pipeline/mapper/index";
import { Optional } from "@app/domain";

/**
 * Mapper implementation immediately returning the given input data.
 * Can be used in log pipelines where mapping is not needed.
 */
export default class IdentityMapper implements Mapper<object, object> {

    private static instance: IdentityMapper;

    private constructor() {
    }

    /**
     * Returns a singleton instance of the IdentityMapper.
     */
    public static getInstance(): IdentityMapper {

        if (!IdentityMapper.instance) {
            IdentityMapper.instance = new IdentityMapper();
        }

        return IdentityMapper.instance;
    }

    map(inputData: object): Optional<object> {
        return inputData;
    }
}
