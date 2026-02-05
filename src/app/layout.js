import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "FastFood POS",
  description: "Sistema integral de gestión para restaurante",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans">
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            className:
              "rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-50 shadow-xl",
          }}
        />
        {children}
      </body>
    </html>
  );
}
