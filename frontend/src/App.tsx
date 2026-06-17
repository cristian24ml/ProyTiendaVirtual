import { useState, useEffect } from 'react';
import SidebarCategories from './components/SidebarCategories';
import ProductGrid from './components/ProductGrid';
import OrderSummary from './components/OrderSummary';
import type { Product, CartItem, Category } from './types';
import { QrPayment } from './components/QrPayment';

// ADMINISTRACION
import AdminMenu from './components/administracion/AdminMenu';
import ProductForm from './components/administracion/ProductForm';
import CategoryForm from './components/administracion/CategoryForm';
import AccessLogs from './components/administracion/AccessLogs';
import Login from './components/Login';
import UsuarioForm from './components/administracion/UsuarioForm';
import PedidosAdmin from './components/administracion/PedidosAdmin';
import ReporteMasVendidos from './components/administracion/ReporteMasVendidos';


// SERVICES
import { obtenerCategorias } from './services/categoriaService';
import { obtenerProductos } from './services/productoService';
import { logout } from './services/authService';
import { crearPedido, obtenerPedidos } from './services/pedidoService';
import { generarFacturaPDF } from './utils/pdfGenerator';



export default function App() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);

  // Funciones que ya tienes para manejar cantidades
  const handleIncrease = (product: any) => { /* tu lógica */ };
  const handleDecrease = (id: number) => { /* tu lógica */ };

  // Orquestador de vistas: 'menu' (tienda), 'qr' (pago), 'login' (seguridad), 'admin' (panel)
  const [screen, setScreen] = useState<'menu' | 'qr' | 'login' | 'admin'>('menu');
  const [adminOption, setAdminOption] = useState<string>("");

  // Sesión del usuario administrador/vendedor
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeCategory, setActiveCategory] = useState<number>(0); // 0 = Todas las Categorías
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [currentCliente, setCurrentCliente] = useState<any>(null);
  const [showComoLlegar, setShowComoLlegar] = useState<boolean>(false);
  const [showMisPedidos, setShowMisPedidos] = useState<boolean>(false);
  const [pedidosCliente, setPedidosCliente] = useState<any[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState<boolean>(false);

  // Estados de filtrado
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(500);

  // Modo Oscuro / Claro
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const localTheme = localStorage.getItem('theme');
    return localTheme === 'dark';
  });

  // Efecto para aplicar el tema en el body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // 1. Estado del carrito inicializado con localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    const localData = localStorage.getItem('cart');
    return localData ? JSON.parse(localData) : [];
  });

  // 2. Efecto para guardar en localStorage automáticamente
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const cargarProductos = async () => {
    try {
      const data = await obtenerProductos();
      console.log("Productos: ", data);
      if (Array.isArray(data)) {
        setProductos(data);
      } else {
        console.error("Productos no es un arreglo:", data);
        setProductos([]);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProductos([]);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategorias();
      if (Array.isArray(data)) {
        setCategorias(data);
      } else {
        console.error("Categorías no es un arreglo:", data);
        setCategorias([]);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setCategorias([]);
    }
  };

  // Obtener productos y categorías al cargar
  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  // Agregar producto al carrito
  const handleAddToCart = (product: Product) => {
    const originalProd = productos.find(p => p.id === product.id);
    const cartItem = cart.find(item => item.id === product.id);
    const currentQtyInCart = cartItem ? cartItem.quantity : 0;

    if (originalProd && originalProd.stock !== undefined) {
      if (originalProd.stock <= currentQtyInCart) {
        alert(`No hay suficiente stock disponible para ${product.nombre}. (Stock actual: ${originalProd.stock})`);
        return;
      }
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Reducir cantidad del carrito
  const handleDecreaseQuantity = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      if (existingItem && existingItem.quantity === 1) {
        return prevCart.filter((item) => item.id !== productId);
      }
      return prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const registrarPedido = async (cliente: any, metodo: string) => {
    try {
      const detalles = cart.map(item => ({
        productoId: item.id,
        cantidad: item.quantity,
        precioUnitario: item.precio,
        subtotal: item.precio * item.quantity,
        personalizacion: ""
      }));

      const nuevoPedido = {
        nombreCompleto: cliente?.nombre || "Consumidor Final",
        telefono: cliente?.telefono || "",
        correo: cliente?.correo || "",
        total: totalCart,
        usuarioId: user ? user.id : undefined,
        metodoPago: metodo,
        detalles
      };

      const res = await crearPedido(nuevoPedido);
      alert("¡Pedido registrado con éxito!");

      try {
        await generarFacturaPDF(res);
      } catch (pdfErr) {
        console.error("Error al generar factura PDF:", pdfErr);
      }

      setCart([]);
      setCurrentCliente(null);
      setScreen('menu');

      // Refrescar catálogo para mostrar el stock actualizado
      cargarProductos();
    } catch (error) {
      console.error(error);
      alert("Error al registrar el pedido en el servidor. Intente nuevamente.");
    }
  };

  // Confirmar compra (después de pagar con éxito en pantalla QR)
  const handlePaymentSuccess = async () => {
    await registrarPedido(currentCliente, 'QR');
  };

  // Cargar los pedidos del cliente logueado
  const handleLoadPedidosCliente = async (currentUser = user) => {
    if (!currentUser) return;
    setLoadingPedidos(true);
    try {
      const allPedidos = await obtenerPedidos();
      if (Array.isArray(allPedidos)) {
        const mine = allPedidos.filter((p: any) => p.usuarioId === currentUser.id);
        setPedidosCliente(mine);
      } else {
        setPedidosCliente([]);
      }
    } catch (e) {
      console.error("Error al cargar pedidos de cliente:", e);
      setPedidosCliente([]);
    } finally {
      setLoadingPedidos(false);
    }
  };

  // Inicio de sesión exitoso
  const handleLoginSuccess = (userToken: string, loggedUser: any) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setToken(userToken);
    setUser(loggedUser);

    // Redirección basada en rol
    if (loggedUser.rol === 'Cliente') {
      setScreen('menu');
      alert(`¡Bienvenido, ${loggedUser.nombreCompleto}!`);
      handleLoadPedidosCliente(loggedUser);
    } else {
      setScreen('admin');
      setAdminOption("");
    }
  };

  // Cierre de sesión
  const handleLogout = async () => {
    if (token) {
      try {
        await logout(token);
      } catch (e) {
        console.error("Error al revocar token en servidor:", e);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setScreen('menu');
    setAdminOption("");
    setPedidosCliente([]);
  };

  // Selector del menú administrativo
  const handleAdminSelect = (option: string) => {
    if (option === 'logout') {
      handleLogout();
    } else {
      setAdminOption(option);
    }
  };

  // Acceder al panel de administración
  const handleAccessAdmin = () => {
    if (token) {
      if (user?.rol === 'Cliente') {
        alert("Acceso denegado: El panel de administración es de uso exclusivo para el personal (Administradores y Vendedores).");
        setScreen('menu');
      } else {
        setScreen('admin');
        setAdminOption("");
      }
    } else {
      setScreen('login');
    }
  };

  const totalCart = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);

  // Filtrado cruzado: Búsqueda + Categoría + Precio
  const filteredProducts = productos.filter((product) => {
    const matchesCategory = activeCategory === 0 || product.categoriaId === activeCategory;
    const matchesSearch = product.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.precio <= maxPrice;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  // VISTA DE LOGIN
  if (screen === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setScreen('menu')} />;
  }

  // VISTA DE QR PAGO
  if (screen === 'qr') {
    return (
      <QrPayment
        total={totalCart}
        onBack={() => setScreen('menu')}
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  // VISTA DE ADMINISTRACIÓN
  if (screen === 'admin') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <AdminMenu onSelect={handleAdminSelect} userRole={user?.rol || ''} />

        <div style={{ flex: 1, padding: '40px', color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button
              onClick={() => setScreen('menu')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ← Volver a la tienda
            </button>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Sesión activa: <strong>{user?.nombreCompleto} ({user?.rol || 'Usuario'})</strong>
            </span>
          </div>

          {adminOption === 'producto' && <ProductForm />}
          {adminOption === 'categoria' && <CategoryForm />}
          {adminOption === 'logs' && <AccessLogs token={token!} />}
          {adminOption === 'pedidos' && <PedidosAdmin token={token!} />}
          {adminOption === 'reporte_mas_vendidos' && <ReporteMasVendidos token={token!} />}
          {adminOption === 'usuarios' && user?.rol === 'Administrador' && <UsuarioForm token={token!} currentUser={user} />}


          {!adminOption && (
            <div style={{ padding: '40px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <h2>Bienvenido, {user?.nombreCompleto}</h2>
              <p style={{ marginTop: "10px" }}>Seleccione una opción del menú lateral para comenzar a administrar el sistema.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>

      {/* Slim Utility Top Bar */}
      <div style={topBarStyle}>
        <div style={topBarLeftStyle}>
          <span>🎯 <strong>El Taller de Detalles</strong></span>
        </div>
        <div style={topBarRightStyle}>
          <button
            onClick={() => setShowComoLlegar(true)}
            style={topBarButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
          >
            📍 Cómo llegar
          </button>
          <button
            onClick={() => { setScreen('menu'); setAdminOption(''); }}
            style={topBarButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
          >
            🛍 Tienda
          </button>
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user?.rol === 'Cliente' ? (
                <button
                  onClick={() => { setShowMisPedidos(true); handleLoadPedidosCliente(); }}
                  style={topBarButtonActiveStyle}
                >
                  📦 Mis Pedidos
                </button>
              ) : (
                <button
                  onClick={handleAccessAdmin}
                  style={topBarButtonActiveStyle}
                >
                  ⚙ Administración
                </button>
              )}
              <span style={{ color: '#d1d5db', fontSize: '12px', opacity: 0.8 }}>
                ({user?.nombreCompleto || 'Usuario'})
              </span>
              <button
                onClick={handleLogout}
                style={logoutButtonStyle}
              >
                🚪 Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => setScreen('login')}
              style={topBarButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
            >
              👤 Acceder
            </button>
          )}
        </div>
      </div>

      {/* HEADER SUPERIOR PREMIUM (Navbar similar a la captura de pantalla) */}
      <header style={{
        backgroundColor: 'var(--bg-header)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'var(--text-header)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: '15px'
      }}>
        {/* Marca/Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '0.5px' }}>
            <span style={{ color: '#f59e0b' }}>EL TALLER DE DETALLES</span>
          </div>
        </div>

        {/* Buscador y dropdown de categorías */}
        <div style={{ display: 'flex', flex: isMobile ? '1 1 100%' : '0 1 600px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '30px', padding: '2px', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar Productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              padding: '10px 20px',
              color: '#ffffff',
              outline: 'none',
              fontSize: '14px'
            }}
          />

          {/* Dropdown de categorías */}
          {!isMobile && (
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(Number(e.target.value))}
              style={{
                border: 'none',
                background: 'none',
                color: '#d1d5db',
                padding: '0 15px',
                outline: 'none',
                fontSize: '14px',
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer'
              }}
            >
              <option value="0" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Todas las Categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id} style={{ backgroundColor: '#1f2937', color: '#fff' }}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          )}

          {/* Botón Lupa */}
          <button style={{
            backgroundColor: '#f59e0b',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginLeft: '8px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>

        {/* Acciones de la derecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Botón de recarga */}
          <button onClick={() => { cargarProductos(); cargarCategorias(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }} title="Recargar Catálogo">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </button>

          {/* Carrito de Compras */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#f59e0b',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            {!isMobile && (
              <span style={{ fontSize: '15px', fontWeight: '700' }}>Bs.{totalCart.toFixed(2)}</span>
            )}
          </div>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        flex: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>

        {/* BOTÓN FLOTANTE PARA MÓVILES (Hamburguesa ☰) */}
        {isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '20px',
              zIndex: 1000,
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        )}

        {/* CONTENEDOR DEL MENÚ LATERAL */}
        <div style={{
          position: isMobile ? 'fixed' : 'relative',
          left: isMobile && !isMenuOpen ? '-320px' : '0',
          top: 0,
          height: isMobile ? '100vh' : 'auto',
          zIndex: 999,
          transition: 'left 0.3s ease',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: isMobile ? '4px 0 10px rgba(0,0,0,0.1)' : 'none'
        }}>
          <SidebarCategories
            categories={categorias}
            activeCategory={activeCategory}
            onSelectCategory={(category) => {
              setActiveCategory(category);
              if (isMobile) setIsMenuOpen(false);
            }}
            maxPriceLimit={maxPrice}
            onFilterPrice={(priceVal) => setMaxPrice(priceVal)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        </div>

        {/* FONDO OSCURO DE SOMBRA MÓVIL */}
        {isMobile && isMenuOpen && (
          <div
            onClick={() => setIsMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 998
            }}
          />
        )}

        {/* ÁREA CENTRAL DE PRODUCTOS */}
        <main style={{ flex: 1, padding: isMobile ? '20px 10px 90px 10px' : '30px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Elige tus productos para tu pedido
            </h2>
            {(!user || user.rol !== 'Cliente') && (
              <button
                onClick={handleAccessAdmin}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                }}
              >
                ⚙ Administración
              </button>
            )}
            {user?.rol === 'Cliente' && (
              <button
                onClick={() => { setShowMisPedidos(true); handleLoadPedidosCliente(); }}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
                }}
              >
                📦 Mis Pedidos
              </button>
            )}
          </div>

          <ProductGrid
            products={filteredProducts}
            onAddToCart={handleAddToCart}
          />
        </main>

        {/* RESUMEN DEL PEDIDO */}
        <OrderSummary
          cart={cart}
          onIncreaseQuantity={handleAddToCart}
          onDecreaseQuantity={handleDecreaseQuantity}
          onConfirm={(cliente) => {
            setCurrentCliente(cliente);
            if (cliente.metodoPago === 'QR') {
              setScreen('qr');
            } else {
              registrarPedido(cliente, 'Efectivo');
            }
          }}

        />
      </div>

      {/* BOTÓN FLOTANTE DE WHATSAPP (Como en el screenshot) */}
      <a
        href="https://wa.me/59176287257"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: isMobile ? '24px' : '340px', // Evita chocar con la sidebar en PC
          backgroundColor: '#25d366',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '14px',
          zIndex: 1000,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
      >
        <span style={{ fontSize: '13px' }}>WhatsApp</span>
        {/* Icono de WhatsApp SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.949h.004c4.368 0 7.927-3.561 7.928-7.926a7.89 7.89 0 0 0-2.33-5.596ZM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.69-4.98c-.202-.12-1.196-.588-1.385-.658-.189-.07-.327-.1-.466.1-.139.2-.537.67-.658.8-.12.13-.241.147-.443.047a4.984 4.984 0 0 1-1.63-1.005 5.5 5.5 0 0 1-1.13-1.4c-.12-.202-.012-.311.089-.41.09-.09.202-.24.303-.36a1.24 1.24 0 0 0 .202-.34.19.19 0 0 0-.01-.19c-.048-.097-.466-1.127-.639-1.543-.168-.41-.336-.35-.466-.356h-.4a.89.89 0 0 0-.66.3c-.229.25-1.01 1.02-1.01 2.49s1.08 2.89 1.23 3.1c.15.21 2.112 3.224 5.118 4.524 2.185.946 2.923.826 3.666.72.639-.09 1.385-.56 1.57-.107.185-.453.185-.84.13-1.1-.055-.25-.19-.4-.39-.52z" />
        </svg>
      </a>

      {/* MODAL COMO LLEGAR */}
      {showComoLlegar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>📍 ¿Cómo llegar a El Taller de los Detalles?</h3>
              <button onClick={() => setShowComoLlegar(false)} style={modalCloseButtonStyle}>✕</button>
            </div>
            <div style={modalBodyStyle}>
              <div style={modalInfoGridStyle}>
                <div style={modalInfoCardStyle}>
                  <strong>🏢 Dirección:</strong>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Av. Las Américas Nro 456, Santa Cruz, Bolivia</p>
                </div>
                <div style={modalInfoCardStyle}>
                  <strong>📞 WhatsApp:</strong>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>+591 70043210</p>
                </div>
                <div style={modalInfoCardStyle}>
                  <strong>⏰ Horario:</strong>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Lun - Sáb: 09:00 - 19:30</p>
                </div>
              </div>

              <div style={mapContainerStyle}>
                <img
                  src="/shop_location_map.png"
                  alt="Mapa de Ubicación de El Taller de los Detalles"
                  style={mapImageStyle}
                />
              </div>

              <p style={directionsHelpStyle}>
                💡 <strong>Indicaciones:</strong> Recuerdos y estampados premium. Nos encontramos a media cuadra del Centro Comercial Las Américas, frente a la farmacia principal. Contamos con parqueo.
              </p>
            </div>
            <div style={modalFooterStyle}>
              <button onClick={() => setShowComoLlegar(false)} style={modalFooterButtonStyle}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MIS PEDIDOS CLIENTE */}
      {showMisPedidos && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>📦 Mis Pedidos Realizados</h3>
              <button onClick={() => setShowMisPedidos(false)} style={modalCloseButtonStyle}>✕</button>
            </div>
            <div style={modalBodyStyle}>
              {loadingPedidos ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  Cargando tus pedidos...
                </div>
              ) : pedidosCliente.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🛍️</span>
                  Aún no has realizado ningún pedido. ¡Elige tus recuerdos y haz tu primera compra!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {pedidosCliente.map((ped) => (
                    <div key={ped.id} style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>Pedido #{ped.id}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                          {new Date(ped.fecha).toLocaleDateString()} {new Date(ped.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <strong>Destinatario:</strong> {ped.nombreCompleto} | <strong>Contacto:</strong> {ped.telefono || 'N/A'} - {ped.correo || 'N/A'}
                      </div>
                      <div style={{ paddingLeft: '10px', borderLeft: '3px solid #2563eb', marginBottom: '8px' }}>
                        {ped.detalles?.map((det: any) => (
                          <div key={det.id} style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                            <span>{det.producto?.nombre || 'Producto'} x {det.cantidad}</span>
                            <span>Bs.{(Number(det.precioUnitario) * det.cantidad).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                        <span style={{ fontSize: '12px', backgroundColor: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                          En Proceso / Pagado
                        </span>
                        <span style={{ fontWeight: '800', color: 'var(--price-color)', fontSize: '15px' }}>
                          Total: Bs.{Number(ped.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={modalFooterStyle}>
              <button onClick={() => setShowMisPedidos(false)} style={modalFooterButtonStyle}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos Premium de la barra de utilidad y modal
const topBarStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-header)',
  padding: '8px 28px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'var(--text-header)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  fontSize: '13px',
  fontWeight: '500'
};

const topBarLeftStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#d1d5db'
};

const topBarRightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px'
};

const topBarButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#d1d5db',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontWeight: '600',
  transition: 'color 0.2s',
  fontSize: '13px',
  padding: '4px 8px',
  borderRadius: '4px'
};

const topBarButtonActiveStyle: React.CSSProperties = {
  ...topBarButtonStyle,
  color: '#f59e0b'
};

const logoutButtonStyle: React.CSSProperties = {
  ...topBarButtonStyle,
  color: '#ef4444',
  marginLeft: '6px',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  padding: '2px 8px',
  borderRadius: '4px',
  backgroundColor: 'rgba(239, 68, 68, 0.05)'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  zIndex: 9999,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backdropFilter: 'blur(4px)'
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  width: '90%',
  maxWidth: '600px',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '90vh',
  border: '1px solid var(--border-color)',
};

const modalHeaderStyle: React.CSSProperties = {
  padding: '18px 24px',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  margin: 0
};

const modalCloseButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: 'var(--text-secondary)'
};

const modalBodyStyle: React.CSSProperties = {
  padding: '20px 24px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const modalInfoGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '12px'
};

const modalInfoCardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-primary)',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '13px',
  lineHeight: '1.4'
};

const mapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '250px',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid var(--border-color)',
};

const mapImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const directionsHelpStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
  backgroundColor: 'rgba(245, 158, 11, 0.08)',
  padding: '12px',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
  margin: 0
};

const modalFooterStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderTop: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'flex-end',
  backgroundColor: 'var(--bg-primary)'
};

const modalFooterButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
};