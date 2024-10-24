import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import GrantAccessToRepsWorkflow from "../workflows/grant_access_to_reps.ts";

const grantAccessToRepsShortcut: Trigger<
    typeof GrantAccessToRepsWorkflow.definition
> = {
    type: TriggerTypes.Shortcut,
    name: "Get repository access",
    description: "Add to Github repository a new contributor",
    workflow: `#/workflows/${GrantAccessToRepsWorkflow.definition.callback_id}`,
    inputs: {
        interactivity: {
          value: TriggerContextData.Shortcut.interactivity || "", // Передаем значение интерактивности
        },
        user: {
          value: TriggerContextData.Shortcut.user_id || "", // Передаем user_id
        },
        channel: {
          value: TriggerContextData.Shortcut.channel_id || "", // Передаем channel_id
        },
      },
};

export default grantAccessToRepsShortcut;
