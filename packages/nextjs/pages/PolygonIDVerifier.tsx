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

type PolygonVerifierType = {
  credentialType: string,
  issuerOrHowToLink: string,
  onVerificationResult: any,
  serverUrl: string
}
 
function PolygonIDVerifier({
  credentialType,
  issuerOrHowToLink,
  onVerificationResult,
  serverUrl,
}: PolygonVerifierType) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sessionId, setSessionId] = useState('');
  const [qrCodeData, setQrCodeData] = useState();
  const [isHandlingVerification, setIsHandlingVerification] = useState(false);
  const [verificationCheckComplete, setVerificationCheckComplete] = useState(false);
  const [verificationMessage, setVerfificationMessage] = useState('');
  const [socketEvents, setSocketEvents] = useState([]);  

  const getQrCodeApi = (sessionId: string) => serverUrl + `/api/get-auth-qr?sessionId=${sessionId}`;
  const socket = io(serverUrl);   
  
  useEffect(() => {
    socket.on('connect', () => {
      setSessionId(socket.id);
      console.log("SIHfaoiuhfahgoiaeh");
      
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

      const currentSocketEvent = socketEvents[socketEvents.length - 1] as any;

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
  const reportVerificationResult = (result: boolean) => {
    onVerificationResult(result);
  };

  function openInNewTab(url: string | URL | undefined) {
    let win = window.open(url, '_blank') as any;
    win.focus();
  }

  return (
    <div>
      {sessionId ? (
        <Button colorScheme="purple" onClick={onOpen} margin={4}>
          Prove your company
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

              {(qrCodeData as any).body?.scope[0].query && <p>Type: {(qrCodeData as any).body?.scope[0].query.type}</p>}

              {(qrCodeData as any).body.message && <p>{(qrCodeData as any).body.message}</p>}

              {(qrCodeData as any).body.reason && <p>Reason: {(qrCodeData as any).body.reason}</p>}
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
