const pkg = JSON.parse(
  Deno.readTextFileSync(new URL("../package.json", import.meta.url)),
) as {
  name: string;
  productName: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage: string;
};

export default pkg;
