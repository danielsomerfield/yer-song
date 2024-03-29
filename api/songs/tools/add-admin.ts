import { DynamoDB } from "@aws-sdk/client-dynamodb";
import * as readline from "readline";
import { createUserRepository } from "../respository/user-repository";
import * as bcrypt from "bcryptjs";
import { User } from "../domain/user";

const usage = () => {
  console.log("usage: add-admin <username> [dynamodb endpoint]");
  process.exit(1);
};

(async function main() {
  if (process.argv.length < 3) {
    usage();
  }

  const endpoint = process.argv.length < 4 ? undefined : process.argv[3];
  const dynamodb = new DynamoDB({
    endpoint: endpoint,
  });

  const username = process.argv[2];
  const rl = readline.createInterface(process.stdin, process.stdout);
  const userRepo = createUserRepository(dynamodb);

  rl.write("This script generates admin users.\n");
  rl.write(
    "You must be logged in as an aws user who can write to the dynamodb tables for this to work.\n\n"
  );
  rl.write(
    `Connecting to dynamo instance: ${endpoint || "default from user config"}\n`
  );

  const printUpdateMessage = async (user: User) => {
    try {
      rl.write("\n");
      rl.write("#####  User update succeeded ####");
      rl.write("\n");
      rl.write(JSON.stringify(user));
      rl.write("\n");
      rl.close();
    } catch (e) {
      rl.write("#### Failed to create user ####");
      rl.write(JSON.stringify(e));
      rl.close();
    }
  };

  rl.question(
    `Please enter a password for user ${username}: `,
    async (password) => {
      if (password.length < 8) {
        rl.write("Password must be at least 8 characters long");
        rl.close();
        process.exit(1);
      } else {
        const existingUser = await userRepo.findUserByName(username);
        if (existingUser) {
          rl.question(
            `A user with the name ${username} already exists. Do you wish to update it? y / n `,
            async (updateExisting) => {
              if (updateExisting == "y") {
                rl.write("Updating user\n");
                const user = await userRepo.updateUser({
                  ...existingUser,
                  name: username,
                  roles: ["administrator"],
                  passwordHash: bcrypt.hashSync(password, 12),
                });
                await printUpdateMessage(user);
                rl.close();
              } else {
                rl.write("Canceling\n");
                rl.close();
                process.exit(1);
              }
            }
          );
        } else {
          rl.write("Creating new user\n");
          const user = await userRepo.insertUser({
            name: username,
            roles: ["administrator"],
            passwordHash: bcrypt.hashSync(password, 12),
          });
          await printUpdateMessage(user);
          rl.close();
        }
      }
    }
  );
})();
