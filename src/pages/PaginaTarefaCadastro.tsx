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
  IonRange,
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
import { apps, book, close, closeCircle, grid, save } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/core/components";
import armazenamento from "../armazenamento";

const PaginaTarefaCadastro: React.FC = () => {
  const [carregamento, definirCarregamento] = useState<boolean>(false);
  const [resultadoCadastro, definirResultadoCadastro] = useState<string>("");
  const [templateSelecionado, definirTemplateSelecionado] = useState<any>([]);
  const [atributoSelecionado, definirAtributoSelecionado] = useState<Array<any>>([]);

  const [templates, definirTemplates] = useState<any>([]);
  const [atributos, definirAtributos] = useState<any>([]);

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const modal = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    carregaTemplates();
    buscaAtributos();
  }, [iniciado]);


  const saidaModal = (ev: CustomEvent<OverlayEventDetail>) => {
    if (ev.detail.role === "deletar") {
      console.log("teste");
    }
  }

  const carregaTemplates = async () => {
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      const resultado = await db?.query(
        `SELECT * from template`,
      );
      definirTemplates(resultado?.values);
    });
  };

  const recarregarPagina = () => {
    location.reload();
  };

  const navegar = useHistory();

  const cadastrarTarefa = async () => {
    const nomeInserido = String(nome);
    const observacaoInserida = String(observacao);
    const importanciaInserida = Number(importancia);
    const dificuldadeInserida = Number(dificuldade);
    const dataIniInserida = String(dataInicial);
    const dataFimInserida = String(dataFinal);

    if (
      !nomeInserido ||
      !observacaoInserida ||
      !importanciaInserida ||
      !dificuldadeInserida ||
      !dataIniInserida ||
      !dataFimInserida
    ) {
      definirResultadoCadastro("Por favor, preencha todos os campos.");
      return;
    }

    try {
      definirCarregamento(true);

      let tarefaId: any;

      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(
          ` INSERT INTO Tarefa 
          (nome, observacao, importancia, 
          dificuldade, dataInicio, dataFim, ativo, completa) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?) `,
          [
            nomeInserido,
            observacaoInserida,
            importanciaInserida,
            dificuldadeInserida,
            dataIniInserida,
            dataFimInserida,
            1,
            0
          ]
        );

        const resultado = await db?.query(`SELECT last_insert_rowid() as id`);
        if (resultado && resultado.values) {
          tarefaId = resultado?.values[0].id;
        }

        for (const atributo of atributoSelecionado) {
          console.log(`INSERT INTO ListaAtributos (atributo_id, tarefa_id, ativo) values (?, ?, ?)`,
            [atributo, tarefaId, 1])
          await db?.query(
            `INSERT INTO ListaAtributos (atributo_id, tarefa_id, ativo) values (?, ?, ?)`,
            [atributo, tarefaId, 1]
          );
        }

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
    const nomeInserido = String(nome);
    const observacaoInserida = String(observacao);
    const importanciaInserida = Number(importancia);
    const dificuldadeInserida = Number(dificuldade);
    const dataInicialInserida = String(dataInicial);
    const dataFinalInserida = String(dataFinal);

    if (
      !nomeInserido ||
      !observacaoInserida ||
      !importanciaInserida ||
      !dificuldadeInserida ||
      !dataFinalInserida ||
      !dataInicialInserida
    ) {
      definirResultadoCadastro("Por favor, preencha todos os campos.");
      return;
    }

    try {
      definirCarregamento(true);

      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(
          `INSERT INTO Template 
          (nome, observacao, importancia, 
          dificuldade, dataInicio, dataFim, ativo) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            nomeInserido,
            observacaoInserida,
            importanciaInserida,
            dificuldadeInserida,
            dataInicialInserida,
            dataFinalInserida,
            1,
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
      recarregarPagina();
      definirCarregamento(false);
    }
  };

  const carregaTemplate = async (id: number) => {
    console.log(id);
    definirCarregamento(true);
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      const resultado = await db?.query(
        ` SELECT * FROM TEMPLATE WHERE id = ? `,
        [id]
      );
      console.log(resultado);
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
        const resultado = await db?.query(`SELECT * FROM ATRIBUTO 
          WHERE ativo = 1`);
        console.log(resultado);
        definirAtributos(resultado?.values);
      });
    } catch (erro) {
      console.log(erro);
    }
  };

  const capturaMudancaAtributo = (evento: CustomEvent) => {
    const valor = (evento.target as HTMLIonSelectElement).value;
    console.log(valor);
    definirAtributoSelecionado(valor);
  };

  const capturaMudancaImportancia = (evento: CustomEvent) => {
    const valor = parseInt((evento.target as HTMLInputElement).value);
    console.log("Valor filtro Importancia: ", valor);
    definirImportancia(valor);
  };

  const capturaMudancaDificuldade = (evento: CustomEvent) => {
    const valor = parseInt((evento.target as HTMLInputElement).value);
    console.log("Valor filtro Dificuldade: ", valor);
    definirDificuldade(valor);
  };

  const capturaMudancaNome = (evento: CustomEvent) => {
    const valor = (evento.target as HTMLInputElement).value;
    console.log("Valor filtro Nome: ", valor);
    definirNome(valor);
  };

  const capturaMudancaObservacao = (evento: CustomEvent) => {
    const valor = (evento.target as HTMLInputElement).value;
    console.log("Valor filtro Observacao: ", valor);
    definirObservacao(valor);
  };

  const capturaMudancaDataFinal = (evento: CustomEvent) => {
    const valor = (evento.target as HTMLDataElement).value;
    console.log("Valor filtro Data: ", valor);
    definirDataFinal(valor);
  };

  const capturaMudancaDataInicial = (evento: CustomEvent) => {
    const valor = (evento.target as HTMLDataElement).value;
    console.log("Valor filtro Data: ", valor);
    definirDataInicial(valor);
  };

  const [importancia, definirImportancia] = useState<number>(
    templateSelecionado.importancia ?? 3
  );
  const [dificuldade, definirDificuldade] = useState<number>(
    templateSelecionado.importancia ?? 3
  );
  const [nome, definirNome] = useState<any>("");
  const [observacao, definirObservacao] = useState<string>("");
  const [recompensa, definirRecompensa] = useState<number>(1);
  const [dataInicial, definirDataInicial] = useState<any>();
  const [dataFinal, definirDataFinal] = useState<any>();

  useEffect(() => {
    if (templateSelecionado) {
      console.log(templateSelecionado)
      definirRecompensa(templateSelecionado.recompensa ?? 1);
      definirNome(templateSelecionado.nome ?? "");
      definirObservacao(templateSelecionado.observacao);
      definirImportancia(templateSelecionado.importancia ?? 1);
      definirDificuldade(templateSelecionado.dificuldade ?? 1);

      definirDataInicial(templateSelecionado.dataInicio ?? 1);
      definirDataFinal(templateSelecionado.dataFim ?? 1);
    }
  }, [templateSelecionado]);

  const teste = () => {
    console.log(`
      Nome: ${nome}
      Observação: ${observacao}
      Importância: ${importancia}
      Deficuldade: ${dificuldade}
      Data Inicial: ${dataInicial}
      Data Final: ${dataFinal}
      Atributo: ${Array(atributoSelecionado)}
      `)

    for (const atributo of atributoSelecionado) {
      console.log(atributo)
    }
  }

  return (
    <IonApp>
      <IonHeader>
        <BarraSuperior icone={book} titulo="Cadastrar Tarefa" />
      </IonHeader>
      <IonContent color="tertiary">
        {/*<IonButton onClick={teste}>TESTE</IonButton>*/}
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
                      <IonItem color="secondary">
                        <IonSelect
                          multiple={true}
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
                    <IonItem color="secondary">
                      <IonInput
                        onIonInput={capturaMudancaNome}
                        label="Nome"
                        label-placement="floating"
                        placeholder="Insira o nome da tarefa"
                        id="nome-input"
                        color="dark"
                        value={nome}
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol>
                    <IonItem color="secondary">
                      <IonTextarea
                        onIonInput={capturaMudancaObservacao}
                        label="Observação"
                        label-placement="floating"
                        placeholder="Insira a observação da tarefa"
                        autoGrow={true}
                        id="observacao-input"
                        color="dark"
                        value={observacao}
                      ></IonTextarea>
                    </IonItem>
                  </IonCol>
                </IonRow>

                {/*<IonRow>
                  <IonCol>
                    <IonItem color="secondary">
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
                </IonRow>*/}

                <IonRow>
                  <IonCol>
                    <IonItem color="secondary" className="ion-text-center">
                      <IonLabel>Importância</IonLabel>
                    </IonItem>
                    <IonItem color="secondary">
                      <IonRange
                        style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
                        min={1}
                        max={5}
                        step={1}
                        snaps={true}
                        value={importancia}
                        onIonChange={capturaMudancaImportancia}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>

                {/*<IonRow>
                  <IonCol>
                    <IonItem color="secondary">
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
                </IonRow>*/}

                <IonRow>
                  <IonCol>
                    <IonItem color="secondary" className="ion-text-center">
                      <IonLabel>Dificuldade</IonLabel>
                    </IonItem>
                    <IonItem color="secondary">
                      <IonRange
                        style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
                        min={1}
                        max={5}
                        step={1}
                        snaps={true}
                        value={dificuldade}
                        onIonChange={capturaMudancaDificuldade}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol>
                    <IonItem color="secondary">
                      <IonInput
                        onIonChange={capturaMudancaDataInicial}
                        type="date"
                        label="Data Inicial"
                        label-placement="floating"
                        placeholder="Insira a data"
                        id="data-input"
                        color="dark"
                        value={dataInicial}
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol>
                    <IonItem color="secondary">
                      <IonInput
                        onIonChange={capturaMudancaDataFinal}
                        type="date"
                        label="Data Final"
                        label-placement="floating"
                        placeholder="Insira a data"
                        id="data-input"
                        color="dark"
                        value={dataFinal}
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
