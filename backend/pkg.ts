export interface PackageMeta {
  name: string;
  productName: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage: string;
}

const pkg = JSON.parse(
  Deno.readTextFileSync(new URL("../package.json", import.meta.url)),
) as PackageMeta;

export default pkg;
