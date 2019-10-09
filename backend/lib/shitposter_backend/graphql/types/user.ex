defmodule ShitposterBackend.GraphQL.Types.User do
  use Absinthe.Schema.Notation
  use Absinthe.Ecto, repo: ShitposterBackend.Repo

  @desc "User"
  object :user do
    field :id, :id
    field :email, :string
    field :name, :string
    field :is_bot, :boolean
    field :is_curator, :boolean
    field :is_authenticator, :boolean
  end

  @desc "User token"
  object :token do
    field :token, :string
  end

end
