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
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('bgColor', bgColor);
    console.log(bgColor);

    try {
      const response = await fetch(`${import.meta.env.VITE_DEVELOPMENT_BACKEND_ADDRESS}/api/remove-background`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error removing background');
      }

      const result = await response.blob();

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'processed-image.jpg';

      if (contentDisposition) {
        const matches = contentDisposition.match(/filename\s*=\s*(?:['"]?)([^'";]+)(?:['"]?)/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }


      const imageUrl = URL.createObjectURL(result);


      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      link.click();


      URL.revokeObjectURL(imageUrl);

      enqueueSnackbar('Background removed successfully!', { variant: 'success' });
    } catch (error) {
      console.error("Error removing background:", error);
      enqueueSnackbar('Failed to remove background', { variant: 'error' });
    } finally {
      setIsLoading(false);
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
          {...getRootProps()}
        >
          <input {...getInputProps()} />
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
            disabled={isLoading}
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
