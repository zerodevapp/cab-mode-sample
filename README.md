## Zerodev CAB on Mode Chain

### I. Set env

create env file and set `ZERODEV_MODE_ID` & `CAB_PAYMASTER_RPC`
```bash
cp .env.example .env
```


### II. Install

```bash
bun install
```

### III. Run

- Run session sample
    ```bash
    ts-node session.ts
    ```

- Run cab sample
    1. Run [cab-worker](https://github.com/zerodevapp/yield-worker/tree/142e7d54ff1d009b5b707d0786d6df598bd7b22a)

       **Note**: Add `MODE_API_KEY` in .env
    3. Run [cab-server](https://github.com/zerodevapp/old-cab-paymaster-service/tree/954f4f79677de26014700851c1015703178190c5)
       **Note**: Add `ZERODEV_MODE_API_KEY` in .env

    5. Run cab sample

        ```bash
        ts-node cab.ts
        ```

### IV. Issue
Throw the error when decoding account with `useMetaFactory=false`


```
/Users/justintesng/Desktop/projects/testing/zerodev/cab-mode/node_modules/viem/utils/abi/decodeFunctionData.ts:67
    throw new AbiFunctionSignatureNotFoundError(signature, {
          ^
AbiFunctionSignatureNotFoundError: Encoded function signature "0xea6d13ac" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.
You can look up the signature here: https://openchain.xyz/signatures?query=0xea6d13ac.

Docs: https://viem.sh/docs/contract/decodeFunctionData
Version: viem@2.17.11
    at decodeFunctionData (/Users/justintesng/Desktop/projects/testing/zerodev/cab-mode/node_modules/viem/utils/abi/decodeFunctionData.ts:67:11)
    at decodeParamsFromInitCode (/Users/justintesng/Desktop/projects/testing/zerodev/cab-mode/node_modules/@zerodev/permissions/deserializePermissionAccount.ts:136:61)
    at deserializePermissionAccount (/Users/justintesng/Desktop/projects/testing/zerodev/cab-mode/node_modules/@zerodev/permissions/deserializePermissionAccount.ts:87:66)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async main (/Users/justintesng/Desktop/projects/testing/zerodev/cab-mode/session.ts:67:41) {
  details: undefined,
  docsPath: '/docs/contract/decodeFunctionData',
  metaMessages: undefined,
  shortMessage: 'Encoded function signature "0xea6d13ac" not found on ABI.\n' +
    'Make sure you are using the correct ABI and that the function exists on it.\n' +
    'You can look up the signature here: https://openchain.xyz/signatures?query=0xea6d13ac.',
  version: 'viem@2.17.11'
}
```