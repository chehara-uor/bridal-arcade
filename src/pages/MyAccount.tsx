import React, { useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import { sendBankDetails, getBankDetails } from "../api/bank";
// const initialUser = {
//   bank: {
//     bankName: "People's Bank",
//     accountName: "T. Perera",
//     accountNumber: "1234567890",
//     bankLocation: "Colombo - Main Branch",
//   },
// };

type Bank = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankLocation: string;
};

export default function MyAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialBank, setInitialBank] = useState<Bank>({
    bankName: "",
    accountName: "",
    accountNumber: "",
    bankLocation: "",
  });
  const [bank, setBank] = useState<Bank>({
    bankName: "",
    accountName: "",
    accountNumber: "",
    bankLocation: "",
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [user, setUser] = useState<number>(
    Number(sessionStorage.getItem("userID"))
  );

  const getbankDetails = async (userId: number) => {
    try {
      const res = await getBankDetails(userId);
      if (res) {
        const fetchedBank = {
          bankName: res.bank_name,
          accountName: res.bank_account_name,
          accountNumber: res.bank_account_num,
          bankLocation: res.bank_location,
        };
        setBank(fetchedBank);
        setInitialBank(fetchedBank);
        console.log("Bank details fetched successfully");
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
  };

  useEffect(() => {
    setName(sessionStorage.getItem("userName") || "");
    setEmail(sessionStorage.getItem("userEmail") || "");
  }, []);

  useEffect(() => {
    if (user) getbankDetails(user);
    }, [user]);

  const dirty = useMemo(() => {
    return (
      bank.bankName !== initialBank.bankName ||
      bank.accountName !== initialBank.accountName ||
      bank.accountNumber !== initialBank.accountNumber ||
      bank.bankLocation !== initialBank.bankLocation
    );
  }, [bank]);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email.";

    if (!bank.bankName.trim()) e.bankName = "Bank name is required.";
    if (!bank.accountName.trim()) e.accountName = "Account name is required.";
    if (!bank.accountNumber.trim())
      e.accountNumber = "Account number is required.";
    else if (!/^\d{6,20}$/.test(bank.accountNumber.trim()))
      e.accountNumber = "Account number should be 6–20 digits.";
    if (!bank.bankLocation.trim())
      e.bankLocation = "Bank location is required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const transformData = {
        bank_name: bank.bankName,
        bank_account_name: bank.accountName,
        bank_account_num: bank.accountNumber,
        bank_location: bank.bankLocation,
      };
      console.log("Saving bank details:", bank);
      if (!user) throw new Error("User ID is missing");
      // TODO: call your API
      await sendBankDetails(transformData, user);

      setToast("Account details saved");
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      setToast("Something went wrong. Please try again.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  const Card: React.FC<
    React.PropsWithChildren<{ title: string; icon?: React.ReactNode }>
  > = ({ title, icon, children }) => (
    <section className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] dark:border-slate-700/50 dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-200/70 px-6 py-4 dark:border-slate-700/50">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
          {icon ?? <span className="text-xl">👤</span>}
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );

  const Field: React.FC<
    React.PropsWithChildren<{
      label: string;
      htmlFor: string;
      error?: string;
    }>
  > = ({ label, htmlFor, error, children }) => (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-600 dark:text-slate-300"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : (
        <p className="text-xs text-slate-400">&nbsp;</p>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-[24px]">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your profile and bank details.
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition 
            ${
              !dirty || saving
                ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                : "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800"
            }`}
          aria-disabled={!dirty || saving}
        >
          {saving ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <span>Save</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card title="Profile">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Name" htmlFor="name" error={errors.name}>
              <input
                id="name"
                type="text"
                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                readOnly
              />
            </Field>

            <Field label="Email" htmlFor="email" error={errors.email}>
              <input
                id="email"
                type="email"
                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                readOnly
              />
            </Field>
          </div>
        </Card>

        {/* Bank Details */}
        <Card title="Bank details" icon={<span className="text-xl">🏦</span>}>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Bank name" htmlFor="bankName" error={errors.bankName}>
              <input
                id="bankName"
                type="text"
                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={bank.bankName}
                onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                placeholder="e.g., People's Bank"
                autoComplete="off"
              />
            </Field>

            <Field
              label="Account name"
              htmlFor="accountName"
              error={errors.accountName}
            >
              <input
                id="accountName"
                type="text"
                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={bank.accountName}
                onChange={(e) =>
                  setBank({ ...bank, accountName: e.target.value })
                }
                placeholder="e.g., T. Perera"
                autoComplete="off"
              />
            </Field>

            <Field
              label="Account number"
              htmlFor="accountNumber"
              error={errors.accountNumber}
            >
              <input
                id="accountNumber"
                inputMode="numeric"
                pattern="[0-9]*"
                type="text"
                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={bank.accountNumber}
                onChange={(e) =>
                  setBank({
                    ...bank,
                    accountNumber: e.target.value.replace(/\s/g, ""),
                  })
                }
                placeholder="Digits only"
                autoComplete="off"
              />
            </Field>

            <Field
              label="Bank location / branch"
              htmlFor="bankLocation"
              error={errors.bankLocation}
            >
              <input
                id="bankLocation"
                type="text"
                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={bank.bankLocation}
                onChange={(e) =>
                  setBank({ ...bank, bankLocation: e.target.value })
                }
                placeholder="City / Branch"
                autoComplete="off"
              />
            </Field>
          </div>
        </Card>
      </div>

      {/* Tiny toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 rounded-xl bg-slate-900/90 px-4 py-2 text-sm text-white shadow-lg backdrop-blur"
        >
          {toast}
        </div>
      )}

      <Navigation />
    </div>
  );
}
