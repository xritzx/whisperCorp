/* eslint-disable react-hooks/rules-of-hooks */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import commonStyles from './common.module.css';
import styles from './feed.module.css';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { CardActionArea } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import { signTypedData } from '@wagmi/core';
import { LightNode } from '@waku/sdk';
import { format } from 'date-fns';
import { useGlobalState } from '~~/services/store/store';
import { useLightNode } from '~~/services/waku/LightNodeContext';
import { Vote } from '~~/services/waku/proto/vote';
import { getContents, getUploads, upload } from '~~/services/lighthouse';
import { notification } from '~~/utils/scaffold-eth';
import { createVote, loadVotes, subscribeToWakuVotes, } from '~~/services/waku/service';
import { domain, types } from '~~/utils/signMessage';

const Feed = () => {
  const { node, isLoading } = useLightNode();
  const { accountAddress } = useGlobalState();
  const [uploads, setUploads] = useState<any>({});
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const onlikesData = (data: any) => {
    if (uploads[data.cId] === undefined) {
      console.log("no uploads and I don't know why");
      fetchUploads();
    } else {
      console.log('has uploads');
    }
    uploads[data.cId].votes += data.isUpvote ? 1 : -1;
    console.log(uploads);
    setUploads(JSON.parse(JSON.stringify(uploads)));
  };

  const upVote = async (cid: string, title: string) => {
    if (!accountAddress) {
      notification.error('Please sign in to web3blind ');
      return;
    }
    const voteData = {
      postId: cid,
      title: title,
      vote: 'UpVote',
      disclaimer: 'This is a disclaimer which needs to be defined',
    };
    try {
      const userTypedSignature = await signTypedData({ domain, types, primaryType: 'Vote', message: voteData });
      console.log('userTypedSignature', userTypedSignature);
      await createVote(
        node as LightNode,
        {
          cId: cid,
          isUpvote: true,
          userSignature: userTypedSignature,
        } as unknown as Vote,
      );
      console.log('upvote on', cid);
    } catch (e: any) {
      notification.error(e.message);
    }
  };

  const downVote = async (cid: string, title: string) => {
    if (!accountAddress) {
      notification.error('Please sign in to whisperCorp ');
      return;
    }
    const voteData = {
      postId: cid,
      title: title,
      vote: 'DownVote',
      disclaimer: 'This is a disclaimer which needs to be defined',
    };

    try {
      const userTypedSignature = await signTypedData({ domain, types, primaryType: 'Vote', message: voteData });
      console.log('userTypedSignature', userTypedSignature);
      await createVote(
        node as LightNode,
        {
          cId: cid,
          isUpvote: false,
          userSignature: userTypedSignature,
        } as unknown as Vote,
      );
      console.log('downvote on', cid);
    } catch (e: any) {
      notification.error(e.message);
    }
  };

  const fetchVotes = async (messageMap: Record<string, any>) => {
    const votes = await loadVotes(node as LightNode);
    console.log('loading votes...');
    for await (const votePromise of votes) {
      await Promise.all(
        votePromise.map(async (p: any) => {
          const msg = await p;
          const vote = Vote.decode(msg.proto.payload);
          // console.log('decodedMessage', vote);
          messageMap[vote.cId].votes += vote.isUpvote ? 1 : -1;
        }),
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accountAddress) {
      notification.error('Please sign in to web3blind ');
      return;
    }
    const postData = { title, body, date, disclaimer: 'This is a disclaimer which needs to be defined' };

    if (title.length === 0 || body.length === 0) {
      alert('Please fill out both the fields');
      return;
    }
    if (body.length < 10) {
      alert('Please write a longer post');
      return;
    }

    try {
      const userTypedSignature = await signTypedData({ domain, types, primaryType: 'Posts', message: postData });
      console.log('userTypedSignature', userTypedSignature);
    } catch (e: any) {
      notification.error(e.message);
    }

    const hash = await upload(postData);
    console.log('use this hash to start a thread', hash);
    setTitle('');
    setBody('');

    await new Promise(resolve => {
      setTimeout(resolve, 3000);
    });

    await fetchUploads();
  };

  const fetchUploads = async () => {
    console.log('fetching uploads');
    const uploadsData = await getUploads();
    const contentsWithCid = await Promise.all(
      uploadsData.map(async data => {
        const content = await getContents(data.cid);
        return { cid: data.cid, content };
      }),
    );
    const uploadsAndContent = contentsWithCid
      .map(({ cid, content }) => ({ cid, ...JSON.parse(content as any) }))
      .map(data => ({ ...data, votes: 0 }));
    const messageMap: Record<string, any> = {};
    uploadsAndContent.forEach(x => {
      messageMap[x.cid] = x;
    });
    await fetchVotes(messageMap);
    setUploads(messageMap);
    // console.log(messageMap);
  };

  useEffect(() => {
    if (isLoading) return;
    fetchUploads();
    subscribeToWakuVotes(node as LightNode, onlikesData);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className={commonStyles['loader-parent']}>
        <div className={commonStyles.loader}></div>
      </div>
    );
  }

  return (
    <>
      <div className={commonStyles['page-container']}>
        <form onSubmit={handleSubmit} className={styles['posts-form']}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '10px',
              justifyContent: 'space-between',
            }}
          >
            <TextField
              label="Title"
              variant="outlined"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <div className={styles.mb10} />
            <TextField
              label="Body"
              variant="outlined"
              type="text"
              value={body}
              onChange={e => setBody(e.target.value)}
              multiline
              rows={6}
            />
          </Box>
          <Button variant="contained" type="submit">
            Post
          </Button>
        </form>
        <div>
          {Object.values(uploads).map((data: any) => (
            <div key={data.cId} className={styles['card-parent']}>
              <Box sx={{ display: 'flex', alignItems: 'start' }}>
                <Card sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Button onClick={() => upVote(data.cid, data.title)}>
                      <ArrowUpwardIcon />
                    </Button>
                    <Button onClick={() => downVote(data.cid, data.title)}>
                      <ArrowDownwardIcon />
                    </Button>
                    <Typography
                      sx={{
                        mt: 1,
                        color: data.votes < 0 ? 'red' : 'green',
                        fontWeight: 'bold',
                      }}
                    >
                      {data.votes}
                    </Typography>
                  </Box>
                  <Link href={`/posts/${data.cid}`} passHref key={data.cid} className={styles.link}>
                    <CardActionArea>
                      <CardContent sx={{ textDecoration: 'none !important' }}>
                        <Typography gutterBottom variant="h5" component="div">
                          {data.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {data.body}
                        </Typography>
                        <Typography variant="body2" color="text.tertiary">
                          {data.date}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Link>
                </Card>
              </Box>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Feed;
