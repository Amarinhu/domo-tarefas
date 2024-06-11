import {
  IonApp,
  IonContent,
  IonItem,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonTextarea,
  IonHeader,
  IonLabel,
  IonIcon,
  IonSelectOption,
  IonSelect,
  IonRange,
} from "@ionic/react";

import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import CirculoCarregamento from "../components/CirculoDeCarregamento";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import BarraSuperior from "../components/BarraSuperior";
import PopupResultado from "../components/PopupResultado";
import { grid, save } from "ionicons/icons";
import armazenamento from "../armazenamento";

const PaginaTarefaEdicao: React.FC = () => {
  const [carregamento, definirCarregamento] = useState<boolean>(false);
  const [resultadoCadastro, definirResultadoCadastro] = useState<string>("");
  const [tarefaEdicao, definirTarefaEdicao] = useState<any>();
  const [atributos, definirAtributos] = useState<any>([]);
  const [idUsuario, definirIdUsuario] = useState();

  const [atributoSelecionado, definirAtributoSelecionado] = useState<any>();

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const nomeEntrada = useRef<HTMLIonInputElement>(null);
  const observacaoEntrada = useRef<HTMLIonTextareaElement>(null);
  const importanciaEntrada = useRef<HTMLIonRangeElement>(null);
  const recompensaEntrada = useRef<HTMLIonInputElement>(null);
  const dificuldadeEntrada = useRef<HTMLIonRangeElement>(null);
  const dataEntrada = useRef<HTMLIonInputElement>(null);

  const navegar = useHistory();

  const localizacao = useLocation();
  const queryParams = new URLSearchParams(localizacao.search);
  const idEdicao = queryParams.get("id");

  const capturaIdUsuarioPromise = async () => {
    const resultado = await armazenamento.get("idUsuario");
    return await resultado;
  };

  const obterIdUsuario = async () => {
    const idUsuarioAtual: any = await capturaIdUsuarioPromise();
    definirIdUsuario(idUsuarioAtual);
  };

  const buscaAtributos = async () => {
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const resultado = await db?.query(`SELECT * FROM ATRIBUTO 
          WHERE ativo = 1 AND usuario_id = ${idUsuario}`);
        definirAtributos(resultado?.values);
      });
    } catch (erro) {
      console.log(erro);
    }
  };

  const atualizarTarefa = async () => {
    const nomeInserido = String(nomeEntrada.current?.value).trim();
    const observacaoInserida = String(observacaoEntrada.current?.value).trim();
    const importanciaInserida = Number(importanciaEntrada.current?.value);
    const recompensaInserida = Number(recompensaEntrada.current?.value);
    const dificuldadeInserida = Number(dificuldadeEntrada.current?.value);
    const dataInserida = String(dataEntrada.current?.value).trim();

    if (
      !nomeInserido ||
      !observacaoInserida ||
      !importanciaInserida ||
      !recompensaInserida ||
      !dificuldadeInserida ||
      !dataInserida
    ) {
      definirResultadoCadastro("Por favor, preencha todos os campos.");
      return;
    }

    try {
      definirCarregamento(true);

      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(
          `UPDATE Tarefa SET nome = ?, observacao = ?, importancia = ?, recompensa = ?, dificuldade = ?, data = ?
          WHERE id = ${idEdicao}`,
          [
            nomeInserido,
            observacaoInserida,
            importanciaInserida,
            recompensaInserida,
            dificuldadeInserida,
            dataInserida,
          ]
        );

        await db?.query(
          `UPDATE ListaAtributos SET atributo_id = ?
          WHERE id = ${idEdicao}`,
          [atributoSelecionado]
        );

        definirResultadoCadastro("Tarefa cadastrada com sucesso!");
        navegar.replace("/PainelDeTarefas");
      });
    } catch (erro) {
      console.log(erro);
      definirResultadoCadastro(
        "Erro ao cadastrar tarefa. Tente novamente mais tarde."
      );
    } finally {
      definirCarregamento(false);
    }
  };

  useEffect(() => {
    obterIdUsuario();

    const buscaDados = async () => {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const resultado = await db?.query(
          `SELECT tarefa.id, ListaAtributos.atributo_id, tarefa.nome, tarefa.observacao,
        tarefa.importancia, tarefa.recompensa, tarefa.dificuldade, tarefa.data
        FROM TAREFA 
        JOIN
          ListaAtributos ON tarefa.id = ListaAtributos.tarefa_id
        JOIN
          Atributo ON ListaAtributos.atributo_id = Atributo.id
          WHERE tarefa.ID = ${idEdicao}`
        );
        definirTarefaEdicao(resultado?.values);
        definirAtributoSelecionado(resultado?.values?.[0].atributo_id);
        console.log(resultado?.values?.[0].atributos_id);

        console.log(resultado);
      });
    };

    buscaDados();
    buscaAtributos();
  }, [iniciado]);

  const capturaMudancaAtributo = (evento: CustomEvent) => {
    const valor = parseInt((evento.target as HTMLInputElement).value);
    console.log("Valor filtro Atributo: ", valor);
    definirAtributoSelecionado(valor);
  };

  return (
    <IonApp>
      <IonHeader>
        <BarraSuperior icone={grid} titulo="Editar Tarefa" />
      </IonHeader>
      <IonContent color="tertiary">
        <div className="ion-padding">
          {carregamento ? (
            <CirculoCarregamento />
          ) : (
            <>
              <IonGrid className="ion-text-center ion-margin">
                {atributos ? (
                  <IonRow>
                    <IonCol>
                      <IonItem color="light">
                        <IonSelect
                          value={atributoSelecionado}
                          placeholder="Atributo"
                          onIonChange={capturaMudancaAtributo}
                        >
                          {atributos.map((atributo: any) => (
                            <IonSelectOption
                              key={atributo.id}
                              value={atributo.id}
                            >
                              {atributo.nome}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                ) : null}

                <IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonInput
                        ref={nomeEntrada}
                        label="Nome"
                        label-placement="floating"
                        placeholder="Insira o nome da tarefa"
                        id="nome-input"
                        color="dark"
                        value={tarefaEdicao?.[0].nome}
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonTextarea
                        ref={observacaoEntrada}
                        label="Observação"
                        label-placement="floating"
                        placeholder="Insira a observação da tarefa"
                        autoGrow={true}
                        id="observacao-input"
                        color="dark"
                        value={tarefaEdicao?.[0].observacao}
                      ></IonTextarea>
                    </IonItem>
                  </IonCol>
                </IonRow>

                {/*<IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonInput
                        ref={importanciaEntrada}
                        type="number"
                        min="1"
                        max="5"
                        label="Importância"
                        label-placement="floating"
                        placeholder="1 a 5"
                        id="importancia-input"
                        color="dark"
                        value={tarefaEdicao?.[0].importancia}
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>*/}

                <IonRow>
                  <IonCol>
                    <IonItem className="ion-text-center">
                      <IonLabel>Importância</IonLabel>
                    </IonItem>
                    <IonItem color="light">
                      <IonRange
                        ref={importanciaEntrada}
                        style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
                        min={1}
                        max={5}
                        step={1}
                        snaps={true}
                        value={tarefaEdicao?.[0].importancia}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>

                {/*<IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonInput
                        ref={dificuldadeEntrada}
                        type="number"
                        min="1"
                        max="5"
                        label="Dificuldade"
                        label-placement="floating"
                        placeholder="1 a 5"
                        id="dificuldade-input"
                        color="dark"
                        value={tarefaEdicao?.[0].dificuldade}
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>*/}

                <IonRow>
                  <IonCol>
                    <IonItem className="ion-text-center">
                      <IonLabel>Dificuldade</IonLabel>
                    </IonItem>
                    <IonItem color="light">
                      <IonRange
                        ref={dificuldadeEntrada}
                        style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
                        min={1}
                        max={5}
                        step={1}
                        snaps={true}
                        value={tarefaEdicao?.[0].dificuldade}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonInput
                        ref={recompensaEntrada}
                        type="number"
                        label="Recompensa"
                        label-placement="floating"
                        placeholder="Insira a recompensa"
                        id="recompensa-input"
                        color="dark"
                        value={tarefaEdicao?.[0].recompensa}
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonInput
                        ref={dataEntrada}
                        type="date"
                        label="Data"
                        label-placement="floating"
                        placeholder="Insira a data"
                        id="data-input"
                        color="dark"
                        value={tarefaEdicao?.[0].data}
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonButton onClick={atualizarTarefa}>
                  <IonIcon slot="start" icon={save} />
                  <IonLabel>Atualizar</IonLabel>
                </IonButton>
                <PopupResultado resultado={resultadoCadastro} />
              </IonGrid>
            </>
          )}
        </div>
      </IonContent>
    </IonApp>
  );
};

export default PaginaTarefaEdicao;
