import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-right" theme="dark" closeButton richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
