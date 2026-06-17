// src/components/QrPayment.tsx
import React from 'react';

//import { generarPdfPedido } from "../utils/generarPdf"; //aun no esta siendo usado

interface QrPaymentProps {
  total: number;
  onBack: () => void;
  onSuccess: () => void;
}


export const QrPayment: React.FC<QrPaymentProps> = ({ total, onBack, onSuccess }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={onBack} style={styles.backButton}>
          ← Volver al menú
        </button>
        
        <h2 style={styles.title}>Escanea el código QR para pagar</h2>
        <p style={styles.subtitle}>Total a pagar: <strong>Bs {total.toFixed(2)}</strong></p>
        
        {/* Imagen de QR de prueba (puedes cambiarla por la tuya en public/) */}
        <div style={styles.qrContainer}>
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SimulacionPagoFreshCoffee" 
            alt="Código QR de Pago" 
            style={styles.qrImage}
          />
        </div>
        
        <p style={styles.info}>Una vez realizado el escaneo y pago, haz clic en el botón de abajo.</p>
        
        <button onClick={onSuccess} style={styles.confirmButton}>
          Ya pagué (Finalizar Pedido)
        </button>

      </div>
    </div>
  );
};

// Estilos rápidos en línea (puedes adaptarlos a tus clases de CSS si prefieres)
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    maxWidth: '400px',
    width: '100%',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    float: 'left' as const,
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    color: '#1f2937',
    clear: 'both' as const,
  },
  subtitle: {
    fontSize: '18px',
    color: '#4b5563',
    margin: '10px 0 20px 0',
  },
  qrContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  qrImage: {
    border: '4px solid #fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  info: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '20px',
  },
  confirmButton: {
    backgroundColor: '#10b981', // Verde como tu botón de confirmar
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    width: '100%',
  }
};