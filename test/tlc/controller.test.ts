import sinon, { SinonStubbedInstance } from "sinon";
import { ConfigurationProvider } from "@app/config/configuration-provider";
import { PipelineFactory } from "@app/factory/pipeline-factory";
import Pipeline from "@app/pipeline";
import { Controller } from "@app/controller";
import { PipelineConfig } from "@app/config";
import { Subject } from "rxjs";

describe("Unit tests for Controller", () => {

    let disconnectionSubjectMock: SinonStubbedInstance<Subject<string>>;
    let configurationProviderMock: ConfigurationProvider;
    let pipelineFactoryMock: SinonStubbedInstance<PipelineFactory>;
    let pipelineStubEnabled1: SinonStubbedInstance<Pipeline>;
    let pipelineStubEnabled2: SinonStubbedInstance<Pipeline>;

    let pipelineConfig = [
        { logStreamName: "enabled1", enabled: true },
        { logStreamName: "enabled2", enabled: true },
        { logStreamName: "disabled", enabled: false }
    ] as PipelineConfig[];

    let controller: Controller;

    beforeEach(() => {
        disconnectionSubjectMock = sinon.createStubInstance(Subject);
        pipelineFactoryMock = sinon.createStubInstance(PipelineFactory);
        pipelineStubEnabled1 = sinon.createStubInstance(Pipeline);
        // @ts-ignore
        pipelineStubEnabled1["logStreamName"] = pipelineConfig[0].logStreamName;
        pipelineStubEnabled2 = sinon.createStubInstance(Pipeline);
        // @ts-ignore
        pipelineStubEnabled2["logStreamName"] = pipelineConfig[1].logStreamName;
        configurationProviderMock = { pipelines: pipelineConfig } as ConfigurationProvider;

        controller = new Controller(disconnectionSubjectMock, configurationProviderMock, pipelineFactoryMock)
    });

    describe("Test scenarios for #init", () => {

        it("should read configuration and initialize pipelines", () => {

            // given
            pipelineFactoryMock.createPipeline.withArgs(pipelineConfig[0], disconnectionSubjectMock).returns(pipelineStubEnabled1);
            pipelineFactoryMock.createPipeline.withArgs(pipelineConfig[1], disconnectionSubjectMock).returns(pipelineStubEnabled2);

            // when
            controller.init();

            // then
            sinon.assert.callCount(pipelineFactoryMock.createPipeline, 2);
            sinon.assert.called(pipelineStubEnabled1.start);
            sinon.assert.called(pipelineStubEnabled2.start);
            sinon.assert.calledOnce(disconnectionSubjectMock.subscribe);

            const disconnectionSubjectCall = disconnectionSubjectMock.subscribe.getCall(0);
            disconnectionSubjectCall.callArgWith(0, "enabled1");
            sinon.assert.called(pipelineStubEnabled1.start);
            disconnectionSubjectCall.callArgWith(0, "enabled2");
            sinon.assert.called(pipelineStubEnabled2.start);

            sinon.assert.callCount(pipelineStubEnabled1.start, 2);
            sinon.assert.callCount(pipelineStubEnabled2.start, 2);
        });
    });
});
