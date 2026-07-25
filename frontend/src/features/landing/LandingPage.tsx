import { PublicNavbar } from "@/components/layout/PublicNavbar"
import { Hero } from "./components/Hero"
import { BentoFeatures } from "./components/BentoFeatures"
import { Workflow } from "./components/Workflow"
import { TechStack } from "./components/TechStack"
import { FAQ, Footer } from "./components/FAQFooter"

export function LandingPage() {
  return (
    <div className="relative overflow-x-hidden">
      <PublicNavbar />
      <Hero />
      <BentoFeatures />
      <Workflow />
      <TechStack />
      <FAQ />
      <Footer />
    </div>
  )
}
