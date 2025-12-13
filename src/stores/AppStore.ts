import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AppStore {
  showSideBar: {
    open: boolean;
    value: string;
  };
  users: IUser[];
  ads: IProduct[];
  deviceId: string;
  accessToken: string;
  products: IProduct[];
  selectedPlan: string;
  selectedOrder: IOrder | null;
  notications: INotification[];
  showCartConfirmDialog: boolean;
  isViewedNotifications: boolean;
  orderSupplier: IUser | undefined;
  orderCustomer: IUser | undefined;
  selectedProduct: IProduct | undefined;
}

const useAppStore = create<AppStore>()(
  immer((set, get) => ({
    showSideBar: {
      open: false,
      value: "",
    },
    ads: [],
    users: [],
    deviceId: "",
    products: [],
    notications: [],
    accessToken: "",
    selectedPlan: "",
    selectedOrder: null,
    orderCustomer: undefined,
    orderSupplier: undefined,
    selectedProduct: undefined,
    showCartConfirmDialog: true,
    isViewedNotifications: false,
  }))
);

export default useAppStore;
