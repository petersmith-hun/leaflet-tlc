import { IdentityMapper } from "@app/pipeline/mapper/identity-mapper";
import { MapperFactory } from "@app/factory/mapper-factory";
import { MapperType } from "@app/config/pipeline-options";
import { PipelineConfig } from "@app/config";
import LogstashToTLPMapper from "@app/pipeline/mapper/logstash-to-tlp-mapper";
import CustomToTLPMapper from "@app/pipeline/mapper/custom-to-tlp-mapper";

describe("Unit tests for MapperFactory", () => {

    let identityMapper = new IdentityMapper();
    let mapperFactory: MapperFactory;

    beforeEach(() => {
        mapperFactory = new MapperFactory(identityMapper);
    });

    describe("Test scenarios for #getMapper", () => {

        it("should return an identity mapper", () => {

            // given
            const pipelineConfig = preparePipelineConfig(MapperType.IDENTITY);

            // when
            const result = mapperFactory.getMapper(pipelineConfig);

            // then
            expect(result).toStrictEqual(identityMapper);
        });

        it("should return a logstash to tlp mapper", () => {

            // given
            const pipelineConfig = preparePipelineConfig(MapperType.LOGSTASH_TO_TLP);

            // when
            const result = mapperFactory.getMapper(pipelineConfig);

            // then
            expect(result).toBeInstanceOf(LogstashToTLPMapper);
        });

        it("should return a custom to tlp mapper", () => {

            // given
            const pipelineConfig = preparePipelineConfig(MapperType.CUSTOM_TO_TLP);

            // when
            const result = mapperFactory.getMapper(pipelineConfig);

            // then
            expect(result).toBeInstanceOf(CustomToTLPMapper);
        });

        it("should return the same identity mapper instance on consecutive calls", () => {

            // given
            const pipelineConfig = preparePipelineConfig(MapperType.IDENTITY);

            // when
            const resultFirst = mapperFactory.getMapper(pipelineConfig);
            const resultSecond = mapperFactory.getMapper(pipelineConfig);

            // then
            expect(resultFirst === resultSecond).toBe(true);
        });

        it("should return different logstash to tlp mapper instances on consecutive calls", () => {

            // given
            const pipelineConfig = preparePipelineConfig(MapperType.LOGSTASH_TO_TLP);

            // when
            const resultFirst = mapperFactory.getMapper(pipelineConfig);
            const resultSecond = mapperFactory.getMapper(pipelineConfig);

            // then
            expect(resultFirst === resultSecond).toBe(false);
        });

        it("should return different custom to tlp mapper instances on consecutive calls", () => {

            // given
            const pipelineConfig = preparePipelineConfig(MapperType.CUSTOM_TO_TLP);

            // when
            const resultFirst = mapperFactory.getMapper(pipelineConfig);
            const resultSecond = mapperFactory.getMapper(pipelineConfig);

            // then
            expect(resultFirst === resultSecond).toBe(false);
        });

        function preparePipelineConfig(mapper: MapperType): PipelineConfig {
            return {
                logStreamName: "container-1",
                mapperType: mapper
            } as unknown as PipelineConfig;
        }
    });
});
