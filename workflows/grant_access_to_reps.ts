import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GrantAccessDefinition } from "../functions/grant_access.ts";

const GrantAccessToRepsWorkflow = DefineWorkflow({
  callback_id: "grant_access_to_reps_workflow",
  title: "Grant access to reps",
  description: "Grants for user to access the reps",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      user_id: {
        type: Schema.slack.types.user_id,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity", "user_id", "channel_id"],
  },
});

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
      }, {
        name: "user_id",
        title: "User ID",
        description: "Your Slack User ID",
        type: Schema.types.string,
        value: GrantAccessToRepsWorkflow.inputs.user_id,
        hidden: true,
      }],
      required: ["url", "user_id"],
    },
  },
);

const permission = GrantAccessToRepsWorkflow.addStep(GrantAccessDefinition, {
  githubAccessTokenId: {
    credential_source: "DEVELOPER",
  },
  url: permissionsFormData.outputs.fields.url,
  username: {
    value: "max-back",
  },
});

GrantAccessToRepsWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: GrantAccessToRepsWorkflow.inputs.channel_id,
  message:
    `${permission.outputs.message}`
});


export default GrantAccessToRepsWorkflow;
