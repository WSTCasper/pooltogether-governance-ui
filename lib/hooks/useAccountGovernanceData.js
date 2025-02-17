import { useQuery } from 'react-query'
import gql from 'graphql-tag'
import { request } from 'graphql-request'
import { useOnboard, useGovernanceChainId } from '@pooltogether/hooks'

import { MAINNET_POLLING_INTERVAL, getGovernanceGraphUrl, QUERY_KEYS } from 'lib/constants'
import { testAddress } from 'lib/utils/testAddress'

import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'

export const accountGovernanceDataQueryAtom = atom({})

export function useAccountGovernanceData() {
  const { refetch, data, isFetching, isFetched, error } = useAccountGovernanceDataQuery()

  const [accountGovernanceData, setAccountGovernanceData] = useAtom(accountGovernanceDataQueryAtom)

  if (error) {
    console.error(error)
  }

  useEffect(() => {
    setAccountGovernanceData({
      refetch,
      data,
      isFetching,
      isFetched,
      error
    })
  }, [isFetching, isFetched])

  return {
    refetch,
    data,
    isFetching,
    isFetched,
    error
  }
}

function useAccountGovernanceDataQuery() {
  const { address: usersAddress } = useOnboard()
  const chainId = useGovernanceChainId()
  const error = testAddress(usersAddress)

  const refetchInterval = MAINNET_POLLING_INTERVAL

  return useQuery(
    [QUERY_KEYS.accountGovernanceDataQuery, chainId, usersAddress],
    async () => {
      return getAccountGovernanceData(chainId, usersAddress)
    },
    {
      enabled: Boolean(chainId && usersAddress && !error),
      refetchInterval
    }
  )
}

async function getAccountGovernanceData(chainId, accountAddress) {
  const query = accountGovernanceDataQuery()

  const variables = {
    accountAddress: accountAddress
  }

  try {
    const data = await request(getGovernanceGraphUrl(chainId), query, variables)

    return data
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
    return {}
  }
}

const accountGovernanceDataQuery = () => {
  return gql`
    query accountGovernanceDataQuery($accountAddress: String!) {
      proposals(where: { proposer: $accountAddress }) {
        id
        proposer {
          id
        }
      }
    }
  `
}
