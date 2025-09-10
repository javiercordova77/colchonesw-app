// === frontend/src/Producto.jsx ===
import React, { useEffect, useState } from 'react';
import { obtenerProductoPorCodigo } from './api';

function Producto({ codigo }) {
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerProductoPorCodigo(codigo)
      .then(setProducto)
      .catch(err => setError(err.message));
  }, [codigo]);

  if (error) return <p>Error: {error}</p>;
  if (!producto) return <p>Cargando producto...</p>;

  return (
    <div>
      <h2>{producto.descripcion}</h2>
      <img src={`/${producto.imagen}`} alt={producto.descripcion} style={{ width: '300px' }} />
      <p>Categoría: {producto.categoria}</p>
      <p>Material: {producto.material}</p>
      <p>Medida: {producto.medida}</p>
      <p>Precio Venta: ${producto.precio_venta}</p>
      <p>Precio Compra: ${producto.precio_compra}</p>
      <p>Cantidad Disponible: {producto.cantidad_disponible}</p>
      <p>Colores disponibles: {producto.colores.join(', ')}</p>
    </div>
  );
}

export default Producto;