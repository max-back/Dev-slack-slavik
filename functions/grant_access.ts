import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

// Определяем интерфейс для структуры JSON
interface UserMap {
	[key: string]: string; // Ключ - строка, значение - строка
}

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

		const { githubAccessTokenId, url, username } = inputs;

		let _githubUsername = '';

		try {
			const data = await Deno.readTextFile("./assets/users.json"); // Убедитесь, что путь правильный
			const userData: UserMap = JSON.parse(data); // Преобразуем текст в JSON с указанием типа
			
			if ((username in userData)) {
				_githubUsername = userData[username];
			} 
			else {
				throw new Error(`User ${username} not found.`);
			}
		} catch (err) {
			return {
				error:
					`Error reading/parsing file or user missing: \`${err.message}\``,
			};
		}

		const headers = {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${token.external_token}`,
			"Content-Type": "application/json",
			"X-GitHub-Api-Version": "2022-11-28",
		};

		try {
			const { hostname, pathname } = new URL(url);
			const [_, owner, repo] = pathname.split("/");

			// https://docs.github.com/en/enterprise-server@3.3/rest/guides/getting-started-with-the-rest-api
			const apiURL = hostname === "github.com"
				? "api.github.com"
				: `${hostname}/api/v3`;

			// https://docs.github.com/en/rest/collaborators/collaborators?apiVersion=2022-11-28#add-a-repository-collaborator
			const collaboratorEndpoint =
				`https://${apiURL}/repos/${owner}/${repo}/collaborators/${_githubUsername}`;

			const response = await fetch(collaboratorEndpoint, {
				method: "PUT",
				headers,
			});

			console.log(collaboratorEndpoint);

			if (response.status === 201) {
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
