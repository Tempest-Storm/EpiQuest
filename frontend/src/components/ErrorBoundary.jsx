import { Component } from 'react'

// Catches render-time errors anywhere below it so a single bad component
// (e.g. malformed data) shows a friendly recovery screen instead of a blank
// white page. React only reports render errors to error boundaries via class
// components, hence this is a class rather than a hook.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-xl flex flex-col gap-4">
            <div className="text-3xl">⚠️</div>
            <p className="text-gray-700 text-sm">
              Une erreur inattendue est survenue. Recharge la page pour continuer.
            </p>
            <button
              onClick={() => { window.location.href = '/' }}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-2xl text-sm"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
