https://vite.dev/guide/static-deploy

https://vite.dev/guide/build.html#multi-page-app

==
rm -rf dist

```bash

mkdir -p ./dist/src/components;
# copy all components files
cp -r src/components/ ./dist/src/components;
#  delete typescript files
find ./dist/src/components -name "*.ts"  -exec rm -r "{}" \;
```

==

https://stackoverflow.com/questions/15617016/copy-all-files-with-a-certain-extension-from-all-subdirectories

--parents not on mac

```bash
find ./src/components -name "template.html" -print0 | xargs -0  cp  --parents {} ./dist \;
```

==

https://stackoverflow.com/questions/11246070/cp-parents-option-on-mac

```bash
rsync -R ./src/components/**/template.html ./dist
```

==

viteStaticCopy plugin to copy static files

copies all template files, and creates one src/foo/template.html

```js
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "src/components/**/template.html",
          dest: `src/foo/`,
        },
      ],
    }),
  ],
});
```
