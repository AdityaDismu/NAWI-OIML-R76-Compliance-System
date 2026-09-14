import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-slate-800">
        404
      </p>

      <h1 className="mt-4 text-2xl font-bold text-white">
        Page not found
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        The page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-teal-400"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}