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
    <html lang="th" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('tfv_theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-[#0c0d0e] text-zinc-900 dark:text-zinc-100 selection:bg-blue-500 selection:text-white transition-colors duration-200">
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
