import type { Product } from '../types';

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Imagen del Producto */}
      {/*
      <img
        src={product.imagen}
        alt={product.nombre}
        style={{
          width: '100%',
          height: '180px',
          objectFit: 'cover',
          //objectFit: 'contain', // Usamos contain para que el trofeo de vidrio no se corte
          borderRadius: '8px',
          backgroundColor: '#f3f4f6',
        }}
      />
      */}

      <img
        src={product.imagen}
        //src="/products/R.jpg"
        //src={`http://localhost:5173${product.imagen}`}
        alt={product.nombre}
        style={{
          width: '200px',
          height: '200px',
          objectFit: 'cover',
          //border: '2px solid red'
        }}
        onLoad={() => console.log('CARGADA:', product.imagen)}
        onError={() => console.log('ERROR:', product.imagen)}
      />

      <div style={{ marginTop: '14px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Fila del precio y botón circular de compra */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              color: 'var(--price-color)',
              fontWeight: '800',
              fontSize: '20px',
            }}
          >
            Bs.{Number(product.precio).toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            style={{
              backgroundColor: '#374151',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'background-color 0.2s',
            }}
            title="Agregar al carrito"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1f2937')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
          >
            {/* Icono de carrito SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
        </div>

        {/* Categoría pequeña */}
        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px',
          }}
        >
          {product.categoriaId === 2
            ? 'Galletas'
            : product.categoriaId === 3
            ? 'Detalles'
            : product.categoriaId === 4
            ? 'Electrónicos'
            : 'Recuerdos'}
        </span>

        {/* Nombre del Producto */}
        <h4
          style={{
            margin: '0',
            fontSize: '15px',
            color: 'var(--text-primary)',
            fontWeight: '700',
            lineHeight: '1.4',
            minHeight: '42px',
          }}
        >
          {product.nombre}
          
        </h4>
      </div>
    </div>
  );
}