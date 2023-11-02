import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

type Dependencies = {
  clearVotes: (id: string) => Promise<void>;
};

export const createRunAdminCommandLambda = (dependencies: Dependencies) => {
  const { clearVotes } = dependencies;

  const removeSongCommand = async (songId: string) => {
    await clearVotes(songId);
  };

  const commands = {
    remove: removeSongCommand,
  };

  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const resource = event.pathParameters?.resource;
    const command = event.pathParameters?.command;
    console.log(`Ran admin command ${command} on resource ${resource}`);

    if (!resource || !command) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: "ERR",
          message: "missing required fields",
        }),
      };
    }
    const toExecute = commands[command as keyof typeof commands];

    if (toExecute) {
      await toExecute(resource);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "OK" }),
    };
  };
};
