import { createKernelAccount, addressToEmptyAccount } from "@zerodev/sdk"
import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { toMultiChainECDSAValidator } from "@zerodev/multi-chain-validator"
import { http, createPublicClient } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { mode } from "viem/chains"
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless"
import { toECDSASigner } from '@zerodev/permissions/signers'
import { toPermissionValidator, serializePermissionAccount, deserializePermissionAccount } from '@zerodev/permissions'
import dotenv from 'dotenv'
dotenv.config()

const PROJECT_ID = process.env.ZERODEV_MODE_ID;

const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}?provider=ZERODEV`
 
const chain = mode
const entryPoint = ENTRYPOINT_ADDRESS_V07
const kernelVersion = KERNEL_V3_1
const useMetaFactory = false
 
const main = async () => {
  // Construct a signer
  const privateKey = generatePrivateKey()
  const signer = privateKeyToAccount(privateKey)
 
  // Construct a public client
  const publicClient = createPublicClient({
    chain,
    transport: http(BUNDLER_RPC),
  })
 
  // Construct a validator
  const ecdsaValidator = await toMultiChainECDSAValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion
  })

  // Create session key
  const sessionPrivateKey = generatePrivateKey()
  const sessionKeySigner = await toECDSASigner({
    signer: privateKeyToAccount(sessionPrivateKey),
  })
  const sessionKeyAddress = sessionKeySigner.account.address
  const emptyAccount = addressToEmptyAccount(sessionKeyAddress)
  const emptySessionKeySigner = await toECDSASigner({ signer: emptyAccount })
  
  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    kernelVersion,
    signer: emptySessionKeySigner,
    policies: [],
  })

  // Create session account
  const sessionKeyAccount = await createKernelAccount(publicClient, {
    entryPoint,
    kernelVersion,
    plugins: {
      sudo: ecdsaValidator,
      regular: permissionPlugin,
    },
    useMetaFactory: useMetaFactory 
  })
  const approval = await serializePermissionAccount(sessionKeyAccount)
  const deserializedSessionKeyAccount = await deserializePermissionAccount(
    publicClient,
    entryPoint,
    KERNEL_V3_1,
    approval,
    sessionKeySigner
  );
  console.log('deserializedSessionKeyAccount', deserializedSessionKeyAccount)
}
 
main()
