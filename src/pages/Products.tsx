import { useState , useEffect } from 'react';
import Navigation from '../components/Navigation';
import { sendProductStatus } from "../api/product";
interface Product {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  is_booked:string;
  sku: number;
  category: string;
  status: 'Available' | 'Draft' | 'Rented';
}

const Products = () => {


 const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    const storedProducts = sessionStorage.getItem("productData");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, [])

  const handleStatusToggle = async (productId: number, status: 'Available' | 'Draft') => {
    // setProducts(products.map(product => {
    //   if (product.id === productId) {
    //     const newStatus = product.status === 'Draft' ? 'Available' : 'Draft';
    //     return { ...product, status: newStatus };
    //   }
    //   return product;
    // }));
    try {
     const res = await sendProductStatus({ product_id: productId, status: status === 'Available' ? 'draft' : 'publish' });
     if(res.success){
      console.log('Status updated successfully');
      setProducts (productId === res.product_id ? [...products, { ...products.find(p => p.id === productId)!, status: status }] : products);
     }
    } catch (err: any) {
      console.log(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-success text-success-foreground';
      case 'Rented':
        return 'bg-warning text-warning-foreground';
      case 'Draft':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-[24px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Items</h1>
            <p className="text-muted-foreground mt-1">Manage your rental inventory</p>
          </div>
          <button className="hidden mt-4 sm:mt-0 bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-6 py-3 rounded-lg font-medium hover:from-primary-hover hover:to-primary transition-all duration-200 shadow-md hover:shadow-lg">
            Add New Product
          </button>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-card rounded-xl p-4 shadow-card border border-border-light">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{product.name}</h3>
                  <p className="text-muted-foreground text-sm">{product.category}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ product.is_booked === '1' ? getStatusColor('Rented') : getStatusColor(product.status)}`}>
                  {product.is_booked === '1' ? 'Rented' : product.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Listing Price</p>
                  <p className="font-semibold text-foreground">LKR{product.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className="font-semibold text-foreground">{product.sku}</p>
                </div>
              </div>

              <div className="flex">
                <button 
                  onClick={() => handleStatusToggle(product.id, product.status === 'Draft' ? 'Available' : 'Draft')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    product.status === 'Draft' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg' 
                      : 'bg-muted text-muted-foreground hover:bg-muted-dark'
                  }`}
                >
                  {product.status === 'Draft' ? 'Set Live' : 'Set Draft'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-card rounded-xl shadow-card border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Listing Price</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">SKU</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id} className={`border-t border-border-light hover:bg-card-hover transition-colors ${index % 2 === 0 ? 'bg-surface' : 'bg-card'}`}>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-foreground">LKR {product.price}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ product.is_booked === '1' ? getStatusColor('Rented') : getStatusColor(product.status)}`}>
                        {product.is_booked === '1' ? 'Rented' : product.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-foreground font-medium">{product.sku}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex">
                        <button 
                          onClick={() => handleStatusToggle(product.id, product.status === 'Draft' ? 'Available' : 'Draft')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            product.status === 'Draft' 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg' 
                              : 'bg-muted text-muted-foreground hover:bg-muted-dark'
                          }`}
                          disabled={product.is_booked === '1'}
                        >
                          {product.status === 'Draft' ? 'Set Live' : 'Set Draft'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
{/* disabled={product.status === 'Rented'} */}
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-card rounded-lg p-4 shadow-card border border-border-light">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold text-foreground">{products.length}</p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-card border border-border-light">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-success">{products.filter(p => p.is_booked === '0' && p.status === 'Available').length}</p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-card border border-border-light">
            <p className="text-sm text-muted-foreground">Currently Rented</p>
            <p className="text-2xl font-bold text-warning">{products.filter(p => p.is_booked === '1').length}</p>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Products;