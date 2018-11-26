import { compose, withProps } from 'recompose'
import ShitpostCard from '../components/ShitpostCard'
import ShitpostCardMutation from '../hocs/ShitpostCardMutation'

const EnhancedShitpostCard = compose(
  ShitpostCardMutation,
  withProps((props) => ({
    ratePost: (ratingId) => {
      const { mutate, shitpost, rate } = props

      return rate(mutate)(shitpost.id)(ratingId)
    },
  }))
)(ShitpostCard)

export default EnhancedShitpostCard
