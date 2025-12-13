interface IProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  supplier: {
    id: string;
    name: string;
  };
  quantity: number;
  status: "active" | "stopped" | string;
  description: string;
  expiryDate: string;
  isDeleted: boolean;
  batchNumber: string;
}

interface IOrder {
  id: string;
  total: number;
  popUrl: string;
  userId: string;
  totalCost: number;
  supplier: string;
  createdAt: string;
  paymentMethod: string;
  deliveryDate: string;
  status: "pending" | "accepted" | "shipped" | "cancelled";
}

interface INotification {
  message: string;
}

interface IDevice {
  id: string;
}

interface ICategory {
  id: string;
  name: string;
}

interface IUser {
  id: string;
  city: string;
  role: string;
  email: string;
  phone: string;
  logo?: string;
  address: string;
  license?: string;
  verified: boolean;
  expiryDate: number;
  branchName: string;
  companyName: string;
  emailStatus: string;
  administrator: string;
  licenseNumber?: string;
  rejectionReason?: string;
  licenseStatus?: "pending" | "approved" | "rejected";
}

interface ICategory {
  name: string;
  id: string;
  subCategories?: ISubCategory[];
}

interface ISubCategory {
  name: string;
  id: string;
  parent: string;
}

interface OrderDistribution {
  month: string;
  orders: number;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  acceptedOrders: number;
  cancelledOrders: number;
  orderDistribution: OrderDistribution[];
}

interface DashboardStats {
  acceptedOrders: number;
  activeUsers: number;
  cancelledOrders: number;
  expiredSubscriptions: number;
  orderDistribution: OrderDistribution[];
  pendingOrders: number;
  pendingUsers: number;
  shippedOrders: number;
  totalOrders: number;
  totalProducts: number;
  totalRetailers: number;
  totalSuppliers: number;
  totalUsers: number;
}

type TopSelling = {
  name: string;
  totalPrice: number;
  quantity: number;
  id: string;
};
