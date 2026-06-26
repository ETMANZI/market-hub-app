import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import RightSidebar from "./RightSidebar";
import PageContainer from "./PageContainer";
import Chatbot from "../chatpot/Chatbot";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <PageContainer>
        <div className="grid gap-8 py-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* DESKTOP SIDEBAR */}
          <div className="hidden xl:block">
            <div className="sticky top-[120px] h-fit">
              <RightSidebar />
            </div>
          </div>

          <div className="min-w-0">
            <Outlet />

            <div className="mt-8 xl:hidden">
              <RightSidebar />
            </div>
          </div>
        </div>
      </PageContainer>

      <Footer />
      
      {/* Chatbot - appears on all pages */}
      <Chatbot />
    </div>
  );
}