import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import TituloBotaoVoltar from "../components/BarraSuperior";
import armazenamento from "../armazenamento";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import {
  bug,
  build,
  closeCircle,
  reloadCircle,
  server,
  trash,
  trashBin,
} from "ionicons/icons";


const AssistenteDev: React.FC = () => {
  const [BancoItens, definirBancoItens] = useState<Array<any>>();
  const [estadoCarregamento, definirCarregamento] = useState(false);

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();
  const respostaTarefasQuery = `SELECT 
    tarefa.id,
    tarefa.nome, 
    tarefa.observacao, 
    tarefa.recompensa, 
    tarefa.data
    FROM 
      tarefa`;

  useEffect(() => {
    carregaDados();
  }, [iniciado]);

  const recarregarPagina = () => {
    location.reload();
  };

  const capturaIdUsuarioPromise = async () => {
    const resultado = await armazenamento.get('idUsuario')
    return await resultado
  }

  const obterIdUsuario = async() => {
    const idUsuarioAtual: any = await capturaIdUsuarioPromise();
    return idUsuarioAtual
  }


  const carregaDados = async () => {
    try {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const respostaSQLSelect = await db?.query(respostaTarefasQuery);
        definirBancoItens(respostaSQLSelect?.values);
      });
    } catch (erro) {
      console.log(erro);
      definirBancoItens([]);
    }
  };

  const deletarTabela = async () => {
    try {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query("DROP TABLE IF EXISTS Usuario;");
        await db?.query("DROP TABLE IF EXISTS Template;");
        await db?.query("DROP TABLE IF EXISTS Tarefa;");
        await db?.query("DROP TABLE IF EXISTS Atributo;");
        await db?.query("DROP TABLE IF EXISTS ListaAtributos;");
      });
    } catch (erro) {
      console.log(erro);
    }
  };

  const paraCarregamento = () => {
    if (estadoCarregamento == true) {
      definirCarregamento(false);
    } else {
      definirCarregamento(true);
    }
    console.log(BancoItens);
  };

  const limparTabelas = async () => {
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query("DELETE FROM Template;");
        await db?.query("DELETE FROM Atributo;");
        await db?.query("DELETE FROM Usuario;");
        await db?.query("DELETE FROM ListaAtributos;");
        await db?.query("DELETE FROM Tarefa;");

        const respostaSQLSelect = await db?.query(respostaTarefasQuery);
        definirBancoItens(respostaSQLSelect?.values);
      });

      await carregaDados();
      
      recarregarPagina();
    } catch (erro) {
      console.log(erro);
    }
  };

  const testarArbitrario = async () => {
    try {
      definirCarregamento(true);
      console.log(await obterIdUsuario())
    } catch (erro) {
      console.log(erro);
    } finally {
      definirCarregamento(false);
    }
  };

  const mostraBanco = () => {
    executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      let a = await db?.query(`SELECT * from Usuario`);
      let b = await db?.query(`SELECT * from Template`);
      let c = await db?.query(`SELECT * from Tarefa`);
      let d = await db?.query(`SELECT * from Atributo`);
      let e = await db?.query(`SELECT * from ListaAtributos`);

      console.log("Usuario");
      console.log(a);
      console.log("Template");
      console.log(b);
      console.log("Tarefa");
      console.log(c);
      console.log("Atributo");
      console.log(d);
      console.log("ListaAtributos");
      console.log(e);
    });
  };

  return (
    <IonPage>
      <TituloBotaoVoltar titulo="Assistente" icone={build} />
      <IonContent color="tertiary">
        <IonCard color="secondary">
          <IonCardContent>
            <IonButtons>
              <IonButton onClick={recarregarPagina}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={reloadCircle}
                ></IonIcon>
                <IonLabel>Recarregar</IonLabel>
              </IonButton>

              <IonButton onClick={paraCarregamento}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={closeCircle}
                ></IonIcon>
                <IonLabel>On/Off</IonLabel>
              </IonButton>
            </IonButtons>
          </IonCardContent>
        </IonCard>

        <IonCard color="secondary">
          <IonCardContent>
            <IonButtons>
              <IonButton onClick={limparTabelas}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={trashBin}
                ></IonIcon>
                <IonLabel>Limpa Tab</IonLabel>
              </IonButton>

              <IonButton onClick={deletarTabela}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={trash}
                ></IonIcon>
                <IonLabel>Deleta Tab</IonLabel>
              </IonButton>
            </IonButtons>
          </IonCardContent>
        </IonCard>

        <IonCard color="secondary">
          <IonCardContent>
            <IonButtons>
              <IonButton onClick={testarArbitrario}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={bug}
                ></IonIcon>
                <IonLabel>Wild Card</IonLabel>
              </IonButton>
            </IonButtons>
          </IonCardContent>
        </IonCard>

        <IonCard color="secondary">
          <IonCardContent>
            <IonButtons>
              <IonButton onClick={mostraBanco}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={server}
                ></IonIcon>
                <IonLabel>Ver Banco</IonLabel>
              </IonButton>
            </IonButtons>
          </IonCardContent>
        </IonCard>

        <div className="ion-padding">
          {estadoCarregamento ? (
            <CirculoCarregamento />
          ) : (
            BancoItens?.map((item) => (
              <IonCard color="secondary" key={item?.id}>
                <IonCardContent>
                  <IonCardTitle color="light">Nome: {item.nome}</IonCardTitle>
                  <IonItem color="light">OBS: {item.observacao}</IonItem>
                  <IonItem color="light">Recompensa: {item.recompensa}</IonItem>
                  <IonItem color="light">Data: {item.data}</IonItem>
                </IonCardContent>
              </IonCard>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AssistenteDev;
