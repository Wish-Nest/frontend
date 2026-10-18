// Augmentation des types MUI pour permettre <Card variant="success" | "warning" | "error" />
import '@mui/material/Card';
import '@mui/material/Paper';

declare module '@mui/material/Card' {
  interface CardPropsVariantOverrides {
    success: true;
    warning: true;
    error: true;
    outlined: true;
  }
}

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    success: true;
    warning: true;
    error: true;
    outlined: true;
  }
}
