import { toast } from "../toast/toast";
import Button from "../buttons/Button";
import React, { use, useEffect } from "react";
import { FaUser } from "react-icons/fa6";
import { useModal } from "../modals/Modal";
import useAppStore from "@/stores/AppStore";
import { useAxios } from "@/hooks/useAxios";
import AddProduct from "../modals/AddProduct";
import CategoryModal from "../modals/Category";
import { RiAddLargeLine } from "react-icons/ri";
import useUserStore from "@/stores/useUserStore";
import { IoNotificationsOutline } from "react-icons/io5";

type Props = {
  title?: string;
  isAdmin?: boolean;
  description?: string;
  isSupplier?: boolean;
};

function DashboardTopNav(props: Props) {
  const { secureAxios } = useAxios();
  const { openModal, closeModal } = useModal();
  const { branchName, email, role, logo } = useUserStore();
  const { notications, isViewedNotifications } = useAppStore();

  useEffect(() => {
    if (isViewedNotifications || !role.includes("supplier")) return;
    getNotifications();
  }, []);

  const getNotifications = async () => {
    await secureAxios
      .get("/shop/notifications?page=1&limit=20")
      .then((res) => {
        if (res.data.notifications) {
          useAppStore.setState({
            notications: res.data.notifications,
            isViewedNotifications: true,
          });
        } else {
          useAppStore.setState({
            notications: [],
            isViewedNotifications: true,
          });
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
    <div className="top-0 z-50 sticky justify-center items-center backdrop-blur-lg p-4 w-full">
      <div className="flex justify-between items-center space-x-4 mx-auto w-full container">
        <div className="flex flex-col">
          <h1 className="text-2xl">{props.title}</h1>
          <span className="text-gray-500">{props.description}</span>
        </div>
        <div className="flex items-center space-x-4">
          {!props.isAdmin && (
            <button
              className="relative p-0.5 tooltip"
              onClick={() => {
                useAppStore.setState((state) => {
                  state.showSideBar = {
                    open: true,
                    value: "notifications",
                  };
                });
              }}
            >
              {notications.length > 0 && (
                <div className="-top-1 -right-1 absolute flex justify-center items-center bg-primary/70 rounded-full w-5 h-5 text-white text-xs">
                  <span>{notications.length}</span>
                </div>
              )}
              <IoNotificationsOutline className="p-2 w-10 h-10 hover:text-accent hover:scale-105 duration-300" />
              <span className="tooltiptext">Notifications</span>
            </button>
          )}
          {props.isSupplier && (
            <Button
              onClick={() => openModal(<AddProduct />)}
              className="bg-primary h-10 text-sm"
            >
              <RiAddLargeLine className="w-4 h-4" />
              <span>Create</span>
            </Button>
          )}
          {props.isAdmin && (
            <Button
              onClick={() =>
                openModal(
                  <CategoryModal
                    type="add"
                    closeModal={closeModal}
                    onDone={() => {}}
                  />
                )
              }
              className="bg-primary h-10 text-sm"
            >
              <RiAddLargeLine className="w-4 h-4" />
              <span>Create</span>
            </Button>
          )}
          <div className="flex items-center space-x-2 p-1 pr-4 border border-gray-400 rounded-full">
            {logo ? (
              <img
                src={logo}
                className="bg-strokedark/40 p-1 rounded-full w-8 h-8 text-primary"
              />
            ) : (
              <FaUser className="bg-strokedark/40 p-1 rounded-full w-8 h-8 text-primary" />
            )}
            <div className="flex flex-col">
              <span className="text-sm">{branchName}</span>
              <span className="text-xxs">{email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardTopNav;
