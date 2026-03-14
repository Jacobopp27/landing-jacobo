import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollBar from '@/components/layout/ScrollBar'
import Hero from '@/components/sections/Hero'
import WhatIBuild from '@/components/sections/WhatIBuild'
import AllWork from '@/components/sections/AllWork'
import TechStack from '@/components/sections/TechStack'
import Experience from '@/components/sections/Experience'
import Contact from '@/components/sections/Contact'

export default function Home() {
  return (
    <>
      <Header />
      <ScrollBar />
      <main>
        {/* 1. Hero — value prop + CTA above fold + proof stats */}
        <Hero />

        {/* 2. What I Build — benefits, not features */}
        <WhatIBuild />

        {/* 3. All Work — unified: AI systems + products + automation, with filter tabs */}
        <AllWork />

        {/* 4. Tech Stack — grouped by domain */}
        <TechStack />

        {/* 5. Professional Experience — honest, objection-handled */}
        <Experience />

        {/* 6. Contact — strong final CTA, minimal friction */}
        <Contact />
      </main>
      <Footer />
    </>
  )
}
