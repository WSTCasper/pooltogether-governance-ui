import { useQuery } from 'react-query'
import gql from 'graphql-tag'
import { request } from 'graphql-request'
import { useGovernanceChainId } from '@pooltogether/hooks'

import {
  DELEGATES_PER_PAGE,
  getGovernanceGraphUrl,
  QUERY_KEYS,
  VOTERS_PER_PAGE
} from 'lib/constants'

export function useAllDelegates(pageNumber) {
  const { refetch, data, isFetching, isFetched, error } = useFetchDelegates(pageNumber)

  if (error) {
    console.error(error)
  }

  return {
    refetch,
    data,
    isFetching,
    isFetched,
    error
  }
}

function useFetchDelegates(pageNumber) {
  const chainId = useGovernanceChainId()

  return useQuery(
    [QUERY_KEYS.delegatesQuery, chainId, pageNumber],
    async () => {
      return getDelegates(pageNumber, chainId)
    },
    {
      enabled: Boolean(chainId)
    }
  )
}

async function getDelegates(pageNumber, chainId) {
  const query = delegatesQuery()

  const variables = { first: DELEGATES_PER_PAGE, skip: pageNumber * VOTERS_PER_PAGE }

  try {
    const subgraphData = await request(getGovernanceGraphUrl(chainId), query, variables)

    return subgraphData
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
    return {}
  }
}

const delegatesQuery = () => {
  return gql`
    query delegatesQuery($first: Int, $skip: Int) {
      delegates(first: $first, skip: $skip, orderBy: "delegatedVotesRaw", orderDirection: "desc") {
        id
        delegatedVotesRaw
        proposals {
          id
        }
      }
    }
  `
}
