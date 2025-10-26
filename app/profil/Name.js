"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Name() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pobierz dane użytkownika z bazy
  useEffect(() => {
    if (status === "authenticated") {
      const fetchUserData = async () => {
        try {
          setIsLoading(true);
          const response = await fetch("/api/user");
          if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error || "Nie udało się pobrać danych użytkownika");
          }
          const { user } = await response.json();
          setName(user.name || "");
        } catch (err) {
          setError(err.message);
          toast.error(err.message, {
            position: "top-right",
            autoClose: 3000,
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserData();
    }
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Imię i nazwisko jest wymagane", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Nie udało się zaktualizować danych");
      }

      const { user } = await response.json();
      setName(user.name || "");
      toast.success("Dane osobowe zaktualizowane", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-red-600 text-center font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dane osobowe</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Imię i nazwisko
          </label>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full md:w-1/2 border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Wpisz imię i nazwisko"
                disabled={isSubmitting}
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:bg-red-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Zapisywanie..." : "Zapisz"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName(name || "");
                    setIsEditing(false);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  Anuluj
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-lg text-gray-700">{name || "Brak danych"}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-red-600 hover:underline"
              >
                Edytuj
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <p className="text-lg text-gray-700">
            {session?.user?.email || "Brak danych"}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            E-mail nie może być edytowany, ponieważ jest powiązany z logowaniem.
          </p>
        </div>
      </div>
    </div>
  );
}
