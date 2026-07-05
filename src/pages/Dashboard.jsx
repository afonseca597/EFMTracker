import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const roleLabel = {
    admin: 'Administrador',
    instrutor: 'Instrutor',
    aluno: 'Aluno'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-800">EFM Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {profile?.nome} · <span className="font-medium">{roleLabel[profile?.role]}</span>
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Sair
          </button>
        </div>
      </nav>

      <main className="p-6">
        {profile?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Painel do Administrador</h2>
            <p className="text-gray-500">Gestão de utilizadores, turmas e avaliações.</p>
          </div>
        )}

        {profile?.role === 'instrutor' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Painel do Instrutor</h2>
            <p className="text-gray-500">Inserção e consulta de avaliações.</p>
          </div>
        )}

        {profile?.role === 'aluno' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Painel do Aluno</h2>
            <p className="text-gray-500">Consulta das tuas avaliações.</p>
          </div>
        )}
      </main>
    </div>
  )
}
