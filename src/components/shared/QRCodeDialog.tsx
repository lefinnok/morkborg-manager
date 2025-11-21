import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDialogProps {
  open: boolean;
  onClose: () => void;
  data: string;
  title?: string;
}

export default function QRCodeDialog({ open, onClose, data, title = 'QR Code' }: QRCodeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <QRCodeSVG
            value={data}
            size={300}
            level="M"
            includeMargin={true}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            Scan this code to import the character
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
