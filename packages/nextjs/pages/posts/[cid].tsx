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
    const storeQuery = await loadThread(node as LightNode, cid);
    for await (const messagesPromises of storeQuery) {
      await Promise.all(
        messagesPromises.map(async (p: any) => {
          const msg = await p;
          const decodedMessage = decodeThreadMessage(msg);
          console.log('decodedMessage', decodedMessage);
          messagesArray.push(decodedMessage);
        }),
      );
    }
    setThreadMessages(messagesArray);
  };

  const onNewComment = (comment: Thread) => {
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
    // if(inputValue.length < 10) {
    //   notification.warning('Please input a meaningful comment');
    //   return;
    // }
    await sendMessageToThread(node, cid, inputValue);
    setInputValue('');
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
      <Card>
        <CardContent sx={{ textDecoration: 'none !important' }}>
          <Typography gutterBottom variant="h5" component="div">
            {postDetails.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {postDetails.body}
          </Typography>
          <Typography variant="body2" color="text.tertiary">
            {postDetails.date}
          </Typography>
        </CardContent>
      </Card>
      <form onSubmit={handleSubmit} className={styles['comment-container']}>
        <TextField
          variant="outlined"
          type="text"
          value={inputValue}
          placeholder="Post you comments..."
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
                address={accountAddress} 
                size={20} 
              />
            </div>
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
