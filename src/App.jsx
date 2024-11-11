import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, IconButton, Typography, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { HexColorPicker } from 'react-colorful';
import DescriptionIcon from '@mui/icons-material/Description';
import { useSnackbar } from 'notistack';

const App = () => {
  const [file, setFile] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });
  const { enqueueSnackbar } = useSnackbar();

  const handleRemoveBackground = async () => {
    if (!file) {
      enqueueSnackbar('No file selected', { variant: 'warning' });
      return;
    }

    setIsLoading(true); // Set loading to true when starting the process

    const formData = new FormData();
    formData.append('image', file);
    formData.append('bgColor', bgColor);
    console.log(bgColor);

    try {
      const response = await fetch('http://localhost:5000/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error removing background');
      }

      // Get the resulting image as a Blob
      const result = await response.blob();

      // Extract the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'processed-image.jpg';  // Default filename

      if (contentDisposition) {
        const matches = contentDisposition.match(/filename\s*=\s*(?:['"]?)([^'";]+)(?:['"]?)/);
        if (matches && matches[1]) {
          filename = matches[1];  // Use the filename from the header
        }
      }

      // Create an object URL for the Blob
      const imageUrl = URL.createObjectURL(result);

      // Trigger the download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;  // Use the filename from the header or default
      link.click();

      // Cleanup: Revoke the object URL after download
      URL.revokeObjectURL(imageUrl);

      enqueueSnackbar('Background removed successfully!', { variant: 'success' });
    } catch (error) {
      console.error("Error removing background:", error);
      enqueueSnackbar('Failed to remove background', { variant: 'error' });
    } finally {
      setIsLoading(false); // Set loading to false when the process ends
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'grid', placeContent: 'center', justifyItems: 'center' }}>
      <Box>
        <Box
          sx={{
            border: 'dashed',
            borderRadius: '16px',
            borderColor: 'primary.main',
            backgroundColor: 'none',
            minWidth: '200px',
            position: 'relative',
            p: 5,
            mt: 2,
          }}
          {...getRootProps()} // Attach the dropzone props here
        >
          <input {...getInputProps()} /> {/* This now doesn't need the onChange handler */}
          {file ? (
            <Box sx={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
              {isLoading ? (
                <CircularProgress size={40} sx={{ zIndex: 1 }} />
              ) : (
                <>
                  <IconButton
                    sx={{ position: 'absolute', right: 15, top: 10, color: 'white' }}
                    onClick={clearFile}
                  >
                    <CloseIcon />
                  </IconButton>
                  <DescriptionIcon fontSize="large" />
                  <Typography variant="body1">{file.name}</Typography>
                </>
              )}
            </Box>
          ) : (
            <>
              <UploadFileIcon fontSize="large" sx={{ display: 'block', margin: '0 auto' }} color="primary" />
              <Typography sx={{ textAlign: 'center', pt: 2, whiteSpace: 'nowrap' }}>
                Drag & Drop or Choose File
              </Typography>
            </>
          )}
        </Box>

        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ p: 2 }}>
            Select Background Color
          </Typography>
          <HexColorPicker color={bgColor} onChange={setBgColor} />
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRemoveBackground}
            disabled={isLoading} // Disable the button when loading
            sx={{ position: 'relative' }}
          >
            Remove Background
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default App;
