import { serviceCategories } from "@/data/services";

export type BookingServiceLike = {
  id: number | string;
};

export function getSelectedCategoryIds(
  selectedServices: BookingServiceLike[] = [],
  fallbackCategoryId?: string | null
): string[] {
  if (selectedServices.length === 0) {
    return fallbackCategoryId ? [fallbackCategoryId] : [];
  }

  const selectedIds = new Set(
    selectedServices.map((service) => String(service.id))
  );

  return serviceCategories
    .filter((category) =>
      category.services.some((service) =>
        selectedIds.has(String(service.id))
      )
    )
    .map((category) => category.id);
}

export function getSelectedCategories(
  selectedServices: BookingServiceLike[] = [],
  fallbackCategoryId?: string | null
) {
  const categoryIds = getSelectedCategoryIds(
    selectedServices,
    fallbackCategoryId
  );

  return categoryIds
    .map((id) =>
      serviceCategories.find(
        (category) => category.id === id
      )
    )
    .filter(
      (
        category
      ): category is (typeof serviceCategories)[number] =>
        Boolean(category)
    );
}

export function getSelectedCategoryTitle(
  selectedServices: BookingServiceLike[] = [],
  fallbackCategoryId?: string | null
): string {
  const categories = getSelectedCategories(
    selectedServices,
    fallbackCategoryId
  );

  if (categories.length === 0) {
    return "Not selected";
  }

  return categories
    .map((category) => category.title)
    .join(", ");
}
