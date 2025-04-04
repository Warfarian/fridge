export default function LandingPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="animate-float mb-8">
          <span className="text-6xl">🍳</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-brand-orange via-brand-yellow to-brand-teal bg-clip-text text-transparent sm:text-6xl">
          Snack Overflow
        </h1>
        
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Turn your kitchen chaos into culinary masterpieces! Let AI be your sous-chef and discover amazing recipes from whatever's in your fridge.
        </p>

        <div className="mt-10 flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                title: 'AI Chef Magic',
                description: 'Transform random ingredients into gourmet recipes',
                icon: '🪄',
                animation: 'animate-bounce-slow'
              },
              {
                title: 'Nutrition Ninja',
                description: 'Track every macro with precision accuracy',
                icon: '🥗',
                animation: 'animate-float'
              },
              {
                title: 'Diet Detective',
                description: 'Recipes that respect your dietary preferences',
                icon: '🔎',
                animation: 'animate-bounce-slow'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="rounded-xl bg-white dark:bg-gray-800 p-6 text-center shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-peach via-brand-cream to-white dark:from-brand-orange/20 dark:via-brand-yellow/20 dark:to-brand-teal/20 ${feature.animation}`}>
                  <span className="text-2xl" role="img" aria-label={feature.title}>
                    {feature.icon}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold bg-gradient-to-r from-brand-orange via-brand-yellow to-brand-teal bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}