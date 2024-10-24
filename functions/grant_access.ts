import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const GrantAccessDefinition = DefineFunction({
	callback_id: "grant_access",
	title: "Grant access to Github repository",
	description:
		"A user with a repository URL and certain permissions can access a specific Github repository",
	source_file: "functions/grant_access.ts",
	input_parameters: {
		properties: {
			githubAccessTokenId: {
				type: Schema.slack.types.oauth2,
				oauth2_provider_key: "github",
			},
			url: {
				type: Schema.types.string,
				description: "Repository URL",
			},
			username: {
				type: Schema.types.string,
				description: "GitHub username of the contributor to add",
			},
		},
		required: [
			"githubAccessTokenId",
			"url",
			"username",
		],
	},
	output_parameters: {
		properties: {
			message: {
				type: Schema.types.string,
				description: "Response message",
			},
		},
		required: [
			"message",
		],
	},
});

export default SlackFunction(
	GrantAccessDefinition,
	async ({ inputs, client }) => {
		const token = await client.apps.auth.external.get({
			external_token_id: inputs.githubAccessTokenId,
		});

		if (!token.ok) throw new Error("Failed to access auth token");

		if 

		const headers = {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${token.external_token}`,
			"Content-Type": "application/json",
			"X-GitHub-Api-Version": "2022-11-28",	
		};

		const { githubAccessTokenId, url, username } = inputs;

		try {
			const { hostname, pathname } = new URL(url);
			const [_, owner, repo] = pathname.split("/");

			// https://docs.github.com/en/enterprise-server@3.3/rest/guides/getting-started-with-the-rest-api
			const apiURL = hostname === "github.com"
				? "api.github.com"
				: `${hostname}/api/v3`;

			// https://docs.github.com/en/rest/collaborators/collaborators?apiVersion=2022-11-28#add-a-repository-collaborator
			const collaboratorEndpoint =
				`https://${apiURL}/repos/${owner}/${repo}/collaborators/${username}`;

			const response = await fetch(collaboratorEndpoint, {
				method: "PUT",
				headers,
			});

			// console.error(`${new Date().toISOString()} - ${hostname}`);
			// console.error(`${new Date().toISOString()} - ${apiURL}`);
			// console.error(`${new Date().toISOString()} - ${collaboratorEndpoint}`);
			// console.error(`${new Date().toISOString()} - ${response.json()}`);
			// console.error(`${new Date().toISOString()} - ${headers}`);

			if (response.status === 204) {
				return {
					outputs: {
						message:
							`User ${username} has been added as a collaborator to the repository.`,
					},
				};
			} else {
				throw new Error(`${response.status}: ${response.statusText}`);
			}
		} catch (err) {
			console.error(`${new Date().toISOString()} - ${err.message}`);
			return {
				error:
					`An error was encountered while adding the contributor: \`${err.message}\``,
			};
		}
	},
);
