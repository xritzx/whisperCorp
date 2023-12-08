// All properties on a domain are optional
export const domain = {
  name: 'Hackathon',
  version: '1',
  // chainId: 1,
} as const;

// The named list of all type definitions
export const types = {
  Posts: [
    { name: 'title', type: 'string' },
    { name: 'body', type: 'string' },
    { name: 'date', type: 'string' },
    { name: 'disclaimer', type: 'string' },
  ],

  Vote: [
    { name: 'postId', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'vote', type: 'string' },
    { name: 'disclaimer', type: 'string' },
  ],
} as const;
