import { ConsolePublisher } from "@app/pipeline/publisher/console-publisher";
import { TLPPublisher } from "@app/pipeline/publisher/tlp-publisher";
import { TLPClient } from "@app/client/tlp/tlp-client";
import { PublisherFactory } from "@app/factory/publisher-factory";
import { PublisherType } from "@app/config/pipeline-options";
import { PipelineConfig } from "@app/config";

describe("Unit tests for PublisherFactory", () => {

    const consolePublisher = new ConsolePublisher();
    const tlpPublisher = new TLPPublisher({} as TLPClient);
    let publisherFactory: PublisherFactory;

    beforeEach(() => {
        publisherFactory = new PublisherFactory(consolePublisher, tlpPublisher);
    });

    describe("Test scenarios for #getPublishers", () => {

        it("should return a console publisher", () => {

            // given
            const pipelineConfig = preparePipelineConfig(PublisherType.CONSOLE);

            // when
            const result = publisherFactory.getPublishers(pipelineConfig);

            // then
            expect(result.length).toBe(1)
            expect(result[0]).toStrictEqual(consolePublisher);
        });

        it("should return a tlp publisher", () => {

            // given
            const pipelineConfig = preparePipelineConfig(PublisherType.TLP);

            // when
            const result = publisherFactory.getPublishers(pipelineConfig);

            // then
            expect(result.length).toBe(1)
            expect(result[0]).toStrictEqual(tlpPublisher);
        });

        it("should return all publishers in order (console publisher first)", () => {

            // given
            const pipelineConfig = preparePipelineConfig(PublisherType.CONSOLE, PublisherType.TLP);

            // when
            const result = publisherFactory.getPublishers(pipelineConfig);

            // then
            expect(result.length).toBe(2)
            expect(result[0]).toStrictEqual(consolePublisher);
            expect(result[1]).toStrictEqual(tlpPublisher);
        });

        it("should return all publishers in order (tlp publisher first)", () => {

            // given
            const pipelineConfig = preparePipelineConfig(PublisherType.TLP, PublisherType.CONSOLE);

            // when
            const result = publisherFactory.getPublishers(pipelineConfig);

            // then
            expect(result.length).toBe(2)
            expect(result[0]).toStrictEqual(tlpPublisher);
            expect(result[1]).toStrictEqual(consolePublisher);
        });

        it("should return the same console publisher instance on consecutive calls", () => {

            // given
            const pipelineConfig = preparePipelineConfig(PublisherType.CONSOLE);

            // when
            const resultFirst = publisherFactory.getPublishers(pipelineConfig);
            const resultSecond = publisherFactory.getPublishers(pipelineConfig);

            // then
            expect(resultFirst[0] === resultSecond[0]).toBe(true);
        });

        it("should return the same tlp publisher instance on consecutive calls", () => {

            // given
            const pipelineConfig = preparePipelineConfig(PublisherType.TLP);

            // when
            const resultFirst = publisherFactory.getPublishers(pipelineConfig);
            const resultSecond = publisherFactory.getPublishers(pipelineConfig);

            // then
            expect(resultFirst[0] === resultSecond[0]).toBe(true);
        });

        function preparePipelineConfig(...publishers: PublisherType[]): PipelineConfig {
            return { publishers: publishers } as unknown as PipelineConfig;
        }
    });
});
