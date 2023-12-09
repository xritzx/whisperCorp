// /{application-name}/{version}/{content-topic-name}/{encoding}
export const VoteTopic = '/whisperCorp/1/votes/json';
export const genThreadTopic = (id: string) => `/whisperCorp/1/thread:${id}/json`;