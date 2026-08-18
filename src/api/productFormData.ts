export interface ProductSubmissionFields {
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  regularPrice: string;
  salePrice: string;
  parent: string;
  child: string;
  ownerLocation: string;
  ownerMobile: string;
  chestSize: string;
  wearCount: string;
  availabilityType: "rent" | "sale" | "both";
}

/** Build a new multipart body for one attempt. Image order is UI order. */
export function createProductFormData(
  fields: ProductSubmissionFields,
  preparedImages: File[],
): FormData {
  if (preparedImages.length < 1 || preparedImages.length > 3)
    throw new Error("A main image and no more than two gallery images are required.");
  if (preparedImages.some((image) => !(image instanceof File)))
    throw new TypeError("Every product image must be a File.");

  const form = new FormData();
  form.set("name", fields.name);
  form.set("description", fields.description);
  form.set("short_description", fields.shortDescription);
  form.set("sku", fields.sku);
  form.set("regular_price", fields.regularPrice);
  // Keep WooCommerce's promotional sale-price field present but unused. The
  // separate purchase amount for rent-or-sell listings lives in description.
  form.set("sale_price", fields.salePrice);
  form.set("parent", fields.parent);
  form.set("child", fields.child);
  form.set("catalog_visibility", "visible");
  form.set("manage_stock", "true");
  form.set("stock_quantity", "1");
  form.set("stock_status", "instock");
  form.set("virtual", "false");
  form.set("owner_location", fields.ownerLocation);
  form.set("owner_mobile", fields.ownerMobile);
  form.set("owner_commission", "20");
  form.set("chest_size", fields.chestSize);
  form.set("wear_count", fields.wearCount);
  form.set("availability_type", fields.availabilityType);

  // append(), once, makes the one-main-image contract explicit. Gallery order
  // remains the same as the preview slots after the main slot.
  form.append("main_image", preparedImages[0], preparedImages[0].name);
  for (const image of preparedImages.slice(1))
    form.append("gallery_images[]", image, image.name);
  return form;
}

export function productDescriptionHtml(
  description: string,
  availabilityType: "rent" | "sale" | "both",
  sellingPrice: string,
) {
  const base = `<p>${escapeHtml(description.trim()).replace(/\n/g, "<br>")}</p>`;
  if (availabilityType !== "both" || !sellingPrice) return base;
  const amount = Number(sellingPrice).toLocaleString("en-LK");
  return `${base}<p>This item is also available to purchase for LKR ${amount}.</p>`;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[
        character
      ] || character,
  );
}

export function productFormDataDebugRows(form: FormData) {
  return Array.from(form.entries(), ([field, value]) =>
    value instanceof File
      ? {
          field,
          filename: value.name,
          type: value.type,
          size: value.size,
          lastModified: value.lastModified,
        }
      : {
          field,
          filename: "",
          type: "text/plain",
          size: new Blob([value]).size,
          lastModified: "",
        },
  );
}
