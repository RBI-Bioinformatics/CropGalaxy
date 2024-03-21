import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { getLocalVue } from "tests/jest/helpers";

import MockProvider from "@/components/providers/MockProvider";
import { useUserStore } from "@/stores/userStore";

import DatasetError from "./DatasetError.vue";

jest.mock("@/components/providers", () => {
    return {};
});

const localVue = getLocalVue();

async function buildWrapper(has_duplicate_inputs = true, has_empty_inputs = true, user_email = "") {
    const pinia = createPinia();

    const wrapper = await mount(DatasetError as object, {
        propsData: {
            datasetId: "dataset_id",
        },
        localVue,
        stubs: {
            JobDetailsProvider: MockProvider({
                result: {
                    tool_id: "tool_id",
                    tool_stderr: "tool_stderr",
                    job_stderr: "job_stderr",
                    job_messages: [{ desc: "message_1" }, { desc: "message_2" }],
                    user_email: user_email,
                },
            }),
            JobProblemProvider: MockProvider({
                result: { has_duplicate_inputs: has_duplicate_inputs, has_empty_inputs: has_empty_inputs },
            }),
            DatasetProvider: MockProvider({
                result: { id: "dataset_id", creating_job: "creating_job" },
            }),
            FontAwesomeIcon: false,
            FormElement: false,
        },
        pinia,
    });

    const userStore = useUserStore();
    userStore.currentUser = {
        email: user_email || "email",
        id: "user_id",
        tags_used: [],
        isAnonymous: false,
        total_disk_usage: 0,
    };

    return wrapper;
}

describe("DatasetError", () => {
    it("check props with common problems", async () => {
        const wrapper = await buildWrapper();

        console.log(wrapper.html());

        expect(wrapper.find("#dataset-error-tool-id").text()).toBe("tool_id");
        expect(wrapper.find("#dataset-error-tool-stderr").text()).toBe("tool_stderr");
        expect(wrapper.find("#dataset-error-job-stderr").text()).toBe("job_stderr");

        const messages = wrapper.findAll("#dataset-error-job-messages .code");
        expect(messages.at(0).text()).toBe("message_1");
        expect(messages.at(1).text()).toBe("message_2");

        expect(wrapper.find("#dataset-error-has-empty-inputs")).toBeDefined();
        expect(wrapper.find("#dataset-error-has-duplicate-inputs")).toBeDefined();
    });

    // it("check props without common problems", async () => {
    //     const wrapper = await buildWrapper(false, false, "user_email");

    //     expect(wrapper.find("#dataset-error-tool-id").text()).toBe("tool_id");
    //     expect(wrapper.find("#dataset-error-tool-stderr").text()).toBe("tool_stderr");
    //     expect(wrapper.find("#dataset-error-job-stderr").text()).toBe("job_stderr");

    //     expect(wrapper.findAll("#dataset-error-has-empty-inputs").length).toBe(0);
    //     expect(wrapper.findAll("#dataset-error-has-duplicate-inputs").length).toBe(0);
    //     expect(wrapper.findAll("#dataset-error-email").length).toBe(0);
    // });

    // it("hides form fields and button on success", async () => {
    //     const wrapper = await buildWrapper();

    //     const fieldsAndButton = "#fieldsAndButton";
    //     expect(wrapper.find(fieldsAndButton).exists()).toBe(true);

    //     await wrapper.setData({ resultMessages: [["message", "success"]] });

    //     expect(wrapper.find(fieldsAndButton).exists()).toBe(false);
    // });

    // it("does not hide form fields and button on error", async () => {
    //     const wrapper = await buildWrapper();

    //     const fieldsAndButton = "#fieldsAndButton";
    //     expect(wrapper.find(fieldsAndButton).exists()).toBe(true);

    //     const messages = [
    //         ["message", "success"],
    //         ["message", "danger"],
    //     ]; // at least one has "danger"

    //     await wrapper.setData({ resultMessages: messages });

    //     expect(wrapper.find(fieldsAndButton).exists()).toBe(true);
    // });
});
