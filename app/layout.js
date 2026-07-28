import "./globals.css";
import { FontProvider } from "../context/FontContext";
import Navbar from "../components/Navbar";
import SelectedFontsDrawer from "../components/SelectedFontsDrawer";
import Footer from "../components/Footer";

export const metadata = {
  title: "Thai Font Vault | Private Google Fonts CDN Engine",
  description: "Host custom Thai web fonts and serve them via dynamic Serverless CSS API.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <FontProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <SelectedFontsDrawer />
        </FontProvider>
      </body>
    </html>
  );
}
