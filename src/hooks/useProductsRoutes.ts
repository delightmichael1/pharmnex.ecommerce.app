import { useAxios } from "./useAxios";
import useAppStore from "@/stores/AppStore";
import { toast } from "@/components/toast/toast";

function useProductsRoutes() {
  const { secureAxios } = useAxios();

  const getProducts = async (
    sort: "Newest" | "Oldest",
    page: number,
    categories: string[],
    suppliers: string[],
    setIsLoading?: (isLoading: boolean) => void,
    setPages?: (pages: number) => void
  ) => {
    setIsLoading && setIsLoading(true);
    let fxsort = -1;
    if (sort === "Newest") fxsort = -1;
    else if (sort === "Oldest") fxsort = 1;

    await secureAxios
      .get(
        encodeURI(
          `/shop/products?page=${page}${
            categories.length > 0
              ? "&category=" + JSON.stringify(categories)
              : ""
          }${
            suppliers.length > 0 ? "&supplier=" + JSON.stringify(suppliers) : ""
          }&limit=20&sort=${fxsort}`
        )
      )
      .then((res) => {
        console.log("################", res);
        useAppStore.setState((state) => {
          state.products = res.data.products ? res.data.products : [];
          setPages && setPages(res.data.pages);
        });
      })
      .catch((err) => {
        toast({
          description: err.response?.data?.message || err.message,
          variant: "error",
        });
      })
      .finally(() => setIsLoading && setIsLoading(false));
  };

  const getOrderSupplierNCustomer = async (id: string, userId: string) => {
    console.log("############### getting supplier");
    await secureAxios
      .get("/shop/suppliers?supplier=" + id)
      .then((res) => {
        if (res.data.suppliers) {
          useAppStore.setState({
            orderSupplier:
              res.data.suppliers.length > 0 ? res.data.suppliers[0] : undefined,
          });
        }
        getCustomer(userId);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err?.response?.data?.message ?? err.message,
          variant: "error",
        });
      });
  };

  const getCustomer = async (id: string) => {
    await secureAxios
      .get("/user?customer-id=" + id)
      .then((res) => {
        if (res.data) {
          useAppStore.setState({
            orderCustomer: res.data,
          });
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err?.response?.data?.message ?? err.message,
          variant: "error",
        });
      });
  };

  return { getProducts, getOrderSupplierNCustomer };
}

export default useProductsRoutes;
