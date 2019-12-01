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
      permalink
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
          //TODO:FIXME! return
        }
        props.setIsRating(true)
        debugger

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
          props.setIsRating(false)
          props.setRated(true)
        })
      },
    })
  }),
)(component)
