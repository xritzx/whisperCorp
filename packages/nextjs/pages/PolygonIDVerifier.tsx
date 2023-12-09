import { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button,
  Center,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import { io } from 'socket.io-client';

const linkDownloadPolygonIDWalletApp = 'https://0xpolygonid.github.io/tutorials/wallet/wallet-overview/#quick-start';

function PolygonIDVerifier({
  credentialType,
  issuerOrHowToLink,
  onVerificationResult,
  publicServerURL,
  localServerURL,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sessionId, setSessionId] = useState('');
  const [qrCodeData, setQrCodeData] = useState();
  const [isHandlingVerification, setIsHandlingVerification] = useState(false);
  const [verificationCheckComplete, setVerificationCheckComplete] = useState(false);
  const [verificationMessage, setVerfificationMessage] = useState('');
  const [socketEvents, setSocketEvents] = useState([]);

  // serverUrl is localServerURL if not running in prod
  // Note: the verification callback will always come from the publicServerURL
  const serverUrl = window.location.href.startsWith('https') ? publicServerURL : localServerURL;

  const getQrCodeApi = sessionId => serverUrl + `/api/get-auth-qr?sessionId=${sessionId}`;

  const socket = io(serverUrl);

  useEffect(() => {
    socket.on('connect', () => {
      setSessionId(socket.id);

      // only watch this session's events
      socket.on(socket.id, arg => {
        setSocketEvents(socketEvents => [...socketEvents, arg]);
      });
    });
  }, []);

  useEffect(() => {
    const fetchQrCode = async () => {
      const response = await fetch(getQrCodeApi(sessionId));
      const data = await response.text();
      return JSON.parse(data);
    };

    if (sessionId) {
      fetchQrCode().then(setQrCodeData).catch(console.error);
    }
  }, [sessionId]);

  // socket event side effects
  useEffect(() => {
    if (socketEvents.length) {
      console.log('socketEvents', socketEvents);

      const currentSocketEvent = socketEvents[socketEvents.length - 1];

      if (currentSocketEvent.fn === 'handleVerification') {
        if (currentSocketEvent.status === 'IN_PROGRESS') {
          setIsHandlingVerification(true);
        } else {
          setIsHandlingVerification(false);
          setVerificationCheckComplete(true);
          if (currentSocketEvent.status === 'DONE') {
            setVerfificationMessage('✅ Verified proof');
            setTimeout(() => {
              reportVerificationResult(true);
            }, '2000');
            socket.close();
          } else {
            setVerfificationMessage('❌ Error verifying VC');
          }
        }
      }
    }
  }, [socketEvents]);

  // callback, send verification result back to app
  const reportVerificationResult = result => {
    onVerificationResult(result);
  };

  function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
  }

  return (
    <div>
      {sessionId ? (
        <Button colorScheme="purple" onClick={onOpen} margin={4}>
          Prove access rights
        </Button>
      ) : (
        <Spinner />
      )}

      {qrCodeData && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px) hue-rotate(90deg)" />
          <ModalContent top={101}>
            <ModalHeader>
              Scan this QR code from your{' '}
              <a href={linkDownloadPolygonIDWalletApp} target="_blank" rel="noreferrer">
                Polygon ID Wallet App
              </a>{' '}
              to prove access rights
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody textAlign={'center'} fontSize={'12px'}>
              {isHandlingVerification && (
                <Center>
                  <div>
                    <p>Authenticating...</p>
                  </div>
                  <Spinner size={'xl'} colorScheme="purple" my={2} />
                </Center>
              )}
              <br />
              <br />
              {verificationMessage}
              {qrCodeData && !isHandlingVerification && !verificationCheckComplete && (
                <Center height="200px">
                  {' '}
                  {/* Adjust height as needed for vertical centering */}
                  <QRCode value={JSON.stringify(qrCodeData)} />
                </Center>
              )}

              {qrCodeData.body?.scope[0].query && <p>Type: {qrCodeData.body?.scope[0].query.type}</p>}

              {qrCodeData.body.message && <p>{qrCodeData.body.message}</p>}

              {qrCodeData.body.reason && <p>Reason: {qrCodeData.body.reason}</p>}
            </ModalBody>

            <ModalFooter>
              <Button
                fontSize={'10px'}
                margin={1}
                colorScheme="purple"
                onClick={() => openInNewTab(linkDownloadPolygonIDWalletApp)}
              >
                Download the Polygon ID Wallet App <ExternalLinkIcon marginLeft={2} />
              </Button>
              <Button fontSize={'10px'} margin={1} colorScheme="purple" onClick={() => openInNewTab(issuerOrHowToLink)}>
                Get a {credentialType} VC <ExternalLinkIcon marginLeft={2} />
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

export default PolygonIDVerifier;
