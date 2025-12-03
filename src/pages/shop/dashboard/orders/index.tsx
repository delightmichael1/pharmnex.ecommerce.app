import Image from "next/image";
import { FaEye } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useAxios } from "@/hooks/useAxios";
import { toast } from "@/components/toast/toast";
import Pagination from "@/components/Pagination";
import Dropdown from "@/components/dropdown/Dropdown";
import DashboardLayout from "@/layouts/DashboardLayout";
import SearchInput from "@/components/input/SearchInput";
import usePersistedStore from "@/stores/PersistedStored";
import { TableRowSkeleton } from "@/components/ui/Shimmer";
import React, { useEffect, useMemo, useState } from "react";
import { formatDate, getStatusBadgeClass } from "@/utils/constants";

function Orders() {
  const router = useRouter();
  const { secureAxios } = useAxios();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("Newest");
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const orders = usePersistedStore((state) => state.orders);

  const filteredOrders = useMemo(() => {
    let filtered = orders?.filter((order) => {
      return order?.status.toLowerCase().includes(searchQuery.toLowerCase());
    });
    return filtered;
  }, [orders, searchQuery]);

  const fetchOrders = async () => {
    setIsLoading(true);
    let fxsort = -1;
    if (sortBy === "Newest") fxsort = -1;
    else if (sortBy === "Oldest") fxsort = 1;
    try {
      const response = await secureAxios.get(
        `/shop/orders?page=${page}&sort=${fxsort}&limit=20`
      );
      if (!response.data.orders || response.data.orders.length === 0) {
        usePersistedStore.setState((state) => {
          state.orders = [];
          setTotalPages(1);
        });
        return;
      }
      console.log(response.data);
      usePersistedStore.setState((state) => {
        state.orders = response.data.orders;
        setTotalPages(response.data.pages);
      });
    } catch (error: any) {
      toast({
        description: `${
          !error.response ? error.message : error.response.data.message
        }`,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, sortBy]);

  const getPaymentMethod = (value: string): string => {
    let returnValue;
    switch (value) {
      case "cod":
        returnValue = "Cash on Delivery";
        break;
      case "pop":
        returnValue = "Proof of Payment";
        break;
      case "credit":
        returnValue = "Credit";
        break;
      default:
        returnValue = "Cash on Delivery";
        break;
    }

    return returnValue;
  };

  return (
    <DashboardLayout title="Orders" description="Manage my orders list">
      <div className="flex flex-col space-y-4 mx-auto w-full h-full container">
        <div className="w-full h-full overflow-y-auto">
          <div className="flex justify-between items-center">
            <SearchInput onChange={(e) => setSearchQuery(e)} />
            <div className="flex items-center space-x-4">
              <span>Sort by:</span>
              <Dropdown
                classNames={{
                  container: "w-56",
                  trigger:
                    "text-primary w-56 justify-between border border-primary px-4 py-2 rounded-lg",
                }}
                options={["Newest", "Oldest"]}
                onClick={(e) => setSortBy(e)}
              />
            </div>
          </div>
          {orders?.length === 0 && (
            <div className="flex flex-col justify-center items-center space-y-4 w-full h-[90%]">
              <Image
                src="/svgs/empty-cart.svg"
                alt="empty cart"
                width={0}
                height={0}
                sizes="100vw"
                className="rounded-xl w-full max-w-[10rem] object-cover aspect-square"
              />
              <span className="font-bold text-xl">
                Your order list is empty
              </span>
            </div>
          )}
          {orders?.length > 0 && (
            <div className="flex flex-col space-y-4 mt-4">
              <div className="overflow-x-auto">
                <table className="bg-gray-50 rounded-xl w-full">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="p-3 font-semibold text-sm text-left">
                        Order ID
                      </th>
                      <th className="p-3 font-semibold text-sm text-left">
                        Order Date
                      </th>
                      <th className="p-3 font-semibold text-sm text-left">
                        Delivery Date
                      </th>
                      <th className="p-3 font-semibold text-sm text-left">
                        Total
                      </th>
                      <th className="p-3 font-semibold text-sm text-left">
                        Payment Method
                      </th>
                      <th className="p-3 font-semibold text-sm text-left">
                        Status
                      </th>
                      <th className="p-3 font-semibold text-sm text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRowSkeleton columns={6} key={index} />
                      ))
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-gray-500 text-center"
                        >
                          No orders found matching your search
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 border-border border-b"
                        >
                          <td className="p-3">
                            <span className="font-mono font-medium text-sm">
                              {order.id}
                            </span>
                          </td>
                          <td className="p-3 text-sm">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="p-3 text-sm">
                            {Number(order.deliveryDate) > 0
                              ? formatDate(order.deliveryDate)
                              : "-"}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-green-600">
                              ${order.total.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold capitalize">
                              {getPaymentMethod(order.paymentMethod)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                order.status
                              )}`}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-3">
                            <FaEye
                              size={20}
                              className="cursor-pointer"
                              onClick={() =>
                                router.push(
                                  `/shop/dashboard/orders/${order.id}`
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-gray-600 text-sm">
                  Showing {filteredOrders.length} of {orders.length} orders
                </span>
                {totalPages > 1 && (
                  <Pagination
                    pageNumber={page}
                    contentsLength={totalPages}
                    setPageNumber={setPage}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Orders;
