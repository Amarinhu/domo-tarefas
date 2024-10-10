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
import { apps, book, close, closeCircle, grid, save } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/core/components";
import armazenamento from "../armazenamento";

const PaginaTarefaEdicao: React.FC = () => {
  const [carregamento, definirCarregamento] = useState<boolean>(false);
  const [resultadoCadastro, definirResultadoCadastro] = useState<string>("");
  const [templateSelecionado, definirTemplateSelecionado] = useState<any>([]);
  const [atributoSelecionado, definirAtributoSelecionado] = useState<Array<any>>([]);

  const [templates, definirTemplates] = useState<any>([]);
  const [atributos, definirAtributos] = useState<any>([]);

  const location = useLocation();
  const parametros = new URLSearchParams(location.search);
  const id = parametros.get('id');

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const navegar = useHistory();

  useEffect(() => {
    try {
      definirCarregamento(true)
      carregaTemplates();
      buscaAtributos();
      carregaEdicao();
    } catch (erro) {
      console.error()
    } finally {
      definirCarregamento(false)
    }
  }, [iniciado]);

  const carregaTemplates = async () => {
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      const resultado = await db?.query(
        `SELECT * from template`,
      );
      definirTemplates(resultado?.values);
    });
  };

  const carregaEdicao = async () => {
    if (id) {
      const comandoSQL = ` 
      SELECT 
      tarefa.id,
      tarefa.nome, 
      tarefa.observacao, 
      tarefa.importancia, 
      tarefa.dificuldade, 
      tarefa.dataInicio,
      tarefa.dataFim,
      GROUP_CONCAT(atributo.id) as ids
      FROM tarefa
        JOIN
            ListaAtributos ON tarefa.id = ListaAtributos.tarefa_id
        JOIN
            Atributo ON ListaAtributos.atributo_id = Atributo.id
        WHERE tarefa.ID = ? `
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const resultado = await db?.query(comandoSQL, [id])
        console.log(resultado)
        if (resultado && resultado.values && resultado.values.length > 0) {
          const valores = resultado.values
          definirNome(valores?.[0].nome)
          definirObservacao(valores?.[0].observacao)
          definirDataFinal(valores?.[0].dataFim)
          definirDataInicial(valores?.[0].dataInicio)
          definirImportancia(valores?.[0].importancia)
          definirDificuldade(valores?.[0].dificuldade)
          definirAtributoSelecionado((valores?.[0].ids).split(',').map(Number))
        }
      })
    }
  }

  const editarTarefa = async () => {
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
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(
          ` INSERT OR REPLACE INTO Tarefa (id, nome, observacao, 
          importancia, dificuldade, dataInicio, dataFim, completa, ativo)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            nomeInserido,
            observacaoInserida,
            importanciaInserida,
            dificuldadeInserida,
            dataIniInserida,
            dataFimInserida,
            0,
            1
          ]
        );

        definirResultadoCadastro("Tarefa editada com sucesso!");
      });
    } catch (erro) {
      console.log(erro);
      definirResultadoCadastro(
        "Erro ao cadastrar tarefa. Tente novamente mais tarde."
      );
    } finally {
      /*navegar.replace("/PainelDeTarefas");*/
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
  const [dataInicial, definirDataInicial] = useState<any>();
  const [dataFinal, definirDataFinal] = useState<any>();

  useEffect(() => {
    if (templateSelecionado) {
      definirNome(templateSelecionado.nome ?? "");
      definirObservacao(templateSelecionado.observacao);
      definirImportancia(templateSelecionado.importancia ?? 1);
      definirDificuldade(templateSelecionado.dificuldade ?? 1);
    }
  }, [templateSelecionado]);

  const teste = async () => {
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      await db?.query(
        ` INSERT OR REPLACE INTO Tarefa (id, nome, observacao, importancia, dificuldade, dataInicio, dataFim)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          nome,
          observacao,
          importancia,
          dificuldade,
          dataInicial,
          dataFinal
        ]
      );
    })
  }

  return (
    <IonApp>
      <IonHeader>
        <BarraSuperior icone={book} titulo="Editar Tarefa" />
      </IonHeader>
      <IonContent color="tertiary">
        <IonButton onClick={teste}>TESTE</IonButton>
        <div className="ion-padding">
          {carregamento ? (
            <CirculoCarregamento />
          ) : (
            <>
              {nome && observacao && importancia && dificuldade && dataFinal && dataInicial ? <IonGrid className="ion-text-center ion-margin">
                {false && atributos && atributoSelecionado ? (
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
                        label="Data Inicial"
                        label-placement="floating"
                        placeholder="Insira a data"
                        id="data-input"
                        color="dark"
                        value={dataFinal}
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonButton onClick={editarTarefa}>
                  <IonIcon icon={save} slot="start" />
                  <IonLabel>Editar</IonLabel>
                </IonButton>
                <PopupResultado resultado={resultadoCadastro} />
              </IonGrid> : null}
            </>
          )}
        </div>
      </IonContent>
    </IonApp>
  );
};

export default PaginaTarefaEdicao;
