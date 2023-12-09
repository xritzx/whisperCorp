import { LightNode, createEncoder, PageDirection, createDecoder } from '@waku/sdk';
import { VoteTopic, genThreadTopic } from '~~/services/waku/interface';
import { Thread } from '~~/services/waku/proto/thread';
import { Vote } from '~~/services/waku/proto/vote';
import { notification } from '~~/utils/scaffold-eth';

export const sendMessageToThread = async (
  lightNode: LightNode | null,
  threadId: string,
  message: string,
  userTypedSignature: string,
) => {
  // const lightNode = await getLightNode();
  console.log('Sender : Light Node started');
  // Choose a content topic
  const contentTopic = genThreadTopic(threadId);
  console.log(contentTopic);
  
  const encoder = createEncoder({
    contentTopic: contentTopic, // message content topic
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
  return sentMessage;
};

export async function createVote(node: LightNode, data: Partial<Vote>) {
  const pushedValue = await node.lightPush.send(createEncoder({ contentTopic: VoteTopic }), {
    payload: Vote.encode({
      timestamp: BigInt(Date.now()),
      isUpvote: data.isUpvote,
      cId: data.cId,
      userSignature: data.userSignature,
    }),
  });
  console.log("Vote Sent:", pushedValue);
  if(pushedValue.errors && pushedValue.errors.length>0){
    notification.error(`Failed creating vote: ${pushedValue.errors[0]}`)
  } 
  return pushedValue;
}

export const loadThread = async (lightNode: LightNode, threadId: string, cb: any) => {
  const contentTopic = genThreadTopic(threadId);
  const decoder = createDecoder(contentTopic);
  await lightNode.store.queryWithOrderedCallback([decoder], cb);
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
  console.log("Attaching Vote subs");
  try {
    await node.filter.subscribe([createDecoder(VoteTopic)], wakuMessage => {
      const messageObj = Vote.decode(wakuMessage.payload);
      callback(messageObj);
    });
  } catch (e) {
    notification.error("Error subscribing to votes topic");
  }
};

export const subscribeToWakuComment = async (threadId: string, node: LightNode, callback: any) => {
  console.log("Attaching Comment subs");
  try {
    await node.filter.subscribe([createDecoder(genThreadTopic(threadId))], wakuMessage => {
      const messageObj = Thread.decode(wakuMessage.payload);
      callback(messageObj);
    });
  } catch (e) {
    notification.error("Error subscribing to votes topic");
  }
};
