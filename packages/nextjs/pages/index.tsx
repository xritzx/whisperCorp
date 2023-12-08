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
              Whisper about your corp anonymously
            </Typography>
            <Typography variant="body1" align="center">
              Engage in private and secure communication within your corporation.
            </Typography>
            <img src="favicon.png" alt="Descriptive Alt Text" style={{ maxWidth: '100%', marginTop: 20 }} />
            {/* Replace 'your-image-url.jpg' with your actual image URL */}
          </Box>
        </Container>

        <Link href="/posts" passHref>
          <Button
            endIcon={<ArrowForwardIosRounded />}
            style={{ color: grey[100], background: purple[400] }}
          >
            Feeds
          </Button>
        </Link>
      </div>
    </>
  );
};

export default Home;
