import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { createVoucherRepository } from "../respository/voucher-repository";

const usage = () => {
  console.log("usage: generate-vouchers [count] [value] <dynamodb_endpoint>\n");
  console.log(
    "[count] - number of voucher to generate\n" +
      "[value] - the value to assign each voucher\n" +
      "<dynamodb_endpoint> (optional) - the dynnamo endpoint to hit. Uses regional defaults if not set. Override for testing.\n"
  );
  console.log(
    "You must be logged in as an aws user who can write to the dynamodb tables for this to work.\n\n"
  );
  process.exit(1);
};

const createVoucher = () => {
  return Math.random().toString(36).slice(2).toUpperCase();
};

(async function main() {
  if (process.argv.length < 3) {
    usage();
  }

  const endpoint = process.argv.length < 4 ? undefined : process.argv[4];
  const dynamodb = new DynamoDB({
    endpoint: endpoint,
  });

  const voucherCount = Number.parseInt(process.argv[2]);

  const voucherValue = Number.parseInt(process.argv[3]);
  const voucherRepository = createVoucherRepository(dynamodb);
  const vouchers = new Array(voucherCount);
  for (let i = 0; i < voucherCount; i++) {
    vouchers[i] = createVoucher();
  }
  await voucherRepository.addVouchers(vouchers, voucherValue);

  console.log("vouchers inserted");
})();
