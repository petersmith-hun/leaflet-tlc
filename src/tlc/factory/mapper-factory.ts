import { PipelineConfig } from "@app/config";
import Mapper from "@app/pipeline/mapper";
import { MapperType } from "@app/config/pipeline-options";
import { identityMapper, IdentityMapper } from "@app/pipeline/mapper/identity-mapper";
import LogstashToTLPMapper from "@app/pipeline/mapper/logstash-to-tlp-mapper";
import CustomToTLPMapper from "@app/pipeline/mapper/custom-to-tlp-mapper";

type MapperMap = Map<MapperType, (pipelineConfig: PipelineConfig) => Mapper<any, any>>;

/**
 * Factory implementation providing the proper mapper instance based on the pipeline configuration.
 */
export class MapperFactory {

    private readonly mapperMap: MapperMap;

    constructor(identityMapper: IdentityMapper) {
        this.mapperMap = this.initMapperMap(identityMapper);
    }

    /**
     * Returns a mapper based on the pipeline configuration.
     *
     * @param pipelineConfig PipelineConfig object
     */
    public getMapper(pipelineConfig: PipelineConfig): Mapper<any, any> {
        return this.mapperMap.get(pipelineConfig.mapperType)!(pipelineConfig);
    }

    private initMapperMap(identityMapper: IdentityMapper): MapperMap {

        return new Map([
            [MapperType.IDENTITY, _ => identityMapper],
            [MapperType.LOGSTASH_TO_TLP, pipelineConfig => new LogstashToTLPMapper(pipelineConfig.logStreamName)],
            [MapperType.CUSTOM_TO_TLP, pipelineConfig => new CustomToTLPMapper(pipelineConfig)]
        ]);
    }
}

export const mapperFactory = new MapperFactory(identityMapper);
