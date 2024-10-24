import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GrantAccessDefinition } from "../functions/grant_access.ts";

const GrantAccessToRepsWorkflow = DefineWorkflow({
  callback_id: "grant_access_to_reps_workflow", // возможно убрать workflow в конце
  title: "Grant access to reps",
  description: "Grants for user to access the reps",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity", "user", "channel"],
  },
  output_parameters: {
    properties: {
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["user"],
  },
});

// Шаг 1: Открытие формы
const permissionsFormData = GrantAccessToRepsWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Get access to repository",
    interactivity: GrantAccessToRepsWorkflow.inputs.interactivity,
    submit_label: "Get",
    description: "Get  access to Github repository",
    fields: {
      elements: [{
        name: "url",
        title: "Repository URL",
        description: "The GitHub URL of the repository",
        type: Schema.types.string,
        format: "url",
      }],
      required: ["url"],
    },
  },
);

// Шаг -: Логирование после открытия формы
// GrantAccessToRepsWorkflow.addStep(Schema.slack.functions.SendMessage, {
//   channel_id: GrantAccessToRepsWorkflow.inputs.channel,
//   message: `Form opened for user: ${GrantAccessToRepsWorkflow.inputs.user}.`,
// });

// Шаг 2: Инициирование функции
const permission = GrantAccessToRepsWorkflow.addStep(GrantAccessDefinition, {
  githubAccessTokenId: {
    credential_source: "DEVELOPER",
  },
  url: permissionsFormData.outputs.fields.url,
  username: GrantAccessToRepsWorkflow.inputs.user,
});

// Шаг 3: Логирование результата
GrantAccessToRepsWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: GrantAccessToRepsWorkflow.inputs.channel,
  message: `Permission granted: ${permission.outputs.message}`,
});

export default GrantAccessToRepsWorkflow;
