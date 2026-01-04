export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">
          🎓 École Virtuelle CE2
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Ta plateforme d'apprentissage personnalisée
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/student"
            className="kid-button bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-xl transform hover:scale-105 transition-all"
          >
            👧 Je suis un élève
          </a>
          <a
            href="/parent"
            className="kid-button bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-xl transform hover:scale-105 transition-all"
          >
            👨‍👩‍👧 Je suis un parent
          </a>
          <a
            href="/professeur"
            className="kid-button bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-xl transform hover:scale-105 transition-all"
          >
            👩‍🏫 Je suis un professeur
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-12">
          📚 Mathématiques • Français • Adaptatif • Ludique
        </p>
      </div>
    </main>
  );
}
