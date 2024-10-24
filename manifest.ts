import { Manifest } from "deno-slack-sdk/mod.ts";
import GitHubProvider from "./external_auth/github_provider.ts";
import CreateNewIssueWorkflow from "./workflows/create_new_issue.ts";
import GrantAccessToReps from "./workflows/grant_access_to_reps.ts";

/**
 * Манифест приложения содержит конфигурацию приложения. Этот файл определяет
 * такие атрибуты, как имя приложения, описание, доступные Workflows   и многое другое.
 * Узнайте больше: https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "slack-stasic",
  description: "Приносит часто используемую функциональность GitHub в Slack",
  icon: "assets/default_new_app_icon.jpg",
  externalAuthProviders: [GitHubProvider],
  workflows: [CreateNewIssueWorkflow, GrantAccessToReps],
  /**
   * Доменные имена, используемые в удалённых HTTP-запросах, должны быть указаны как исходящие домены.
   * Если ваша организация использует отдельный домен GitHub Enterprise, добавьте его сюда,
   * чтобы выполнять API-вызовы к нему из пользовательской функции.
   */
  outgoingDomains: ["api.github.com"],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "users:read",
    "channels:read",
    "datastore:read",
    "datastore:write",
  ],
});
