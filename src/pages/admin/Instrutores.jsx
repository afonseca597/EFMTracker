import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast, { Toaster } from 'react-hot-toast'

const camposVazios = {
  nim: '', posto: '', arma_servico: '', nome: ''
}

export default function Instrutores() {
  const [instrutores, setInstrutores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [instrutorAtual, setInstrutorAtual] = useState(camposVazios)
  const [modoEdicao, setModoEdicao] = useState(false)

  useEffect(() => {
    fetchInstrutores()
  }, [])

  const fetchInstrutores = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('instrutores').select('*').order('nome')
    if (error) toast.error('Erro ao carregar instrutores')
    else setInstrutores(data)
    setLoading(false)
  }

  const abrirModalNovo = () => {
    setInstrutorAtual(camposVazios)
    setModoEdicao(false)
    setModalAberto(true)
  }

  const abrirModalEdicao = (instrutor) => {
    setInstrutorAtual(instrutor)
    setModoEdicao(true)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setInstrutorAtual(camposVazios)
  }

  const handleChange = (e) => {
    setInstrutorAtual({ ...instrutorAtual, [e.target.name]: e.target.value })
  }

  const handleGuardar = async () => {
    if (!instrutorAtual.nim || !instrutorAtual.nome) {
      toast.error('NIM e Nome são obrigatórios')
      return
    }

    if (modoEdicao) {
      const { error } = await supabase
        .from('instrutores')
        .update(instrutorAtual)
        .eq('nim', instrutorAtual.nim)
      if (error) toast.error('Erro ao atualizar instrutor')
      else { toast.success('Instrutor atualizado'); fetchInstrutores(); fecharModal() }
    } else {
      const { error } = await supabase.from('instrutores').insert(instrutorAtual)
      if (error) {
        if (error.code === '23505') toast.error('Já existe um instrutor com este NIM')
        else toast.error('Erro ao criar instrutor')
      } else { toast.success('Instrutor criado'); fetchInstrutores(); fecharModal() }
    }
  }

  const handleRemover = async (nim) => {
    if (!confirm('Tens a certeza que queres remover este instrutor?')) return
    const { error } = await supabase.from('instrutores').delete().eq('nim', nim)
    if (error) toast.error('Erro ao remover instrutor')
    else { toast.success('Instrutor removido'); fetchInstrutores() }
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Instrutores</h2>
        <button
          onClick={abrirModalNovo}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + Novo instrutor
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">A carregar...</p>
      ) : instrutores.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhum instrutor registado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">NIM</th>
                <th className="pb-2 pr-4">Nome</th>
                <th className="pb-2 pr-4">Posto</th>
                <th className="pb-2 pr-4">Arma/Serviço</th>
                <th className="pb-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {instrutores.map(instrutor => (
                <tr key={instrutor.nim} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4 font-mono">{instrutor.nim}</td>
                  <td className="py-2 pr-4">{instrutor.nome}</td>
                  <td className="py-2 pr-4">{instrutor.posto}</td>
                  <td className="py-2 pr-4">{instrutor.arma_servico}</td>
                  <td className="py-2 flex gap-2">
                    <button onClick={() => abrirModalEdicao(instrutor)} className="text-blue-600 hover:underline text-xs">Editar</button>
                    <button onClick={() => handleRemover(instrutor.nim)} className="text-red-500 hover:underline text-xs">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{modoEdicao ? 'Editar instrutor' : 'Novo instrutor'}</h3>
            <div className="flex flex-col gap-3">
              {[
                { name: 'nim', label: 'NIM *', disabled: modoEdicao },
                { name: 'nome', label: 'Nome completo *' },
                { name: 'posto', label: 'Posto' },
                { name: 'arma_servico', label: 'Arma/Serviço' },
              ].map(campo => (
                <div key={campo.name}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{campo.label}</label>
                  <input
                    type="text"
                    name={campo.name}
                    value={instrutorAtual[campo.name] || ''}
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
