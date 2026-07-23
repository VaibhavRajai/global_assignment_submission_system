import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TeacherFeatures from "@/components/TeacherFeatures";
import StudentFeatures from "@/components/StudentFeatures";
import SecurityText from "@/components/SecurityText";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "GlobalAssign | Teacher & Student Academic Platform",
  description: "Text-focused responsive landing page introducing GlobalAssign features: Create, View, and Summarize assignments for teachers, and Safe Upload for students.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col font-sans">
      <Header />
      <main className="flex-1">
        <Hero />
        <TeacherFeatures />
        <StudentFeatures />
        <SecurityText />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
