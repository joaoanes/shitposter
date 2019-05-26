defmodule ShitposterBackend.GraphQL.Types.Shitpost do
  use Absinthe.Schema.Notation
  use Absinthe.Relay.Schema.Notation, :classic
  use Absinthe.Ecto, repo: ShitposterBackend.Repo
  alias ShitposterBackend.GraphQL.Resolvers

  @desc "Possible shitpost types"
  enum :shitpost_type do
    value :image, description: "Static image file (.png, .jpg, .tiff)", as: "image"
    value :animated_image, description: "Dynamic image file. (.gif (hard g), .apng)", as: "animated_image"
    value :mute_video, description: "Mute video file (.gif, .webm, .mp4)", as: "mute_video"
    value :video, description: "Video file with sound (.webm, .mp4)", as: "video"
    value :youtube, description: "Youtube link", as: "youtube"
    value :tweet, description: "Tweet from twitter", as: "tweet"
    value :facebook_post, description: "Post from facebook", as: "facebook_post"
    value :amp, description: "News article (AMP only)", as: "amp"
    value :medium_post, description: "Post from Medium", as: "medium_post"
    value :webpage, description: "Simple link to a generic webpage", as: "webpage"
  end

  @desc "Shitpost"
  connection node_type: :shitpost
  object :shitpost do
    field :id, :id
    field :name, :string
    field :permalink, :string
    field :type, :shitpost_type
    field :url, :string
    field :url_date, :string
    field :source, :user, resolve: assoc(:source)
    field :submitter, :user, resolve: assoc(:submitter)
    field :reactions, list_of(:reaction), resolve: assoc(:reactions)
    field :fake_reactions, list_of(:fake_reaction), resolve: Resolvers.run(
      &ShitposterBackend.Shitpost.count_ratings/1,
      [
        [:source, :id],
      ]
    )
  end

  @desc "Source"
  object :source do
    field :name, :string
  end

  @desc "Rating"
  object :rating do
    field :emoji, :string
    field :id, :integer
  end

  object :fake_reaction do
    field :emoji, :string
    field :count, :integer
  end

  @desc "Reactions"
  object :reaction do
    field :user, :user, resolve: assoc(:user)
    field :shitpost, :shitpost, resolve: assoc(:shitpost)
    field :rating, :rating, resolve: assoc(:rating)
  end

  @desc "Reactions input"
  input_object :reaction_input do
    field :user_id, :integer
    field :shitpost_id, :integer
    field :rating_id, :integer
  end

end
