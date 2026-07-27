/**
==========================================================
AURA Trade OS
NotebookLM Knowledge Provider
Version : 0.1.0 Alpha
==========================================================
*/

export interface NotebookResponse {

  success: boolean;

  provider: "notebooklm";

  content: string | null;

}

export interface NotebookQuery {

  question: string;

  notebookId?: string;

}

export class NotebookLMProvider {

  async query(

    query: NotebookQuery

  ): Promise<NotebookResponse> {

    console.warn(

      "[NotebookLM] Direct public API integration is not available."

    );

    console.info(

      "NotebookLM should be accessed through an internal integration layer or exported knowledge base."

    );

    return {

      success: false,

      provider: "notebooklm",

      content: null,

    };

  }

}

const notebookLM =
  new NotebookLMProvider();

export default notebookLM;
