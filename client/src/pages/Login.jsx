export default function Login() {
    return (
      <div className="flex items-center justify-center h-screen">
        <form className="w-80 p-6 bg-white shadow rounded space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Login</h2>
          <input type="email" placeholder="Email" className="w-full border p-2 rounded" />
          <input type="password" placeholder="Password" className="w-full border p-2 rounded" />
          <button className="w-full bg-black text-white py-2 rounded">Login</button>
        </form>
      </div>
    );
  }
  