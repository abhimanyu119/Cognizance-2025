export default function Signup() {
    return (
      <div className="flex items-center justify-center h-screen">
        <form className="w-80 p-6 bg-white shadow rounded space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Signup</h2>
          <input type="text" placeholder="Name" className="w-full border p-2 rounded" />
          <input type="email" placeholder="Email" className="w-full border p-2 rounded" />
          <input type="password" placeholder="Password" className="w-full border p-2 rounded" />
          <button className="w-full bg-black text-white py-2 rounded">Signup</button>
        </form>
      </div>
    );
  }
  