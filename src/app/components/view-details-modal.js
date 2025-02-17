import React from 'react';
import { Modal, Box, Typography, IconButton, Link } from '@mui/material';
import { Close as CloseIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
    borderRadius: '8px',
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
    borderBottom: '1px solid #ddd',
    pb: 1,
};

const closeButtonStyle = {
    padding: 0, 
    color: '#888', 
    '&:hover': {
        color: '#000', 
    }
};

const titleStyle = {
    fontWeight: 600,
    fontSize: '1.25rem',
    color: '#333',
};

const descriptionStyle = {
    marginTop: '16px',
    color: '#555',
    lineHeight: '1.6',
    fontSize: '0.95rem',
};

const attachmentsBoxStyle = {
    marginTop: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #ddd',
};

const attachmentItemStyle = {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
};

const attachmentLinkStyle = {
    color: '#1976d2',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    marginLeft: '8px',
};

const ViewDetailsModal = ({ open, handleClose, detail }) => {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={style}>
                <Box sx={headerStyle}>
                    <Typography id="modal-title" variant="h6" sx={titleStyle}>
                        {detail.title}
                    </Typography>
                    <IconButton onClick={handleClose} sx={closeButtonStyle}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Typography id="modal-description" sx={descriptionStyle}>
                    {detail.description}
                </Typography>

                {detail.attachments && Array.isArray(detail.attachments) && detail.attachments.length > 0 && (
                    <Box sx={attachmentsBoxStyle}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#333' }}>Attachments:</Typography>
                        {detail.attachments.map((attachment, index) => (
                            <Box key={index} sx={attachmentItemStyle}>
                                <Typography variant="body2" sx={{ marginRight: '8px', fontWeight: 500 }}>
                                    {attachment.caption}
                                </Typography>
                                <AttachFileIcon fontSize="small" color="action" />
                                <Link 
                                    href={attachment.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    sx={attachmentLinkStyle}
                                >
                                    View
                                </Link>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

export default ViewDetailsModal;
