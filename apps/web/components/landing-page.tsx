import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { Button } from "@repo/ui/button";

const LandingPage: FC = () => (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Image
            src="/twitter_logo.svg"
            alt="Twitter Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-gray-900">TwitterClone</span>
        </div>

        <Button className="text-[#00AAEC] hover:text-[#1DA1F2] font-medium transition-colors" appName="web">
          I have an account
        </Button>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Connect with the world in{" "}
                <span className="text-[#00AAEC]">real time</span>
              </h1>

              <p className="text-xl text-gray-600 max-w-lg">
                Join millions of people sharing thoughts, ideas, and moments that matter to them.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link href="/auth/sign-up">
                <button className="w-full sm:w-auto bg-[#00AAEC] hover:bg-[#1DA1F2] text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg">
                Get Started
              </button>
              </Link>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative lg:order-last order-first">
            <div className="relative bg-gradient-to-br from-[#00AAEC]/10 to-[#1DA1F2]/10 rounded-3xl p-8 backdrop-blur-sm">

              {/* Mock Tweet Cards */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#00AAEC] to-[#1DA1F2] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">A</span>
                    </div>

                    <div>
                      <div className="font-semibold text-gray-900">Alex Chen</div>
                      <div className="text-gray-500 text-sm">@alexc</div>
                    </div>
                  </div>

                  <p className="text-gray-700">
                    Just shipped a new feature! The community response has been incredible 🚀
                  </p>

                  <div className="flex items-center gap-6 mt-4 text-gray-400 text-sm">
                    <span className="hover:text-[#00AAEC] cursor-pointer">💬 12</span>
                    <span className="hover:text-green-500 cursor-pointer">🔄 8</span>
                    <span className="hover:text-red-500 cursor-pointer">❤️ 24</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow ml-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Maria Rodriguez</div>
                      <div className="text-gray-500 text-sm">@maria_dev</div>
                    </div>
                  </div>

                  <p className="text-gray-700">
                    Love how this platform brings developers together! 💻✨
                  </p>

                  <div className="flex items-center gap-6 mt-4 text-gray-400 text-sm">
                    <span className="hover:text-[#00AAEC] cursor-pointer">💬 5</span>
                    <span className="hover:text-green-500 cursor-pointer">🔄 15</span>
                    <span className="hover:text-red-500 cursor-pointer">❤️ 32</span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#00AAEC]/20 rounded-full animate-custom-pulse"></div>
              <div className="absolute -bottom-6 -left-4 w-16 h-16 bg-[#1DA1F2]/20 rounded-full animate-custom-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-400 text-sm pb-8">
        <p>© 2025 TwitterClone.</p>
      </footer>
    </div>
  );

export default LandingPage;
