import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ImagePlus, Mail, MapPin, Minus, Phone, Plus, RotateCcw, Scissors, ShieldCheck, Sparkles, Trash2, UserRound } from "lucide-react";
import Logo from "../assets/logo.png";

type Step = 1 | 2 | 3 | 4;
type PersonalField = "firstName" | "lastName" | "email" | "mobile" | "weddingYear" | "livingArea";
type ProductField = "title" | "description";
type ItemField = "wearType" | "wearCount" | "action" | "rentalPrice" | "sellingPrice";
type Errors<T extends string> = Partial<Record<T, string>>;

interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  weddingYear: string;
  livingArea: string;
}

interface ProductDetails {
  title: string;
  description: string;
}

interface ItemDetails {
  wearType: string;
  wearCount: string;
  action: "" | "Rent Only" | "Sell Only" | "Rent or Sell";
  rentalPrice: string;
  sellingPrice: string;
}

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

interface StoredWidgetDraft {
  step: 1 | 2 | 3;
  personal: PersonalDetails;
  product: ProductDetails;
  item: ItemDetails;
  finalImages?: string[];
  updatedAt: string;
}

const initialImages: CropImage[] = [
  { id: 1, label: "Front view", file: null, url: "", naturalWidth: 0, naturalHeight: 0, zoom: 1, x: 0, y: 0 },
  { id: 2, label: "Full view", file: null, url: "", naturalWidth: 0, naturalHeight: 0, zoom: 1, x: 0, y: 0 },
  { id: 3, label: "Detail view", file: null, url: "", naturalWidth: 0, naturalHeight: 0, zoom: 1, x: 0, y: 0 },
];

export default function VendorWidget() {
  const savedDraft = useRef(readWidgetDraft()).current;
  const [step, setStep] = useState<Step>(savedDraft?.step === 3 && savedDraft.finalImages?.length === 3 ? 3 : 1);
  const [personal, setPersonal] = useState<PersonalDetails>(savedDraft?.personal || { firstName: "", lastName: "", email: "", mobile: "", weddingYear: "", livingArea: "" });
  const [product, setProduct] = useState<ProductDetails>(savedDraft?.product || { title: "", description: "" });
  const [item, setItem] = useState<ItemDetails>(savedDraft?.item || { wearType: "", wearCount: "", action: "", rentalPrice: "", sellingPrice: "" });
  const [images, setImages] = useState<CropImage[]>(initialImages);
  const [finalImages, setFinalImages] = useState<string[]>(savedDraft?.finalImages || []);
  const [personalErrors, setPersonalErrors] = useState<Errors<PersonalField>>({});
  const [productErrors, setProductErrors] = useState<Errors<ProductField>>({});
  const [itemErrors, setItemErrors] = useState<Errors<ItemField>>({});
  const [imageError, setImageError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    if (step === 4) return;
    const draft: StoredWidgetDraft = {
      step: step === 3 ? 3 : step,
      personal,
      product,
      item,
      finalImages: step === 3 ? finalImages : undefined,
      updatedAt: new Date().toISOString(),
    };
    try { sessionStorage.setItem("bridalArcadeWidgetDraft", JSON.stringify(draft)); } catch { /* Storage may be unavailable or full. */ }
  }, [step, personal, product, item, finalImages]);

  const updatePersonal = (field: PersonalField, value: string) => {
    const clean = field === "mobile" ? value.replace(/[^\d+]/g, "").slice(0, 12) : field === "weddingYear" ? value.replace(/\D/g, "").slice(0, 4) : value;
    setPersonal((current) => ({ ...current, [field]: clean }));
    setPersonalErrors((current) => ({ ...current, [field]: undefined }));
  };

  const updateProduct = (field: ProductField, value: string) => {
    const limit = field === "title" ? 120 : 1200;
    setProduct((current) => ({ ...current, [field]: value.slice(0, limit) }));
    setProductErrors((current) => ({ ...current, [field]: undefined }));
  };

  const updateItem = (field: ItemField, value: string) => {
    const clean = field === "rentalPrice" || field === "sellingPrice" ? value.replace(/\D/g, "").slice(0, 9) : value;
    setItem((current) => ({ ...current, [field]: clean }));
    setItemErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validatePersonal = () => {
    const errors: Errors<PersonalField> = {};
    if (personal.firstName.trim().length < 2) errors.firstName = "Enter your first name.";
    if (personal.lastName.trim().length < 2) errors.lastName = "Enter your last name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email.trim())) errors.email = "Enter a valid email address.";
    const mobile = personal.mobile.replace(/\s/g, "");
    if (!/^(?:\+94|0)7\d{8}$/.test(mobile)) errors.mobile = "Enter a valid Sri Lankan mobile number.";
    const weddingYear = Number(personal.weddingYear);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(weddingYear) || weddingYear < 1950 || weddingYear > currentYear + 5) errors.weddingYear = `Enter a year between 1950 and ${currentYear + 5}.`;
    if (personal.livingArea.trim().length < 2) errors.livingArea = "Enter your town or living area.";
    const listingErrors: Errors<ProductField> = {};
    if (product.title.trim().length < 5) listingErrors.title = "Use at least 5 characters for the product title.";
    if (product.description.trim().length < 20) listingErrors.description = "Describe the item using at least 20 characters.";
    setPersonalErrors(errors);
    setProductErrors(listingErrors);
    if (Object.keys(errors).length || Object.keys(listingErrors).length) return;
    setStep(2);
  };

  const validateItem = async () => {
    const errors: Errors<ItemField> = {};
    if (!item.wearType) errors.wearType = "Select the bridal wear type.";
    if (!item.wearCount) errors.wearCount = "Select how many times it was worn.";
    if (!item.action) errors.action = "Choose what you would like to do.";
    if ((item.action === "Rent Only" || item.action === "Rent or Sell") && Number(item.rentalPrice) <= 0) errors.rentalPrice = "Enter your expected rental price.";
    if ((item.action === "Sell Only" || item.action === "Rent or Sell") && Number(item.sellingPrice) <= 0) errors.sellingPrice = "Enter your expected selling price.";
    setItemErrors(errors);
    if (images.some((image) => !image.file)) setImageError("Please upload and position all 3 images.");
    else setImageError("");
    if (Object.keys(errors).length || images.some((image) => !image.file)) return;

    setPreparing(true);
    try {
      const croppedImages = await Promise.all(images.map(createCroppedImage));
      const draft: StoredWidgetDraft = { step: 3, personal, product, item, finalImages: croppedImages, updatedAt: new Date().toISOString() };
      try {
        sessionStorage.setItem("bridalArcadeWidgetDraft", JSON.stringify(draft));
      } catch {
        setImageError("Your browser could not temporarily save the photos. Free some browser storage or use smaller images, then try again.");
        return;
      }
      setFinalImages(croppedImages);
      setStep(3);
    } catch {
      setImageError("One of the images could not be prepared. Please upload it again.");
    } finally {
      setPreparing(false);
    }
  };

  const verifyOtp = () => {
    if (otp.length !== 6) { setOtpError("Enter the complete 6-digit code."); return; }
    if (otp !== "123456") { setOtpError("That code is incorrect. For this demo, use 123456."); return; }
    setOtpError("");
    try {
      sessionStorage.setItem("bridalArcadeVerifiedSubmission", JSON.stringify({ personal, product, item, images: finalImages, verifiedAt: new Date().toISOString(), status: "verified" }));
      sessionStorage.removeItem("bridalArcadeWidgetDraft");
    } catch { /* Verification can complete even when browser storage is restricted. */ }
    setStep(4);
  };

  return (
    <main className="min-h-screen bg-[#efeae4] p-0 sm:p-4">
      <div className="mx-auto min-h-[900px] w-full max-w-[700px] overflow-hidden bg-[#fbf9f6] shadow-[0_20px_70px_rgba(50,26,39,.12)] sm:rounded-[28px] sm:border sm:border-white">
        <WidgetHeader step={step} />
        <div className="px-5 py-6 sm:px-8 sm:py-7">
          {step === 1 && <PersonalStep value={personal} errors={personalErrors} update={updatePersonal} product={product} productErrors={productErrors} updateProduct={updateProduct} next={validatePersonal} />}
          {step === 2 && <ItemStep value={item} errors={itemErrors} update={updateItem} images={images} setImages={setImages} imageError={imageError} clearImageError={() => setImageError("")} back={() => setStep(1)} next={validateItem} preparing={preparing} />}
          {step === 3 && <OtpStep mobile={personal.mobile} otp={otp} setOtp={(value) => { setOtp(value.replace(/\D/g, "").slice(0, 6)); setOtpError(""); }} error={otpError} back={() => setStep(2)} verify={verifyOtp} />}
          {step === 4 && <SuccessStep name={personal.firstName} images={finalImages} reset={() => window.location.reload()} />}
        </div>
      </div>
    </main>
  );
}

function WidgetHeader({ step }: { step: Step }) {
  const current = Math.min(step, 3);
  return <header className="bg-[#321a27] px-5 pb-6 pt-5 text-white sm:px-8">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white"><img src={Logo} alt="Bridal Arcade" className="h-full w-full object-contain p-1" /></span><div><p className="display-font text-lg font-bold">List your bridal wear</p><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#d5b466]">Bridal Arcade</p></div></div>
      {step < 4 && <span className="text-xs font-semibold text-white/55">Step {current} of 3</span>}
    </div>
    {step < 4 && <div className="mt-5 grid grid-cols-3 gap-2">{[1,2,3].map((number) => <span key={number} className={`h-1.5 rounded-full transition ${number <= current ? "bg-[#d5b466]" : "bg-white/15"}`} />)}</div>}
  </header>;
}

function PersonalStep({ value, errors, update, product, productErrors, updateProduct, next }: { value: PersonalDetails; errors: Errors<PersonalField>; update: (field: PersonalField, value: string) => void; product: ProductDetails; productErrors: Errors<ProductField>; updateProduct: (field: ProductField, value: string) => void; next: () => void }) {
  return <section className="animate-fade-up">
    <StepTitle eyebrow="Your submission" title="Tell us about you and your item" text="Complete both sections before continuing to photos and pricing." />
    <div className="mt-6 rounded-2xl border border-border-light bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-primary"><UserRound size={17}/></span><div><h2 className="text-sm font-bold">Your contact details</h2><p className="text-[11px] text-muted-foreground">How our team can reach you</p></div></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="First name" icon={<UserRound size={17}/>} value={value.firstName} onChange={(v) => update("firstName", v)} placeholder="First name" autoComplete="given-name" error={errors.firstName}/>
        <InputField label="Last name" icon={<UserRound size={17}/>} value={value.lastName} onChange={(v) => update("lastName", v)} placeholder="Last name" autoComplete="family-name" error={errors.lastName}/>
        <InputField label="Email address" icon={<Mail size={17}/>} type="email" value={value.email} onChange={(v) => update("email", v)} placeholder="you@example.com" autoComplete="email" error={errors.email}/>
        <InputField label="Mobile number" icon={<Phone size={17}/>} type="tel" value={value.mobile} onChange={(v) => update("mobile", v)} placeholder="070 799 7883" autoComplete="tel" error={errors.mobile}/>
        <InputField label="Wedding year" icon={<Sparkles size={17}/>} inputMode="numeric" value={value.weddingYear} onChange={(v) => update("weddingYear", v)} placeholder="e.g. 2024" error={errors.weddingYear}/>
        <InputField label="Living area" icon={<MapPin size={17}/>} value={value.livingArea} onChange={(v) => update("livingArea", v)} placeholder="e.g. Maharagama" autoComplete="address-level2" error={errors.livingArea}/>
      </div>
    </div>

    <div className="mt-4 rounded-2xl border border-border-light bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-primary"><Sparkles size={17}/></span><div><h2 className="text-sm font-bold">Product information</h2><p className="text-[11px] text-muted-foreground">How your bridal wear should be presented</p></div></div>
      <div className="space-y-4">
        <InputField label="Product title" icon={<Sparkles size={17}/>} value={product.title} onChange={(v) => updateProduct("title", v)} placeholder="e.g. Ivory Kandyan Bridal Saree" error={productErrors.title}/>
        <label className="block"><span className="field-label">Description</span><textarea value={product.description} onChange={(event) => updateProduct("description", event.target.value)} placeholder="Describe the style, colour, fabric, condition, work and anything a bride should know…" rows={4} aria-invalid={Boolean(productErrors.description)} className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 ${productErrors.description ? "border-destructive" : "border-input-border"}`}/><span className="mt-1 flex items-start justify-between gap-3"><span>{productErrors.description && <ErrorText>{productErrors.description}</ErrorText>}</span><span className="shrink-0 text-[10px] text-muted-foreground">{product.description.length}/1200</span></span></label>
      </div>
    </div>
    <button type="button" onClick={next} className="primary-button mt-7 w-full">Continue to bridal wear <ArrowRight size={17}/></button>
    <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground"><ShieldCheck size={14}/>Your information stays private with Bridal Arcade.</p>
  </section>;
}

function ItemStep({ value, errors, update, images, setImages, imageError, clearImageError, back, next, preparing }: { value: ItemDetails; errors: Errors<ItemField>; update: (field: ItemField, value: string) => void; images: CropImage[]; setImages: React.Dispatch<React.SetStateAction<CropImage[]>>; imageError: string; clearImageError: () => void; back: () => void; next: () => void; preparing: boolean }) {
  const needsRent = value.action === "Rent Only" || value.action === "Rent or Sell";
  const needsSell = value.action === "Sell Only" || value.action === "Rent or Sell";
  const updateImage = (id: number, patch: Partial<CropImage>) => { setImages((current) => current.map((image) => image.id === id ? { ...image, ...patch } : image)); clearImageError(); };
  return <section className="animate-fade-up">
    <StepTitle eyebrow="Your bridal wear" title="Tell us about the item" text="Add the item details, then frame three clear photos." />
    <div className="mt-6 rounded-2xl border border-border-light bg-white p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Bridal wear type" value={value.wearType} onChange={(v) => update("wearType", v)} error={errors.wearType} options={["Kandyan Saree", "Indian Saree", "Lehenga", "Bridal Frock / Gown", "Homecoming Dress", "Other"]}/>
        <SelectField label="Wear count" value={value.wearCount} onChange={(v) => update("wearCount", v)} error={errors.wearCount} options={["Only one", "2 times", "3 times"]}/>
      </div>
      <fieldset className="mt-4"><legend className="field-label">Desired action</legend><div className="grid grid-cols-3 gap-2">{(["Rent Only", "Sell Only", "Rent or Sell"] as const).map((action) => <button type="button" key={action} onClick={() => update("action", action)} className={`min-h-12 rounded-xl border px-2 text-xs font-bold transition sm:text-sm ${value.action === action ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground hover:border-primary/30"}`}>{action}</button>)}</div>{errors.action && <ErrorText>{errors.action}</ErrorText>}</fieldset>
      {(needsRent || needsSell) && <div className={`mt-4 grid gap-4 ${needsRent && needsSell ? "sm:grid-cols-2" : ""}`}>
        {needsRent && <PriceField label="Expected rental price" value={value.rentalPrice} onChange={(v) => update("rentalPrice", v)} error={errors.rentalPrice}/>} 
        {needsSell && <PriceField label="Expected selling price" value={value.sellingPrice} onChange={(v) => update("sellingPrice", v)} error={errors.sellingPrice}/>} 
      </div>}
    </div>

    <div className="mt-6"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary"><Scissors size={19}/></span><div><h3 className="font-bold">Upload and frame your photos</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Upload JPG, PNG, or WebP. Drag the photo to position it and use zoom to crop it inside each frame.</p></div></div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">{images.map((image) => <ImageCropBox key={image.id} image={image} update={(patch) => updateImage(image.id, patch)}/>)}</div>
      {imageError && <ErrorText>{imageError}</ErrorText>}
    </div>
    <div className="mt-7 grid grid-cols-[auto_1fr] gap-3"><button type="button" onClick={back} className="secondary-button px-4"><ArrowLeft size={17}/><span className="hidden sm:inline">Back</span></button><button type="button" disabled={preparing} onClick={next} className="primary-button w-full">{preparing ? "Preparing photos…" : "Continue to verification"}<ArrowRight size={17}/></button></div>
  </section>;
}

function ImageCropBox({ image, update }: { image: CropImage; update: (patch: Partial<CropImage>) => void }) {
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const upload = (file?: File) => {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) { alert("Please choose a JPG, PNG, or WebP image."); return; }
    if (file.size > 10 * 1024 * 1024) { alert("Please choose an image smaller than 10 MB."); return; }
    if (image.url) URL.revokeObjectURL(image.url);
    const url = URL.createObjectURL(file);
    const preview = new Image();
    preview.onload = () => update({ file, url, naturalWidth: preview.naturalWidth, naturalHeight: preview.naturalHeight, zoom: 1, x: 0, y: 0 });
    preview.onerror = () => { URL.revokeObjectURL(url); alert("This image could not be opened. Please choose another one."); };
    preview.src = url;
  };
  const pointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!image.url) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, startX: image.x, startY: image.y };
  };
  const pointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-50, Math.min(50, drag.current.startX + ((event.clientX - drag.current.x) / rect.width) * 100));
    const y = Math.max(-50, Math.min(50, drag.current.startY + ((event.clientY - drag.current.y) / rect.height) * 100));
    update({ x, y });
  };
  const remove = () => { if (image.url) URL.revokeObjectURL(image.url); update({ file: null, url: "", naturalWidth: 0, naturalHeight: 0, zoom: 1, x: 0, y: 0 }); };
  return <div className="min-w-0"><p className="mb-2 text-center text-xs font-bold">{image.label}</p><div onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={() => { drag.current = null; }} className={`relative aspect-[4/5] touch-none overflow-hidden rounded-xl border-2 ${image.url ? "cursor-grab border-primary/20 bg-[#e9e4df] active:cursor-grabbing" : "border-dashed border-border bg-muted/50"}`}>
    {image.url ? <img src={image.url} alt={`${image.label} crop preview`} draggable={false} className="pointer-events-none absolute h-full w-full max-w-none select-none object-contain" style={{ left: `calc(${50 + image.x}%)`, top: `calc(${50 + image.y}%)`, transform: `translate(-50%, -50%) scale(${image.zoom})` }}/>
      : <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center p-3 text-center"><ImagePlus size={24} className="text-primary"/><span className="mt-2 text-xs font-bold">Add photo</span><span className="mt-1 text-[10px] text-muted-foreground">Max 10 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => upload(event.target.files?.[0])}/></label>}
    {image.url && <><div className="pointer-events-none absolute inset-2 rounded-lg border border-white/65 shadow-[inset_0_0_0_999px_rgba(0,0,0,.04)]"/><div className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70"/><div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-lg bg-black/55 px-2 py-1 text-center text-[9px] font-semibold text-white backdrop-blur">Drag to position · Zoom to crop</div></>}
  </div>
  {image.url && <div className="mt-2 space-y-2"><div className="flex items-center gap-1"><Minus size={12} className="shrink-0 text-muted-foreground"/><input aria-label={`Zoom ${image.label}`} type="range" min="1" max={Math.max(3, getFillZoom(image) * 2)} step="0.05" value={image.zoom} onChange={(event) => update({ zoom: Number(event.target.value) })} className="h-1.5 min-w-0 flex-1 accent-primary"/><Plus size={12} className="shrink-0 text-muted-foreground"/></div><div className="grid grid-cols-3 gap-1"><button type="button" onClick={() => update({ zoom: 1, x: 0, y: 0 })} className="flex min-h-8 items-center justify-center gap-1 rounded-lg bg-muted text-[10px] font-bold text-muted-foreground"><RotateCcw size={11}/>Fit</button><button type="button" onClick={() => update({ zoom: getFillZoom(image), x: 0, y: 0 })} className="flex min-h-8 items-center justify-center gap-1 rounded-lg bg-accent text-[10px] font-bold text-primary"><Scissors size={11}/>Fill</button><button type="button" onClick={remove} className="flex min-h-8 items-center justify-center gap-1 rounded-lg bg-destructive/10 text-[10px] font-bold text-destructive"><Trash2 size={11}/>Remove</button></div></div>}
  </div>;
}

function OtpStep({ mobile, otp, setOtp, error, back, verify }: { mobile: string; otp: string; setOtp: (value: string) => void; error: string; back: () => void; verify: () => void }) {
  return <section className="mx-auto max-w-md animate-fade-up py-5 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent text-primary"><Phone size={27}/></span><p className="eyebrow mt-6">Mobile verification</p><h2 className="display-font mt-2 text-3xl font-bold">Enter your OTP</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">We sent a 6-digit verification code to <strong className="text-foreground">{maskMobile(mobile)}</strong>.</p>
    <div className="mt-6 rounded-2xl border border-secondary/25 bg-accent/60 p-4"><p className="text-xs font-semibold text-muted-foreground">Demo verification code</p><p className="mt-1 text-2xl font-bold tracking-[.3em] text-primary">123456</p></div>
    <div className="mt-6 text-left"><span className="field-label">Verification code</span><OtpBoxes value={otp} onChange={setOtp} error={Boolean(error)} verify={verify}/>{error && <ErrorText>{error}</ErrorText>}</div>
    <button type="button" onClick={verify} className="primary-button mt-5 w-full">Verify and submit <Check size={17}/></button><button type="button" onClick={back} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft size={15}/>Edit submission</button>
  </section>;
}

function OtpBoxes({ value, onChange, error, verify }: { value: string; onChange: (value: string) => void; error: boolean; verify: () => void }) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const updateDigit = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length > 1) {
      const next = digits.slice(0, 6);
      onChange(next);
      inputs.current[Math.min(next.length, 5)]?.focus();
      return;
    }
    const current = value.split("");
    current[index] = digits;
    const next = current.join("").slice(0, 6);
    onChange(next);
    if (digits && index < 5) inputs.current[index + 1]?.focus();
  };
  const keyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      event.preventDefault();
      const next = value.slice(0, index - 1) + value.slice(index);
      onChange(next);
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    else if (event.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
    else if (event.key === "Enter") verify();
  };
  return <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={(event) => { const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); if (digits) { event.preventDefault(); onChange(digits); inputs.current[Math.min(digits.length, 5)]?.focus(); } }}>
    {Array.from({ length: 6 }, (_, index) => <input key={index} ref={(element) => { inputs.current[index] = element; }} autoFocus={index === 0} value={value[index] || ""} onChange={(event) => updateDigit(index, event.target.value)} onKeyDown={(event) => keyDown(index, event)} onFocus={(event) => event.currentTarget.select()} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} aria-label={`OTP digit ${index + 1}`} aria-invalid={error} className={`h-12 min-w-0 rounded-xl border bg-white text-center text-xl font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 sm:h-14 ${error ? "border-destructive" : value[index] ? "border-primary/40" : "border-input-border"}`}/>) }
  </div>;
}

function SuccessStep({ name, images, reset }: { name: string; images: string[]; reset: () => void }) {
  return <section className="mx-auto max-w-lg animate-fade-up py-8 text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/10 text-success"><CheckCircle2 size={38}/></span><p className="eyebrow mt-6">Successfully submitted</p><h2 className="display-font mt-2 text-3xl font-bold">Thank you, {name}!</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Your bridal wear details have been received. The Bridal Arcade team will review your photos and contact you shortly.</p>
    <div className="mx-auto mt-7 grid max-w-sm grid-cols-3 gap-3">{images.map((image, index) => <img key={index} src={image} alt={`Submitted crop ${index + 1}`} className="aspect-[4/5] w-full rounded-xl object-cover shadow-sm"/>)}</div>
    <div className="mt-7 rounded-2xl border border-border-light bg-white p-4 text-left"><div className="flex gap-3"><Sparkles size={19} className="mt-0.5 shrink-0 text-secondary"/><div><p className="text-sm font-bold">What happens next?</p><p className="mt-1 text-xs leading-5 text-muted-foreground">We normally review submissions and contact owners within 24 business hours.</p></div></div></div>
    <button type="button" onClick={reset} className="secondary-button mt-6">Submit another item</button>
  </section>;
}

function StepTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <div><p className="eyebrow">{eyebrow}</p><h1 className="display-font mt-1.5 text-2xl font-bold sm:text-3xl">{title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>; }
function ErrorText({ children }: { children: React.ReactNode }) { return <p role="alert" className="mt-1.5 text-xs font-semibold text-destructive">{children}</p>; }
function InputField({ label, icon, value, onChange, placeholder, error, type = "text", inputMode, autoComplete }: { label: string; icon: React.ReactNode; value: string; onChange: (value: string) => void; placeholder: string; error?: string; type?: string; inputMode?: "numeric"; autoComplete?: string }) { return <label><span className="field-label">{label}</span><span className="relative block"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} autoComplete={autoComplete} aria-invalid={Boolean(error)} className={`field-input pl-11 ${error ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}/></span>{error && <ErrorText>{error}</ErrorText>}</label>; }
function SelectField({ label, value, onChange, options, error }: { label: string; value: string; onChange: (value: string) => void; options: string[]; error?: string }) { return <label><span className="field-label">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} className={`field-input appearance-none ${error ? "border-destructive" : ""}`}><option value="">Select an option</option>{options.map((option) => <option key={option}>{option}</option>)}</select>{error && <ErrorText>{error}</ErrorText>}</label>; }
function PriceField({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) { return <label><span className="field-label">{label}</span><span className="relative block"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">LKR</span><input value={value} onChange={(event) => onChange(event.target.value)} inputMode="numeric" placeholder="0" aria-invalid={Boolean(error)} className={`field-input pl-14 ${error ? "border-destructive" : ""}`}/></span>{error && <ErrorText>{error}</ErrorText>}</label>; }
function maskMobile(mobile: string) { const clean = mobile.trim(); return clean.length > 4 ? `${clean.slice(0, 3)} ••• •${clean.slice(-3)}` : clean; }

async function createCroppedImage(image: CropImage): Promise<string> {
  if (!image.file || !image.url || !image.naturalWidth || !image.naturalHeight) throw new Error("Missing image");
  const outputWidth = 600;
  const outputHeight = 750;
  const bitmap = await createImageBitmap(image.file);
  const baseScale = Math.min(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight);
  const scale = baseScale * image.zoom;
  const renderedWidth = image.naturalWidth * scale;
  const renderedHeight = image.naturalHeight * scale;
  const centerX = outputWidth / 2 + (image.x / 100) * outputWidth;
  const centerY = outputHeight / 2 + (image.y / 100) * outputHeight;
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.fillStyle = "#f1ede8";
  context.fillRect(0, 0, outputWidth, outputHeight);
  context.drawImage(bitmap, centerX - renderedWidth / 2, centerY - renderedHeight / 2, renderedWidth, renderedHeight);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.8);
}

function getFillZoom(image: CropImage): number {
  if (!image.naturalWidth || !image.naturalHeight) return 1;
  const frameRatio = 4 / 5;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  return imageRatio > frameRatio ? imageRatio / frameRatio : frameRatio / imageRatio;
}

function readWidgetDraft(): StoredWidgetDraft | null {
  try {
    const stored = sessionStorage.getItem("bridalArcadeWidgetDraft");
    if (!stored) return null;
    const value = JSON.parse(stored) as Partial<StoredWidgetDraft>;
    if (!value.personal || !value.product || !value.item || ![1, 2, 3].includes(Number(value.step))) return null;
    return value as StoredWidgetDraft;
  } catch {
    sessionStorage.removeItem("bridalArcadeWidgetDraft");
    return null;
  }
}
