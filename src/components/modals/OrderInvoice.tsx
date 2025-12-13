"use client";
import Image from "next/image";
import React, { useMemo } from "react";
import PDFGenerator from "../PDFGenerator";
import useAppStore from "@/stores/AppStore";
import { formatDate } from "@/utils/constants";
import useUserStore from "@/stores/useUserStore";

interface Props {
  orderProducts: IProduct[];
  orderDetails: IOrder | null;
}

function OrderInvoice(props: Props) {
  const id = useUserStore((state) => state.id);
  const supplier = useAppStore((state) => state.orderSupplier);
  const customer = useAppStore((state) => state.orderCustomer);

  const subtotal = props.orderProducts.reduce(
    (sum, product) => sum + product.price * (product.quantity || 1),
    0
  );

  // Prepare data for PDF generation
  const invoiceData = useMemo(() => {
    return {
      supplier: supplier,
      customer: customer,
      orderDetails: props.orderDetails,
      date: formatDate(
        props.orderDetails?.createdAt || new Date().toISOString()
      ),
      orderProducts: props.orderProducts.map((product) => ({
        ...product,
        expiryDate: formatDate(product.expiryDate),
      })),
      subtotal: subtotal,
    };
  }, [supplier, customer, props.orderDetails, props.orderProducts, subtotal]);

  return (
    <div className="flex flex-col space-y-4 h-[90vh] overflow-y-hidden">
      <h1 className="mt-1 mb-4 font-bold text-3xl">ORDER INVOICE</h1>

      {/* Action Buttons */}
      <PDFGenerator
        invoiceData={invoiceData}
        filename={`invoice-${props.orderDetails?.id || "order"}`}
      />

      {/* Invoice Container */}
      <div className="bg-white p-8 border border-gray-200 rounded-lg w-full h-full overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-gray-300 border-b-2">
          <div>
            <h2 className="mb-1 font-bold text-3xl">Invoice</h2>
          </div>
          <div className="text-right">
            <div className="flex justify-end mb-2">
              {supplier?.logo && (
                <Image
                  src={supplier.logo}
                  alt="Company Logo"
                  width={80}
                  height={80}
                  className="w-20 h-20"
                />
              )}
            </div>
          </div>
        </div>
        <div className="gap-10 grid grid-cols-2 mb-8">
          {/* Company Info */}
          <div className="mb-8">
            <h3 className="mb-2 font-bold text-lg">{supplier?.companyName}</h3>
            <p className="text-gray-600 text-sm">{supplier?.branchName}</p>
            <p className="text-gray-600 text-sm">{supplier?.address}</p>
            <p className="text-gray-600 text-sm">{supplier?.city}</p>
          </div>
          <div className="text-right">
            <div className="mb-3">
              <p className="font-semibold text-sm">
                Invoice Number:{" "}
                <span className="font-normal">
                  {props.orderDetails?.id || "N/A"}
                </span>
              </p>
            </div>
            <div className="mb-3">
              <p className="font-semibold text-sm">
                Telephone:{" "}
                <span className="font-normal">{supplier?.phone || "N/A"}</span>
              </p>
            </div>
            <div className="mb-3">
              <p className="font-semibold text-sm">
                Email:{" "}
                <span className="font-normal">{supplier?.email || "N/A"}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-10 mb-8">
          <div>
            <p className="font-semibold text-gray-600 text-xs">
              Customer Account
            </p>
            <p className="font-medium text-sm">{customer?.id}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-600 text-xs">Date</p>
            <p className="font-medium text-sm">
              {formatDate(
                props.orderDetails?.createdAt || new Date().toISOString()
              )}
            </p>
          </div>
        </div>
        <div className="gap-10 grid grid-cols-2 mb-8">
          <div className="p-4 border border-gray-400 rounded-lg">
            <h4 className="mb-2 font-bold">Bill To</h4>
            <p className="text-gray-700 text-sm">{customer?.branchName}</p>
            <p className="text-gray-700 text-sm">{customer?.address}</p>
            <p className="text-gray-700 text-sm capitalize">{customer?.city}</p>
          </div>
          <div className="p-4 border border-gray-400 rounded-lg">
            <h4 className="mb-2 font-bold">Deliver To:</h4>
            <p className="text-gray-700 text-sm">{customer?.address}</p>
            <p className="text-gray-700 text-sm capitalize">{customer?.city}</p>
          </div>
        </div>
        {/* Products Table */}
        <div className="mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-gray-400 border-b-2">
                <th className="px-2 py-2 font-bold text-left">Code</th>
                <th className="px-2 py-2 font-bold text-left">Name</th>
                <th className="px-2 py-2 font-bold text-center">Qty</th>
                <th className="px-2 py-2 font-bold text-center">
                  Batch Number
                </th>
                <th className="px-2 py-2 font-bold text-center">Expiry Date</th>
                <th className="px-2 py-2 font-bold text-right">Price (Inc)</th>
                <th className="px-2 py-2 font-bold text-right">Disc %</th>
                <th className="px-2 py-2 font-bold text-right">Tax</th>
                <th className="px-2 py-2 font-bold text-right">Total (Incl)</th>
              </tr>
            </thead>
            <tbody>
              {props.orderProducts.map((product, index) => (
                <tr key={index} className="border-gray-200 border-b">
                  <td className="px-2 py-3 text-sm">
                    {product.id?.slice(0, 6)}...
                  </td>
                  <td className="px-2 py-3 text-sm">{product.title}</td>
                  <td className="px-2 py-3 font-medium text-sm text-center">
                    {product.quantity}
                  </td>
                  <td className="px-2 py-3 text-sm text-center">
                    {product.batchNumber || "N/A"}
                  </td>
                  <td className="px-2 py-3 text-sm text-center">
                    {formatDate(product.expiryDate)}
                  </td>
                  <td className="px-2 py-3 text-sm text-right">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-sm text-right">0.0%</td>
                  <td className="px-2 py-3 text-sm text-right">0.00</td>
                  <td className="px-2 py-3 font-medium text-sm text-right">
                    ${(product.price * (product.quantity || 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-gray-300 border-b">
              <span className="text-sm">Total Excl</span>
              <span className="font-medium text-sm">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-gray-300 border-b">
              <span className="text-sm">Tax Total</span>
              <span className="font-medium text-sm">0.00</span>
            </div>
            <div className="flex justify-between py-2 border-gray-300 border-b">
              <span className="text-sm">Total Discount</span>
              <span className="font-medium text-sm">0.00</span>
            </div>
            <div className="flex justify-between bg-gray-50 px-3 py-3 border-gray-400 border-t-2 font-bold">
              <span>INVOICE TOTAL USD</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="pt-6 border-gray-300 border-t-2">
          <div>
            <h4 className="mb-2 font-bold text-sm">RETURNS & POLICY</h4>
            <p className="text-gray-600 text-xs">
              Returns and exchanges accepted within 30 days of purchase with
              original receipt.
            </p>
          </div>

          <div className="gap-10 grid grid-cols-3 mt-20 text-xs">
            <div>
              <p className="mb-8 font-semibold text-gray-700">Received By</p>
              <div className="border-gray-400 border-b h-8"></div>
            </div>
            <div>
              <p className="mb-8 font-semibold text-gray-700">Signed</p>
              <div className="border-gray-400 border-b h-8"></div>
            </div>
            <div>
              <p className="mb-8 font-semibold text-gray-700">Date</p>
              <div className="border-gray-400 border-b h-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderInvoice;
