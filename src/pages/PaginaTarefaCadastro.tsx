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
  IonModal,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonLabel,
  IonIcon,
  IonSelectOption,
  IonSelect,
} from "@ionic/react";

import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
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
import { apps, close, closeCircle, grid, save } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/core/components";
import armazenamento from "../armazenamento";

const PaginaTarefaCadastro: React.FC = () => {
  const [carregamento, definirCarregamento] = useState<boolean>(false);
  const [resultadoCadastro, definirResultadoCadastro] = useState<string>("");
  const [templateSelecionado, definirTemplateSelecionado] = useState<any>([]);
  const [atributoSelecionado, definirAtributoSelecionado] = useState<any>();
  const [idUsuario, definirIdUsuario] = useState();

  const [templates, definirTemplates] = useState<any>([]);
  const [atributos, definirAtributos] = useState<any>([]);

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const nomeEntrada = useRef<HTMLIonInputElement>(null);
  const observacaoEntrada = useRef<HTMLIonTextareaElement>(null);
  const importanciaEntrada = useRef<HTMLIonInputElement>(null);
  const recompensaEntrada = useRef<HTMLIonInputElement>(null);
  const dificuldadeEntrada = useRef<HTMLIonInputElement>(null);
  const dataEntrada = useRef<HTMLIonInputElement>(null);

  const modal = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    carregaTemplates();
    buscaAtributos();
    obterIdUsuario();
  }, [iniciado]);

  const capturaIdUsuarioPromise = async () => {
    const resultado = await armazenamento.get('idUsuario')
    return await resultado
  }

  const obterIdUsuario = async() => {
    const idUsuarioAtual: any = await capturaIdUsuarioPromise();
    definirIdUsuario(idUsuarioAtual)
  }

  function saidaModal(ev: CustomEvent<OverlayEventDetail>) {
    if (ev.detail.role === "deletar") {
      console.log("teste");
    }
  }

  const carregaTemplates = async () => {
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      const resultado = await db?.query(`SELECT * from template`);
      definirTemplates(resultado?.values);
    });
  };

  const navegar = useHistory();

  const cadastrarTarefa = async () => {
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

      let tarefaId: any;

      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(
          `INSERT INTO Tarefa (nome, observacao, importancia, recompensa, dificuldade, data, ativo, completa, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nomeInserido,
            observacaoInserida,
            importanciaInserida,
            recompensaInserida,
            dificuldadeInserida,
            dataInserida,
            1,
            0,
            idUsuario
          ]
        );

        const resultado = await db?.query(`SELECT last_insert_rowid() as id`);
        if (resultado && resultado.values) {
          tarefaId = resultado?.values[0].id;
        }

        await db?.query(
          `INSERT INTO ListaAtributos (atributo_id, tarefa_id, ativo) values (?, ?, ?)`,
          [atributoSelecionado, tarefaId, 1]
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

  const cadastrarTemplate = async () => {
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
          `INSERT INTO Template (nome, observacao, importancia, recompensa, dificuldade, ativo, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            nomeInserido,
            observacaoInserida,
            importanciaInserida,
            recompensaInserida,
            dificuldadeInserida,
            1,
            idUsuario
          ]
        );

        definirResultadoCadastro("Template cadastrada com sucesso!");
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

  const carregaTemplate = async (id: number) => {
    console.log(id);
    definirCarregamento(true);
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      const resultado = await db?.query(`SELECT * FROM TEMPLATE WHERE id = ?`, [
        id,
      ]);
      if (resultado?.values && resultado?.values.length) {
        definirTemplateSelecionado(resultado.values[0]);
      }
    });
    definirCarregamento(false);
  };

  const deletarTemplate = async (id: number) => {
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(`DELETE FROM TEMPLATE WHERE ID = ?`, [id]);
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      carregaTemplates();
    }
  };

  const buscaAtributos = async () => {
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const resultado = await db?.query(`SELECT * FROM ATRIBUTO`);
        definirAtributos(resultado?.values);
      });
    } catch (erro) {
      console.log(erro);
    }
  };

  const capturaMudancaAtributo = (evento: CustomEvent) => {
    const valor = parseInt((evento.target as HTMLInputElement).value);
    console.log("Valor filtro Atributo: ", valor);
    definirAtributoSelecionado(valor);
  };

  return (
    <IonApp>
      <IonHeader>
        <BarraSuperior icone={grid} titulo="Cadastrar Tarefa" />
      </IonHeader>
      <IonContent color="tertiary">
        <div className="ion-padding">
          {carregamento ? (
            <CirculoCarregamento />
          ) : (
            <>
              <IonGrid className="ion-text-center ion-margin">
                <IonRow>
                  <IonCol>
                    <IonButton id="modal-template">
                      <IonIcon slot="start" icon={apps} />
                      <IonLabel>Templates</IonLabel>
                    </IonButton>
                  </IonCol>
                </IonRow>

                <IonModal
                  ref={modal}
                  trigger="modal-template"
                  onWillDismiss={(evento) => saidaModal(evento)}
                >
                  <IonHeader>
                    <IonToolbar color="primary">
                      <IonButtons slot="start">
                        <IonButton
                          style={{ fontWeight: "bold" }}
                          fill="solid"
                          color="danger"
                          onClick={() => modal.current?.dismiss()}
                        >
                          <IonIcon icon={close} />
                        </IonButton>
                      </IonButtons>
                      <IonTitle>Templates</IonTitle>
                    </IonToolbar>
                  </IonHeader>
                  <IonContent color="tertiary" className="ion-padding">
                    {templates?.map((item: any) => (
                      <div>
                        <IonItem
                          color="secondary"
                          id={item.id}
                          className="ion-text-center"
                        >
                          <IonLabel onClick={() => carregaTemplate(item.id)}>
                            {item.nome}
                          </IonLabel>
                          <IonButton
                            onClick={() => deletarTemplate(item.id)}
                            color="danger"
                          >
                            <IonIcon slot="start" icon={closeCircle}></IonIcon>
                            Deletar
                          </IonButton>
                        </IonItem>
                      </div>
                    ))}
                  </IonContent>
                </IonModal>

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
                        value={templateSelecionado.nome ?? null}
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
                        value={templateSelecionado.observacao ?? null}
                      ></IonTextarea>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
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
                        value={templateSelecionado.importancia ?? null}
                      ></IonInput>
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
                        value={templateSelecionado.recompensa ?? null}
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonInput
                        ref={dificuldadeEntrada}
                        type="number"
                        label="Dificuldade"
                        label-placement="floating"
                        placeholder="1 a 5"
                        id="dificuldade-input"
                        color="dark"
                        value={templateSelecionado.dificuldade ?? null}
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
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonButton onClick={cadastrarTarefa}>
                  <IonIcon icon={save} slot="start" />
                  <IonLabel>Cadastrar</IonLabel>
                </IonButton>
                <IonButton onClick={cadastrarTemplate}>
                  <IonIcon icon={apps} slot="start" />
                  <IonLabel>Salvar Template</IonLabel>
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

export default PaginaTarefaCadastro;
