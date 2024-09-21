import { useEffect, useState } from "react";
import BarraSuperior from "../components/BarraSuperior";
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
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonText,
  IonTextarea,
  IonToast,
} from "@ionic/react";
import {
  book,
  checkboxOutline,
  diamond,
  pencil,
  today,
  trash,
} from "ionicons/icons";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import { meses } from "../globalConstants/constantesGlobais";
import BarraInferior from "../components/BarraInferiorControles";

const PaginaBase: React.FC = () => {
  const [carregamento, defCarregamento] = useState<boolean>(false);
  const [mostraMensagem, defMostraMensagem] = useState<boolean>(false);
  const [texto, definirTexto] = useState<string>("");

  const [tarefaItens, defTarefaItens] = useState<Array<any>>([]);
  const [tarefaAtributoItens, defTarefaAtributoItens] = useState<Array<any>>(
    []
  );

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const buscaDados = async () => {
    const comandoSQL = `SELECT * FROM TAREFA TR WHERE TR.ATIVO = 1 AND TR.COMPLETA = 0`;
    const comandoSQL2 = `SELECT IMAGEM FROM ATRIBUTO AT 
    INNER JOIN ListaAtributos LA ON AT.ID = LA.ATRIBUTO_ID`;
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      const resultado = await db?.query(comandoSQL);
      if (resultado && resultado?.values && resultado?.values.length > 0) {
        defTarefaItens(resultado?.values);
      }

      const resultado2 = await db?.query(comandoSQL2);
      if (resultado2 && resultado2?.values && resultado2?.values.length > 0) {
        defTarefaAtributoItens(resultado2?.values);
      }
    });
  };

  const atributosTarefa = (idTarefa: number) => {
    const result = tarefaAtributoItens.filter(
      (tarefa) => (tarefa.id = idTarefa)
    );
    return result;
  };

  useEffect(() => {
    buscaDados();
  }, [iniciado]);

  const funcao = () => {
    defMostraMensagem(true);
  };

  const formatarData = (data: string) => {
    const dataPartes = data.split("-");
    const ano = parseInt(dataPartes[0], 10);
    const mes = parseInt(dataPartes[1], 10);
    const dia = parseInt(dataPartes[2], 10);

    const nomeMes = meses[mes - 1];
    return `${dia} de ${nomeMes}`;
  };

  const onOffCarregamento = () => {
    if (carregamento == false) {
      defCarregamento(true);
    } else {
      defCarregamento(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <BarraSuperior icone={book} titulo={"Tarefas"} />
      </IonHeader>

      <IonContent color="tertiary">
        <IonTextarea autoGrow={true} value={JSON.stringify(tarefaItens)} />
        {tarefaItens.map((tarefa) => (
          <IonCard color="secondary" key={tarefa.id}>
            <IonGrid style={{ padding: "0px" }}>
              <IonRow>
                <IonCol style={{ padding: "0rem" }}>
                  <IonCardHeader
                    style={{ paddingBottom: "0px", paddingTop: "0px" }}
                  >
                    <IonCardTitle
                      style={{ fontWeight: "bold" }}
                      className="ion-text-center"
                      color="light"
                    >
                      <IonRow>
                        <IonCol
                          size="10"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "0px",
                          }}
                        >
                          • {tarefa.nome}
                        </IonCol>
                        <IonCol
                          size="2"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <IonButton
                            href={`/PaginaTarefaEdicao?id=${tarefa.id}`}
                            color="warning"
                            fill="clear"
                          >
                            <IonIcon color="primary" icon={pencil}></IonIcon>
                          </IonButton>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "0px",
                          }}
                          size="10"
                        >
                          {atributosTarefa(tarefa.id).map((tarefaAtributo) => (
                            <div style={{ display: "inline-block" }}>
                              <IonImg
                                style={{
                                  width: "2.5rem",
                                  height: "2.5rem",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  overflow: "hidden",
                                }}
                                src={tarefaAtributo.imagem}
                              />
                            </div>
                          ))}
                        </IonCol>
                        <IonCol
                          size="2"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <IonButton
                            color="success"
                            fill="clear"
                            onClick={() => completarTarefa(tarefa.id)}
                          >
                            <IonIcon
                              size="large"
                              color="primary"
                              icon={checkboxOutline}
                            ></IonIcon>
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonCardTitle>
                  </IonCardHeader>
                </IonCol>
              </IonRow>
              <IonCardContent
                style={{ padding: "0rem", paddingBottom: "0.3rem" }}
              >
                <IonRow>
                  <IonCol style={{ paddingBottom: "0rem" }}>
                    <div className="ion-text-center">
                      <IonLabel>{tarefa.observacao}</IonLabel>
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
                        {formatarData(tarefa.data)}
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
                        {tarefa.recompensa}
                      </IonLabel>
                    </div>
                  </IonCol>
                  <IonCol></IonCol>
                </IonRow>
                {/*<IonRow>
                  <IonCol style={{ paddingBottom: "0rem" }}>
                    <IonButton
                      color="danger"
                      onClick={() => falharTarefa(tarefa.id)}
                    >
                      <IonIcon size="large" icon={closeCircle}></IonIcon>
                    </IonButton>
                    <div>
                      <IonAlert
                        trigger={`delecao-alerta-${tarefa.id}`}
                        header="Deletar Tarefa?"
                        message="Tem certeza que deseja deletar essa tarefa?"
                        buttons={[
                          {
                            text: "Confirmar",
                            handler: () => confirmaDelecao(tarefa.id),
                          },
                          {
                            text: "Cancelar",
                          },
                        ]}
                      ></IonAlert>
                    </div>
                  </IonCol>
                </IonRow>*/}
              </IonCardContent>
            </IonGrid>
          </IonCard>
        ))}
        <IonToast
          isOpen={mostraMensagem}
          message={texto}
          onDidDismiss={() => defMostraMensagem(false)}
          duration={5000}
        ></IonToast>
        {carregamento ? <CirculoCarregamento /> : null}
      </IonContent>
      <BarraInferior />
    </IonPage>
  );
};

export default PaginaBase;
