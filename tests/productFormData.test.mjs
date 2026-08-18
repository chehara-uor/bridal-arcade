import assert from "node:assert/strict";
import test from "node:test";
import { createProductFormData, productDescriptionHtml } from "../src/api/productFormData.ts";

const fields = (sku) => ({
  name: "Test bridal product",
  description: "<p>Test description</p>",
  shortDescription: "Test description",
  sku,
  regularPrice: "1000",
  salePrice: "",
  parent: "1",
  child: "2",
  ownerLocation: "Colombo",
  ownerMobile: "0712345678",
  chestSize: "36",
  wearCount: "1",
  availabilityType: "rent",
});

test("rent-or-sell keeps sale_price empty and puts the purchase price in description", () => {
  const description = productDescriptionHtml("Beautiful bridal outfit", "both", "50000");
  const form = createProductFormData(
    { ...fields("BOTH"), description, regularPrice: "10000" },
    [image("main.jpg", "main")],
  );

  assert.equal(form.get("regular_price"), "10000");
  assert.equal(form.get("sale_price"), "");
  assert.match(form.get("description"), /also available to purchase for LKR 50,000\./);
});

const image = (name, contents) =>
  new File([contents], name, { type: "image/jpeg", lastModified: 123 });

test("product B cannot reuse product A's main image", () => {
  const productA = createProductFormData(fields("A"), [image("a-main.jpg", "A")]);
  const productB = createProductFormData(fields("B"), [image("b-main.jpg", "B")]);

  assert.equal(productA.getAll("main_image").length, 1);
  assert.equal(productB.getAll("main_image").length, 1);
  assert.equal(productB.get("main_image").name, "b-main.jpg");
  assert.notEqual(productB.get("main_image"), productA.get("main_image"));
});

test("preview image order matches multipart main/gallery order", () => {
  const previewOrder = [
    image("main.jpg", "main"),
    image("gallery-one.jpg", "one"),
    image("gallery-two.jpg", "two"),
  ];
  const form = createProductFormData(fields("ORDER"), previewOrder);

  assert.deepEqual(
    [form.get("main_image"), ...form.getAll("gallery_images[]")].map((file) => file.name),
    previewOrder.map((file) => file.name),
  );
  assert.equal(form.getAll("main_image").length, 1);
  assert.equal(form.getAll("gallery_images[]").length, 2);
  assert.equal(form.getAll("gallery_images").length, 0);
});
