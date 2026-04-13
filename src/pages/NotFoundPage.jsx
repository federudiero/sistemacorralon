import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="card-section p-8 text-center space-y-3">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="opacity-70">La ruta no existe.</p>
        <Link className="btn btn-primary" to="/aridos">Volver al módulo</Link>
      </div>
    </div>
  );
}
