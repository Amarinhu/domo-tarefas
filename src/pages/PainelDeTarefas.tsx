import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import TituloBotaoVoltar from "../components/BarraSuperior";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import {
  checkmarkCircle,
  closeCircle,
  create,
  diamond,
  grid,
  reader,
  search,
  today,
  trash,
} from "ionicons/icons";
import { meses } from "../globalConstants/constantesGlobais";
import BarraInferior from "../components/BarraInferiorControles";
import armazenamento from "../armazenamento";

type tarefaItem = {
  id: number;
  nome: string;
  observacao: string;
  data: string;
  recompensa: string;
  atributo_nome: string;
};

const PainelDeTarefas: React.FC = () => {
  const [estadoCarregamento, definirCarregamento] = useState(false);
  const [mostraFiltro, definirMostraFiltro] = useState<boolean>(true);
  const [linhasFiltro, defineLinhasFiltro] = useState([0]);
  const [tarefaFiltradas, definirTarefaFiltradas] =
    useState<Array<tarefaItem>>();
  const [idUsuario, definirIdUsuario] = useState();

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const quantidadeDeCards = tarefaFiltradas?.length;

  const capturaIdUsuarioPromise = async () => {
    const resultado = await armazenamento.get('idUsuario')
    return await resultado
  }

  const obterIdUsuario = async() => {
    const idUsuarioAtual: any = await capturaIdUsuarioPromise();
    definirIdUsuario(idUsuarioAtual)
  }

  const respostaTarefasQuery = `SELECT 
    tarefa.id,
    tarefa.nome, 
    tarefa.observacao, 
    tarefa.recompensa, 
    tarefa.data,
    atributo.nome as atributo_nome
      FROM 
          tarefa
      JOIN
          ListaAtributos ON tarefa.id = ListaAtributos.tarefa_id
      JOIN
          Atributo ON ListaAtributos.atributo_id = Atributo.id
      JOIN
          Usuario on tarefa.usuario_id = usuario.id
      WHERE 
          tarefa.ativo = 1
      AND 
          tarefa.completa = 0
      AND
          tarefa.usuario_id = ${idUsuario}`;

  useEffect(() => {
    obterIdUsuario();
    carregaTarefas();
  }, [iniciado]);

  const recarregarPagina = () => {
    location.reload();
  };

  const aplicaFiltro = () => {
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
              condicao = `Atributo.nome LIKE '%${valorFiltro}%'`;
              break;
            case "Nome":
              condicao = `tarefa.nome LIKE '%${valorFiltro}%'`;
              break;
            case "Observação":
              condicao = `tarefa.observacao LIKE '%${valorFiltro}%'`;
              break;
            case "Importância":
              condicao = `tarefa.importancia = ${valorFiltro}`;
              break;
            case "Recompensa":
              condicao = `tarefa.recompensa LIKE '%${valorFiltro}%'`;
              break;
            case "Dificuldade":
              condicao = `tarefa.dificuldade = ${valorFiltro}`;
              break;
            default:
              break;
          }

          if (condicao) {
            condicoes.push(condicao);
            if (operadorLogico == "OU") {
              operadorLogico = "OR";
            }
            if (operadorLogico == "E") {
              operadorLogico = "AND";
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

    executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      const respostaTarefas = await db?.query(comandoSQL);
      definirTarefaFiltradas(respostaTarefas?.values);
      console.log(tarefaFiltradas);
    });

    console.log(comandoSQL);
  };

  const adicionarCampoFiltro = () => {
    defineLinhasFiltro([...linhasFiltro, linhasFiltro.length]);
    console.log(linhasFiltro);
  };

  const carregaTarefas = async () => {
    definirCarregamento(true);
    try {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
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

  const confirmaDelecao = (id: number) => {
    console.log(`Realiza Deleção do tarefa : ${id}`);
    let tarefaDelecao = `
      UPDATE Tarefa SET ativo = 0 WHERE id = ${id};`;

    let tarefaDelecao2 = `
      UPDATE ListaAtributos SET ativo = 0 WHERE tarefa_id = ${id};`;

    try {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(tarefaDelecao);
        await db?.query(tarefaDelecao2);
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      recarregarPagina();
      /*
      () => aplicaFiltro;*/
    }
  };

  const completarTarefa = (id: number) => {
    let incremento = 0;
    const comandoSQLSelect = `SELECT dificuldade, importancia
      FROM Tarefa
      WHERE id = ?`;
    const comandoCompleta = `UPDATE Tarefa SET completa = 1 WHERE id = ?`;

    executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
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

        const comandoSQLUpdate = `UPDATE Atributo
          SET xp = xp + ?
          WHERE id IN (
            SELECT atributo_id
            FROM ListaAtributos
            WHERE tarefa_id = ?
          );`;

        await db?.query(comandoSQLUpdate, [incremento, id]);
        console.log(`XP atualizado em ${incremento} para tarefa_id ${id}`);
      } else {
        console.log("Nenhuma tarefa encontrada com o id fornecido");
      }
    });
  };

  const falharTarefa = (id: number) => {
    let decremento = 0;
    const comandoSQLSelect = `SELECT dificuldade, importancia
      FROM Tarefa
      WHERE id = ?`;
    const comandoCompleta = `UPDATE Tarefa SET completa = 1 WHERE id = ?`;

    executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      await db?.query(comandoCompleta, [id]);
      const respostaSelect = await db?.query(comandoSQLSelect, [id]);

      if (
        respostaSelect &&
        respostaSelect.values &&
        respostaSelect.values?.length > 0
      ) {
        const dificuldade = respostaSelect.values?.[0].dificuldade;
        const importancia = respostaSelect.values?.[0].importancia;
        decremento = (dificuldade + importancia) * 50 * 0.2;

        const comandoSQLUpdate = `UPDATE Atributo
          SET xp = xp - ?
          WHERE id IN (
            SELECT atributo_id
            FROM ListaAtributos
            WHERE tarefa_id = ?
          );`;

        await db?.query(comandoSQLUpdate, [decremento, id]);
        console.log(`XP atualizado em ${decremento} para tarefa_id ${id}`);
      } else {
        console.log("Nenhuma tarefa encontrada com o id fornecido");
      }
    });
  };

  const formatarData = (data: string) => {
    const dataPartes = data.split("-");
    const ano = parseInt(dataPartes[0], 10);
    const mes = parseInt(dataPartes[1], 10);
    const dia = parseInt(dataPartes[2], 10);

    const nomeMes = meses[mes - 1];
    return `${dia} de ${nomeMes}`;
  };

  return (
    <IonPage>
      <IonHeader>
        <TituloBotaoVoltar
          titulo="Tarefas"
          icone={grid}
          filtro={true}
          definirMostraFiltro={definirMostraFiltro}
          mostraFiltro={mostraFiltro}
        />
      </IonHeader>
      <IonContent color="tertiary">
        {mostraFiltro == true ? (
          <IonCard>
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
                        <IonSelectOption>Recompensa</IonSelectOption>
                        <IonSelectOption>Dificuldade</IonSelectOption>
                      </IonSelect>
                    </IonCol>
                    <IonCol size="5">
                      <IonItem>
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

        <IonCard>
          <IonCardHeader>
            <IonCardTitle
              style={{ fontSize: "1.5rem" }}
              className="ion-text-center"
            >
              Total: {quantidadeDeCards}
            </IonCardTitle>
          </IonCardHeader>
        </IonCard>

        <div>
          {estadoCarregamento ? (
            <CirculoCarregamento />
          ) : (
            tarefaFiltradas?.map((item, indice) => (
              <IonCard color="secondary" key={indice}>
                <IonGrid>
                  <IonRow>
                    <IonCol style={{ paddingBottom: "0rem" }}>
                      <IonCardHeader style={{ paddingBottom: "0rem" }}>
                        <IonCardTitle
                          style={{ fontWeight: "bold" }}
                          className="ion-text-center"
                          color="light"
                        >
                          • {item.nome} [{item.atributo_nome}]
                        </IonCardTitle>
                      </IonCardHeader>
                    </IonCol>
                  </IonRow>
                  <IonCardContent>
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
                            {formatarData(item.data)}
                          </IonLabel>
                        </div>
                      </IonCol>
                      <IonCol size="3" style={{ paddingBottom: "0rem" }}>
                        <div className="ion-text-center">
                          <IonIcon
                            slot="start"
                            icon={diamond}
                            color="primary"
                          ></IonIcon>
                          <IonLabel
                            style={{ fontSize: "1.2rem", marginLeft: "0.3rem" }}
                          >
                            {item.recompensa}
                          </IonLabel>
                        </div>
                      </IonCol>
                      <IonCol></IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol style={{ paddingBottom: "0rem" }}>
                        <IonButtons class="flex-center-icon-text">
                          <IonButton
                            fill="solid"
                            color="success"
                            style={{ border: "solid 1px black" }}
                            onClick={() => completarTarefa(item.id)}
                          >
                            <IonIcon
                              size="large"
                              icon={checkmarkCircle}
                            ></IonIcon>
                          </IonButton>
                          <IonButton
                            fill="solid"
                            color="danger"
                            style={{ border: "solid 1px black" }}
                            onClick={() => falharTarefa(item.id)}
                          >
                            <IonIcon size="large" icon={closeCircle}></IonIcon>
                          </IonButton>
                          <IonButton
                            href={`/PaginaTarefaEdicao?id=${item.id}`}
                            fill="solid"
                            color="warning"
                            style={{ border: "solid 1px black" }}
                          >
                            <IonIcon size="large" icon={create}></IonIcon>
                          </IonButton>
                          <IonButton
                            fill="solid"
                            color="danger"
                            style={{ border: "solid 1px black" }}
                            id={`delecao-alerta-${item.id}`}
                          >
                            <IonIcon size="large" icon={trash}></IonIcon>
                          </IonButton>
                          <div>
                            <IonAlert
                              trigger={`delecao-alerta-${item.id}`}
                              header="Deletar Tarefa?"
                              message="Tem certeza que deseja deletar essa tarefa?"
                              buttons={[
                                {
                                  text: "Confirmar",
                                  handler: () => confirmaDelecao(item.id),
                                },
                                {
                                  text: "Cancelar",
                                },
                              ]}
                            ></IonAlert>
                          </div>
                        </IonButtons>
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonGrid>
              </IonCard>
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
        <BarraInferior />
        <br></br>
      </IonContent>
    </IonPage>
  );
};

export default PainelDeTarefas;
