// @ts-nocheck
import { PipelineConfig } from "@app/config";
import { ConfigurationProvider } from "@app/config/configuration-provider";
import { ListenerType } from "@app/config/pipeline-options";
import { ListenerFactory } from "@app/factory/listener-factory";
import { ParserFactory } from "@app/factory/parser-factory";
import { MapperFactory } from "@app/factory/mapper-factory";
import { PublisherFactory } from "@app/factory/publisher-factory";
import { PipelineFactory } from "@app/factory/pipeline-factory";
import { ListenerStub, MapperStub, ParserStub, PublisherStub } from "@test/tlc/pipeline/pipeline.test";
import sinon, { SinonStubbedInstance } from "sinon";
import { Subject } from "rxjs";

describe("Unit tests for PipelineFactory", () => {

    const configurationProvider = { systemConfig: { reconnectionPollRate: 300 } } as ConfigurationProvider;
    let listenerFactoryMock: SinonStubbedInstance<ListenerFactory>;
    let parserFactoryMock: SinonStubbedInstance<ParserFactory>;
    let mapperFactoryMock: SinonStubbedInstance<MapperFactory>;
    let publisherFactoryMock: SinonStubbedInstance<PublisherFactory>;
    let disconnectionSubjectMock: SinonStubbedInstance<Subject<string>>;
    let pipelineFactory: PipelineFactory;

    beforeEach(() => {
        listenerFactoryMock = sinon.createStubInstance(ListenerFactory);
        parserFactoryMock = sinon.createStubInstance(ParserFactory);
        mapperFactoryMock = sinon.createStubInstance(MapperFactory);
        publisherFactoryMock = sinon.createStubInstance(PublisherFactory);
        disconnectionSubjectMock = sinon.createStubInstance(Subject<string>);

        pipelineFactory = new PipelineFactory(
            configurationProvider, listenerFactoryMock,
            parserFactoryMock, mapperFactoryMock,
            publisherFactoryMock
        );
    });

    describe("Test scenarios for #createPipeline", () => {

        it("should create the pipeline object according to the given configuration", () => {

            // given
            const pipelineConfig = { logStreamName: "application-1", listenerType: ListenerType.DOCKER } as PipelineConfig;
            const listenerStub = new ListenerStub();
            const parserStub = new ParserStub();
            const mapperStub = new MapperStub();
            const publisherStub = new PublisherStub();

            listenerFactoryMock.getListener.withArgs(pipelineConfig).returns(listenerStub);
            parserFactoryMock.getParsers.withArgs(pipelineConfig).returns([parserStub]);
            mapperFactoryMock.getMapper.withArgs(pipelineConfig).returns(mapperStub);
            publisherFactoryMock.getPublishers.withArgs(pipelineConfig).returns([publisherStub]);

            // when
            const result = pipelineFactory.createPipeline(pipelineConfig, disconnectionSubjectMock);

            // then
            expect(result.logStreamName).toBe(pipelineConfig.logStreamName);
            expect(result.listener).toStrictEqual(listenerStub);
            expect(result.parsers.length).toBe(1);
            expect(result.parsers[0]).toStrictEqual(parserStub);
            expect(result.mapper).toStrictEqual(mapperStub);
            expect(result.publishers.length).toBe(1);
            expect(result.publishers[0]).toStrictEqual(publisherStub);
            expect(result.disconnection).toStrictEqual(disconnectionSubjectMock);
            expect(result.systemConfig).toStrictEqual(configurationProvider.systemConfig);
        });
    });
});
