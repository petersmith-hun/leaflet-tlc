import sinon, { SinonStubbedInstance } from "sinon";
import { Observable, Subject } from "rxjs";
import { Optional } from "@app/domain";
import Pipeline from "@app/pipeline";
import Listener from "@app/pipeline/listener";
import Parser from "@app/pipeline/parser";
import Mapper from "@app/pipeline/mapper";
import Publisher from "@app/pipeline/publisher";
import { ConfigurationProvider } from "@app/config/configuration-provider";
import { blockExecution } from "@test/util";

describe("Unit tests for Pipeline", () => {

    const logStreamName = "log-stream-1";
    const systemConfig = { reconnectionPollRate: 25 };
    const configurationProvider = { systemConfig: systemConfig } as ConfigurationProvider;

    let listenerMock: SinonStubbedInstance<Listener<any>>;
    let parserMock1: SinonStubbedInstance<Parser<any, any>>;
    let parserMock2: SinonStubbedInstance<Parser<any, any>>;
    let mapperMock: SinonStubbedInstance<Mapper<any, any>>;
    let publisherMock1: SinonStubbedInstance<Publisher<any>>;
    let publisherMock2: SinonStubbedInstance<Publisher<any>>;
    let disconnectionSubjectMock: SinonStubbedInstance<Subject<string>>;

    let pipeline: Pipeline;

    describe("Test scenarios for #start", () => {

        beforeEach(() => {
            listenerMock = sinon.createStubInstance(ListenerStub);
            parserMock1 = sinon.createStubInstance(ParserStub);
            parserMock2 = sinon.createStubInstance(ParserStub);
            mapperMock = sinon.createStubInstance(MapperStub);
            publisherMock1 = sinon.createStubInstance(PublisherStub);
            publisherMock2 = sinon.createStubInstance(PublisherStub);
            disconnectionSubjectMock = sinon.createStubInstance(Subject);
        });

        const scenarios = [true, false];

        scenarios.forEach(subscriberCompletes => {
            it(`should initialize the log collection pipeline and subscribe, finally notifies disconnection: ${subscriberCompletes}`, async () => {

                // given
                const inputData = [
                    "First item",
                    "Second item",
                    "Third item",
                    "Fourth item"
                ];

                listenerMock.listen.returns(new Observable(subscriber => {
                    inputData
                        .forEach(item => subscriber.next(item));
                    if (subscriberCompletes) {
                        subscriber.complete();
                    }
                }));
                parserMock1.parse.withArgs("First item")
                    .returns(new Observable(subscriber => subscriber.next("First item parsed by parser 1")));
                parserMock1.parse.withArgs("Second item")
                    .returns(new Observable(subscriber => subscriber.next("Second item parsed by parser 1")));
                parserMock1.parse.withArgs("Third item")
                    .returns(new Observable(subscriber => subscriber.next("Third item parsed by parser 1")));
                parserMock1.parse.withArgs("Fourth item")
                    .returns(new Observable(subscriber => subscriber.next("Fourth item parsed by parser 1")));

                parserMock2.parse.withArgs("First item parsed by parser 1")
                    .returns(new Observable(subscriber => subscriber.next("First item parsed by parser 1 and 2")));
                parserMock2.parse.withArgs("Second item parsed by parser 1")
                    .returns(new Observable(subscriber => subscriber.next("Second item parsed by parser 1 and 2")));
                parserMock2.parse.withArgs("Third item parsed by parser 1")
                    .returns(new Observable());
                parserMock2.parse.withArgs("Fourth item parsed by parser 1")
                    .returns(new Observable(subscriber => subscriber.next("Fourth item parsed by parser 1 and 2")));

                mapperMock.map.withArgs("First item parsed by parser 1 and 2").returns("First item parsed and mapped");
                mapperMock.map.withArgs("Second item parsed by parser 1 and 2").returns(null);
                mapperMock.map.withArgs("Fourth item parsed by parser 1 and 2").returns("Fourth item parsed and mapped");

                pipeline = new Pipeline(
                    logStreamName,
                    listenerMock,
                    [parserMock1, parserMock2],
                    mapperMock,
                    [publisherMock1, publisherMock2],
                    disconnectionSubjectMock,
                    configurationProvider);

                // when
                pipeline.start();
                await blockExecution();

                // then
                sinon.assert.callCount(parserMock1.parse, 4);
                sinon.assert.calledWith(parserMock1.parse, "First item");
                sinon.assert.calledWith(parserMock1.parse, "Second item");
                sinon.assert.calledWith(parserMock1.parse, "Third item");
                sinon.assert.calledWith(parserMock1.parse, "Fourth item");

                sinon.assert.callCount(parserMock2.parse, 4);
                sinon.assert.calledWith(parserMock2.parse, "First item parsed by parser 1");
                sinon.assert.calledWith(parserMock2.parse, "Second item parsed by parser 1");
                sinon.assert.calledWith(parserMock2.parse, "Third item parsed by parser 1");
                sinon.assert.calledWith(parserMock2.parse, "Fourth item parsed by parser 1");

                sinon.assert.callCount(mapperMock.map, 3);
                sinon.assert.calledWith(mapperMock.map, "First item parsed by parser 1 and 2");
                sinon.assert.calledWith(mapperMock.map, "Second item parsed by parser 1 and 2");
                sinon.assert.calledWith(mapperMock.map, "Fourth item parsed by parser 1 and 2");

                sinon.assert.callCount(publisherMock1.publish, 2);
                sinon.assert.calledWith(publisherMock1.publish, "First item parsed and mapped");
                sinon.assert.calledWith(publisherMock1.publish, "Fourth item parsed and mapped");

                sinon.assert.callCount(publisherMock2.publish, 2);
                sinon.assert.calledWith(publisherMock2.publish, "First item parsed and mapped");
                sinon.assert.calledWith(publisherMock2.publish, "Fourth item parsed and mapped");

                if (subscriberCompletes) {
                    sinon.assert.calledWith(disconnectionSubjectMock.next, logStreamName);
                } else {
                    sinon.assert.notCalled(disconnectionSubjectMock.next);
                }
            });
        })
    });
});

export class ListenerStub implements Listener<any> {
    listen(): Observable<any> {
        return new Observable();
    }
}

export class ParserStub implements Parser<any, any> {
    parse(inputData: any): Observable<any> {
        return new Observable();
    }
}

export class MapperStub implements Mapper<any, any> {
    map(inputData: any): Optional<any> {
        return null;
    }
}

export class PublisherStub implements Publisher<any> {
    publish(data: any): void { }
}
