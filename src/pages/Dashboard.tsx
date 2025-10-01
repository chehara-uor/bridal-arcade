import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import axios from "axios";
import BrideBackground from "../assets/brides.jpg";
import Acc from "../assets/account.jpg"
interface RecentActivity {
  id: number;
  type: string;
  time_ago: string;
}

interface Stats {
  totalSales: number;
  totalOrders: number;
  categories: string[];
  monthlyGrowth: number;
}


const Dashboard = () => {
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [name, setName] = useState<string>("");
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    totalOrders: 0,
    categories: [],
    monthlyGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const userName = sessionStorage.getItem("userName");
    if (userName) {
      setName(userName);
    }
  }, []);

  const getData = async () => {
    setIsLoading(true);
    if (sessionStorage.getItem("dashboardData")) {
      const cachedData = JSON.parse(
        sessionStorage.getItem("dashboardData") || "{}"
      );
      setRecentActivities(cachedData.activity);
      setStats((prev) => ({
        ...prev,
        totalSales: cachedData.total_sales,
        totalOrders: cachedData.orders,
        categories: cachedData.categories,
        monthlyGrowth: 12.7,
      }));
      setIsLoading(false);
    } else {
      try {
        const res = await axios.get(
          `https://bridalarcade.lk/wp-json/bridal/v2/dashboard?email=${sessionStorage.getItem(
            "userEmail"
          )}`
        );
        if (res.status === 200) {
          sessionStorage.setItem("dashboardData", JSON.stringify(res.data));
          setStats((prev) => ({
            ...prev,
            totalSales: res.data.total_sales,
            totalOrders: res.data.orders,
            categories: res.data.categories,
            monthlyGrowth: 12.7,
          }));
          setRecentActivities(res.data.activity);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getProductData = async () => {
    if (sessionStorage.getItem("productData")) {
      return;
    } else {
      try {
        const res = await axios.get(
          `https://bridalarcade.lk/wp-json/bridal/v1/productlist?email=${sessionStorage.getItem(
            "userEmail"
          )}`
        );
        if (res.status === 200) {
          sessionStorage.setItem("productData", JSON.stringify(res.data));
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    }
  };

  const getOrderData = async () => {
    if (sessionStorage.getItem("orderData")) {
      return;
    } else {
      try {
        const res = await axios.get(
          `https://bridalarcade.lk/wp-json/bridal/v1/orderlist?email=${sessionStorage.getItem(
            "userEmail"
          )}`
        );
        if (res.status === 200) {
          sessionStorage.setItem("orderData", JSON.stringify(res.data));
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    }
  };

  useEffect(() => {
    getData();
    getProductData();
    getOrderData();
  }, [name]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-[14px] lg:mt-0">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="details">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, {name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your rental item today.
          </p>
          </div>
          <a href="/my-account" className="account flex items-center gap-3 bg-gradient-to-br from-accent-foreground/10 to-accent-foreground/5 px-4 py-2 rounded-lg transition">
            <img src={Acc} alt="Account" className="w-8 h-8" />
            <span className="text-sm font-semibold text-primary">
              My account
            </span>
            </a>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Total Sales */}
          <div className="group relative bg-gradient-to-br from-card via-card to-surface-elevated rounded-3xl p-6 sm:p-8 shadow-lg border border-border-light/50 backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="w-fit mb-4 bg-gradient-to-br from-primary to-primary-light p-4 rounded-2xl shadow-lg group-hover:shadow-primary/25 transition-shadow duration-500">
                  <svg
                    className="w-8 h-8 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                    Total Profit
                  </p>
                </div>
                {isLoading ? (
                  <div className="h-10 w-32 bg-muted-foreground/20 animate-pulse rounded mb-3"></div>
                ) : (
                  <p className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                    LKR {stats.totalSales.toLocaleString()}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-success/10 px-3 py-1 rounded-full">
                    <svg
                      className="w-4 h-4 text-success"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      ></path>
                    </svg>
                    <span className="text-success text-sm font-bold">
                      +{stats.monthlyGrowth}%
                    </span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    vs last month
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="group relative bg-gradient-to-br from-card via-card to-surface-elevated rounded-3xl p-6 sm:p-8 shadow-lg border border-border-light/50 backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="w-fit mb-4 bg-gradient-to-br from-secondary to-secondary-light p-4 rounded-2xl shadow-lg group-hover:shadow-secondary/25 transition-shadow duration-500">
                  <svg
                    className="w-8 h-8 text-secondary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                    Orders
                  </p>
                </div>
                {isLoading ? (
                  <div className="h-10 w-24 bg-muted-foreground/20 animate-pulse rounded mb-3"></div>
                ) : (
                  <p className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                    {stats.totalOrders}
                  </p>
                )}
                <p className="text-muted-foreground text-sm font-medium">
                  Active rentals
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="group relative bg-gradient-to-br from-card via-card to-surface-elevated rounded-3xl p-6 sm:p-8 shadow-lg border border-border-light/50 backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="w-fit mb-4 bg-gradient-to-br from-accent-foreground/10 to-accent-foreground/5 p-4 rounded-2xl shadow-lg border border-accent-foreground/20 group-hover:shadow-accent-foreground/25 transition-shadow duration-500">
                  <svg
                    className="w-8 h-8 text-accent-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full"></div>
                  <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                    My Items
                  </p>
                </div>
                {isLoading ? (
                  <div className="h-10 w-16 bg-muted-foreground/20 animate-pulse rounded mb-4"></div>
                ) : (
                  <p className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                    {stats.categories.length}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {stats.categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-gradient-to-r from-accent-foreground/10 to-accent-foreground/5 text-accent-foreground px-3 py-1.5 rounded-full text-sm font-semibold border border-accent-foreground/20"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="group relative bg-gradient-to-br from-card via-card to-surface-elevated rounded-3xl p-6 sm:p-8 shadow-lg border border-border-light/50 backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                  <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                    Recent Activity
                  </p>
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    <>
                      <div className="relative pl-4 border-l-2 border-primary/20 transition-colors duration-300">
                        <div className="absolute -left-1.5 top-1 w-3 h-3 bg-primary/30 rounded-full border-2 border-card animate-pulse"></div>
                        <div className="h-4 w-32 bg-muted-foreground/20 animate-pulse rounded mb-1 mt-1"></div>
                        <div className="h-3 w-20 bg-primary/10 animate-pulse rounded-full"></div>
                      </div>
                      <div className="relative pl-4 border-l-2 border-primary/20 transition-colors duration-300">
                        <div className="absolute -left-1.5 top-1 w-3 h-3 bg-primary/30 rounded-full border-2 border-card animate-pulse"></div>
                        <div className="h-4 w-28 bg-muted-foreground/20 animate-pulse rounded mb-1 mt-1"></div>
                        <div className="h-3 w-16 bg-primary/10 animate-pulse rounded-full"></div>
                      </div>
                    </>
                  ) : (
                    recentActivities.slice(0, 2).map((activity) => (
                      <div
                        key={activity.id}
                        className="relative pl-4 border-l-2 border-primary/20 hover:border-primary/40 transition-colors duration-300"
                      >
                        <div className="absolute -left-1.5 top-1 w-3 h-3 bg-primary rounded-full border-2 border-card"></div>
                        <p className="text-sm text-foreground leading-relaxed mb-1 font-medium">
                          {activity.type}
                        </p>
                        <p className="text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full inline-block">
                          {activity.time_ago}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-warning to-warning/80 p-4 rounded-2xl shadow-lg group-hover:shadow-warning/25 transition-shadow duration-500">
                <svg
                  className="w-8 h-8 text-warning-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <section className="py-10">
          <div className="grid gap-6 md:grid-cols-2">
            <a
              href="https://bridalarcade.lk/"
              target="_blank"
              rel="noopener"
              className="group relative overflow-hidden rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <img
                src={BrideBackground}
                alt="Bridal Arcade"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/50 transition-colors duration-300 group-hover:bg-black/60"></div>

              <div className="relative z-10 p-6 sm:p-8 min-h-[220px] flex items-end">
                <div>
                  <h3 className="text-white text-2xl font-semibold">
                    Visit Website
                  </h3>
                  <p className="mt-1 text-white/80">
                    Explore the full catalog and updates.
                  </p>
                  <span
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-medium text-gray-900
                   shadow-md transition-all duration-300 group-hover:translate-y-[-2px] group-hover:shadow-lg"
                  >
                    Visit Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </a>

            <a
              href="https://chat.whatsapp.com/G45BmT2VSKy5fQWIlxsj0I"
              target="_blank"
              rel="noopener"
              className="group relative overflow-hidden rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1400&auto=format&fit=crop"
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/50 transition-colors duration-300 group-hover:bg-black/60"></div>

              <div className="relative z-10 p-6 sm:p-8 min-h-[220px] flex items-end">
                <div>
                  <h3 className="text-white text-2xl font-semibold">
                    Join Our WhatsApp Group
                  </h3>
                  <p className="mt-1 text-white/80">
                    Get tips, drops, and support.
                  </p>
                  <span
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/95 px-5 py-2.5 text-sm font-medium text-white
                   shadow-md transition-all duration-300 group-hover:translate-y-[-2px] group-hover:shadow-lg"
                  >
                    Chat Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          </div>
        </section>
      </div>

      <Navigation />
    </div>
  );
};

export default Dashboard;
