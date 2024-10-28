import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals, assertRejects } from "https://deno.land/std@0.153.0/testing/asserts.ts";

import GrantAccessDefinition from "./grant_access.ts"; // Импортируйте вашу функцию
import { createMockGitHubClient } from "../tests/mockGitHubClient.ts"; // Предположим, у вас есть функция для создания мок-клиента

Deno.test("Grant Access - Success", async () => {
    const mockClient = createMockGitHubClient({
        apps: {
            auth: {
                external: {
                    get: async () => ({
                        ok: true,
                        external_token: "mock_token",
                    }),
                },
            },
        },
    });

    const inputs = {
        githubAccessTokenId: "mock_token_id",
        url: "https://github.com/owner/repo",
        username: "testUser",
    };

    const { outputs } = await GrantAccessDefinition({ inputs, client: mockClient });

    assertEquals(outputs?.message, "User  testUser  has been added as a collaborator to the repository.");
});

Deno.test("Grant Access - User Not Found", async () => {
    const mockClient = createMockGitHubClient({
        apps: {
            auth: {
                external: {
                    get: async () => ({
                        ok: true,
                        external_token: "mock_token",
                    }),
                },
            },
        },
    });

    const inputs = {
        githubAccessTokenId: "mock_token_id",
        url: "https://github.com/owner/repo",
        username: "nonExistentUser ",
    };

    const { outputs } = await GrantAccessDefinition({ inputs, client: mockClient });

    assertEquals(outputs?.message, "Error reading/parsing file or user missing: `User  nonExistentUser  not found.`");
});

Deno.test("Grant Access - Token Retrieval Failure", async () => {
    const mockClient = createMockGitHubClient({
        apps: {
            auth: {
                external: {
                    get: async () => ({
                        ok: false,
                    }),
                },
            },
        },
    });

    const inputs = {
        githubAccessTokenId: "invalid_token_id",
        url: "https://github.com/owner/repo",
        username: "testUser ",
    };

    await assertRejects(
        async () => {
            await GrantAccessDefinition({ inputs, client: mockClient });
        },
        Error,
        "Failed to access auth token",
    );
});