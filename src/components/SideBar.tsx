import cn from "@/utils/cn";
import Card from "./ui/Card";
import Image from "next/image";
import Button from "./buttons/Button";
import { toast } from "./toast/toast";
import Pagination from "./Pagination";
import { useAxios } from "@/hooks/useAxios";
import useAppStore from "@/stores/AppStore";
import { HiShoppingBag } from "react-icons/hi2";
import useUserStore from "@/stores/useUserStore";
import { AnimatePresence, motion } from "framer-motion";
import usePersistedStore from "@/stores/PersistedStored";
import React, { useEffect, useRef, useState } from "react";
import { FaFileInvoice, FaRegCircleXmark, FaXmark } from "react-icons/fa6";
import { BiChevronUp, BiChevronDown, BiTrash } from "react-icons/bi";
import SelectFieldWithOnChange from "./input/SelectFieldWithOnChange";
import { ModalProvider, useModal } from "./modals/Modal";
import { paymentMethods } from "@/utils/constants";
import DropZone from "./input/DropZone";

function SideBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const showSideBar = useAppStore((state) => state.showSideBar);

  return (
    <ModalProvider>
      <AnimatePresence>
        {showSideBar.open && (
          <motion.div
            ref={barRef}
            initial={{ x: "100%" }}
            whileInView={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 1, type: "spring" }}
            className="top-0 right-0 bottom-0 z-50 fixed bg-card backdrop-blur-2xl p-6 w-[26rem] overflow-y-auto"
          >
            <button
              onClick={() => {
                useAppStore.setState({
                  showSideBar: { open: false, value: "" },
                });
              }}
              className="top-4 right-4 absolute flex justify-center items-center hover:bg-red-500/10 px-2 py-2 rounded-full w-10 max-w-10 h-10 hover:text-red-500 duration-300 cursor-pointer"
            >
              <FaXmark className="min-w-4 h-4" />
            </button>
            {showSideBar.value === "cart" && <Cart isCart />}
            {showSideBar.value === "wish-list" && <Cart />}
            {showSideBar.value === "notifications" && <Notifications />}
          </motion.div>
        )}
      </AnimatePresence>
    </ModalProvider>
  );
}

function Notifications() {
  const { role } = useUserStore();
  const { secureAxios } = useAxios();
  const [page, setPage] = useState(1);
  const { notications } = useAppStore();

  useEffect(() => {
    if (page > 1 && role.includes("supplier")) {
      getNotifications();
    }
  }, [page]);

  const getNotifications = async () => {
    await secureAxios
      .get(`/shop/notifications?page=${page}&limit=20`)
      .then((res) => {
        if (res.data.notifications) {
          useAppStore.setState({ notications: res.data.notifications });
        } else {
          useAppStore.setState({ notications: [] });
        }
      })
      .catch((err) => {
        toast({
          description: err?.response?.data?.message ?? err.message,
          variant: "error",
        });
      });
  };
  return (
    <div className="flex flex-col space-y-4">
      <div className="pb-4 border-strokedark border-b w-full">
        <h2 className="font-bold text-xl">Notifications</h2>
      </div>
      {notications.length > 0 ? (
        <div className="flex flex-col space-y-4">
          <Button
            className="flex bg-primary ml-auto rounded-lg w-fit"
            onClick={() => {
              useAppStore.setState({
                notications: [],
                isViewedNotifications: true,
              });
            }}
          >
            Mark all as read
          </Button>
          {notications.map((item, index) => (
            <Card key={index} className="relative bg-card-2/40 shadow">
              <p className="text-sm">{item.message}</p>
              <button
                className="-top-2 -right-2 absolute hover:text-red-500 duration-300 cursor-pointer"
                onClick={() => {
                  useAppStore.setState((state) => {
                    let newNotications = [...state.notications];
                    newNotications.splice(index, 1);
                    return { notications: newNotications };
                  });
                }}
              >
                <FaRegCircleXmark className="w-5 h-5" />
              </button>
            </Card>
          ))}
          <Pagination
            variant="primary"
            limit={20}
            contentsLength={notications.length}
            pageNumber={page}
            setPageNumber={setPage}
          />
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center space-y-4 px-4 py-10">
          <Image
            src="/svgs/empty-cart.svg"
            alt="empty cart"
            width={0}
            height={0}
            sizes="100vw"
            className="rounded-xl w-full max-w-[10rem] object-cover aspect-square"
          />
          <span className="font-bold text-xl">No notifications</span>
        </div>
      )}
    </div>
  );
}

type Props = {
  isCart?: boolean;
};

function Cart(props: Props) {
  const { secureAxios } = useAxios();
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [pop, setPop] = useState<File | null>(null);
  const cart = usePersistedStore((state) => state.cart);
  const wishList = usePersistedStore((state) => state.wishList);
  const [paymentMethodError, setPaymentMethodError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);
  const data = props.isCart ? cart : wishList;

  const placeOrder = async () => {
    if (data.length === 0) return;
    const formData = new FormData();

    // if (pop) formData.append("pop", pop);
    // formData.append("paymentMethod", selectedPaymentMethod);
    // const items = data.map((item) => ({
    //   product: item.id,
    //   quantity: item.quantity,
    // }));
    // formData.append("items", JSON.stringify(items));

    const dataToSend = {
      pop,
      paymentMethod: selectedPaymentMethod,
      items: JSON.stringify(
        data.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        }))
      ),
    };
    setIsLoading(true);
    await secureAxios
      .post("/shop/order", dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        let tempErrors: { id: string; message: string }[] = [];
        console.log(res);
        if (props.isCart) {
          usePersistedStore.setState((state) => {
            let newcart: IProduct[] = [];
            if (res.data.errors && res.data.errors.length > 0) {
              for (const err of res.data.errors) {
                const product = state.cart.find((item) => item.id === err.id);
                if (product) {
                  tempErrors.push(err);
                  newcart.push(product);
                }
              }
            }
            state.cart = newcart;
          });
        } else {
          usePersistedStore.setState((state) => {
            let newwishList: IProduct[] = [];
            if (res.data.errors && res.data.errors.length > 0) {
              for (const err of res.data.errors) {
                const product = state.wishList.find(
                  (item) => item.id === err.id
                );
                if (product) {
                  tempErrors.push(err);
                  newwishList.push(product);
                }
              }
            }
            state.wishList = newwishList;
          });
        }

        setErrors(tempErrors);
        if (tempErrors.length === 0) {
          setSelectedPaymentMethod("");
          setPop(null);
        }
        toast({
          description: res.data.message,
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          description: error?.response?.data?.message ?? error.message,
          variant: "error",
        });
      })
      .finally(() => setIsLoading(false));
  };

  const handleAddToCart = (product: IProduct) => {
    usePersistedStore.setState((state) => {
      if (state.cart.find((item) => item.id === product.id)) {
        state.cart.map((item) => {
          if (item.id === product.id) {
            if (!item.quantity) {
              item.quantity = product.quantity ?? 1;
            } else {
              item.quantity += product.quantity ?? 1;
            }
          }
        });
      } else {
        state.cart.push({ ...product, quantity: product.quantity ?? 1 });
      }
      state.wishList = state.wishList.filter((itx) => itx.id !== product.id);
    });
    toast({
      description: "Product added to cart",
      variant: "success",
    });
  };

  console.log("##########", selectedPaymentMethod);

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="pb-4 border-strokedark border-b w-full">
        <h2 className="font-bold text-xl">
          Shopping {props.isCart ? "Cart" : "WishList"}
        </h2>
      </div>
      {data.length > 0 && (
        <div className="flex flex-col space-y-1 w-full">
          <SelectFieldWithOnChange
            name={"paymentMethod"}
            label={"Payment Method"}
            value={selectedPaymentMethod}
            placeholder="Selected Payment Method"
            options={paymentMethods}
            onChange={(value) => {
              setSelectedPaymentMethod(value);
              setPaymentMethodError("");
            }}
            classNames={{
              base: "border-red-500",
            }}
          />
          {paymentMethodError && (
            <span className="text-red-500">Payment Method is required</span>
          )}
        </div>
      )}
      {selectedPaymentMethod === "pop" && (
        <>
          <div className="flex flex-col space-y-2 bg-yellow-100 p-4 rounded-lg">
            <span className="font-bold">Note:</span>
            <span className="text-sm">
              Please ensure that you upload a clear and legible proof of payment
              when placing your order. This helps us verify your payment quickly
              and process your order without delays.
            </span>
          </div>
          <DropZone
            file={pop}
            label="Proof of Payment Image"
            fileType={["image", "document"]}
            setFile={setPop}
            icon={FaFileInvoice}
            className=""
            classNames={{
              container: "min-w-0",
            }}
            maxSize={3}
          />
        </>
      )}
      <div className="flex flex-col space-y-6 w-full divide">
        {data.map((item) => (
          <div
            className={cn(
              "flex flex-col space-y-4 bg-card-2/50 p-4 rounded-xl w-full",
              errors.some((err) => err.id === item.id) && "bg-red-500/10"
            )}
          >
            <div key={item.id} className={"flex flex-col space-y-4 w-full"}>
              <div className="flex flex-1 items-center space-x-4 w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="bg-primary/10 rounded-xl w-full max-w-14 object-cover aspect-square"
                />
                <div className="flex flex-col space-y-1">
                  <span className="font-bold text-sm">{item.title}</span>
                  <span className="text-primary text-lg">${item.price}</span>
                </div>
              </div>
              <div className="flex justify-between items-center space-x-10 w-full">
                <div className="flex border border-strokedark rounded-lg overflow-hidden divider divider-strokedark">
                  <input
                    type="number"
                    value={
                      item.quantity?.toString().replace(/[^0-9]/g, "") ?? 1
                    }
                    onChange={(e) => {
                      usePersistedStore.setState((state) => {
                        state.cart.map((item) => {
                          if (item.id === item.id) {
                            item.quantity = Number(e.target.value);
                          }
                        });
                      });
                    }}
                    className="p-2 px-4 outline-none w-16"
                  />
                  <div className="flex flex-col divide-strokedark divide">
                    <BiChevronUp
                      className="hover:bg-primary/20 p-1 w-8 h-6 cursor-pointer"
                      onClick={() =>
                        usePersistedStore.setState((state) => {
                          state.cart.map((cart) => {
                            if (cart.id === item.id) {
                              if (cart.quantity) {
                                cart.quantity += 1;
                              } else {
                                cart.quantity = 1;
                              }
                            }
                          });
                        })
                      }
                    />
                    <BiChevronDown
                      onClick={() =>
                        usePersistedStore.setState((state) => {
                          state.cart.map((cart) => {
                            if (
                              cart.id === item.id &&
                              cart.quantity &&
                              cart.quantity > 1
                            ) {
                              cart.quantity -= 1;
                            }
                          });
                        })
                      }
                      className="hover:bg-primary/20 p-1 w-8 h-6 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  {!props.isCart && (
                    <HiShoppingBag
                      title="Move to cart"
                      className="hover:bg-primary/20 p-1 rounded-full w-8 h-8 hover:text-primary duration-300 cursor-pointer"
                      onClick={() => handleAddToCart(item)}
                    />
                  )}
                  <BiTrash
                    title="Remove"
                    className="hover:bg-primary/20 p-1 rounded-full w-8 h-8 hover:text-red-500 duration-300 cursor-pointer"
                    onClick={() =>
                      usePersistedStore.setState((state) => {
                        if (props.isCart) {
                          state.cart = state.cart.filter(
                            (itx) => itx.id !== item.id
                          );
                        } else {
                          state.wishList = state.wishList.filter(
                            (itx) => itx.id !== item.id
                          );
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>
            {errors.some((err) => err.id === item.id) && (
              <span className="text-red-500 text-sm capitalize">
                {errors.find((err) => err.id === item.id)?.message}
              </span>
            )}
          </div>
        ))}
        {data.length === 0 && (
          <div className="flex flex-col justify-center items-center space-y-4 px-4 py-10">
            <Image
              src="/svgs/empty-cart.svg"
              alt="empty cart"
              width={0}
              height={0}
              sizes="100vw"
              className="rounded-xl w-full max-w-[10rem] object-cover aspect-square"
            />
            <span className="font-bold text-xl">Your cart is empty</span>
          </div>
        )}
      </div>
      {data.length > 0 && props.isCart && (
        <Card className="space-y-4 bg-card-2/50 p-6 pb-10 w-full h-fit">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Items:</span>
            <span>
              {data
                .reduce((acc, item) => acc + (item.quantity ?? 1), 0)
                .toFixed(0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Total (tax excl.):</span>
            <span>
              $
              {data
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
              {data
                .reduce((acc, item) => {
                  const itemCost = item.price * (item.quantity ?? 1);
                  return acc + itemCost;
                }, 0)
                .toFixed(2)}
            </span>
          </div>
          <Button
            className="bg-primary mt-4 w-full h-10"
            disabled={data.length === 0}
            onClick={placeOrder}
            isLoading={isLoading}
          >
            Place order
          </Button>
        </Card>
      )}
    </div>
  );
}

export default SideBar;
