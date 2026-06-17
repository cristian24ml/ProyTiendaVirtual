import { useState } from 'react';

interface Category {
  id: number;
  nombre: string;
}

interface Props {
  categories: Category[];
  activeCategory: number;
  onSelectCategory: (id: number) => void;
  maxPriceLimit: number;
  onFilterPrice: (maxPrice: number) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function SidebarCategories({
  categories,
  activeCategory,
  onSelectCategory,
  maxPriceLimit,
  onFilterPrice,
  isDarkMode,
  onToggleDarkMode,
}: Props) {
  const [sliderVal, setSliderVal] = useState(maxPriceLimit);

  const handleFilterClick = () => {
    onFilterPrice(sliderVal);
  };

  return (
    <aside
      style={{
        width: '260px',
        borderRight: '1px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        height: '100%',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
      }}
    >
      <div>
        {/* Brand/Logo */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            fontWeight: '800',
            fontSize: '20px',
            color: '#f59e0b',
            letterSpacing: '0.5px',
          }}
        >
          🎁 El Taller <span style={{ color: 'var(--text-primary)', fontSize: '16px' }}>de detalles</span>
        </div>

        {/* Categories Section */}
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '14px',
          }}
        >
          Categorías
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '32px',
          }}
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeCategory;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isActive ? '#f59e0b' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.nombre}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', marginBottom: '24px' }} />

        {/* Price Filter Section (Screenshot layout) */}
        <div style={{ marginBottom: '24px' }}>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}
          >
            Precio
          </h3>
          <input
            type="range"
            min="10"
            max="500"
            value={sliderVal}
            onChange={(e) => setSliderVal(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#f59e0b',
              cursor: 'pointer',
              marginBottom: '10px',
            }}
          />
          <div
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '14px',
              fontWeight: '600',
            }}
          >
            Precio: Bs.10 — Bs.{sliderVal}
          </div>
          <button
            onClick={handleFilterClick}
            style={{
              padding: '10px 24px',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d97706')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f59e0b')}
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Theme Toggle Button (Light/Dark vertical tab aesthetic) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', marginBottom: '10px' }} />
        <button
          onClick={onToggleDarkMode}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>
      </div>
    </aside>
  );
}