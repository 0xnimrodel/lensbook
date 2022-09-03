import Navbar from "./Navbar";
import Footer from "./Footer";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="font-sans flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
