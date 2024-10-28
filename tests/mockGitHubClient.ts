// tests/mockGitHubClient.ts
export function createMockGitHubClient(mockResponses: any) {
    return {
        repos: {
            addCollaborator: async (owner: string, repo: string, username: string) => {
                // Имитация успешного добавления коллаборатора
                if (mockResponses.repos.addCollaborator.ok) {
                    return { status: 201 }; // HTTP статус для успешного добавления
                }
                // Имитация ошибки, если пользователь не найден
                throw new Error(mockResponses.repos.addCollaborator.error);
            },
            // Добавьте другие методы, которые вам нужны для тестирования
        },
        // Имитация других методов GitHub API, если необходимо
    };
}