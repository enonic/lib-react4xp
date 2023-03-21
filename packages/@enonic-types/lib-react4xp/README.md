# lib-react4p TS types

## Install

```bash
npm i --save-dev @enonic-types/lib-react4xp
```

## Use

Add the corresponding types to your `tsconfig.json` file that is used for application's server-side TypeScript code:

```json
{
  "compilerOptions": {
    "paths": {
      "/lib/enonic/react4xp": ["node_modules/@enonic-types/lib-react4xp"],
    },
    "types": [
      "@enonic-types/lib-react4xp"
    ]
  }
}
```
