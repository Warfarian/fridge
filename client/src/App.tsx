import { SignIn, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import RecipeGenerator from "./components/RecipeGenerator";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Smart Fridge</h1>
          <UserButton afterSignOutUrl="/"/>
        </div>
      </nav>

      <SignedOut>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SignIn />
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