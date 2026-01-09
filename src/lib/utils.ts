export const normalizeString = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

export const formatDate = (date: Date | string | null): string => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
};
