import { compose, withProps, pure } from 'recompose'
import ShitpostCard from '../components/ShitpostCard'
import ShitpostCardMutation from '../hocs/ShitpostCardMutation'

export const enhance = compose(
  pure,
  ShitpostCardMutation,
  withProps((props) => ({
    ratePost: (ratingId) => {
      const { mutate, shitpost, rate } = props

      return rate(mutate)(shitpost.id)(ratingId)
    },
  })),
  pure,
)

export default enhance(ShitpostCard)
