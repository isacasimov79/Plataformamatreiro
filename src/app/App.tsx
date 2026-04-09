import { RouterProvider } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './lib/msalConfig';
import '../i18n/config'; // Initialize i18n

const msalInstance = new PublicClientApplication(msalConfig);

export default function App() {
  return (
    <ThemeProvider>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </MsalProvider>
    </ThemeProvider>
  );
}