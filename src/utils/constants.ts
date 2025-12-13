export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const paymentMethods = [
  {
    label: "Credit",
    value: "credit",
  },
  {
    label: "Cash On Delivery",
    value: "cod",
  },
  {
    label: "Proof of Payment",
    value: "pop",
  },
];

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const isExpired = (endDate: string) => {
  return new Date(endDate) < new Date();
};

export const getDaysRemaining = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const cities = [
  { label: "Harare", value: "harare" },
  { label: "Bulawayo", value: "bulawayo" },
  { label: "Chitungwiza", value: "chitungwiza" },
  { label: "Mutare", value: "mutare" },
  { label: "Gweru", value: "gweru" },
  { label: "Kwekwe", value: "kwekwe" },
  { label: "Kadoma", value: "kadoma" },
  { label: "Masvingo", value: "masvingo" },
  { label: "Chinhoyi", value: "chinhoyi" },
  { label: "Marondera", value: "marondera" },
  { label: "Norton", value: "norton" },
  { label: "Ruwa", value: "ruwa" },
  { label: "Bindura", value: "bindura" },
  { label: "Beitbridge", value: "beitbridge" },
  { label: "Victoria Falls", value: "victoria_falls" },
  { label: "Hwange", value: "hwange" },
  { label: "Redcliff", value: "redcliff" },
  { label: "Zvishavane", value: "zvishavane" },
  { label: "Chipinge", value: "chipinge" },
  { label: "Kariba", value: "kariba" },
  { label: "Shurugwi", value: "shurugwi" },
  { label: "Chiredzi", value: "chiredzi" },
  { label: "Rusape", value: "rusape" },
  { label: "Karoi", value: "karoi" },
  { label: "Gokwe", value: "gokwe" },
  { label: "Mvurwi", value: "mvurwi" },
  { label: "Murehwa", value: "murehwa" },
  { label: "Nyanga", value: "nyanga" },
  { label: "Plumtree", value: "plumtree" },
  { label: "Lupane", value: "lupane" },
  { label: "Tsholotsho", value: "tsholotsho" },
  { label: "Chimanimani", value: "chimanimani" },
  { label: "Mazowe", value: "mazowe" },
  { label: "Banket", value: "banket" },
  { label: "Centenary", value: "centenary" },
  { label: "Gwanda", value: "gwanda" },
  { label: "Filabusi", value: "filabusi" },
  { label: "Esigodini", value: "esigodini" },
  { label: "Ngundu", value: "ngundu" },
  { label: "Mhangura", value: "mhangura" },
  { label: "Mutoko", value: "mutoko" },
  { label: "Chegutu", value: "chegutu" },
  { label: "Murambinda", value: "murambinda" },
  { label: "Buhera", value: "buhera" },
  { label: "Chivhu", value: "chivhu" },
  { label: "Nembudziya", value: "nembudziya" },
  { label: "Trelawney", value: "trelawney" },
  { label: "Inyanga", value: "inyanga" },
];

export const getPaymentMethod = (value: string): string => {
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
