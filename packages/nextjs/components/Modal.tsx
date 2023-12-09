import React, { useState, FC } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dropdown from './Dropdown';

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: any
};

const CreatePostModal: FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = () => {
    onSubmit(title, body);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="create-post-modal"
      aria-describedby="create-post-modal-description"
    >
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, }}>
        <h2 className="p-3" id="create-post-modal">  Create a thread</h2>
        <div className="mb-4">
          <input
            type="text"
            className="w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none bg-transparent"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <textarea
            className="w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none bg-transparent"
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          ></textarea>
        </div>

        <Dropdown/>
        <Button onClick={handleSubmit} style={{ marginTop: '10px' }}>Whisper !</Button>
      </Box>
    </Modal>
  );
};

export default CreatePostModal;
