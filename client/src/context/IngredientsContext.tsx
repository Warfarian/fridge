import React, { createContext, useContext, useState } from 'react';

interface IngredientsContextType {
  refreshIngredients: () => Promise<void>;
}

const IngredientsContext = createContext<IngredientsContextType | undefined>(undefined);

export function IngredientsProvider({ children }: { children: React.ReactNode }) {
  const [lastUpdate, setLastUpdate] = useState(0);

  const refreshIngredients = async () => {
    setLastUpdate(Date.now()); // Trigger a refresh in RecipeGenerator
  };

  return (
    <IngredientsContext.Provider value={{ refreshIngredients }}>
      {children}
    </IngredientsContext.Provider>
  );
}

export function useIngredients() {
  const context = useContext(IngredientsContext);
  if (context === undefined) {
    throw new Error('useIngredients must be used within an IngredientsProvider');
  }
  return context;
}