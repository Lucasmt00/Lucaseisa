
import { useEffect, useState, type FormEvent } from "react";
import "./style.css";

type TipoConvidado = "Adulto" | "Adolescente" | "Criança";
type StatusMeta = "Pendente" | "Concluída";

type Convidado = {
  id: string;
  nome: string;
  tipo: TipoConvidado;
  lista: string;
};

type Item = {
  id: string;
  nome: string;
  comprado: boolean;
};

type Ambiente = {
  id: string;
  nome: string;
  itens: Item[];
};

type Meta = {
  id: string;
  titulo: string;
  descricao: string;
  prazo: string;
  status: StatusMeta;
};

type Dados = {
  convidados: Convidado[];
  listas: string[];
  ambientes: Ambiente[];
  metas: Meta[];
};

const CHAVE = "projeto-lucas-e-isa";

const ambientesIniciais: Ambiente[] = [
  { id: "sala", nome: "Sala", itens: [] },
  { id: "quarto", nome: "Quarto", itens: [] },
  { id: "cozinha", nome: "Cozinha", itens: [] },
  { id: "banheiro", nome: "Banheiro", itens: [] },
  { id: "lavanderia", nome: "Lavanderia", itens: [] },
  { id: "outros", nome: "Outros", itens: [] },
];

function carregarDados(): Dados {
  try {
    const salvo = localStorage.getItem(CHAVE);

    if (salvo) {
      const dados = JSON.parse(salvo) as Partial<Dados>;

      return {
        convidados: dados.convidados ?? [],
        listas: dados.listas ?? [],
        ambientes: dados.ambientes ?? ambientesIniciais,
        metas: dados.metas ?? [],
      };
    }
  } catch {
    // Usa os valores iniciais caso os dados estejam inválidos.
  }

  return {
    convidados: [],
    listas: [],
    ambientes: ambientesIniciais,
    metas: [],
  };
}

function novoId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatarData(data: string): string {
  if (!data) return "Sem prazo definido";

  const partes = data.split("-");
  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export default function App() {
  const [dados, setDados] = useState<Dados>(carregarDados);
  const [aba, setAba] = useState<"convidados" | "casa" | "metas">(
    "convidados",
  );

  const [listaAtiva, setListaAtiva] = useState("Todos");
  const [ambienteAtivo, setAmbienteAtivo] = useState("cozinha");

  const [nomeConvidado, setNomeConvidado] = useState("");
  const [tipoConvidado, setTipoConvidado] =
    useState<TipoConvidado>("Adulto");
  const [listaNova, setListaNova] = useState("");
  const [editandoConvidado, setEditandoConvidado] = useState<string | null>(
    null,
  );

  const [nomeItem, setNomeItem] = useState("");
  const [editandoItem, setEditandoItem] = useState<string | null>(null);
  const [mostrarFormItem, setMostrarFormItem] = useState(false);

  const [nomeAmbiente, setNomeAmbiente] = useState("");

  const [tituloMeta, setTituloMeta] = useState("");
  const [descricaoMeta, setDescricaoMeta] = useState("");
  const [prazoMeta, setPrazoMeta] = useState("");
  const [editandoMeta, setEditandoMeta] = useState<string | null>(null);
  const [filtroMeta, setFiltroMeta] = useState<"Todas" | StatusMeta>("Todas");
  const [mostrarFormMeta, setMostrarFormMeta] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(dados));
    } catch {
      // O app continua aberto mesmo se o armazenamento estiver indisponível.
    }
  }, [dados]);

  const convidadosVisiveis = dados.convidados.filter(
    (pessoa) => listaAtiva === "Todos" || pessoa.lista === listaAtiva,
  );

  const ambiente = dados.ambientes.find((item) => item.id === ambienteAtivo);

  const totalItens = dados.ambientes.reduce(
    (total, item) => total + item.itens.length,
    0,
  );

  const itensComprados = dados.ambientes.reduce(
    (total, item) =>
      total + item.itens.filter((produto) => produto.comprado).length,
    0,
  );

  const progressoCompras =
    totalItens === 0 ? 0 : Math.round((itensComprados / totalItens) * 100);

  const metasConcluidas = dados.metas.filter(
    (meta) => meta.status === "Concluída",
  ).length;

  const metasPendentes = dados.metas.length - metasConcluidas;

  const metasVisiveis = dados.metas.filter(
    (meta) => filtroMeta === "Todas" || meta.status === filtroMeta,
  );

  const progressoMetas =
    dados.metas.length === 0
      ? 0
      : Math.round((metasConcluidas / dados.metas.length) * 100);

  function salvarConvidado(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nome = nomeConvidado.trim();
    if (!nome) return;

    if (editandoConvidado) {
      setDados((anterior) => ({
        ...anterior,
        convidados: anterior.convidados.map((pessoa) =>
          pessoa.id === editandoConvidado
            ? { ...pessoa, nome, tipo: tipoConvidado }
            : pessoa,
        ),
      }));
    } else {
      setDados((anterior) => ({
        ...anterior,
        convidados: [
          ...anterior.convidados,
          {
            id: novoId(),
            nome,
            tipo: tipoConvidado,
            lista: listaAtiva === "Todos" ? "Todos" : listaAtiva,
          },
        ],
      }));
    }

    setNomeConvidado("");
    setTipoConvidado("Adulto");
    setEditandoConvidado(null);
  }

  function editarConvidado(pessoa: Convidado) {
    setNomeConvidado(pessoa.nome);
    setTipoConvidado(pessoa.tipo);
    setEditandoConvidado(pessoa.id);
  }

  function excluirConvidado(id: string) {
    if (!confirm("Deseja excluir este convidado?")) return;

    setDados((anterior) => ({
      ...anterior,
      convidados: anterior.convidados.filter((pessoa) => pessoa.id !== id),
    }));
  }

  function criarLista(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nome = listaNova.trim();
    if (!nome || dados.listas.includes(nome)) return;

    setDados((anterior) => ({
      ...anterior,
      listas: [...anterior.listas, nome],
    }));

    setListaAtiva(nome);
    setListaNova("");
  }

  function excluirLista(nome: string) {
    if (!confirm(`Excluir a lista "${nome}"?`)) return;

    setDados((anterior) => ({
      ...anterior,
      listas: anterior.listas.filter((lista) => lista !== nome),
      convidados: anterior.convidados.map((pessoa) =>
        pessoa.lista === nome ? { ...pessoa, lista: "Todos" } : pessoa,
      ),
    }));

    if (listaAtiva === nome) setListaAtiva("Todos");
  }

  function criarAmbiente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nome = nomeAmbiente.trim();
    if (!nome) return;

    const novo: Ambiente = { id: novoId(), nome, itens: [] };

    setDados((anterior) => ({
      ...anterior,
      ambientes: [...anterior.ambientes, novo],
    }));

    setAmbienteAtivo(novo.id);
    setNomeAmbiente("");
  }

  function excluirAmbiente(item: Ambiente) {
    if (!confirm(`Excluir "${item.nome}" e todos os seus itens?`)) return;

    const restantes = dados.ambientes.filter((a) => a.id !== item.id);

    setDados((anterior) => ({
      ...anterior,
      ambientes: restantes,
    }));

    if (ambienteAtivo === item.id) {
      setAmbienteAtivo(restantes[0]?.id ?? "");
    }
  }

  function salvarItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nome = nomeItem.trim();
    if (!nome || !ambiente) return;

    setDados((anterior) => ({
      ...anterior,
      ambientes: anterior.ambientes.map((a) => {
        if (a.id !== ambiente.id) return a;

        if (editandoItem) {
          return {
            ...a,
            itens: a.itens.map((produto) =>
              produto.id === editandoItem ? { ...produto, nome } : produto,
            ),
          };
        }

        return {
          ...a,
          itens: [...a.itens, { id: novoId(), nome, comprado: false }],
        };
      }),
    }));

    setNomeItem("");
    setEditandoItem(null);
    setMostrarFormItem(false);
  }

  function marcarItem(id: string) {
    if (!ambiente) return;

    setDados((anterior) => ({
      ...anterior,
      ambientes: anterior.ambientes.map((a) =>
        a.id !== ambiente.id
          ? a
          : {
              ...a,
              itens: a.itens.map((produto) =>
                produto.id === id
                  ? { ...produto, comprado: !produto.comprado }
                  : produto,
              ),
            },
      ),
    }));
  }

  function excluirItem(id: string) {
    if (!ambiente) return;

    setDados((anterior) => ({
      ...anterior,
      ambientes: anterior.ambientes.map((a) =>
        a.id === ambiente.id
          ? { ...a, itens: a.itens.filter((produto) => produto.id !== id) }
          : a,
      ),
    }));
  }

  function limparFormularioMeta() {
    setTituloMeta("");
    setDescricaoMeta("");
    setPrazoMeta("");
    setEditandoMeta(null);
    setMostrarFormMeta(false);
  }

  function salvarMeta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const titulo = tituloMeta.trim();
    const descricao = descricaoMeta.trim();

    if (!titulo) return;

    if (editandoMeta) {
      setDados((anterior) => ({
        ...anterior,
        metas: anterior.metas.map((meta) =>
          meta.id === editandoMeta
            ? { ...meta, titulo, descricao, prazo: prazoMeta }
            : meta,
        ),
      }));
    } else {
      const novaMeta: Meta = {
        id: novoId(),
        titulo,
        descricao,
        prazo: prazoMeta,
        status: "Pendente",
      };

      setDados((anterior) => ({
        ...anterior,
        metas: [...anterior.metas, novaMeta],
      }));
    }

    limparFormularioMeta();
  }

  function editarMeta(meta: Meta) {
    setTituloMeta(meta.titulo);
    setDescricaoMeta(meta.descricao);
    setPrazoMeta(meta.prazo);
    setEditandoMeta(meta.id);
    setMostrarFormMeta(true);
  }

  function alternarStatusMeta(id: string) {
    setDados((anterior) => ({
      ...anterior,
      metas: anterior.metas.map((meta) =>
        meta.id === id
          ? {
              ...meta,
              status:
                meta.status === "Concluída" ? "Pendente" : "Concluída",
            }
          : meta,
      ),
    }));
  }

  function excluirMeta(id: string) {
    if (!confirm("Deseja excluir esta meta?")) return;

    setDados((anterior) => ({
      ...anterior,
      metas: anterior.metas.filter((meta) => meta.id !== id),
    }));
  }

  return (
    <div className="app">
      <header className="topo">
        <a className="marca" href="#inicio">
          <span className="marca-icone">L♡I</span>
          <span>
            <strong>Lucas &amp; Isa</strong>
            <small>nosso futuro, juntos</small>
          </span>
        </a>

        <nav className="navegacao">
          <button
            className={aba === "convidados" ? "ativo" : ""}
            onClick={() => setAba("convidados")}
          >
            ♡ Convidados
          </button>
          <button
            className={aba === "casa" ? "ativo" : ""}
            onClick={() => setAba("casa")}
          >
            ⌂ Nossa casa
          </button>
          <button
            className={aba === "metas" ? "ativo" : ""}
            onClick={() => setAba("metas")}
          >
            ✧ Metas
          </button>
        </nav>
      </header>

      <main id="inicio" className="conteudo">
        <section className="hero">
          <div>
            <p className="sobretitulo">UM SONHO SENDO CONSTRUÍDO A DOIS</p>
            <h1>
              Projeto <em>Lucas e Isa</em>
            </h1>
            <p>
              Cada detalhe é um pedacinho do nosso futuro. Vamos organizar
              tudo com carinho?
            </p>
            <span className="frase">♡ Feito com amor, pensado para nós</span>
          </div>

          <div className="desenho" aria-hidden="true">
            <span>♡</span>
            <div>⌂</div>
            <small>nosso lar</small>
          </div>
        </section>

        <section className="estatisticas">
          <article>
            <span>♡</span>
            <div>
              <small>Convidados</small>
              <strong>{dados.convidados.length}</strong>
            </div>
          </article>
          <article>
            <span>⌂</span>
            <div>
              <small>Itens para casa</small>
              <strong>{itensComprados}/{totalItens}</strong>
            </div>
          </article>
          <article>
            <span>✧</span>
            <div>
              <small>Metas concluídas</small>
              <strong>{metasConcluidas}/{dados.metas.length}</strong>
            </div>
          </article>
        </section>

        {aba === "convidados" && (
          <section className="secao">
            <p className="sobretitulo">ORGANIZAÇÃO DA CELEBRAÇÃO</p>
            <h2>Nossa lista de convidados</h2>
            <p className="descricao">
              Todo mundo especial reunido em um só lugar.
            </p>

            <div className="colunas">
              <aside className="cartao">
                <h3>♡ Listas</h3>

                <button
                  className={`botao-lista ${listaAtiva === "Todos" ? "selecionado" : ""}`}
                  onClick={() => setListaAtiva("Todos")}
                >
                  Todos os convidados
                  <span>{dados.convidados.length}</span>
                </button>

                {dados.listas.map((lista) => (
                  <div className="linha-lista" key={lista}>
                    <button
                      className={`botao-lista ${listaAtiva === lista ? "selecionado" : ""}`}
                      onClick={() => setListaAtiva(lista)}
                    >
                      {lista}
                      <span>
                        {dados.convidados.filter((p) => p.lista === lista).length}
                      </span>
                    </button>
                    <button
                      className="botao-excluir"
                      onClick={() => excluirLista(lista)}
                      title="Excluir lista"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <form className="form-lista" onSubmit={criarLista}>
                  <input
                    value={listaNova}
                    onChange={(e) => setListaNova(e.target.value)}
                    placeholder="Nova lista"
                    aria-label="Nome da nova lista"
                  />
                  <button type="submit">Criar</button>
                </form>
              </aside>

              <section className="cartao">
                <h3>
                  {listaAtiva === "Todos"
                    ? "Todos os convidados"
                    : listaAtiva}
                </h3>

                <form className="formulario" onSubmit={salvarConvidado}>
                  <label>
                    Nome
                    <input
                      value={nomeConvidado}
                      onChange={(e) => setNomeConvidado(e.target.value)}
                      placeholder="Ex.: Maria Oliveira"
                      required
                    />
                  </label>

                  <label>
                    Categoria
                    <select
                      value={tipoConvidado}
                      onChange={(e) =>
                        setTipoConvidado(e.target.value as TipoConvidado)
                      }
                    >
                      <option>Adulto</option>
                      <option>Adolescente</option>
                      <option>Criança</option>
                    </select>
                  </label>

                  <button className="primario" type="submit">
                    {editandoConvidado ? "Salvar" : "+ Adicionar"}
                  </button>

                  {editandoConvidado && (
                    <button
                      className="secundario"
                      type="button"
                      onClick={() => {
                        setEditandoConvidado(null);
                        setNomeConvidado("");
                        setTipoConvidado("Adulto");
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </form>

                {convidadosVisiveis.length === 0 ? (
                  <div className="vazio">
                    <span>♡</span>
                    <h3>A lista começa com um nome</h3>
                    <p>Adicione a primeira pessoa especial acima.</p>
                  </div>
                ) : (
                  convidadosVisiveis.map((pessoa) => (
                    <article className="linha-convidado" key={pessoa.id}>
                      <div className="avatar">
                        {pessoa.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="info-convidado">
                        <strong>{pessoa.nome}</strong>
                        <small>{pessoa.tipo}</small>
                        {pessoa.lista !== "Todos" && (
                          <small>Lista: {pessoa.lista}</small>
                        )}
                      </div>
                      <button
                        className="botao-editar"
                        onClick={() => editarConvidado(pessoa)}
                        title="Editar"
                      >
                        ✎
                      </button>
                      <button
                        className="botao-excluir"
                        onClick={() => excluirConvidado(pessoa.id)}
                        title="Excluir"
                      >
                        ×
                      </button>
                    </article>
                  ))
                )}
              </section>
            </div>
          </section>
        )}

        {aba === "casa" && (
          <section className="secao">
            <p className="sobretitulo">NOSSO CANTINHO</p>
            <h2>Preparando a nossa casa</h2>
            <p className="descricao">
              Cada item é um passo para construir nosso lar.
            </p>

            <section className="cartao progresso">
              <div className="progresso-topo">
                <h3>♡ Um lar, muitos sonhos</h3>
                <strong>{progressoCompras}%</strong>
              </div>
              <div className="barra">
                <span style={{ width: `${progressoCompras}%` }} />
              </div>
              <small>
                {itensComprados} de {totalItens} itens comprados
              </small>
            </section>

            <div className="colunas casa-colunas">
              <aside className="cartao">
                <h3>⌂ Ambientes</h3>

                {dados.ambientes.map((a) => (
                  <div className="linha-lista" key={a.id}>
                    <button
                      className={`botao-lista ${ambienteAtivo === a.id ? "selecionado" : ""}`}
                      onClick={() => {
                        setAmbienteAtivo(a.id);
                        setMostrarFormItem(false);
                        setEditandoItem(null);
                        setNomeItem("");
                      }}
                    >
                      {a.nome}
                      <span>{a.itens.length}</span>
                    </button>
                    <button
                      className="botao-excluir"
                      onClick={() => excluirAmbiente(a)}
                      title={`Excluir ${a.nome}`}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <form className="form-lista" onSubmit={criarAmbiente}>
                  <input
                    value={nomeAmbiente}
                    onChange={(e) => setNomeAmbiente(e.target.value)}
                    placeholder="Novo ambiente"
                    aria-label="Nome do ambiente"
                  />
                  <button type="submit">Criar</button>
                </form>
              </aside>

              <section className="cartao">
                <div className="titulo-itens">
                  <h3>{ambiente?.nome ?? "Ambiente"}</h3>
                  <button
                    className="primario"
                    onClick={() => {
                      setMostrarFormItem(!mostrarFormItem);
                      setEditandoItem(null);
                      setNomeItem("");
                    }}
                  >
                    + Adicionar item
                  </button>
                </div>

                {mostrarFormItem && ambiente && (
                  <form className="form-item" onSubmit={salvarItem}>
                    <input
                      value={nomeItem}
                      onChange={(e) => setNomeItem(e.target.value)}
                      placeholder="Ex.: jogo de panelas"
                      aria-label="Nome do item"
                      required
                      autoFocus
                    />
                    <button className="primario" type="submit">
                      {editandoItem ? "Salvar" : "Adicionar"}
                    </button>
                    <button
                      className="secundario"
                      type="button"
                      onClick={() => {
                        setMostrarFormItem(false);
                        setEditandoItem(null);
                        setNomeItem("");
                      }}
                    >
                      Cancelar
                    </button>
                  </form>
                )}

                {!ambiente || ambiente.itens.length === 0 ? (
                  <div className="vazio">
                    <span>⌂</span>
                    <h3>Vamos começar por aqui</h3>
                    <p>Adicione os itens que vocês querem para esse ambiente.</p>
                  </div>
                ) : (
                  ambiente.itens.map((produto) => (
                    <article className="linha-item" key={produto.id}>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={produto.comprado}
                          onChange={() => marcarItem(produto.id)}
                        />
                        <span
                          className={
                            produto.comprado
                              ? "nome-item comprado"
                              : "nome-item"
                          }
                        >
                          {produto.nome}
                        </span>
                      </label>
                      <button
                        className="botao-editar"
                        onClick={() => {
                          setNomeItem(produto.nome);
                          setEditandoItem(produto.id);
                          setMostrarFormItem(true);
                        }}
                        title="Editar"
                      >
                        ✎
                      </button>
                      <button
                        className="botao-excluir"
                        onClick={() => excluirItem(produto.id)}
                        title="Excluir"
                      >
                        ×
                      </button>
                    </article>
                  ))
                )}
              </section>
            </div>
          </section>
        )}

        {aba === "metas" && (
          <section className="secao">
            <p className="sobretitulo">PASSO A PASSO, JUNTOS</p>
            <h2>Nossas metas</h2>
            <p className="descricao">
              Grandes sonhos começam com pequenos passos. ♡
            </p>

            <section className="cartao progresso">
              <div className="progresso-topo">
                <div>
                  <h3>Nosso progresso</h3>
                  <p className="texto-suave">
                    Cada meta concluída é uma conquista de vocês.
                  </p>
                </div>
                <strong>{progressoMetas}%</strong>
              </div>

              <div className="barra">
                <span style={{ width: `${progressoMetas}%` }} />
              </div>

              <div className="resumo-metas">
                <span>♡ {dados.metas.length} metas no total</span>
                <span>○ {metasPendentes} pendentes</span>
                <span>✓ {metasConcluidas} concluídas</span>
              </div>
            </section>

            <div className="cabecalho-metas">
              <div>
                <h3>Objetivos de vocês</h3>
                <p className="texto-suave">
                  Criem, acompanhem e comemorem cada conquista.
                </p>
              </div>
              <button
                className="primario"
                onClick={() => {
                  if (mostrarFormMeta) {
                    limparFormularioMeta();
                  } else {
                    setMostrarFormMeta(true);
                  }
                }}
              >
                {mostrarFormMeta ? "Cancelar" : "+ Criar meta"}
              </button>
            </div>

            {mostrarFormMeta && (
              <form className="cartao formulario-meta" onSubmit={salvarMeta}>
                <h3>{editandoMeta ? "Editar meta" : "Criar uma nova meta"}</h3>

                <label>
                  Nome da meta *
                  <input
                    value={tituloMeta}
                    onChange={(e) => setTituloMeta(e.target.value)}
                    placeholder="Ex.: Comprar os móveis da sala"
                    required
                    maxLength={100}
                  />
                </label>

                <label>
                  Descrição
                  <textarea
                    value={descricaoMeta}
                    onChange={(e) => setDescricaoMeta(e.target.value)}
                    placeholder="Escrevam os detalhes dessa meta..."
                    rows={3}
                    maxLength={500}
                  />
                </label>

                <label>
                  Prazo (opcional)
                  <input
                    type="date"
                    value={prazoMeta}
                    onChange={(e) => setPrazoMeta(e.target.value)}
                  />
                </label>

                <div className="acoes-formulario">
                  <button className="primario" type="submit">
                    {editandoMeta ? "Salvar alterações" : "Criar meta"}
                  </button>
                  <button
                    className="secundario"
                    type="button"
                    onClick={limparFormularioMeta}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="filtros-metas">
              {(["Todas", "Pendente", "Concluída"] as const).map((filtro) => (
                <button
                  key={filtro}
                  className={filtroMeta === filtro ? "filtro ativo" : "filtro"}
                  onClick={() => setFiltroMeta(filtro)}
                >
                  {filtro}
                  {filtro === "Todas" && (
                    <span>{dados.metas.length}</span>
                  )}
                  {filtro === "Pendente" && <span>{metasPendentes}</span>}
                  {filtro === "Concluída" && <span>{metasConcluidas}</span>}
                </button>
              ))}
            </div>

            {metasVisiveis.length === 0 ? (
              <div className="cartao vazio">
                <span>✧</span>
                <h3>
                  {filtroMeta === "Todas"
                    ? "Todo sonho merece um plano"
                    : `Nenhuma meta ${filtroMeta.toLowerCase()} por aqui`}
                </h3>
                <p>
                  {filtroMeta === "Todas"
                    ? "Criem a primeira meta e comecem a organizar seus sonhos."
                    : "Experimentem outro filtro ou criem uma nova meta."}
                </p>
                {filtroMeta === "Todas" && (
                  <button
                    className="primario botao-vazio"
                    onClick={() => setMostrarFormMeta(true)}
                  >
                    + Criar primeira meta
                  </button>
                )}
              </div>
            ) : (
              <div className="grade-metas">
                {metasVisiveis.map((meta) => (
                  <article
                    className={`cartao card-meta ${meta.status === "Concluída" ? "meta-concluida" : ""}`}
                    key={meta.id}
                  >
                    <div className="meta-topo">
                      <span className="icone-meta">
                        {meta.status === "Concluída" ? "✓" : "✧"}
                      </span>
                      <span
                        className={
                          meta.status === "Concluída"
                            ? "status status-concluida"
                            : "status status-pendente"
                        }
                      >
                        {meta.status}
                      </span>
                    </div>

                    <h3>{meta.titulo}</h3>

                    {meta.descricao && (
                      <p className="descricao-meta">{meta.descricao}</p>
                    )}

                    <p className="prazo-meta">
                      <span>▦</span> Prazo: {formatarData(meta.prazo)}
                    </p>

                    <div className="acoes-meta">
                      <button
                        className="primario"
                        onClick={() => alternarStatusMeta(meta.id)}
                      >
                        {meta.status === "Concluída"
                          ? "↶ Reabrir meta"
                          : "✓ Marcar concluída"}
                      </button>
                      <button
                        className="botao-editar"
                        onClick={() => editarMeta(meta)}
                        title="Editar meta"
                      >
                        ✎
                      </button>
                      <button
                        className="botao-excluir"
                        onClick={() => excluirMeta(meta.id)}
                        title="Excluir meta"
                      >
                        ×
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="rodape">
        <span>Feito com carinho, para o nosso futuro. ♡</span>
        <span>Projeto Lucas e Isa</span>
      </footer>
    </div>
  );
}
