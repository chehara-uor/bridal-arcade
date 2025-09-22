import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

interface Order {
  id: string;
  commission: number;
  status: 'Booked' | 'Completed' | 'Cancelled';
  orderDate: string;
  customer: string;
  product: string;
  totalAmount: number;
}

const Orders = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All Status');

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedOrders = sessionStorage.getItem("orderData");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
    
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning text-warning-foreground';
      case 'Booked':
        return 'bg-primary text-primary-foreground';
      case 'In Progress':
        return 'bg-secondary text-secondary-foreground';
      case 'Delivered':
        return 'bg-success text-success-foreground';
      case 'Completed':
        return 'bg-success text-success-foreground';
      case 'Cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const statusOptions = ['All Status', 'Booked','Completed', 'Cancelled'];

  const filteredOrders = activeFilter === 'All Status'
    ? orders
    : orders.filter(order => order.status === activeFilter);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-[24px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Orders</h1>
            <p className="text-muted-foreground mt-1">Track and manage your rental orders</p>
          </div>
        </div>

        {/* Status Filter Navbar */}
        <div className="bg-card rounded-xl shadow-card border border-border-light mb-6 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                  activeFilter === status
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {status}
                {status !== 'All Status' && (
                  <span className="ml-2 inline-block bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                    {orders.filter(order => order.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {filteredOrders.map((order, index) => (
            <div key={order.id} className="bg-card rounded-xl p-4 shadow-card border border-border-light">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-foreground text-lg">#{order.id}</p>
                  <p className="text-sm text-muted-foreground">Customer {`#${index + 1}`}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-1">Product</p>
                <p className="text-foreground font-medium">{order.product}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Commission</p>
                  <p className="font-semibold text-primary">{order.commission}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold text-foreground">LKR {order.totalAmount}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{formatDate(order.orderDate)}</p>
                {/* <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                  View Details
                </button> */}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-card rounded-xl shadow-card border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Order ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Product</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Our Commission (%)</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Order Date</th>
                  {/* <th className="text-left py-4 px-6 font-semibold text-foreground">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className={`border-t border-border-light hover:bg-card-hover transition-colors ${index % 2 === 0 ? 'bg-surface' : 'bg-card'}`}>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-foreground">#{order.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-foreground">Customer {`#${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">LKR &nbsp;{order.totalAmount}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-foreground text-sm">{order.product}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-primary">{order.commission}%</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-muted-foreground text-sm">{formatDate(order.orderDate)}</span>
                    </td>
                    {/* <td className="py-4 px-6">
                      <button className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium hover:bg-primary-hover transition-colors">
                        View Details
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8">
          <div className="bg-card rounded-lg p-4 shadow-card border border-border-light">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-card border border-border-light">
            <p className="text-sm text-muted-foreground">Total Profit</p>
            <p className="text-2xl font-bold text-primary">LKR&nbsp;{orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}</p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-card border border-border-light">
            <p className="text-sm text-muted-foreground">Booked</p>
            <p className="text-2xl font-bold text-warning">{orders.filter(o => o.status === 'Booked').length}</p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-card border border-border-light">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-success">{orders.filter(o => o.status === 'Completed').length}</p>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Orders;