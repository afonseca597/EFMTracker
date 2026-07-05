import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast, { Toaster } from 'react-hot-toast'

const camposVazios = { nome: '', ano_academico: '' }

export default function Turmas() {
  const [turmas, setTurmas] = useState([])
  const [alunos, setAlunos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalAlunosAberto, setModalAlunosAberto] = useState(false)
  const [turmaAtual, setTurmaAtual] = useState(camposVazios)
  const [turmaAlunosSelecionada, setTurmaAlunosSelecionada] = useState(null)
  const [alunosTurma, setAlunosTurma] = useState([])
  const [modoEdicao, setModoEdicao] = useState(false)

  useEffect(() => {
    fetchTurmas()
    fetchAlunos()
  }, [])

  const fetchTurmas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('turmas')
      .select('*, turma_alunos(aluno_nim)')
      .order('nome')
    if (error) toast.error('Erro ao carregar turmas')
    else setTurmas(data)
    setLoading(false)
  }

  const fetchAlunos = async () => {
    const { data } = await supabase.from('alunos').select('nim, nome').order('nome')
    setAlunos(data || [])
  }

  const fetchAlunosTurma = async (turmaId) => {
    const { data } = await supabase
      .from('turma_alunos')
      .select('aluno_nim')
      .eq('turma_id', turmaId)
    setAlunosTurma(data?.map(d => d.aluno_nim) || [])
  }

  const abrirModalNovo = () => {
    setTurmaAtual(camposVazios)
    setModoEdicao(false)
    setModalAberto(true)
  }

  const abrirModalEdicao = (turma) => {
    setTurmaAtual({ nome: turma.nome, ano_academico: turma.ano_academico, id: turma.id })
    setModoEdicao(true)
    setModalAberto(true)
  }

  const abrirModalAlunos = async (turma) => {
    setTurmaAlunosSelecionada(turma)
    await fetchAlunosTurma(turma.id)
    setModalAlunosAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setTurmaAtual(camposVazios)
  }

  const fecharModalAlunos = () => {
    setModalAlunosAberto(false)
    setTurmaAlunosSelecionada(null)
    setAlunosTurma([])
  }

  const handleChange = (e) => {
    setTurmaAtual({ ...turmaAtual, [e.target.name]: e.target.value })
  }

  const handleGuardar = async () => {
    if (!turmaAtual.nome) {
      toast.error('O nome é obrigatório')
      return
    }

    if (modoEdicao) {
      const { error } = await supabase
        .from('turmas')
        .update({ nome: turmaAtual.nome, ano_academico: turmaAtual.ano_academico })
        .eq('id', turmaAtual.id)
      if (error) toast.error('Erro ao atualizar turma')
      else { toast.success('Turma atualizada'); fetchTurmas(); fecharModal() }
    } else {
      const { error } = await supabase
        .from('turmas')
        .insert({ nome: turmaAtual.nome, ano_academico: turmaAtual.ano_academico })
      if (error) toast.error('Erro ao criar turma')
      else { toast.success('Turma criada'); fetchTurmas(); fecharModal() }
    }
  }

  const handleRemover = async (id) => {
    if (!confirm('Tens a certeza que queres remover esta turma?')) return
    const { error } = await supabase.from('turmas').delete().eq('id', id)
    if (error) toast.error('Erro ao remover turma')
    else { toast.success('Turma removida'); fetchTurmas() }
  }

  const toggleAluno = (nim) => {
    setAlunosTurma(prev =>
      prev.includes(nim) ? prev.filter(n => n !== nim) : [...prev, nim]
    )
  }

  const handleGuardarAlunos = async () => {
    const turmaId = turmaAlunosSelecionada.id

    await supabase.from('turma_alunos').delete().eq('turma_id', turmaId)

    if (alunosTurma.length > 0) {
      const rows = alunosTurma.map(nim => ({ turma_id: turmaId, aluno_nim: nim }))
      const { error } = await supabase.from('turma_alunos').insert(rows)
      if (error) { toast.error('Erro ao guardar alunos'); return }
    }

    toast.success('Alunos da turma atualizados')
    fetchTurmas()
    fecharModalAlunos()
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Turmas</h2>
        <button
          onClick={abrirModalNovo}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + Nova turma
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">A carregar...</p>
      ) : turmas.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhuma turma registada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Nome</th>
                <th className="pb-2 pr-4">Ano académico</th>
                <th className="pb-2 pr-4">Nº alunos</th>
                <th className="pb-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map(turma => (
                <tr key={turma.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4">{turma.nome}</td>
                  <td className="py-2 pr-4">{turma.ano_academico}</td>
                  <td className="py-2 pr-4">{turma.turma_alunos?.length || 0}</td>
                  <td className="py-2 flex gap-2">
                    <button onClick={() => abrirModalAlunos(turma)} className="text-green-600 hover:underline text-xs">Alunos</button>
                    <button onClick={() => abrirModalEdicao(turma)} className="text-blue-600 hover:underline text-xs">Editar</button>
                    <button onClick={() => handleRemover(turma.id)} className="text-red-500 hover:underline text-xs">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal criar/editar turma */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{modoEdicao ? 'Editar turma' : 'Nova turma'}</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  name="nome"
                  value={turmaAtual.nome}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ano académico</label>
                <input
                  type="text"
                  name="ano_academico"
                  value={turmaAtual.ano_academico}
                  onChange={handleChange}
                  placeholder="Ex: 2024/2025"
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={fecharModal} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
              <button onClick={handleGuardar} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal gerir alunos da turma */}
      {modalAlunosAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-1">Alunos — {turmaAlunosSelecionada?.nome}</h3>
            <p className="text-xs text-gray-500 mb-4">Seleciona os alunos que pertencem a esta turma</p>
            <div className="flex-1 overflow-y-auto border rounded-md divide-y">
              {alunos.map(aluno => (
                <label key={aluno.nim} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alunosTurma.includes(aluno.nim)}
                    onChange={() => toggleAluno(aluno.nim)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{aluno.nome}</span>
                  <span className="text-xs text-gray-400 ml-auto font-mono">{aluno.nim}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={fecharModalAlunos} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
              <button onClick={handleGuardarAlunos} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
