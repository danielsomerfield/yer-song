export interface Configuration {
  songsAPIHostURL: string;
}

console.log("Running with envvars", process.env);

const getRequiredEnvVar = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
};

export const configuration: Configuration = {
  songsAPIHostURL: getRequiredEnvVar("REACT_APP_SONG_API_HOST"),
};
