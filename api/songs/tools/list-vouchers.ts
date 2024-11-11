import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { createVoucherRepository } from "../respository/voucher-repository";
import { Voucher } from "../domain/voucher";

// const usage = () => {
//   console.log("usage: list-vouchers <dynamodb_endpoint>\n");
//   console.log(
//     "<dynamodb_endpoint> (optional) - the dynnamo endpoint to hit. Uses regional defaults if not set. Override for testing.\n"
//   );
//   console.log(
//     "You must be logged in as an aws user who can write to the dynamodb tables for this to work.\n\n"
//   );
//   process.exit(1);
// };

(async function main() {
  const endpoint = process.argv.length < 3 ? undefined : process.argv[2];
  const dynamodb = new DynamoDB({
    endpoint: endpoint,
  });

  const voucherRepository = createVoucherRepository(dynamodb);
  const vouchers: Voucher[] = await voucherRepository.listVouchers();
  vouchers.forEach((v) => {
    console.log(`${v.code} : $${v.value}`);
  });
})();
