import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { Button } from "@repo/ui/button";

const LandingPage: FC = () => (
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
    <header className="mx-auto flex max-w-7xl items-center justify-between p-6">
      <div className="flex items-center gap-3">
        <Image src="/twitter_logo.svg" alt="Twitter Logo" width={32} height={32} className="h-8 w-8" />
        <span className="text-xl font-bold text-gray-900">TwitterClone</span>
      </div>
      <Button className="font-medium text-[#00AAEC] transition-colors hover:text-[#1DA1F2]" appName="web">
        I have an account
      </Button>
    </header>

    <main className="mx-auto max-w-7xl grid items-center gap-12 px-6 py-12 lg:grid-cols-2">
      {/* Left */}
      <section className="space-y-8 animate-fade-in-up">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Connect with the world in <span className="text-[#00AAEC]">real time</span>
          </h1>
          <p className="max-w-lg text-xl text-gray-600">
            Join millions of people sharing thoughts, ideas, and moments that matter to them.
          </p>
        </div>
        <div>
          <Link
            href="/auth/sign-up"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#00AAEC] px-8 py-4 text-lg font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-[#1DA1F2] hover:shadow-lg sm:w-auto"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Right illustration */}
      <section className="order-first relative lg:order-last">
        <div className="relative rounded-3xl bg-linear-to-br from-[#00AAEC]/10 to-[#1DA1F2]/10 p-8 backdrop-blur-xs">
          <div className="space-y-4">
            <article className="rounded-2xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-[#00AAEC] to-[#1DA1F2]">
                  <span className="text-lg font-bold text-white">A</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Alex Chen</div>
                  <div className="text-sm text-gray-500">@alexc</div>
                </div>
              </div>
              <p className="text-gray-700">Just shipped a new feature! The community response has been incredible 🚀</p>
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-400">
                <span className="cursor-pointer hover:text-[#00AAEC]">💬 12</span>
                <span className="cursor-pointer hover:text-green-500">🔄 8</span>
                <span className="cursor-pointer hover:text-red-500">❤️ 24</span>
              </div>
            </article>

            <article className="ml-8 rounded-2xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-pink-500">
                  <span className="text-lg font-bold text-white">M</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Maria Rodriguez</div>
                  <div className="text-sm text-gray-500">@maria_dev</div>
                </div>
              </div>
              <p className="text-gray-700">Love how this platform brings developers together! 💻✨</p>
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-400">
                <span className="cursor-pointer hover:text-[#00AAEC]">💬 5</span>
                <span className="cursor-pointer hover:text-green-500">🔄 15</span>
                <span className="cursor-pointer hover:text-red-500">❤️ 32</span>
              </div>
            </article>
          </div>

          {/* Floating bubbles */}
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#00AAEC]/20 animate-custom-pulse" />
          <div className="absolute -bottom-6 -left-4 h-16 w-16 rounded-full bg-[#1DA1F2]/20 animate-custom-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
      </section>
    </main>

    <footer className="pb-8 text-center text-sm text-gray-400">
      <p>© 2025 TwitterClone.</p>
    </footer>
  </div>
);

export default LandingPage;
