import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import TituloBotaoVoltar from "../components/BarraSuperior";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import {
  book,
  checkbox,
  checkmarkCircle,
  closeCircle,
  create,
  diamond,
  ellipse,
  grid,
  radio,
  radioButtonOff,
  reader,
  search,
  today,
  trash,
} from "ionicons/icons";
import { meses } from "../globalConstants/constantesGlobais";
import BarraInferior from "../components/BarraInferiorControles";

const PainelDeTarefas: React.FC = () => {
  const [estadoCarregamento, definirCarregamento] = useState(false);
  const [mostraFiltro, definirMostraFiltro] = useState<boolean>(false);
  const [linhasFiltro, defineLinhasFiltro] = useState([0]);
  const [tarefaFiltradas, definirTarefaFiltradas] = useState<Array<any>>();
  const [modal, mostraModal] = useState<boolean>(false);
  const [modalDel, mostraModalDel] = useState<boolean>(false);
  const [idTarefaSel, defIdTarefaSel] = useState<number>(0);

  const { executarAcaoSQL, iniciado, iniciaTabelas } = usaSQLiteDB();

  const quantidadeDeCards = tarefaFiltradas?.length;

  const respostaTarefasQuery = ` SELECT 
        tarefa.id,
        tarefa.nome, 
        tarefa.observacao, 
        tarefa.dataInicio,
        tarefa.dataFim,
        GROUP_CONCAT(atributo.imagem) as imagens,
        GROUP_CONCAT(atributo.nome) as atributo_nome
    FROM 
        tarefa
    JOIN
        ListaAtributos ON tarefa.id = ListaAtributos.tarefa_id
    JOIN
        Atributo ON ListaAtributos.atributo_id = Atributo.id
    WHERE 
        tarefa.ativo = 1
    AND 
        tarefa.completa = 0
    GROUP BY 
        tarefa.id
    `;
  useEffect(() => {
    iniciaTabelas()
  }, [])
  useEffect(() => {
    try {
      carregaTarefas();
    } catch (erro) { console.error(erro) } finally {
      aplicaFiltro()
    }
  }, [iniciado]);

  const aplicaFiltro = async () => {
    let comandoSQL = respostaTarefasQuery;

    let condicoes: any = [];
    let operadoresLogicos: any = [];

    linhasFiltro.forEach((linha, indice) => {
      if (
        document &&
        document.querySelector(`#campo-filtro-${indice}`) &&
        document.querySelector(`#valor-filtro-${indice}`) &&
        document.querySelector(`#operador-logico-${indice}`)
      ) {
        let campoFiltro = document!.querySelector(
          `#campo-filtro-${indice}`
        )!.value;
        let valorFiltro = document!.querySelector(
          `#valor-filtro-${indice}`
        )!.value;
        let operadorLogico = document!.querySelector(
          `#operador-logico-${indice}`
        )!.value;

        let condicao: any = "";
        if (campoFiltro && valorFiltro) {
          switch (campoFiltro) {
            case "Atributo":
              condicao = ` Atributo.nome LIKE '%${valorFiltro}%' `;
              break;
            case "Nome":
              condicao = ` tarefa.nome LIKE '%${valorFiltro}%' `;
              break;
            case "Observação":
              condicao = ` tarefa.observacao LIKE '%${valorFiltro}%' `;
              break;
            case "Importância":
              condicao = ` tarefa.importancia = ${valorFiltro} `;
              break;
            case "Dificuldade":
              condicao = ` tarefa.dificuldade = ${valorFiltro} `;
              break;
            default:
              break;
          }

          if (condicao) {
            condicoes.push(condicao);
            if (operadorLogico == "OU") {
              operadorLogico = " OR ";
            }
            if (operadorLogico == "E") {
              operadorLogico = " AND ";
            }
            operadoresLogicos.push(operadorLogico);
          }
        }
      }
    });

    if (condicoes.length > 0) {
      comandoSQL +=
        " AND (" +
        condicoes
          .map((condicao: any, indice: number) => {
            return indice === 0
              ? condicao
              : `${operadoresLogicos[indice - 1]} ${condicao}`;
          })
          .join(" ") +
        ")";
    }

    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      const respostaTarefas = await db?.query(comandoSQL);
      definirTarefaFiltradas(respostaTarefas?.values);
      console.log(tarefaFiltradas);
    });

    /*console.log(comandoSQL);*/
  };

  const adicionarCampoFiltro = () => {
    defineLinhasFiltro([...linhasFiltro, linhasFiltro.length]);
    console.log(linhasFiltro);
  };

  const carregaTarefas = async () => {
    definirCarregamento(true);
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const respostaTarefas = await db?.query(respostaTarefasQuery);
        definirTarefaFiltradas(respostaTarefas?.values);
      });
    } catch (erro) {
      console.log(erro);
      definirTarefaFiltradas([]);
    } finally {
      definirCarregamento(false);
    }
  };

  const confirmaDelecao = async (id: number) => {
    console.log(`Realiza Deleção do tarefa : ${id}`);
    let tarefaDelecao = `
      UPDATE Tarefa SET ativo = 0 WHERE id = ${id};`;

    let tarefaDelecao2 = `
      UPDATE ListaAtributos SET ativo = 0 WHERE tarefa_id = ${id};`;

    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(tarefaDelecao);
        await db?.query(tarefaDelecao2);
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      aplicaFiltro();
      fecharModais();
    }
  };

  const completarTarefa = async (id: number) => {
    try {
      const sqlXPZerado = ` SELECT * FROM ATRIBUTO WHERE XP < 0 `
      const sqlXPZerado1 = ` SELECT * FROM USUARIO WHERE XP < 0 `
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const resultado = await db?.query(sqlXPZerado)
        const resultado1 = await db?.query(sqlXPZerado1)

        if (resultado && resultado.values && resultado.values.length > 0) {
          const comandoSQL = ` UPDATE ATRIBUTO SET XP = 0 WHERE ID = ? `;
          for (const res of resultado.values) {
            await db?.query(comandoSQL, [res.id])
          }
        }

        if (resultado1 && resultado1.values && resultado1.values.length > 0) {
          const comandoSQL1 = ` UPDATE USUARIO SET XP = 0 WHERE ID = ? `;
          for (const res of resultado1.values) {
            await db?.query(comandoSQL1, [res.id])
          }
        }
      })
    } catch (erro) { console.error(erro) }

    let incremento = 0;
    const comandoSQLSelect = ` SELECT dificuldade, importancia
      FROM Tarefa
      WHERE id = ? `;
    const comandoCompleta = `UPDATE Tarefa SET completa = 1 WHERE id = ?`;
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(comandoCompleta, [id]);
        const respostaSelect = await db?.query(comandoSQLSelect, [id]);

        if (
          respostaSelect &&
          respostaSelect.values &&
          respostaSelect.values?.length > 0
        ) {
          const dificuldade = respostaSelect.values?.[0].dificuldade;
          const importancia = respostaSelect.values?.[0].importancia;
          incremento = (dificuldade + importancia) * 50;
          console.log('INCREMENTO : ' + incremento)
          console.log('ID : ' + id)

          const comandoSQLUpdate = ` UPDATE Atributo
            SET xp = COALESCE(xp, 0) + ?
            WHERE id IN (
              SELECT atributo_id
              FROM ListaAtributos
              WHERE tarefa_id = ?
            ); `;

          const comandoSQLUpdate1 = ` UPDATE Usuario
            SET xp = COALESCE(xp, 0) + ?  `;

          await db?.query(comandoSQLUpdate, [incremento, id]);
          await db?.query(comandoSQLUpdate1, [incremento])
          console.log(`XP atualizado em ${incremento} para tarefa_id ${id}`);
        } else {
          console.log("Nenhuma tarefa encontrada com o id fornecido");
        }
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      aplicaFiltro();
    }
  };

  const falharTarefa = async (id: number) => {
    let incremento = 0;
    const comandoSQLSelect = ` SELECT dificuldade, importancia
      FROM Tarefa
      WHERE id = ? `;
    const comandoCompleta = `UPDATE Tarefa SET completa = 1 WHERE id = ?`;
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(comandoCompleta, [id]);
        const respostaSelect = await db?.query(comandoSQLSelect, [id]);

        if (
          respostaSelect &&
          respostaSelect.values &&
          respostaSelect.values?.length > 0
        ) {
          const dificuldade = respostaSelect.values?.[0].dificuldade;
          const importancia = respostaSelect.values?.[0].importancia;
          incremento = (dificuldade + importancia) * 50;
          console.log('INCREMENTO : ' + incremento)
          console.log('ID : ' + id)

          const comandoSQLUpdate = ` UPDATE Atributo
            SET xp = COALESCE(xp, 0) - ?
            WHERE id IN (
              SELECT atributo_id
              FROM ListaAtributos
              WHERE tarefa_id = ?
            ); `;

          const comandoSQLUpdate1 = ` UPDATE Usuario
            SET xp = COALESCE(xp, 0) - ?  `;

          await db?.query(comandoSQLUpdate, [incremento, id]);
          await db?.query(comandoSQLUpdate1, [incremento])
          console.log(`XP atualizado em ${incremento} para tarefa_id ${id}`);

        } else {
          console.log("Nenhuma tarefa encontrada com o id fornecido");
        }
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      aplicaFiltro();
      fecharModais();
    }
  };

  const formatarData = (data: string) => {
    const dataPartes = data.split("-");
    const ano = parseInt(dataPartes[0], 10);
    const mes = parseInt(dataPartes[1], 10);
    const dia = parseInt(dataPartes[2], 10);

    const nomeMes = meses[mes - 1];
    return `${dia} de ${nomeMes}`;
  };

  const separaImagens = (imagens: string) => {
    const imagensArray = imagens.split(',')
    const filtraElementos = imagensArray.filter((imagem, index) => (index + 1) % 2 === 0);

    return filtraElementos
  }

  const IniciarBanco = async () => {
    const comandos = [`CREATE TABLE IF NOT EXISTS Usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT(200),
      descricao TEXT(500),
      imagem TEXT,
      xp INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS Atributo (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT,
      observacao TEXT,
      xp INTEGER,
      imagem TEXT,
      ativo INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS Tarefa (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT,
      observacao TEXT,
      importancia INTEGER,
      dificuldade INTEGER,
      dataInicio TEXT,
      dataFim TEXT,
      usuario_id INTEGER,
      completa INTEGER,
      ativo INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS Template (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT,
      observacao TEXT,
      importancia INTEGER,
      dificuldade INTEGER,
      dataInicio TEXT,
      dataFim TEXT,
      usuario_id INTEGER,
      ativo INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS ListaAtributos (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      atributo_id INTEGER,
      tarefa_id INTEGER,
      ativo INTEGER,
      FOREIGN KEY (atributo_id) REFERENCES Atributo(id),
      FOREIGN KEY (tarefa_id) REFERENCES Tarefa(id)
    );`]
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      for (const comando of comandos) {
        console.log(comando)
        await db?.query(comando)
      }
    })
  }

  const carregaModal = (id: number) => {
    defIdTarefaSel(id)
    mostraModal(true)
  }

  const fecharModais = () => {
    mostraModal(false)
    mostraModalDel(false)
  }

  return (
    <IonPage>
      <IonHeader>
        <TituloBotaoVoltar
          titulo="Tarefas"
          icone={book}
          filtro={true}
          definirMostraFiltro={definirMostraFiltro}
          mostraFiltro={mostraFiltro}
        />
      </IonHeader>
      <IonContent color="tertiary">
       {/* <IonButton onClick={IniciarBanco}>Iniciar Banco</IonButton>*/}
        {mostraFiltro == true ? (
          <IonCard color="secondary">
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonButton onClick={adicionarCampoFiltro} expand="block">
                      Adicionar Filtro +
                    </IonButton>
                  </IonCol>
                </IonRow>

                {linhasFiltro.map((linha, indice) => (
                  <IonRow key={indice}>
                    <IonCol size="5">
                      <IonSelect
                        id={`campo-filtro-${indice}`}
                        label="Selecione"
                        labelPlacement="floating"
                      >
                        <IonSelectOption>Atributo</IonSelectOption>
                        <IonSelectOption>Nome</IonSelectOption>
                        <IonSelectOption>Observação</IonSelectOption>
                        <IonSelectOption>Importância</IonSelectOption>
                        <IonSelectOption>Dificuldade</IonSelectOption>
                      </IonSelect>
                    </IonCol>
                    <IonCol size="5">
                      <IonItem lines="none" color="secondary">
                        <IonInput id={`valor-filtro-${indice}`}></IonInput>
                      </IonItem>
                    </IonCol>
                    <IonCol size="2">
                      <IonSelect
                        id={`operador-logico-${indice}`}
                        label="OP"
                        labelPlacement="floating"
                      >
                        <IonSelectOption>E</IonSelectOption>
                        <IonSelectOption>OU</IonSelectOption>
                      </IonSelect>
                    </IonCol>
                  </IonRow>
                ))}

                <IonRow>
                  <IonCol className="flex-center-icon-text">
                    <IonButtons>
                      <IonButton onClick={aplicaFiltro}>
                        <IonIcon className="icon-large" icon={search}></IonIcon>
                      </IonButton>
                    </IonButtons>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        ) : null}

        <IonCard color="secondary">
          <IonCardContent className="ion-text-center">
            <IonText
              style={{ fontSize: "1.5rem" }}
            >
              Total: {quantidadeDeCards}
            </IonText>
          </IonCardContent>
        </IonCard>

        <div>
          {estadoCarregamento ? (
            <CirculoCarregamento />
          ) : (
            tarefaFiltradas?.map((item, indice) => (
              <>
                <IonCard color="secondary" key={indice}>
                  <IonGrid>
                    <IonRow>
                      <IonCol style={{ padding: "0px", display: "flex", justifyContent: "center", alignItems: "center" }} size="2">
                        <IonButton
                          fill="clear"
                          color="primary"
                          onClick={() => carregaModal(item.id)}
                        >
                          <IonIcon style={{ width: "1.5rem", height: "1.5rem" }} icon={grid}></IonIcon>
                        </IonButton>
                      </IonCol>
                      <IonCol style={{ paddingBottom: "0rem" }}>
                        <IonCardHeader style={{ padding: "0rem", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <IonCardTitle
                            style={{ fontWeight: "bold" }}
                            className="ion-text-center"
                            color="light"
                          >
                            • {item.id} {item.nome}
                          </IonCardTitle>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {separaImagens(item.imagens).map((imagem, indice) => (
                              <IonImg
                                style={{
                                  width: "2.5rem",
                                  height: "2.5rem",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  overflow: "hidden",
                                }}
                                key={indice}
                                src={`data:image/jpeg;base64,${imagem}`}
                              />
                            ))}
                          </div>
                        </IonCardHeader>
                      </IonCol>
                      <IonCol style={{ padding: "0px", display: "flex", justifyContent: "center", alignItems: "center" }} size="2">
                        <IonButton
                          fill="clear"
                          color="primary"
                          onClick={() => completarTarefa(item.id)}
                        >
                          <IonIcon
                            style={{
                              backgroundColor: "white",
                              borderRadius: "50%"
                            }}
                            size="large" icon={radioButtonOff}></IonIcon>
                        </IonButton>
                      </IonCol>
                    </IonRow>
                    <IonCardContent style={{ padding: "0px" }}>
                      <IonRow>
                        <IonCol style={{ paddingBottom: "0rem" }}>
                          <div className="ion-text-center">
                            <IonLabel>{item.observacao}</IonLabel>
                          </div>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol></IonCol>
                        <IonCol size="7" style={{ paddingBottom: "0rem" }}>
                          <div className="ion-text-center">
                            <IonIcon slot="start" icon={today}></IonIcon>
                            <IonLabel
                              style={{ fontSize: "1.2rem", marginLeft: "0.3rem" }}
                            >
                              {/*formatarData(item.dataInicio)*/} {formatarData(item.dataFim)}
                            </IonLabel>
                          </div>
                        </IonCol>
                        <IonCol></IonCol>
                      </IonRow>
                    </IonCardContent>
                  </IonGrid>
                </IonCard>
              </>
            ))
          )}
        </div>
        <IonButton
          /*
          onClick={insereExemplo}*/
          href="./PaginaTarefaCadastro"
          shape="round"
          className="custom-botao"
          color="primary"
        >
          +
        </IonButton>
        {/*
        <BotaoAdicionarItem caminho="./PaginaAdicionarTarefa" />*/}

        <br></br>
        <IonModal
          isOpen={modal}
          onDidDismiss={() => mostraModal(false)}
          className="custom-modal"
        ><IonItem color="secondary">
            <IonButton
              fill="clear"
              color="danger"
              onClick={() => falharTarefa(idTarefaSel)}
            >
              <IonIcon size="large" icon={closeCircle}></IonIcon>
              <IonTitle>Falhar</IonTitle>
            </IonButton>
          </IonItem>
          <IonItem color="secondary">
            <IonButton
              href={`/PaginaTarefaEdicao?id=${idTarefaSel}`}
              fill="clear"
            >
              <IonIcon size="large" icon={create}></IonIcon>
              <IonTitle>Editar</IonTitle>
            </IonButton>
          </IonItem>
          <IonItem color="secondary">
            <IonButton
              fill="clear"
              color="danger"
              onClick={() => mostraModalDel(true)}
            >
              <IonIcon size="large" icon={trash}></IonIcon>
              <IonTitle>Deletar</IonTitle>
            </IonButton>
          </IonItem>
        </IonModal>

        <IonModal
          isOpen={modalDel}
          onDidDismiss={() => mostraModalDel(false)}
          className="custom-modal"
        >
          <IonCard color="secondary">
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">
                Tem certeza que deseja deletar essa tarefa?
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="ion-padding">
              <div className="ion-text-center">
                Essa ação não pode ser desfeita.
              </div>
              <IonItem lines="none" color="secondary">
                <IonButton
                  onClick={() => confirmaDelecao(idTarefaSel)}
                  color="danger"
                >
                  Confirmar
                </IonButton>
                <IonButton
                  onClick={fecharModais}
                  color="light"
                >
                  Cancelar
                </IonButton>
              </IonItem>
            </IonCardContent>
          </IonCard>
        </IonModal>

      </IonContent>
      <BarraInferior />
    </IonPage >
  );
};

export default PainelDeTarefas;
