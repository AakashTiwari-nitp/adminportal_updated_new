import React, { useMemo } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { Delete } from '@mui/icons-material'
import { FormControlLabel, Checkbox } from '@mui/material'
import { useEffect } from 'react'
export const AddAttachments = ({ attachments, setAttachments, limit }) => {

    useEffect(() => {
        if (attachments.length === 0) {
            setAttachments([
                {
                    id: Date.now(),
                    caption: "",
                    url: undefined,
                    value: undefined,
                    typeLink: false,
                },
            ]);
        }
    }, []);

    function handleChange(i, event) {
        const values = [...attachments]
        values[i].caption = event.target.value
        setAttachments(values)
    }
    function handleChangeFile(i, event) {
        const values = [...attachments]
        values[i].url = event.target.files[0]
        values[i].value = event.target.value
        setAttachments(values)
    }

    function handleAdd() {
        const values = [...attachments]
        values.push({
            id: Date.now(),
            caption: '',
            url: undefined,
            value: undefined,
            typeLink: false,
        })
        setAttachments(values)
    }

    function handleRemove(i) {
        const values = [...attachments]
        values.splice(i, 1)
        setAttachments(values)
    }

    function handleType(i) {
        const values = [...attachments]
        let val = {
            typeLink: !values[i].typeLink,
            url: undefined,
            value: undefined,
        }
        values.splice(i, 1, val)
        setAttachments(values)
    }

    function handleLink(i, event) {
        const values = [...attachments]
        values[i].url = event.target.value
        setAttachments(values)
    }

    const DisplayAttachments = attachments.map((attachment, idx) => {
        return (
            <div key={`${attachment.id}`}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={attachment.typeLink}
                            onChange={() => handleType(idx)}
                            name="typeLink"
                            color="primary"
                        />
                    }
                    style={{ width: `20%` }}
                    label="Link"
                />
                <TextField
                    placeholder="SubTitle"
                    name="caption"
                    value={attachment.caption}
                    fullWidth
                    onChange={(e) => handleChange(idx, e)}
                    style={{ margin: `8px`, display: 'inline' }}
                />
                <div style={{ display: 'flex' }}>
                    {attachment.typeLink ? (
                        <TextField
                            placeholder="File Link"
                            name="link"
                            value={attachment.url ?? ''}
                            onChange={(e) => handleLink(idx, e)}
                            style={{ margin: `8px`, width: `90%` }}
                        />
                    ) : (
                        <TextField
                            type="file"
                            name="url"
                            files={attachment.url}
                            style={{ margin: `8px` }}
                            onChange={(e) => {
                                handleChangeFile(idx, e)
                            }}
                        />
                    )}

                    <Button
                        type="button"
                        onClick={() => {
                            handleRemove(idx)
                        }}
                        style={{ display: `inline-block`, fontSize: `1.5rem` }}
                    >
                        <Delete color="secondary" />{' '}
                    </Button>
                </div>
            </div>
        )
    })

    return (
        <div style={{ marginTop: `8px` }}>
            <Button
                variant="contained"
                
                type="button"
                onClick={() => handleAdd()}
                disabled={
                    limit ? (attachments.length < limit ? false : true) : false
                }
                style={{ marginBottom: `8px`, backgroundColor: '#830001', color: 'white' }}
            >
                + Additional Attachments
            </Button>
            {DisplayAttachments}
        </div>
    )
}

export const handleNewAttachments = async (new_attach, onProgress = null) => {
    for (let i = 0; i < new_attach.length; i++) {
        delete new_attach[i].value;

        // If it's not a link and it's a file, upload the file
        if (new_attach[i].typeLink === false && new_attach[i].url) {
            let file = new FormData();
            file.append('file', new_attach[i].url);
            file.append('fileType', 'general');

            try {
                // Use XMLHttpRequest for progress tracking if callback provided
                if (onProgress && typeof onProgress === 'function') {
                    const result = await uploadWithProgress(file, (percent) => onProgress(i, percent));
                    new_attach[i].url = result.url;
                    new_attach[i].key = result.key;
                } else {
                    let response = await fetch('/api/upload', {
                        method: 'POST',
                        body: file,
                    });

                    if (!response.ok) {
                        throw new Error('File upload failed');
                    }

                    let data = await response.json();
                    // Update the attachment with S3 URL and key
                    new_attach[i].url = data.url; // S3 URL for display
                    new_attach[i].key = data.key; // S3 key for deletion
                }
            } catch (error) {
                console.error('File upload error:', error);
                new_attach[i].url = ''; // Set it to empty if there was an error
                new_attach[i].key = ''; // Empty key as well
            }
        } else {
            console.log('NOT A FILE, It is a link');
        }
    }

    return new_attach;
};

// Helper function for upload with progress
const uploadWithProgress = (formData, onProgress) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Progress tracking
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
            }
        });
        
        // Success handler
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (e) {
                    reject(new Error('Invalid response format'));
                }
            } else {
                try {
                    const response = JSON.parse(xhr.responseText);
                    reject(new Error(response.message || 'Upload failed'));
                } catch (e) {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('Network error occurred'));
        });
        
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
    });
};
