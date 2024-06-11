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
  const [idUsuario, definirIdUsuario] = useState();
  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

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
    carregaDados();
  }, [iniciado]);

  const recarregarPagina = () => {
    location.reload();
  };

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

  const insercaoTeste = () => {
    const comandoSQL = `
    -- Inserts para Usuario
    INSERT INTO Usuario (email, token, nome, descricao, banco, ativo) VALUES 
    ('gabriel@exemplo.com', '$2a$10$cpDosrx3DyxZ.D4eII1yGe96TU9gqcOF2mpdZgAzw0n5vOOi50tCy', 'Gabriel', 'Descrição para usuário um', 100, 1),
    ('marcelo@exemplo.com', '$2a$10$cpDosrx3DyxZ.D4eII1yGe96TU9gqcOF2mpdZgAzw0n5vOOi50tCy', 'Marcelo', 'Descrição para usuário dois', 200, 1);

    -- Inserts para Template
    INSERT INTO Template (nome, observacao, importancia, dificuldade, recompensa, usuario_id, ativo) VALUES 
    ('Template de Programação', 'Template para tarefas de programação', 5, 5, 300, 1, 1),
    ('Template de Exercício Físico', 'Template para tarefas de exercícios físicos', 4, 4, 200, 2, 1),
    ('Template de Estudos', 'Template para tarefas de estudo', 3, 3, 150, 1, 1),
    ('Template de Criatividade', 'Template para tarefas criativas', 4, 4, 200, 2, 1),
    ('Template Social', 'Template para tarefas sociais', 2, 2, 100, 1, 1);

    -- Inserts para Tarefa
    INSERT INTO Tarefa (nome, observacao, importancia, recompensa, dificuldade, data, usuario_id, completa, ativo) VALUES 
    ('Completar projeto de programação', 'Trabalhar no projeto X', 5, 300, 5, '2024-06-15', 1, 0, 1),
    ('Treino de força na academia', 'Fazer treino completo de força', 4, 200, 4, '2024-06-16', 1, 0, 1),
    ('Estudar para a prova', 'Revisar o material para a prova de amanhã', 3, 150, 3, '2024-06-17', 2, 0, 1),
    ('Criar uma obra de arte', 'Desenvolver uma pintura ou escultura', 4, 200, 4, '2024-06-18', 2, 0, 1),
    ('Participar de evento social', 'Ir ao evento e fazer networking', 2, 100, 2, '2024-06-19', 1, 0, 1);

    -- Inserts para Atributo
    INSERT INTO Atributo (nome, descricao, xp, ativo) VALUES 
    ('PRO', 'Atributo relacionado a programação', 10, 1),
    ('FOR', 'Atributo relacionado a força física', 20, 1),
    ('INT', 'Atributo relacionado a inteligência', 30, 1),
    ('CRE', 'Atributo relacionado a criatividade', 40, 1),
    ('SOC', 'Atributo relacionado a habilidades sociais', 50, 1);

    -- Inserts para ListaAtributos
    INSERT INTO ListaAtributos (atributo_id, tarefa_id, ativo) VALUES 
    (1, 6, 1),  -- PRO para tarefa 'Completar projeto de programação'
    (2, 7, 1),  -- FOR para tarefa 'Treino de força na academia'
    (3, 8, 1),  -- INT para tarefa 'Estudar para a prova'
    (4, 9, 1),  -- CRE para tarefa 'Criar uma obra de arte'
    (5, 10, 1); -- SOC para tarefa 'Participar de evento social'`;

    executarAcaoSQL( async (db: SQLiteDBConnection | undefined) => {
      await db?.query(comandoSQL)
    })
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
              <IonButton onClick={insercaoTeste}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={bug}
                ></IonIcon>
                <IonLabel>Inserção</IonLabel>
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
