import { useParams } from "react-router-dom";
import PageStub from "../PageStub.jsx";

export default function AdminProductoForm() {
  const { id } = useParams();
  return <PageStub titulo={id ? `Editar producto ${id}` : "Nuevo producto"} etapa="F6" />;
}
