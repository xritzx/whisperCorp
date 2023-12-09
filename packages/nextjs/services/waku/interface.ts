// /{application-name}/{version}/{content-topic-name}/{encoding}
export const VoteTopic = '/whisperCorp/2/votes/proto';
export const genThreadTopic = (id: string) => `/whisperCorp/2/thread:${id}/proto`;