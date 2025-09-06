import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const registerCompany = async (data: any) => {
    try {
      const response = await axios.post("/api/register", JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        toast.success("Registration successful!");
        setFormData({
          email: "",
          password: "",
          name: "",
          username: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation for demo
    if (formData.email && formData.password) {
      try {
        const res = await axios.get(
          "https://bridalarcade.lk/wp-json/bridal/v2/login",
          {
            params: {
              username_or_email: formData.email,
              password: formData.password,
            },
          }
        );

        if (res.status === 200) {
          sessionStorage.setItem("userToken", res.data.token);
          sessionStorage.setItem("userID", res.data.user_id);
          sessionStorage.setItem("userName", res.data.firstname);
          sessionStorage.setItem("userEmail", formData.email);
          //setLoading(false);
          localStorage.setItem("isAuthenticated", "true");
          navigate("/dashboard");
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            if (err.response.status == 401) {
              toast.error("Invalid credentials. Please try again.");
            } else if (err.response.status == 500) {
              toast.error("Server error. Please try again later");
            }
          } else {
            toast.error("Network error. Please check your connection.");
          }
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-secondary flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl"></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-secondary/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-primary-light/40 rotate-45 animate-pulse delay-500"></div>
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-secondary/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-primary/30 rotate-45 animate-pulse delay-700"></div>
      </div>

      {/* Glass Morphism Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/1 pointer-events-none"></div>

        {/* Header */}
        <div className="relative p-8 text-center border-b border-white/10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl mb-4 shadow-lg">
            <img src={Logo} alt="Logo" className="w-auto" />
            {/* <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-lg"></div> */}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Rental Check</h1>
          <p className="text-white/70 text-sm font-medium">
            Bridal Aracde's Vendor Portal
          </p>
        </div>

        {/* Form */}
        <div className="relative p-8">
          <div className="flex mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? "bg-gradient-to-r from-secondary to-primary text-white shadow-lg shadow-primary/20 transform scale-105"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? "bg-gradient-to-r from-secondary to-primary text-white shadow-lg shadow-primary/20 transform scale-105"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <div className="group">
                    <label
                      htmlFor="username"
                      className="block text-sm font-semibold text-white/90 mb-3"
                    >
                      User Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-secondary focus:border-secondary/50 transition-all duration-300 focus:bg-white/15 group-hover:bg-white/15"
                        placeholder="Ex: john"
                        required={!isLogin}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/0 to-primary/0 group-hover:from-secondary/5 group-hover:to-primary/5 transition-all duration-300 pointer-events-none"></div>
                    </div>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="group">
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-white/90 mb-3"
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-secondary focus:border-secondary/50 transition-all duration-300 focus:bg-white/15 group-hover:bg-white/15"
                          placeholder="Ex: John"
                          required={!isLogin}
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/0 to-primary/0 group-hover:from-secondary/5 group-hover:to-primary/5 transition-all duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="group">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-white/90 mb-3"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-secondary focus:border-secondary/50 transition-all duration-300 focus:bg-white/15 group-hover:bg-white/15"
                  placeholder="Enter your email"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/0 to-primary/0 group-hover:from-secondary/5 group-hover:to-primary/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>
            <div className={ !isLogin ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid" }>
            <div className="group">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-white/90 mb-3"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-secondary focus:border-secondary/50 transition-all duration-300 focus:bg-white/15 group-hover:bg-white/15"
                  placeholder="Enter password"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/0 to-primary/0 group-hover:from-secondary/5 group-hover:to-primary/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            {!isLogin && (
              <div className="group">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-white/90 mb-3"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-secondary focus:border-secondary/50 transition-all duration-300 focus:bg-white/15 group-hover:bg-white/15"
                    placeholder="Confirm password"
                    required={!isLogin}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/0 to-primary/0 group-hover:from-secondary/5 group-hover:to-primary/5 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
            )}
            </div>
            <button
              type="submit"
              className="w-full relative overflow-hidden bg-gradient-to-r from-secondary to-primary text-white py-4 px-6 rounded-2xl font-semibold hover:from-secondary/90 hover:to-primary/90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transform hover:scale-[1.02] group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative z-10">
                {isLogin ? "Sign In to Your Account" : "Create Your Account"}
              </span>
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 text-center">
              <a
                href="#"
                className="text-white hover:text-white/80 text-sm font-semibold transition-colors duration-200 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          )}
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover={false}
        theme="colored"
      />
    </div>
  );
};

export default Auth;
