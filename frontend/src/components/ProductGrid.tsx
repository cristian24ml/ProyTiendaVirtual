

import ProductCard from './ProductCard';
interface Props {
  products: any[];
  onAddToCart: (product: any) => void;
}

export default function ProductGrid({ products, onAddToCart }: Props) {
  return (
    <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', //'repeat(3, 1fr)'
        gap: '2px', //24px
      }}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}