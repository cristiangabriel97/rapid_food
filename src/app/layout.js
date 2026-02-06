import "./globals.css";
import { Toaster } from "sonner"; // <--- ESTA LÍNEA ES LA QUE FALTA

export const metadata = {
  title: "FastFood",
  description: "Sistema de gestion de comidas rápidas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans bg-zinc-50 text-zinc-900 antialiased">
        <Toaster richColors position="top-center" />
        {children}
      </body>
    </html>
  );
}
