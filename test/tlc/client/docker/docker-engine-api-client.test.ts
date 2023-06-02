import { DockerConnectionType } from "@app/config";
import { ConfigurationProvider } from "@app/config/configuration-provider";
import { DockerEngineApiClient } from "@app/client/docker/docker-engine-api-client";
import sinon, { SinonStub } from "sinon";
import axios, { AxiosRequestConfig } from "axios";

describe("Unit tests for DockerEngineApiClient", () => {

    const containers = { data: [{ Id: "container-1234abcd", Names: ["/container1"] }] };
    const logStream = { data: { on: () => {} } };
    const socket_path = "/path/to/docker.sock";
    const tcp_path = "http://localhost:9999/docker";

    let configurationProviderMock: ConfigurationProvider;
    let dockerEngineApiClient: DockerEngineApiClient;
    let axiosStub: SinonStub;
    let getTimeStub: SinonStub;

    beforeAll(() => {
        axiosStub = sinon.stub(axios, "request");
        getTimeStub = sinon.stub(Date.prototype, "getTime");
    });

    afterAll(() => {
        axiosStub.restore();
        getTimeStub.restore();
    });

    beforeEach(() => {
        axiosStub.reset();
        getTimeStub.reset();
    });

    describe("Test scenarios for #getContainers", () => {

        it("should return base info of all container via socket", async () => {

            // given
            prepareClient(DockerConnectionType.SOCKET);
            axiosStub.returns(containers);

            // when
            const result = await dockerEngineApiClient.getContainers();

            // then
            const axiosOptions = axiosStub.getCall(0).firstArg as AxiosRequestConfig;
            delete axiosOptions.validateStatus;

            expect(result).toStrictEqual(containers);
            expect(axiosOptions).toStrictEqual(prepareExpectedConfig(socket_path, undefined));
        });

        it("should return base info of all container via tcp", async () => {

            // given
            prepareClient(DockerConnectionType.TCP);
            axiosStub.returns(containers);

            // when
            const result = await dockerEngineApiClient.getContainers();

            // then
            const axiosOptions = axiosStub.getCall(0).firstArg as AxiosRequestConfig;
            delete axiosOptions.validateStatus;

            expect(result).toStrictEqual(containers);
            expect(axiosOptions).toStrictEqual(prepareExpectedConfig(undefined, tcp_path));
        });

        function prepareExpectedConfig(socketPath?: string, baseURL?: string) {

            return {
                socketPath: socketPath,
                baseURL: baseURL,
                method: "get",
                url: "/v1.41/containers/json?all=true",
                responseType: "json",
                headers: {
                    Host: null,
                    Accept: "*/*"
                }
            };
        }
    });

    describe("Test scenarios for #getLogStream", () => {

        it("should return log stream via socket", async () => {

            // given
            prepareClient(DockerConnectionType.SOCKET);
            axiosStub.returns(logStream);
            getTimeStub.returns(1685565586123);

            // when
            const result = await dockerEngineApiClient.getLogStream(containers.data[0]);

            // then
            const axiosOptions = axiosStub.getCall(0).firstArg as AxiosRequestConfig;
            delete axiosOptions.validateStatus;

            expect(result).toStrictEqual(logStream);
            expect(axiosOptions).toStrictEqual(prepareExpectedConfig(socket_path, undefined));
        });

        it("should return log stream via tcp", async () => {

            // given
            prepareClient(DockerConnectionType.TCP);
            axiosStub.returns(logStream);
            getTimeStub.returns(1685565586876);

            // when
            const result = await dockerEngineApiClient.getLogStream(containers.data[0]);

            // then
            const axiosOptions = axiosStub.getCall(0).firstArg as AxiosRequestConfig;
            delete axiosOptions.validateStatus;

            expect(result).toStrictEqual(logStream);
            expect(axiosOptions).toStrictEqual(prepareExpectedConfig(undefined, tcp_path));
        });

        function prepareExpectedConfig(socketPath?: string, baseURL?: string) {

            return {
                socketPath: socketPath,
                baseURL: baseURL,
                method: "get",
                url: "/v1.41/containers/container-1234abcd/logs?stdout=true&follow=true&since=1685565585",
                responseType: "stream",
                headers: {
                    Host: null,
                    Accept: "*/*"
                }
            };
        }
    });

    function prepareClient(connectionType: DockerConnectionType): void {
        prepareConfigurationProviderMock(connectionType);
        dockerEngineApiClient = new DockerEngineApiClient(configurationProviderMock);
    }

    function prepareConfigurationProviderMock(connectionType: DockerConnectionType): void {

        configurationProviderMock= {
            dockerConnection: {
                connectionType: connectionType,
                uri: connectionType === DockerConnectionType.SOCKET
                    ? socket_path
                    : tcp_path
            },
            systemConfig: {
                reconnectionPollRate: 1000
            }
        } as unknown as ConfigurationProvider;
    }
});
