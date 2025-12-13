"use client";
import Image from "next/image";
import { useRouter } from "next/router";
import useAppStore from "@/stores/AppStore";
import { useAxios } from "@/hooks/useAxios";
import { FaFileDownload, FaWhatsapp } from "react-icons/fa";
import { toast } from "@/components/toast/toast";
import Pagination from "@/components/Pagination";
import Button from "@/components/buttons/Button";
import ViewPOP from "@/components/modals/ViewPOP";
import React, { useEffect, useState } from "react";
import { RiSecurePaymentFill } from "react-icons/ri";
import { useModal } from "@/components/modals/Modal";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getStatusBadgeClass } from "@/utils/constants";
import { TableRowSkeleton } from "@/components/ui/Shimmer";
import OrderInvoice from "@/components/modals/OrderInvoice";
import useProductsRoutes from "@/hooks/useProductsRoutes";
import useUserStore from "@/stores/useUserStore";

function Order() {
  const router = useRouter();
  const { id } = router.query;
  const { secureAxios } = useAxios();
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState("Newest");
  const { openModal, closeModal } = useModal();
  const userId = useUserStore((state) => state.id);
  const [isLoading, setIsLoading] = useState(false);
  const { getOrderSupplierNCustomer } = useProductsRoutes();
  const selectedOrder = useAppStore((state) => state.selectedOrder);
  const orderSupplier = useAppStore((state) => state.orderSupplier);
  const [orderProducts, setOrderProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    if (!id) {
      router.back();
    } else {
      getOrder();
    }
  }, [sort, page, id]);

  useEffect(() => {
    if (id) getOrderSupplierNCustomer(id as string, userId);
  }, [id]);

  const getOrder = async () => {
    setIsLoading(true);
    let fxSort = -1;
    if (sort === "Newest") fxSort = -1;
    else if (sort === "Oldest") fxSort = 1;
    await secureAxios
      .get(`/shop/orders/${id}?page=${page}&limit=20&sort=${fxSort}`)
      .then((res) => {
        setOrderProducts(res.data.products);
        setPages(res.data.pages);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.response?.data?.message || err.message,
          variant: "error",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <DashboardLayout
      isSupplier={false}
      title="Order"
      description={"Id: #" + id}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-end items-center space-x-1">
          <Button
            className="bg-primary rounded-lg h-10"
            onClick={() =>
              openModal(
                <OrderInvoice
                  orderDetails={selectedOrder}
                  orderProducts={orderProducts}
                />
              )
            }
          >
            <FaFileDownload className="mr-2 w-4 h-4" />
            <span> Download Invoice</span>
          </Button>
          {selectedOrder?.paymentMethod === "pop" && (
            <Button
              className="bg-primary rounded-lg h-10"
              onClick={() => {
                openModal(
                  <ViewPOP
                    closeModal={closeModal}
                    popUrl={selectedOrder?.popUrl}
                  />
                );
              }}
            >
              <RiSecurePaymentFill className="mr-2 w-5 h-5" />
              <span>Proof of Payment</span>
            </Button>
          )}
        </div>
        <div className="flex lg:flex-row flex-col lg:space-x-4 space-y-4 lg:space-y-0 mx-auto w-full h-fit container">
          <div className="flex flex-col space-y-2 w-full lg:w-3/4">
            <span className="font-semibold text-lg">Order Details</span>
            <div className="flex flex-col space-y-4">
              <div className="overflow-x-auto">
                <table className="bg-gray-50 rounded-xl w-full">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="p-3 font-semibold text-sm text-left">
                        Product ID
                      </th>
                      <th className="p-3 font-semibold text-sm text-left">
                        Product Name
                      </th>
                      <th className="p-3 font-semibold text-sm text-left">
                        Price
                      </th>
                      <th className="p-3 font-semibold text-sm text-left">
                        Quantity
                      </th>
                      <th className="p-3 font-semibold text-sm text-left">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRowSkeleton columns={5} key={index} />
                      ))
                    ) : orderProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-gray-500 text-center"
                        >
                          No products found for this order
                        </td>
                      </tr>
                    ) : (
                      orderProducts.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 border-border border-b"
                        >
                          <td className="p-3">
                            <span className="font-mono font-medium text-sm">
                              {order.id}
                            </span>
                          </td>
                          <td className="p-3 text-sm">{order.title}</td>
                          <td className="p-3">
                            <span className="font-semibold text-green-600">
                              ${order.price.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3 text-sm">X {order.quantity}</td>
                          <td className="p-3">
                            <span className="font-semibold capitalize">
                              ${(order.quantity * order.price).toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-gray-600 text-sm">
                  Showing {orderProducts.length} products
                </span>
                {pages > 1 && (
                  <Pagination
                    pageNumber={page}
                    contentsLength={pages}
                    setPageNumber={setPage}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-2 mt-10">
              <span className="font-semibold text-lg">Order Tracking</span>
              <div className="bg-gray-50 p-6 rounded-xl w-full">
                {/* Main Progress Line */}
                <span
                  className={`px-3 py-1 rounded-full flex mx-auto w-fit mb-5 text-sm font-medium ${getStatusBadgeClass(
                    selectedOrder?.status ?? ""
                  )}`}
                >
                  Order{" "}
                  {selectedOrder?.status &&
                    selectedOrder?.status.charAt(0).toUpperCase() +
                      selectedOrder?.status.slice(1)}
                </span>
                <div className="relative">
                  <div className="flex justify-between items-start mb-12">
                    {/* Order Placed (Node 1) */}
                    <div className="z-10 relative flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 ${
                          selectedOrder?.status === "pending" ||
                          ["accepted", "shipped", "cancelled"].includes(
                            selectedOrder?.status || ""
                          )
                            ? "bg-primary border-primary"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Image
                          src={"/svgs/cart.svg"}
                          alt="cart"
                          width={24}
                          height={24}
                          sizes="100vw"
                          className="w-6 h-6"
                        />
                      </div>
                      <span className="bg-gray-50 font-semibold text-sm text-center">
                        Order Placed
                      </span>
                    </div>

                    {/* Order Accepted (Node 2) */}
                    <div className="z-10 relative flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 ${
                          selectedOrder?.status === "accepted" ||
                          ["shipped"].includes(selectedOrder?.status || "")
                            ? "bg-primary border-primary"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Image
                          src={"/svgs/truck.svg"}
                          alt="truck"
                          width={24}
                          height={24}
                          sizes="100vw"
                          className="w-6 h-6"
                        />
                      </div>
                      <span className="font-semibold text-sm text-center">
                        Order Accepted
                      </span>
                    </div>

                    {/* Order Shipped (Node 3) */}
                    <div className="z-10 relative flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 ${
                          selectedOrder?.status === "shipped"
                            ? "bg-primary border-primary"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Image
                          src={"/svgs/buildings.svg"}
                          alt="buildings"
                          width={24}
                          height={24}
                          sizes="100vw"
                          className="w-6 h-6"
                        />
                      </div>
                      <span className="font-semibold text-sm text-center">
                        Order Shipped
                      </span>
                    </div>
                  </div>

                  {/* Progress Lines (Main Path) */}
                  <svg
                    className="top-6 left-0 absolute w-full h-1 pointer-events-none"
                    style={{ height: "4px" }}
                  >
                    <line
                      x1="5%"
                      y1="0"
                      x2="50%"
                      y2="0"
                      stroke={
                        ["accepted", "shipped"].includes(
                          selectedOrder?.status || ""
                        )
                          ? "#3B82F6"
                          : "#D1D5DB"
                      }
                      strokeWidth="6"
                    />
                    <line
                      x1="50%"
                      y1="0"
                      x2="95%"
                      y2="0"
                      stroke={
                        ["shipped"].includes(selectedOrder?.status || "")
                          ? "#3B82F6"
                          : "#D1D5DB"
                      }
                      strokeWidth="6"
                    />
                  </svg>
                </div>

                {/* Cancelled Branch */}
                <div className="relative flex items-start -mt-20 ml-9">
                  {/* Branching Line from Order Placed */}
                  <svg
                    className="top-0 left-0 absolute w-16 h-96 pointer-events-none"
                    style={{ overflow: "visible" }}
                  >
                    <line
                      x1="10"
                      y1="0"
                      x2="10"
                      y2="90"
                      stroke={
                        selectedOrder?.status === "cancelled"
                          ? "#EF4444"
                          : "#D1D5DB"
                      }
                      strokeWidth="4"
                    />
                    <line
                      x1="9"
                      y1="90"
                      x2="85"
                      y2="90"
                      stroke={
                        selectedOrder?.status === "cancelled"
                          ? "#EF4444"
                          : "#D1D5DB"
                      }
                      strokeWidth="4"
                    />
                  </svg>

                  {/* Cancelled Node */}
                  <div className="z-10 relative flex flex-col items-center mt-17 ml-12">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 ${
                        selectedOrder?.status === "cancelled"
                          ? "bg-red-500 border-red-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Image
                        src={"/svgs/buildings.svg"}
                        alt="cancelled"
                        width={24}
                        height={24}
                        sizes="100vw"
                        className="w-6 h-6"
                      />
                    </div>
                    <span className="font-semibold text-sm text-center">
                      Order Cancelled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-2 w-full lg:w-1/4">
            <span className="font-semibold text-lg">Paid by customer</span>
            <div className="flex flex-col space-y-2 bg-gray-50 p-4 rounded-xl w-full">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Items:</span>
                <span>
                  {orderProducts
                    .reduce((acc, item) => acc + (item.quantity ?? 1), 0)
                    .toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total (tax excl.):</span>
                <span>
                  $
                  {orderProducts
                    .reduce((acc, item) => {
                      const itemCost = item.price * (item.quantity ?? 1);
                      return acc + itemCost;
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
              <hr className="my-4 border-strokedark" />
              <div className="flex justify-between items-center font-bold">
                <span className="text-gray-500">Total (tax inc.):</span>
                <span>
                  $
                  {orderProducts
                    .reduce((acc, item) => {
                      const itemCost = item.price * (item.quantity ?? 1);
                      return acc + itemCost;
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
            <Button
              className="bg-primary mt-2 rounded-lg h-10"
              onClick={() => {
                if (orderSupplier?.phone) {
                  let phoneNumber = orderSupplier?.phone.replace(/\D/g, "");

                  if (phoneNumber.startsWith("0")) {
                    phoneNumber = phoneNumber.slice(1);
                  }

                  if (!phoneNumber.startsWith("263")) {
                    phoneNumber = "263" + phoneNumber;
                  }

                  window.open(
                    `https://wa.me/${phoneNumber}?text=Hello, I have an inquiry about my order #${id}`,
                    "_blank"
                  );
                } else {
                  toast({
                    title: "Error",
                    description: "Supplier phone number not available",
                    variant: "error",
                  });
                }
              }}
            >
              <FaWhatsapp className="mr-2 w-4 h-4" />
              <span>Chat with Supplier</span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Order;
