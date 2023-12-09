import { LightNode, createEncoder, PageDirection, createDecoder } from '@waku/sdk';
import { VoteTopic } from '~~/services/waku/interface';
import { Thread } from '~~/services/waku/proto/thread';
import { Vote } from '~~/services/waku/proto/vote';

export const sendMessageToThread = async (
  lightNode: LightNode | null,
  threadId: string,
  message: string,
  userTypedSignature: string,
): Promise<void> => {
  // const lightNode = await getLightNode();
  console.log('Sender : Light Node started');
  // Choose a content topic
  const contentTopic = threadId;

  const encoder = createEncoder({
    contentTopic: contentTopic, // message content topic
    // ephemeral: false, // allows messages to be persisted or not
  });

  // Serialise the message using Protobuf
  const serialisedMessage = Thread.encode({
    timestamp: BigInt(Date.now()),
    message: message,
    sign: userTypedSignature
  });

  // Send the message using Light Push
  const sentMessage = await lightNode?.lightPush.send(encoder, {
    payload: serialisedMessage,
  });

  console.log('Message sent', sentMessage);
};

export async function createVote(node: LightNode, data: Partial<Vote>) {
  await node.lightPush.send(createEncoder({ contentTopic: VoteTopic }), {
    payload: Vote.encode({
      timestamp: BigInt(Date.now()),
      isUpvote: data.isUpvote,
      cId: data.cId,
      userSignature: data.userSignature,
    }),
  });
}

export const loadThread = async (lightNode: LightNode, threadId: string) => {
  const contentTopic = threadId;
  const decoder = createDecoder(contentTopic);

  console.log('querying the store');
  const storeQuery = lightNode.store.queryGenerator([decoder], {
    pageDirection: PageDirection.BACKWARD,
  });
  console.log('store query created');

  return storeQuery;
};

export const loadVotes = async (lightNode: LightNode) => {
  const query = lightNode.store.queryGenerator([createDecoder(VoteTopic)]);
  return query;
};

// Create the callback function
export const decodeThreadMessage = (wakuMessage: any) => {
  // Check if there is a payload on the message
  if (!wakuMessage.proto.payload) return;
  const messageObj = Thread.decode(wakuMessage.proto.payload);
  return messageObj;
};

export const subscribeToWakuVotes = async (node: LightNode, callback: any) => {
  await node.filter.subscribe([createDecoder(VoteTopic)], wakuMessage => {
    const messageObj = Vote.decode(wakuMessage.payload);
    callback({
      ...messageObj,
    });
  });
};

export const subscribeToWakuComment = async (threadId: string, node: LightNode, callback: any) => {
  await node.filter.subscribe([createDecoder(threadId)], wakuMessage => {
    const messageObj = Thread.decode(wakuMessage.payload);
    callback({
      ...messageObj,
    });
  });
};
