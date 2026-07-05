import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Alunos from './admin/Alunos'
import Instrutores from './admin/Instrutores'
import Turmas from './admin/Turmas'

export default function Dashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('inicio')

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const menuAdmin = [
    { key: 'inicio', label: 'Início' },
    { key: 'alunos', label: 'Alunos' },
    { key: 'instrutores', label: 'Instrutores' },
    { key: 'turmas', label: 'Turmas' },
  ]

  const menuInstrutor = [
    { key: 'inicio', label: 'Início' },
    { key: 'alunos', label: 'Alunos' },
  ]

  const menuAluno = [
    { key: 'inicio', label: 'Início' },
    { key: 'avaliacoes', label: 'As minhas avaliações' },
  ]

  const menu = profile?.role === 'admin' ? menuAdmin
    : profile?.role === 'instrutor' ? menuInstrutor
    : menuAluno

  const roleLabel = {
    admin: 'Administrador',
    instrutor: 'Instrutor',
    aluno: 'Aluno'
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-white shadow-sm flex flex-col">
        <div className="px-6 py-5 border-b">
          <h1 className="text-lg font-bold text-gray-800">EFM Tracker</h1>
          <p className="text-xs text-gray-500 mt-1">Academia Militar</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {menu.map(item => (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activePage === item.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-6 py-4 border-t">
          <p className="text-xs text-gray-500">{profile?.nome}</p>
          <p className="text-xs text-gray-400">{roleLabel[profile?.role]}</p>
          <button
            onClick={handleSignOut}
            className="mt-2 text-xs text-red-500 hover:text-red-700"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        {activePage === 'inicio' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-2">
              Bem-vindo, {profile?.nome}
            </h2>
            <p className="text-gray-500">
              Seleciona uma opção no menu lateral para começar.
            </p>
          </div>
        )}

        {activePage === 'alunos' && <Alunos />}
        {activePage === 'instrutores' && <Instrutores />}
        {activePage === 'turmas' && <Turmas />}

        {activePage === 'avaliacoes' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">As minhas avaliações</h2>
            <p className="text-gray-400 text-sm">A construir...</p>
          </div>
        )}
      </main>
    </div>
  )
}
