import Image from "next/image";
import debounce from "lodash.debounce";
import Card from "@/components/ui/Card";
import { FiEdit2 } from "react-icons/fi";
import { BsTrash3 } from "react-icons/bs";
import useAppStore from "@/stores/AppStore";
import { useAxios } from "@/hooks/useAxios";
import { BiCalendar } from "react-icons/bi";
import { CiMenuKebab } from "react-icons/ci";
import { IoEyeOutline } from "react-icons/io5";
import { formatDate } from "@/utils/constants";
import { LiaBuysellads } from "react-icons/lia";
import { RiAddLargeLine } from "react-icons/ri";
import Button from "@/components/buttons/Button";
import useUserStore from "@/stores/useUserStore";
import { toast } from "@/components/toast/toast";
import Pagination from "@/components/Pagination";
import React, { useEffect, useState } from "react";
import { useModal } from "@/components/modals/Modal";
import CategoryCard from "@/components/CategoryCard";
import Dropdown from "@/components/dropdown/Dropdown";
import QuickView from "@/components/modals/QuickView";
import DashboardLayout from "@/layouts/DashboardLayout";
import AddProduct from "@/components/modals/AddProduct";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import useProductsRoutes from "@/hooks/useProductsRoutes";
import { TableRowSkeleton } from "@/components/ui/Shimmer";
import UpdateProduct from "@/components/modals/UpdateProduct";
import DeleteProduct from "@/components/modals/DeleteProduct";
import ProductAnalysis from "@/components/modals/ProductAnalysis";
import FxDropdown, { DropdownItem } from "@/components/dropdown/FxDropDown";
import DateFieldWithOnChange from "@/components/input/DatePickerWithOnChange";

type ComponentProps = {
  isSupplier: boolean;
};

type Props = {
  filter: ICategory[];
  isSupplier: boolean;
  setFilter: React.Dispatch<React.SetStateAction<ICategory[]>>;
};

const SupplierProducts: React.FC<ComponentProps> = (props) => {
  const [filter, setFilter] = React.useState<ICategory[]>([]);

  useEffect(() => {
    useAppStore.setState((state) => {
      state.showCartConfirmDialog = true;
    });
  }, []);

  return (
    <div className="flex flex-col space-y-8 pb-10 w-full">
      <div className="flex lg:flex-row flex-col lg:space-x-4 space-y-4 lg:space-y-0 mx-auto w-full h-fit container">
        <div className="w-full lg:w-1/4">
          <LeftSide
            filter={filter}
            setFilter={setFilter}
            isSupplier={props.isSupplier}
          />
        </div>
        <div className="w-full lg:w-3/4">
          <RightSide
            filter={filter}
            setFilter={setFilter}
            isSupplier={props.isSupplier}
          />
        </div>
      </div>
    </div>
  );
};

const LeftSide: React.FC<Props> = (props) => {
  return (
    <div className="flex flex-col space-y-6 w-full">
      <CategoryCard
        categoryfilter={props.filter}
        setCategoryfilter={props.setFilter}
      />
    </div>
  );
};
const RightSide: React.FC<Props> = (props) => {
  const { secureAxios } = useAxios();
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const { getProducts } = useProductsRoutes();
  const { openModal, closeModal } = useModal();
  const role = useUserStore((state) => state.role);
  const [isLoading, setIsLoading] = useState(false);
  const products = useAppStore((state) => state.products);
  const [sort, setSort] = useState<"Newest" | "Oldest">("Newest");
  const id = useUserStore((state) =>
    state.role.includes("super") ? state.id : state.administrator
  );
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [endDate, setEndDate] = useState<string>("");
  const [isCreatingAd, setIsCreatingAd] = useState(false);

  const debouncedSearch = React.useCallback(
    debounce(async (filter: ICategory[]) => {
      const suppliers = props.isSupplier ? [id] : [];
      if (id)
        getProducts(
          sort,
          page,
          filter.map((item) =>
            item.subCategories
              ? item.subCategories?.length > 0
                ? item.subCategories.map((sub) => sub.id).join(",")
                : item.id
              : item.id
          ),
          suppliers,
          setIsLoading,
          setPages
        );
    }, 500),
    [id, page, sort]
  );

  React.useEffect(() => {
    debouncedSearch(props.filter);
    return debouncedSearch.cancel;
  }, [props.filter, debouncedSearch, id, page, sort]);

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleCreateAds = async () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one product",
        variant: "error",
      });
      return;
    }

    if (!endDate) {
      toast({
        title: "Error",
        description: "Please select an end date",
        variant: "error",
      });
      return;
    }

    setIsCreatingAd(true);

    try {
      const promises = Array.from(selectedProducts).map((productId) =>
        secureAxios.post("/shop/hotdeals", {
          productId,
          expiryDate: new Date(endDate).getTime(),
        })
      );

      await Promise.all(promises);

      const data = {
        products: Array.from(selectedProducts),
        expiryDate: new Date(endDate).getTime(),
      };

      const response = await secureAxios.post("/shop/hotdeals", data);

      toast({
        title: "Success",
        description: response.data.message,
        variant: "success",
      });

      setSelectedProducts(new Set());
      setEndDate("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message ?? err.message,
        variant: "error",
      });
    } finally {
      setIsCreatingAd(false);
    }
  };

  const dropDownItems = [
    {
      icon: IoEyeOutline,
      label: "View Product",
      roles: ["supplier"],
      description: "View product details",
      onclick: (product: IProduct) => {
        openModal(
          <QuickView product={product} onCloseDialog={closeModal} isSupplier />
        );
      },
    },
    {
      label: "Product Analysis",
      icon: TbBrandGoogleAnalytics,
      roles: ["supplier", "platform"],
      description: "View product analysis",
      onclick: (product: IProduct) => {
        openModal(
          <ProductAnalysis productId={product.id} closeModal={closeModal} />
        );
      },
    },
    {
      label: "Add to Ads",
      icon: LiaBuysellads,
      roles: ["supplier"],
      description: "Add product to ads",
      onclick: (product: IProduct) => {
        handleProductSelect(product.id);
      },
    },
    {
      label: "Edit Product",
      icon: FiEdit2,
      roles: ["supplier"],
      description: "Edit product details",
      onclick: (product: IProduct) => {
        openModal(
          <UpdateProduct selectedProduct={product} closeModal={closeModal} />
        );
      },
    },
    {
      label: "Delete Product",
      icon: BsTrash3,
      roles: ["supplier"],
      description: "Delete product from shop",
      onclick: (product: IProduct) => {
        openModal(<DeleteProduct product={product} closeModal={closeModal} />);
      },
    },
  ];

  return (
    <div className="flex flex-col space-y-4 w-full h-full">
      <div className="flex justify-between items-center space-x-4 text-lg">
        <span>Showing {products?.length ?? 0} products</span>
        <div className="flex items-center space-x-4">
          <span>Sort by:</span>
          <Dropdown
            classNames={{
              container: "w-56",
              trigger:
                "text-primary w-56 justify-between border border-primary px-4 py-2 rounded-lg text-sm",
            }}
            onClick={(value) => setSort(value as "Newest" | "Oldest")}
            options={["Newest", "Oldest"]}
          />
          {props.isSupplier && (
            <Button
              className="bg-primary rounded-lg text-sm"
              onClick={() => openModal(<AddProduct />)}
            >
              <RiAddLargeLine className="w-4 h-4" />
              <span>Add New</span>
            </Button>
          )}
        </div>
      </div>
      {props.isSupplier && selectedProducts.size > 0 && (
        <Card className="bg-card p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">
                {selectedProducts.size} product(s) selected
              </span>
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="text-red-500 text-sm hover:underline cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
            <div className="flex items-end space-x-4">
              <div className="flex flex-col flex-1 space-y-2">
                <label htmlFor="endDate" className="font-medium text-sm">
                  Advertisement End Date
                </label>
                <DateFieldWithOnChange
                  label="Expiry Date"
                  minDate={new Date()}
                  icon={<BiCalendar className="w-6 h-6 text-black" />}
                  onChange={(e) => setEndDate(e)}
                  classnames={{
                    input: "bg-transparent",
                  }}
                />
              </div>
              <Button
                className="bg-primary rounded-lg text-sm"
                onClick={handleCreateAds}
                disabled={isCreatingAd}
                isLoading={isCreatingAd}
              >
                Create Advertisements
              </Button>
            </div>
          </div>
        </Card>
      )}
      <div className="flex flex-col w-full">
        <div className="flex flex-col space-y-4 mt-4">
          <div className="overflow-x-auto">
            <table className="bg-gray-50 rounded-xl w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="p-3 font-semibold text-sm text-left">
                    Product
                  </th>
                  <th className="p-3 font-semibold text-sm text-left">Price</th>
                  <th className="p-3 font-semibold text-sm text-left">
                    Quantity
                  </th>
                  <th className="p-3 font-semibold text-sm text-left">
                    Expiry Date
                  </th>
                  <th className="p-3 font-semibold text-sm text-left"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={6} />
                  ))}
                {!isLoading && products.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="flex flex-col justify-center items-center space-y-4 mx-auto py-10 w-full h-full"
                    >
                      <Image
                        src="/svgs/empty-cart.svg"
                        alt="empty cart"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="rounded-xl w-full max-w-[10rem] object-cover aspect-square"
                      />
                      <span className="font-bold text-xl">
                        Your product list is empty
                      </span>
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  products.length > 0 &&
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 border-border border-b"
                    >
                      <td className="flex items-center space-x-2 p-3">
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={0}
                          height={0}
                          sizes="100vw"
                          className="bg-gray-500 rounded-xl w-full max-w-[4rem] object-cover aspect-square"
                        />
                        <div className="flex flex-col space-y-2">
                          <span className="font-semibold text-sm">
                            {product.title}
                          </span>
                          <span className="max-w-[8rem] text-xs truncate">
                            {product.description}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-green-600">
                          ${product.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{product.quantity}</td>
                      <td className="p-3">{formatDate(product.expiryDate)}</td>
                      <td className="p-3">
                        <FxDropdown
                          align="right"
                          trigger={
                            <div className="flex items-center space-x-2 hover:bg-gray-50 px-4 py-2.5 text-primary">
                              <CiMenuKebab size={20} />
                            </div>
                          }
                          classnames={{
                            dropdown: "w-48",
                          }}
                        >
                          {dropDownItems.map((item) => (
                            <DropdownItem
                              onClick={() => item.onclick(product)}
                              className={
                                item.roles.includes(role.split("-")[0])
                                  ? "block"
                                  : "hidden"
                              }
                            >
                              <div className="flex items-center space-x-3">
                                <item.icon className="w-5 h-5 text-gray-500" />
                                <div className="flex flex-col">
                                  <span>{item.label}</span>
                                </div>
                              </div>
                            </DropdownItem>
                          ))}
                        </FxDropdown>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pages > 1 && (
        <Pagination
          pageNumber={page}
          setPageNumber={setPage}
          contentsLength={products.length}
        />
      )}
    </div>
  );
};

export default SupplierProducts;
