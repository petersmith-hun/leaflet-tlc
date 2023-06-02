import { IdentityMapper } from "@app/pipeline/mapper/identity-mapper";

describe("Unit tests for IdentityMapper", () => {

    let identityMapper: IdentityMapper;

    beforeEach(() => {
        identityMapper = new IdentityMapper();
    });

    describe("Test scenarios for #map", () => {

        it("should return the input data if populated", () => {

            // given
            const inputData = { data: "something" };

            // when
            const result = identityMapper.map(inputData);

            // then
            expect(result).toBe(inputData);
        });

        it("should return the input data if null", () => {

            // when
            // @ts-ignore
            const result = identityMapper.map(null);

            // then
            expect(result).toBeNull();
        });
    });
});
