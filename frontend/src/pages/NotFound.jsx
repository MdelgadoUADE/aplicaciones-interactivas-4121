import EmptyState from "../components/common/EmptyState.jsx";
import Button from "../components/common/Button.jsx";

export default function NotFound() {
  return (
    <EmptyState
      titulo="Página no encontrada"
      mensaje="La dirección que buscás no existe o fue movida."
    >
      <Button to="/">Volver al inicio</Button>
    </EmptyState>
  );
}