import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk"
import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { toMultiChainECDSAValidator } from "@zerodev/multi-chain-validator"
import { http, createPublicClient } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { mode } from "viem/chains"
import { ENTRYPOINT_ADDRESS_V07, bundlerActions } from "permissionless"
import { createKernelCABClient, CAB_V0_1 } from '@zerodev/cab';
import dotenv from 'dotenv'
dotenv.config()

const PROJECT_ID = process.env.ZERODEV_MODE_ID;
const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}?provider=ZERODEV`
const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${PROJECT_ID}?provider=ZERODEV`
const CAB_PAYMASTER_RPC = process.env.CAB_PAYMASTER_RPC;
 
const chain = mode
const entryPoint = ENTRYPOINT_ADDRESS_V07
const kernelVersion = KERNEL_V3_1
 
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
 
  // Construct a Kernel account
  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
    kernelVersion,
    useMetaFactory: false
  })
 
  // Construct a Kernel account client
  const kernelClient = createKernelAccountClient({
    account,
    chain,
    entryPoint,
    bundlerTransport: http(BUNDLER_RPC),
    middleware: {
      sponsorUserOperation: async ({ userOperation }) => {
        const zerodevPaymaster = createZeroDevPaymasterClient({
          chain,
          entryPoint,
          transport: http(PAYMASTER_RPC),
        })
        return zerodevPaymaster.sponsorUserOperation({
          userOperation,
          entryPoint,
        })
      },
    },
  }) 

  const cabClient = createKernelCABClient(kernelClient, {
    transport: http(CAB_PAYMASTER_RPC),
    entryPoint,
    cabVersion: CAB_V0_1
  })

  // enable CAB
  await cabClient.enableCAB({
    tokens: [{ name: "USDC", networks: [34443] }]
  })
 
  // Send a UserOp
  // mode USDC
  // const sponsorTokens = [
  //   {
  //     address: '0xd988097fb8612cc24eeC14542bC03424c656005f' as Address,
  //     amount: parseUnits('0.01', 6)
  //   }
  // ]
  // const calls = sponsorTokens.map(({ address, amount }) => ({
  //   to: address,
  //   data: encodeFunctionData({
  //     abi: erc20Abi,
  //     functionName: "transfer",
  //     args: [kernelClient.account.address, amount]
  //   }),
  //   value: 0n
  // }))

  // const userOperation = await cabClient.prepareUserOperationRequestCAB({
  //   calls,
  //   repayTokens: ["USDC"]
  // })
  // console.log('userOperation', userOperation);
}
 
main()
