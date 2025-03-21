export default function Landing() {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-4xl font-semibold mb-4">Welcome to Our App</h1>
        <p className="text-gray-600 mb-6">Minimal, clean, and modern experience</p>
        <div className="flex gap-4">
          <a href="/login" className="px-4 py-2 bg-black text-white rounded-md">Login</a>
          <a href="/signup" className="px-4 py-2 border border-black rounded-md">Signup</a>
        </div>
      </div>
    );
  }
  