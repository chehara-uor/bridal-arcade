/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  Mail,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Smile,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Logo from "../assets/logo.png";
import AiImage from "../assets/ai.webp";
import GoodImage from "../assets/good.webp";
import RawImage from "../assets/raw.webp";
import { PARENT_CATEGORIES, childCategoriesFor } from "../constants/category";
import { getRequestErrorMessage } from "../api/portal";
import {
  submitVendorProduct,
  productPlanLimitMessage,
  productPlanNeedsUpgrade,
  type VendorProductResult,
} from "../api/vendorProduct";
import AppShell from "../components/AppShell";
import { useNavigate } from "react-router-dom";
import { getStoredPricingPlan, pricingPlanLabel } from "../auth/pricingPlan";

type Step = 1 | 2 | 3;
type Errors = Record<string, string | undefined>;
type Action = "" | "Rent Only" | "Sell Only" | "Rent or Sell";
interface CropImage {
  id: number;
  label: string;
  file: File | null;
  url: string;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
  x: number;
  y: number;
}

const SRI_LANKAN_CITIES = [
  "Akkaraipattu",
  "Ambalangoda",
  "Ampara",
  "Anuradhapura",
  "Avissawella",
  "Badulla",
  "Balangoda",
  "Bandarawela",
  "Batticaloa",
  "Beruwala",
  "Chavakachcheri",
  "Chilaw",
  "Colombo",
  "Dambulla",
  "Dehiwala-Mount Lavinia",
  "Embilipitiya",
  "Galle",
  "Gampaha",
  "Gampola",
  "Hambantota",
  "Hatton",
  "Hikkaduwa",
  "Homagama",
  "Horana",
  "Ja-Ela",
  "Jaffna",
  "Kadawatha",
  "Kalmunai",
  "Kalutara",
  "Kandy",
  "Kattankudy",
  "Kegalle",
  "Kelaniya",
  "Kilinochchi",
  "Kiribathgoda",
  "Kolonnawa",
  "Kotte",
  "Kuliyapitiya",
  "Kurunegala",
  "Maharagama",
  "Mannar",
  "Matale",
  "Matara",
  "Minuwangoda",
  "Monaragala",
  "Moratuwa",
  "Mullaitivu",
  "Nawalapitiya",
  "Negombo",
  "Nuwara Eliya",
  "Panadura",
  "Piliyandala",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Sri Jayawardenepura Kotte",
  "Tangalle",
  "Trincomalee",
  "Vavuniya",
  "Wattala",
  "Weligama",
];
const initialProduct = {
  title: "",
  description: "",
  parent: "",
  child: "",
  location: "",
  chestSize: "",
  whatsapp: "",
  wearCount: "",
  action: "" as Action,
  rentalPrice: "",
  sellingPrice: "",
};
const initialImages: CropImage[] = [
  "Main / front view",
  "Full outfit view",
  "Detail view",
].map((label, index) => ({
  id: index + 1,
  label,
  file: null,
  url: "",
  naturalWidth: 0,
  naturalHeight: 0,
  zoom: 1,
  x: 0,
  y: 0,
}));

export default function AddProduct() {
  const [step, setStep] = useState<Step>(1);
  const [product, setProduct] = useState(initialProduct);
  const [images, setImages] = useState<CropImage[]>(initialImages);
  const [submittedImages, setSubmittedImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VendorProductResult | null>(null);
  const navigate = useNavigate();
  const ownerName = sessionStorage.getItem("userName") || "Bridal Owner";
  const pricingPlan = getStoredPricingPlan();
  const children = childCategoriesFor(Number(product.parent));

  const updateProduct = (
    field: keyof typeof product,
    value: string | string[],
  ) => {
    setProduct((current) => ({
      ...current,
      [field]: value,
      ...(field === "parent" ? { child: "" } : {}),
    }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  };

  const validateProduct = () => {
    const next: Errors = {};
    if (product.title.trim().length < 5)
      next.title = "Use at least 5 characters.";
    if (product.description.trim().length < 20)
      next.description = "Add at least 20 characters.";
    if (!product.parent) next.parent = "Select the bridal wear type.";
    if (!product.child) next.child = "Select a category.";
    if (!product.location) next.location = "Select your location.";
    if (!product.chestSize || Number(product.chestSize) <= 0)
      next.chestSize = "Enter the chest size.";
    if (!/^(?:\+94|0)7\d{8}$/.test(product.whatsapp.replace(/\s/g, "")))
      next.whatsapp = "Enter a valid WhatsApp number.";
    if (!product.wearCount) next.wearCount = "Select the wear count.";
    if (!product.action) next.action = "Select an action.";
    if (
      (product.action === "Rent Only" || product.action === "Rent or Sell") &&
      Number(product.rentalPrice) <= 0
    )
      next.rentalPrice = "Enter the rental price.";
    if (
      (product.action === "Sell Only" || product.action === "Rent or Sell") &&
      Number(product.sellingPrice) <= 0
    )
      next.sellingPrice = "Enter the selling price.";
    setErrors(next);
    if (!Object.keys(next).length) setStep(2);
  };

  const submit = async () => {
    if (images.some((image) => !image.file))
      return setErrors({
        images: "Upload all three images before submitting.",
      });
    setBusy(true);
    setErrors({});
    try {
      const preparedImages = await Promise.all(images.map(createCroppedFile));
      const form = new FormData();
      form.set("name", product.title.trim());
      form.set(
        "description",
        `<p>${escapeHtml(product.description.trim()).replace(/\n/g, "<br>")}</p>`,
      );
      form.set("short_description", product.description.trim().slice(0, 180));
      form.set("sku", `BAP-${Date.now().toString(36).toUpperCase()}`);
      form.set("regular_price", product.rentalPrice || product.sellingPrice);
      if (product.action === "Rent or Sell" && product.sellingPrice)
        form.set("sale_price", product.sellingPrice);
      form.set("parent", product.parent);
      form.set("child", product.child);
      form.set("catalog_visibility", "visible");
      form.set("manage_stock", "true");
      form.set("stock_quantity", "1");
      form.set("stock_status", "instock");
      form.set("virtual", "false");
      form.set("owner_location", product.location);
      form.set("owner_mobile", product.whatsapp);
      form.set("owner_commission", "20");
      form.set("chest_size", product.chestSize);
      form.set("wear_count", product.wearCount);
      form.set("availability_type", availabilityType(product.action));
      form.set("main_image", preparedImages[0]);
      form.append("gallery_images[]", preparedImages[1]);
      form.append("gallery_images[]", preparedImages[2]);
      const created = await submitVendorProduct(form);
      setSubmittedImages(preparedImages);
      setResult(created);
      setStep(3);
      sessionStorage.removeItem("bridalArcadeWidgetDraft");
    } catch (error) {
      setErrors({
        form: getRequestErrorMessage(
          error,
          "We couldn't submit your item. Please try again.",
        ),
      });
    } finally {
      setBusy(false);
    }
  };

  return <AppShell><div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">My bridal collection</p><h1 className="page-title mt-1.5">Add a product</h1><p className="mt-2 text-sm text-muted-foreground sm:text-base">Submit your bridal wear for the Bridal Arcade team to review.</p><div className="mt-3 flex flex-wrap items-center gap-3"><span className="rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">{pricingPlanLabel(pricingPlan)}</span>{pricingPlan === "free" && <a href="/bride/plans" className="text-xs font-bold text-primary underline-offset-4 hover:underline">View plans for more listings</a>}</div></div><span className="rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-xs font-bold text-primary">Step {step} of 3</span></header>
    {pricingPlan === "free" && step < 3 && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Free plan:</strong> Your listing can be saved, but publishing depends on your available plan slots. <a href="/bride/plans" className="font-bold underline">View pricing plans</a> to increase your allowance.</div>}
    <div className="mb-7 grid grid-cols-3 gap-2">{["Item details","Photos","Complete"].map((label,index) => <div key={label}><span className={`block h-1.5 rounded-full ${index + 1 <= step ? "bg-primary" : "bg-muted-dark"}`}/><p className={`mt-2 text-center text-[10px] font-bold uppercase tracking-wide sm:text-xs ${index + 1 === step ? "text-primary" : "text-muted-foreground"}`}>{label}</p></div>)}</div>
    <section key={step} className="surface-card animate-fade-up p-5 sm:p-7 lg:p-9">
      {step === 1 && <ProductStep value={product} errors={errors} update={updateProduct} children={children} back={() => navigate("/bride/dashboard")} next={validateProduct}/>}
      {step === 2 && <ImagesStep images={images} setImages={setImages} errors={errors} back={() => setStep(1)} submit={submit} busy={busy}/>}
      {step === 3 && <SuccessStep name={ownerName} product={product} images={submittedImages} result={result}/>}
    </section>
  </div></AppShell>;
}

function WidgetHeader({ step }: { step: Step }) {
  return (
    <header className="shrink-0 bg-[#321a27] px-5 pb-6 pt-5 text-white sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white">
            <img
              src={Logo}
              alt="Bridal Arcade"
              className="h-full w-full object-contain p-1"
            />
          </span>
          <div>
            <p className="display-font text-lg font-bold">
              List your bridal wear
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#d5b466]">
              Bridal Arcade
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-white/60">
          Step {step} of 5
        </span>
      </div>
      <div className="mt-5 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((number) => (
          <span
            key={number}
            className={`h-1.5 rounded-full ${number <= step ? "bg-[#d5b466]" : "bg-white/15"}`}
          />
        ))}
      </div>
    </header>
  );
}

function AccountStep({ value, errors, update, next, busy }: any) {
  return (
    <section>
      <Title
        eyebrow="Step 1 · Register"
        title="Create your account"
        text="Your account keeps your listing and its review status connected to you."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field
          label="Name"
          icon={<UserRound size={17} />}
          value={value.name}
          change={(v) => update("name", v)}
          error={errors.name}
        />
        <Field
          label="Email"
          type="email"
          icon={<Mail size={17} />}
          value={value.email}
          change={(v) => update("email", v)}
          error={errors.email}
        />
        <Field
          label="WhatsApp / phone"
          type="tel"
          icon={<Phone size={17} />}
          value={value.phone}
          change={(v) => update("phone", v)}
          error={errors.phone}
        />
        <Field label="Member type" value="Bridal Owner" readOnly />
        <Field
          label="Password"
          type="password"
          icon={<LockKeyhole size={17} />}
          value={value.password}
          change={(v) => update("password", v)}
          error={errors.password}
        />
        <Field
          label="Confirm password"
          type="password"
          icon={<LockKeyhole size={17} />}
          value={value.confirmPassword}
          change={(v) => update("confirmPassword", v)}
          error={errors.confirmPassword}
        />
      </div>
      <FormError message={errors.form} />
      <button
        onClick={next}
        disabled={busy}
        className="primary-button mt-7 w-full"
      >
        {busy ? "Sending code…" : "Continue to verification"}
        <ArrowRight size={17} />
      </button>
      <div className="mt-5 rounded-2xl border border-border-light bg-white p-4 text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Already a member?
        </p>
        <a href="/" target="_top" className="secondary-button mt-3 w-full">
          Log in to our portal <ArrowRight size={17} />
        </a>
      </div>
    </section>
  );
}

function OtpStep({
  phone,
  otp,
  setOtp,
  errors,
  back,
  next,
  resend,
  busy,
}: any) {
  return (
    <section className="mx-auto max-w-md py-5 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent text-primary">
        <ShieldCheck size={28} />
      </span>
      <Title
        eyebrow="Step 2 · Confirm OTP"
        title="Verify your mobile"
        text={`Enter the six-digit SMS code sent to ${phone}. The code expires in five minutes.`}
      />
      <input
        value={otp}
        onChange={(event) => setOtp(event.target.value)}
        inputMode="numeric"
        autoComplete="one-time-code"
        className="mt-6 h-14 w-full rounded-xl border bg-white text-center text-2xl font-bold tracking-[.4em] outline-none focus:border-primary"
        placeholder="000000"
      />
      <FormError message={errors.otp || errors.form} />
      <button
        onClick={next}
        disabled={busy}
        className="primary-button mt-5 w-full"
      >
        {busy ? "Verifying…" : "Verify & create account"}
        <Check size={17} />
      </button>
      <div className="mt-4 flex justify-center gap-5 text-sm font-semibold">
        <button onClick={back} className="text-muted-foreground">
          Change details
        </button>
        <button onClick={resend} disabled={busy} className="text-primary">
          Resend code
        </button>
      </div>
    </section>
  );
}

function ProductStep({ value, errors, update, children, back, next }: any) {
  const needsRent =
    value.action === "Rent Only" || value.action === "Rent or Sell";
  const needsSell =
    value.action === "Sell Only" || value.action === "Rent or Sell";
  return (
    <section>
      <Title
        eyebrow="Step 1 · Item details"
        title="Tell us about your bridal wear"
        text="Choose the bridal wear type first, then select only from its matching categories."
      />
      <div className="mt-6 space-y-4">
        <Field
          label="Product title"
          icon={<Sparkles size={17} />}
          value={value.title}
          change={(v) => update("title", v)}
          error={errors.title}
        />
        <label className="block">
          <span className="field-label">Description</span>
          <textarea
            rows={4}
            value={value.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full rounded-xl border border-input-border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <FormError message={errors.description} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Bridal wear type"
            value={value.parent}
            change={(v) => update("parent", v)}
            error={errors.parent}
            options={PARENT_CATEGORIES.map((category) => ({
              value: String(category.id),
              label: category.name,
            }))}
          />
          <Select
            label="Category"
            value={value.child}
            change={(v) => update("child", v)}
            error={errors.child}
            disabled={!value.parent}
            options={children.map((category: any) => ({
              value: String(category.id),
              label: category.name,
            }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Chest size (inches)"
            value={value.chestSize}
            change={(v) => update("chestSize", v.replace(/\D/g, ""))}
            error={errors.chestSize}
          />
          <Field
            label="WhatsApp number"
            type="tel"
            icon={<Phone size={17} />}
            value={value.whatsapp}
            change={(v) => update("whatsapp", v)}
            error={errors.whatsapp}
          />
          <Select
            label="Wear count"
            value={value.wearCount}
            change={(v) => update("wearCount", v)}
            error={errors.wearCount}
            options={[
              { value: "1", label: "Only once" },
              { value: "2", label: "2 times" },
              { value: "3", label: "3 times" },
            ]}
          />
          <Select
            label="Location"
            value={value.location}
            change={(v) => update("location", v)}
            error={errors.location}
            options={SRI_LANKAN_CITIES.map((city) => ({
              value: city,
              label: city,
            }))}
          />
        </div>
        <fieldset>
          <legend className="field-label">Desired action</legend>
          <div className="grid grid-cols-3 gap-2">
            {["Rent Only", "Sell Only", "Rent or Sell"].map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => update("action", action)}
                className={`min-h-12 rounded-xl border px-2 text-xs font-bold ${value.action === action ? "border-primary bg-primary text-white" : "bg-white"}`}
              >
                {action}
              </button>
            ))}
          </div>
          <FormError message={errors.action} />
        </fieldset>
        {(needsRent || needsSell) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {needsRent && (
              <Price
                label="Expected rental price"
                value={value.rentalPrice}
                change={(v) => update("rentalPrice", v)}
                error={errors.rentalPrice}
              />
            )}{" "}
            {needsSell && (
              <Price
                label="Expected selling price"
                value={value.sellingPrice}
                change={(v) => update("sellingPrice", v)}
                error={errors.sellingPrice}
              />
            )}
          </div>
        )}
      </div>
      <Buttons back={back} next={next} label="Continue to photos" />
    </section>
  );
}

function ImagesStep({ images, setImages, errors, back, submit, busy }: any) {
  return (
    <section>
      <Title
        eyebrow="Step 2 · Photos"
        title="Upload three clear images"
        text="Listings with unclear, dark, unrelated, or badly framed photos may be rejected during review."
      />
      <PhotoGuide />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {images.map((image: CropImage) => (
          <CropBox
            key={image.id}
            image={image}
            update={(patch) =>
              setImages((current: CropImage[]) =>
                current.map((item) =>
                  item.id === image.id ? { ...item, ...patch } : item,
                ),
              )
            }
          />
        ))}
      </div>
      <FormError message={errors.images || errors.form} />
      <Buttons
        back={back}
        next={submit}
        label={busy ? "Preparing & submitting…" : "Submit for review"}
        disabled={busy}
      />
    </section>
  );
}

function PhotoGuide() {
  const cards = [
    {
      ok: false,
      image: RawImage,
      title: "No raw-material photos",
      text: "We cannot accept fabric or raw-material photos without the outfit being properly worn.",
    },
    {
      ok: false,
      image: AiImage,
      title: "No blurry or AI images",
      text: "We cannot accept blurry, altered, or AI-generated product images.",
    },
    {
      ok: true,
      image: GoodImage,
      title: "Wedding photography accepted",
      text: "We accept clear wedding photography showing the outfit properly worn.",
    },
  ];
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`relative overflow-hidden rounded-2xl border p-4 ${card.ok ? "border-success/25 bg-success/5" : "border-destructive/20 bg-destructive/5"}`}
        >
          <img src={card.image} alt={card.title} className="h-28 w-auto rounded-xl object-cover sm:h-32" />
          <span
            className={`absolute right-6 top-6 grid h-7 w-7 place-items-center rounded-full text-white ${card.ok ? "bg-success" : "bg-destructive"}`}
          >
            {card.ok ? <Check size={16} /> : <X size={16} />}
          </span>
          <p className="mt-3 text-sm font-bold">{card.title}</p>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
            {card.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function CropBox({
  image,
  update,
}: {
  image: CropImage;
  update: (patch: Partial<CropImage>) => void;
}) {
  const drag = useRef<{
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const choose = (file?: File) => {
    if (
      !file ||
      !/^image\/(jpeg|png|webp)$/.test(file.type) ||
      file.size > 10 * 1024 * 1024
    )
      return;
    if (image.url) URL.revokeObjectURL(image.url);
    const url = URL.createObjectURL(file);
    const preview = new Image();
    preview.onload = () =>
      update({
        file,
        url,
        naturalWidth: preview.naturalWidth,
        naturalHeight: preview.naturalHeight,
        zoom: 1,
        x: 0,
        y: 0,
      });
    preview.src = url;
  };
  return (
    <div>
      <p className="mb-2 text-center text-xs font-bold">{image.label}</p>
      <div
        onPointerDown={(event) => {
          if (!image.url) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            startX: image.x,
            startY: image.y,
          };
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          const rect = event.currentTarget.getBoundingClientRect();
          update({
            x: Math.max(
              -50,
              Math.min(
                50,
                drag.current.startX +
                  ((event.clientX - drag.current.x) / rect.width) * 100,
              ),
            ),
            y: Math.max(
              -50,
              Math.min(
                50,
                drag.current.startY +
                  ((event.clientY - drag.current.y) / rect.height) * 100,
              ),
            ),
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        className={`relative aspect-[3/4] touch-none overflow-hidden rounded-xl border-2 ${image.url ? "cursor-grab border-primary/30 bg-[#eee9e3]" : "border-dashed border-primary/25 bg-muted/40"}`}
      >
        {image.url ? (
          <>
            <img
              src={image.url}
              alt={`${image.label} crop`}
              draggable={false}
              className="pointer-events-none absolute h-full w-full max-w-none select-none object-contain"
              style={{
                left: `calc(${50 + image.x}%)`,
                top: `calc(${50 + image.y}%)`,
                transform: `translate(-50%, -50%) scale(${image.zoom})`,
              }}
            />
            <span className="pointer-events-none absolute inset-x-2 bottom-2 rounded-lg bg-black/55 px-2 py-1 text-center text-[9px] font-semibold text-white">
              Drag to position
            </span>
          </>
        ) : (
          <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center text-center">
            <ImagePlus className="text-primary" />
            <span className="mt-2 text-xs font-bold">Choose photo</span>
            <span className="mt-1 text-[10px] text-muted-foreground">
              Max 10 MB
            </span>
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => choose(event.target.files?.[0])}
            />
          </label>
        )}
      </div>
      {image.file && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <Minus size={12} />
            <input
              aria-label={`Zoom ${image.label}`}
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={image.zoom}
              onChange={(event) => update({ zoom: Number(event.target.value) })}
              className="min-w-0 flex-1 accent-primary"
            />
            <Plus size={12} />
          </div>
          <button
            type="button"
            onClick={() => {
              if (image.url) URL.revokeObjectURL(image.url);
              update({
                file: null,
                url: "",
                naturalWidth: 0,
                naturalHeight: 0,
                zoom: 1,
                x: 0,
                y: 0,
              });
            }}
            className="mt-1 flex w-full items-center justify-center gap-1 text-xs font-bold text-destructive"
          >
            <Trash2 size={13} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function SuccessStep({ name, product, images, result }: any) {
  const planLimitMessage = productPlanLimitMessage(result);
  const showUpgrade = productPlanNeedsUpgrade(result);
  return (
    <section className="mx-auto max-w-xl py-7 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/10 text-success">
        <Smile size={42} />
      </span>
        <p className="eyebrow mt-6">Step 3 · Complete</p>
      <h1 className="display-font mt-2 text-3xl font-bold">
        Thank you, {name}!
      </h1>
      <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${planLimitMessage ? "rounded-xl bg-amber-50 p-4 font-semibold text-amber-900" : "text-muted-foreground"}`}>
        {planLimitMessage || "Your item was submitted successfully. Our admin team will review the details and photos before accepting and publishing it."}
      </p>
      <div className="mt-7 rounded-2xl border border-border-light bg-white p-5 text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Submission summary
        </p>
        <h2 className="mt-2 text-lg font-bold">{product.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Submission {result?.id ? `#${result.id}` : "received"} ·{" "}
          {product.location}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {images.map((file: File, index: number) => (
            <img
              key={index}
              src={URL.createObjectURL(file)}
              alt="Submitted item"
                  className="aspect-[3/4] rounded-xl object-cover"
            />
          ))}
        </div>
      </div>
      <a href="/bride/products" className="primary-button mt-7 w-full">View my products <ArrowRight size={17} /></a>
      {showUpgrade && <a href="/bride/plans" className="secondary-button mt-3 w-full">View pricing plans</a>}
    </section>
  );
}

function Title({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display-font mt-1.5 text-2xl font-bold sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
function Field({ label, value, change, error, icon, type = "text", readOnly = false }: any) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <label>
      <span className="field-label">{label}</span>
      <span className="relative block">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          type={isPassword && passwordVisible ? "text" : type}
          value={value}
          onChange={(event) => change?.(event.target.value)}
          readOnly={readOnly}
          aria-readonly={readOnly}
          className={`field-input ${icon ? "pl-11" : ""} ${isPassword ? "pr-12" : ""} ${readOnly ? "cursor-not-allowed bg-muted/60 font-semibold text-primary" : ""} ${error ? "border-destructive" : ""}`}
        />
        {isPassword && <button type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-primary">{passwordVisible ? <EyeOff size={18}/> : <Eye size={18}/>}</button>}
      </span>
      <FormError message={error} />
    </label>
  );
}
function Select({
  label,
  value,
  change,
  options,
  error,
  disabled = false,
}: any) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <select
        disabled={disabled}
        value={value}
        onChange={(event) => change(event.target.value)}
        className={`field-input ${error ? "border-destructive" : ""}`}
      >
        <option value="">Select an option</option>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FormError message={error} />
    </label>
  );
}
function Price({ label, value, change, error }: any) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <span className="relative block">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
          LKR
        </span>
        <input
          value={value}
          onChange={(event) => change(event.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          className="field-input pl-14"
        />
      </span>
      <FormError message={error} />
    </label>
  );
}
function FormError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="mt-1.5 text-xs font-semibold text-destructive">
      {message}
    </p>
  ) : null;
}
function Buttons({
  back,
  next,
  label,
  disabled = false,
}: {
  back: () => void;
  next: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-7 grid grid-cols-[auto_1fr] gap-3">
      <button onClick={back} className="secondary-button px-4">
        <ArrowLeft size={17} />
        Back
      </button>
      <button
        onClick={next}
        disabled={disabled}
        className="primary-button w-full"
      >
        {label}
        <ArrowRight size={17} />
      </button>
    </div>
  );
}
function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] || character,
  );
}

function availabilityType(action: Action): "rent" | "sale" | "both" {
  if (action === "Rent Only") return "rent";
  if (action === "Sell Only") return "sale";
  return "both";
}

async function createCroppedFile(image: CropImage): Promise<File> {
  if (!image.file || !image.naturalWidth || !image.naturalHeight)
    throw new Error("Missing image");
  const width = 600,
    height = 800;
  const bitmap = await createImageBitmap(image.file);
  const base = Math.min(
    width / image.naturalWidth,
    height / image.naturalHeight,
  );
  const scale = base * image.zoom;
  const renderedWidth = image.naturalWidth * scale,
    renderedHeight = image.naturalHeight * scale;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.fillStyle = "#f1ede8";
  context.fillRect(0, 0, width, height);
  const centerX = width / 2 + (image.x / 100) * width,
    centerY = height / 2 + (image.y / 100) * height;
  context.drawImage(
    bitmap,
    centerX - renderedWidth / 2,
    centerY - renderedHeight / 2,
    renderedWidth,
    renderedHeight,
  );
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error("Crop failed"))),
      "image/jpeg",
      0.86,
    ),
  );
  return new File(
    [blob],
    `${image.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`,
    { type: "image/jpeg" },
  );
}
