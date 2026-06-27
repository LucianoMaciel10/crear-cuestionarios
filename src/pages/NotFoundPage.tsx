import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <h1 className="mb-2 text-6xl font-bold text-gray-900">404</h1>
      <p className="mb-8 text-lg text-gray-600">
        Lo sentimos, la página que buscas no existe.
      </p>
      <Button 
        variant="primary" 
        onClick={() => navigate('/')}
      >
        Volver al inicio
      </Button>
    </div>
  );
}

export default NotFoundPage;
