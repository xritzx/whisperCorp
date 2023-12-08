import lighthouse from '@lighthouse-web3/sdk';

if (!process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY) {
  throw new Error('NEXT_PUBLIC_LIGHTHOUSE_API_KEY is not set');
}

const API_KEY: string = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

export const upload = async (details: any) => {
  const response = await lighthouse.uploadText(JSON.stringify(details), API_KEY, 'test.txt');
  console.log('resonse from lighthouse', response);
  return response.data.Hash;
};

export const getUploads = async () => {
  const response = await lighthouse.getUploads(API_KEY);
  console.log('resonse from lighthouse - all uploads : ', response.data.fileList);
  return response.data.fileList;
};

export const getContents = async (ipfsHash: string) => {
  const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${ipfsHash}`);

  if (response.ok) {
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.toString('utf-8')) {
      // console.log('File content:', buffer.toString('utf-8'));
      return buffer.toString('utf-8');
    }
  } else {
    throw new Error('Network response was not ok.');
  }
};
