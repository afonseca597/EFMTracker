import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast, { Toaster } from 'react-hot-toast'

const camposVazios = {
  nim: '', numero_corpo: '', posto: '', nome: '',
  ramo: '', curso: '', data_nascimento: '', email: '', contacto: ''
}

export default function Alunos() {
  const [alunos, setAlunos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [alunoAtual, setAlunoAtual] = useState(camposVazios)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [importando, setImportando] = useState(false)

  useEffect(() => {
    fetchAlunos()
  }, [])

  const fetchAlunos = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('alunos').select('*').order('nome')
    if (error) toast.error('Erro ao carregar alunos')
    else setAlunos(data)
    setLoading(false)
  }

  const abrirModalNovo = () => {
    setAlunoAtual(camposVazios)
    setModoEdicao(false)
    setModalAberto(true)
  }

  const abrirModalEdicao = (aluno) => {
    setAlunoAtual(aluno)
    setModoEdicao(true)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setAlunoAtual(camposVazios)
  }

  const handleChange = (e) => {
    setAlunoAtual({ ...alunoAtual, [e.target.name]: e.target.value })
  }

  const handleGuardar = async () => {
    if (!alunoAtual.nim || !alunoAtual.nome) {
      toast.error('NIM e Nome são obrigatórios')
      return
    }

    if (modoEdicao) {
      const { error } = await supabase
        .from('alunos')
        .update(alunoAtual)
        .eq('nim', alunoAtual.nim)
      if (error) toast.error('Erro ao atualizar aluno')
      else { toast.success('Aluno atualizado'); fetchAlunos(); fecharModal() }
    } else {
      const { error } = await supabase.from('alunos').insert(alunoAtual)
      if (error) {
        if (error.code === '23505') toast.error('Já existe um aluno com este NIM')
        else toast.error('Erro ao criar aluno')
      } else { toast.success('Aluno criado'); fetchAlunos(); fecharModal() }
    }
  }

  const handleRemover = async (nim) => {
    if (!confirm('Tens a certeza que queres remover este aluno?')) return
    const { error } = await supabase.from('alunos').delete().eq('nim', nim)
    if (error) toast.error('Erro ao remover aluno')
    else { toast.success('Aluno removido'); fetchAlunos() }
  }

  const handleImportarExcel = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImportando(true)

    const { read, utils } = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb = read(buffer)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = utils.sheet_to_json(ws)

    let inseridos = 0
    let erros = 0

    for (const row of rows) {
      const aluno = {
        nim: String(row['NIM'] || '').trim(),
        numero_corpo: String(row['Nº de Corpo'] || '').trim(),
        posto: String(row['Posto'] || '').trim(),
        nome: String(row['Nome completo'] || '').trim(),
        ramo: String(row['Ramo'] || '').trim(),
        curso: String(row['Curso'] || '').trim(),
        data_nascimento: row['Data de nascimento'] || null,
        email: String(row['Email'] || '').trim(),
        contacto: String(row['Contacto'] || '').trim(),
      }

      if (!aluno.nim || !aluno.nome) { erros++; continue }

      const { error } = await supabase.from('alunos').upsert(aluno, { onConflict: 'nim' })
      if (error) erros++
      else inseridos++
    }

    toast.success(`Importação concluída: ${inseridos} alunos importados, ${erros} erros`)
    fetchAlunos()
    setImportando(false)
    e.target.value = ''
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Alunos</h2>
        <div className="flex gap-2">
          <label className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 ${importando ? 'opacity-50' : ''}`}>
            {importando ? 'A importar...' : 'Importar Excel'}
            <input type="file" accept=".xlsx" className="hidden" onChange={handleImportarExcel} disabled={importando} />
          </label>
          <button
            onClick={abrirModalNovo}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            + Novo aluno
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">A carregar...</p>
      ) : alunos.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhum aluno registado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">NIM</th>
                <th className="pb-2 pr-4">Nome</th>
                <th className="pb-2 pr-4">Posto</th>
                <th className="pb-2 pr-4">Curso</th>
                <th className="pb-2 pr-4">Ramo</th>
                <th className="pb-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map(aluno => (
                <tr key={aluno.nim} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4 font-mono">{aluno.nim}</td>
                  <td className="py-2 pr-4">{aluno.nome}</td>
                  <td className="py-2 pr-4">{aluno.posto}</td>
                  <td className="py-2 pr-4">{aluno.curso}</td>
                  <td className="py-2 pr-4">{aluno.ramo}</td>
                  <td className="py-2 flex gap-2">
                    <button onClick={() => abrirModalEdicao(aluno)} className="text-blue-600 hover:underline text-xs">Editar</button>
                    <button onClick={() => handleRemover(aluno.nim)} className="text-red-500 hover:underline text-xs">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{modoEdicao ? 'Editar aluno' : 'Novo aluno'}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'nim', label: 'NIM *', disabled: modoEdicao },
                { name: 'numero_corpo', label: 'Nº de Corpo' },
                { name: 'posto', label: 'Posto' },
                { name: 'nome', label: 'Nome completo *' },
                { name: 'ramo', label: 'Ramo' },
                { name: 'curso', label: 'Curso' },
                { name: 'data_nascimento', label: 'Data de nascimento', type: 'date' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'contacto', label: 'Contacto' },
              ].map(campo => (
                <div key={campo.name} className={campo.name === 'nome' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{campo.label}</label>
                  <input
                    type={campo.type || 'text'}
                    name={campo.name}
                    value={alunoAtual[campo.name] || ''}
                    onChange={handleChange}
                    disabled={campo.disabled}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={fecharModal} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
              <button onClick={handleGuardar} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
