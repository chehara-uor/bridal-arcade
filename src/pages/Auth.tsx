import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { registerUser } from "../api/register";
interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const registerOwner = async (data: any) => {
    try {
      const response = await registerUser(data);
      if (response && response.status === 201) {
        toast.success("Registration successful!");
        setFormData({
          email: "",
          password: "",
          name: "",
          username: "",
          confirmPassword: "",
        });
        setIsLogin(true);
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  }

  const transformRegisterData = (data: RegisterData) => {
    return {
      username: data.username.toLocaleLowerCase(),
      email: data.email,
      first_name: data.name,
      password: data.password,
      role: "bridal_owner"
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
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
  }
    else {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
      const registerData: RegisterData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };
      const transformedData = transformRegisterData(registerData);
      // console.log(transformedData);
      await registerOwner(transformedData);
    }

  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username") {
      const filtered = value.replace(/[^a-z]/g, "");
      setFormData({
        ...formData,
        [name]: filtered,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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
                        autoComplete="off"
                        pattern="[a-z]+"
                        title="Username must contain only lowercase letters, no spaces or special characters."
                        inputMode="text"
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
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-secondary focus:border-secondary/50 transition-all duration-300 focus:bg-white/15 group-hover:bg-white/15 pr-12"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 24 24"><g><path d="M23.271 9.419C21.72 6.893 18.192 2.655 12 2.655S2.28 6.893.729 9.419a4.908 4.908 0 0 0 0 5.162C2.28 17.107 5.808 21.345 12 21.345s9.72-4.238 11.271-6.764a4.908 4.908 0 0 0 0-5.162Zm-1.705 4.115C20.234 15.7 17.219 19.345 12 19.345S3.766 15.7 2.434 13.534a2.918 2.918 0 0 1 0-3.068C3.766 8.3 6.781 4.655 12 4.655s8.234 3.641 9.566 5.811a2.918 2.918 0 0 1 0 3.068Z" fill="#ffffff" opacity="1" data-original="#000000"></path><path d="M12 7a5 5 0 1 0 5 5 5.006 5.006 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Z" fill="#ffffff" opacity="1" data-original="#000000" ></path></g></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 24 24" ><g><path d="M23.271 9.419A15.866 15.866 0 0 0 19.9 5.51l2.8-2.8a1 1 0 0 0-1.414-1.414l-3.045 3.049A12.054 12.054 0 0 0 12 2.655c-6.191 0-9.719 4.238-11.271 6.764a4.908 4.908 0 0 0 0 5.162A15.866 15.866 0 0 0 4.1 18.49l-2.8 2.8a1 1 0 1 0 1.414 1.414l3.052-3.052A12.054 12.054 0 0 0 12 21.345c6.191 0 9.719-4.238 11.271-6.764a4.908 4.908 0 0 0 0-5.162ZM2.433 13.534a2.918 2.918 0 0 1 0-3.068C3.767 8.3 6.782 4.655 12 4.655a10.1 10.1 0 0 1 4.766 1.165l-2.013 2.013a4.992 4.992 0 0 0-6.92 6.92l-2.31 2.31a13.723 13.723 0 0 1-3.09-3.529ZM15 12a3 3 0 0 1-3 3 2.951 2.951 0 0 1-1.285-.3l3.985-3.985A2.951 2.951 0 0 1 15 12Zm-6 0a3 3 0 0 1 3-3 2.951 2.951 0 0 1 1.285.3L9.3 13.285A2.951 2.951 0 0 1 9 12Zm12.567 1.534C20.233 15.7 17.218 19.345 12 19.345a10.1 10.1 0 0 1-4.766-1.165l2.013-2.013a4.992 4.992 0 0 0 6.92-6.92l2.31-2.31a13.723 13.723 0 0 1 3.09 3.529 2.918 2.918 0 0 1 0 3.068Z" fill="#ffffff" opacity="1" data-original="#000000"></path></g></svg>
                  )}
                </button>
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
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-secondary focus:border-secondary/50 transition-all duration-300 focus:bg-white/15 group-hover:bg-white/15 pr-12"
                    placeholder="Confirm password"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                       <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 24 24"><g><path d="M23.271 9.419C21.72 6.893 18.192 2.655 12 2.655S2.28 6.893.729 9.419a4.908 4.908 0 0 0 0 5.162C2.28 17.107 5.808 21.345 12 21.345s9.72-4.238 11.271-6.764a4.908 4.908 0 0 0 0-5.162Zm-1.705 4.115C20.234 15.7 17.219 19.345 12 19.345S3.766 15.7 2.434 13.534a2.918 2.918 0 0 1 0-3.068C3.766 8.3 6.781 4.655 12 4.655s8.234 3.641 9.566 5.811a2.918 2.918 0 0 1 0 3.068Z" fill="#ffffff" opacity="1" data-original="#000000"></path><path d="M12 7a5 5 0 1 0 5 5 5.006 5.006 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Z" fill="#ffffff" opacity="1" data-original="#000000" ></path></g></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 24 24" ><g><path d="M23.271 9.419A15.866 15.866 0 0 0 19.9 5.51l2.8-2.8a1 1 0 0 0-1.414-1.414l-3.045 3.049A12.054 12.054 0 0 0 12 2.655c-6.191 0-9.719 4.238-11.271 6.764a4.908 4.908 0 0 0 0 5.162A15.866 15.866 0 0 0 4.1 18.49l-2.8 2.8a1 1 0 1 0 1.414 1.414l3.052-3.052A12.054 12.054 0 0 0 12 21.345c6.191 0 9.719-4.238 11.271-6.764a4.908 4.908 0 0 0 0-5.162ZM2.433 13.534a2.918 2.918 0 0 1 0-3.068C3.767 8.3 6.782 4.655 12 4.655a10.1 10.1 0 0 1 4.766 1.165l-2.013 2.013a4.992 4.992 0 0 0-6.92 6.92l-2.31 2.31a13.723 13.723 0 0 1-3.09-3.529ZM15 12a3 3 0 0 1-3 3 2.951 2.951 0 0 1-1.285-.3l3.985-3.985A2.951 2.951 0 0 1 15 12Zm-6 0a3 3 0 0 1 3-3 2.951 2.951 0 0 1 1.285.3L9.3 13.285A2.951 2.951 0 0 1 9 12Zm12.567 1.534C20.233 15.7 17.218 19.345 12 19.345a10.1 10.1 0 0 1-4.766-1.165l2.013-2.013a4.992 4.992 0 0 0 6.92-6.92l2.31-2.31a13.723 13.723 0 0 1 3.09 3.529 2.918 2.918 0 0 1 0 3.068Z" fill="#ffffff" opacity="1" data-original="#000000"></path></g></svg>
                  )}
                  </button>
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
                href="mailto:hello@bridalarcade.lk?subject=Password%20Reset%20Request"
                className="text-white hover:text-white/80 text-sm font-semibold transition-colors duration-200 hover:underline"
              >
                Forgot your password? Send ✉️ to us
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
