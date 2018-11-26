import { compose, withState, withProps } from 'recompose'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

export default (component) => compose(
  withState('isRating', 'setIsRating', false),
  withState('rated', 'setRated', false),

  graphql(gql`
  mutation rateShitpost($shitpostId: ID!, $ratingId: ID!) {
    rateShitpost(id: $shitpostId, ratingId: $ratingId) {
      id
      fakeReactions {
        emoji
        count
      }
      reactions {
        rating {
          id
        }
        user {
          id
        }
      }
    }
  }
  `),
  withProps((props) => {
    const ratesString = window.localStorage.getItem('rates')
    const rates = new Set(
      ratesString
        ? JSON.parse(ratesString)
        : []
    )

    return ({
      rated: rates.has(props.shitpost.id),
      rate: (mutate) => (id) => (ratingId) => {
        if (rates.has(id)) {
          return
        }
        props.setIsRating(true)

        return mutate({
          variables: {
            shitpostId: id,
            ratingId,
          },
        }).then(() => {
          rates.add(id)
          window.localStorage.setItem(
            'rates',
            JSON.stringify(Array.from(rates))
          )
          props.setRated(true)
        })
      },
    })
  }),
)(component)
