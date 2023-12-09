/* eslint-disable react-hooks/rules-of-hooks */

/* eslint-disable prefer-const */
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import commonStyles from '../common.module.css';
import styles from './[cid].module.css';
import { CardContent, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import { LightNode } from '@waku/sdk';
import { useLightNode } from '~~/services/waku/LightNodeContext';
import { Thread } from '~~/services/waku/proto/thread';
import { getContents } from '~~/services/lighthouse';
import { sendMessageToThread, loadThread, decodeThreadMessage, subscribeToWakuComment } from '~~/services/waku/service';
import { BlockieAvatar } from '~~/components/scaffold-eth';
import { useGlobalState } from '~~/services/store/store';
import { signTypedData } from '@wagmi/core';
import { domain, types } from '~~/utils/signMessage';
import { notification } from '~~/utils/scaffold-eth';

const PostDetail = () => {
  const router = useRouter();
  const cid = router.query.cid as string;
  const { node, isLoading } = useLightNode();
  const [inputValue, setInputValue] = useState('');
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [postDetails, setPostDetails] = useState<any>('');
  const { accountAddress } = useGlobalState();

  const storeQueryFunction = async (node: LightNode, cid: string) => {
    const messagesArray: any[] = [];
    await loadThread(node as LightNode, cid, (msg: any)=>{
      const decodedMessage = decodeThreadMessage(msg);
      console.log('decodedMessage', decodedMessage);
      messagesArray.push(decodedMessage);
    });
    setThreadMessages(messagesArray);
  };

  const onNewComment = (comment: Thread) => {
    console.log('new Comment arrived');
    setThreadMessages(currentMessages => [comment, ...currentMessages]);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isLoading) return;
      const postData = await getContents(cid);
      setPostDetails(JSON.parse(postData as any));
      await storeQueryFunction(node as LightNode, cid);
      await subscribeToWakuComment(cid as string, node as LightNode, onNewComment);
    };
    fetchData();
  }, [isLoading]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const signPayload = {
      address: accountAddress,
      postId: cid
    }
    const userTypedSignature = await signTypedData({ domain, types, primaryType: 'Thread', message: signPayload });
    const sentMessage = await sendMessageToThread(node, cid, inputValue, userTypedSignature);
    if(sentMessage?.errors && sentMessage.errors.length>0){
      notification.error(`Failed creating comment: ${sentMessage.errors[0]}`)
    } else {
      setInputValue('');
    }
  };

  if (isLoading) {
    return (
      <div className={commonStyles['loader-parent']}>
        <div className={commonStyles.loader}></div>
      </div>
    );
  }

  return (
    <div className={`${commonStyles['page-container']} ${styles['posts-container']}`}>
      <div key={postDetails.cId}
            className="relative flex w-full max-w-[35rem] flex-col rounded-xl bg-transparent bg-clip-border text-gray-700 shadow-none">
            <div
              className="relative flex gap-4 pt-0 pb-1 mx-0 mt-4 overflow-hidden text-gray-700 bg-transparent shadow-none rounded-xl bg-clip-border">
               <BlockieAvatar 
                address={postDetails.maskedAddress ? postDetails.maskedAddress : '0'}
                // size={20} 
                classN={"relative inline-block h-[60px] w-[60px] !rounded-full  object-cover object-center"} size={0}              />
              <div className="flex w-full flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <h5
                    className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                    {postDetails.category? postDetails.category: "📺 Misc"}
                  </h5>
                </div>
                <p className="block font-sans text-base antialiased font-light leading-relaxed text-blue-gray-900" style={{ margin: "1px" }}>
                  @ Google
                </p>
              </div>
              <Typography
                className="items-center justify-between"
                sx={{
                  color: postDetails.votes < 0 ? 'red' : 'green',
                  fontWeight: 'bold',
                  justifyContent: 'center',
                }}
              >
                {postDetails.votes}
              </Typography>
            </div>

              <div className="p-0 mb-4">
                <h5
                  className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900 mt-1">
                  {postDetails.title}
                </h5>

                <p className="block font-sans text-base antialiased font-light leading-relaxed text-inherit mt-1">
                  {postDetails.body}
                </p>

              </div>
          </div>
      <form onSubmit={handleSubmit} className={styles['comment-container']}>
        <TextField
          variant="outlined"
          type="text"
          value={inputValue}
          placeholder="Post your comments..."
          onChange={e => setInputValue(e.target.value)}
        />
        <div>
          <Button variant="contained" type="submit" sx={{ marginTop: '10px' }}>
            Submit
          </Button>
        </div>
      </form>
      <div className={styles['comment-parent']}>
        {threadMessages.map((obj, index) => (
          <div key={index} className={styles.comment}>
            <div>
              <BlockieAvatar 
                address={obj.sign} 
                size={25} 
              />
            </div>
            <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '10px' }}>
              {(new Date(Number(obj.timestamp)).toLocaleString())}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '10px' }}>
              {obj.message}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostDetail;
