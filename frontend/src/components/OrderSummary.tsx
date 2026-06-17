
// Importo estos 2, para realizar el formulario del cliente opcional
import { useState } from "react";
import CustomerForm from "./CustomerForm";


interface Props {
  cart: any[];
  onIncreaseQuantity: (product: any) => void;
  onDecreaseQuantity: (id: number) => void;
  onConfirm: (cliente: any) => void;
}

export default function OrderSummary({ cart, onIncreaseQuantity, onDecreaseQuantity, onConfirm}: Props) {
  const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);


  // para realizar el formulario
  const [showForm, setShowForm] = useState(false);

  const confirmarCompra = (cliente: any) => {
    console.log("Datos cliente:", cliente);

    setShowForm(false);
    onConfirm(cliente);
  };

  // Detectamos si la pantalla es móvil
  const isMobile = window.innerWidth <= 768;

  const circleBtnStyle = {
    width: '26px', 
    height: '26px',
    borderRadius: '50%',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px', 
    fontWeight: 'bold',
    color: '#374151'
  };  

  return (
    <>
    <aside style={{ 
      // Si es móvil, se acomoda abajo ocupando todo el ancho; si es PC, se queda como columna fija a la derecha
      width: isMobile ? '100%' : '320px', 
      height: isMobile ? 'auto' : '100vh',
      borderLeft: isMobile ? 'none' : '1px solid #e0e0e0', 
      borderTop: isMobile ? '2px solid #e5e7eb' : 'none',
      padding: '24px', 
      backgroundColor: '#fff', 
      display: 'flex', 
      flexDirection: 'column',
      // Si es móvil, lo dejamos al final del flujo vertical del flex principal
      boxShadow: isMobile ? '0 -4px 10px rgba(0,0,0,0.05)' : 'none'
    }}>
      <h3 style={{ 
        fontSize: '20px', 
        color: '#1f2937', 
        marginBottom: '15px' 
      }}>Tu Pedido</h3>
      <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '20px' }} />

      {cart.length === 0 ? (
        <div style={{ 
          padding: isMobile ? '20px 0' : '0',
          flex: isMobile ? 'none' : 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          color: '#9ca3af', 
          fontSize: '16px' }}>
          El pedido está vacío
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
          {/* Añadimos un max-height en móviles para que la lista de compras no se haga infinita hacia abajo */}
        
          <div style={{ 
            overflowY: 'auto', 
            flex: isMobile ? 'none' : 1, 
            maxHeight: isMobile ? '200px' : 'none', 
            paddingRight: '5px' 
          }}>
            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px dashed #f3f4f6' }}>
                <div style={{ flex: 1, paddingRight: '10px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#374151',  fontSize:'15px' }}>
                    {item.nombre}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <button onClick={() => onDecreaseQuantity(item.id)} style={circleBtnStyle}>
                      -
                    </button>
                    
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', minWidth: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>

                    <button onClick={() => onIncreaseQuantity(item)} style={circleBtnStyle}>
                      +
                    </button>
                  </div>
                </div>

                <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '15px' }}>
                  Bs {(item.precio * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '15px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
              <span>Total:</span>
              <span style={{ color: '#f59e0b', fontSize: '22px' }}>Bs {total.toFixed(2)}</span>
            </div>

            <button 
              onClick={()=> setShowForm(true)} // aqui
              style={{ 
                width: '100%', 
                backgroundColor: '#10b981', 
                color: '#fff', 
                border: 'none', 
                padding: '12px', 
                borderRadius: '10px', 
                fontWeight: 'bold', 
                fontSize: '15px', 
                cursor: 'pointer' 
              }}
            >
              Confirmar Pedido
            </button>
          </div>
        </div>
      )}
    </aside>

    {showForm && (
      <CustomerForm
        onClose={() => setShowForm(false)}
        onConfirm={confirmarCompra}
      />
      )}

      
    </>
  );
}



