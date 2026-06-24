import { API } from '../config'

export default function Home() {
  const handleGoogleLogin = () => {
    window.location.href = `${API}/auth/google`
  }

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl">

        {/* Hero */}
        <div className="bg-[#1A1A2E] px-6 pt-8 pb-10 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            ⚡
          </div>
          <h1 className="text-white text-2xl font-bold">EpiQuest</h1>
          <p className="text-white/40 text-xs mt-1">Journée Portes Ouvertes — Epitech</p>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[['12', 'questions'], ['5 min', 'durée']].map(([num, lbl]) => (
              <div key={lbl} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-800">{num}</p>
                <p className="text-xs text-gray-400 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Comment ça marche ?</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Connecte-toi avec Google, réponds aux questions sur Epitech et grimpe dans le classement !
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-indigo-400 text-gray-700 font-semibold py-4 rounded-2xl text-sm transition-all shadow-sm hover:shadow-md"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            Continuer avec Google
          </button>
        </div>
      </div>
    </div>
  )
}