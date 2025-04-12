import RecipeGenerator from "./components/RecipeGenerator";
import ThemeSwitch from "./components/ThemeSwitch";
import LandingPage from "./components/LandingPage";
import CheckNowButton from "./components/CheckNowButton";
import { IngredientsProvider } from "./context/IngredientsContext";

function App() {
  return (
    <IngredientsProvider>
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
              <CheckNowButton />
              <ThemeSwitch />
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LandingPage />
          <main className="py-12">
            <RecipeGenerator />
          </main>
        </div>
      </div>
    </IngredientsProvider>
  );
}

export default App;