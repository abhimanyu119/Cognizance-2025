import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 shadow-md px-20">
      <div className="text-xl font-bold">BrandName</div>
      <div className="flex gap-4">
        <Link to="/" className="hover:underline">Landing</Link>
        <Link to="/home" className="hover:underline">Home</Link>
        <Link to="/login" className="hover:underline">Login</Link>
        <Link to="/signup" className="hover:underline">Signup</Link>
      </div>
    </nav>
  );
}
