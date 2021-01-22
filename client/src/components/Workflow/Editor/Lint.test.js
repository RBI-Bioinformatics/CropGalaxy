import { mount } from "@vue/test-utils";
import { getLocalVue } from "jest/helpers";
import Lint from "./Lint";
import { UntypedParameters } from "./modules/parameters";

jest.mock("app");

const localVue = getLocalVue();

describe("Lint", () => {
    let wrapper;

    beforeEach(() => {
        const untypedParameters = new UntypedParameters();
        wrapper = mount(Lint, {
            propsData: {
                untypedParameters: untypedParameters,
                nodes: {
                    "1": {
                        id: "1",
                        title: "",
                        label: "",
                        annotation: "",
                        inputTerminals: {},
                        outputTerminals: {},
                        activeOutputs: {
                            getAll() {
                                return [];
                            },
                        },
                    },
                    "2": {
                        id: "2",
                        title: "",
                        label: "",
                        annotation: "",
                        inputTerminals: {},
                        activeOutputs: {
                            getAll() {
                                return [];
                            },
                        },
                    },
                },
                annotation: "annotation",
                license: null,
                creator: null,
            },
            localVue,
        });
    });

    it("test checked vs unchecked issues", async () => {
        const checked = wrapper.findAll("[data-icon='check']");
        // Expecting 5 checks:
        // 1. Workflow is annotated
        // 2. Workflow parameters (if available) are formal inputs
        // 3. Non-optional inputs (if available) are formal inputs
        // 4. Inputs (if available) have labels and annotations
        // 5. Outputs (if availabe) have labels
        expect(checked.length).toBe(5);
        const unchecked = wrapper.findAll("[data-icon='exclamation-triangle']");
        // Expecting 3 warnings:
        // 1. Workflow creator is not specified
        // 2. Workflow license is not specified
        // 3. Workflow has no labeled outputs
        expect(unchecked.length).toBe(3);
        const links = wrapper.findAll("a");
        expect(links.length).toBe(2);
        expect(links.at(0).text()).toContain("Provide Creator Details.");
        expect(links.at(1).text()).toContain("Specify a License.");
    });
});
