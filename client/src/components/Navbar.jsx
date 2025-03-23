import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { BellIcon, MessageSquareIcon, MenuIcon, XIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Auth state would come from your AuthContext in a real app
  const userData = {
    id: 1,
    name: "Kaushal",
    role: "Freelancer", // or "Freelancer"
    avatar: "",
    unreadMessages: 3,
    unreadNotifications: 5,
  };

  const isActive = (path) => {
    return location.pathname === path ? "text-teal-400 font-medium" : "";
  };

  // Dynamic navbar links based on auth status and user role
  const getNavLinks = () => {
    // Links for non-authenticated users
    // if (!isLoggedIn) {
    //   return [{ to: "/how-it-works", label: "How it Works" }];
    // }

    //Employers
    if (userData.role === "Employer") {
      return [
        { to: "/browse-freelancers", label: "Browse Freelancers" },
        { to: "/post-job", label: "Post a job" },
        // { to: "/how-it-works", label: "How it Works" },
      ];
    }

    //Freelancers
    return [
      { to: "/find-projects", label: "find projects" },
      { to: "/active-projects", label: "Active projects" },

      // { to: "/how-it-works", label: "How it Works" },
    ];
  };

  // Profile dropdown menu items
  const getProfileMenuItems = () => {
    const commonItems = [
      { to: `/user/${user.name}`, label: "My Profile" },
      { to: "/settings", label: "Settings" },
    ];

    if (userData.role === "Employer") {
      return [
        ...commonItems.slice(0, 1),
        { to: "/payment-methods", label: "Payment Methods" },
        ...commonItems.slice(1),
      ];
    }

    return [
      ...commonItems.slice(0, 1),
      { to: "/portfolio", label: "Portfolio" },
      { to: "/payments", label: "Payments" },
      ...commonItems.slice(1),
    ];
  };

  return (
    <nav className="sticky w-full top-0 z-50 bg-[#0F172A] shadow-lg border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center mr-5">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-[#3EDBD3] to-[#4A7BF7] bg-clip-text text-transparent">
              PayCraft
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center justify-between w-full md:space-x-8">
            {/* Main Navigation Links */}
            <div className="flex space-x-6">
              {getNavLinks().map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className={`hover:text-[#3EDBD3] transition-colors px-1 py-2 text-sm font-medium text-[#94A3B8] ${isActive(
                    link.to
                  )}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side - Auth or User Profile */}
            <div className="flex items-center space-x-5">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-[#F8FAFC] hover:text-[#3EDBD3] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-[#3EDBD3] to-[#4A7BF7] text-[#0F172A] px-4 py-2 rounded-md text-sm font-medium hover:shadow-lg hover:shadow-[#3EDBD3]/20 transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  {/* Messages */}
                  <Link
                    to="/messages"
                    className="relative text-[#94A3B8] hover:text-[#3EDBD3]"
                  >
                    <MessageSquareIcon className="h-5 w-5" />
                    {userData.unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF6EC7] text-[#0F172A] text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {userData.unreadMessages > 9
                          ? "9+"
                          : userData.unreadMessages}
                      </span>
                    )}
                  </Link>

                  {/* Notifications */}
                  <Link
                    to="/notifications"
                    className="relative text-[#94A3B8] hover:text-[#3EDBD3]"
                  >
                    <BellIcon className="h-5 w-5" />
                    {userData.unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF6EC7] text-[#0F172A] text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {userData.unreadNotifications > 9
                          ? "9+"
                          : userData.unreadNotifications}
                      </span>
                    )}
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2 focus:outline-none cursor-pointer group"
                    >
                      <span className="text-sm font-medium text-[#F8FAFC] group-hover:text-[#3EDBD3]">
                        {userData.username}
                      </span>
                      <div className="w-9 h-9 ring-2 ring-[#3EDBD3]/50 rounded-full overflow-hidden">
                        <Avatar
                          avatar_url={userData.avatar}
                          username={userData.name}
                        />
                      </div>
                    </button>

                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#1E293B] rounded-md shadow-lg py-1 z-20 ring-1 ring-[#3EDBD3]/20">
                        <div className="px-4 py-2 text-xs text-[#94A3B8] border-b border-[#0B1120]/50">
                          Signed in as{" "}
                          <span className="font-medium capitalize text-[#3EDBD3]">
                            {user.role}
                          </span>
                        </div>
                        {getProfileMenuItems().map((item, index) => (
                          <Link
                            key={index}
                            to={item.to}
                            className="block px-4 py-2 text-sm text-[#F8FAFC] hover:bg-[#0B1120] hover:text-[#3EDBD3]"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                        <button
                          className="block px-4 py-2 w-full text-left text-sm text-[#F8FAFC] hover:bg-[#0B1120] hover:text-[#FF6EC7]"
                          onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            setIsProfileMenuOpen(false);
                            navigate("/login");
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#94A3B8] hover:text-[#3EDBD3] hover:bg-[#1E293B] focus:outline-none"
            >
              {isMenuOpen ? (
                <XIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0B1120]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {getNavLinks().map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.to)
                    ? "bg-[#1E293B] text-[#3EDBD3]"
                    : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#3EDBD3]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile auth or user sections */}
          <div className="pt-4 pb-3 border-t border-[#1E293B]">
            {!isLoggedIn ? (
              <div className="flex justify-around mt-3 px-2">
                <Link
                  to="/login"
                  className="w-full text-center block px-4 py-2 text-base font-medium text-[#F8FAFC] hover:text-[#3EDBD3] hover:bg-[#1E293B] rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="w-full text-center block px-4 py-2 text-base font-medium bg-gradient-to-r from-[#3EDBD3] to-[#4A7BF7] text-[#0F172A] hover:shadow-lg hover:shadow-[#3EDBD3]/20 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 ring-2 ring-[#3EDBD3]/50 rounded-full overflow-hidden">
                      <Avatar
                        avatar_url={userData.avatar}
                        username={userData.username}
                      />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-[#F8FAFC]">
                      {userData.username}
                    </div>
                    <div className="text-sm font-medium text-[#3EDBD3]">
                      {userData.role}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <Link
                    to="/messages"
                    className="flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-[#F8FAFC] hover:text-[#3EDBD3] hover:bg-[#1E293B]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Messages</span>
                    {userData.unreadMessages > 0 && (
                      <span className="bg-[#FF6EC7] text-[#0F172A] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {userData.unreadMessages}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/notifications"
                    className="flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-[#F8FAFC] hover:text-[#3EDBD3] hover:bg-[#1E293B]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Notifications</span>
                    {userData.unreadNotifications > 0 && (
                      <span className="bg-[#FF6EC7] text-[#0F172A] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {userData.unreadNotifications}
                      </span>
                    )}
                  </Link>
                  {getProfileMenuItems().map((item, index) => (
                    <Link
                      key={index}
                      to={item.to}
                      className="block px-3 py-2 rounded-md text-base font-medium text-[#F8FAFC] hover:text-[#3EDBD3] hover:bg-[#1E293B]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[#F8FAFC] hover:text-[#FF6EC7] hover:bg-[#1E293B]"
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      setIsMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}