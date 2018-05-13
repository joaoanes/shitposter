defmodule ShitposterBackend.GraphQL.Types.Shitpost do
  use Absinthe.Schema.Notation
  use Absinthe.Relay.Schema.Notation
  use Absinthe.Ecto, repo: ShitposterBackend.Repo

  @desc "Possible shitpost types"
  enum :shitpost_type do
    value :image, description: "Static image file (.png, .jpg, .tiff)", as: "image"
    value :animated_image, description: "Dynamic image file. (.gif (hard g), .apng)"
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
    field :rating, :integer
    field :source, :user, resolve: assoc(:source)
    field :submitter, :user, resolve: assoc(:submitter)
  end

  @desc "Source"
  object :source do
    field :name, :string
  end

end
