/* eslint-disable react-hooks/rules-of-hooks */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import styles from './feed.module.css';
import Link from 'next/link';
import commonStyles from './common.module.css';
import Box from '@mui/system/Box';
import { signTypedData } from '@wagmi/core';
import { LightNode } from '@waku/sdk';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { format } from 'date-fns';
import { useGlobalState } from '~~/services/store/store';
import { useLightNode } from '~~/services/waku/LightNodeContext';
import { Vote } from '~~/services/waku/proto/vote';
import { getContents, getUploads, upload } from '~~/services/lighthouse';
import { notification } from '~~/utils/scaffold-eth';
import { createVote, loadVotes, subscribeToWakuVotes, } from '~~/services/waku/service';
import { domain, types } from '~~/utils/signMessage';
import CreatePostModal from '~~/components/modal';
import { Card, Typography } from '@mui/material';


import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

import DirectionsIcon from '@mui/icons-material/Directions';
import { BlockieAvatar } from '~~/components/scaffold-eth';
import { maskHexAddress } from '~~/utils/hashing';
import PolygonIDVerifier from './PolygonIDVerifier';

const Feed = () => {
  const { node, isLoading } = useLightNode();
  const [pageLoading, setPageLoading] = useState(true);
  const { accountAddress, category, companyName } = useGlobalState();
  const [uploads, setUploads] = useState<any>({});
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [ provedAccess, setProvedAccess ] = useState(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const serverURL = process.env.NEXT_PUBLIC_REACT_APP_VERIFICATION_SERVER_LOCAL_HOST_URL as string;  

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

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
      notification.error('Please sign in to whisperCorp ');
      return;
    }
    const voteData = {
      postId: cid,
      title: title,
      vote: 'UpVote',
      disclaimer: 'You are signing the vote, but your data is not stored with us',
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
      disclaimer: 'You are signing the vote, but your data is not stored with use',
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

  const handleSubmit = async (title: string, body: string) => {
    if (!accountAddress) {
      notification.error('Please sign in to whisperCorp ');
      return;
    }

    const postData = {
      title,
      body,
      date,
      disclaimer: 'Your signature would be taken in the post, no data is stored',
      category,
      maskedAddress: maskHexAddress(accountAddress, 2, 15),
      companyName: companyName
    };
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
      const hash = await upload({ ...postData, sign: userTypedSignature });
      console.log('use this hash to start a thread', hash);
    } catch (e: any) {
      notification.error(e.message);
    }

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
    setPageLoading(false);
    // console.log(messageMap);
  };

  useEffect(() => {
    if (isLoading) return;
    fetchUploads();
    subscribeToWakuVotes(node as LightNode, onlikesData);
  }, [isLoading]);

  if (isLoading || pageLoading) {
    return (
      <div className={commonStyles['loader-parent']}>
        <div className={commonStyles.loader}></div>
      </div>
    );
  }

  return (
    <>

      {!provedAccess?
          <Box className={styles['vc-check-page']}>
            <Box>
              <Card
                style={{
                  border: '2px solid #805AD5',
                }}
              >
                  <p>
                    Please verify you corporate ID with your Polygon ID issued by your corporation
                  </p>
  
                  <PolygonIDVerifier 
                    credentialType={"VerifyCompanyId"} 
                    issuerOrHowToLink={
                      'https://oceans404.notion.site/How-to-get-a-Verifiable-Credential-f3d34e7c98ec4147b6b2fae79066c4f6?pvs=4'
                    }
                    onVerificationResult={setProvedAccess} 
                    serverUrl={serverURL} 
                  />

              </Card>
            </Box>
          </Box>
      :(<Box className={commonStyles['page-container']}>

        <div className="p-4">

          <Paper
            onClick={openModal}
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 570 }}
          >

            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="🤫 start whispering now"
              inputProps={{ 'aria-label': 'search google maps' }}
            />

            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
              <DirectionsIcon />
            </IconButton>
          </Paper>
          {modalOpen && (<CreatePostModal isOpen={modalOpen} onClose={closeModal} onSubmit={handleSubmit} />)}
        </div>

        {Object.values(uploads).map((data: any) => (
          <div key={data.cId}
            className="relative flex w-full max-w-[35rem] flex-col rounded-xl bg-transparent bg-clip-border text-gray-700 shadow-none">
            <div
              className="relative flex gap-4 pt-0 pb-1 mx-0 mt-4 overflow-hidden text-gray-700 bg-transparent shadow-none rounded-xl bg-clip-border">
              <BlockieAvatar
                address={data.maskedAddress ? data.maskedAddress : '0'}
                // size={20} 
                classN={"relative inline-block h-[60px] w-[60px] !rounded-full  object-cover object-center"} size={0} />
              <div className="flex w-full flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <h5
                    className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                    {data.category ? data.category : "📺 Misc"}
                  </h5>
                </div>
                <p className="block font-sans text-base antialiased font-light leading-relaxed text-blue-gray-900" style={{ margin: "1px" }}>
                  {data.companyName ? '@ ' + data.companyName : "@ Unknown"}
                </p>
              </div>
              <KeyboardArrowUpIcon style={{ color: '#008800' }} onClick={() => upVote(data.cid, data.title)} />
              <KeyboardArrowDownIcon style={{ color: '#ff0000' }} onClick={() => downVote(data.cid, data.title)} />

              <Typography
                className="items-center justify-between"
                sx={{
                  color: data.votes < 0 ? 'red' : 'green',
                  fontWeight: 'bold',
                  justifyContent: 'center',
                }}
              >
                {data.votes}
              </Typography>
            </div>
            <Link href={`/posts/${data.cid}`} passHref key={data.cid} className={styles.link}>

              <div className="p-0 mb-4">
                <h5
                  className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900 mt-1">
                  {data.title}
                </h5>

                <p className="block font-sans text-base antialiased font-light leading-relaxed text-inherit mt-1">
                  {data.body}
                </p>

              </div>
            </Link>
          </div>
        ))}
      </Box>)}
    </>
  );
};

export default Feed;
