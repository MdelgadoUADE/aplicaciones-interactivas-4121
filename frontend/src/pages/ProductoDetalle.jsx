import { useParams } from "react-router-dom";
import PageStub from "./PageStub.jsx";

export default function ProductoDetalle() {
  const { id } = useParams();
  return <PageStub titulo={`Producto ${id}`} etapa="F2" />;
}