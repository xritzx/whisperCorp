import Link from 'next/link';
import type { NextPage } from 'next';
import { MetaHeader } from '~~/components/MetaHeader';
import { Box, Button, Container, Typography } from '@mui/material';
import { ArrowForwardIosRounded } from '@mui/icons-material';
import { grey, purple } from '@mui/material/colors';

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <Container>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="80vh" // Adjust the height as needed
          >
            <Typography variant="h3" gutterBottom align="center">
              Voice Freely, Stay Hidden: Secure Anonymity in Corporate Dialogue
            </Typography>
            <Typography variant="body1" align="center" className="pt">
              Welcome to a new era of corporate communication where your voice matters without compromising your identity. Our platform, built on the robust and decentralized Waku protocol, redefines how employees interact within their corporate ecosystem. We champion the power of anonymous dialogue, empowering you to share insights, feedback, and ideas fearlessly
            </Typography>
            <Link style={{ margin: 20, color:"transparent", boxShadow:"0 0 5px #9c27b0, 0 0 10px #9c27b0, 0 0 20px #9c27b0, 0 0 30px #9c27b0" }} href="/posts" passHref>
              <Button
                endIcon={<ArrowForwardIosRounded />}
                style={{ color: grey[100], background: purple[400] }}
              >
                Feed
              </Button>
            </Link>
            <img src="home.png" alt="Descriptive Alt Text" style={{ maxWidth: '100%', marginTop: 20 }} />
            {/* Replace 'your-image-url.jpg' with your actual image URL */}
          </Box>
        </Container>

      </div>
    </>
  );
};

export default Home;
