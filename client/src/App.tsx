import { SignIn, SignedIn, SignedOut, UserButton, useClerk } from "@clerk/clerk-react";
import RecipeGenerator from "./components/RecipeGenerator";
import ThemeSwitch from "./components/ThemeSwitch";
import LandingPage from "./components/LandingPage";

function App() {
  const { openSignIn } = useClerk();

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-dark transition-colors">
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍳</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-brand-orange via-brand-yellow to-brand-teal bg-clip-text text-transparent">
              Snack Overflow
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeSwitch />
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    rootBox: "hover:scale-105 transition-transform",
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </SignedIn>
            <SignedOut>
              <button
                onClick={() => openSignIn()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-teal hover:bg-brand-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal transition-all duration-200 hover:scale-105"
              >
                Sign In
              </button>
            </SignedOut>
          </div>
        </div>
      </nav>

      <SignedOut>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LandingPage />
          <div className="flex justify-center pb-12">
            <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl p-8 transform transition-all duration-300 hover:scale-[1.02]">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-orange via-brand-yellow to-brand-teal bg-clip-text text-transparent">
                  Join the Kitchen Party!
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Sign in to start cooking up some magic
                </p>
              </div>
              <button
                onClick={() => openSignIn()}
                className="w-full px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-teal hover:bg-brand-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal transition-all duration-200 hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <RecipeGenerator />
        </main>
      </SignedIn>
    </div>
  );
}

export default App;