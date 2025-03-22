import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Avatar from "./Avatar";
import { BellIcon, MessageSquareIcon, MenuIcon, XIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  
  
  // Auth state would come from your AuthContext in a real app
  const userData = {
    id: 1,
    name: "Kaushal",
    role: "Freelancer", // or "Freelancer"
    avatar: "",
    unreadMessages: 3,
    unreadNotifications: 5
  };

  const isActive = (path) => {
    return location.pathname === path ? "text-blue-600 font-medium" : "";
  };

  // Dynamic navbar links based on auth status and user role
  const getNavLinks = () => {

    // Links for non-authenticated users
    if (!isLoggedIn) {
      return [
        { to: "/how-it-works", label: "How it Works" }
      ];
    }
    
    //Employers
    if (userData.role === "Employer") {
      return [
        { to: "/browse-freelancers", label: "Browse Freelancers" },
        { to: "/post-job", label: "Post a job" },
        { to: "/how-it-works", label: "How it Works" }
      ];
    }
    
    //Freelancers
    return [
      { to: "/browse-jobs", label: "Browse Jobs" },
      { to: "/how-it-works", label: "How it Works" }
    ];
  };

  // Profile dropdown menu items
  const getProfileMenuItems = () => {
    const commonItems = [
      { to: `/profile/${userData.username}`, label: "My Profile" },
      { to: "/settings", label: "Settings" },
      { to: "/logout", label: "Logout" }
    ];
    
    if (userData.role === "Employer") {
      return [
        ...commonItems.slice(0, 1),
        { to: "/payment-methods", label: "Payment Methods" },
        ...commonItems.slice(1)
      ];
    }
    
    return [
      ...commonItems.slice(0, 1),
      { to: "/portfolio", label: "Portfolio" },
      { to: "/payments", label: "Payments" },
      ...commonItems.slice(1)
    ];
  };
  
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center mr-5">
            <Link to="/" className="text-xl font-bold text-blue-600">
              SkillBridge
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
                  className={`hover:text-blue-600 transition-colors px-1 py-2 text-sm font-medium ${isActive(link.to)}`}
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
                    className="text-sm font-medium hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  {/* Messages */}
                  <Link to="/messages" className="relative text-gray-600 hover:text-blue-600">
                    <MessageSquareIcon className="h-5 w-5" />
                    {userData.unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {userData.unreadMessages > 9 ? '9+' : userData.unreadMessages}
                      </span>
                    )}
                  </Link>
                  
                  {/* Notifications */}
                  <Link to="/notifications" className="relative text-gray-600 hover:text-blue-600">
                    <BellIcon className="h-5 w-5" />
                    {userData.unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {userData.unreadNotifications > 9 ? '9+' : userData.unreadNotifications}
                      </span>
                    )}
                  </Link>
                  
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2 focus:outline-none cursor-pointer"
                    >
                      <span className="text-sm font-medium">{userData.username}</span>
                      <div className="w-9 h-9">
                        <Avatar avatar_url={userData.avatar} username={userData.name} />
                      </div>
                    </button>
                    
                    {/* Profile Dropdown Menu */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                        <div className="px-4 py-2 text-xs text-gray-500 border-b">
                          Signed in as <span className="font-medium">{userData.role}</span>
                        </div>
                        {getProfileMenuItems().map((item, index) => (
                          <Link
                            key={index}
                            to={item.to}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
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
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {getNavLinks().map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.to) 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Mobile auth or user sections */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {!isLoggedIn ? (
              <div className="flex justify-around mt-3 px-2">
                <Link 
                  to="/login" 
                  className="w-full text-center block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="w-full text-center block px-4 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10">
                      <Avatar avatar_url={userData.avatar} username={userData.username} />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{userData.username}</div>
                    <div className="text-sm font-medium text-gray-500">{userData.role}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <Link 
                    to="/messages" 
                    className="flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Messages</span>
                    {userData.unreadMessages > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {userData.unreadMessages}
                      </span>
                    )}
                  </Link>
                  <Link 
                    to="/notifications" 
                    className="flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Notifications</span>
                    {userData.unreadNotifications > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {userData.unreadNotifications}
                      </span>
                    )}
                  </Link>
                  {getProfileMenuItems().map((item, index) => (
                    <Link
                      key={index}
                      to={item.to}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
